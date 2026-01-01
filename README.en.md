# Wagyu Milestone Escrow MVP

[![日本語](https://img.shields.io/badge/README-日本語-blue)](./README.md)
[![English](https://img.shields.io/badge/README-English-blue)](./README.en.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

A milestone-based escrow dApp for wagyu, sake, and craft listings.
Each listing deploys its own escrow contract and mints an NFT that transfers to the buyer on lock.
Progress is released in milestones and rendered as a dynamic NFT.

## Features

- `ListingFactoryV3` deploys an escrow per listing and mints the ERC721 NFT
- Buyers lock ERC20 funds and receive the NFT (OPEN → ACTIVE → COMPLETED)
- Category-based milestones (wagyu 11 / sake 5 / craft 4) with fixed release rates
- Dynamic NFT metadata and SVG image API at `/api/nft/:tokenId`
- Frontend-only architecture with Next.js, viem, MUI, and Framer Motion

## Requirements

- Node.js (compatible with Next.js 15)
- pnpm
- EVM wallet (MetaMask, etc.)
- RPC endpoint (supported: Sepolia 11155111 / Base Sepolia 84532 / Base 8453 / Polygon Amoy 80002)
- Deployed ListingFactoryV3 (ERC721) and ERC20 token addresses
- Solidity 0.8.24 / Foundry (if you build contracts)

## Installation

```bash
cd apps/web
pnpm install
```

## Quick Start

1. Go to `apps/web`
2. Copy `.env.example` to `.env.local`
3. Set RPC URL, Chain ID, and Factory/Token addresses
4. Run `pnpm dev`
5. Open `http://localhost:3000`

## Usage

### dApps

1. Producer connects a wallet and creates a listing (category, title, price, image URL)
2. Buyer purchases the listing (ERC20 approve → lock, two transactions)
3. Producer submits milestones and ERC20 is released per step
4. Once all steps are completed, status becomes `completed` and the NFT reflects progress

Note: `lock()` cannot be called by the producer. There is no cancel flow in the current contracts.

### Dynamic NFT API

- Metadata: `GET /api/nft/:tokenId`
- Image: `GET /api/nft/:tokenId/image`

The API resolves escrows via `ListingFactoryV3.tokenIdToEscrow`.
Set `ListingFactoryV3.baseURI` to your dApp origin so `tokenURI` points to `/api/nft/:tokenId`.

### Smart Contract Deployment (Example: Remix / Foundry)

1. Deploy `contracts/MockERC20.sol` (for testing)
2. Deploy `ListingFactoryV3` from `contracts/ListingFactoryFull.sol`
   - `tokenAddress`: ERC20 token address
   - `uri`: dApp origin (e.g., `https://your-app`)
3. Create listings from the dApp (`MilestoneEscrowV3` is deployed automatically and NFT is minted)

## User Flow (Mermaid)

```mermaid
graph TD
  A[User: Open dApps] --> B[System: Load config and listings]
  B --> C{Wallet connected?}
  C -->|No| D[User: Connect wallet]
  D --> E[System: Check chain and account]
  E --> C
  C -->|Yes| F[User: Create listing or select listing]
  F --> G[System: Prepare transaction<br/>Create Listing Purchase Submit]
  G --> H{Transaction confirmed?}
  H -->|No| I[System: Show error and retry]
  I --> F
  H -->|Yes| J[System: Update state and refresh NFT<br/>Release funds on submit]
  J --> K[User: View progress and NFT]
```

## System Architecture (Mermaid)

```mermaid
graph LR
  subgraph Client
    UI[Web App]
    Wallet[Wallet Extension]
  end
  subgraph Api
    API[Nextjs API Routes]
  end
  subgraph Infra
    RPC[RPC Provider]
    Explorer["Block Explorer (optional)"]
  end
  subgraph Blockchain
    Factory[ListingFactoryV3<br/>ERC721 NFT]
    Escrow[MilestoneEscrowV3]
    Token[ERC20 Token]
  end
  UI -->|HTTP| API
  UI -->|Read state| RPC
  Wallet -->|Sign and send tx| RPC
  API -->|Read contracts| RPC
  RPC -->|Factory calls| Factory
  RPC -->|Escrow calls| Escrow
  RPC -->|Token transfers| Token
  Factory -->|Deploys| Escrow
  UI -.->|Tx links| Explorer
```

## Directory Structure

```
hackson/
├── apps/
│   └── web/                 # Next.js dApp
│       ├── src/app/          # App Router UI + API routes
│       ├── src/components/   # UI components
│       ├── src/lib/          # viem hooks + config
│       ├── .env.example      # Environment template
│       └── package.json
├── contracts/                # Solidity smart contracts
│   ├── ListingFactoryFull.sol # ListingFactoryV3 + MilestoneEscrowV3
│   └── MockERC20.sol          # Test ERC20
├── lib/                       # OpenZeppelin contracts (submodule)
├── foundry.toml
├── README.md
├── README.en.md
└── LICENSE
```

## Configuration

`apps/web/.env.local`

```
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_FACTORY_ADDRESS=
NEXT_PUBLIC_TOKEN_ADDRESS=
NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE=

# Optional (server-side override)
CHAIN_ID=
```

- `NEXT_PUBLIC_RPC_URL`: RPC URL for the target network
- `NEXT_PUBLIC_CHAIN_ID`: Chain ID (supported: Sepolia 11155111 / Base Sepolia 84532 / Base 8453 / Polygon Amoy 80002)
- `NEXT_PUBLIC_FACTORY_ADDRESS`: ListingFactoryV3 address
- `NEXT_PUBLIC_TOKEN_ADDRESS`: ERC20 token address
- `NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE`: Base URL for tx links (optional)
- `CHAIN_ID`: Chain ID override for API routes (optional)

## Development

```bash
cd apps/web
pnpm dev
pnpm dev:turbo
pnpm build
pnpm start
pnpm lint
```

## License

MIT License. See `LICENSE`.
