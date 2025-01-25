require('dotenv').config();

const requiredEnvVariables = [
  'MONGODB_URI',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'SESSION_SECRET',
  'MAILTRAP_HOST',
  'MAILTRAP_PORT',
  'MAILTRAP_USER',
  'MAILTRAP_PASS'
];

// Verifica se todas as variáveis de ambiente necessárias estão definidas
const missingVariables = requiredEnvVariables.filter((key) => !process.env[key]);

if (missingVariables.length > 0) {
  console.error(`ERRO CRÍTICO: Variáveis de ambiente ausentes - ${missingVariables.join(', ')}`);
  process.exit(1); // Encerra o servidor caso haja alguma variável ausente
}

const config = {
  mongoUri: process.env.MONGODB_URI,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,

  // Configurações de e-mail (Mailtrap)
  mail: {
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT, 10),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    },
    secure: process.env.NODE_ENV === 'production', // Apenas ativa TLS se for ambiente de produção
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  }
};

module.exports = config;
