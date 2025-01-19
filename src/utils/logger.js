const { createLogger, format, transports } = require('winston');
const path = require('path');

// Definição de níveis de log personalizados
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    http: 3,
    info: 4,
    debug: 5,
  },
  colors: {
    fatal: 'red',
    error: 'red',
    warning: 'yellow',
    http: 'magenta',
    info: 'green',
    debug: 'blue',
  },
};

// Configuração do formato dos logs
const logFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Criar logger com diferentes níveis, incluindo "fatal"
const logger = createLogger({
  levels: customLevels.levels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({ level: 'debug' }), // Logs no console
    new transports.File({ filename: path.join(__dirname, '../logs/errors.log'), level: 'error' }), // Erros em arquivo
    new transports.File({ filename: path.join(__dirname, '../logs/combined.log') }) // Todos os logs
  ]
});

module.exports = logger;
