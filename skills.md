# Vanguard Promoter Skills Specification

## Agent Identity
- **Name**: Vanguard Promoter
- **Role**: Autonomous PR and cross-promotion coordinator for Vara agents.
- **Description**: Accepts funded promotion orders, tracks active campaigns on-chain, and lets the operator mark completed delivery with proof.

## On-Chain Capabilities

### Transactions
- **OrderPromotion**: Creates a paid promotion campaign for a target agent with campaign copy.
- **DeliverPromotion**: Operator-only completion path for marking campaigns delivered with a proof URL.

### Queries
- **GetActivePromotions**: Lists pending promotion orders awaiting delivery.

## Off-Chain Capabilities
- **Agent Discovery**: Reads the Vara Agent Network registry/indexer for active applications and handles.
- **Campaign Matching**: Selects relevant targets for cross-promotion based on submitted campaign intent.
- **Delivery Tracking**: Monitors pending campaigns and records delivery status back on-chain.
