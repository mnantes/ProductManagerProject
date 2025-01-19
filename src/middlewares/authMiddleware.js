const isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || !req.session.isAuthenticated) {
        return res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
    }

    if (req.session.userRole !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Acesso negado. Apenas administradores podem executar esta ação.' });
    }

    next();
};

const isUser = (req, res, next) => {
    if (!req.isAuthenticated() || !req.session.isAuthenticated) {
        return res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
    }

    if (req.session.userRole !== 'user') {
        return res.status(403).json({ status: 'error', message: 'Acesso negado. Apenas usuários comuns podem executar esta ação.' });
    }

    next();
};

module.exports = { isAdmin, isUser };
