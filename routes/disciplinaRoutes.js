import express from 'express';
import disciplinaController from '../controllers/disciplinaController.js'

const router = express.Router();

router.get('/professor/:rgProf', disciplinaController.listarDisciplinasDoProfessor);


export default router