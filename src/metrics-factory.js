const moment = require('moment');
const promNodeWrapper = require('./prom-node');
const runServer = require('./server');

let projectPrefix = '',
  processNamePrefix = '',
  configDefaultLabels = {};
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
  startCollectingMetrics: (
    projectName,
    processName,
    defaultLabels = {},
    collectSystemMetrics = false,
  ) => {
    projectPrefix = projectName;
    processNamePrefix = processName;
    configDefaultLabels = defaultLabels;
    if (collectSystemMetrics) {
      promNodeWrapper.startCollection(`${projectName}_${processName}`);
    }
    return runServer();
  },
  apiRequestMiddleware: (req, res, next) => {
    promNodeWrapper.apiMiddleware(projectPrefix, processNamePrefix)(req, res, next);
  },
  counter: {
    create: (name, labels = {}, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      labels = Object.assign({}, configDefaultLabels, labels);
      promNodeWrapper.createCounter(metricName, Object.keys(labels), description);
    },
    inc: (name, labels = {}, incrementValue, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      labels = Object.assign({}, configDefaultLabels, labels);
      promNodeWrapper.incrementCounter(metricName, labels, incrementValue, description);
    },
  },
  gauge: {
    createWithCallback: (
      name,
      labelNames = [],
      description,
      callback,
      addProjectNamePrefix = true,
    ) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      labelNames = labelNames.concat(configDefaultLabels);
      promNodeWrapper.createGauge(metricName, labelNames, description, callback);
    },
    create: (name, labels = {}, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      labels = Object.assign({}, configDefaultLabels, labels);
      promNodeWrapper.createGauge(metricName, Object.keys(labels), description);
    },
    inc: (name, labels = {}, incrementValue, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      labels = Object.assign({}, configDefaultLabels, labels);
      promNodeWrapper.incrementGauge(metricName, incrementValue, labels, description);
    },
    dec: (name, labels = {}, decrementValue, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      labels = Object.assign({}, configDefaultLabels, labels);
      promNodeWrapper.decrementGauge(metricName, decrementValue, labels, description);
    },
    set: (name, labels = {}, value, description, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      labels = Object.assign({}, configDefaultLabels, labels);
      promNodeWrapper.setGauge(metricName, value, labels, description);
    },
  },
  histogram: {
    getTimeDiff,
    getOrCreate: (name, labels, description, buckets, addProjectNamePrefix = true) => {
      const metricName = getMetricName(name, addProjectNamePrefix);
      labels = labels.concat(Object.keys(configDefaultLabels));
      return promNodeWrapper.getOrCreate(metricName, labels, description, buckets);
    },
  },
};
