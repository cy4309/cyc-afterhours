# `/story` 是怎麼組成的

這份不是規格，規格在 `docs/afterhours-r3f-scroll-story.md`。

---

## 0. 先忘掉程式，看這一頁在做什麼

打開 `/story`，你會連續看到三件事：

1. **進場**：鏡頭繞著一顆藍色岩點轉一圈，停在特寫。這時牆上其他岩點是關掉的。
2. **往下捲**：鏡頭貼近表面，再突然拉遠，整面牆出現。藍色岩點依 V1 → V2 → V3 亮起。最後背景換成牆的照片。
3. **畫面上的字**：章節名、標題、SCROLL TO ENTER、時間軸，都是普通 HTML，疊在 3D 上面，不是畫在岩點上。

所以這一頁其實是兩個世界疊在一起：

| 層   | 你看到的                | 實際是什麼                              |
| ---- | ----------------------- | --------------------------------------- |
| 底下 | 岩點、牆、光、霧        | WebGL 3D（React Three Fiber，簡稱 R3F） |
| 上面 | 文字、TUNE 面板、header | 一般網頁 HTML                           |

捲動不是「換下一張圖」，是 **捲動進度 0 到 1，去推動鏡頭和燈光**。往上捲，故事會倒帶。這就是為什麼鏡頭可以來回，而不是播完就沒了。

---

## 1. 為什麼不能塞成一支檔

如果全部寫在 `WallScene.tsx` 裡，改「轉快一點」也得翻 3D 場景，改一句文案也得翻燈光，之後加第四幕會越來越不敢動。

拆檔的原則只有三句：

1. **數字放一起**（節奏、鏡頭、岩點座標）
2. **3D 放一起**（岩點長什麼樣、燈在哪）
3. **捲動和文字放一起**（什麼時候出現哪句話）

中間用一份大家都能讀寫的「現場狀態」串起來。這份東西叫 `runtime`。

把它想成拍片現場：

- `storyConfig.ts` = **分鏡表**（鏡頭停哪、哪一秒亮燈、岩點擺哪）
- `storyRuntime.ts` = **場記板**（現在鏡頭在哪、燈多亮、進場結束了沒）
- `useStoryTimeline.ts` = **場記 / 捲動導演**（你捲多少，就把場記板改成對應數字）
- `scene/WallScene.tsx` = **攝影棚**（每幀看場記板，去搬相機、調燈）
- `StoryOverlay.tsx` = **字幕機**（字已經印在玻璃上，只負責顯隱）
- `StoryTunePanel.tsx` = **調光台**（開發時把燈乘一個倍率，不改分鏡表本身）

你平常調畫面，九成時間只需要動分鏡表（`storyConfig.ts`）。

---

## 2. 一個一定要記住的機制

一般 React 網頁：資料變了 → 元件重畫 → 畫面更新。

這頁不行。3D 一秒大約畫 60 次。如果每次鏡頭移動都 `setState`，React 會被自己打死，畫面也會頓。

所以這裡的作法是：

```
你捲動
  → GSAP 直接改 runtime.proxy 裡的數字（camZ、key、route…）
  → R3F 每一幀（useFrame）去讀這些數字
  → 直接改 Three.js 的相機、燈、材質
  → React 元件本身幾乎不重畫
```

`runtime` 是一個普通的 JavaScript 物件，不是 `useState`。誰都可以改它的欄位，Scene 每一幀來抄一次。

TUNE 面板也是同一套：它改的是 `runtime.tweak`（乘數、偏移）。真正的時間軸還是 `proxy`。所以你把 Fill 拉到 2，只是「現在這盞燈再乘 2」，不是把分鏡寫死。

---

## 3. 檔案地圖

實際路徑都在 `src/components/story/`，入口是 `src/app/story/page.tsx`。

