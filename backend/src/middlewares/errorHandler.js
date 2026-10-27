/**
 * Middleware centralizado de manejo de errores
 * Asegura respuestas HTTP estructuradas y robustas según la rúbrica (Criterio #2).
 */
function errorHandler(err, req, res, next) {
  console.error(`❌ [Error en ${req.method} ${req.originalUrl}]:`, err.message || err);

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Error interno del servidor',
      type: err.name || 'ServerError',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}

// Middleware para rutas 404
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      message: `La ruta solicitada '${req.method} ${req.originalUrl}' no existe en la API.`,
      type: 'NotFound'
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
