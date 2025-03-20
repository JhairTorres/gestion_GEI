const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Obtener todas las ubicaciones (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT id, pais, region, ciudad FROM ubicaciones', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener una ubicación por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT id, pais, region, ciudad FROM ubicaciones WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Ubicación no encontrada' });
        res.json(results[0]);
    });
});

// Agregar una nueva ubicación (Protegido)
router.post('/', verifyToken, (req, res) => {
    const { pais, region, ciudad } = req.body;

    if (!pais || !region || !ciudad) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    db.query(
        'INSERT INTO ubicaciones (pais, region, ciudad) VALUES (?, ?, ?)',
        [pais, region, ciudad],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                message: 'Ubicación agregada correctamente',
                id: result.insertId
            });
        }
    );
});

// Actualizar una ubicación por ID (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { pais, region, ciudad } = req.body;

    if (!pais || !region || !ciudad) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    db.query(
        'UPDATE ubicaciones SET pais = ?, region = ?, ciudad = ? WHERE id = ?',
        [pais, region, ciudad, id],
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