---
marp: true
theme: gaia
size: 16:9
paginate: true
backgroundColor: #121212
color: #e0e0e0
style: |
  /* --- Global Theme & Fonts --- */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;900&family=JetBrains+Mono:wght@400;700&display=swap');
  
  :root {
    --theme-primary: #FFD600; /* Yellow (Sub) */
    --theme-secondary: #2979FF; /* Blue (Main) */
    --bg-dark: #121212;
    --bg-card: #1E1E1E;
    --border-color: #333333;
  }

  section {
    font-family: 'Inter', sans-serif;
    font-size: 30px;
    padding: 40px;
    background-color: var(--bg-dark);
    background-image: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  /* --- Typography --- */
  h1 {
    font-family: 'Inter', sans-serif;
    font-weight: 900;
    font-size: 120px; /* Massive Keyword */
    line-height: 1.1;
    color: var(--theme-secondary);
    margin: 0;
    padding: 0;
    text-transform: uppercase;
    letter-spacing: -4px;
    border: none;
  }
  
  h2 {
    color: #fff;
    font-size: 1.5em;
    font-weight: 400;
    margin-top: 20px;
    margin-bottom: 40px;
    border: none;
    letter-spacing: 4px;
    text-transform: uppercase;
  }

  p.subtext {
    font-size: 0.9em;
    color: #888;
    max-width: 800px;
    margin-top: 30px;
    line-height: 1.6;
  }

  /* --- Visuals --- */
  .visual-area {
    width: 60%;
    height: 350px;
    margin: 20px auto;
    position: relative;
    border: 4px solid var(--theme-primary); /* Yellow Border */
    border-radius: 0; /* Sharp corners for flat look */
    background: #000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .visual-icon {
    font-size: 6em;
    margin-bottom: 20px;
  }
  
  .visual-label {
    font-family: 'JetBrains Mono', monospace;
    color: var(--theme-primary);
    font-weight: bold;
    text-transform: uppercase;
    font-size: 1.2em;
  }

  .img-prompt {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: #444;
    margin-top: 10px;
    max-width: 60%;
    text-align: center;
  }

  /* --- Specific Adjustments --- */
  .accent { color: var(--theme-primary); }
  
  /* Title Slide Specifics */
  .title-h1 { font-size: 80px; color: #fff; letter-spacing: -2px; }
  .title-h2 { color: var(--theme-secondary); font-weight: 900; font-size: 40px; }

---

<!-- _class: title-slide -->

<h1 class="title-h1">WAGYU ESCROW</h1>
<h2 class="title-h2">PROTOCOL</h2>

<div class="visual-area" style="height: 250px; width: 250px; border-radius: 50%;">
  <div class="visual-icon">🐂</div>
</div>

<p class="subtext">
  トラストレスなサプライチェーン決済<br>
  <span style="color: var(--theme-primary);">Solidity 0.8.24 × Next.js 15 × Dynamic NFT</span>
</p>

---

# BLACK BOX

<div class="visual-area">
  <div class="visual-icon">📦</div>
  <div class="visual-label">見えない・信用できない</div>
</div>

<p class="subtext">
  <strong>課題:</strong> 長期制作の生産者は<span class="accent">完成まで売上ゼロ</span>。<br>
  和牛農家は2年、陶芸家は数ヶ月、酒蔵は1年。<br>
  購入者は進捗を確認できず、<span class="accent">信頼とキャッシュフローに深い溝</span>。
</p>

<!--
Image Prompt: 真っ黒な箱（ブラックボックス）の前に立つ、困惑した農家・陶芸家・酒蔵の職人と疑い深いビジネスマン。フラットなイラスト。背景はダークグレー。
-->

---

# AUTOMATION

<div class="visual-area">
  <div class="visual-icon">⚙️ ➡️ 💰</div>
  <div class="visual-label">プロセス ＝ 支払い</div>
</div>

<p class="subtext">
  <strong>解決策:</strong> スマートコントラクトによる自動エスクロー。<br>
  資金はロックされ、条件達成で<span class="accent">即座に</span>解き放たれる。<br>
  人の介在しない、純粋な契約執行。
</p>

<!-- 
Image Prompt: 巨大な青い歯車が回ると、黄色のコインが自動的に排出される工場のライン。シンプルで幾何学的。
-->

---

# MILESTONES

<div class="visual-area">
  <div class="visual-icon">🪜</div>
  <div class="visual-label">カテゴリ別マイルストーン</div>
</div>

<p class="subtext">
  <span class="accent">wagyu: 11段階</span> / sake: 5段階 / craft: 4段階<br>
  カテゴリごとに最適化されたステップで<br>
  <span class="accent">細かく資金をアンロック</span>する。
</p>

<!--
Image Prompt: 3つのレーン（牛・酒・工芸品）がそれぞれ異なる段数の階段を持つ図。フラットデザイン。
-->

---

# DYNAMIC NFT

<div class="visual-area">
  <div class="visual-icon">🖼️ 🐂 🖼️</div>
  <div class="visual-label">進化する証明書</div>
</div>

<p class="subtext">
  <span class="accent">ListingFactoryV3</span>がNFT（ERC721）をミント。<br>
  メタデータAPI（<code>/api/nft/:tokenId</code>）で進捗を可視化。<br>
  マイルストーン達成ごとにNFTがリアルタイムに進化。
</p>

<!--
Image Prompt: 3枚のフレームが並んでいる。左から右へ、子牛→若牛→立派な和牛へと絵柄が変化している様子。
-->

---

# VELOCITY

<div class="visual-area">
  <div class="visual-icon">🚀</div>
  <div class="visual-label">キャッシュフローの加速</div>
</div>

<p class="subtext">
  「完成まで入金ゼロ」から<span class="accent">「工程ごとに入金」</span>へ。<br>
  和牛農家も、陶芸作家も、酒蔵も。<br>
  <span class="accent">創る人が、創ることに集中できる世界へ。</span>
</p>

<!--
Image Prompt: スピードメーターの針がMAX（黄色いゾーン）を振り切っている。背景に流れるような青いライン。
-->

---

# JPYC

<div class="visual-area">
  <div class="visual-icon">💴</div>
  <div class="visual-label">ステーブルコイン決済</div>
</div>

<p class="subtext">
  <span class="accent">日本円と等価</span>の価値で即時決済。<br>
  銀行振込の手数料・時間・営業時間の制約から解放。<br>
  全取引がブロックチェーン上に記録され<span class="accent">透明性を担保</span>。
</p>

<!--
Image Prompt: JPYCのロゴとコインが、銀行の建物をバイパスして直接生産者に届く図。
-->

---

# FUTURE

<div class="visual-area">
  <div class="visual-icon">🌏</div>
  <div class="visual-label">マルチチェーン対応</div>
</div>

<p class="subtext">
  現在: <span class="accent">Sepolia / Base Sepolia / Base / Polygon Amoy</span><br>
  次: Polygon PoS / Arbitrum / Optimism<br>
  <span class="accent">未来: 建設・製造業への水平展開</span>
</p>

<!--
Image Prompt: 複数のブロックチェーンのロゴが繋がったネットワーク図。
-->

---

# ARCHITECTURE

<div class="visual-area">
  <div class="visual-icon">🏗️</div>
  <div class="visual-label">ListingFactoryV3 × MilestoneEscrowV3</div>
</div>

<p class="subtext">
  出品ごとに<span class="accent">エスクロー契約とNFTが自動生成</span>。<br>
  購入時にERC20をロック、NFTは購入者へ移転。<br>
  DB不要 - Next.js + viem + MUIでオンチェーン直接読み込み。
</p>

<!--
Image Prompt: ファクトリーから複数のエスクローコントラクトが生成される図。各エスクローにNFTが紐づく。
-->

---

# TECH STACK

<div class="visual-area">
  <div class="visual-icon">🧱</div>
  <div class="visual-label">Web × Smart Contracts</div>
</div>

<p class="subtext">
  <span class="accent">Frontend:</span> Next.js 15 / viem / MUI / Framer Motion<br>
  <span class="accent">Contracts:</span> Solidity 0.8.24 / Foundry / ERC721 + ERC20<br>
  <span class="accent">Chains:</span> Sepolia / Base Sepolia / Base / Polygon Amoy
</p>

<!--
Image Prompt: ブロック（フロント、コントラクト、チェーン）が横に並ぶシンプルなスタック図。青と黄色の配色。
-->

---

# FEASIBILITY

<div class="visual-area">
  <div class="visual-icon">🔧</div>
  <div class="visual-label">実現アプローチ</div>
</div>

<p class="subtext">
  <span class="accent">技術:</span> Solidity実装済 / Polygon Amoyで動作確認 / Vercelデモ公開中<br>
  <span class="accent">検証:</span> 知り合いの和牛生産者・工芸品作家・酒蔵でテスト運用予定<br>
  <span class="accent">本番:</span> Polygon PoSメインネット + 実JPYCで決済
</p>

<!--
Image Prompt: チェックマークが付いた3つのステップ（開発・検証・本番）が並ぶ図。
-->

---

# ROADMAP

<div class="visual-area">
  <div class="visual-icon">🗓️</div>
  <div class="visual-label">アクションプラン</div>
</div>

<p class="subtext">
  <span class="accent">1月:</span> ハッカソン参加・生産者ヒアリング<br>
  <span class="accent">2-3月:</span> UI改善・テストネットで模擬取引<br>
  <span class="accent">4-5月:</span> メインネット移行・β版リリース<br>
  <span class="accent">6月:</span> 本格運用・水平展開検討
</p>

<!--
Image Prompt: 1月から6月までのタイムラインが横に並び、各月にアイコンが付いた図。
-->

---

# TRY IT

<div class="visual-area" style="background: #fff; padding: 20px;">
  <div class="visual-icon" style="color: #000; font-size: 8em;">📱</div>
</div>

<p class="subtext" style="font-family: 'JetBrains Mono'; font-size: 1.2em;">
  https://wagyu-escrow-mvp.vercel.app
</p>

<p class="subtext">
  <span class="accent">Let's Build Trust.</span>
</p>