```
src/app/story/page.tsx                 路由，幾乎是空的
src/components/story/
  StoryExperience.tsx                  把捲動軌道、畫布、字幕、TUNE 疊起來
  StoryCanvas.tsx                      打開 WebGL 畫布，把場景放進去
  scene/
    WallScene.tsx                      3D 場景本體 + 每一幀的指揮
    ClimbingHold.tsx                   單顆岩點
  lib/
    buildHoldGeometry.ts               岩點的形狀（只建一次，大家共用）
    noise.ts                           讓表面凹凸的數學
    constants.ts                       藍色、螺栓孔大小
  storyConfig.ts                       分鏡表：所有可調數字
  storyRuntime.ts                      場記板：現場狀態
  useStoryTimeline.ts                  捲動 → 改場記板、改字幕透明度
  StoryOverlay.tsx                     畫面上的字
  StoryTunePanel.tsx                   開發用調光（正式站不會出現）
  storyChrome.ts                       告訴全站 header：現在要藏還是要顯示
```

往上還有 `src/components/climbing/SiteChrome.tsx`，那是全站 header。`/story` 進場時 header 在，鏡頭停住後會藏，往上滑再出現。這件事是 `storyChrome.ts` 在跟它說話，Scene 不管 header。

---

## 4. 你進 `/story` 之後，機器實際做了什麼

用一次真實進頁，把檔案串起來。看不懂某一行沒關係，看「誰在問、誰在答」。

### 4.1 頁面先組起來

`page.tsx` 只渲染 `StoryExperience`。

`StoryExperience` 做四件很土的事：

1. `createStoryRuntime()` 生出一份場記板，整頁共用。
2. 做一個很高的捲動容器（大約 6.2 個螢幕高），裡面再放一個 `sticky` 的全螢幕層。你以為在捲 3D，其實是在捲一個很長的隱形軌道；3D 畫布黏在螢幕上沒動。
3. 用 `dynamic(..., { ssr: false })` 載入 `StoryCanvas`。3D 一定要在瀏覽器裡開，不能在伺服器上畫。
4. 偵測手機、減少動態、有沒有 WebGL。沒有 WebGL 就顯示靜態 fallback。

TUNE 面板包在 `process.env.NODE_ENV === "development"` 裡，推上線不會出現。

### 4.2 畫布打開

`StoryCanvas` 只負責打開 R3F 的 `<Canvas>`：背景色、陰影、初始相機位置。相機先放在「繞圈起點」，不是特寫定點，這樣第一幀就已經在軌道上，不會閃一下。

畫布準備好以後呼叫 `runtime.onCanvasReady()`。這是在跟時間軸說：WebGL 活了，進場可以開始。不要在畫布還沒好時就播動畫，否則繞圈會直接被跳過。

### 4.3 進場繞圈（還不能捲）

`WallScene` 裡有一個名叫 `StoryDirector` 的空元件，它不畫任何東西，只在 `useFrame` 裡做事。`useFrame` = 「3D 每一幀都跑一次」，類似遊戲的 update loop。

進場期間 `runtime.introActive === true`：

1. 用經過的時間 `introTime` 去問 `sampleIntro()`（定義在 `storyConfig.ts`）：現在角度、距離、燈光該是多少。
2. 把答案寫進 `runtime.proxy`。
3. 同一幀稍後，Director 再根據 `proxy` 去搬相機、調燈。
4. 時間到了：`introActive = false`，鏡頭鎖在特寫，呼叫 `onIntroComplete`。

這就是為什麼進場不跟捲動綁在一起。進場是「時間在走」，捲動是「你的手指在走」。兩種驅動不要混。

進場時 `ExtraHolds` 把主體以外的岩點 `visible = false`。特寫階段鏡頭還很近（`camZ` 很小），其他岩點也繼續關。等鏡頭拉遠、`camZ > 8`，整面牆的岩點才出現。

### 4.4 進場結束，捲動時間軸才出生

`useStoryTimeline` 聽到 `onIntroComplete` 之後才建立 GSAP timeline。太早建的話，進場和捲動會搶同一份 `proxy`。

這條時間軸掛在 **內層那個會捲的 div** 上，不是掛在 `window`。全站 `body` 本身是鎖捲動的，真正在捲的是 class 帶 `overscroll-y-contain` 的那層。如果 ScrollTrigger 聽錯對象，進度會永遠是 0，鏡頭就不會動。

`scrub: 0.7` 的意思：捲動進度稍稍落後你的手指，有一點慣性，不是硬貼著 scrollbar。

