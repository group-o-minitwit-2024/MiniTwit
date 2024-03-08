const prometheus = require('prom-client');

// Initialize Prometheus metrics
prometheus.collectDefaultMetrics();

// Custom metric example
const customMetric = new prometheus.Counter({
  name: 'custom_metric_total',
  help: 'Total count of custom metric',
});

module.exports = { prometheus, customMetric };
