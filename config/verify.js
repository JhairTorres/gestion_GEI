const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken; // 📌 Acceder al token desde la cookie

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado, token requerido' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = verifyToken;
