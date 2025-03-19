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
router.get('/${id}', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM auditoria WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.json(result[0]);
    });
});

// Registrar una nueva acción en la auditoría (Protegido)
router.post('/', verifyToken, (req, res) => {
    const { usuario_id, accion, descripcion, fecha } = req.body;
    db.query(
        'INSERT INTO auditoria (usuario_id, accion, descripcion, fecha) VALUES (?, ?, ?, ?)',
        [usuario_id, accion, descripcion, fecha],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Acción registrada en auditoría', id: result.insertId });
        }
    );
});

// Actualizar un registro de auditoría por ID (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { usuario_id, accion, descripcion, fecha } = req.body;
    db.query(
        'UPDATE auditoria SET usuario_id = ?, accion = ?, descripcion = ?, fecha = ? WHERE id = ?',
        [usuario_id, accion, descripcion, fecha, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });
            res.json({ message: 'Registro de auditoría actualizado' });
        }
    );
});

// Eliminar un registro de auditoría por ID (Protegido)
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM auditoria WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.json({ message: 'Registro de auditoría eliminado' });
    });
});

module.exports = router;
