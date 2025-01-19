require('dotenv').config();

const config = {
  mongoUri: process.env.MONGODB_URI,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,

  // Configurações de e-mail (Mailtrap)
  mail: {
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    },
    secure: false, // TLS opcional
    tls: {
      rejectUnauthorized: false
    }
  }
};

module.exports = config;
