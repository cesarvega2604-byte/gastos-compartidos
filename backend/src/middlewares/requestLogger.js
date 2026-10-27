/**
 * Middleware de registro de peticiones (Logging)
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const icon = status >= 400 ? '⚠️' : '⚡';
    console.log(`${icon} [${new Date().toLocaleTimeString()}] ${method} ${originalUrl} -> ${status} (${duration}ms)`);
  });

  next();
}

module.exports = requestLogger;
