/**
 * Servidor Principal Express
 * Proyecto: App de Gastos Compartidos (Estilo Splitwise Simplificado)
 * Programa: Análisis y Desarrollo de Software - SENA
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const { connectDatabase } = require('./config/database');
const requestLogger = require('./middlewares/requestLogger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const apiRoutes = require('./routes');

const app = express();

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================
// Configuración de CORS segura para producción y desarrollo local
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Servir frontend compilado / archivos estáticos de la aplicación
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// ==========================================
// RUTAS DE LA API
// ==========================================
app.use('/api', apiRoutes);

// Fallback SPA para la interfaz web (cualquier ruta GET que no empiece por /api sirve index.html)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(publicPath, 'index.html'));
  }
  next();
});

// Manejadores de error
app.use(notFoundHandler);
app.use(errorHandler);

// ==========================================
// INICIALIZACIÓN DEL SERVIDOR
// ==========================================
async function startServer() {
  await connectDatabase();

  const server = app.listen(config.port, () => {
    console.log('\n======================================================');
    console.log('🚀 SERVIDOR SPLITWISE SENA INICIADO CORRECTAMENTE');
    console.log('======================================================');
    console.log(`🌐 Aplicación Web:    http://localhost:${config.port}`);
    console.log(`📡 API REST:          http://localhost:${config.port}/api`);
    console.log(`🩺 Health Check:      http://localhost:${config.port}/api/health`);
    console.log(`📁 Entorno:           ${config.env}`);
    console.log('======================================================\n');
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
