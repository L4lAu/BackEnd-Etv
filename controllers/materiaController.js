
import pool from '../db.js';

//lista dados da materia
export const listarDadosDaMateria = async (req, res) => {
    const { nomeDisciplina } = req.params;
    try {
        const [disciplinas] = await pool.execute(
            `SELECT * FROM disciplina where nomeDisciplina = ? `,
            [nomeDisciplina]
        );

        res.json(disciplinas);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao listar dados da materia', error });
        console.error("erro ao procurar dados da materia", error)
        error: error.mensagem
    }
}


export const listarDadosProfessor = async (req, res) => {
    const { rgProf } = req.params;
    try {
        const [Professor] = await pool.execute(
            `SELECT  rgProf, nome FROM professores where rgProf = ? `,
            [rgProf]
        );
        
        res.json(Professor)
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao listar dados do professor', err });
        console.error("erro ao busca dados do professor", err)
        error: error.mensagem
    }
}

export default { listarDadosDaMateria, listarDadosProfessor };