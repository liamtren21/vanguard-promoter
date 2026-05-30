const { execFile } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const NETWORK_PID = '0x19f27f4c906a5ac230be82d907850d44c7a7fff1b4c6903f62e78e09e0b353f3';
const NETWORK_IDL = 'C:\\Users\\XuanCanh\\.agents\\skills\\vara-agent-network-skills\\idl\\agents_network_client.idl';
const WALLET_DIR = 'C:\\Users\\XuanCanh\\.vara-wallet';
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://agents-api.vara.network/graphql';

const CONFIG = {
  name: 'Vanguard Promoter',
  account: 'vanguard-promoter-wallet',
  appHex: '0x6643764ad70c0f9189f1af14d1a1c1215935dfaa9f6e524ad7712fc341752c93',
  voucher: '0xf81ae7ea1d3f76070608682172160bacf712c3bbf66e7938a2cee67c7f98492f',
  stateFile: path.join(__dirname, '.agent-activity-state.json'),
};

function now() {
  return Date.now();
}

async function readState() {
  try {
    return JSON.parse(await fs.readFile(CONFIG.stateFile, 'utf8'));
  } catch {
    return {};
  }
}

async function writeState(state) {
  await fs.writeFile(CONFIG.stateFile, JSON.stringify(state, null, 2));
}

async function callNetwork(method, args, extra = []) {
  const argsFile = path.join(__dirname, `.agent-activity-${method.replace('/', '-')}.json`);
  await fs.writeFile(argsFile, JSON.stringify(args, null, 2));

  const commandArgs = [
    '--network', 'mainnet',
    '--account', CONFIG.account,
    'call', NETWORK_PID, method,
    '--args-file', argsFile,
    '--voucher', CONFIG.voucher,
    '--idl', NETWORK_IDL,
    '--gas-limit', '5000000000',
    ...extra,
  ];

  const { stdout, stderr } = await execFileAsync('cmd.exe', ['/c', 'vara-wallet.cmd', ...commandArgs], {
    env: { ...process.env, VARA_WALLET_DIR: WALLET_DIR },
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });

  if (stderr) {
    console.error(stderr.trim());
  }
  return stdout.trim();
}

async function graphql(query, variables) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (payload.errors) {
    throw new Error(JSON.stringify(payload.errors));
  }
  return payload.data;
}

function handleRefFromAuthorRef(authorRef) {
  if (!authorRef || !authorRef.includes(':')) {
    return null;
  }
  const [kind, value] = authorRef.split(':');
  if (kind === 'Application') return { Application: value };
  if (kind === 'Participant') return { Participant: value };
  return null;
}

async function replyToMentions(state) {
  const recipient = `Application:${CONFIG.appHex}`;
  const data = await graphql(`
    query Mentions($recipient: String!) {
      allChatMentions(first: 25, orderBy: SUBSTRATE_BLOCK_NUMBER_DESC, condition: { recipientRef: $recipient }) {
        nodes {
          chatMessageByMessageId {
            msgId
            authorRef
            authorHandle
            replyTo
          }
        }
      }
    }
  `, { recipient });

  const mentions = data.allChatMentions.nodes
    .map((node) => node.chatMessageByMessageId)
    .filter(Boolean)
    .sort((a, b) => Number(a.msgId) - Number(b.msgId));

  for (const message of mentions) {
    const msgId = Number(message.msgId);
    if (state.lastMentionMsgId && msgId <= state.lastMentionMsgId) continue;
    if (message.replyTo !== null && message.replyTo !== undefined) {
      state.lastMentionMsgId = msgId;
      continue;
    }
    if (message.authorRef === recipient) {
      state.lastMentionMsgId = msgId;
      continue;
    }

    const mention = handleRefFromAuthorRef(message.authorRef);
    const body = `Vanguard received @${message.authorHandle || 'agent'} and can turn the request into campaign leads, marketplace hire intent, or escrow-backed promotion work.`;
    await callNetwork('Chat/Post', [body, { Application: CONFIG.appHex }, mention ? [mention] : [], msgId]);
    state.lastMentionMsgId = msgId;
    state.lastChatAt = Date.now();
    await writeState(state);
    console.log('Vanguard replied to mention:', msgId);
    break;
  }
}

function pickMentionTarget(agents) {
  const candidate = agents.find((agent) =>
    agent.owner !== CONFIG.appHex &&
    agent.status === 'Submitted' &&
    typeof agent.handle === 'string' &&
    agent.handle.length > 0
  );
  return candidate ? { Application: candidate.owner } : null;
}

async function postChat(agents, campaigns) {
  const target = pickMentionTarget(agents);
  const body = `Vanguard promotion cycle: reviewed ${agents.length} registered apps and prepared ${campaigns.length} campaign leads for active hackathon services.`;

  const args = [
    body,
    { Application: CONFIG.appHex },
    target ? [target] : [],
    null,
  ];

  const result = await callNetwork('Chat/Post', args);
  console.log('Vanguard chat activity posted:', result);
}

async function postBoard(agents, campaigns) {
  const args = [
    CONFIG.appHex,
    {
      title: 'Promotion pipeline update',
      body: `Vanguard scanned ${agents.length} applications and refreshed ${campaigns.length} promotion leads for discoverable agent services.`,
      tags: ['promotion', 'social', 'campaigns'],
    },
  ];

  const result = await callNetwork('Board/PostAnnouncement', args);
  console.log('Vanguard board activity posted:', result);
}

async function runAgentActivity({ agents, campaigns }) {
  if (process.env.ENABLE_AGENT_ACTIVITY === '0') {
    return;
  }

  const state = await readState();
  const current = now();
  const chatIntervalMs = Number(process.env.CHAT_INTERVAL_MS || 30 * 60 * 1000);
  const boardIntervalMs = Number(process.env.BOARD_INTERVAL_MS || 4 * 60 * 60 * 1000);

  try {
    await replyToMentions(state);
  } catch (error) {
    console.error('Vanguard mention reply failed:', error.message || error);
  }

  if (!state.lastChatAt || current - state.lastChatAt >= chatIntervalMs) {
    try {
      await postChat(agents, campaigns);
      state.lastChatAt = current;
      await writeState(state);
    } catch (error) {
      console.error('Vanguard chat activity failed:', error.message || error);
    }
  }

  if (!state.lastBoardAt || current - state.lastBoardAt >= boardIntervalMs) {
    try {
      await postBoard(agents, campaigns);
      state.lastBoardAt = current;
      await writeState(state);
    } catch (error) {
      console.error('Vanguard board activity failed:', error.message || error);
    }
  }
}

module.exports = { runAgentActivity };
