// IMPORTS PADRÕES

import db from '../db.js';

// FUNÇÕES PARA ACESSO A DADOS RELACIONADOS A ALUNOS E PROVAS
export default {
  
  // CÓDIGO PARA EXIBIR A DISCIPLINA
  // Retorna todas as disciplinas que o aluno está matriculado, com base no RA
  async getDisciplinasDoAluno(raAluno) {
    const [rows] = await db.query(`
      SELECT DISTINCT d.idDisciplina, d.nomeDisciplina
      FROM disciplina d
      JOIN classe_disciplina cd ON cd.idDisciplina = d.idDisciplina
      JOIN aluno_classe ac ON ac.codClasse = cd.codClasse
      WHERE ac.raAluno = ?
    `, [raAluno]);
    return rows;
  },

  // CÓDIGO PARA EXIBIR AS PROVAS
  // Retorna as provas disponíveis para um aluno de uma disciplina específica, 
  // desde que ele ainda não tenha resolvido a prova
  async getProvasDisponiveis(raAluno, idDisciplina) {
    const [rows] = await db.query(`
      SELECT p.idProva, p.dataAplicacao
      FROM prova p
      JOIN classe_disciplina cd ON cd.idDisciplina = p.idDisciplina
      JOIN aluno_classe ac ON ac.codClasse = cd.codClasse
      LEFT JOIN provas_resolvidas pr ON pr.idProva = p.idProva AND pr.raAluno = ?
      WHERE cd.idDisciplina = ? AND ac.raAluno = ? AND pr.idProva IS NULL
    `, [raAluno, idDisciplina, raAluno]);
    return rows;
  },

  // CÓDIGO PARA EXIBIR AS QUESTÕES
  async getQuestoesDaProva(idProva) {
    const [rows] = await db.query(`
      SELECT idQuestao, enunciado, alternativaA, alternativaB, alternativaC, alternativaD, alternativaE
      FROM questao
      WHERE idProva = ?
    `, [idProva]);
    return rows;
  },

  // Retorna o gabarito (alternativas corretas) de uma prova
  async getGabaritoDaProva(idProva) {
    const [rows] = await db.query(`
      SELECT idQuestao, alternativaCorreta
      FROM questao
      WHERE idProva = ?
    `, [idProva]);
    return rows;
  },

  // CÓDIGO PARA SALVAR RESPOSTAS DO ALUNO
  // Registra as respostas do aluno, corrige automaticamente com base no gabarito,
  // grava acertos, respostas e atualiza média de desempenho
  async salvarRespostas({ raAluno, idProva, respostas }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Obter gabarito da prova
      const gabaritoMap = {};
      const [gabarito] = await conn.query(
        'SELECT idQuestao, alternativaCorreta FROM questao WHERE idProva = ?',
        [idProva]
      );
      gabarito.forEach(q => gabaritoMap[q.idQuestao] = q.alternativaCorreta);

      let corretas = 0;

      // Registrar prova resolvida com número inicial de acertos = 0
      const [result] = await conn.query(`
        INSERT INTO provas_resolvidas (raAluno, idProva, numQuestoesCorretas, dataResolucao)
        VALUES (?, ?, 0, CURDATE())
      `, [raAluno, idProva]);
      const idProvaResolv = result.insertId;

      // Salvar cada resposta e verificar se está correta
      for (const resposta of respostas) {
        const correta = gabaritoMap[resposta.idQuestao] === resposta.alternativa;
        if (correta) corretas++;

        await conn.query(`
          INSERT INTO resposta_aluno (idProvaResolv, idQuestao, alternativaMarcada, correta)
          VALUES (?, ?, ?, ?)
        `, [idProvaResolv, resposta.idQuestao, resposta.alternativa, correta]);
      }

      // Atualiza o total de acertos da prova resolvida
      await conn.query(`
        UPDATE provas_resolvidas
        SET numQuestoesCorretas = ?
        WHERE idProvaResolv = ?
      `, [corretas, idProvaResolv]);

      // Verifica se já existe registro de desempenho para esse aluno na disciplina
      const [verifica] = await conn.query(`
        SELECT * FROM desempenho WHERE raAluno = ? AND idDisciplina = (
          SELECT idDisciplina FROM prova WHERE idProva = ?
        )
      `, [raAluno, idProva]);

      if (verifica.length > 0) {
        // Se já existe, atualiza média ponderada e incrementa o total de provas respondidas
        await conn.query(`
          UPDATE desempenho
          SET mediaAcertos = (mediaAcertos * totalProvasRespondidas + ?) / (totalProvasRespondidas + 1),
              totalProvasRespondidas = totalProvasRespondidas + 1
          WHERE raAluno = ? AND idDisciplina = (
            SELECT idDisciplina FROM prova WHERE idProva = ?
          )
        `, [corretas, raAluno, idProva]);
      } else {
        // Caso contrário, cria um novo registro de desempenho
        await conn.query(`
          INSERT INTO desempenho (raAluno, idDisciplina, mediaAcertos, totalProvasRespondidas)
          VALUES (?, (SELECT idDisciplina FROM prova WHERE idProva = ?), ?, 1)
        `, [raAluno, idProva, corretas]);
      }

      await conn.commit();
      return { acertos: corretas };
    } catch (err) {
      // Em caso de erro, desfaz as alterações
      await conn.rollback();
      throw err;
    } finally {
      // Libera a conexão com o banco
      conn.release();
    }
  }
};
