const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Obtener todas las fuentes emisoras (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM fuentes_emisoras', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener una fuente emisora por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM fuentes_emisoras WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Fuente emisora no encontrada' });
        res.json(results[0]);
    });
});

// Agregar una nueva fuente emisora (Protegido)
router.post('/', verifyToken, (req, res) => {
    const { nombre, sector } = req.body;

    if (!nombre || !sector) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const sectoresValidos = ['Transporte', 'Energía', 'Industria', 'Agricultura', 'Residuos', 'Otros'];
    if (!sectoresValidos.includes(sector)) {
        return res.status(400).json({ message: 'Sector no válido' });
    }

    db.query(
        'INSERT INTO fuentes_emisoras (nombre, sector) VALUES (?, ?)',
        [nombre, sector],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                message: 'Fuente emisora agregada correctamente',
                id: result.insertId
            });
        }
    );
});

// Actualizar una fuente emisora por ID (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre, sector } = req.body;

    if (!nombre || !sector) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const sectoresValidos = ['Transporte', 'Energía', 'Industria', 'Agricultura', 'Residuos', 'Otros'];
    if (!sectoresValidos.includes(sector)) {
        return res.status(400).json({ message: 'Sector no válido' });
    }

    db.query(
        'UPDATE fuentes_emisoras SET nombre = ?, sector = ? WHERE id = ?',
        [nombre, sector, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Fuente emisora no encontrada' });
            res.json({ message: 'Fuente emisora actualizada correctamente' });
        }
    );
});

// Eliminar una fuente emisora por ID (Protegido)
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM fuentes_emisoras WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Fuente emisora no encontrada' });
        res.json({ message: 'Fuente emisora eliminada correctamente' });
    });
});

module.exports = router;
