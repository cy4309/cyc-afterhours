AFTERHOURS /story --- R3F Cinematic Scroll Story
Cursor implementation brief · Next.js + TypeScript + Tailwind · React
Three Fiber

0. 任務目標
   將 https://afterhours.cyc-studio.com/story 建置成一個電影式 3D
   捲動敘事頁。使用者主要透過垂直捲動推進故事；只有少數時刻需要點擊。R3F
   Canvas 負責 3D 場景，HTML 負責文字、章節提示與互動說明。
   核心概念：一顆藍色抱石岩點，帶領使用者進入整面岩壁。
   視覺方向： - 暗色、極簡、克制；延續 AFTERHOURS 的夜間氛圍。 -
   藍色岩點是主要視覺識別；不要做成一般 3D 產品展示或遊戲 HUD。 -
   以尺度變化、構圖、燈光、陰影和鏡頭運動創造電影感。 -
   文字精簡，留白充足；避免滿版 UI、過度發光、過量粒子或不必要的裝飾。 -
   第一個交付版本只需完成前三幕的高品質垂直切片，架構須能延伸至完整六幕。
1. 動工前：先檢查現有專案
   在改檔前先檢查並回報： 1. package.json、Next.js 版本、App Router 或
   Pages Router、Tailwind 版本。 2. /story 對應的 route、layout、global
   CSS、字體與現有視覺規範。 3. 目前部署方式與
   next.config.\*。此專案預期部署到 Cloudflare Pages 的 static
   export；不要引入需要 SSR/API routes 的方案。 4.
   確認現有依賴、命名規則和既有元件，能重用就重用。
   接著直接實作，不要只回覆計畫。不要重建整個網站，不要修改與 /story
   無關的頁面或全站樣式，除非確實必要；若要動共用檔案，先確認影響範圍。
2. 技術限制與選型
   使用： - React Three Fiber (@react-three/fiber) - Three.js 作為 R3F
   renderer 的底層依賴 - @react-three/drei：只在實際需要時使用，例如
   useGLTF、Environment、AdaptiveDpr 等 - GSAP +
   ScrollTrigger：將捲動進度映射至鏡頭與場景時間軸 - 現有
   Next.js、TypeScript、Tailwind CSS
   不要使用： - Lenis 或另一套平滑捲動引擎 - Framer Motion（本頁動畫由
   GSAP/R3F 管理，避免動畫系統重疊） - 外部付費資產、需要 API key
   的服務或遠端執行時依賴 - SSR、API routes、伺服器端載入 3D 資產的需求 -
   為了展示效果而新增龐大依賴
   安裝套件前先確認現有依賴，避免重複安裝。GSAP ScrollTrigger 與 R3F
   的版本需相容於專案現有 React/Next.js 版本。
3. 故事體驗與章節
   完整故事規劃六幕，但本次先實作 01--03。
   01 / THE VOID --- 黑暗中的第一顆岩點

- 初始畫面幾乎全黑，中央偏離正中的位置有一顆藍色岩點。
- 使用窄光源與微弱輪廓光勾勒表面，遠處保留大量負空間。
- 初始鏡頭從遠景緩慢靠近，伴隨非常輕微的環繞，不要像產品轉盤。
- HTML 文字：AFTERHOURS、A STUDY OF MOVEMENT，並提供低調的
  SCROLL TO ENTER 提示。
- 使用者開始捲動後，岩點逐漸變大，鏡頭靠近至可看見表面起伏。
- 可選的輕互動：滑鼠移動只影響很小幅度的視差；不要讓滑鼠控制整個鏡頭。
  02 / THE SURFACE --- 表面之下
- 鏡頭貼近岩點表面，沿曲面橫移，使用 grazing light 呈現材質細節。
- 透過鏡頭角度、尺度與光影，讓觀眾感覺岩點像一片未知地形。
- 本幕結尾讓鏡頭移向岩點邊緣，利用遮擋或構圖轉場，準備揭露岩壁。
- 不要求真實微觀幾何或昂貴的位移
  shader；先用模型輪廓、材質粗糙度和光照完成效果。
  03 / THE WALL --- 岩壁顯現
- 鏡頭在一個明確節點快速拉遠，短暫停頓，再慢慢橫移。
- 揭露一面深色、略帶外傾的岩壁，牆面上有多顆重複使用的藍色岩點。
- 先只讓主路線的少數岩點受光，其他岩點在暗部若隱若現。
- 章節文字簡短出現：ONE HOLD. A WHOLE WALL.
- 本幕結束時，主路線的岩點開始依序亮起，銜接下一幕。
  後續故事預留（本次不必完整製作）
