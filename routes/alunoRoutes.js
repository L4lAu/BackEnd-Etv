import express from 'express';
import controller from '../controllers/alunoController.js';

const router = express.Router();

// Lista todas as disciplinas em que o aluno (identificado pelo RA) está matriculado
router.get('/disciplinas/:raAluno', controller.listarDisciplinas);

// Lista todas as provas disponíveis para o aluno em uma disciplina específica
router.get('/provas/:raAluno/:idDisciplina', controller.listarProvas);

// Lista todas as questões pertencentes a uma prova específica
router.get('/questoes/:idProva', controller.questoesProva);

// Permite que o aluno envie as respostas de uma prova (corrige e salva o desempenho)
router.post('/responder', controller.responderProva);

// Lista todos os alunos matriculados em uma disciplina específica
router.get('/materia/:idDisciplina/alunos', controller.listarAlunosDaMateria);

// Lista o desempenho de todos os alunos da disciplina, com notas e aprovação
router.get('/materia/:idDisciplina/desempenho', controller.desempenhoPorMateria);

// Gera o boletim do aluno, com as notas e médias em cada disciplina
router.get('/boletim/:raAluno', controller.gerarBoletim);

export default router;
