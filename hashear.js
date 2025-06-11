// hashSenha.js
const bcrypt = require('bcrypt');
const senha = 'gabriel123'; // coloque a senha atual do aluno ou professor
const saltRounds = 10;

bcrypt.hash(senha, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erro ao gerar hash:', err);
  } else {
    console.log('Hash gerado:', hash);
  }
});
