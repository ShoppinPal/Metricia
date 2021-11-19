const client = require('prom-client');

const { collectDefaultMetrics } = client;
const { register } = client;

const counters = {};
const gauges = {};
const histograms = {};

function startCollection(serviceName) {
  if(!/^[a-z0-9]*$/.test(serviceName)) {
    throw new Error('Metricia Invalid Parameter in startCollection: service name should only contain small alphabets');
  }
  collectDefaultMetrics({ register, prefix: `${serviceName}_` });
}

function createCounter(name, labelNames, description) {
  counters[name] = new client.Counter({
    name,
    labelNames,
    help: description || name.split('_').join(' '),
  });
}

function incrementCounter(name, labels, value, description) {
  if (!counters[name]) {
    createCounter(name, Object.keys(labels), description);
  }
  counters[name].labels(labels).inc(value);
}

function createGauge(name, labelNames, description, collectionCallback) {
  gauges[name] = new client.Gauge({
    name,
    labelNames,
    help: description || name.split('_').join(' '),
    async collect() {
      if (collectionCallback) {
        await collectionCallback(this);
      }
    },
  });
}

function incrementGauge(name, value, labels, description) {
  if (!gauges[name]) {
    createGauge(name, Object.keys(labels), description);
  }
  gauges[name].labels(labels).inc(value);
}

function decrementGauge(name, value, labels, description) {
  if (!gauges[name]) {
    createGauge(name, Object.keys(labels), description);
  }
  gauges[name].labels(labels).dec(value);
}

function setGauge(name, value, labels, description) {
  if (!gauges[name]) {
    createGauge(name, Object.keys(labels), description);
  }
  gauges[name].labels(labels).set(value);
}

/**
 * Starts a timer and returns a function to end teh timer
 * @returns {Function} endJob({ labels })
 */
function getOrCreate(name, labels, description, buckets) {
  if (!histograms[name]) {
    histograms[name] = new client.Histogram({
      name,
      buckets,
      labelNames: labels,
      help: description || name.split('_').join(' '),
    });
  }
  return histograms[name];
}

module.exports = {
  register,
  startCollection,
  createCounter,
  incrementCounter,
  createGauge,
  incrementGauge,
  decrementGauge,
  setGauge,
  getOrCreate,
};
