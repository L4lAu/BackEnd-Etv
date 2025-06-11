import pool from "../db.js";

// CRIA A PROVA
export const criarProva = async (req, res) => {

  let connection;
  try {
    const { rgProf, idDisciplina, nomeProva, questoes } = req.body;

    // Validação simples dos dados recebidos.
    if (!rgProf || !idDisciplina || !nomeProva || !questoes || !Array.isArray(questoes)) {
      return res.status(400).json({ mensagem: 'Dados incompletos ou inválidos.' });
    }
    connection = await pool.getConnection();

    await connection.beginTransaction();

    // Inserir os dados da prova.
    const [provaResult] = await connection.execute(
      `INSERT INTO prova (rgProf, idDisciplina, nomeProva, numQuestoes, dataAplicacao)
         VALUES (?, ?, ?, ?, ?)`,
      [rgProf, idDisciplina, nomeProva, questoes.length, new Date()]
    );
    const idProva = provaResult.insertId;

    for (const q of questoes) {
      if (!q.enunciado || !q.alternativaCorreta) {
        throw new Error('Questão incompleta detectada. A transação será revertida.');
      }
      await connection.execute(
        `INSERT INTO questao
          (idProva, enunciado, alternativaA, alternativaB, alternativaC, alternativaD, alternativaE, alternativaCorreta)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [idProva, q.enunciado, q.alternativaA, q.alternativaB, q.alternativaC, q.alternativaD, q.alternativaE, q.alternativaCorreta]
      );
    }
    await connection.commit();
    res.status(201).json({ mensagem: 'Prova criada com sucesso!', idProva });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao criar prova:', error);
    res.status(500).json({ mensagem: 'Erro interno ao criar prova.', erro: error.message });
  } finally {

    if (connection) connection.release();
  }
};

// EDITAR PROVA
export const editarProva = async (req, res) => {
  const { id } = req.params;
  const { rgProf, ...dadosParaAtualizar } = req.body;

  if (!rgProf) {
    return res.status(400).json({ error: 'O RG do professor é obrigatório para autorização.' });
  }


  delete dadosParaAtualizar.rgProf;

  try {

    const [result] = await pool.execute(
      'UPDATE prova SET ? WHERE idProva = ? AND rgProf = ?',
      [dadosParaAtualizar, id, rgProf]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Prova não encontrada ou você não tem permissão para editar.' });
    }

    res.json({ message: 'Prova atualizada com sucesso.' });
  } catch (err) {
    console.error('Erro ao editar prova:', err);
    res.status(500).json({ error: 'Erro interno ao editar a prova.' });
  }
};


// EXCLUIR PROVA
export const excluirProva = async (req, res) => {
  const { id } = req.params;
  const { rgProf } = req.body;

  if (!rgProf) {
    return res.status(400).json({ error: 'O RG do professor é obrigatório para autorização.' });
  }


  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();


    const [provas] = await connection.execute('SELECT idProva FROM prova WHERE idProva = ? AND rgProf = ?', [id, rgProf]);
    if (provas.length === 0) {
      throw new Error('Não autorizado ou prova não encontrada.');
    }


    await connection.execute('DELETE FROM questao WHERE idProva = ?', [id]);

    await connection.execute('DELETE FROM prova WHERE idProva = ?', [id]);

    await connection.commit();
    res.json({ message: 'Prova e suas questões foram excluídas com sucesso.' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao excluir prova:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao excluir a prova.' });
  } finally {
    if (connection) connection.release();
  }
};

// LISTAR PROVAS POR PROFESSOR
export const listarProvasPorProfessor = async (req, res) => {
  const rgProf = req.params.rgProf;

  try {
    const [provas] = await pool.execute(
      'SELECT * FROM prova WHERE rgProf = ?',
      [rgProf]
    );
    res.json(provas);
  } catch (err) {
    console.error('Erro ao listar provas por professor:', err);
    res.status(500).json({ error: 'Erro interno ao listar provas por professor: ' + err.message });
  }
};

// LISTAR PROVAS POR MATÉRIA
export const listarProvasPorMateria = async (req, res) => {
  const idDisciplina = req.params.idDisciplina;

  try {
    const [provas] = await pool.execute(
      'SELECT * FROM prova WHERE idDisciplina = ?',
      [idDisciplina]
    );
    res.json(provas);
  } catch (err) {
    console.error('Erro ao listar provas por matéria:', err);
    res.status(500).json({ error: 'Erro interno ao listar provas por matéria: ' + err.message });
  }
};

// LISTAR PROVAS POR MATÉRIA E PROFESSOR
export const listarPorMateriaEProfessor = async (req, res) => {
  const { idDisciplina, rgProf } = req.params;

  try {
    const [provas] = await pool.execute(
      'SELECT * FROM prova WHERE idDisciplina = ? AND rgProf = ?',
      [idDisciplina, rgProf]
    );
    res.json(provas);
  } catch (err) {
    console.error('Erro ao listar provas por matéria e professor:', err);
    res.status(500).json({ error: 'Erro interno ao listar provas: ' + err.message });
  }
};

export default (listarPorMateriaEProfessor, criarProva, listarProvasPorMateria, excluirProva, editarProva)