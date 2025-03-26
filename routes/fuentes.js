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

// Validación de datos para fuentes emisoras (CORREGIDO)
const validateFuenteEmisora = (req, res) => {
    const { nombre, sector, factor_emision } = req.body;
    const errors = [];
    const sectoresValidos = ['Transporte', 'Energía', 'Industria', 'Agricultura', 'Residuos', 'Otros'];
    
    if (!nombre) errors.push('El campo nombre es requerido');
    if (!sector) {
        errors.push('El campo sector es requerido');
    } else if (!sectoresValidos.includes(sector)) {
        errors.push(`Sector no válido. Valores permitidos: ${sectoresValidos.join(', ')}`);
    }
    if (factor_emision === undefined || factor_emision === null) {
        errors.push('El factor de emisión es requerido');
    } else if (isNaN(factor_emision)) {  // CORRECCIÓN: Paréntesis cerrado correctamente
        errors.push('El factor de emisión debe ser un número');
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

// Resto del código permanece igual...
router.get('/', verifyToken, (req, res) => {
    db.query('CALL listar_fuentes_emisoras(?)', [req.userId], (err, results) => {
        if (err) return handleProcedureError(err, res);
        res.json(results[0] || []);
    });
});

// ... (otros endpoints permanecen igual)

module.exports = router;