時間軸做兩類事：

- 把 `CAMERA_KEYS` 一段段 tween 到 `runtime.proxy`（鏡頭、光、霧）
- 把 overlay 裡各段文字的 `opacity` 從 0 拉到 1 再拉回 0

藍線依時代亮起，也是 tween `proxy.route`：0 → 0.34 → 0.67 → 1。Scene 再把這個數字翻譯成「V1 亮、V2 亮、V3 亮」。

最後 `proxy.bg` 從 0 到 1，照片背景淡入，牆的顏色也一起變亮。

### 4.5 每一幀 Scene 在抄什麼

Director 每幀大約做這些（概念，不是逐行）：

```
相機位置 = proxy 的 cam + TUNE 的偏移 + 滑鼠一點點視差
燈亮度   = proxy 的 key/rim/fill × TUNE 的倍率
主岩點自發光 = proxy.hero × tweak.hero
藍線岩點亮度 = eraLit(proxy.route, 這顆是 V1 還是 V2)
霧        = proxy.fog × tweak.fog，背景照片出來時霧變淡
其他岩點  = 進場中或鏡頭還近 → 隱藏
```

所以：**GSAP 不碰 3D 物件，Scene 不解釋捲動。** 中間那份數字就是契約。

---

## 5. 每一支檔案在幹嘛

下面每支都用同一套問法：它負責什麼、你什麼時候該開它、什麼時候不該開它。

### `src/app/story/page.tsx`

幾乎是空的。Next.js 要一個 route 檔才能有 `/story`。標題用 `sr-only` 給螢幕閱讀器和 SEO，畫面上那句 AFTERHOURS 是 overlay 畫的。

平常不會改。除非要換這一頁的外層背景色或全頁結構。

### `StoryExperience.tsx`

這一頁的「舞台框」。它不知道岩點長什麼樣，只負責：

- 多高的捲動軌道（`SCROLL_VH`）
- sticky 全螢幕層
- 把 Canvas、Overlay、Tune 疊在一起
- 手機 / reduced-motion / 有沒有 WebGL

若要改「捲動要更長才到牆」，來這裡看 `SCROLL_VH`，真正節奏仍在 `storyConfig.ts` 的 `t`。

### `StoryCanvas.tsx`

WebGL 的電源開關。設定：

- 抗鋸齒（手機關掉，省效能）
- 像素比 `dpr`
- 相機 near/far
- 畫布準備好時通知 timeline

不要在這裡擺岩點或燈。那些屬於 Scene。

### `scene/WallScene.tsx`

3D 場景本體。裡面其實有幾個小角色，沒有再拆檔，因為它們都要摸同一份 `runtime`：

**燈光**

- Key：主光，聚光燈，打在岩點上
- Rim：輪廓光，讓邊緣跟黑背景分開
- Fill：補光，預設場景裡強度是 0，TUNE 的 Fill 預設乘 2，之後章節才比較用得到
- Ambient：很弱的環境光
- Hold fill：貼在岩點附近的點光，跟 `hero` 走

燈的**方向**寫在 `LIGHT_RIG`。強度不寫死在 JSX 裡，由 Director 每幀覆蓋。你在檔案裡看到 `intensity={2.2}` 只是初始值，真正亮暗看 `proxy`。

**牆**

- `WallSurface`：一塊傾斜平面，貼 `public/wall-normal.jpg`（檔名有 normal，實際當顏色貼圖用，不是法線貼圖）
- `PhotoBackdrop`：一個很大的球，貼同一張圖，只渲染內側。一開始透明，最後 `bg` 拉到 1 才看見。這就是「定點以後換成那張牆圖」

**岩點**

從 `HOLDS` 陣列生出來。主體單獨畫；其他包在 `ExtraHolds` 裡，進場 / 特寫時隱藏。

**StoryDirector**

這一檔最重要的腦。讀 `proxy` 寫 Three。加新的「隨捲動要變的 3D 東西」（例如以後路線細線），通常是：config 加一個數字 → GSAP tween 那個數字 → Director 拿去改物件。

### `scene/ClimbingHold.tsx`

一顆岩點的外殼：位置、旋轉、縮放、顏色。形狀不在這裡算，它跟所有岩點共用 `getSharedHoldGeometry()`。

