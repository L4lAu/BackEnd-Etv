//IMPORTS PADRÕES

import pool from '../db.js';  
import fs from 'fs';
import path from 'path';

// LISTA TODAS AS DISCIPLINAS DO ALUNO
export const listarDisciplinas = async (req, res) => {
  const { raAluno } = req.params;
  try {
    const [disciplinas] = await pool.execute(
      `SELECT d.idDisciplina, d.nomeDisciplina, d.tipo, d.imagem, d.descricao
       FROM disciplina d
       JOIN classe_disciplina cd ON d.idDisciplina = cd.idDisciplina
       JOIN aluno_classe ac ON cd.codClasse = ac.codClasse
       WHERE ac.raAluno = ?`,
      [raAluno]
    );
    res.json(disciplinas);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao listar disciplinas', error });
  }
};

// LISTA PROVAS DAQUELA DISCIPLINA DO ALUNO
export const listarProvas = async (req, res) => {
  const { raAluno, idDisciplina } = req.params;
  try {
    const [autorizado] = await pool.execute(
      `SELECT 1 FROM aluno_classe ac
       JOIN classe_disciplina cd ON ac.codClasse = cd.codClasse
       WHERE ac.raAluno = ? AND cd.idDisciplina = ?`,
      [raAluno, idDisciplina]
    );
    if (autorizado.length === 0) {
      return res.status(403).json({ mensagem: 'Você não tem acesso a essa disciplina.' });
    }

    const [provas] = await pool.execute(
      `SELECT p.idProva, p.numQuestoes, p.dataAplicacao
       FROM prova p
       WHERE p.idDisciplina = ?`,
      [idDisciplina]
    );
    res.json(provas);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao listar provas', error });
  }
};

// LISTA QUESTÕES DA PROVA SELECIONADA PELO ALUNO
export const questoesProva = async (req, res) => {
  const { idProva } = req.params;
  try {
    const [questoes] = await pool.execute(
      `SELECT idQuestao, enunciado, alternativaA, alternativaB, alternativaC, alternativaD, alternativaE
       FROM questao WHERE idProva = ?`,
      [idProva]
    );
    res.json(questoes);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao listar questões', error });
  }
};

// RESPONDE A PROVA COM ID SELECIONADO PELU ALUNO
export const responderProva = async (req, res) => {
  const { raAluno, idProva, respostas } = req.body;

  if (!raAluno || !idProva || !respostas || !Array.isArray(respostas)) {
    return res.status(400).json({ mensagem: 'Dados incompletos ou inválidos.' });
  }

  try {
    // 1. Verifica se o aluno já respondeu essa prova
    const [jaRespondeu] = await pool.execute(
      'SELECT * FROM provas_resolvidas WHERE raAluno = ? AND idProva = ?',
      [raAluno, idProva]
    );
    if (jaRespondeu.length > 0) {
      return res.status(400).json({ mensagem: 'Você já respondeu esta prova.' });
    }

    // 2. Busca disciplina da prova para validação
    const [[prova]] = await pool.execute(
      'SELECT idDisciplina FROM prova WHERE idProva = ?',
      [idProva]
    );
    if (!prova) {
      return res.status(404).json({ mensagem: 'Prova não encontrada.' });
    }

    // 3. Verifica se o aluno está autorizado (faz parte da turma da disciplina)
    const [autorizado] = await pool.execute(
      `SELECT 1 FROM aluno_classe ac
       JOIN classe_disciplina cd ON ac.codClasse = cd.codClasse
       WHERE ac.raAluno = ? AND cd.idDisciplina = ?`,
      [raAluno, prova.idDisciplina]
    );
    if (autorizado.length === 0) {
      return res.status(403).json({ mensagem: 'Você não tem acesso a essa prova.' });
    }

    // 4. Para cada resposta, verificar se está correta (buscando alternativa correta)
    let totalCorretas = 0;
    for (const resp of respostas) {
      // Valida alternativa marcada
      const alternativa = resp.alternativaMarcada.toUpperCase();
      if (!['A', 'B', 'C', 'D', 'E'].includes(alternativa)) {
        return res.status(400).json({ mensagem: `Alternativa inválida na questão ${resp.idQuestao}` });
      }

      const [[questao]] = await pool.execute(
        'SELECT alternativaCorreta FROM questao WHERE idQuestao = ?',
        [resp.idQuestao]
      );
      if (!questao) {
        return res.status(400).json({ mensagem: `Questão ${resp.idQuestao} inválida.` });
      }
      resp.correta = alternativa === questao.alternativaCorreta.toUpperCase();
      if (resp.correta) totalCorretas++;
    }

    // 5. Inserir em provas_resolvidas
    const [resultado] = await pool.execute(
      'INSERT INTO provas_resolvidas (raAluno, idProva, numQuestoesCorretas, dataResolucao) VALUES (?, ?, ?, ?)',
      [raAluno, idProva, totalCorretas, new Date()]
    );
    const idProvaResolv = resultado.insertId;

    // 6. Inserir respostas individuais na tabela resposta_aluno
    for (const resp of respostas) {
      await pool.execute(
        'INSERT INTO resposta_aluno (idProvaResolv, idQuestao, alternativaMarcada, correta) VALUES (?, ?, ?, ?)',
        [idProvaResolv, resp.idQuestao, resp.alternativaMarcada.toUpperCase(), resp.correta]
      );
    }

    // 7. Atualizar tabela desempenho (média e total provas respondidas)
    const [[desempenhoAtual]] = await pool.execute(
      'SELECT * FROM desempenho WHERE raAluno = ? AND idDisciplina = ?',
      [raAluno, prova.idDisciplina]
    );

    let mediaAtual = desempenhoAtual ? parseFloat(desempenhoAtual.mediaAcertos) : 0;
    let totalProvas = desempenhoAtual ? desempenhoAtual.totalProvasRespondidas : 0;

    const novaMedia = ((mediaAtual * totalProvas) + (totalCorretas / respostas.length)) / (totalProvas + 1);
    const novoTotalProvas = totalProvas + 1;

    if (desempenhoAtual) {
      await pool.execute(
        'UPDATE desempenho SET mediaAcertos = ?, totalProvasRespondidas = ? WHERE idDesempenho = ?',
        [novaMedia.toFixed(2), novoTotalProvas, desempenhoAtual.idDesempenho]
      );
    } else {
      await pool.execute(
        'INSERT INTO desempenho (raAluno, idDisciplina, mediaAcertos, totalProvasRespondidas) VALUES (?, ?, ?, ?)',
        [raAluno, prova.idDisciplina, novaMedia.toFixed(2), novoTotalProvas]
      );
    }

    res.json({ mensagem: 'Prova respondida com sucesso!', totalCorretas, totalQuestoes: respostas.length });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao responder prova', error: error.message });
  }
};

