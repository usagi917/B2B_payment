# Wagyu Milestone Escrow MVP

[![日本語](https://img.shields.io/badge/README-日本語-blue)](./README.md)
[![English](https://img.shields.io/badge/README-English-blue)](./README.en.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

和牛の肥育工程をマイルストーンとして定義し、Buyer/Producer/Adminの3ロールで資金を段階解放する
B2B向けエスクローdAppです。テストネット向けのMVPで、証跡はハッシュ化してオンチェーンに記録します。

## Features

- 11マイルストーン（E1〜E6）に基づく段階支払いエスクロー
- Buyer/Producer/Adminのロール別アクション（Lock, Submit, Approve, Cancel）
- 証跡ハッシュとイベントタイムラインの可視化
- Sepolia / Base Sepolia / Polygon Amoy のテストネット対応

## Requirements

- Node.js 18.17+（Next.js 15互換）
- pnpm
- MetaMaskなどのEVMウォレット
- RPCエンドポイント（Alchemy等）
- デプロイ済みのERC20トークンとMilestoneEscrowコントラクト

## Installation

```bash
cd apps/web
pnpm install
```

## Quick Start

1. `apps/web` に移動
2. `.env.example` を `.env.local` にコピー
3. 環境変数を設定（RPC URL、Chain ID、コントラクトアドレス）
4. `pnpm dev` を実行
5. ブラウザで `http://localhost:3000` を開く

## Usage

### dApp

1. MetaMaskを接続し、対象ネットワークへ切り替え
2. Buyerが「Lock Funds」で総額をロック（事前にERC20 approve が必要）
3. Producerがマイルストーンを選択し、証跡を入力してSubmit
4. Buyerが承認し、該当分の資金を解放
5. Adminは必要に応じてCancel & Refundを実行

### Milestone Schedule

| Code | Description | Release Rate |
|------|-------------|--------------|
| E1 | 契約・個体登録 | 10% |
| E2 | 初期検疫・導入 | 10% |
| E3_01〜E3_06 | 月次肥育記録×6 | 5% each (30% total) |
| E4 | 出荷準備 | 10% |
| E5 | 出荷 | 20% |
| E6 | 受領・検収 | 20% |
| **Total** | | **100%** |

### Smart Contract Deployment (Remix)

1. https://remix.ethereum.org を開く
2. `contracts/MilestoneEscrow.sol` と `contracts/MockERC20.sol` を作成して貼り付け
3. Solidity 0.8.20+ でコンパイル
4. `MockERC20` をデプロイ（例: `("Test Token", "TEST", 18)`）
5. `MilestoneEscrow` をデプロイ
   - `_token`: ERC20トークンアドレス
   - `_buyer`: Buyerアドレス
   - `_producer`: Producerアドレス
   - `_admin`: Adminアドレス
   - `_totalAmount`: 総額（最小単位）


## User Flow (Mermaid)

```mermaid
graph TD
  A[ユーザー: アプリを開く] --> B[システム: コントラクトとタイムラインを読み込む]
  B --> C{ウォレット接続済み?}
  C -->|いいえ| D[ユーザー: ウォレット接続]
  D --> E[システム: アカウント取得とチェーン確認]
  E --> C
  C -->|はい| F[ユーザー: アクション選択<br/>ロック 申請 承認 キャンセル]
  F --> G[システム: トランザクション送信]
  G --> H{成功?}
  H -->|いいえ| I[システム: エラー表示と再試行]
  I --> F
  H -->|はい| J[システム: サマリーとタイムライン更新]
  J --> K[ユーザー: 更新結果を確認]
```

## System Architecture (Mermaid)

```mermaid
graph LR
  subgraph Client
    UI[Nextjs Web App]
    Wallet[Wallet Extension]
  end
  subgraph Infrastructure
    RPC[RPC Provider]
  end
  subgraph Blockchain
    Escrow[Milestone Escrow]
    Token[ERC20 Token]
  end
  UI -->|Read and View| RPC
  Wallet -->|Sign Transactions| RPC
  RPC -->|Contract Calls| Escrow
  RPC -->|Token Calls| Token
  UI -.->|Tx Link| Explorer[Block Explorer optional]
```

## Directory Structure

```
hackson/
├── apps/
│   └── web/                # Next.js dApp
│       ├── src/app/         # App router UI
│       ├── src/components/  # UI components
│       └── src/lib/         # viem + hooks + config
├── contracts/               # Solidity smart contracts
│   ├── MilestoneEscrow.sol
│   └── MockERC20.sol
├── idea.md
├── plan.md
├── README.md
├── README.en.md
└── LICENSE
```

## Configuration

`apps/web/.env.local`

```
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_TOKEN_ADDRESS=
NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE=
```

- `NEXT_PUBLIC_RPC_URL`: 対象ネットワークのRPC URL
- `NEXT_PUBLIC_CHAIN_ID`: Chain ID（例: Sepolia 11155111）
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: MilestoneEscrowのアドレス
- `NEXT_PUBLIC_TOKEN_ADDRESS`: ERC20トークンのアドレス
- `NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE`: 取引URLのベース（任意）

## Development

```bash
cd apps/web
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## License

MIT License. See `LICENSE`.
