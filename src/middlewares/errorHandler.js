// middlewares/errorHandler.js
const logger = require('../utils/logger');
const errorDictionary = require('../utils/errorDictionary');

// Classe personalizada para erros
class CustomError extends Error {
    constructor(errorKey, message = null) {
        super(message || errorDictionary[errorKey]?.message || 'Erro desconhecido');
        this.statusCode = errorDictionary[errorKey]?.status || 500;
        this.code = errorDictionary[errorKey]?.code || errorKey || 'UNKNOWN_ERROR';
    }
}

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
    // Log detalhado do erro
    logger.error(`Erro: ${err.code || 'UNKNOWN_ERROR'} - ${err.message}`);
    if (err.stack) logger.error(`Stack Trace:\n${err.stack}`);

    // Se não for um CustomError, converte para um erro genérico
    const statusCode = err.statusCode || 500;
    const response = {
        status: 'error',
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'Erro interno do servidor'
    };

    res.status(statusCode).json(response);
};

module.exports = { errorHandler, CustomError };