// LISTA ALUNOS DAQUELA MATÉRIA
export const listarAlunosDaMateria = async (req, res) => {
  const { idDisciplina } = req.params;
  try {
    const [alunos] = await pool.query(`
      SELECT a.raAluno, a.nome
      FROM alunos a
      JOIN aluno_classe ac ON a.raAluno = ac.raAluno
      JOIN classe_disciplina cd ON ac.codClasse = cd.codClasse
      WHERE cd.idDisciplina = ?
    `, [idDisciplina]);

    res.json(alunos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar alunos da matéria' });
  }
};

// LISTA POR DESEMPENHO DA MATÉRIA
export const desempenhoPorMateria = async (req, res) => {
  const { idDisciplina } = req.params;
  try {
    const [desempenho] = await pool.query(`
      SELECT d.raAluno, a.nome, d.mediaAcertos, d.totalProvasRespondidas
      FROM desempenho d
      JOIN alunos a ON d.raAluno = a.raAluno
      WHERE d.idDisciplina = ?
      ORDER BY d.mediaAcertos DESC
    `, [idDisciplina]);

    res.json(desempenho);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar desempenho' });
  }
};

export const gerarBoletim = async (req, res) => {
  const { raAluno } = req.params;

  try {
    const [disciplinas] = await pool.query(`
      SELECT cd.idDisciplina, d.nomeDisciplina
      FROM aluno_classe ac
      JOIN classe_disciplina cd ON ac.codClasse = cd.codClasse
      JOIN disciplina d ON cd.idDisciplina = d.idDisciplina
      WHERE ac.raAluno = ?
    `, [raAluno]);

    const [desempenhos] = await pool.query(`
      SELECT d.idDisciplina, d.mediaAcertos
      FROM desempenho d
      WHERE d.raAluno = ?
    `, [raAluno]);

    const disciplinasPendentes = [];
    const boletimData = [];

    disciplinas.forEach((disc) => {
      const info = desempenhos.find(d => d.idDisciplina === disc.idDisciplina);
      if (info) {
        boletimData.push({
          nome: disc.nomeDisciplina,
          media: info.mediaAcertos,
        });
      } else {
        disciplinasPendentes.push(disc.nomeDisciplina);
      }
    });

    const nomeArquivo = `boletim_${raAluno}_${new Date().toISOString().split('T')[0]}.json`;
    const diretorio = path.join('boletins');
    if (!fs.existsSync(diretorio)) {
      fs.mkdirSync(diretorio, { recursive: true });
    }

    const conteudo = {
      raAluno,
      boletimData,
      disciplinasPendentes,
    };

    fs.writeFileSync(path.join(diretorio, nomeArquivo), JSON.stringify(conteudo, null, 2), 'utf8');

    res.json({
      mensagem: 'Boletim gerado com sucesso!',
      nomeArquivo,
      boletimData,
      disciplinasPendentes
    });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao gerar boletim', error });
  }
};

export default {gerarBoletim, listarProvas, desempenhoPorMateria, listarAlunosDaMateria, responderProva, questoesProva, listarDisciplinas};