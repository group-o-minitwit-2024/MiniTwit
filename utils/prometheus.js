const prometheus = require('prom-client');
const os = require('os-utils');

// Initialize Prometheus metrics
prometheus.collectDefaultMetrics();

const cpuGauge = new prometheus.Gauge({
  name: 'cpu_usage',
  help: 'Current load of the CPU in percent.',
});

const responseCounter = new prometheus.Counter({
  name: 'response_counter',
  help: 'The count of HTTP responses sent.',
});

const reqDurationSummary = new prometheus.Histogram({
  name: 'request_duration_summary',
  help: 'Request duration distribution.',
});

// Middleware to track HTTP requests
const prometheusMiddleware = async (req, res, next) => {
  // Ignore requests to /metrics
  if (req.path === '/metrics') {
    return next();
  }
  
  const startTime = Date.now();

  // Track CPU usage
  os.cpuUsage(function(v){
    cpuGauge.set(v);
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    responseCounter.inc();
    reqDurationSummary.observe(duration);
  });

  next();
};

module.exports = { prometheus, prometheusMiddleware };
