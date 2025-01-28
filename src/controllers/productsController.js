const ProductRepository = require('../repositories/ProductRepository');
const { CustomError } = require('../middlewares/errorHandler');
const mongoose = require('mongoose'); // Importação necessária para validar ObjectId

exports.getProducts = async (req, res, next) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const filter = query ? { $or: [{ category: query }, { status: query === 'true' }] } : {};
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
        };

        const result = await ProductRepository.getProducts(filter, options);
        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products?limit=${limit}&page=${result.prevPage}&sort=${sort || ''}&query=${query || ''}` : null,
            nextLink: result.hasNextPage ? `/api/products?limit=${limit}&page=${result.nextPage}&sort=${sort || ''}&query=${query || ''}` : null
        });
    } catch (error) {
        next(new CustomError('Erro ao buscar produtos', 500));
    }
};

exports.getProductById = async (req, res, next) => {
    try {
        const productId = req.params.pid;

        // ✅ Verifica se o ID tem 24 caracteres antes de buscar (MongoDB usa IDs de 24 caracteres)
        if (!productId || productId.length !== 24 || !mongoose.Types.ObjectId.isValid(productId)) {
            console.error(`ID inválido recebido: ${productId}`);
            return next(new CustomError('ID do produto inválido', 400));
        }

        const product = await ProductRepository.getProductById(productId);
        if (!product) {
            console.error(`Produto não encontrado para ID: ${productId}`);
            return next(new CustomError('Produto não encontrado', 404));
        }

        res.json(product);
    } catch (error) {
        console.error(`Erro ao buscar produto [ID: ${req.params.pid}]:`, error);
        next(new CustomError(`Erro interno ao buscar produto: ${error.message}`, 500));
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new CustomError('Dados inválidos para criação do produto', 400);
        }

        const newProduct = await ProductRepository.createProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        next(new CustomError(error.message || 'Erro ao criar produto', 400));
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const productId = req.params.pid;

        if (!productId || productId.length !== 24 || !mongoose.Types.ObjectId.isValid(productId)) {
            return next(new CustomError('ID do produto inválido', 400));
        }

        const updatedProduct = await ProductRepository.updateProduct(productId, req.body);
        if (!updatedProduct) {
            return next(new CustomError('Produto não encontrado', 404));
        }
        res.json(updatedProduct);
    } catch (error) {
        next(new CustomError('Erro ao atualizar produto', 400));
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.pid;

        if (!productId || productId.length !== 24 || !mongoose.Types.ObjectId.isValid(productId)) {
            return next(new CustomError('ID do produto inválido', 400));
        }

        const deletedProduct = await ProductRepository.deleteProduct(productId);
        if (!deletedProduct) {
            return next(new CustomError('Produto não encontrado', 404));
        }
        res.status(204).send();
    } catch (error) {
        next(new CustomError('Erro ao deletar produto', 500));
    }
};
