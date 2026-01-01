# Wagyu Milestone Escrow v2 - MVP開発プラン

## プロダクト概要

生産者が商品を出品し、購入者が購入。マイルストーン達成ごとにJPYCが自動で生産者に支払われる分散型エスクロー。

---

## 確定要件

| 項目 | 決定 |
|------|------|
| Admin | **廃止**（完全dApps） |
| マイルストーン承認 | Producer申告 → 即支払い |
| 紛争解決 | スコープ外 |
| NFT | トレーサビリティ記録 + 裏で譲渡可能 |
| マイルストーン | テンプレート固定（3カテゴリ） |
| キャンセル | lock後は不可 |
| 数量 | 1出品 = 1NFT = 1Buyer |
| チェーン | Polygon Amoy (テスト) → Polygon PoS (本番) |

---

## チェーン設定

| 環境 | チェーン | Chain ID | RPC |
|------|----------|----------|-----|
| 開発 | Polygon Amoy | 80002 | https://rpc-amoy.polygon.technology |
| 本番 | Polygon PoS | 137 | https://polygon-rpc.com |

---

## コントラクト構成

```
┌────────────────────────────────────┐
│         ListingFactory             │
│  (ERC721を兼ねる)                  │
│                                    │
│  - tokenAddress: JPYC              │
│  - listings[]: 全Escrowアドレス    │
│  - tokenIdToEscrow mapping         │
│                                    │
│  createListing() → Escrow + NFT    │
│  getListings() → address[]         │
│  tokenURI() → 動的メタデータ       │
└────────────────────────────────────┘
            │
            │ creates
            ▼
┌────────────────────────────────────┐
│       MilestoneEscrow              │
│  (1出品 = 1コントラクト)           │
│                                    │
│  - producer: 出品者                │
│  - buyer: 購入者 (lock時に確定)    │
│  - totalAmount: 価格               │
│  - milestones[]: テンプレから生成  │
│  - locked: bool                    │
│                                    │
│  lock() → JPYC受取 + NFT転送       │
│  submit(index) → 即JPYC支払い      │
└────────────────────────────────────┘
```

---

## マイルストーンテンプレート

### wagyu (和牛) - 11ステップ
```
1.  素牛導入   1000 bps (10%)
2.  肥育開始   1000 bps (10%)
3.  肥育中1     500 bps (5%)
4.  肥育中2     500 bps (5%)
5.  肥育中3     500 bps (5%)
6.  肥育中4     500 bps (5%)
7.  肥育中5     500 bps (5%)
8.  肥育中6     500 bps (5%)
9.  出荷準備   1000 bps (10%)
10. 出荷       2000 bps (20%)
11. 納品完了   2000 bps (20%)
─────────────────────────
合計         10000 bps (100%)
```

### sake (日本酒) - 5ステップ
```
1. 仕込み   2000 bps (20%)
2. 発酵     2000 bps (20%)
3. 熟成     2000 bps (20%)
4. 瓶詰め   2000 bps (20%)
5. 出荷     2000 bps (20%)
─────────────────────────
合計       10000 bps (100%)
```

### craft (工芸品) - 4ステップ
```
1. 制作開始  2500 bps (25%)
2. 窯焼き    2500 bps (25%)
3. 絵付け    2500 bps (25%)
4. 仕上げ    2500 bps (25%)
─────────────────────────
合計        10000 bps (100%)
```

---

## 状態遷移

```
OPEN (出品中)
  │
  │ lock() - Buyerが購入
  ▼
ACTIVE (進行中)
  │
  │ submit(index) - Producer完了報告 × N回
  ▼
COMPLETED (全マイルストーン完了)
```

---

## コントラクト詳細仕様

