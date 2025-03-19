const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');
const router = express.Router();
require('dotenv').config();

// Obtener todos los usuarios
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT id, nombre, correo, rol FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener usuario por ID
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query('SELECT id, nombre, correo, rol FROM usuarios WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(results[0]);
    });
});

// 🔹 Agregar un usuario
router.post('/', verifyToken, (req, res) => {
    const { nombre, correo, rol } = req.body;

    // Validación de datos
    if (!nombre || !correo || !rol) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Insertar en la base de datos
    db.query(
        'INSERT INTO usuarios (nombre, correo, rol) VALUES (?, ?, ?)',
        [nombre, correo, rol],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                message: 'Usuario agregado correctamente',
                usuarioId: result.insertId
            });
        }
    );
});

// Editar usuario por ID
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre, correo, rol } = req.body;

    if (!nombre || !correo || !rol) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    db.query(
        'UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?',
        [nombre, correo, rol, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

            res.json({ message: 'Usuario actualizado correctamente' });
        }
    );
});

// Eliminar usuario por ID
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ message: 'Usuario eliminado correctamente' });
    });
});

module.exports = router;
