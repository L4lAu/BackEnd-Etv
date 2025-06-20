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
    // Consulta 1: Obter os dados da prova (incluindo o nome)
    const [provaRows] = await pool.execute(
      `SELECT idProva, nomeProva, numQuestoes, dataAplicacao 
       FROM prova 
       WHERE idProva = ?`,
      [idProva]
    );

    // Se a prova não existir, retorne um erro 404
    if (provaRows.length === 0) {
      return res.status(404).json({ mensagem: 'Prova não encontrada.' });
    }

    // Consulta 2: Obter as questões associadas a essa prova
    const [questoesRows] = await pool.execute(
      `SELECT idQuestao, enunciado, alternativaA, alternativaB, alternativaC, alternativaD, alternativaE
       FROM questao 
       WHERE idProva = ?`,
      [idProva]
    );

    // Monta o resultado
    const resultado = {
      ...provaRows[0],
      questoes: questoesRows
    };

    res.json(resultado);

  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao listar questões', error });
  }


};

// RESPONDE A PROVA COM ID SELECIONADO PELU ALUNO
export const responderProva = async (req, res) => {
  console.log('Backend recebeu em /aluno/responder:', req.body);

  if (!req.body.raAluno || !req.body.idProva || !req.body.respostas || !Array.isArray(req.body.respostas)) {
    return res.status(400).json({ mensagem: 'Dados da requisição incompletos ou em formato inválido.' });
  }

  const raAluno = req.body.raAluno;
  const idProva = parseInt(req.body.idProva, 10);
  const { respostas } = req.body;

  if (isNaN(idProva)) {
    return res.status(400).json({ mensagem: 'O ID da prova é inválido.' });
  }

  try {
    const [jaRespondeuRows] = await pool.execute('SELECT 1 FROM provas_resolvidas WHERE raAluno = ? AND idProva = ?', [raAluno, idProva]);
    if (jaRespondeuRows.length > 0) {
      return res.status(409).json({ mensagem: 'Você já respondeu esta prova.' });
    }

    const [provaRows] = await pool.execute('SELECT idDisciplina FROM prova WHERE idProva = ?', [idProva]);
    if (provaRows.length === 0) {
      return res.status(404).json({ mensagem: 'Prova não encontrada.' });
    }
    const prova = provaRows[0];

    const [autorizadoRows] = await pool.execute(
      `SELECT 1 FROM aluno_classe ac JOIN classe_disciplina cd ON ac.codClasse = cd.codClasse WHERE ac.raAluno = ? AND cd.idDisciplina = ?`,
      [raAluno, prova.idDisciplina]
    );
    if (autorizadoRows.length === 0) {
      return res.status(403).json({ mensagem: 'Você não tem permissão para responder a esta prova.' });
    }

    let totalCorretas = 0;
    for (const resp of respostas) {
      const idQuestao = parseInt(resp.idQuestao, 10);
      if (isNaN(idQuestao)) continue;

      const [questaoRows] = await pool.execute('SELECT alternativaCorreta FROM questao WHERE idQuestao = ?', [idQuestao]);
      if (questaoRows.length === 0) {
        console.warn(`Aviso: Questão com ID ${idQuestao} enviada pelo frontend não foi encontrada no banco.`);
        continue;
      }
      const questao = questaoRows[0];

      resp.correta = false;
      if (resp.alternativaMarcada && questao.alternativaCorreta) {
        if (resp.alternativaMarcada.toUpperCase() === questao.alternativaCorreta.toUpperCase()) {
          resp.correta = true;
          totalCorretas++;
        }
      }
    }

    const [resultadoInsert] = await pool.execute(
      'INSERT INTO provas_resolvidas (raAluno, idProva, numQuestoesCorretas, dataResolucao) VALUES (?, ?, ?, ?)',
      [raAluno, idProva, totalCorretas, new Date()]
    );
    const idProvaResolv = resultadoInsert.insertId;

    for (const resp of respostas) {
      const idQuestao = parseInt(resp.idQuestao, 10);
      const alternativaFinal = resp.alternativaMarcada ? resp.alternativaMarcada.toUpperCase() : null;
      await pool.execute(
        'INSERT INTO resposta_aluno (idProvaResolv, idQuestao, alternativaMarcada, correta) VALUES (?, ?, ?, ?)',
        [idProvaResolv, idQuestao, alternativaFinal, resp.correta]
      );
    }

    if (respostas.length > 0) {
      const [desempenhoRows] = await pool.execute('SELECT * FROM desempenho WHERE raAluno = ? AND idDisciplina = ?', [raAluno, prova.idDisciplina]);
      const desempenhoAtual = desempenhoRows.length > 0 ? desempenhoRows[0] : null;
      const acertoNestaProva = (totalCorretas / respostas.length) * 100;

      if (desempenhoAtual) {
        const mediaAnterior = parseFloat(desempenhoAtual.mediaAcertos);
        const totalProvasAnteriores = desempenhoAtual.totalProvasRespondidas;
        const novoTotalProvas = totalProvasAnteriores + 1;
        const novaMediaGeral = ((mediaAnterior * totalProvasAnteriores) + acertoNestaProva) / novoTotalProvas;
        await pool.execute('UPDATE desempenho SET mediaAcertos = ?, totalProvasRespondidas = ? WHERE idDesempenho = ?', [novaMediaGeral.toFixed(2), novoTotalProvas, desempenhoAtual.idDesempenho]);
      } else {
        await pool.execute('INSERT INTO desempenho (raAluno, idDisciplina, mediaAcertos, totalProvasRespondidas) VALUES (?, ?, ?, ?)', [raAluno, prova.idDisciplina, acertoNestaProva.toFixed(2), 1]);
      }
    }

    res.status(201).json({ mensagem: 'Prova respondida com sucesso!', totalCorretas, totalQuestoes: respostas.length });

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

export default { gerarBoletim, listarProvas, desempenhoPorMateria, listarAlunosDaMateria, responderProva, questoesProva, listarDisciplinas };