### ListingFactory.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ListingFactory is ERC721 {
    address public tokenAddress;  // JPYC
    address[] public listings;
    mapping(uint256 => address) public tokenIdToEscrow;
    uint256 private _nextTokenId;

    event ListingCreated(
        uint256 indexed tokenId,
        address indexed escrow,
        address indexed producer,
        string category,
        uint256 totalAmount
    );

    constructor(address _tokenAddress) ERC721("MilestoneNFT", "MSNFT") {
        tokenAddress = _tokenAddress;
    }

    function createListing(
        string calldata category,
        string calldata title,
        string calldata description,
        uint256 totalAmount,
        string calldata imageURI
    ) external returns (address escrow, uint256 tokenId) {
        // 1. tokenId採番
        tokenId = _nextTokenId++;

        // 2. MilestoneEscrow deploy
        escrow = address(new MilestoneEscrow(
            address(this),
            tokenAddress,
            msg.sender,  // producer
            tokenId,
            category,
            title,
            description,
            totalAmount,
            imageURI
        ));

        // 3. 記録
        listings.push(escrow);
        tokenIdToEscrow[tokenId] = escrow;

        // 4. NFT mint (所有者 = Escrow)
        _mint(escrow, tokenId);

        emit ListingCreated(tokenId, escrow, msg.sender, category, totalAmount);
    }

    function getListings() external view returns (address[] memory) {
        return listings;
    }

    function getListingCount() external view returns (uint256) {
        return listings.length;
    }

    // tokenURI: Escrowから情報取得して動的生成
    // → 実装時はbase64 JSON or 外部API
}
```

### MilestoneEscrow.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MilestoneEscrow {
    address public factory;
    address public tokenAddress;
    address public producer;
    address public buyer;
    uint256 public tokenId;
    uint256 public totalAmount;
    bool public locked;

    string public category;
    string public title;
    string public description;
    string public imageURI;

    struct Milestone {
        string name;
        uint256 bps;  // 10000 = 100%
        bool completed;
    }
    Milestone[] public milestones;

    event Locked(address indexed buyer, uint256 amount);
    event Completed(uint256 indexed index, string name, uint256 amount);

    constructor(
        address _factory,
        address _tokenAddress,
        address _producer,
        uint256 _tokenId,
        string memory _category,
        string memory _title,
        string memory _description,
        uint256 _totalAmount,
        string memory _imageURI
    ) {
        factory = _factory;
        tokenAddress = _tokenAddress;
        producer = _producer;
        tokenId = _tokenId;
        category = _category;
        title = _title;
        description = _description;
        totalAmount = _totalAmount;
        imageURI = _imageURI;

        // カテゴリに応じたマイルストーン生成
        _initMilestones(_category);
    }

    function _initMilestones(string memory _category) internal {
        bytes32 cat = keccak256(bytes(_category));

        if (cat == keccak256("wagyu")) {
            milestones.push(Milestone("素牛導入", 1000, false));
            milestones.push(Milestone("肥育開始", 1000, false));
            milestones.push(Milestone("肥育中1", 500, false));
            milestones.push(Milestone("肥育中2", 500, false));
            milestones.push(Milestone("肥育中3", 500, false));
            milestones.push(Milestone("肥育中4", 500, false));
            milestones.push(Milestone("肥育中5", 500, false));
            milestones.push(Milestone("肥育中6", 500, false));
            milestones.push(Milestone("出荷準備", 1000, false));
            milestones.push(Milestone("出荷", 2000, false));
            milestones.push(Milestone("納品完了", 2000, false));
        } else if (cat == keccak256("sake")) {
            milestones.push(Milestone("仕込み", 2000, false));
            milestones.push(Milestone("発酵", 2000, false));
            milestones.push(Milestone("熟成", 2000, false));
            milestones.push(Milestone("瓶詰め", 2000, false));
            milestones.push(Milestone("出荷", 2000, false));
        } else if (cat == keccak256("craft")) {
            milestones.push(Milestone("制作開始", 2500, false));
            milestones.push(Milestone("窯焼き", 2500, false));
            milestones.push(Milestone("絵付け", 2500, false));
            milestones.push(Milestone("仕上げ", 2500, false));
        }
    }

    function lock() external {
        require(!locked, "Already locked");

        // JPYC受取
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), totalAmount);

        // buyer確定
        buyer = msg.sender;
        locked = true;

        // NFTをbuyerに転送
        IERC721(factory).transferFrom(address(this), msg.sender, tokenId);

        emit Locked(msg.sender, totalAmount);
    }

    function submit(uint256 index) external {
        require(msg.sender == producer, "Only producer");
        require(locked, "Not locked");
        require(index < milestones.length, "Invalid index");
        require(!milestones[index].completed, "Already completed");

        // 完了フラグ
        milestones[index].completed = true;

        // 支払額計算
        uint256 amount = (totalAmount * milestones[index].bps) / 10000;

        // 即時支払い
        IERC20(tokenAddress).transfer(producer, amount);

        emit Completed(index, milestones[index].name, amount);
    }

    // View functions
    function getMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }

    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    function getProgress() external view returns (uint256 completed, uint256 total) {
        total = milestones.length;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].completed) completed++;
        }
    }

    function getStatus() external view returns (string memory) {
        if (!locked) return "open";

        for (uint256 i = 0; i < milestones.length; i++) {
            if (!milestones[i].completed) return "active";
        }
        return "completed";
    }
}
```

