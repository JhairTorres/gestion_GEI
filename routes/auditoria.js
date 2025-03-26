const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');

const router = express.Router();

// Manejo centralizado de errores de procedimientos
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

// Validación de datos para auditoría
const validateAuditoria = (req, res) => {
    const { usuario_id, accion, fecha } = req.body;
    const errors = [];
    
    if (!usuario_id) errors.push('El ID de usuario es requerido');
    if (!accion) errors.push('La acción es requerida');
    if (!fecha) errors.push('La fecha es requerida');
    else if (isNaN(Date.parse(fecha))) errors.push('La fecha no tiene un formato válido');
    
    if (errors.length > 0) {
        res.status(400).json({ 
            errors,
            code: 'VALIDATION_ERROR'
        });
        return false;
    }
    return true;
};

// Obtener todos los registros de auditoría (solo admin y auditor)
router.get('/', verifyToken, (req, res) => {
    db.query('CALL listar_auditorias(?)', [req.userId], (err, results) => {
        if (err) return handleProcedureError(err, res);
        res.json(results[0] || []);
    });
});

// Obtener un registro de auditoría por ID (solo admin y auditor)
router.get('/:id', verifyToken, (req, res) => {
    db.query('CALL buscar_auditoria(?, ?)', 
        [req.userId, req.params.id], 
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            if (!results[0] || results[0].length === 0) {
                return res.status(404).json({ 
                    message: 'Registro de auditoría no encontrado',
                    code: 'NOT_FOUND'
                });
            }
            res.json(results[0][0]);
        }
    );
});

// Registrar una nueva acción en la auditoría (solo admin)
router.post('/', verifyToken, (req, res) => {
    if (!validateAuditoria(req, res)) return;
    
    const { usuario_id, accion, fecha, detalles } = req.body;
    
    db.query(
        'CALL insertar_auditoria(?, ?, ?, ?)',
        [req.userId, accion, fecha, detalles || ''],
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            
            res.status(201).json({
                success: true,
                message: 'Acción registrada en auditoría',
                data: {
                    id: results[0][0].nuevo_id,
                    usuario_id,
                    accion,
                    fecha
                }
            });
        }
    );
});

// Actualizar un registro de auditoría (solo admin)
router.put('/:id', verifyToken, (req, res) => {
    if (!validateAuditoria(req, res)) return;
    
    const { usuario_id, accion, fecha, detalles } = req.body;
    
    db.query(
        'CALL actualizar_auditoria(?, ?, ?, ?, ?)',
        [req.userId, req.params.id, accion, fecha, detalles || ''],
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            
            if (results[0][0].filas_afectadas === 0) {
                return res.status(404).json({ 
                    message: 'Registro de auditoría no encontrado o sin cambios',
                    code: 'NOT_FOUND'
                });
            }
            
            res.json({
                success: true,
                message: 'Registro de auditoría actualizado correctamente',
                data: { 
                    id: req.params.id,
                    usuario_id,
                    accion,
                    fecha
                }
            });
        }
    );
});

// Eliminar un registro de auditoría (solo admin)
router.delete('/:id', verifyToken, (req, res) => {
    db.query(
        'CALL eliminar_auditoria(?, ?)',
        [req.userId, req.params.id],
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            
            if (results[0][0].filas_afectadas === 0) {
                return res.status(404).json({ 
                    message: 'Registro de auditoría no encontrado',
                    code: 'NOT_FOUND'
                });
            }
            
            res.json({
                success: true,
                message: 'Registro de auditoría eliminado correctamente',
                data: { id: req.params.id }
            });
        }
    );
});

module.exports = router;