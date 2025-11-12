const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * PUBLIC_INTERFACE
 * setupProxy configures development-time HTTP proxies for Create React App.
 * - Adds a simple /health endpoint that returns 200 OK for readiness checks.
 * - Optionally proxies API calls to a backend specified by REACT_APP_BACKEND_URL.
 *
 * This is only used in development by react-scripts.
 *
 * Environment variables:
 * - REACT_APP_HEALTHCHECK_PATH: Path for healthcheck; defaults to '/health'
 * - REACT_APP_BACKEND_URL: Backend URL to proxy /api to (e.g. http://localhost:8000)
 * - REACT_APP_TRUST_PROXY: If 'true', sets app.set('trust proxy', 1) for accurate IPs behind proxies.
 */
module.exports = function (app) {
  const healthPath = process.env.REACT_APP_HEALTHCHECK_PATH || '/health';
  const trustProxy = String(process.env.REACT_APP_TRUST_PROXY || '').toLowerCase() === 'true';
  if (trustProxy && typeof app.set === 'function') {
    // In CRA dev server, app is an Express instance
    app.set('trust proxy', 1);
  }

  // Lightweight healthcheck endpoint
  app.get(healthPath, (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'mytv_frontend',
      host: process.env.HOST || '0.0.0.0',
      port: process.env.PORT || '3000',
      timestamp: new Date().toISOString(),
    });
  });

  // Optional backend proxy for API during development
  const backendTarget = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE;
  if (backendTarget) {
    app.use(
      '/api',
      createProxyMiddleware({
        target: backendTarget,
        changeOrigin: true,
        secure: false,
        logLevel: process.env.REACT_APP_LOG_LEVEL || 'warn',
        pathRewrite: { '^/api': '/api' },
      }),
    );
  }
};
