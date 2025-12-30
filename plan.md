# 🐄 Wagyu Milestone Escrow MVP 開発プラン

## 概要
和牛の肥育工程を「支払い条件」として扱い、前払い資金を工程進行に応じて段階解放するdAppを作るよ！

---

## 📋 フェーズ1: プロジェクト初期設定（Day 1 前半）

### 1.1 リポジトリ構造の作成
```
hackson/
├── contracts/           # Solidityスマコン（Remix用ソース保管）
│   ├── MilestoneEscrow.sol
│   └── MockERC20.sol
├── apps/
│   └── web/            # Next.js dApp
├── README.md
└── plan.md
```

### 1.2 開発環境セットアップ
- [ ] Remix IDE（https://remix.ethereum.org）をブラウザで開く
- [ ] Node.js 18+ & pnpm インストール確認
- [ ] apps/web/ に Next.js（App Router, TypeScript）初期化

---

## 📋 フェーズ2: スマートコントラクト開発（Day 1 後半〜Day 2）

### 2.1 MilestoneEscrow.sol 作成
**コンストラクタ引数**
- `token`（ERC20アドレス）
- `buyer` / `producer` / `admin`（固定アドレス）
- `totalAmount`（総額）

**状態変数**
- `lockedAmount` / `releasedAmount` / `refundedAmount`
- `cancelled`（bool）
- `Milestone[]` 配列（11個：E1, E2, E3_01〜E3_06, E4, E5, E6）

**関数**
- [ ] `lock()` - Buyerが総額をロック
- [ ] `submit(index, evidenceHash)` - Producerが工程申請
- [ ] `approve(index)` - Buyerが承認→解放送金
- [ ] `cancel(reason)` - Adminが中断→未解放分返金
- [ ] `milestonesLength()` - view
- [ ] `milestone(index)` - view

**イベント**
- [ ] `Locked(amount, actor)`
- [ ] `Submitted(index, code, evidenceHash, actor)`
- [ ] `Released(index, code, amount, actor)`
- [ ] `Cancelled(reason, refundAmount, actor)`

### 2.2 工程テンプレート（bps: 10000 = 100%）
| コード | 説明 | 解放率(bps) |
|--------|------|-------------|
| E1 | 契約・個体登録 | 1000 (10%) |
| E2 | 初期検疫・導入 | 1000 (10%) |
| E3_01〜E3_06 | 月次肥育記録×6 | 各500 (5%) |
| E4 | 出荷準備 | 1000 (10%) |
| E5 | 出荷 | 2000 (20%) |
| E6 | 受領・検収 | 2000 (20%) |
| **合計** | | **10000 (100%)** |

### 2.3 テスト作成（Remix）
Remix IDE の「Solidity Unit Testing」プラグインを使うよ！

- [ ] lock: buyer以外不可、二重lock不可
- [ ] submit: lock前不可、producer以外不可、状態遷移確認
- [ ] approve: SUBMITTED以外不可、buyer以外不可、解放額確認、二重approve不可
- [ ] cancel: admin以外不可、未解放分返金確認、cancel後の操作不可
- [ ] bps合計が10000であること

**Remixでのテスト手順:**
1. 左メニューの「Plugin Manager」から「Solidity Unit Testing」を有効化
2. `tests/` フォルダにテストファイル作成
3. 「Run Tests」ボタンでテスト実行

---

## 📋 フェーズ3: テスト用ERC20トークン（Day 2）

### 3.1 MockERC20.sol 作成
- [ ] テスト用の簡易ERC20トークン作成
- [ ] mint機能付き（テスト用）

---

## 📋 フェーズ4: dApp開発（Day 2〜Day 3）

### 4.1 Next.js プロジェクト設定
- [ ] Tailwind CSS セットアップ
- [ ] viem インストール
- [ ] 環境変数設定
  - `NEXT_PUBLIC_RPC_URL`
  - `NEXT_PUBLIC_CHAIN_ID`
  - `NEXT_PUBLIC_CONTRACT_ADDRESS`
  - `NEXT_PUBLIC_TOKEN_ADDRESS`
  - `NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE`

### 4.2 1ページdApp UI構成
1. **Connect Wallet** - MetaMask接続、チェーンID確認
2. **Contract Summary** - token/total/locked/released/refunded/cancelled表示
3. **Role表示** - 接続アドレスがbuyer/producer/adminのどれか
4. **Actions**
   - Buyer: Lock, Approve
   - Producer: Submit（evidenceHash入力）
   - Admin: Cancel（reason入力）
5. **Milestones一覧** - index, code, bps, state, evidenceHash, timestamps
6. **Timeline** - イベントを時系列表示（type/actor/amount/code/txHash/time）
7. **免責・非投資宣言**

### 4.3 免責文言（必須表示）
```
⚠️ 重要事項
- これは投資商品ではなくB2B取引の決済インフラです
- 利回り・転売・分割所有・投資勧誘は扱いません
- 工程は支払い条件ではなく証跡（説明責任）のためのログです
- 監査済みコントラクトではありません（デモ用）
```

---

