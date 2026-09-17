# Phase 1–2 現況盤點與 Motion Prototype 規劃

> 讀過 `docs/visual-motion-spec.md` 之後的工作文件。  
> **這份不是整站視覺實作清單。** 不一次做 Phase 3–5，也不加彼此無關的酷炫動畫。  
> 目的：先看清楚現況穩不穩，再規劃一個**彼此有連接關係**的 Motion Prototype。

規格核心句：

> How does this state connect to the state before and after it?

不是：

> What animation can we add here?

---

## 0. 現況一句話

Phase 1 功能鏈已經通：上傳 → R2 → D1 → Archive → Detail。

Phase 2 只完成「有卡片、有篩選、有海報」。Hover preview、viewport playback、篩選時空間連續，都還沒做。

現在最大的風險不是缺動畫，而是 **狀態之間是硬切頁**：點卡片換路由、篩選換 URL 重抓、Upload 成功 `router.push("/")`。若現在直接上 GSAP Flip / shared element，會做出一堆無法對上前後狀態的效果。

---

## 1. Phase 1 — Functional Foundation

規格要求確認這條鏈：

```text
Upload → R2 → D1 → Archive → Video Detail
```

不需要華麗動畫。

| 項目 | 狀態 | 現況 |
| --- | --- | --- |
| Upload 表單 | 有 | `src/app/upload/page.tsx` + `UploadForm.tsx` |
| 直傳 R2 / 本機 mock | 有 | signed PUT；mock 寫 `.data/uploads` |
| 上傳時抽海報 JPEG | 有 | `inspectVideoFile` → `posterKey` |
| D1 / mock metadata | 有 | `climbs-service` → repository |
| Archive 列表 | 有 | `/` 讀 `listClimbsWithMedia` |
| 依填寫日期、新到舊 | 有 | mock 與 D1 都 `date DESC, createdAt DESC` |
| 等級篩選 ALL–V4 | 有 | `/?grade=`，伺服器過濾 |
| Video Detail | 有 | `/climb/[id]`，9:16 播放 |
| UI 不直接碰 D1/R2 | 有 | 符合 spec §25 |
| Loading 作為入場 | 弱 | `loading.tsx` 只是 wordmark，沒有 reveal |
| Upload success → 物件進入 archive | 無 | 成功後硬導回 `/` |
| Detail Previous / Next | 無 | 只有回 Archive 的 link |
| V5 | 型別有、UI 無 | `CLIMB_GRADES` 含 V5，filter 未露出（規格寫 future，可暫緩） |

**Phase 1 結論：功能基礎已過關。** 剩下的缺口都屬於「狀態怎麼連」，應進 Prototype，不是再堆 CRUD。

不要在這個階段補：About、統計、dashboard、WebGL、Lenis。

---

## 2. Phase 2 — Archive Interaction

規格要求：

```text
Video Card
Hover
Video Preview
Grade Filter
Viewport Playback
```

視覺仍保持相對簡單。尚未進入 shared-element。

### 2.1 Video Card

| 規格 | 現況 |
| --- | --- |
| 視為同一個 visual object | 卡片與內頁是兩套 DOM，沒有 shared identity |
| 外層 16:9 object-cover | 有（`aspect-video`） |
| 內頁直式 9:16 | 有 |
| 預設海報、不掛大量 `<video>` | **有海報時只顯示 `<img>`**，符合 §16 效能 |
| 無海報 fallback | IntersectionObserver 後載 video、seek 第一幀 |
| 下方日期 | 有；hover 不出現 grade / attempts |

卡片還不是「會在 CARD → HOVER → PREVIEW → OPEN 之間連續變形的物件」，只是 grid 裡的連結。

### 2.2 Hover

現況：左下角 play icon `opacity-0 → 100`（150ms），沒有 scale、沒有 metadata、沒有預覽。

規格 desktop hover：

- 輕微 scale
- metadata 出現
- 可開始 muted preview
- cursor 改變

規格也說：**必要資訊不能只靠 hover**（§26）。日期已常駐，這點是對的。grade / attempts 若只在 hover 出現，mobile 要另有出路。

### 2.3 Video Preview / Viewport Playback

規格 §15：

```text
enter viewport → poster → video → play
leave viewport → pause
```

現況：**有 `posterUrl` 時 Archive 完全不載 video。** 這對 100+ 支影片是正確的效能選擇，但 Phase 2 的「preview」因此不存在。

建議的 Phase 2 行為（先寫死，後續 Phase 3 沿用）：

```text
DEFAULT     只顯示 JPEG
IN VIEW     仍顯示 JPEG（不自動播）
HOVER/FOCUS 才把 video 疊上去 muted loop preview
LEAVE       pause + 卸 video 或保留 paused
OPEN        進 detail 再播正片
```

Mobile 沒有 hover：不要自動播全部 in-view 影片。Preview 可省略，tap 直接 OPEN。Viewport autoplay 留到有明確需要再做，否則會和 §16、§21 衝突。

