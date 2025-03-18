const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const verifyToken  = require('../config/verify');
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

router.post('/refresh-token', (req, res) => {
    const refreshToken = req.header('x-refresh-token');
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token requerido' });

    try {
        const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Generar un nuevo token de acceso
        const newAccessToken = jwt.sign(
            { id: verified.id, rol: verified.rol },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ accessToken: newAccessToken });

    } catch (error) {
        res.status(403).json({ message: 'Refresh token inválido o expirado' });
    }
});

// Actualizar usuario por ID (Protegido)
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, clave, rol } = req.body;

    let hashedClave = clave ? await bcrypt.hash(clave, 10) : null;

    const query = hashedClave
        ? 'UPDATE usuarios SET nombre = ?, correo = ?, clave = ?, rol = ? WHERE id = ?'
        : 'UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?';

    const params = hashedClave ? [nombre, correo, hashedClave, rol, id] : [nombre, correo, rol, id];

    db.query(query, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ message: 'Usuario actualizado correctamente' });
    });
});

// Eliminar usuario por ID (Protegido)
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ message: 'Usuario eliminado correctamente' });
    });
});

// Obtener un usuario por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query('SELECT id, nombre, correo, rol FROM usuarios WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(results[0]);
    });
});
module.exports = router;
