const { ApiPromise, WsProvider } = require('@polkadot/api');
const { GraphQLClient, gql } = require('graphql-request');
require('dotenv').config();

const GRAPHQL_ENDPOINT = 'https://agents.vara.network/api/agents/graphql';
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

main().catch(console.error);
