
import express from 'express';
import questaoController from '../controllers/questaoController.js';

const router = express.Router();

// Criar questão para uma prova específica de um professor (valida dono)
router.post('/professores/:rgProf/provas/:idProva/questoes', questaoController.criar);

// Listar questões de uma prova (sem validação extra, só leitura)
router.get('/provas/:idProva/questoes', questaoController.listarPorProva);

// Buscar questão por id (sem validação extra)
router.get('/questoes/:idQuestao', questaoController.buscarPorId);

// Atualizar questão - só se questão pertence a prova do professor (valida dono)
router.put('/professores/:rgProf/questoes/:idQuestao', questaoController.atualizar);

// Deletar questão - só se questão pertence a prova do professor (valida dono)
router.delete('/professores/:rgProf/questoes/:idQuestao', questaoController.deletar);

export default router;
