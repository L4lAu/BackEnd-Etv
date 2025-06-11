import express from 'express';
import { dadosAluno, dadosDesempenho, listarDadosDaMateria, listarDadosProfessor } from '../controllers/dadosController.js';


const router = express.Router();

// Lista dados da dsiciplina
router.get('/registroDisc/:nomeDisciplina', listarDadosDaMateria)

// lista os dados do Professor
router.get('/dadosProf/:rgProf', listarDadosProfessor)

// mostra o desempenho do aluno
router.get('/desempenho/:raAluno', dadosDesempenho)

// mostra os dados do aluno
router.get('/aluno/:raAluno', dadosAluno)

export default router;