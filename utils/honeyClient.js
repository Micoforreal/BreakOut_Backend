const { createEdgeClient } = require('@honeycomb-protocol/edge-client');


const API_URL = "https://edge.test.honeycombprotocol.com/";



const client = createEdgeClient(API_URL, true);

module.exports = client;