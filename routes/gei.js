const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Obtener todos los tipos de gas (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM tipos_gas', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener un tipo de gas por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM tipos_gas WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Tipo de gas no encontrado' });
        res.json(results[0]);
    });
});

// Agregar un nuevo tipo de gas (Protegido)
router.post('/', verifyToken, (req, res) => {
    const { nombre, potencial_calentamiento_global } = req.body;

    if (!nombre || potencial_calentamiento_global === undefined) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    db.query(
        'INSERT INTO tipos_gas (nombre, potencial_calentamiento_global) VALUES (?, ?)',
        [nombre, potencial_calentamiento_global],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                message: 'Tipo de gas agregado correctamente',
                id: result.insertId
            });
        }
    );
});

// Actualizar un tipo de gas por ID (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre, potencial_calentamiento_global } = req.body;

    if (!nombre || potencial_calentamiento_global === undefined) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    db.query(
        'UPDATE tipos_gas SET nombre = ?, potencial_calentamiento_global = ? WHERE id = ?',
        [nombre, potencial_calentamiento_global, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Tipo de gas no encontrado' });
            res.json({ message: 'Tipo de gas actualizado correctamente' });
        }
    );
});

// Eliminar un tipo de gas por ID (Protegido)
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM tipos_gas WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Tipo de gas no encontrado' });
        res.json({ message: 'Tipo de gas eliminado correctamente' });
    });
});

module.exports = router;
