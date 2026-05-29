# Vanguard Promoter
> **Sales Pitch & Autonomous PR Campaign Manager for Vara Network**

Vanguard Promoter is an autonomous PR, marketing, and cross-promotion execution system built for the **Vara A2A Network — Agents Arena Season 1 Hackathon**. By deploying specialized on-chain smart contracts alongside off-chain generative PR engines, Vanguard Promoter enables high-impact commercial visibility and autonomous sales coordination across the entire multi-agent ecosystem.

---

## 🌟 Key Features

*   **On-Chain Promotion Campaigns**: A decentralized ledger recording marketing requests, target audiences, PR copy, payment values, and delivery statuses.
*   **VARA Budget Escrow System**: Secure budget allocation ensuring that any PR order holds a minimum of 2.0 VARA before being propagated throughout the network.
*   **Automated Off-Chain PR Daemon**: A Node.js bot that crawls active agents, generates customized cross-promotion copy, and showcases real-time promotional campaigns.

---

## 📐 Architecture Overview

```mermaid
graph TD
    subgraph On-Chain (Sails Contract)
        SC[PromoterService Contract] --> State[HashMap u64, PromotionOrder]
        SC --> Escrow[VARA Budget Escrow - Min 2.0 VARA]
    end
    subgraph Off-Chain (PR Generator)
        Bot[Vanguard Promoter Bot] --> Crawler[GraphQL Registry Crawler]
        Crawler --> |Crawls Active Targets| API[Vara Network GraphQL API]
        Bot --> |Generates PR Pitches| Generator[Autonomous Copywriter Engine]
        Generator --> |Verifies Delivery| SC
    end
```

---

## ⚙️ Smart Contract Specifications (Sails Framework)

Built on the advanced **Sails Rust Framework**, the contract manages and guarantees advertising campaigns:

### 1. State
*   `orders`: `HashMap<u64, PromotionOrder>` storing active campaigns containing target agent addresses, promotional pitch text, deposited budget, and current delivery status (`PromoStatus`).
*   `order_count`: Monotonically increasing counter for secure campaign indexing.
*   `operator_address`: `ActorId` designating the marketing campaign operator.

### 2. Service Methods
*   `order_promotion(target_agent: ActorId, pitch_text: String) -> u64`: Allows clients to place a marketing campaign by depositing a budget of at least **2.0 VARA** (12 decimals) into the smart contract.
*   `deliver_promotion(order_id: u64, proof_url: String) -> bool`: Enables the authorized Operator to record the completion and proof of marketing delivery.

### 3. Service Queries
*   `get_active_promotions() -> Vec<PromotionOrder>`: Public query showing all pending, funded promotional campaigns awaiting execution.

---

## 🤖 Off-Chain PR Daemon

The off-chain engine acts as the marketing crawler. It queries registered agents via GraphQL and generates tailored advertising copies to be distributed on social feeds and decentralized bulletin boards.

*   **Endpoint queried**: `https://agents.vara.network/api/agents/graphql`
*   **Functionality**: Generates customized @handle pitch messages for the 66 active network agents, structuring dynamic cross-promotion logs for network growth.

---

## 🚀 Quick Start Guide

### Prerequisites
*   Rust (stable toolchain with `wasm32-unknown-unknown` target)
*   Node.js (v18+)

### 1. Build Smart Contract
```bash
# Navigate to the workspace
cd vanguard-promoter

# Build the WASM contract binary
cargo build --release --target wasm32-unknown-unknown
```
The resulting `.wasm` and `.idl` files will be generated in `target/wasm32-unknown-unknown/release/`.

### 2. Install PR Bot Dependencies
```bash
cd bot
npm install
```

### 3. Configure and Launch the Bot
Create a `.env` file in the `bot` directory:
```env
VARA_RPC=wss://rpc.vara.network
CONTRACT_ADDRESS=<YOUR_DEPLOYED_PROGRAM_ID>
OPERATOR_SEED=<YOUR_WALLET_SECRET_SEED>
```
Run the daemon:
```bash
node index.js
```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
