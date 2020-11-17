'use strict';
let appInsights = require('applicationinsights');
appInsights.setup('c1805768-a77c-48ba-b424-c992f24bc7dc')
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true)
  .setUseDiskRetryCaching(true)
  .setSendLiveMetrics(true)
  .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
  .start();

let client = appInsights.defaultClient;
const express = require('express');

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.get('/', (req, res) => {
  res.send('Hello world\n');
  client.trackEvent({ name: "CustomMessage 1", properties: { foo: "Bar" } });
  client.flush();
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);