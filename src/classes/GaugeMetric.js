const metricsSdk = require('../index');

/**
 * @class GaugeMetric
 * @description Gauge Metric using class based approach
 * Can Extend this class or use it directly
 * @example class SomeGaugeMetric extends GaugeMetric {}
 * class ExampleMetric extends GaugeMetric {
 * constructor(someData) {
 *  const labels = {
 *     someData,
 *   };
 *   super('metric_name', 'Description', labels);
 * }
 *}
 */
class GaugeMetric {
  constructor(name, description, labels) {
    this.name = name;
    this.description = description;
    this.labels = labels;
    this.value = 0;
  }

  increment(value = 1) {
    metricsSdk.gauge.inc(this.name, this.labels, value || this.value, this.description);
  }

  decrement(value = 1) {
    metricsSdk.gauge.dec(this.name, this.labels, value || this.value, this.description);
  }

  logMetric(value) {
    metricsSdk.gauge.set(this.name, this.labels, value || this.value, this.description);
  }
}

module.exports = GaugeMetric;
