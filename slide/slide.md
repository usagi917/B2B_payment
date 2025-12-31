---
marp: true
title: Wagyu Milestone Escrow MVP
description: Hackathon Pitch Deck
paginate: true
theme: default
---

<!-- _class: lead -->

# Wagyu Milestone Escrow MVP

### 工程（エビデンス）が支払いを確定させる  
### B2B向けマイルストーン・エスクロー

- **1ロット = 1スマートコントラクト**
- **11マイルストーン / 自動資金解放**
- **信頼を「人」から「オンチェーン工程ログ」へ**

**Tech Stack**
Solidity 0.8.24 / Next.js 15 / ERC20 / Dynamic NFT

_Visual: 和牛 × ブロックチェーンのサイバーパンクヒーロー_

---

# Problem

## 前払いが成立しない一次産業の構造問題

- **生産者**
  - 肥育期間は約2年
  - 資金は先出し、回収は出荷後のみ
- **買い手**
  - 前払いは不履行・事故リスクが高い
- **共通課題**
  - 工程確認が属人化
  - 電話・メール確認コスト
  - 支払い判断が曖昧

_Visual:「資金は止まる／工程は進む」非同期構造_

---

# Solution

## 工程駆動型オートエスクロー

- **11の工程マイルストーン**
  - 肥育プロセスをあらかじめ定義
  - 各工程に固定の解放率を設定
- **Submit = Pay**
  - 生産者が工程証跡を提出
  - 同時にコントラクトが自動送金
- **改ざん不可の証跡**
  - 証跡はハッシュ化してオンチェーン保存
- **Dynamic NFT**
  - 進捗状態をNFT画像として可視化

_Visual: コントラクト主導の自動送金フロー_

---

# 11 Milestones

## 和牛肥育に特化した段階解放モデル

| フェーズ | 工程コード | 内容 | 解放率 |
|---|---|---|---|
| 導入 | E1 | 契約・ロット作成 | 10% |
| 導入 | E2 | 検疫・牛導入 | 10% |
| 肥育 | E3_01 | 月次肥育記録 | 5% |
| 肥育 | E3_02 | 月次肥育記録 | 5% |
| 肥育 | E3_03 | 月次肥育記録 | 5% |
| 肥育 | E3_04 | 月次肥育記録 | 5% |
| 肥育 | E3_05 | 月次肥育記録 | 5% |
| 肥育 | E3_06 | 月次肥育記録 | 5% |
| 出荷 | E4 | 出荷準備 | 10% |
| 出荷 | E5 | 出荷完了 | 20% |
| 完了 | E6 | 受領・検収 | 20% |

**Total: 100%**

---

# Product Flow

## 1ロット = 1スマコンのシンプル操作

1. **Lock**
   - Buyerが総額（ERC20）をコントラクトにロック
2. **Submit**
   - Producerが工程証跡を送信
   - 即座に該当分が自動送金
3. **Visualize**
   - Dynamic NFTが進捗をリアルタイム反映
4. **Cancel / Resolve**
   - 事故時はAdminが未解放分を返金

_Visual: 4ステップUIイメージ_

---

# Value

## 「エビデンス = 支払い」の取引DX

- **キャッシュフロー改善**
  - 工程完了ごとに即入金
- **説明責任の自動化**
  - 証跡 = 監査ログ
- **サーバーレス運用**
  - DB不要 / Vercel + RPCのみ
- **高い透明性**
  - NFTを見るだけで進捗が分かる

_Visual: Before（手動確認） / After（自動解放）_

---

# Execution

## MVPからスケールまで

- **Now (Hackathon MVP)**
  - Solidity 0.8.24
  - Next.js 15
  - viem / wagmi
- **Next**
  - Factoryコントラクト
  - 複数牛管理
  - KYC / 証跡の分散ストレージ
- **Future**
  - 建設・製造・クリエイティブ制作など
  - 工程型B2B取引への水平展開

_Visual: 3ステップロードマップ_

---

# Team

## ドメイン × 技術の最短距離

- **Web3 Engineer**
  - Solidity / セキュリティ / dApp
- **Domain Expert**
  - 畜産・一次産業B2B商流
- **UI / UX Designer**
  - 複雑な状態をNFTで可視化

_Visual: スキルアイコン_

---

# Close

## 信頼をプログラムし、一次産業を前に進める

- Demo:  
  `https://wagyu-escrow-mvp.vercel.app`
- GitHub:  
  `https://github.com/your-org/wagyu-escrow`

**Action**
パイロット導入・実証パートナー募集中

_Visual: QRコード +  
"Join the Trustless Supply Chain"_
