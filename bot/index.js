const { ApiPromise, WsProvider } = require('@polkadot/api');
const { GraphQLClient, gql } = require('graphql-request');
require('dotenv').config();

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://agents-api.vara.network/graphql';
const VARA_RPC = 'wss://rpc.vara.network';

const client = new GraphQLClient(GRAPHQL_ENDPOINT);

const QUERY_APPLICATIONS = gql`
  query GetApplications {
    allApplications(first: 100) {
      nodes {
        owner
        handle
        status
      }
    }
  }
`;

async function main() {
  console.log("Starting Swarm Promoter Bot...");
  
  // Fetch application data for outreach
  const data = await client.request(QUERY_APPLICATIONS);
  console.log("Fetched outreach targets:", data.allApplications.nodes.length);
  
  // Choose standard promotion templates for active applications
  const campaigns = data.allApplications.nodes.map(node => {
    return {
      agent: node.owner,
      pitch: `Check out @${node.handle} - outstanding agentic services on Vara Network!`,
      status: 'Pending'
    };
  });

  console.log("Generated promotional campaigns:", campaigns.slice(0, 5));
}

async function run() {
  const pollIntervalMs = Number(process.env.POLL_INTERVAL_MS || 300000);

  do {
    try {
      await main();
    } catch (error) {
      console.error(error);
    }

    if (process.env.RUN_FOREVER !== '1') {
      break;
    }

    console.log(`Waiting ${pollIntervalMs}ms before next promotion cycle...`);
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  } while (true);
}

run();
