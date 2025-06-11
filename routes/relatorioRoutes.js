import express from 'express';
import ReportController  from '../controllers/relatorioController.js';
import ReportModel from '../models/relatorioModel.js';

const router = express.Router();


router.get('/geral', ReportController.getRelatorioGeral);
router.get('/desempenho/turma', ReportController.getDesempenhoTurma);
router.get('/desempenho/aluno', ReportController.getDesempenhoAluno);
router.get('/desempenho/aluno/:ra', ReportController.getDesempenhoAluno);
router.get('/desempenho/disciplina', ReportController.getDesempenhoDisciplina);
router.get('/desempenho/disciplina/:idDisciplina', ReportController.getDesempenhoDisciplina);
router.get('/desempenho/professor', ReportController.getDesempenhoProfessor);
router.get('/desempenho/prova', ReportController.getDesempenhoProva);
router.get('/desempenho/prova/:idProva', ReportController.getDesempenhoProva);
router.get('/ranking/disciplina', ReportController.getRankingDisciplina);
router.get('/ranking/disciplina/:idDisciplina', ReportController.getRankingDisciplina);


export default router
