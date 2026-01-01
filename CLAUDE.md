# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
plan.mdを確認して実行すること

## Project Overview

Wagyu Milestone Escrow v2 - A decentralized marketplace dApp where producers list products (wagyu, sake, craft) and buyers purchase them. JPYC is automatically released to producers as milestones are completed. No admin role - fully trustless.

**Key concept**: 1 listing = 1 Escrow contract = 1 NFT. Producer self-reports milestone completion, triggering immediate JPYC payment.

## Architecture

```
hackson/
├── contracts/              # Solidity smart contracts (Remix IDE)
│   ├── ListingFactory.sol  # ERC721 + creates Escrow per listing
│   ├── MilestoneEscrow.sol # Per-listing escrow (Producer/Buyer only)
│   └── MockERC20.sol       # Test token
└── apps/web/               # Next.js dApp (App Router, TypeScript)
```

### Contract Architecture (v2)

**ListingFactory (ERC721)**
- `createListing(category, title, description, totalAmount, imageURI)` → deploys new MilestoneEscrow + mints NFT
- NFT initially owned by Escrow contract, transferred to Buyer on `lock()`
- `listings[]` array for enumeration, `tokenIdToEscrow` mapping

**MilestoneEscrow (per listing)**
- **Roles**: Producer (fixed at creation), Buyer (set on lock)
- **No Admin** - fully decentralized, no cancel after lock
- **State flow**: OPEN → ACTIVE → COMPLETED
- **Milestones**: Auto-generated from category template (wagyu/sake/craft)
- `lock()`: Buyer sends JPYC, receives NFT
- `submit(index)`: Producer completes milestone, receives JPYC immediately

### Milestone Templates (bps, 10000=100%)

**wagyu** (11 steps): 素牛導入(1000), 肥育開始(1000), 肥育中1-6(500×6), 出荷準備(1000), 出荷(2000), 納品完了(2000)

**sake** (5 steps): 仕込み, 発酵, 熟成, 瓶詰め, 出荷 (2000 each)

**craft** (4 steps): 制作開始, 窯焼き, 絵付け, 仕上げ (2500 each)

### dApp (apps/web/)

- **Stack**: Next.js 15 (App Router), TypeScript, viem, Tailwind CSS
- **Pages**: `/` (listing + create form), `/listing/[address]` (detail + actions)
- **No backend/DB**: All state from on-chain reads and events

## Build & Run Commands

### Smart Contracts (Remix IDE)

1. Copy contract files to Remix (https://remix.ethereum.org)
2. Compile with Solidity 0.8.20+
3. Test with "Remix VM (Shanghai)"
4. Deploy to Polygon Amoy with "Injected Provider - MetaMask"

### dApp

```bash
cd apps/web
pnpm install
pnpm dev          # Local development (http://localhost:3000)
pnpm build        # Production build
pnpm lint         # Lint check
```

## Environment Variables

```bash
# Polygon Amoy (testnet)
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_FACTORY_ADDRESS=<ListingFactory address>
NEXT_PUBLIC_TOKEN_ADDRESS=<MockERC20 or JPYC address>
NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE=https://amoy.polygonscan.com/tx/

# Polygon PoS (mainnet)
# NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
# NEXT_PUBLIC_CHAIN_ID=137
```

## Key Implementation Details

### Contract Security
- State updates before external calls (CEI pattern)
- `lock()`: Once only, anyone can become Buyer
- `submit()`: Producer only, requires locked, milestone must be incomplete
- No cancel after lock - funds flow to completion

### NFT Flow
1. `createListing()` → NFT minted to Escrow contract address
2. `lock()` → NFT transferred from Escrow to Buyer
3. Standard ERC721 transfer allowed after (secondary market ready)

### Frontend Hooks Pattern
```typescript
// Factory operations
useCreateListing(category, title, description, totalAmount, imageURI)
useListings() → address[]

// Per-Escrow operations
useEscrowInfo(address) → { producer, buyer, totalAmount, locked, ... }
useMilestones(address) → Milestone[]
useLock(address)
useSubmit(address, index)
useEvents(address) → Event[]
```

## Deployment

1. Deploy MockERC20 via Remix → note token address
2. Deploy ListingFactory with (tokenAddress)
3. Set NEXT_PUBLIC_FACTORY_ADDRESS and NEXT_PUBLIC_TOKEN_ADDRESS
4. Deploy dApp to Vercel
