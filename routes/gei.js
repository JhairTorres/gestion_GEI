const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Obtener todos los gases de efecto invernadero (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM gei', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener un GEI por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM gei WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: 'GEI no encontrado' });
        res.json(result[0]);
    });
});

// Agregar un nuevo GEI (Protegido)
router.post('/', verifyToken, (req, res) => {
    const { nombre, descripcion } = req.body;
    db.query(
        'INSERT INTO gei (nombre, descripcion) VALUES (?, ?)',
        [nombre, descripcion],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'GEI agregado correctamente', id: result.insertId });
        }
    );
});

// Actualizar un GEI por ID (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    db.query(
        'UPDATE gei SET nombre = ?, descripcion = ? WHERE id = ?',
        [nombre, descripcion, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'GEI no encontrado' });
            res.json({ message: 'GEI actualizado correctamente' });
        }
    );
});

// Eliminar un GEI por ID (Protegido)
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM gei WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'GEI no encontrado' });
        res.json({ message: 'GEI eliminado correctamente' });
    });
});

module.exports = router;
