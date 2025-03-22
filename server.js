const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
const db = require('./config/db'); // Importamos la conexión a la base de datos

// Inicializar la aplicación
const app = express();

// Middleware para analizar cookies HTTP-only
app.use(cookieParser());

// Middleware para analizar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Configuración avanzada de CORS para permitir cookies en las solicitudes
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true, // Permitir cookies en la solicitud
    allowedHeaders: ['Content-Type', 'Authorization'], // Permitir estos encabezados en las solicitudes
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
}));

// Servir archivos estáticos desde la carpeta 'views'
app.use(express.static(path.join(__dirname, 'views')));

// Ruta para servir el login por defecto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login', 'login.html'));
});

// Importar rutas
const authRoutes = require('./routes/autorizacion');
const userRoutes = require('./routes/usuarios');
const geiRoutes = require('./routes/gei');
const fuentesRoutes = require('./routes/fuentes');
const ubicacionesRoutes = require('./routes/ubicaciones');
const emisionesRoutes = require('./routes/emisiones');
const auditoriaRoutes = require('./routes/auditoria');
const sensoresRoutes = require('./routes/sensores');

// Usar las rutas
app.use('/api/auth', authRoutes);
app.use('/api/gei', geiRoutes);
app.use('/api/fuentes', fuentesRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);
app.use('/api/emisiones', emisionesRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/sensores', sensoresRoutes);
app.use(express.static(path.join(__dirname, 'public')));
// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

// Manejar señales de cierre (SIGINT y SIGTERM)
process.on('SIGINT', () => {
    console.log('🛑 Cierre detectado, liberando recursos...');
    db.end(() => {
        console.log('🔌 Conexión a la base de datos cerrada.');
        server.close(() => process.exit(0));
    });
});

process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recibido, cerrando servidor...');
    db.end(() => {
        console.log('🔌 Conexión a la base de datos cerrada.');
        server.close(() => process.exit(0));
    });
});
