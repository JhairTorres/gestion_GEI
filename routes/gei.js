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

// Validación de datos para tipos de gas
const validateTipoGas = (req, res) => {
    const { nombre, potencial_calentamiento_global } = req.body;
    const errors = [];
    
    if (!nombre) errors.push('El campo nombre es requerido');
    if (potencial_calentamiento_global === undefined || potencial_calentamiento_global === null) {
        errors.push('El potencial de calentamiento global es requerido');
    }
    
    if (errors.length > 0) {
        res.status(400).json({ 
            errors,
            code: 'VALIDATION_ERROR'
        });
        return false;
    }
    return true;
};

// Obtener todos los tipos de gas (todos los roles)
router.get('/', verifyToken, (req, res) => {
    db.query('CALL listar_tipos_gas(?)', [req.userId], (err, results) => {
        if (err) return handleProcedureError(err, res);
        res.json(results[0] || []);
    });
});

// Obtener un tipo de gas por ID (todos los roles)
router.get('/:id', verifyToken, (req, res) => {
    db.query('CALL buscar_tipo_gas(?, ?)', 
        [req.userId, req.params.id], 
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            if (!results[0] || results[0].length === 0) {
                return res.status(404).json({ 
                    message: 'Tipo de gas no encontrado',
                    code: 'NOT_FOUND'
                });
            }
            res.json(results[0][0]);
        }
    );
});

// Agregar un nuevo tipo de gas (admin y usuario)
router.post('/', verifyToken, (req, res) => {
    if (!validateTipoGas(req, res)) return;
    
    const { nombre, descripcion, potencial_calentamiento_global } = req.body;
    
    db.query(
        'CALL insertar_tipo_gas(?, ?, ?, ?)',
        [req.userId, nombre, descripcion || '', potencial_calentamiento_global],
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            
            res.status(201).json({
                success: true,
                message: 'Tipo de gas agregado correctamente',
                data: {
                    id: results[0][0].nuevo_id,
                    nombre,
                    descripcion,
                    potencial_calentamiento_global
                }
            });
        }
    );
});

// Actualizar un tipo de gas (admin y usuario)
router.put('/:id', verifyToken, (req, res) => {
    if (!validateTipoGas(req, res)) return;
    
    const { nombre, descripcion, potencial_calentamiento_global } = req.body;
    
    db.query(
        'CALL actualizar_tipo_gas(?, ?, ?, ?, ?)',
        [req.userId, req.params.id, nombre, descripcion || '', potencial_calentamiento_global],
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            
            if (results[0][0].filas_afectadas === 0) {
                return res.status(404).json({ 
                    message: 'Tipo de gas no encontrado o sin cambios',
                    code: 'NOT_FOUND'
                });
            }
            
            res.json({
                success: true,
                message: 'Tipo de gas actualizado correctamente',
                data: { 
                    id: req.params.id,
                    nombre,
                    descripcion,
                    potencial_calentamiento_global
                }
            });
        }
    );
});

// Eliminar un tipo de gas (solo admin)
router.delete('/:id', verifyToken, (req, res) => {
    db.query(
        'CALL eliminar_tipo_gas(?, ?)',
        [req.userId, req.params.id],
        (err, results) => {
            if (err) return handleProcedureError(err, res);
            
            if (results[0][0].filas_afectadas === 0) {
                return res.status(404).json({ 
                    message: 'Tipo de gas no encontrado',
                    code: 'NOT_FOUND'
                });
            }
            
            res.json({
                success: true,
                message: 'Tipo de gas eliminado correctamente',
                data: { id: req.params.id }
            });
        }
    );
});

module.exports = router;