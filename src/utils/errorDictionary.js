// utils/errorDictionary.js

module.exports = {
    PRODUCT_NOT_FOUND: {
        status: 404,
        code: 'PRODUCT_NOT_FOUND',
        message: 'O produto solicitado não foi encontrado.'
    },
    PRODUCT_ALREADY_EXISTS: {
        status: 400,
        code: 'PRODUCT_ALREADY_EXISTS',
        message: 'Já existe um produto com essas informações.'
    },
    CART_NOT_FOUND: {
        status: 404,
        code: 'CART_NOT_FOUND',
        message: 'O carrinho solicitado não foi encontrado.'
    },
    INVALID_CART_DATA: {
        status: 400,
        code: 'INVALID_CART_DATA',
        message: 'Os dados fornecidos para o carrinho são inválidos.'
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
    USER_NOT_AUTHENTICATED: {
        status: 401,
        code: 'USER_NOT_AUTHENTICATED',
        message: 'Usuário não autenticado. Faça login para continuar.'
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
