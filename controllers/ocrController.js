//IMPORTS PADRÕES

import Tesseract from 'tesseract.js';
import db from '../db.js';
import fs from 'fs';

// CORRIGE A PROVA ATRAVEZ DA IMAGEM DO GABARITO
export const corrigirImagem = async (req, res) => {
  const { idProva } = req.params;

  // Verifica se o arquivo foi enviado corretamente
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhuma imagem foi enviada.' });
  }

  const imagemPath = req.file.path;

  try {
    // Passo 1: Realiza OCR na imagem
    const resultado = await Tesseract.recognize(imagemPath, 'eng');
    const textoOCR = resultado.data.text.replace(/\s/g, '').toUpperCase(); // remove espaços e quebras de linha

    // Exemplo de saída esperada: "A,B,C,D,E"
    const respostasLidas = textoOCR.split(',');

    // Passo 2: Busca o gabarito no banco
    const [questoes] = await db.query(
      'SELECT idQuestao, alternativaCorreta FROM questao WHERE idProva = ? ORDER BY idQuestao',
      [idProva]
    );

    // Passo 3: Compara as respostas
    let acertos = 0;
    questoes.forEach((q, index) => {
      if (
        respostasLidas[index] &&
        respostasLidas[index] === q.alternativaCorreta.toUpperCase()
      ) {
        acertos++;
      }
    });

    const nota = ((acertos / questoes.length) * 100).toFixed(2);

    // Remove a imagem temporária após o OCR
    fs.unlinkSync(imagemPath);

    // Resposta da API
    res.json({
      totalQuestoes: questoes.length,
      respostasLidas,
      acertos,
      nota
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao processar imagem' });
  }
};

export default corrigirImagem;