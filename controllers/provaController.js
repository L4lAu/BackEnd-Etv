import pool from "../db.js";

// CRIA A PROVA
export const criarProva = async (req, res) => {
  try {
    const { rgProf, idDisciplina, nomeProva, questoes } = req.body;

    // Validação dos dados
    if (!rgProf || !idDisciplina || !nomeProva || !questoes || !Array.isArray(questoes)) {
      return res.status(400).json({ mensagem: 'Dados incompletos ou inválidos' });
    }

    const numQuestoes = questoes.length;
    const dataAplicacao = new Date();

    // Inicia uma transação

    try {
      // Inserir a prova
      const [provaResult] = await pool.execute(
        `INSERT INTO prova (rgProf, idDisciplina, nomeProva, numQuestoes, dataAplicacao)
         VALUES (?, ?, ?, ?, ?)`,
        [rgProf, idDisciplina, nomeProva, numQuestoes, dataAplicacao]
      );

      const idProva = provaResult.insertId;

      // Inserir cada questão
      for (const q of questoes) {
        const {
          enunciado,
          alternativaA,
          alternativaB,
          alternativaC,
          alternativaD,
          alternativaE,
          alternativaCorreta
        } = q;

        if (!enunciado || !alternativaCorreta) {
          await pool.rollback();
          return res.status(400).json({ mensagem: 'Questão incompleta detectada' });
        }

        await pool.execute(
          `INSERT INTO questao
          (idProva, enunciado, alternativaA, alternativaB, alternativaC, alternativaD, alternativaE, alternativaCorreta)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [idProva, enunciado, alternativaA, alternativaB, alternativaC, alternativaD, alternativaE, alternativaCorreta]
        );
      }

      await pool.commit();
      res.status(201).json({ mensagem: 'Prova criada com sucesso!', idProva });
    } catch (error) {
      await pool.rollback();
      throw error;
    } finally {
      pool.release();
    }
  } catch (error) {
    console.error('Erro ao criar prova:', error);
    res.status(500).json({ mensagem: 'Erro interno ao criar prova', erro: error.message });
  }
};

// EDITAR PROVA
export const editarProva = async (req, res) => {
  const idProva = req.params.id;
  const rgProf = req.body.rgProf; 

  if (!rgProf) {
    return res.status(400).json({ error: 'O rgProf é obrigatório no corpo da requisição para autorização.' });
  }

  try {
    const pool = await pool.getpool();
    try {
      // Verifica se a prova pertence ao professor
      const [provas] = await pool.execute(
        'SELECT * FROM prova WHERE idProva = ? AND rgProf = ?',
        [idProva, rgProf]
      );

      if (provas.length === 0) {
        return res.status(403).json({ error: 'Não autorizado ou prova não encontrada.' });
      }

      // Atualiza a prova
      const [result] = await pool.execute(
        'UPDATE prova SET ? WHERE idProva = ?',
        [req.body, idProva]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Nenhum dado foi alterado.' });
      }

      res.json({ message: 'Prova atualizada com sucesso' });
    } finally {
      pool.release();
    }
  } catch (err) {
    console.error('Erro ao editar prova:', err);
    res.status(500).json({ error: 'Erro interno ao editar a prova: ' + err.message });
  }
};

// EXCLUIR PROVA
export const excluirProva = async (req, res) => {
  const { id } = req.params;
  const { rgProf } = req.body;

  if (!rgProf) {
    return res.status(400).json({ error: 'O rgProf é obrigatório no corpo da requisição para autorização.' });
  }

  try {
    const pool = await pool.getpool();
    await pool.beginTransaction();

    try {
      // Primeiro exclui as questões associadas
      await pool.execute(
        'DELETE FROM questao WHERE idProva = ?',
        [id]
      );

      // Depois exclui a prova
      const [result] = await pool.execute(
        'DELETE FROM prova WHERE idProva = ? AND rgProf = ?',
        [id, rgProf]
      );

      if (result.affectedRows === 0) {
        await pool.rollback();
        return res.status(403).json({ error: 'Não autorizado ou prova não encontrada.' });
      }

      await pool.commit();
      res.json({ message: 'Prova excluída com sucesso' });
    } catch (error) {
      await pool.rollback();
      throw error;
    } finally {
      pool.release();
    }
  } catch (err) {
    console.error('Erro ao excluir prova:', err);
    res.status(500).json({ error: 'Erro interno ao excluir a prova: ' + err.message });
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