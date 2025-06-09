//IMPORTS PADRÕES

import pool from '../db.js';

// CRIA QUESTÃO SE POSSIVÉL
const Questao = {
 
  async podeCriarQuestao(idProva) {
    // Conta quantas questões já existem para a prova
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM questao WHERE idProva = ?',
      [idProva]
    );
    const totalQuestoes = countRows[0].total;

    // Recupera o número máximo de questões permitido da prova
    const [provaRows] = await pool.query(
      'SELECT numQuestoes FROM prova WHERE idProva = ?',
      [idProva]
    );
    if (provaRows.length === 0) throw new Error('[MODEL Questao.podeCriarQuestao] Prova não encontrada');

    // Verifica se já atingiu o limite de questões
    if (totalQuestoes >= provaRows[0].numQuestoes) {
      return false;
    }

    return true;
  },

  // ASSOCIA QUESTÃO A PROVA 
  async criar(questao) {
    const {
      idProva,
      enunciado,
      alternativaA,
      alternativaB,
      alternativaC,
      alternativaD,
      alternativaE,
      alternativaCorreta
    } = questao;

    // Verifica se é possível criar a questão sem ultrapassar o limite
    const podeCriar = await this.podeCriarQuestao(idProva);
    if (!podeCriar) {
      throw new Error('[MODEL Questao.criar] Número máximo de questões para essa prova já foi atingido.');
    }

    // Insere a nova questão no banco de dados
    const sql = `
      INSERT INTO questao 
      (idProva, enunciado, alternativaA, alternativaB, alternativaC, alternativaD, alternativaE, alternativaCorreta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      idProva,
      enunciado,
      alternativaA,
      alternativaB,
      alternativaC,
      alternativaD,
      alternativaE,
      alternativaCorreta
    ]);

    console.log('[MODEL Questao.criar] Questão criada, ID:', result.insertId);
    return { idQuestao: result.insertId, ...questao };
  },

  //LISTA QUESTÕES DE UMA PROVA EXPECIFICA
  async listarPorProva(idProva) {
    const sql = `SELECT * FROM questao WHERE idProva = ?`;
    const [rows] = await pool.query(sql, [idProva]);
    console.log(`[MODEL Questao.listarPorProva] Questões encontradas: ${rows.length}`);
    return rows;
  },

  //BUSCA UMA QUESTÃO ESPECIFICA
  async buscarPorId(idQuestao) {
    const sql = `SELECT * FROM questao WHERE idQuestao = ?`;
    const [rows] = await pool.query(sql, [idQuestao]);
    console.log(`[MODEL Questao.buscarPorId] Questão encontrada:`, rows[0]);
    return rows[0];
  },

  //ATUALIZA OS DADOS DA QUESTÃO
  async atualizar(idQuestao, questao) {
    const {
      enunciado,
      alternativaA,
      alternativaB,
      alternativaC,
      alternativaD,
      alternativaE,
      alternativaCorreta
    } = questao;

    const sql = `
      UPDATE questao SET 
        enunciado = ?, 
        alternativaA = ?, 
        alternativaB = ?, 
        alternativaC = ?, 
        alternativaD = ?, 
        alternativaE = ?, 
        alternativaCorreta = ? 
      WHERE idQuestao = ?
    `;

    const [result] = await pool.query(sql, [
      enunciado,
      alternativaA,
      alternativaB,
      alternativaC,
      alternativaD,
      alternativaE,
      alternativaCorreta,
      idQuestao
    ]);

    console.log('[MODEL Questao.atualizar] Questão atualizada:', result.affectedRows > 0);
    return result.affectedRows > 0;
  },

  //DELETA QUESTÃO E SE 0 RESETA O AUTO_INCREMENT 
  async deletar(idQuestao) {
    const sql = `DELETE FROM questao WHERE idQuestao = ?`;
    const [result] = await pool.query(sql, [idQuestao]);

    // Se deletou com sucesso, verifica se a tabela está vazia
    if (result.affectedRows > 0) {
      const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM questao');
      if (countRows[0].total === 0) {
        await pool.query('ALTER TABLE questao AUTO_INCREMENT = 1');
        console.log('[MODEL Questao.deletar] Tabela esvaziada, AUTO_INCREMENT resetado.');
      }
      console.log('[MODEL Questao.deletar] Questão deletada com sucesso.');
      return true;
    }

    console.warn('[MODEL Questao.deletar] Nenhuma questão deletada.');
    return false;
  }
};

export default Questao;
