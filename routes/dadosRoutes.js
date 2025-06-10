import express from 'express';
import {listarDadosDaMateria, listarDadosProfessor} from '../controllers/dadosController.js';


const router = express.Router();

// Lista dados da dsiciplina
router.get('/registroDisc/:nomeDisciplina', listarDadosDaMateria)

// lista os dados do Professor
router.get('/dadosProf/:rgProf', listarDadosProfessor)

export default router;