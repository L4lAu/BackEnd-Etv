//IMPORTAÇÃO DO BANCO DE DADOS
import pool from "../db.js";

//MODELO DE OPERAÇÕES RELACIONADAS À TABELA "prova"
const ProvaModel = {

  //FUNÇÃO PARA CRIAR UMA NOVA PROVA
  criar: async (prova) => {
    console.log('[MODEL ProvaModel.criar] Dados recebidos:', prova);
    const sql = 'INSERT INTO prova (rgProf, idDisciplina, numQuestoes, dataAplicacao) VALUES (?, ?, ?, ?)';
    try {
      const [result] = await pool.query(sql, [prova.rgProf, prova.idDisciplina, prova.numQuestoes, prova.dataAplicacao]);
      console.log('[MODEL ProvaModel.criar] Prova criada, ID:', result.insertId);
      return result; 
    } catch (error) {
      console.error('[MODEL ProvaModel.criar] Erro ao criar prova:', error);
      throw error; 
    }
  },

  //FUNÇÃO PARA ATUALIZAR UMA PROVA EXISTENTE (SOMENTE PELO PROFESSOR QUE A CRIOU)
  atualizar: async (idProva, rgProf, novaProva) => {
    console.log(`[MODEL ProvaModel.atualizar] ID: ${idProva}, RG Prof: ${rgProf}, Dados:`, novaProva);
    const sql = 'UPDATE prova SET numQuestoes = ?, dataAplicacao = ? WHERE idProva = ? AND rgProf = ?';
    try {
      const [result] = await pool.query(sql, [novaProva.numQuestoes, novaProva.dataAplicacao, idProva, rgProf]);
      console.log('[MODEL ProvaModel.atualizar] Resultado:', result);
      return result; 
    } catch (error) {
      console.error('[MODEL ProvaModel.atualizar] Erro ao atualizar prova:', error);
      throw error;
    }
  },

  //FUNÇÃO PARA DELETAR UMA PROVA (SOMENTE PELO PROFESSOR QUE A CRIOU)
  deletar: async (idProva, rgProf) => {
    console.log(`[MODEL ProvaModel.deletar] ID Prova: ${idProva}, RG Prof: ${rgProf}`);
    const sql = 'DELETE FROM prova WHERE idProva = ? AND rgProf = ?';
    try {
      const [result] = await pool.query(sql, [idProva, rgProf]);
      console.log('[MODEL ProvaModel.deletar] Resultado:', result);
      return result; 
    } catch (error) {
      console.error('[MODEL ProvaModel.deletar] Erro ao deletar prova:', error);
      throw error;
    }
  },

  //FUNÇÃO PARA LISTAR TODAS AS PROVAS CRIADAS POR UM PROFESSOR
  listarPorProfessor: async (rgProf) => {
    console.log(`[MODEL ProvaModel.listarPorProfessor] RG Prof: ${rgProf}`);
    const sql = 'SELECT * FROM prova WHERE rgProf = ?';
    try {
      const [rows] = await pool.query(sql, [rgProf]);
      console.log(`[MODEL ProvaModel.listarPorProfessor] Provas encontradas: ${rows.length}`);
      return rows;
    } catch (error) {
      console.error('[MODEL ProvaModel.listarPorProfessor] Erro ao listar provas:', error);
      throw error;
    }
  },

  //FUNÇÃO PARA LISTAR TODAS AS PROVAS DE UMA DETERMINADA MATÉRIA
  listarPorMateria: async (idDisciplina) => {
    console.log(`[MODEL ProvaModel.listarPorMateria] ID Disciplina: ${idDisciplina}`);
    const sql = 'SELECT * FROM prova WHERE idDisciplina = ?';
    try {
      const [rows] = await pool.query(sql, [idDisciplina]);
      console.log(`[MODEL ProvaModel.listarPorMateria] Provas encontradas: ${rows.length}`);
      return rows;
    } catch (error) {
      console.error('[MODEL ProvaModel.listarPorMateria] Erro ao listar provas:', error);
      throw error;
    }
  },

  //FUNÇÃO PARA LISTAR TODAS AS PROVAS DE UMA DETERMINADA MATÉRIA CRIADAS POR UM DETERMINADO PROFESSOR
  listarPorMateriaEProfessor: async (idDisciplina, rgProf) => {
    console.log(`[MODEL ProvaModel.listarPorMateriaEProfessor] ID Disciplina: ${idDisciplina}, RG Prof: ${rgProf}`);
    const sql = 'SELECT * FROM prova WHERE idDisciplina = ? AND rgProf = ?';
    try {
      const [rows] = await pool.query(sql, [idDisciplina, rgProf]);
      console.log(`[MODEL ProvaModel.listarPorMateriaEProfessor] Provas encontradas: ${rows.length}`);
      return rows;
    } catch (error) {
      console.error('[MODEL ProvaModel.listarPorMateriaEProfessor] Erro ao listar provas:', error);
      throw error;
    }
  }
};

//EXPORTAÇÃO DO MODELO PARA USO EM OUTRAS PARTES DO SISTEMA
export default ProvaModel;