## 📋 フェーズ5: ローカルE2Eテスト（Day 3）

### 5.1 Remix VM でのテスト
Remixの内蔵VM（JavaScript VM）を使ってテストするよ！

- [ ] Remix で「Deploy & Run Transactions」を開く
- [ ] Environment を「Remix VM (Shanghai)」に設定
- [ ] MockERC20をデプロイ
- [ ] MilestoneEscrowをデプロイ（token, buyer, producer, admin, totalAmount を指定）
- [ ] Remixの画面から一連の操作確認
  - Buyer: approve(token) → lock
  - Producer: E1 submit
  - Buyer: E1 approve（解放確認）
  - Admin: cancel（返金確認）

### 5.2 dApp との接続テスト
- [ ] Remix でテストネットにデプロイ後、dAppと接続
- [ ] Timeline表示確認

---

## 📋 フェーズ6: テストネットデプロイ（Day 3〜Day 4）

### 6.1 テストネット選択
- Sepolia / Base Sepolia / Polygon Amoy など任意

### 6.2 Remix からのデプロイ手順
1. **MetaMask準備**
   - [ ] MetaMaskをテストネットに接続
   - [ ] テスト用ETH（ガス代）を Faucet から取得

2. **Remix設定**
   - [ ] 「Deploy & Run Transactions」を開く
   - [ ] Environment を「Injected Provider - MetaMask」に変更
   - [ ] MetaMaskで接続を承認

3. **デプロイ実行**
   - [ ] MockERC20 をデプロイ → Token Address をメモ
   - [ ] MilestoneEscrow をデプロイ（引数を設定）
     - `token`: 上でデプロイしたトークンアドレス
     - `buyer`: Buyer用ウォレットアドレス
     - `producer`: Producer用ウォレットアドレス
     - `admin`: Admin用ウォレットアドレス
     - `totalAmount`: 総額（例: 1000000）
   - [ ] CONTRACT_ADDRESS をメモ

4. **確認**
   - [ ] Etherscan等でコントラクトを確認

---

## 📋 フェーズ7: Vercelデプロイ（Day 4）

### 7.1 Vercel設定
- [ ] Vercelプロジェクト作成
- [ ] 環境変数設定
- [ ] デプロイ実行
- [ ] 公開URL取得

### 7.2 動作確認
- [ ] 公開URLでWallet接続
- [ ] 全機能の動作確認

---

## ✅ 受け入れ基準（Definition of Done）

### ローカル環境
- [ ] Buyerがlockできる
- [ ] Producerがsubmitできる
- [ ] Buyerがapproveして解放送金が発生する
- [ ] Adminがcancelして未解放分が返金される
- [ ] dAppにタイムラインがイベントから表示される

### Vercel公開環境
- [ ] 公開URLで同等の操作が可能
- [ ] UIに非投資宣言・監査未実施が明記されている

---

## 📁 最終成果物

```
hackson/
├── contracts/                    # Remix にコピペして使う
│   ├── MilestoneEscrow.sol       # メインのエスクローコントラクト
│   └── MockERC20.sol             # テスト用トークン
├── apps/
│   └── web/
│       ├── app/
│       │   └── page.tsx
│       ├── components/
│       ├── lib/
│       ├── .env.example
│       └── package.json
├── README.md
└── plan.md
```

**Remix上のファイル構成:**
```
remix-project/
├── contracts/
│   ├── MilestoneEscrow.sol
│   └── MockERC20.sol
└── tests/                        # Remix Unit Testing用
    └── MilestoneEscrow_test.sol
```

---

## ⏰ 推定スケジュール（4日間）

| Day | フェーズ | 内容 |
|-----|---------|------|
| 1 | 1, 2 | 環境構築、スマコン開発 |
| 2 | 2, 3, 4 | スマコンテスト、MockERC20、dApp開発開始 |
| 3 | 4, 5 | dApp完成、ローカルE2Eテスト |
| 4 | 6, 7 | テストネット・Vercelデプロイ、最終確認 |

---

## 🚨 注意事項

- スマコンは監査未実施 → 実資金運用禁止
- テストネット限定での運用
- JPYCは「任意ERC20」として抽象化

---

## 🔧 Remix IDE の使い方まとめ

### アクセス
👉 https://remix.ethereum.org

### 主要プラグイン
| プラグイン | 用途 |
|-----------|------|
| Solidity Compiler | コンパイル |
| Deploy & Run Transactions | デプロイ・実行 |
| Solidity Unit Testing | テスト |

### Environment（実行環境）
| 環境 | 用途 |
|------|------|
| Remix VM (Shanghai) | ローカルテスト（無料・高速） |
| Injected Provider - MetaMask | テストネット/メインネットデプロイ |

### デプロイ時の注意
- OpenZeppelin のインポートは Remix が自動で解決してくれる
- `@openzeppelin/contracts/...` の形式で import できる

---

## 🎯 次のステップ

**フェーズ1から始めよう！**
1. `contracts/` フォルダを作成
2. Foundryプロジェクト初期化
3. `apps/web/` にNext.jsプロジェクト作成

