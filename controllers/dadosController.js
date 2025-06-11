
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
    console.log("rg do Professor: ", rgProf)
    try {
        const [Professor] = await pool.execute(
            `SELECT rgProf, nome FROM professores where rgProf = ? `,
            [rgProf]
        );
        console.log("rg do Professor: ", rgProf)
        console.log("dados do Professor: ", Professor)
        res.json(Professor)
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao listar dados do professor', err });
        console.error("erro ao busca dados do professor", err)
        error: err.mensagem
    }
}

export const dadosDesempenho = async (req, res) => {
    const { raAluno } = req.params;
    try {
        const [desempenho] = await pool.execute(
            `SELECT * FROM desempenho where raAluno = ? `,
            [raAluno]
        );
        res.json(desempenho);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar desempenho do aluno', error });
        console.error("erro ao buscar desempenho do aluno", error)
        error: error.mensagem
    }

}

export const dadosAluno = async (req, res) => {
    const { raAluno } = req.params;
    try {
        const [desempenho] = await pool.execute(
            `SELECT nome, raAluno FROM alunos where raAluno = ? `,
            [raAluno]
        );
        res.json(desempenho);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar dados do aluno', error });
        console.error("erro ao buscar dados do aluno", error)
        error: error.mensagem
    }

}



export default { listarDadosDaMateria, listarDadosProfessor, dadosDesempenho, dadosAluno};