// middlewares/errorHandler.js
const logger = require('../utils/logger');
const errorDictionary = require('../utils/errorDictionary');

// Classe personalizada para erros
class CustomError extends Error {
    constructor(errorKey) {
        super(errorDictionary[errorKey]?.message || 'Erro desconhecido');
        this.statusCode = errorDictionary[errorKey]?.status || 500;
        this.code = errorDictionary[errorKey]?.code || 'UNKNOWN_ERROR';
    }
}

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
    logger.error(`Erro: ${err.code || 'UNKNOWN_ERROR'} - ${err.message}`);

    const statusCode = err.statusCode || 500;
    const response = {
        status: 'error',
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'Erro interno do servidor'
    };

    res.status(statusCode).json(response);
};

module.exports = { errorHandler, CustomError };