三種類型：

| `kind`  | 角色                         | 材質怎麼處理                                        |
| ------- | ---------------------------- | --------------------------------------------------- |
| `hero`  | 進場那顆主體                 | 自己的材質，導演可以打自發光                        |
| `route` | 藍線故事線                   | 材質登記到 `runtime.routeMaterials`，依 V1/V2/V3 亮 |
| `fill`  | 其他路線（赭、陶土、鼠尾草） | 同色共用一份材質，比較省                            |

你要「這顆改成 V2、挪左邊一點」，不要改這個檔，改 `HOLDS`。

### `lib/buildHoldGeometry.ts` + `noise.ts` + `constants.ts`

岩點長什麼樣。流程大概是：

1. 取一個細分過的二十面體
2. 壓扁、拉長，讓它像抱石點而不是球
3. 用 `fbm` 噪聲把表面推出凹凸
4. 用 CSG 從中間減一個圓柱，變成螺栓孔
5. 結果 cache 起來，全牆共用

`constants.ts` 只有藍色 `#1e8bc5` 和孔的半徑。要改「像不像石頭」，來 geometry；要改「擺哪、什麼色」，來 `HOLDS`。

### `storyConfig.ts`

**之後你最常開的檔。** 建議從上往下記這幾塊：

**`STORY_BEATS`**  
捲動進度 0–1 上的事件點。例如牆的文案何時出現、V1/V2/V3 何時亮、何時換背景。數字是「整條捲動軌道的百分比」，不是秒。

**`CAMERA_KEYS`**  
鏡頭關鍵幀。每一格有 `t`（進度）、`position`、`lookAt`、`fov`、各盞燈。  
目前 `t = 0.58` 和 `t = 1` 的相機位置相同，意思是：**牆出現之後鏡頭不再跑，後面只靠亮燈和字幕。**

**`INTRO`**  
進場繞圈：轉多久、繞多遠、開始時燈多亮。`duration` 就是轉一圈的秒數。

**`REST_LIGHT`**  
繞完停住時的光。跟進場中段的光是兩套，所以可以「轉的時候看得到，停住再打更亮」。

**`HOLDS`**  
牆上每一顆。`era: "v1" | "v2" | "v3"` 只給藍線用。

**`frameCameraKey`**  
手機專用。手機是直的，垂直 FOV 看起來會把岩點撐滿。這裡把近景鏡頭拉遠、FOV 加大。桌機不受影響。

**`sampleIntro` / `applyIntroOrbit`**  
把「轉了幾秒」換成相機極座標。Director 只呼叫它們，不自己算三角函數。

**`eraLit(route, era)`**  
`route` 是 0 到 1 的一條進度。V1 吃前段、V2 吃中段、V3 吃後段。所以時間軸亮起是「一條數字往前走」，不是三個獨立開關。

**`SCROLL_VH`**  
軌道有幾個螢幕高。變大 = 同樣的故事要捲更久，節奏會鬆。

### `storyRuntime.ts`

場記板的型別和工廠。`createStoryRuntime()` 只會在 `StoryExperience` 裡呼叫一次（`useMemo`），所以進場狀態在 React 因 resize 重跑 effect 時還在。這就是為什麼 HMR / 重跑 hook 時，有時會覺得「進場已經播過了」。

你幾乎不會手改這個檔，除非要在場記板上加一個新欄位（例如以後的 `proxy.silhouette`）。加欄位時，記得 config、GSAP、Director 三處一起接。

### `useStoryTimeline.ts`

捲動導演。重點：

1. 進場沒結束前，不建捲動時間軸。
2. 建的時候，鏡頭從 `CAMERA_KEYS[0]` 開始一段段接到後面。
3. 文字進出場的時間寫死在這支（對應 `STORY_BEATS`）。改「哪句話何時出現」，看 beats；改「那句話寫什麼」，看 Overlay。
4. 上捲顯示 header、下捲隱藏，也在這裡聽 wheel / touch / scroll。
5. 滑鼠位置寫進 `runtime.pointer`，Director 拿去做人眼幾乎感覺不到的視差。進場時視差幾乎關掉，免得繞圈時晃。
6. `return () => { ... }` 會拆掉 timeline 和監聽。React Strict Mode 會掛載兩次，不拆就會有兩條時間軸搶 `proxy`。

