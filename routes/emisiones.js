const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Obtener todas las emisiones registradas (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM emisiones', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener un registro de emisión por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM emisiones WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.json(result[0]);
    });
});

// Agregar un nuevo registro de emisión (Protegido)
router.post('/', verifyToken, (req, res) => {
    const { fuente_id, gei_id, cantidad, fecha } = req.body;
    db.query(
        'INSERT INTO emisiones (fuente_id, gei_id, cantidad, fecha) VALUES (?, ?, ?, ?)',
        [fuente_id, gei_id, cantidad, fecha],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Emisión registrada correctamente', id: result.insertId });
        }
    );
});

// Actualizar un registro de emisión por ID (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { fuente_id, gei_id, cantidad, fecha } = req.body;
    db.query(
        'UPDATE emisiones SET fuente_id = ?, gei_id = ?, cantidad = ?, fecha = ? WHERE id = ?',
        [fuente_id, gei_id, cantidad, fecha, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });
            res.json({ message: 'Registro de emisión actualizado' });
        }
    );
});

// Eliminar un registro de emisión por ID (Protegido)
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM emisiones WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.json({ message: 'Registro de emisión eliminado' });
    });
});

module.exports = router;
