const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Obtener todas las emisiones (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT id, fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo FROM emisiones', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener una emisión por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT id, fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo FROM emisiones WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Emisión no encontrada' });
        res.json(results[0]);
    });
});

router.post('/', verifyToken, (req, res) => {
    const { fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo } = req.body;

    if (!fuente_id || !gas_id || !ubicacion_id || !cantidad_emision || !periodo) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    db.query(
        'INSERT INTO emisiones (fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo) VALUES (?, ?, ?, ?, ?)',
        [fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo],
        (err, result) => {
            if (err) {
                console.error('Error en la consulta SQL:', err); // 🔍 Esto imprime el error exacto en la terminal
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Emisión agregada correctamente', id: result.insertId });
        }
    );
});


// Actualizar una emisión por ID (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo } = req.body;

    if (!fuente_id || !cantidad_emision || !periodo) {
        return res.status(400).json({ message: 'Fuente, cantidad de emisión y periodo son obligatorios' });
    }

    db.query(
        'UPDATE emisiones SET fuente_id = ?, gas_id = ?, ubicacion_id = ?, cantidad_emision = ?, periodo = ? WHERE id = ?',
        [fuente_id, gas_id || null, ubicacion_id || null, cantidad_emision, periodo, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Emisión no encontrada' });
            res.json({ message: 'Emisión actualizada correctamente' });
        }
    );
});

// Eliminar una emisión por ID (Protegido)
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM emisiones WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Emisión no encontrada' });
        res.json({ message: 'Emisión eliminada correctamente' });
    });
});

module.exports = router;