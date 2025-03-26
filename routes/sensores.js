const express = require('express');
const db = require('../config/db');
const verifyToken = require('../config/verify');
const path = require('path');
const { exec } = require('child_process');
const router = express.Router();

function actualizarMapaSensores() {
    const rutaScript = path.join(__dirname, '../views/admin_dash/sensores/sensores.py');

    exec(`python "${rutaScript}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al ejecutar sensores.py: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Salida de error de sensores.py: ${stderr}`);
            return;
        }
        console.log(`Mapa de sensores actualizado:\n${stdout}`);
    });
}

// Obtener todos los sensores
router.get('/', verifyToken, async (req, res) => {
    try {
        const [results] = await db.promise().query('CALL listar_sensores(?)', [req.user.id]);
        
        if (!results || !results[0]) {
            return res.status(500).json({ error: 'Estructura de datos inesperada' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error al listar sensores:', err);
        res.status(500).json({ 
            error: err.sqlMessage || 'Error al obtener sensores',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Obtener sensor por ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [results] = await db.promise().query('CALL buscar_sensor(?, ?)', [req.user.id, req.params.id]);
        
        if (results[0].length === 0) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }

        res.json(results[0][0]);
    } catch (err) {
        console.error('Error al buscar sensor:', err);
        res.status(500).json({ 
            error: err.sqlMessage || 'Error al buscar sensor',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Crear un nuevo sensor
router.post('/', verifyToken, async (req, res) => {
    const { nombre_sensor, id_ubicacion, latitud, longitud } = req.body;

    // Validación básica
    if (!nombre_sensor || !latitud || !longitud) {
        return res.status(400).json({ message: 'Nombre, latitud y longitud son requeridos' });
    }

    try {
        const [results] = await db.promise().query(
            'CALL insertar_sensor(?, ?, ?, ?, ?)', 
            [req.user.id, nombre_sensor, id_ubicacion || null, longitud, latitud]
        );

        res.status(201).json({
            message: 'Sensor agregado correctamente',
            sensorId: results[0][0].nuevo_id,
            creadoPor: req.user.nombre  // Agregamos información del creador
        });

        actualizarMapaSensores();
    } catch (err) {
        console.error('Error al crear sensor:', err);
        res.status(500).json({ 
            error: err.sqlMessage || 'Error al crear el sensor',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Editar sensor por ID
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nombre_sensor, id_ubicacion, latitud, longitud } = req.body;

    try {
        const [results] = await db.promise().query(
            'CALL actualizar_sensor(?, ?, ?, ?, ?, ?)', 
            [req.user.id, id, nombre_sensor, id_ubicacion || null, longitud, latitud]
        );

        if (results[0][0].filas_afectadas === 0) {
            return res.status(404).json({ message: 'Sensor no encontrado o sin cambios' });
        }

        res.json({ 
            message: 'Sensor actualizado correctamente',
            modificadoPor: req.user.nombre  // Agregamos información del editor
        });

        actualizarMapaSensores();
    } catch (err) {
        console.error('Error al actualizar sensor:', err);
        res.status(500).json({ 
            error: err.sqlMessage || 'Error al actualizar el sensor',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Eliminar sensor por ID (eliminación lógica)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const [results] = await db.promise().query(
            'CALL eliminar_sensor(?, ?)', 
            [req.user.id, req.params.id]
        );

        if (results[0][0].filas_afectadas === 0) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }

        res.json({ 
            message: 'Sensor marcado como eliminado correctamente',
            eliminadoPor: req.user.nombre  // Agregamos información de quién lo eliminó
        });

        actualizarMapaSensores();
    } catch (err) {
        console.error('Error al eliminar sensor:', err);
        res.status(500).json({ 
            error: err.sqlMessage || 'Error al eliminar el sensor',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;