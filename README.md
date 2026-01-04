# Wagyu Milestone Escrow

[![日本語](https://img.shields.io/badge/README-日本語-blue)](./README.md)
[![English](https://img.shields.io/badge/README-English-blue)](./README.en.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

和牛・日本酒・工芸品の出品に対応した、マイルストーン型のエスクローdAppです。
出品ごとにエスクロー契約とNFT（ERC721）が生成され、購入者のロックと同時にNFTが移転します。
進捗はマイルストーンで段階解放され、Dynamic NFTとして可視化されます（ロック前キャンセル対応）。

## Features

- `ListingFactoryV5` が出品ごとに `MilestoneEscrowV5` をデプロイし、NFTをミント
- 購入時にERC20をロックし、`open → active → completed/cancelled` で状態遷移
- 生産者はロック前のみ出品キャンセル可能（NFTはFactory側で焼却）
- Dynamic NFTメタデータ/SVG画像API（`/api/nft/:tokenId`）
- 日本語/英語切替、MetaMaskのチェーン切替対応（DB不要・フロントエンド中心）

## Requirements

- Node.js（Next.js 15 互換）
- pnpm
- EVMウォレット（MetaMaskなど）
- RPCエンドポイント（対応: Sepolia 11155111 / Base Sepolia 84532 / Base 8453 / Polygon Amoy 80002）
- ListingFactoryV5（ERC721）とERC20トークンのデプロイ済みアドレス
- Solidity 0.8.24 / Foundry（コントラクトをビルドする場合）

## Installation

```bash
cd apps/web
pnpm install
```

## Quick Start

1. `apps/web` に移動
2. `.env.example` を `.env.local` にコピー
3. RPC URL、Chain ID、Factory/Tokenアドレスを設定
4. `pnpm dev` を実行
5. `http://localhost:3000` を開く

## Usage

### dApps

1. Producerがウォレット接続し、カテゴリ・タイトル・価格・画像URLを指定して出品
2. Buyerが出品を購入（ERC20 approve → lock の2トランザクション）
3. Producerがマイルストーンを順に完了報告し、段階的に支払いが解放
4. ロック前であればProducerが出品をキャンセル可能（`cancel()`）

※ `lock()` はProducer本人からは実行できません。キャンセルはロック前のみです。

### Dynamic NFT API

- メタデータ: `GET /api/nft/:tokenId`
- 画像: `GET /api/nft/:tokenId/image`

APIは `ListingFactoryV5` の `tokenIdToEscrow` からエスクローを解決します。
`ListingFactoryV5` の `baseURI` は dApp のオリジンに設定してください（`/api/nft/:tokenId` を参照します）。

### Smart Contract Deployment（Example: Remix / Foundry）

1. `contracts/MockERC20.sol` をデプロイ（テスト用）
2. `contracts/ListingFactoryV5.sol` から `ListingFactoryV5` をデプロイ
   - `tokenAddress`: ERC20トークンアドレス
   - `uri`: dAppのオリジン（`https://your-app` など）
3. dApp から `createListing` を実行（`MilestoneEscrowV5` が自動デプロイされNFTがミント）

## User Flow (Mermaid)

```mermaid
graph TD
  A[ユーザー: dAppを開く] --> B[システム: 設定と出品一覧を読み込む]
  B --> C{ウォレット接続済み?}
  C -->|いいえ| D[ユーザー: ウォレット接続<br/>チェーン切替]
  D --> E[ユーザー: 出品作成 または 出品選択]
  C -->|はい| E
  E --> F{出品状態}
  F -->|open and buyer| G[ユーザー: 承認してロック]
  F -->|active| H[生産者: 次の工程を完了報告]
  F -->|open and producer| I[生産者: ロック前キャンセル]
  G --> J{トランザクション成功?}
  H --> J
  I --> J
  J -->|いいえ| E
  J -->|はい| K[システム: 状態更新・NFT再取得<br/>必要に応じて支払い解放]
  K --> L[ユーザー: 進捗とNFTを確認]
```

## System Architecture (Mermaid)

```mermaid
graph LR
  subgraph Client
    UI[Nextjs Web App]
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
    Factory[ListingFactoryV5<br/>ERC721 NFT]
    Escrow[MilestoneEscrowV5]
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
│   └── web/                   # Next.js dApp
│       ├── src/app/            # App Router UI + API routes
│       ├── src/components/     # UI components
│       ├── src/lib/            # viem hooks + config + i18n + ABI
│       ├── .env.example        # 環境変数テンプレート
│       └── package.json
├── contracts/                  # Solidity smart contracts
│   ├── ListingFactoryV5.sol    # Factory + MilestoneEscrowV5
│   └── MockERC20.sol           # テスト用ERC20
├── lib/                         # OpenZeppelin contracts (submodule)
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

# Optional (legacy, not used by current UI)
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

- `NEXT_PUBLIC_RPC_URL`: 対象ネットワークのRPC URL
- `NEXT_PUBLIC_CHAIN_ID`: Chain ID（対応: Sepolia 11155111 / Base Sepolia 84532 / Base 8453 / Polygon Amoy 80002）
- `NEXT_PUBLIC_FACTORY_ADDRESS`: ListingFactoryV5のアドレス
- `NEXT_PUBLIC_TOKEN_ADDRESS`: ERC20トークンのアドレス
- `NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE`: 取引URLのベース（任意）
- `CHAIN_ID`: APIルート用のChain ID上書き（任意）
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: 旧構成用（現行UIでは未使用）

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
