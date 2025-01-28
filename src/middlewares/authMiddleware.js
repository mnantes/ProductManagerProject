const isAdmin = (req, res, next) => {
    if (!req.session || !req.session.isAuthenticated) {
        return res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
    }

    if (req.session.userRole !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Acesso negado. Apenas administradores podem executar esta ação.' });
    }

    next();
};

const isUser = (req, res, next) => {
    if (!req.session || !req.session.isAuthenticated) {
        return res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
    }

    // 🔥 Se o usuário for "admin", ele também pode adicionar produtos ao carrinho
    if (req.session.userRole !== 'user' && req.session.userRole !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Acesso negado. Apenas usuários podem executar esta ação.' });
    }

    next();
};

module.exports = { isAdmin, isUser };
