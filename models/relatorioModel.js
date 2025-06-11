import pool from '../db.js';

const ReportModel = {
  getRelatorioGeral: async function() {
    const [rows] = await pool.query('SELECT * FROM relatorio');
    return rows;
  },

  getDesempenhoTurma: async function() {
    const [rows] = await pool.query('SELECT * FROM desempenho_turma');
    return rows;
  },

  getDesempenhoAluno: async function() {
    const [rows] = await pool.query('SELECT * FROM desempenho_aluno');
    return rows;
  },

  getDesempenhoAlunoPorRA: async function(raAluno) {
    const [rows] = await pool.query('SELECT * FROM desempenho_aluno WHERE raAluno = ?', [raAluno]);
    return rows;
  },

  getDesempenhoDisciplina: async function() {
    const [rows] = await pool.query('SELECT * FROM desempenho_disciplina');
    return rows;
  },

  getDesempenhoDisciplinaPorId: async function(idDisciplina) {
    const [rows] = await pool.query('SELECT * FROM desempenho_disciplina WHERE idDisciplina = ?', [idDisciplina]);
    return rows;
  },

  getDesempenhoProfessor: async function() {
    const [rows] = await pool.query('SELECT * FROM desempenho_professor');
    return rows;
  },

  getDesempenhoProva: async function() {
    const [rows] = await pool.query('SELECT * FROM desempenho_prova');
    return rows;
  },

  getDesempenhoProvaPorId: async function(idProva) {
    const [rows] = await pool.query('SELECT * FROM desempenho_prova WHERE idProva = ?', [idProva]);
    return rows;
  },

  getRankingDisciplina: async function() {
    const [rows] = await pool.query('SELECT * FROM ranking_disciplina');
    return rows;
  },

  getRankingPorDisciplinaId: async function(idDisciplina) {
    const [rows] = await pool.query('SELECT * FROM ranking_disciplina WHERE idDisciplina = ? ORDER BY posicaoRanking ASC', [idDisciplina]);
    return rows;
  }
};

// Equivalente ao export default no CommonJS

export default ReportModel;