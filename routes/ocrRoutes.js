// Importa o Express para criar rotas
import express from 'express';

// Importa o Multer para lidar com upload de arquivos
import multer from 'multer';

// Importa módulos do Node para manipular caminhos de arquivo
import path from 'path';
import { fileURLToPath } from 'url';

// Importa o controller responsável por tratar a imagem e aplicar OCR
import corrigirImagem from '../controllers/ocrController.js';

// Cria o router do Express
const router = express.Router();

// Corrige o __dirname (não disponível nativamente em ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do armazenamento de arquivos com multer
const storage = multer.diskStorage({
  // Define o diretório onde os arquivos serão salvos
  destination: path.join(__dirname, '../uploads'),
  
  // Define o nome do arquivo como um timestamp seguido da extensão original
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Cria o middleware de upload usando a configuração de armazenamento definida
const upload = multer({ storage });

// [ROTA POST /corrigir/:idProva]
// Recebe uma imagem (upload via formulário) e envia para o controller realizar a correção da prova via OCR
// - Parâmetro :idProva indica qual prova está sendo corrigida
// - Campo de upload deve ser chamado 'imagem'
router.post('/corrigir/:idProva', upload.single('imagem'), corrigirImagem);

// Exporta o router para ser usado no app principal
export default router;