- 04 / THE
  ROUTE：岩點依序亮起，細線短暫串成路線；點擊某個抓點後，鏡頭切換至該路線的下一個視角。
- 05 / THE
  SHIFT：簡化的人體剪影完成一次移動，鏡頭從手部轉向腳部與身體重心。
- 06 / AFTERHOURS：岩點逐漸從牆面解構，只剩第一顆岩點，形成首尾呼應。

4. 捲動與鏡頭設計

- 建立一條可讀、可調整的 GSAP ScrollTrigger 時間軸；前三幕共用固定的
  Canvas 區域，頁面高度需提供足夠的敘事捲動距離。
- 以章節進度 0–1
  驅動相機位置、相機朝向/目標、岩點群組變換、燈光強度與 HTML
  文字顯示。
- 使用預先定義的 camera keyframes / chapter
  config，不要把大量魔術數字散落在 JSX。
- 鏡頭運動需有節奏：緩慢靠近 → 微距掠過 → 短促拉遠 →
  停頓。不要全程等速移動。
- ScrollTrigger 使用 scrub，讓使用者可前後捲動並逆向查看；避免只在
  onEnter 中觸發不可逆的動畫。
- 將相機更新放在 GSAP timeline 與 R3F render loop 可協調的方式中，避免
  React 每幀 re-render。優先透過 refs 修改 Three.js 物件。
- 使用 invalidateOnRefresh、ResizeObserver 或適當的 resize/refresh
  流程處理視窗尺寸改變。
- 處理 React Strict Mode 下 GSAP timeline 重複建立的問題；在 cleanup
  中 kill timeline、ScrollTrigger 和事件監聽。
- 不要強制鎖住整個瀏覽器捲動，也不要攔截一般觸控捲動。
  建議先將場景分成三個章節區段，每段約一個 viewport 高度到 1.5 個 viewport
  高度，再依實際節奏調整。不要先假設固定秒數；故事長度應由使用者的捲動節奏決定。

5. 3D 場景與資產
   第一版資產策略

- 若 repo 已有合適的岩點模型，優先重用。
- 若沒有，先用程式化幾何做出一顆有機、不規則的岩點原型，避免以完美球體代替。
- 將岩點模型封裝成可重複使用的 component/asset；後續可替換為 GLB。
- 用同一組模型建立多顆岩點，透過位置、旋轉、縮放、色彩和材質參數做差異化。
- 岩壁可先用簡化的彎曲/傾斜平面或低多邊形表面，不必先製作高精度岩場。
  效能
- 如果同一模型需要大量重複，評估
  InstancedMesh；但互動的個別岩點要能被可靠識別。若使用
  InstancedMesh，保留 instanceId 到岩點資料的對應。
- 幾何、材質與貼圖盡量共用；不要每顆岩點建立獨立且重複的材質。
- 避免大量即時陰影。先用一盞主光、輪廓光、低強度環境光；只有確認必要時才開陰影。
- 不要一開始就加入體積霧、全螢幕景深、Bloom
  疊加等昂貴後製。先以燈光、霧化背景和構圖建立深度。
- Canvas 使用適當的 DPR 上限；支援 prefers-reduced-motion
  與較低效能裝置的簡化模式。

6. 視覺與 UI 規範

- Canvas 是主體，HTML 只提供必要的章節文字與進度提示。
- 文字採簡短英文標題，搭配低調的編號或輔助文字；字體沿用現有網站字體。
- 文字進出場需與鏡頭節奏協調，但不可遮擋主要岩點。
- 不要加入傳統導覽列、卡片式內容、明顯按鈕牆或遊戲化分數 UI。
- 滾動提示在開始捲動後淡出；章節文字不應每幀更新 React state。
- 保留鍵盤與觸控可操作性；所有可點擊岩點都要有清楚的 hover/focus
  狀態與可理解的提示。
- 避免用顏色作為唯一辨識資訊；可用亮度、輪廓或文字補充。

