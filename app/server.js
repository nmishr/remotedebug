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

  const config = {
    endpoint: "https://nvm-cosmos.documents.azure.com:443/",
    key: "qzattpyaQA1ld8P2JY5fdIcbMWLdjY1mDh0ixkcY4eUzXUe4bXc5Bx4mKUnBZB7wrVyjlEeG6IdGTsbbcVn3ZA==",
    databaseId: "Tasks",
    containerId: "Items",
    partitionKey: { kind: "Hash", paths: ["/category"] }
  };

let telemClient = appInsights.defaultClient;
const express = require('express');

const CosmosClient = require("@azure/cosmos").CosmosClient;
const { endpoint, key, databaseId, containerId } = config;

const cosmosClient = new CosmosClient({ endpoint, key });
const database = cosmosClient.database(databaseId);
const container = database.container(containerId);

const PORT = 8081;
const HOST = '0.0.0.0';


const app = express();
// query to return all items
const querySpec = {
  query: "SELECT * from c"
};

app.get('/', async function(req, res) {
  
  var results = [];
  const { resources: items } = await container.items.query(querySpec).fetchAll();  

  items.forEach( item => {results.push( `${item.id} - ${item.description}`)}  )
     
  res.send(`<html><body><b>Hello World:</b><hr><ul><li> ${results.join("</li>\n<li>")} </li></ul></body></html>`);
  telemClient.trackEvent({ name: "CustomMessage 1", properties: { foo: "Bar" } });
  telemClient.flush();
});

// Make sure Tasks database is already setup. If not, create it.
create(cosmosClient, databaseId, containerId);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);


/*
// This script ensures that the database is setup and populated correctly
*/
async function create(client, databaseId, containerId) {
  const partitionKey = config.partitionKey;

  /**
   * Create the database if it does not exist
   */
  const { database } = await client.databases.createIfNotExists({ id: databaseId  });
  console.log(`Created database:\n${database.id}\n`);

  /**
   * Create the container if it does not exist
   */
  const { container } = await client.database(databaseId).containers.createIfNotExists(
      { id: containerId, partitionKey },
      { offerThroughput: 400 }
    );

  console.log(`Created container:\n${container.id}\n`);

  const { resources: items } = await container.items.query(querySpec).fetchAll();
      
  items.forEach(item => {console.log(`${item.id} - ${item.description}`)  }  )

}
