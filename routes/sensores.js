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
            console.error(` Error al ejecutar sensores.py: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(` Salida de error de sensores.py: ${stderr}`);
            return;
        }
        console.log(`Mapa de sensores actualizado:\n${stdout}`);
    });
}


// Obtener todos los sensores
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT id, nombre_sensor, id_ubicacion, ST_AsText(ubicacion_geografica) AS ubicacion_geografica FROM sensores', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener sensor por ID
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query('SELECT id, nombre_sensor, id_ubicacion, ST_AsText(ubicacion_geografica) AS ubicacion_geografica FROM sensores WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Sensor no encontrado' });

        res.json(results[0]);
    });
});

// Crear un nuevo sensor
router.post('/', verifyToken, (req, res) => {
    const { nombre_sensor, id_ubicacion, latitud, longitud } = req.body;

    if (!nombre_sensor || !latitud || !longitud) {
        return res.status(400).json({ message: 'nombre_sensor, latitud y longitud son requeridos' });
    }

    const punto = `POINT(${longitud} ${latitud})`;

    db.query(
        'INSERT INTO sensores (nombre_sensor, id_ubicacion, ubicacion_geografica) VALUES (?, ?, ST_GeomFromText(?))',
        [nombre_sensor, id_ubicacion || null, punto],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                message: 'Sensor agregado correctamente',
                sensorId: result.insertId
            });
        }
    );
});

// Editar sensor por ID
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre_sensor, id_ubicacion, latitud, longitud } = req.body;

    if (!nombre_sensor || !latitud || !longitud) {
        return res.status(400).json({ message: 'nombre_sensor, latitud y longitud son requeridos' });
    }

    const punto = `POINT(${longitud} ${latitud})`;

    db.query(
        'UPDATE sensores SET nombre_sensor = ?, id_ubicacion = ?, ubicacion_geografica = ST_GeomFromText(?) WHERE id = ?',
        [nombre_sensor, id_ubicacion || null, punto, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Sensor no encontrado' });

            res.json({ message: 'Sensor actualizado correctamente' });
        }
    );
});

// Eliminar sensor por ID
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM sensores WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Sensor no encontrado' });

        res.json({ message: 'Sensor eliminado correctamente' });
    });
});

module.exports = router;
actualizarMapaSensores();
