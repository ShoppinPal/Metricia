const express = require('express');
const logger = require('node-utils/logger')(__filename);
const promNodeWrapper = require('./prom-node');
const { HeartBeatResponse } = require('./heartbeat-response');

function healthCheckResponseHandler(success, res) {
  if (success) {
    res.status(200).send(new HeartBeatResponse('healthy', process.uptime()));
  } else {
    res.status(500).send(new HeartBeatResponse('unhealthy', process.uptime()));
  }
}

function runServer(checkMongoInHealth = false) {
  const app = express();
  const PORT = process.env.METRICS_PORT || 9000;

  app.get('/metrics', async (req, res, next) => {
    try {
      res.set('Content-Type', promNodeWrapper.register.contentType);
      res.end(await promNodeWrapper.register.metrics());
    } catch (error) {
      next(error);
    }
  });

  app.get('/health/heartbeat', (req, res, next) => {
    try {
      // Check for mongo db connectivity
      if (checkMongoInHealth) {
        const mongoose = require('mongoose');
        const CONNECTED = 1;
        const mongooseReady = mongoose.connection.readyState;
        const mongooseConnected = mongooseReady === CONNECTED;
        healthCheckResponseHandler(mongooseConnected, res);
      } else {
        healthCheckResponseHandler(true, res);
      }
    } catch (e) {
      next(e);
    }
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _) => {
    logger.error({
      message: 'Error While serving metrics request',
      error: err,
    });
    res.status(500).send();
  });

  const server = app.listen(PORT, async () => {
    logger.info(`Listening for Requests for metrics collection on PORT : ${PORT}`);
  });
  return { server, app };
}

module.exports = runServer;