### `StoryOverlay.tsx`

字幕。每個重要節點用 `ref` 掛到 `overlayRef.current.xxx`。元件自己不管動畫，初始 `opacity-0`，等 GSAP 來改。

章節名三句疊在同一個位置，用透明度切換，看起來像同一行在換字。

時間軸三行（V1 / V2 / V3）也是先淡淡出現，輪到的那行再全亮。

### `StoryTunePanel.tsx`

開發用。改 `runtime.tweak`，然後 `setDraft` 逼自己重畫面板（只有面板重畫，3D 還是靠 Director 讀 tweak）。

位置在右下，RESET 左、TUNE 右。打開時面板往上長。

正式環境整顆不渲染。

### `storyChrome.ts`

十來行的小廣播：一個布林值 + 一群監聽者。timeline 喊 `setStoryHeaderHidden(true)`，`SiteChrome` 用 `useSyncExternalStore` 聽到就淡出 header。

為什麼不直接在 timeline 裡改 header？因為 header 活在全站 layout，story 活在 `/story` 頁裡，兩邊不是父子。用這個小橋最省事。

---

## 6. 想改畫面時開哪裡

把這張表當目錄用。

| 我想改…                        | 開這個檔                                          | 改什麼                      |
| ------------------------------ | ------------------------------------------------- | --------------------------- |
| 進場轉快 / 轉慢                | `storyConfig.ts` → `INTRO.duration`               | 秒數                        |
| 進場時太暗 / 太亮              | `INTRO.startKey`、`startRim`、`startHero`         | 進場起點的光                |
| 停住後太暗 / 太亮              | `REST_LIGHT`                                      | 定點光                      |
| 繞圈繞太大圈                   | `INTRO.radiusScale`、`extraY`                     | 半徑和高度                  |
| 進場只看主體（已做）           | `WallScene.tsx` → `ExtraHolds`                    | `camZ > 8` 才顯示其他岩點   |
| 鏡頭最後不要跑掉               | `CAMERA_KEYS` 最後兩格                            | 目前已經鎖死                |
| 牆出現得太快 / 太慢            | `CAMERA_KEYS` 裡 `t: 0.58` 那格，以及 `SCROLL_VH` | 進度點 + 軌道長度           |
| V1/V2/V3 亮起間隔              | `STORY_BEATS.eraAt`、`routeSteps`                 | 捲動百分比                  |
| 某顆岩點位置、顏色、屬於哪一版 | `HOLDS`                                           | `position` / `line` / `era` |
| 牆上的字                       | `StoryOverlay.tsx`                                | 文案                        |
| 字出現的時間                   | `STORY_BEATS` + `useStoryTimeline.ts`             | 進度點                      |
| 岩點長得不像石頭               | `lib/buildHoldGeometry.ts`                        | 外形、噪聲、孔              |
| 燈的方向（不是亮度）           | `LIGHT_RIG`                                       | 世界座標                    |
| 手機岩點太大                   | `MOBILE_FRAME`                                    | 近景拉遠、FOV               |
| TUNE 位置 / 正式站出現         | `StoryTunePanel.tsx`、`StoryExperience.tsx`       | 正式站已被 `NODE_ENV` 擋掉  |
| Header 何時藏                  | `useStoryTimeline.ts` + `storyChrome.ts`          | 進場結束藏，上捲再顯示      |
| 整頁捲動沒反應                 | 先確認 ScrollTrigger 的 `scroller` 是內層 div     | 不要聽 window               |

---

## 7. 之後要自己搭，可以怎麼練

不必先學會寫 R3F。建議照這個順序建立直覺，每一段都小到可以跟 Cursor 一起做。

### 第一步：只動數字，看畫面變

打開 `storyConfig.ts`，一次只改一個：

- `INTRO.duration` 改成 `4`
- `REST_LIGHT.key` 改成 `8`
- 某一顆 `HOLDS` 的 `position` 把 x 加 `1`

