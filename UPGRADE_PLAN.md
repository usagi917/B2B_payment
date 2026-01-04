# バージョンアップ実装計画

## 実装する機能

| # | 機能 | 優先度 | 依存関係 | 変更ファイル |
|---|------|--------|----------|--------------|
| 1 | Allowance/Balance事前チェック | 高 | なし | hooks.ts, listing/[address]/page.tsx |
| 3 | トランザクション進捗表示 | 高 | なし | hooks.ts, 新コンポーネント |
| 4 | エビデンスハッシュ実装 | 中 | コントラクト変更必要 | ListingFactoryFull.sol, hooks.ts, page |
| 5 | リアルタイム更新 | 中 | なし | hooks.ts, page.tsx |
| 8 | マイページ | 低 | 1,5完了後推奨 | 新ページ, hooks.ts |

---

## Phase 1: UX改善 (1, 3)

### 1.1 Allowance/Balance事前チェック

**目的**: lock()実行前に残高・承認状況を確認し、無駄なガス代を防ぐ

**変更内容**:

#### hooks.ts に追加
```typescript
// 新規hook: useTokenAllowance
export function useTokenAllowance(owner: Address | null, spender: Address | null) {
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllowance = useCallback(async () => {
    if (!owner || !spender || !config.tokenAddress) {
      setAllowance(0n);
      return;
    }
    setIsLoading(true);
    try {
      const client = createClient();
      const result = await client.readContract({
        address: config.tokenAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [owner, spender],
      });
      setAllowance(result as bigint);
    } catch {
      setAllowance(0n);
    } finally {
      setIsLoading(false);
    }
  }, [owner, spender]);

  useEffect(() => { fetchAllowance(); }, [fetchAllowance]);

  return { allowance, isLoading, refetch: fetchAllowance };
}

// useEscrowActions の lock を改善
// - 事前に allowance をチェック
// - allowance が足りていれば approve をスキップ
// - balance が足りなければエラーを出す
```

#### listing/[address]/page.tsx に追加
- 購入ボタン付近に残高表示
- 残高不足時は警告表示 + ボタン無効化
- approve済みなら「承認済み」表示

---

### 1.2 トランザクション進捗表示

**目的**: ユーザーに現在の処理状態を明確に伝える

**新規コンポーネント**: `components/TxProgress.tsx`

```typescript
type TxStep = "idle" | "signing" | "confirming" | "success" | "error";

interface TxProgressProps {
  step: TxStep;
  txHash?: string;
  error?: string;
}

// 表示内容:
// signing: "ウォレットで署名してください..."
// confirming: "トランザクション確認中..." + スピナー + txHashリンク
// success: "完了!" + txHashリンク
// error: エラーメッセージ
```

**hooks.ts 変更**:
- `useEscrowActions` に `txStep` state を追加
- approve/lock/submit の各フェーズで step を更新

```typescript
// 例: lock の場合
const lock = async (totalAmount: bigint) => {
  setTxStep("signing");
  const hash1 = await wallet.writeContract({ ... }); // approve
  setTxStep("confirming");
  await client.waitForTransactionReceipt({ hash: hash1 });

  setTxStep("signing");
  const hash2 = await wallet.writeContract({ ... }); // lock
  setTxStep("confirming");
  await client.waitForTransactionReceipt({ hash: hash2 });

  setTxStep("success");
};
```

---

## Phase 2: 機能強化 (4, 5)

### 2.1 エビデンスハッシュ実装

**目的**: マイルストーン完了時にエビデンス(画像等)のハッシュをオンチェーン記録

**コントラクト変更** (ListingFactoryFull.sol):

```solidity
// MilestoneEscrowV3 に追加
mapping(uint256 => bytes32) public evidenceHashes;

event Completed(uint256 indexed index, uint256 amount, bytes32 evidenceHash);

function submit(uint256 i, bytes32 _evidenceHash) external nonReentrant {
    // 既存のバリデーション
    if (msg.sender != producer) revert Unauthorized();
    if (!locked || i >= milestones.length || milestones[i].completed) revert InvalidState();
    uint256 nextIndex = _nextIncompleteIndex();
    if (i != nextIndex) revert InvalidState();

    milestones[i].completed = true;
    evidenceHashes[i] = _evidenceHash;  // 追加

    // 支払い処理
    uint256 amt = (i == milestones.length - 1)
        ? totalAmount - releasedAmount
        : (totalAmount * milestones[i].bps) / 10000;
    releasedAmount += amt;
    IERC20(tokenAddress).safeTransfer(producer, amt);

    emit Completed(i, amt, _evidenceHash);  // 変更
}

function getEvidenceHash(uint256 i) external view returns (bytes32) {
    return evidenceHashes[i];
}
```

**フロントエンド変更**:

