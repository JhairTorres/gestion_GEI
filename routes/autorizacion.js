const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const verifyToken = require('../config/verify');
const router = express.Router();

require('dotenv').config();

// Configuración de tiempo de expiración
const ACCESS_TOKEN_EXPIRATION = '15m'; // Token de acceso: 15 minutos
const REFRESH_TOKEN_EXPIRATION = '7d'; // Token de refresco: 7 días

// Función para generar tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    const refreshToken = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    return { accessToken, refreshToken };
};

router.post('/login', (req, res) => {
    const { correo, clave } = req.body;

    db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        if (results.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

        const user = results[0];
        const validPass = await bcrypt.compare(clave, user.clave);
        if (!validPass) return res.status(400).json({ message: 'Contraseña incorrecta' });

        // Mapear el rol_id al nombre del rol
        const roles = {
            1: 'Administrador',
            2: 'Usuario',
            3: 'Auditor'
        };
        const rolNombre = roles[user.rol_id] || 'Desconocido';

        // Generar tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Configurar cookies seguras
        res.cookie('accessToken', accessToken, {
            httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 900000 // 15 min
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        res.json({ message: 'Login exitoso', rol: rolNombre });
    });
});

router.get('/session', (req, res) => {
    if (req.cookies.accessToken) {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// 🔄 Renovar token de acceso
router.post('/refresh-token', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No hay token de refresco' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido o expirado' });

        const newAccessToken = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRATION }
        );

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 900000
        });

        res.json({ message: 'Token renovado' });
    });
});

// 🚪 Cerrar sesión y eliminar cookies
router.post('/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Sesión cerrada' });
});

// Obtener todos los usuarios (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT id, nombre, correo, rol FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Registrar usuario usando procedimiento almacenado
router.post('/register', async (req, res) => {
    const { nombre, correo, clave, rol } = req.body;
    
    try {
        // 1. Validar campos requeridos
        if (!nombre || !correo || !clave || !rol) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // 2. Hashear la contraseña antes de enviarla al procedimiento
        const hashedClave = await bcrypt.hash(clave, 10);

        // 3. Llamar al procedimiento almacenado
        const [results] = await db.promise().query(
            'CALL registrar_usuario(?, ?, ?, ?, 1)',
            [nombre, correo, hashedClave, rol]
        );

        // El procedimiento devuelve el ID del nuevo usuario en el primer conjunto de resultados
        const nuevoUsuarioId = results[0][0].nuevo_usuario_id;

        res.status(201).json({ 
            success: true,
            message: 'Usuario registrado exitosamente',
            usuarioId: nuevoUsuarioId
        });

    } catch (err) {
        console.error('Error en registro:', err);
        
        // Manejar errores específicos del procedimiento almacenado
        if (err.code === '45000') {
            return res.status(400).json({ 
                error: 'Error de validación',
                message: err.message,
                roles_permitidos: ['Administrador', 'Usuario', 'Auditor']
            });
        }
        
        // Error de correo duplicado (asumiendo que el procedimiento usa el mismo código)
        if (err.code === 'ER_DUP_ENTRY' || err.message.includes('correo electrónico ya está registrado')) {
            return res.status(400).json({ 
                error: 'El correo ya está registrado' 
            });
        }

        res.status(500).json({ 
            error: 'Error al registrar el usuario',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});
module.exports = router;