刷新 `/story`。目的是建立「分鏡表 → 畫面」的反射，還沒碰到架構。

### 第二步：對一次完整進頁

看第 4 節，自己用嘴巴講一遍：

> 頁面組起來 → 畫布 ready → Director 用時間繞圈 → 結束才建 GSAP → 我捲動時 GSAP 改 proxy → Director 抄到相機上。

能講出來，之後下指令就不會把「轉快一點」說成「改 Canvas」。

### 第三步：加一個你看得到的新數字

這是以後擴第四幕的縮影。例如「牆出現以後霧再淡一點」：

1. 在 `StoryProxy` 加欄位（或直接用現有的 `fog`）
2. 在 `STORY_BEATS` 決定何時
3. 在 `useStoryTimeline` tween 它
4. 在 Director 讀它、寫到 `scene.fog`

四步缺一，畫面不會變。這就是這套架構的使用方式：**新能力 = 分鏡表一個數 + 時間軸一段 tween + Scene 一次套用。**

### 第四步：第四幕怎麼接（還沒做，但路是開的）

規格裡 04 是路線依序亮起、可點岩點。以現在的拆法：

- 新鏡頭：加 `CAMERA_KEYS`（若鏡頭仍要鎖死，就不要加）
- 新字幕：`StoryOverlay` 加 DOM + `overlayRef` 欄位
- 新時間點：`STORY_BEATS`
- 點擊：那才需要 Scene 裡讓岩點 `pointer-events` 打開（現在 Canvas 是 `pointer-events-none`，點不到 3D）
- 不要為了 04 去重寫 geometry 或把 GSAP 搬進 WallScene

### 你不需要先學會的

- Three.js 的矩陣、shader
- GSAP 全部 API（這頁幾乎只用 `timeline` + `ScrollTrigger` + `scrub`）
- 自己從零寫 CSG 岩點

你需要會的是：**指出要改的感覺，對到上面那張表，然後檢查改完的畫面。** 寫不出來可以靠 Cursor；看不懂在改哪一層，就會改錯地方。

---

## 8. 看到這些詞時怎麼理解

| 詞                         | 人話                                                    |
| -------------------------- | ------------------------------------------------------- |
| R3F / React Three Fiber    | 用 React 元件的寫法去擺 Three.js 的相機、燈、模型       |
| Three.js                   | 瀏覽器裡的 3D 引擎                                      |
| `useFrame`                 | 3D 每一幀執行，類似遊戲迴圈                             |
| GSAP                       | 動畫庫。這裡拿來把「捲動進度」變成「數字平滑變化」      |
| ScrollTrigger              | GSAP 的捲動外掛。把 scrollbar 對應到 timeline 的 0–1    |
| scrub                      | 動畫跟著捲動走，可倒帶，不是播完就結束                  |
| proxy                      | 場記板上「現在鏡頭/燈光應該是多少」那一組數字           |
| tweak                      | TUNE 面板的乘數和偏移，乘在 proxy 上面                  |
| key / rim / fill / ambient | 主光 / 輪廓光 / 補光 / 環境光                           |
| fov                        | 視野角度。越大看得越廣、物體越小                        |
| `t`                        | 整條故事的進度，0 是特寫起點，1 是最後                  |
| hero / route / fill        | 主體岩點 / 藍線岩點 / 其他顏色的配角岩點                |
| era                        | 藍線的版本：v1、v2、v3                                  |
| reduced-motion             | 系統「減少動態」；進場會縮成很短、鏡頭比較少晃          |
| SSR                        | 伺服器先畫 HTML。WebGL 不行，所以 Canvas 只在 client 載 |

---

## 9. 跟規格書怎麼分工

- 要看「這一頁應該長什麼、有哪幾幕」→ `docs/afterhours-r3f-scroll-story.md`
- 要看「程式為什麼這樣拆、我該開哪裡」→ 本檔
- 要動手改一個具體感覺（轉快、燈暗、字何時出現）→ 先查第 6 節那張表，再改對應檔案

目前只做到 01–03。04–06 在規格裡是預留，程式還沒接。接的時候延續同一條鏈：config 的數字 → timeline 的 tween → Scene 的套用 → Overlay 的字。
