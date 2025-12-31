# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wagyu Milestone Escrow MVP - A blockchain dApp for milestone-driven escrow payments for B2B cattle fattening transactions. Funds are locked and released progressively as milestones are completed.

**Key concept**: Payment conditions are tied to fattening process stages (E1-E6), not investment returns. This is B2B payment infrastructure, not an investment product.

## Architecture

```
hackson/
├── contracts/              # Solidity smart contracts (for Remix IDE)
│   ├── MilestoneEscrow.sol # Main escrow contract (1 lot = 1 contract)
│   └── MockERC20.sol       # Test token
└── apps/web/               # Next.js dApp (App Router, TypeScript)
```

### Smart Contract (MilestoneEscrow.sol)

- **Pattern**: 1 lot = 1 contract instance
- **Roles**: Buyer (lock), Producer (submit & auto-receive), Admin (cancel) - addresses fixed at deploy
- **State**: Milestones array with PENDING → COMPLETED transitions (auto-payment on submit)
- **Release rates (bps, 10000=100%)**: E1(1000), E2(1000), E3_01-E3_06(500 each), E4(1000), E5(2000), E6(2000)
- **Events**: `Locked`, `Completed`, `Cancelled` - dApp timeline is built from events only (no DB)
- **Auto-payment**: When Producer submits a milestone, JPYC is automatically transferred (no Buyer approval needed)

### dApp (apps/web/)

- **Stack**: Next.js (App Router), TypeScript, viem, Tailwind CSS
- **Single page**: Wallet connect → Contract summary → Role display → Actions → Milestones list → Event timeline
- **No backend/DB**: All state from on-chain events and contract reads

## Build & Run Commands

### Smart Contracts (Remix IDE)

Contracts are developed and tested in Remix IDE (https://remix.ethereum.org):

1. Copy contract files to Remix
2. Compile with Solidity Compiler plugin
3. Test with "Remix VM (Shanghai)" environment
4. Deploy to testnet with "Injected Provider - MetaMask"

### dApp

```bash
cd apps/web
pnpm install
pnpm dev          # Local development
pnpm build        # Production build
pnpm lint         # Lint check
```

## Environment Variables

```
NEXT_PUBLIC_RPC_URL           # EVM RPC endpoint
NEXT_PUBLIC_CHAIN_ID          # Target chain ID
NEXT_PUBLIC_CONTRACT_ADDRESS  # Deployed MilestoneEscrow address
NEXT_PUBLIC_TOKEN_ADDRESS     # ERC20 token address
NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE  # (optional) Block explorer base URL
```

## Key Implementation Details

### Contract Security Order
State updates must happen before external calls (ERC20 transfers) to prevent reentrancy.

### Guards
- `lock()`: Buyer only, once only
- `submit()`: Producer only, requires locked state, milestone must be PENDING, auto-transfers JPYC
- `cancel()`: Admin only, refunds unlocked amount to Buyer

### Required UI Disclaimers
Must display:
- "This is B2B payment infrastructure, not an investment product"
- "No yields, resale, fractional ownership, or investment solicitation"
- "Milestones are evidence logs, not payment conditions"
- "Unaudited contract (demo only)"

## Testing Checklist

- lock: non-buyer rejected, double-lock rejected
- submit: pre-lock rejected, non-producer rejected, state transition works, auto-payment correct, double-submit rejected
- cancel: non-admin rejected, refund correct, post-cancel operations rejected
- bps total equals 10000

## Deployment

1. Deploy MockERC20 via Remix → note token address
2. Deploy MilestoneEscrow with (token, buyer, producer, admin, totalAmount)
3. Set environment variables in Vercel
4. Deploy dApp to Vercel
