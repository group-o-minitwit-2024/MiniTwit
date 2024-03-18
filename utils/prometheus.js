const prometheus = require('prom-client');

// Initialize Prometheus metrics
prometheus.collectDefaultMetrics();

// Initialize Prometheus metrics
const httpRequestCounter = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'endpoint'],
});

const httpRequestDurationHistogram = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Histogram of response latency for HTTP requests',
  labelNames: ['method', 'endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5], // specify your desired bucket configuration
});

// Middleware to track HTTP requests
const prometheusMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Increment counter for each request
  httpRequestCounter.labels(req.method, req.path).inc();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    // Observe the duration of the request
    httpRequestDurationHistogram.labels(req.method, req.path).observe(duration / 1000); // Convert to seconds
  });

  next();
};

module.exports = { prometheus, prometheusMiddleware };
