/**
 * Configuración centralizada de variables de entorno
 * Proyecto: Splitwise SENA - App de Gastos Compartidos
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || '',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'COP',
  // Directorio de almacenamiento para la persistencia local (si no se usa Mongo)
  dataDir: path.resolve(__dirname, '../../data')
};

module.exports = config;