### 2.4 Grade Filter

現況：`GradeFilter` 是 `<Link href="/?grade=V3">`。每次點擊：

1. 換 searchParams
2. Server Component 重抓已過濾的 list
3. Archive 整表 remount
4. 消失的卡片不是「收進空間」，是 DOM 被刪掉

規格要的是：archive 這個空間自己重組。GSAP Flip 被點名，但 §12 寫：

> Do not introduce GSAP Flip until the underlying layout and data flow are stable.

**現在資料流不穩定到可以 Flip。** 篩選若繼續走硬導航，後面做的 filter 動畫都會是假的。

### 2.5 Scroll as Navigation

現況：Archive 包在 `ScrollArea`（`h-dvh` / `md:h-[400px]`）裡，是**內嵌捲動**，不是文件捲動在揭示 archive。

規格 §13 把 scroll 當成走進空間、甚至依月份分組。那是 Phase 3–4 的結構，不是 Phase 2 必做。但要記：**內嵌固定高度會讓之後的 loading reveal、shared element、Lenis 全部難接。** Prototype 時應評估改回文件流。

---

## 3. 會卡住後續 Motion 的結構債

這些不是特效，是 Phase 3 之前必須對齊的前提。

### 3.1 硬路由切頁

```text
/  →  /climb/[id]  →  /
```

沒有 persistent archive。卡片一點就卸載。Shared element（規格最重要的過渡）做不出來，除非改成：

- Archive 常駐，Detail 當 overlay / parallel route；或
- View Transitions API 對同一個 DOM 節點；或
- 先用 client state machine，路由只做 URL 同步

**Motion Prototype 不需要一次改完架構，但每個 prototype 必須假設「之後會往這方向走」，不能繼續加深硬切頁。**

### 3.2 外 16:9、內 9:16

Shared element 會遇到比例突變。Prototype 先承認這是設計決策，不要用動畫硬圓過去。Phase 3 再決定：

- 展開過程中 crop 從 16:9 走到 9:16；或
- detail 仍 16:9；或
- 卡片改直式

現在不要三種一起試。

### 3.3 篩選 = 伺服器過濾 + remount

Phase 2 prototype 應改為：**一次拿 ALL，client 過濾**（資料量現在約數十筆，可接受）。URL 仍可同步 `?grade=`，但 grid 不該因此拆掉。

1000+ 時再做 metadata 分頁；那是 §16 的未來，不是現在。

### 3.4 沒有 prev / next 資料

Detail 不知道相鄰物件。Phase 2 不必做 film-strip 動畫，但 list 順序（日期新到舊 + 目前 filter）要成為單一來源，Detail 才能之後接上。

### 3.5 還沒有 motion language

沒有共用 duration / easing。唯一動畫是 play icon 150ms。規格 §18–19 的 tokens 應在任何過場之前先存在。

### 3.6 套件

未裝 GSAP / Flip / ScrollTrigger / Lenis / Three。這是對的。Phase 2 prototype **不要為了看起來完整而先裝**。CSS + 既有 IntersectionObserver 夠做 hover / preview / 簡單進出。Flip 只在 filter 的資料流改成 client 重組之後才引入。

---

## 4. 元件對照（spec §24 vs 現況）

規格建議 `archive/` `climb/` `upload/` `motion/`。

現況全在 `src/components/climbing/`：

| 規格 | 現況 | 備註 |
| --- | --- | --- |
| Archive / ArchiveGrid | `Archive.tsx` 兩者混在一起 | Prototype 可先拆 Grid，不必一次搬資料夾 |
| VideoCard | 有 | 缺 HOVER / PREVIEW 狀態 |
| GradeFilter | 有 | 應改成「通知 Archive」而不是自己導航卸載 |
| ArchiveTransition | 無 | Phase 3，現在不要做 |
| ClimbDetail / Video / Meta / Navigation | page 內聯 + `VideoPlayer` | 無 prev/next |
| UploadProgress / Success | 進度條在 form 內，無 success 場景 | Phase 3 最後才接回 archive |
| `motion.ts` | 無 | **Prototype 0 要先有** |

現在就大搬資料夾沒有幫助。先讓狀態機清楚，再搬。

---

## 5. Motion Prototype 規劃

原則：每個 prototype 必須寫清 **起點、終點、誰留下、誰消失、誰移動**。做完要能接到下一個，而不是獨立 demo。

不要做：隨機 parallax、拆字、自訂 cursor、背景一直動、scroll hijack、WebGL、Loading 拖很久、filter 用 GSAP 卻仍 remount。

### Prototype 0 — Motion tokens（不產生可見特效）

**連接：** 之後所有 prototype 共用同一套時間。

```ts
// 建議落點：src/lib/motion.ts（之後才進 components/motion）
export const motion = {
  fast: 0.2,    // hover / micro
  normal: 0.45, // layout / filter
  slow: 0.8,    // scene
  scene: 1.0,
} as const;
```

