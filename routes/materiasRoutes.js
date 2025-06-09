import express from 'express';
import registro from '../controllers/materiaController.js';


const router = express.Router();

// Lista dados da dsiciplina
router.get('/Materia/:nomeDisciplina', registro.listarDadosDaMateria)

// lista os dados do Professor
router.get('/registro/:rgProf', registro.listarDadosProfessor)

export default router;