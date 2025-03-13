const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const verifyToken = require('../config/verify');
require('dotenv').config();

const router = express.Router();

// Obtener todos los usuarios (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT id, nombre, correo, rol FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Registro de usuario
router.post('/register', async (req, res) => {
    const { nombre, correo, clave, rol } = req.body;
    const hashedClave = await bcrypt.hash(clave, 10);

    db.query(
        'INSERT INTO usuarios (nombre, correo, clave, rol) VALUES (?, ?, ?, ?)',
        [nombre, correo, hashedClave, rol],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Usuario registrado exitosamente' });
        }
    );
});

//Login de usuario
router.post('/login', (req, res) => {
    const { correo, clave } = req.body;
    db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

        const user = results[0];
        const validPass = await bcrypt.compare(clave, user.clave);
        if (!validPass) return res.status(400).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token: token, rol: user.rol });
    });
});

module.exports = router;
