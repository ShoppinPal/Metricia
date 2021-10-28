const moment = require('moment');
const promNodeWrapper = require('./prom-node');
const runServer = require('./server');

let projectPrefix = '';
function getMetricName(name, addProjectNamePrefix) {
  if (addProjectNamePrefix && projectPrefix) {
    return `${projectPrefix}_${name}`;
  }
  return name;
}

/**
 * Provide start and end time to add it to histogram
 * @param {Date} startDate
 * @param {Date} endDate
 */
function getTimeDiff(startDate, endDate) {
  const diffInSeconds = moment(endDate).diff(startDate, 'seconds', true);
  return diffInSeconds;
}

module.exports = {
  // Can at the entry pount of project to start metrics server
  startCollectingMetrics: (projectName, processName, collectSystemMetrics = false) => {
    projectPrefix = projectName;
    if (collectSystemMetrics) {
      promNodeWrapper.startCollection(`${projectName}_${processName}`);
    }
    return runServer();
  },
  counter: {
    create: (name, labels = {}, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      promNodeWrapper.createCounter(metricName, Object.keys(labels), description);
    },
    inc: (name, labels = {}, incrementValue, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      promNodeWrapper.incrementCounter(metricName, labels, incrementValue, description);
    },
  },
  gauge: {
    createWithCallback: (name, labelNames, description, callback, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      promNodeWrapper.createGauge(metricName, labelNames, description, callback);
    },
    create: (name, labels = {}, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      promNodeWrapper.createGauge(metricName, Object.keys(labels), description);
    },
    inc: (name, labels = {}, incrementValue, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      promNodeWrapper.incrementGauge(metricName, incrementValue, labels, description);
    },
    dec: (name, labels = {}, decrementValue, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      promNodeWrapper.decrementGauge(metricName, decrementValue, labels, description);
    },
    set: (name, labels = {}, value, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      promNodeWrapper.setGauge(metricName, value, labels, description);
    },
  },
  histogram: {
    getTimeDiff,
    getOrCreate: (name, labels, description, buckets, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      return promNodeWrapper.getOrCreate(metricName, labels, description, buckets);
    },
  },
};
