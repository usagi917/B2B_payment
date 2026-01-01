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
  <span style="color: var(--theme-primary);">Solidity 0.8.24 × Next.js 15</span>
</p>

---

# BLACK BOX

<div class="visual-area">
  <div class="visual-icon">📦</div>
  <div class="visual-label">見えない・信用できない</div>
</div>

<p class="subtext">
  <strong>課題:</strong> 生産者は2年間売上ゼロ。<br>
  購入者は牛が本当に育っているか確認できない。<br>
  <span class="accent">信頼とキャッシュフローの深い溝。</span>
</p>

<!-- 
Image Prompt: 真っ黒な箱（ブラックボックス）の前に立つ、困惑した農家と疑い深いビジネスマン。フラットなイラスト。背景はダークグレー。
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

# 11 STEPS

<div class="visual-area">
  <div class="visual-icon">🪜</div>
  <div class="visual-label">成長に連動したマイルストーン</div>
</div>

<p class="subtext">
  導入(20%) → 肥育(30%) → 成熟(30%) → 完了(20%)<br>
  牛の生物学的な成長ステージに合わせて<br>
  <span class="accent">細かく資金をアンロック</span>する。
</p>

<!-- 
Image Prompt: 11段の階段を登っていく牛のシルエット。各段にコインが置かれている。横からの視点。フラットデザイン。
-->

---

# DYNAMIC NFT

<div class="visual-area">
  <div class="visual-icon">🖼️ 🐂 🖼️</div>
  <div class="visual-label">進化する証明書</div>
</div>

<p class="subtext">
  契約の状態（ステート）を<span class="accent">可視化</span>。<br>
  写真や体重データが提出されるたび、<br>
  NFTの絵柄がリアルタイムに進化する。
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
  「2年に1回の入金」から<span class="accent">「毎月の入金」</span>へ。<br>
  生産者の経営リスクを劇的に低減。<br>
  お金の巡りを、牛の成長スピードに合わせる。
</p>

<!-- 
Image Prompt: スピードメーターの針がMAX（黄色いゾーン）を振り切っている。背景に流れるような青いライン。
-->

---

# FUTURE

<div class="visual-area">
  <div class="visual-icon">🌏</div>
  <div class="visual-label">MVPから業界標準へ</div>
</div>

<p class="subtext">
  現在: 単一ロットMVP (完了)<br>
  次: 複数ロット管理・ファクトリーコントラクト<br>
  <span class="accent">未来: 建設・製造業への水平展開</span>
</p>

<!-- 
Image Prompt: 日本の地図から世界地図へ、青い線がネットワークのように広がっていく様子。
-->

---

# BUILDERS

<div class="visual-area">
  <div class="visual-icon">🤝</div>
  <div class="visual-label">WEB3 × AGRI</div>
</div>

<p class="subtext">
  Solidityエンジニア、和牛の専門家、UIデザイナー。<br>
  異なる領域のプロフェッショナルが<br>
  <span class="accent">「実世界の課題」</span>をコードで解決する。
</p>

<!-- 
Image Prompt: ラップトップPCとカウボーイハットが握手をしているようなアイコン的な構成。
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
