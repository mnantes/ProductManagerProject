// utils/errorDictionary.js

module.exports = {
    PRODUCT_NOT_FOUND: {
        status: 404,
        code: 'PRODUCT_NOT_FOUND',
        message: 'O produto solicitado não foi encontrado.'
    },
    CART_NOT_FOUND: {
        status: 404,
        code: 'CART_NOT_FOUND',
        message: 'O carrinho solicitado não foi encontrado.'
    },
    INSUFFICIENT_STOCK: {
        status: 400,
        code: 'INSUFFICIENT_STOCK',
        message: 'Não há estoque suficiente para este produto.'
    },
    USER_NOT_AUTHORIZED: {
        status: 403,
        code: 'USER_NOT_AUTHORIZED',
        message: 'Usuário não autorizado para esta ação.'
    },
    INVALID_PRODUCT_DATA: {
        status: 400,
        code: 'INVALID_PRODUCT_DATA',
        message: 'Os dados fornecidos para o produto são inválidos.'
    },
    SERVER_ERROR: {
        status: 500,
        code: 'SERVER_ERROR',
        message: 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.'
    }
};
