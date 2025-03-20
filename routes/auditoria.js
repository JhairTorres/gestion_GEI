const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Obtener todos los registros de auditoría (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM auditoria', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener un registro de auditoría por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {  // 🔹 Corregido el parámetro de ruta
    const { id } = req.params;

    db.query('SELECT * FROM auditoria WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });

        res.json(results[0]);
    });
});

// Registrar una nueva acción en la auditoría (Protegido)
router.post('/', verifyToken, (req, res) => {
    const { usuario_id, accion, fecha } = req.body;

    // Validación de datos
    if (!usuario_id || !accion || !fecha) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    db.query(
        'INSERT INTO auditoria (usuario_id, accion, fecha) VALUES (?, ?, ?)',
        [usuario_id, accion, fecha],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                message: 'Acción registrada en auditoría',
                id: result.insertId
            });
        }
    );
});

// Actualizar un registro de auditoría por ID (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { usuario_id, accion, fecha } = req.body;

    if (!usuario_id || !accion  || !fecha) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    db.query(
        'UPDATE auditoria SET usuario_id = ?, accion = ?, fecha = ? WHERE id = ?',
        [usuario_id, accion, fecha, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });

            res.json({ message: 'Registro de auditoría actualizado correctamente' });
        }
    );
});

// Eliminar un registro de auditoría por ID (Protegido)
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM auditoria WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });

        res.json({ message: 'Registro de auditoría eliminado correctamente' });
    });
});

module.exports = router;
