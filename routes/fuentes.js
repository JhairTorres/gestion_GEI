const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Obtener todas las fuentes de emisión (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM fuentes', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener una fuente de emisión por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM fuentes WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: 'Fuente no encontrada' });
        res.json(result[0]);
    });
});

// Agregar una nueva fuente de emisión (Protegido)
router.post('/', verifyToken, (req, res) => {
    const { nombre, tipo, descripcion } = req.body;
    db.query(
        'INSERT INTO fuentes (nombre, tipo, descripcion) VALUES (?, ?, ?)',
        [nombre, tipo, descripcion],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Fuente agregada correctamente', id: result.insertId });
        }
    );
});

// Actualizar una fuente de emisión por ID (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre, tipo, descripcion } = req.body;
    db.query(
        'UPDATE fuentes SET nombre = ?, tipo = ?, descripcion = ? WHERE id = ?',
        [nombre, tipo, descripcion, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Fuente no encontrada' });
            res.json({ message: 'Fuente de emisión actualizada' });
        }
    );
});

// Eliminar una fuente de emisión por ID (Protegido)
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM fuentes WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Fuente no encontrada' });
        res.json({ message: 'Fuente de emisión eliminada' });
    });
});

module.exports = router;
