import express from 'express';
import {listarDadosDaMateria, listarDadosProfessor} from '../controllers/materiaController.js';


const router = express.Router();

// Lista dados da dsiciplina
router.get('/Materia/:nomeDisciplina', listarDadosDaMateria)

// lista os dados do Professor
router.get('/registro/:rgProf', listarDadosProfessor)

export default router;