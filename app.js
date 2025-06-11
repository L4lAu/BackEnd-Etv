// SERVIDOR PADRÃO PARA BACKEND //

import express from 'express';
import cors from 'cors';

// IMPORTA AS ROTAS //
import provaRoutes from './routes/provaRoutes.js';
import questaoRoutes from './routes/questaoRoutes.js';
import alunoRoutes from './routes/alunoRoutes.js';
import ocrRoutes from './routes/ocrRoutes.js';
import dadosRoutes from './routes/dadosRoutes.js';
import relatorioRoutes from './routes/relatorioRoutes.js'
import disciplinaRoutes from './routes/disciplinaRoutes.js'


const app = express();
app.use(cors());
app.use(express.json());

// UTILIZA AS ROTAS //
app.use('/provas', provaRoutes);
app.use('/questoes', questaoRoutes); 
app.use('/aluno', alunoRoutes);
app.use('/dados', dadosRoutes)
app.use('/ocr', ocrRoutes); 
app.use('/relatorio', relatorioRoutes);
app.use('/disciplinas', disciplinaRoutes);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
