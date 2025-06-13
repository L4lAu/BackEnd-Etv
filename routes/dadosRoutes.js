import express from 'express';
import { dadosAluno, dadosDesempenho, listarDadosDaMateria, listarDadosDaMateriaPeloId, listarDadosProfessor } from '../controllers/dadosController.js';


const router = express.Router();

// Lista dados da dsiciplina
router.get('/registroDisc/:nomeDisciplina', listarDadosDaMateria)

// lista dados da discipliana pelo id 
router.get('/registroMateria/:idDisciplina', listarDadosDaMateriaPeloId)

// lista os dados do Professor
router.get('/dadosProf/:rgProf', listarDadosProfessor)

// mostra o desempenho do aluno
router.get('/desempenho/:raAluno', dadosDesempenho)

// mostra os dados do aluno
router.get('/aluno/:raAluno', dadosAluno)

export default router;