---

## フロントエンド構成

### ページ構成
```
/                      → 出品一覧 + 出品フォーム
/listing/[address]     → 詳細・購入・マイルストーン操作
```

### 主要コンポーネント
```
apps/web/src/
├── app/
│   ├── page.tsx                 # 一覧ページ
│   └── listing/[address]/
│       └── page.tsx             # 詳細ページ
├── components/
│   ├── Header.tsx               # ウォレット接続
│   ├── ListingCard.tsx          # 出品カード
│   ├── CreateListingForm.tsx    # 出品フォーム
│   ├── ListingDetail.tsx        # 詳細表示
│   ├── MilestoneList.tsx        # マイルストーン一覧
│   └── EventTimeline.tsx        # イベント履歴
├── lib/
│   ├── config.ts                # 環境変数
│   ├── contracts.ts             # ABI定義
│   └── hooks.ts                 # Contract hooks
└── api/
    └── nft/[tokenId]/
        ├── metadata/route.ts    # NFTメタデータ
        └── image/route.ts       # NFT画像
```

### hooks.ts 主要関数
```typescript
// Factory
useCreateListing(category, title, description, totalAmount, imageURI)
useListings() → address[]

// Escrow (per listing)
useEscrowInfo(address) → { producer, buyer, totalAmount, locked, ... }
useMilestones(address) → Milestone[]
useLock(address)
useSubmit(address, index)
useEvents(address) → Event[]
```

---

## 環境変数

```bash
# .env.local (Amoy)
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_FACTORY_ADDRESS=<デプロイ後>
NEXT_PUBLIC_TOKEN_ADDRESS=<MockERC20アドレス>
NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE=https://amoy.polygonscan.com/tx/
```

---

## 実装タスク

### Phase 1: コントラクト
- [ ] ListingFactory.sol 作成
- [ ] MilestoneEscrow.sol 作成
- [ ] MockERC20.sol 作成（既存流用可）
- [ ] Remix でテスト
- [ ] Amoy にデプロイ

### Phase 2: フロントエンド基盤
- [ ] 既存apps/webをv2用にリファクタ
- [ ] Factory用ABI追加
- [ ] Escrow用ABI追加
- [ ] hooks.ts 更新

### Phase 3: 一覧ページ
- [ ] 出品一覧表示
- [ ] 出品フォーム
- [ ] createListing連携

### Phase 4: 詳細ページ
- [ ] /listing/[address] ルート作成
- [ ] 詳細情報表示
- [ ] 購入(lock)機能
- [ ] マイルストーン完了報告(submit)
- [ ] イベント履歴表示

### Phase 5: NFT API
- [ ] /api/nft/[tokenId]/metadata 更新
- [ ] /api/nft/[tokenId]/image 更新

---

## テストシナリオ

### 出品フロー
1. Producer がウォレット接続
2. カテゴリ選択、情報入力、出品
3. Escrowコントラクト生成確認
4. NFT発行確認（所有者=Escrow）
5. 一覧に表示確認

### 購入フロー
1. Buyer がウォレット接続
2. 一覧から出品選択
3. JPYC approve
4. lock() 実行
5. JPYC残高減少確認
6. NFT所有者がBuyerに変更確認
7. 状態が「進行中」に変更確認

### マイルストーンフロー
1. Producer がウォレット接続
2. 詳細ページで「完了報告」クリック
3. submit() 実行
4. JPYC残高増加確認
5. マイルストーンにチェック表示
6. イベント履歴に追加確認

---

## MVP対象外

- カスタムマイルストーン
- 出品取り下げ
- 動的NFT画像
- カテゴリフィルタ
- マイページ
- IPFS画像アップロード
- マイルストーン順序制約
