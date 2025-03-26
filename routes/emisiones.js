const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Obtener todas las emisiones (Protegido)
router.get('/', verifyToken, (req, res) => {
    db.query('CALL listar_emisiones(?)', [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]); // Los resultados están en el primer array
    });
});

// Obtener una emisión por ID (Protegido)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('CALL buscar_emision(?, ?)', [req.user.id, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results[0].length === 0) return res.status(404).json({ message: 'Emisión no encontrada' });
        res.json(results[0][0]);
    });
});

// Crear nueva emisión (Protegido)
router.post('/', verifyToken, (req, res) => {
    const { fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo } = req.body;
    
    db.query('CALL insertar_emision(?, ?, ?, ?, ?, ?)', 
        [req.user.id, fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta SQL:', err);
                return res.status(500).json({ 
                    error: err.sqlMessage || 'Error al crear la emisión',
                    details: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }
            res.status(201).json({ 
                message: 'Emisión creada correctamente', 
                id: results[0][0].nuevo_id 
            });
        }
    );
});

// Actualizar emisión (Protegido)
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo } = req.body;
    
    db.query('CALL actualizar_emision(?, ?, ?, ?, ?, ?, ?)', 
        [req.user.id, id, fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta SQL:', err);
                return res.status(500).json({ 
                    error: err.sqlMessage || 'Error al actualizar la emisión',
                    details: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }
            
            if (results[0][0].filas_afectadas === 0) {
                return res.status(404).json({ message: 'Emisión no encontrada o sin cambios' });
            }
            
            res.json({ message: 'Emisión actualizada correctamente' });
        }
    );
});

// Eliminar emisión (Protegido) - Ahora es eliminación lógica
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    
    db.query('CALL eliminar_emision(?, ?)', [req.user.id, id], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ 
                error: err.sqlMessage || 'Error al eliminar la emisión',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        
        if (results[0][0].filas_afectadas === 0) {
            return res.status(404).json({ message: 'Emisión no encontrada' });
        }
        
        res.json({ message: 'Emisión marcada como eliminada correctamente' });
    });
});

module.exports = router;