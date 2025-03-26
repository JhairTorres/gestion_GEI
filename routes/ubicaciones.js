const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Manejo de errores común para procedimientos
const handleProcedureError = (err, res) => {
    if (err.message.includes('Acceso denegado') || 
        err.message.includes('Permisos insuficientes') ||
        err.message.includes('no tiene rol asignado')) {
        return res.status(403).json({ 
            error: err.message,
            code: 'ACCESS_DENIED'
        });
    }
    console.error('Error en procedimiento:', err);
    return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// Obtener todas las ubicaciones
router.get('/', verifyToken, (req, res) => {
    db.query('CALL listar_ubicaciones(?)', [req.userId], (err, results) => {
        if (err) return handleProcedureError(err, res);
        
        // Extraer correctamente los resultados del procedimiento
        const ubicaciones = results[0] || [];
        res.json(ubicaciones);
    });
});

// Obtener una ubicación por ID
router.get('/:id', verifyToken, (req, res) => {
    db.query('CALL buscar_ubicacion_por_id(?, ?)', 
        [req.userId, req.params.id], 
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            
            if (!results[0] || results[0].length === 0) {
                return res.status(404).json({ 
                    message: 'Ubicación no encontrada',
                    code: 'NOT_FOUND'
                });
            }
            
            res.json(results[0][0]);
        }
    );
});

// Validación común para datos de ubicación
const validateUbicacionData = (req, res) => {
    const { pais, region, ciudad } = req.body;
    const errors = [];
    
    if (!pais) errors.push('El campo país es requerido');
    if (!region) errors.push('El campo región es requerido');
    if (!ciudad) errors.push('El campo ciudad es requerido');
    
    if (errors.length > 0) {
        res.status(400).json({ 
            errors,
            code: 'VALIDATION_ERROR'
        });
        return false;
    }
    return true;
};

// Agregar nueva ubicación
router.post('/', verifyToken, (req, res) => {
    if (!validateUbicacionData(req, res)) return;
    
    const { pais, region, ciudad } = req.body;
    
    db.query(
        'CALL insertar_ubicacion(?, ?, ?, ?)',
        [req.userId, pais, region, ciudad],
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            
            res.status(201).json({
                success: true,
                message: 'Ubicación agregada correctamente',
                data: {
                    id: results[0][0].nuevo_id,
                    pais,
                    region,
                    ciudad
                }
            });
        }
    );
});

// Actualizar ubicación
router.put('/:id', verifyToken, (req, res) => {
    if (!validateUbicacionData(req, res)) return;
    
    const { pais, region, ciudad } = req.body;
    
    db.query(
        'CALL actualizar_ubicacion(?, ?, ?, ?, ?)',
        [req.userId, req.params.id, pais, region, ciudad],
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            
            if (results[0][0].filas_afectadas === 0) {
                return res.status(404).json({ 
                    message: 'Ubicación no encontrada o sin cambios',
                    code: 'NOT_FOUND'
                });
            }
            
            res.json({
                success: true,
                message: 'Ubicación actualizada correctamente',
                data: { id: req.params.id, pais, region, ciudad }
            });
        }
    );
});

// Eliminar ubicación
router.delete('/:id', verifyToken, (req, res) => {
    db.query(
        'CALL eliminar_ubicacion(?, ?)',
        [req.userId, req.params.id],
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            
            if (results[0][0].filas_afectadas === 0) {
                return res.status(404).json({ 
                    message: 'Ubicación no encontrada',
                    code: 'NOT_FOUND'
                });
            }
            
            res.json({
                success: true,
                message: 'Ubicación eliminada correctamente',
                data: { id: req.params.id }
            });
        }
    );
});

module.exports = router;