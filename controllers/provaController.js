//IMPORTS PADRÕES

import ProvaModel from '../models/provaModel.js';
import db from '../db.js';

//CRIA A PROVA //
export const criarProva = async (req, res) => {
  const { rgProf, idDisciplina, numQuestoes, dataAplicacao } = req.body;
  console.log('[CONTROLLER criarProva] Requisição recebida. Body:', req.body);

  if (!rgProf || !idDisciplina || numQuestoes === undefined || !dataAplicacao) {
    console.log('[CONTROLLER criarProva] Campos obrigatórios faltando.');
    return res.status(400).json({ error: 'Campos obrigatórios (rgProf, idDisciplina, numQuestoes, dataAplicacao) devem ser fornecidos.' });
  }

  try {
    // Verifica se professor ministra essa disciplina
    const sqlVerifica = 'SELECT * FROM professores_disciplina WHERE rgProf = ? AND idDisciplina = ?';
    console.log('[CONTROLLER criarProva] Verificando autorização do professor...');
    const [profDisciplinaRows] = await db.query(sqlVerifica, [rgProf, idDisciplina]);
    console.log(`[CONTROLLER criarProva] Resultado da verificação: ${profDisciplinaRows.length} linha(s) encontrada(s).`);

    if (profDisciplinaRows.length === 0) {
      console.log('[CONTROLLER criarProva] Professor não autorizado para esta disciplina.');
      return res.status(403).json({ error: 'Professor não autorizado para essa disciplina' });
    }

    // Cria a prova 
    const sqlInserir = 'INSERT INTO prova (rgProf, idDisciplina, numQuestoes, dataAplicacao) VALUES (?, ?, ?, ?)';
    console.log('[CONTROLLER criarProva] Inserindo prova no banco de dados...');
    const [result] = await db.query(sqlInserir, [rgProf, idDisciplina, numQuestoes, dataAplicacao]);
    console.log('[CONTROLLER criarProva] Prova criada com sucesso. ID:', result.insertId);
    res.status(201).json({ message: 'Prova criada com sucesso!', idProva: result.insertId });
  } catch (err) {
    console.error('[CONTROLLER criarProva] Erro no processo:', err.message, err.stack);
    res.status(500).json({ error: 'Erro interno ao criar a prova: ' + err.message });
  }
};

//AUTOEXPLICATIVO//
export const editarProva = async (req, res) => {
  const idProva = req.params.id;
  const rgProf = req.body.rgProf; 
  console.log(`[CONTROLLER editarProva] ID Prova: ${idProva}, RG Prof (body): ${rgProf}, Dados para atualizar:`, req.body);

  if (!rgProf) {
     console.log('[CONTROLLER editarProva] RG do professor (rgProf) não fornecido no corpo da requisição.');
     return res.status(400).json({ error: 'O rgProf é obrigatório no corpo da requisição para autorização.' });
  }

  try {
    const result = await ProvaModel.atualizar(idProva, rgProf, req.body);
    if (result.affectedRows === 0) {
      console.log('[CONTROLLER editarProva] Nenhuma prova encontrada para o ID e RG fornecidos ou dados são os mesmos.');
      return res.status(403).json({ error: 'Não autorizado, prova não encontrada para o ID e RG fornecidos, ou nenhum dado foi alterado.' });
    }
    console.log('[CONTROLLER editarProva] Prova atualizada com sucesso.');
    res.json({ message: 'Prova atualizada com sucesso' });
  } catch (err) {
    console.error('[CONTROLLER editarProva] Erro:', err.message, err.stack);
    res.status(500).json({ error: 'Erro interno ao editar a prova: ' + err.message });
  }
};

//EXCLUI APENAS SE O PROFESSOR TIVER O ID CORRESPONDENTE//
export const excluirProva = async (req, res) => {
  const { id } = req.params;
  const { rgProf } = req.body; 
  console.log(`[CONTROLLER excluirProva] ID Prova: ${id}, RG Prof (body): ${rgProf}`);

  if (!rgProf) {
     console.log('[CONTROLLER excluirProva] RG do professor (rgProf) não fornecido no corpo da requisição.');
     return res.status(400).json({ error: 'O rgProf é obrigatório no corpo da requisição para autorização.' });
  }

  try {
    const result = await ProvaModel.deletar(id, rgProf);
    if (result.affectedRows === 0) {
      console.log('[CONTROLLER excluirProva] Nenhuma prova encontrada para o ID e RG fornecidos.');
      return res.status(403).json({ error: 'Não autorizado ou prova não encontrada para o ID e RG fornecidos.' });
    }
    console.log('[CONTROLLER excluirProva] Prova excluída com sucesso.');
    res.json({ message: 'Prova excluída com sucesso' });
  } catch (err) {
    console.error('[CONTROLLER excluirProva] Erro:', err.message, err.stack);
    res.status(500).json({ error: 'Erro interno ao excluir a prova: ' + err.message });
  }
};

//MONSTRA AS PROVAS DAQUELE PROFESSOR//
export const listarProvasPorProfessor = async (req, res) => {
  const rgProf = req.params.rgProf;
  console.log(`[CONTROLLER listarProvasPorProfessor] RG Prof: ${rgProf}`);
  try {
    const provas = await ProvaModel.listarPorProfessor(rgProf);
    console.log(`[CONTROLLER listarProvasPorProfessor] ${provas.length} provas encontradas.`);
    res.json(provas);
  } catch (err) {
    console.error('[CONTROLLER listarProvasPorProfessor] Erro:', err.message, err.stack);
    res.status(500).json({ error: 'Erro interno ao listar provas por professor: ' + err.message });
  }
};
//MOSTRA AS PROVAS DAQUELA MATÈRIA//
export const listarProvasPorMateria = async (req, res) => {
  const idDisciplina = req.params.idDisciplina;
  console.log(`[CONTROLLER listarProvasPorMateria] ID Disciplina: ${idDisciplina}`);
  try {
    const provas = await ProvaModel.listarPorMateria(idDisciplina);
    console.log(`[CONTROLLER listarProvasPorMateria] ${provas.length} provas encontradas.`);
    res.json(provas);
  } catch (err) {
    console.error('[CONTROLLER listarProvasPorMateria] Erro:', err.message, err.stack);
    res.status(500).json({ error: 'Erro interno ao listar provas por matéria: ' + err.message });
  }
};

//JUNTA TUDO E FAZ ISSO//
export const listarPorMateriaEProfessor = async (req, res) => {
  const { idDisciplina, rgProf } = req.params;
  console.log(`[CONTROLLER listarPorMateriaEProfessor] ID Disciplina: ${idDisciplina}, RG Prof: ${rgProf}`);
  const sql = 'SELECT * FROM prova WHERE idDisciplina = ? AND rgProf = ?';

  try {
    console.log('[CONTROLLER listarPorMateriaEProfessor] Executando query...');
    const [provas] = await db.query(sql, [idDisciplina, rgProf]);
    console.log(`[CONTROLLER listarPorMateriaEProfessor] ${provas.length} provas encontradas.`);
    res.json(provas);
  } catch (err) {
    console.error('[CONTROLLER listarPorMateriaEProfessor] Erro:', err.message, err.stack);
    res.status(500).json({ error: 'Erro interno ao listar provas: ' + err.message });
  }
};

export default {criarProva, editarProva, excluirProva, listarPorMateriaEProfessor, listarProvasPorMateria, listarProvasPorProfessor}
