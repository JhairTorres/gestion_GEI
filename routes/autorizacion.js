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

// 🔐 Login de usuario con cookies seguras
router.post('/login', (req, res) => {
    const { correo, clave } = req.body;

    db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        if (results.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

        const user = results[0];
        const validPass = await bcrypt.compare(clave, user.clave);
        if (!validPass) return res.status(400).json({ message: 'Contraseña incorrecta' });

        // Generar tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Configurar cookies seguras
        res.cookie('accessToken', accessToken, {
            httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 900000 // 15 min
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        res.json({ message: 'Login exitoso', rol: user.rol });
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

// Registrar usuario
router.post('/register', async (req, res) => {
    const { nombre, correo, clave, rol } = req.body;
    const hashedClave = await bcrypt.hash(clave, 10);

    db.query(
        'INSERT INTO usuarios (nombre, correo, clave, rol) VALUES (?, ?, ?, ?)',
        [nombre, correo, hashedClave, rol],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Usuario registrado exitosamente' });
        }
    );
});


module.exports = router;
