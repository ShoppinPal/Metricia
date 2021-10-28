# Metricia

> To be used with Express server for metrics reporting

## Motivation

- To abstract away any sdk/service
- Provide a consistent API for metrics reporting
- TODO : update more

## Initialization

- define PORT in enviornment variable to change it (default: 9000)
- Import the package in your application entrypoint file (app.js / index.js)
- ```
  const { server: expressServerInstance } = metricsSdk.startCollectingMetrics(
      <application_name>, // user-management-service
      <service_name>, // fetch-users-worker
      <report_nodejs_metrics>, // boolean - Should the basic nodejs metrics be sent
    );
  ```

## Functional Approach

### _Counter:_

- increment

```
  metricsSdk.counter.inc(<counter_name>, <map_of_labels> , <increment_value>, <description_of_metrics: optional>);
```

### _Gauge:_

- increment: increment gauge value

```
  metricsSdk.gauge.inc(<counter_name>, <map_of_labels> , <increment_value>, <description_of_metrics: optional>);
```

- decrement: decrement gauge value

```
  metricsSdk.gauge.dec(<counter_name>, <map_of_labels> , <decrement_value>, <description_of_metrics: optional>);
```

- set value : set gauge value

```
  metricsSdk.gauge.dec(<counter_name>, <map_of_labels> , <value>, <description_of_metrics: optional>);
```

- createWithCallback: get values when the metrics are scrapped

```
  metricsSdk.gauge.createWithCallback('metrics_name', ['label1', 'label2], async (gauge) => {
    const values = await getData();
    gauge.labels({ label1: value, label2: value }).set(values.value1);
    gauge.labels({ label1: value, label2: value }).set(values.value2);
  });
```

### _Histogram_

```
const histogram = metricsSdk.histogram.getOrCreate(
      this.name,
      this.labelNames,
      this.description,
      this.buckets,
      prependProjectName,
    );
histogram.labels(this.labels).observe(value)
```

## Class based approach

### For Counter & Gauge:

```
const { CounterMetric, CalculateTimeMetric } = require('metricsSdk/classes');

class YourCustomMetricName extends CounterMetric {
  constructor(label1, label2) {
    const labels = {
      label1,
      label2,
    };
    super('custom_metric_name', 'Metric Description', labels);
  }
}

new YourCustomMetricName(value1, value2).logMetric(1);

```

### For Histogram

```
class SomeTaskTimeTakenMetric extends CalculateTimeMetric {
  constructor(label1, label2) {
    const labels = {
      label1,
      label2,
    };
    super(
      'some_task_time_taken_metric',
      'Description',
      [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10, 20, 30, 60, 300, 600, 1200, 1800, 3600],
      labels,
    );
  }
}
```

#### Histogram logging

Method 1:

```
      new SomeTaskTimeTakenMetric(CONFIG.BULL_QUEUE.ORDERS_QUEUE).logMetric(
        startDate,
        endDate,
      );
```

Method 2:

```
        const someJobTimeMetric = new SomeTaskTimeTakenMetric(
          value1,
          value2,
        );
        someJobTimeMetric.startTask();
        // Perform task
        someJobTimeMetric.endTask();
```
