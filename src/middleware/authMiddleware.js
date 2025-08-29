const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Verifica se o token foi enviado
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Espera o formato "Bearer token"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token inválido' });
    }

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Injeta o id do usuário dentro da requisição
        req.userId = decoded.id;  

        next(); // Continua para a rota
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
};

module.exports = authMiddleware;