7. 建議檔案結構
   依現有專案規範調整，不要為了符合這份範例而大幅搬動檔案：
   app/
   story/
   page.tsx
   components/
   StoryExperience.tsx
   StoryCanvas.tsx
   StoryOverlay.tsx
   ClimbingHold.tsx
   WallScene.tsx
   useStoryTimeline.ts
   storyConfig.ts
   建議職責： - page.tsx：頁面入口，盡量保持精簡。 -
   StoryExperience.tsx：組合 Canvas、捲動容器和 HTML overlay。 -
   StoryCanvas.tsx：R3F Canvas 與場景內容。 -
   ClimbingHold.tsx：單顆岩點模型與材質。 -
   WallScene.tsx：岩壁、岩點配置、燈光。 -
   useStoryTimeline.ts：GSAP/ScrollTrigger 設定與 cleanup。 -
   storyConfig.ts：章節進度、相機關鍵幀、岩點位置等設定。 -
   StoryOverlay.tsx：標題、章節提示與捲動指引。
   若實際使用 src/app 或其他路由結構，請遵循現有結構。
8. Next.js 與 R3F 注意事項

- 3D Canvas 與依賴 window、WebGL 的程式碼必須只在 client component
  執行（'use client'）。
- 不要在 server component 的 render 階段建立 Three.js 物件。
- 若目前是 Next.js static export，確保此頁沒有 SSR/API route
  依賴；必要時採用適合現有版本的 client-only dynamic
  loading，並提供不依賴 WebGL 的靜態 fallback。
- 不要修改現有 output: 'export' 或 Cloudflare Pages build
  設定，除非檢查後發現本頁確實需要且先說明原因。
- 不要在首次載入前一次下載大型 3D
  資產；先載入第一幕必要資產，後續資產再延遲載入。

9. 無 WebGL / 行動裝置 / 無障礙

- 若 WebGL 不可用或 Canvas 初始化失敗，顯示靜態暗色背景與岩點
  fallback，頁面仍可閱讀。
- 行動裝置保留捲動敘事，但減少岩點數量、像素比、粒子與陰影。
- 若使用者啟用
  prefers-reduced-motion，改用較短、較少位移的章節轉場；不可只把整頁動畫停在錯誤中間狀態。
- 不可用 overflow: hidden 永久禁用頁面捲動。
- 避免在 touch 裝置依賴 hover 才能理解互動。

10. 驗收標準
    功能

- /story 可正常開啟；原網站其他頁面未被破壞。
- 往下捲動可依序完成第一、二、三幕；往上捲動可逆向播放。
- 視窗 resize 後相機與章節進度仍正確。
- 初始載入、快速捲動、反向捲動不會留下重複動畫或錯誤狀態。
- 滑鼠、觸控板與觸控螢幕都能正常捲動。
- 若有岩點點擊互動，點擊只改變預期狀態，不會意外阻止頁面捲動。
  視覺
- 第一眼清楚看見黑暗中的單顆藍色岩點。
- 微距鏡頭有尺度感與光影細節，而非單純把模型放大。
- 第三幕的拉遠能明確揭露岩壁，形成可感知的視覺轉折。
- 文字精簡，岩點是主角，沒有多餘 UI。
- 動畫節奏具有停頓與加速，不是均速滑動。
  工程
- TypeScript 無新增錯誤，console 無持續性錯誤。
- GSAP、ScrollTrigger、event listeners 均正確 cleanup。
- 沒有在每一幀觸發 React state 更新。
- 模型、材質、貼圖沒有不必要重複載入。
- 專案原本的 build/lint/typecheck
  指令可通過；若原專案已有既存錯誤，清楚列出，不要掩蓋。

11. 建議 Cursor 執行順序
1. 檢查現有 repo、/story
   route、依賴與部署設定，先列出將修改/新增的檔案。
1. 實作一顆有機藍色岩點、黑暗場景、主光與輪廓光。
1. 加入 GSAP ScrollTrigger，完成第一幕的遠景推近與第二幕微距橫移。
1. 建立簡化岩壁和多顆重複岩點，完成第三幕的拉遠揭露。
1. 加入 HTML 標題、章節提示與淡入淡出。
1. 加入 resize、cleanup、reduced-motion、WebGL fallback 與手機降級。
1. 執行專案已有的 lint/typecheck/build，修正本次引入的錯誤。
1. 最後回報：修改檔案、已完成的分鏡、尚未完成的後續章節、測試結果與已知限制。
   本次範圍不要擴張：
   先把前三幕做得有質感；暫不實作完整人物攀爬動畫、物理模擬、複雜 shader
   或六幕完整故事。可以為後續保留乾淨的架構，但不要為未實作的功能過度抽象。
1. 開始執行
   請先檢查專案的實際狀態，再依上述規格直接修改程式碼。若遇到必要的設計決策，採用最簡單、效能合理、符合
   Afterhours 視覺方向的方案，並在完成後說明取捨。不要只產生假資料或靜態
   mockup；至少讓前三幕的 3D 場景與捲動鏡頭實際運作。