Easings 先用 CSS：`cubic-bezier` 對應 power2.out / power3.out。  
`prefers-reduced-motion: reduce` 時 duration → 0，導航仍可用。

**完成定義：** tokens 存在、卡片 hover 若已有過渡必須引用它。沒有任何裝飾動畫。

### Prototype 1 — Card 作為物件：DEFAULT ↔ HOVER

**起點：** JPEG 卡片，日期常駐。  
**終點：** 同一張卡片仍在原位。  
**留下：** 海報、日期、在 grid 的位置。  
**出現：** 極少 metadata（建議只加 grade；attempts 有才顯示）。  
**移動：** scale 約 1 → 1.02，不要飛出格子。  
**時間：** `motion.fast`。  
**Mobile：** 無 hover；metadata 可常駐一行或完全不靠 hover。Tap 仍進 detail。

Preview 先不做。這一步只證明卡片是物件、不是選單 item。

**完成定義：** desktop hover 可逆；reduced motion 只改 opacity 或什麼都不做；grid 不因 hover 重排。

### Prototype 2 — HOVER → PREVIEW（僅 desktop、僅 in-view）

**起點：** Prototype 1 的 hover 卡。  
**終點：** 仍是那張卡，不是 detail。  
**留下：** 同一 crop、同一位置。  
**出現：** 一層 muted / playsInline / loop 的 video，疊在 JPEG 上。  
**消失：** mouse leave 或滑出 viewport → pause，回到 JPEG。  
**同時最多：** 1 支 preview（或 visble 且 hovering 的那一支）。禁止 in-view 全部 autoplay。

沿用現有 IntersectionObserver：先判斷 in-view，再允許掛 `<video>`。

**完成定義：** 有海報的卡不再為了第一幀去載影片；只有 preview 時才載。網路分頁仍可點進 detail。

### Prototype 3 — Filter 是重組，不是換頁

這是 Phase 2 最關鍵、也是唯一會動到資料流的 prototype。

**起點：** ALL 的 grid。  
**終點：** 同空間裡只剩該 grade，位置靠上重排。  
**留下：** 符合條件的卡片 DOM（同一 `key=climb.id`）。  
**消失：** 不符合的卡片 opacity → 0、scale 略縮，然後才 `display`/`pointer-events` 拿掉。  
**移動：** 留下的卡片走到新格子。第一版用 CSS 即可（FLIP 手寫或 `transition` on transform）。**先不要裝 GSAP Flip。**

實作約束：

1. Home 改拿 **未過濾的完整 list**（或 Archive 改 client，filter 在記憶體做）。
2. `?grade=` 仍可寫入 URL，但不靠換頁卸載 grid。
3. 排序維持填寫日期、新到舊。

**完成定義：** 連點 ALL → V3 → V2 → ALL，卡片身份不斷；沒有「清空再出現」。若這步不穩，禁止進入 Phase 3 的 Archive → Detail。

### Prototype 4 — Loading 只做短入場（可選、最後）

規格 Loading → Archive 是 Phase 3 第 6 項。Phase 2 若要碰，只允許：

- wordmark 短暫在場
- archive 已在 DOM 裡被揭開，而不是 spinner 後才 mount
- 0.6–1.2s，可 skip

**不要**做成獨立品牌片。若與 Prototype 3 搶時間，砍掉這個。

---

## 6. 明確不做（直到 Prototype 3 穩定）

| 項目 | 原因 |
| --- | --- |
| Archive ↔ Detail shared element | 硬路由 + 16:9/9:16 未解決 |
| Detail prev/next film-strip | 還沒有相鄰物件模型 |
| Upload success 飛進格子 | 還在 `router.push` |
| GSAP / Flip / ScrollTrigger / Lenis | 資料流與 layout 不穩 |
| Three / WebGL | 規格禁止當第一視覺系統 |
| 月份 timeline 分段 | §13 尚未被 layout 證明需要 |
| 自訂 cursor、拆字、全域 parallax | Level 3，Level 1 還沒開始 |
| 改 IA、加頁面 | 規格 §31 |

Phase 3 建議順序（**現在只記著，不要做**）：

```text
1. Archive → Detail
2. Detail → Archive
3. Previous → Next
4. Grade Filter（此時才升級 Flip）
5. Upload → Archive
6. Loading → Archive
```

Filter 在 Phase 2 用 CSS 重組，Phase 3 再換成 Flip，是同一條線，不是兩套動畫。

---

## 7. 建議的下一個實作 prompt

一次只做 **Prototype 0 + 1**。不要順便做 preview、filter、detail 過場。

範圍：

- 新增共用 `motion` tokens 與 `prefers-reduced-motion`
- VideoCard：DEFAULT ↔ HOVER（scale + 最少 metadata）
- 不改路由、不裝 GSAP、不自動播放

完成後再單獨做 Prototype 2，然後 Prototype 3。

每一步都先回答規格那 8 件事：starting state、ending state、persist、disappear、move、timing、easing、mobile。
