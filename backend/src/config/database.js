/**
 * Conexión a la Base de Datos
 * Soporta conexión a MongoDB Atlas y modo de persistencia local resiliente.
 */
const mongoose = require('mongoose');
const config = require('./env');

let isConnectedToMongo = false;

async function connectDatabase() {
  if (config.mongoUri && config.mongoUri.trim() !== '') {
    try {
      console.log('🔄 Intentando conectar con MongoDB Atlas...');
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      isConnectedToMongo = true;
      console.log('✅ Conexión exitosa a MongoDB Atlas');
      return true;
    } catch (error) {
      console.warn(`⚠️ No se pudo conectar a MongoDB Atlas (${error.message}).`);
      console.log('📁 Activando motor de persistencia local (data/db.json) para garantizar funcionamiento continuo.');
      isConnectedToMongo = false;
      return false;
    }
  } else {
    console.log('ℹ️ MONGODB_URI no configurado en .env.');
    console.log('📁 Operando con motor de persistencia local (data/db.json). Datos 100% persistentes en disco.');
    return false;
  }
}

function isMongoConnected() {
  return isConnectedToMongo && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  isMongoConnected
};
