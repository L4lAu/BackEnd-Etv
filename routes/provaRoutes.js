// Importa o Express para criação de rotas
import express from 'express';

// Importa o controller que contém a lógica de manipulação das provas
import { criarProva, editarProva, excluirProva, listarPorMateriaEProfessor, listarProvasPorMateria, listarProvasPorProfessor } from '../controllers/provaController.js'

// Cria o objeto de roteador do Express
const router = express.Router();

//Lista todas as provas de uma disciplina específicas de um professor específico.
router.get('/disciplina/:idDisciplina/professor/:rgProf', listarPorMateriaEProfessor);

//Cria uma nova prova.
router.post('/', criarProva);

//Atualiza os dados de uma prova específica.
router.put('/:id', editarProva);

//Exclui uma prova pelo seu ID.
router.delete('/:id', excluirProva);

//Lista todas as provas cadastradas por um determinado professor.
router.get('/professor/:rgProf', listarProvasPorProfessor);

//Lista todas as provas de uma disciplina, independentemente do professor.
router.get('/disciplina/:idDisciplina', listarProvasPorMateria);



export default router;
