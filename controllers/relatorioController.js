// SIM TODA MINHA PARTE ESTÀ EM REQUIRE, QND ME DEI CONTA ERA TARDE DEMAIS PARA TROCAR

// tem todas as views ai o nome ja explica oq fazem
import ReportModel from '../models/relatorioModel.js';

class ReportController {
  static async getRelatorioGeral(req, res) {
    try {
      const data = await ReportModel.getRelatorioGeral();
      res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar relatório geral:", error);
      res.status(500).json({ message: 'Erro interno ao buscar relatório geral', error: error.message });
    }
  }

  static async getDesempenhoTurma(req, res) {
    try {
      const data = await ReportModel.getDesempenhoTurma();
      res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar desempenho da turma:", error);
      res.status(500).json({ message: 'Erro interno ao buscar desempenho da turma', error: error.message });
    }
  }

  static async getDesempenhoAluno(req, res) {
    try {
     
      const { ra } = req.params; 
      let data;
      if (ra) {
        data = await ReportModel.getDesempenhoAlunoPorRA(ra);
      } else {
        data = await ReportModel.getDesempenhoAluno();
      }
      if (data.length === 0 && ra) {
        return res.status(404).json({ message: `Desempenho não encontrado para o RA ${ra}` });
      }
      res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar desempenho do aluno:", error);
      res.status(500).json({ message: 'Erro interno ao buscar desempenho do aluno', error: error.message });
    }
  }

  static async getDesempenhoDisciplina(req, res) {
    try {
      const { idDisciplina } = req.params;
      let data;
      if (idDisciplina) {
          data = await ReportModel.getDesempenhoDisciplinaPorId(idDisciplina);
      } else {
          data = await ReportModel.getDesempenhoDisciplina();
      }
      if (data.length === 0 && idDisciplina) {
        return res.status(404).json({ message: `Desempenho não encontrado para a disciplina ID ${idDisciplina}` });
      }
      res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar desempenho da disciplina:", error);
      res.status(500).json({ message: 'Erro interno ao buscar desempenho da disciplina', error: error.message });
    }
  }

  static async getDesempenhoProfessor(req, res) {
    try {
      const data = await ReportModel.getDesempenhoProfessor();
      res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar desempenho do professor:", error);
      res.status(500).json({ message: 'Erro interno ao buscar desempenho do professor', error: error.message });
    }
  }

  static async getDesempenhoProva(req, res) {
    try {
      const { idProva } = req.params;
      let data;
      if (idProva) {
          data = await ReportModel.getDesempenhoProvaPorId(idProva);
      } else {
          data = await ReportModel.getDesempenhoProva();
      }
      if (data.length === 0 && idProva) {
        return res.status(404).json({ message: `Desempenho não encontrado para a prova ID ${idProva}` });
      }
      res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar desempenho da prova:", error);
      res.status(500).json({ message: 'Erro interno ao buscar desempenho da prova', error: error.message });
    }
  }

  static async getRankingDisciplina(req, res) {
    try {
      const { idDisciplina } = req.params;
      let data;
      if (idDisciplina) {
          data = await ReportModel.getRankingPorDisciplinaId(idDisciplina);
      } else {
          data = await ReportModel.getRankingDisciplina(); 
      }
      if (data.length === 0 && idDisciplina) {
        return res.status(404).json({ message: `Ranking não encontrado para a disciplina ID ${idDisciplina}` });
      }
      res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar ranking da disciplina:", error);
      res.status(500).json({ message: 'Erro interno ao buscar ranking da disciplina', error: error.message });
    }
  }
}

export default ReportController;