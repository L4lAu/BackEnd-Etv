// controllers/disciplinaController.js

const db = require('../db');

// LISTAR DISCIPLINAS POR PROFESSOR
exports.listarDisciplinasDoProfessor = async (req, res) => {
  const { rgProf } = req.params;

  if (!rgProf) {
    return res.status(400).json({ mensagem: 'O RG do professor é obrigatório.' });
  }

  try {
    // A query usa um JOIN para buscar o nome da disciplina a partir do RG do professor
    const [disciplinas] = await db.execute(
      `SELECT d.idDisciplina, d.nomeDisciplina 
       FROM disciplina d
       JOIN professores_disciplina pd ON d.idDisciplina = pd.idDisciplina
       WHERE pd.rgProf = ?
       ORDER BY d.nomeDisciplina`,
      [rgProf]
    );

    if (disciplinas.length === 0) {
      return res.status(404).json({ mensagem: 'Nenhuma disciplina encontrada para este professor.' });
    }

    res.json(disciplinas);
  } catch (err) {
    console.error('Erro ao listar disciplinas do professor:', err);
    res.status(500).json({ error: 'Erro interno ao buscar disciplinas: ' + err.message });
  }
};