1. `lib/abi.ts` - ABIにevidenceHash関連を追加
2. `hooks.ts` - submitにevidenceHash引数追加
3. `listing/[address]/page.tsx` - 完了報告時にエビデンス入力欄追加

```typescript
// submit関数
const submit = async (index: number, evidenceHash?: string) => {
  const hash = evidenceHash || "0x" + "0".repeat(64); // デフォルトは空
  // ...
};
```

**UI追加**:
- 完了報告ダイアログにテキスト入力欄
- 入力テキストをkeccak256でハッシュ化
- または画像URLをハッシュ化

---

### 2.2 リアルタイム更新

**目的**: ページリロードなしで状態変化を反映

**実装方法**: ポーリング + イベント検知

```typescript
// hooks.ts に追加
export function useRealtimeEscrow(escrowAddress: Address | null, interval = 10000) {
  const { info, refetch: refetchInfo } = useEscrowInfo(escrowAddress);
  const { milestones, refetch: refetchMilestones } = useMilestones(escrowAddress);
  const { events, refetch: refetchEvents } = useEscrowEvents(escrowAddress);

  useEffect(() => {
    if (!escrowAddress) return;

    const timer = setInterval(() => {
      refetchInfo();
      refetchMilestones();
      refetchEvents();
    }, interval);

    return () => clearInterval(timer);
  }, [escrowAddress, interval, refetchInfo, refetchMilestones, refetchEvents]);

  return { info, milestones, events };
}
```

**オプション**: WebSocket (viem watchContractEvent)
```typescript
// より効率的だがRPC対応が必要
const unwatch = client.watchContractEvent({
  address: escrowAddress,
  abi: ESCROW_ABI,
  eventName: "Completed",
  onLogs: (logs) => {
    refetchMilestones();
    refetchEvents();
  },
});
```

---

## Phase 3: 新機能 (8)

### 3.1 マイページ

**目的**: 自分が関わるリスティングを一覧表示

**新規ファイル**: `app/my/page.tsx`

**機能**:
1. 出品した商品一覧 (Producer)
2. 購入した商品一覧 (Buyer)
3. ステータス別フィルタ

**実装**:

```typescript
// hooks.ts に追加
export function useMyListings(address: Address | null) {
  const { summaries } = useListingSummaries();

  const myListings = useMemo(() => {
    if (!address) return { asProducer: [], asBuyer: [] };
    const lower = address.toLowerCase();
    return {
      asProducer: summaries.filter(s => s.producer.toLowerCase() === lower),
      asBuyer: summaries.filter(s => s.buyer.toLowerCase() === lower),
    };
  }, [summaries, address]);

  return myListings;
}
```

**ページ構成**:
```
/my
├── 出品中 (タブ)
│   ├── Open (フィルタ)
│   ├── Active
│   └── Completed
└── 購入履歴 (タブ)
    ├── Active
    └── Completed
```

---

## 実装順序

```
Week 1: Phase 1
├── Day 1-2: 1.1 Allowance/Balance チェック
│   ├── useTokenAllowance hook 追加
│   ├── useEscrowActions 改善
│   └── listing/[address]/page.tsx UI更新
│
└── Day 3-4: 1.2 トランザクション進捗
    ├── TxProgress コンポーネント作成
    ├── hooks.ts に txStep 追加
    └── 各アクションに進捗表示統合

Week 2: Phase 2
├── Day 1-2: 2.1 エビデンスハッシュ
│   ├── コントラクト修正・再デプロイ
│   ├── ABI更新
│   └── フロントエンド対応
│
└── Day 3-4: 2.2 リアルタイム更新
    ├── useRealtimeEscrow hook
    └── ページへの統合

Week 3: Phase 3
├── Day 1-2: 3.1 マイページ基本
│   ├── useMyListings hook
│   ├── /my ページ作成
│   └── タブUI実装
│
└── Day 3-4: 仕上げ
    ├── フィルタ機能
    ├── ヘッダーにリンク追加
    └── テスト・バグ修正
```

---

## 注意事項

### コントラクト変更について (4. エビデンスハッシュ)
- **既存コントラクトとの互換性なし** - 新規デプロイが必要
- テストネットなので問題ないが、本番では移行計画が必要
- 代替案: オフチェーンでIPFS+署名で管理(コントラクト変更不要)

### 実装の優先順位調整
- コントラクト変更を避けたい場合: 4を後回しにして 1,3,5,8 を先に
- 最小限で始めたい場合: 1,3 だけ先に実装

---

## 次のステップ

どこから着手しますか？

1. **Phase 1 (1,3)** から始める → コントラクト変更なしで即効果あり
2. **全部順番に** → 上記スケジュール通り
3. **コントラクト変更を避けて 1,3,5,8** → 4は後回し
