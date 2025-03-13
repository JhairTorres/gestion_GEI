const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Obtener todas las ubicaciones (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM ubicaciones', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener una ubicación por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM ubicaciones WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: 'Ubicación no encontrada' });
        res.json(result[0]);
    });
});

// Agregar una nueva ubicación (Protegido)
router.post('/', verifyToken, (req, res) => {
    const { nombre, latitud, longitud } = req.body;
    db.query(
        'INSERT INTO ubicaciones (nombre, latitud, longitud) VALUES (?, ?, ?)',
        [nombre, latitud, longitud],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Ubicación agregada correctamente', id: result.insertId });
        }
    );
});

// Actualizar una ubicación por ID (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre, latitud, longitud } = req.body;
    db.query(
        'UPDATE ubicaciones SET nombre = ?, latitud = ?, longitud = ? WHERE id = ?',
        [nombre, latitud, longitud, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Ubicación no encontrada' });
            res.json({ message: 'Ubicación actualizada correctamente' });
        }
    );
});

// Eliminar una ubicación por ID (Protegido)
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM ubicaciones WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Ubicación no encontrada' });
        res.json({ message: 'Ubicación eliminada correctamente' });
    });
});

module.exports = router;

