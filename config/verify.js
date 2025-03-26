const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado, token requerido' });
    }

    try {
        // 1. Verificar el token JWT
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 2. Obtener información completa del usuario desde la base de datos
        const [user] = await db.promise().query(
            'SELECT u.id, u.nombre, u.correo, u.rol_id, r.nombre AS rol_nombre, r.nivel_permiso ' +
            'FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ? AND u.is_active = 1',
            [verified.id]
        );

        if (user.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
        }

        // 3. Adjuntar información del usuario a la solicitud
        req.user = {
            id: user[0].id,
            nombre: user[0].nombre,
            correo: user[0].correo,
            rol_id: user[0].rol_id,
            rol_nombre: user[0].rol_nombre,
            nivel_permiso: user[0].nivel_permiso
        };

        next();
    } catch (error) {
        console.error('Error en verificación de token:', error);
        
        // Manejar diferentes tipos de errores
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Token expirado' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Token inválido' });
        }
        
        return res.status(500).json({ message: 'Error en la autenticación' });
    }
};

module.exports = verifyToken;