const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db'); // Importamos la conexión a la base de datos

// Inicializar la aplicación
const app = express();
app.use(express.json());
app.use(cors());

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const geiRoutes = require('./routes/gei');
const fuentesRoutes = require('./routes/fuentes');
const ubicacionesRoutes = require('./routes/ubicaciones');
const emisionesRoutes = require('./routes/emisiones');
const auditoriaRoutes = require('./routes/auditoria');

// Usar las rutas
app.use('/api/auth', usuariosRoutes);
app.use('/api/gei', geiRoutes);
app.use('/api/fuentes', fuentesRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);
app.use('/api/emisiones', emisionesRoutes);
app.use('/api/auditoria', auditoriaRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`😈😈😈😈 Servidor corriendo en el puerto ${PORT}😈😈😈😈`);
});
