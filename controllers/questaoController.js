//IMPORTS PADRÕES

import Questao from '../models/questaoModel.js';
import pool from '../db.js';

//CRIA AS QUESTÕES DA PROVA
const questaoController = {
  // Criar questão, valida professor dono da prova
  criar: async (req, res) => {
    try {
      const { rgProf, idProva } = req.params;
      const {
        enunciado,
        alternativaA,
        alternativaB,
        alternativaC,
        alternativaD,
        alternativaE,
        alternativaCorreta
      } = req.body;

      // Verificar se a prova pertence ao professor
      const [provas] = await pool.query(
        'SELECT * FROM prova WHERE idProva = ? AND rgProf = ?',
        [idProva, rgProf]
      );

      if (provas.length === 0) {
        return res.status(403).json({ error: 'Prova não encontrada ou não pertence ao professor' });
      }

      // Criar questão vinculada à prova
      const novaQuestao = await Questao.criar({
        idProva,
        enunciado,
        alternativaA,
        alternativaB,
        alternativaC,
        alternativaD,
        alternativaE,
        alternativaCorreta
      });

      res.status(201).json(novaQuestao);
    } catch (error) {
      if (error.message.includes('Número máximo')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // LISTA QUESTÕES DA PROVA
  listarPorProva: async (req, res) => {
    try {
      const idProva = req.params.idProva;
      const questoes = await Questao.listarPorProva(idProva);
      res.json(questoes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // BUSCA QUESTÕES POR ID
  buscarPorId: async (req, res) => {
    try {
      const idQuestao = req.params.idQuestao;
      const questao = await Questao.buscarPorId(idQuestao);
      if (!questao) {
        return res.status(404).json({ error: 'Questão não encontrada' });
      }
      res.json(questao);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ATUALIZA AS QUESTÕES DO PROFESSOR SE NECESSARIO
  atualizar: async (req, res) => {
    try {
      const { rgProf, idQuestao } = req.params;
      const {
        enunciado,
        alternativaA,
        alternativaB,
        alternativaC,
        alternativaD,
        alternativaE,
        alternativaCorreta
      } = req.body;

      // Buscar questão e prova para validar dono
      const questao = await Questao.buscarPorId(idQuestao);
      if (!questao) {
        return res.status(404).json({ error: 'Questão não encontrada' });
      }

      // Verificar se prova pertence ao professor
      const [provas] = await pool.query(
        'SELECT * FROM prova WHERE idProva = ? AND rgProf = ?',
        [questao.idProva, rgProf]
      );

      if (provas.length === 0) {
        return res.status(403).json({ error: 'Você não tem permissão para editar esta questão' });
      }

      // Atualizar questão
      const atualizado = await Questao.atualizar(idQuestao, {
        enunciado,
        alternativaA,
        alternativaB,
        alternativaC,
        alternativaD,
        alternativaE,
        alternativaCorreta
      });

      if (!atualizado) {
        return res.status(500).json({ error: 'Erro ao atualizar questão' });
      }

      res.json({ message: 'Questão atualizada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // DELETA A QUESTÃO (valida se questão pertence à prova do professor)
  deletar: async (req, res) => {
    try {
      const { rgProf, idQuestao } = req.params;

      const questao = await Questao.buscarPorId(idQuestao);
      if (!questao) {
        return res.status(404).json({ error: 'Questão não encontrada' });
      }

      // Verificar se prova pertence ao professor
      const [provas] = await pool.query(
        'SELECT * FROM prova WHERE idProva = ? AND rgProf = ?',
        [questao.idProva, rgProf]
      );

      if (provas.length === 0) {
        return res.status(403).json({ error: 'Você não tem permissão para deletar esta questão' });
      }

      const deletado = await Questao.deletar(idQuestao);
      if (!deletado) {
        return res.status(500).json({ error: 'Erro ao deletar questão' });
      }

      res.json({ message: 'Questão deletada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default questaoController;
