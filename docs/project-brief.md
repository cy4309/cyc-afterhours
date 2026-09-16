# cyc-afterhours — Project Brief

專案名稱：**cyc-afterhours**。

Climbing Archive 是這個專案的第一個公開表面，不是專案的全部。後續可以在同一個 Cloudflare Worker / D1 / R2 上長出其他 afterhours 內容。

目前第一個表面的核心概念：

> A visual climbing archive documenting my bouldering results through video.

網站本身要有很強的視覺與生活態度，接近 Supreme / Awwwards 類型的 editorial / visual experience。

作品本身就是個人介紹，不需要 About、履歷、成長故事或自我介紹。

這不是一般的抱石紀錄 App，也不是個人履歷網站。

---

## 1. 技術目標

目前專案使用：

- Next.js
- TypeScript
- Tailwind CSS

後續使用 Cloudflare 生態：

- Cloudflare Pages：網站部署（專案名 `cyc-afterhours`）
- Cloudflare Workers：API / server-side logic（Worker 名 `cyc-afterhours`）
- Cloudflare R2：影片與圖片 storage（bucket `cyc-afterhours`）
- Cloudflare D1：metadata database（database `cyc-afterhours`）

暫時不要：

- Supabase
- Firebase
- Vercel
- Cloudinary
- Prisma
- 第三方 CMS

Storage / database 邏輯必須抽象成 service layer，未來可以替換 implementation。

---

## 2. 核心產品概念

第一個公開表面：Climbing Archive。

網站只需要非常少的頁面。

主要狀態：

1. Loading / Intro
2. Climbing Archive
3. Video Detail
4. Upload

不要建立：

- About
- Resume
- Blog
- Contact
- Dashboard
- Social feed
- Achievement page
- Progress tracking

這不是 fitness tracker。這是一個視覺化 climbing archive。

---

## 3. Homepage / Archive

首頁是整個作品最重要的地方。

概念：

```text
CLIMBING ARCHIVE

ALL     V1     V2     V3     V4

        VIDEO
             VIDEO

   VIDEO

              VIDEO

        VIDEO
```

內容以 climbing videos 為主。

不要做成：

- YouTube
- Instagram
- Card dashboard
- SaaS UI

應該更接近：

- editorial
- fashion lookbook
- Supreme website
- Awwwards interactive website
- visual archive

---

## 4. Grade Filter

影片依 climbing grade 分類：

```text
ALL
V1
V2
V3
V4
V5
```

第一版先支援：

- ALL
- V1
- V2
- V3
- V4

未來可以增加 V5+。

Filter 不應該只是普通 tab。之後視覺階段會讓它成為主要 interaction。目前先建立乾淨的資料流。

---

## 5. Video Data Model

D1 建立 `climbs` table。

建議欄位：

```text
id
grade
date
gym
location
attempts
video_key
poster_key
duration
created_at
updated_at
```

其中：

`video_key` 代表 R2 object key。例如：

```text
climbing/2026/09/v3-20260915-001.mp4
```

`poster_key` 例如：

```text
climbing/2026/09/v3-20260915-001.jpg
```

不要把完整 URL 當成主要資料。Storage key 才是 source of truth。

---

## 6. R2 Storage

所有原始影片與圖片存放在 Cloudflare R2。

建議：

```text
R2
│
├── climbing/
│   ├── 2026/
│   │   ├── 09/
│   │   │   ├── v3-20260915-001.mp4
│   │   │   ├── v3-20260915-001.jpg
│   │   │   └── ...
│
└── original/
```

第一版可以簡化 storage structure，但 architecture 可以擴充。

重要：不要讓 Next.js server 成為影片 upload proxy。

正確流程：

```text
Browser
   ↓
Worker
   ↓
Generate signed upload URL
   ↓
Browser directly uploads
   ↓
R2
```

影片不要：

```text
Browser → Next.js → Worker → R2
```

避免 server 成為大型檔案傳輸瓶頸。

---

## 7. Upload Page

建立：

```text
/upload
```

第一版功能：

```text
Video
[ Select video ]

Grade
[ V1 / V2 / V3 / V4 ]

Date
[ date ]

Gym
[ text ]

Location
[ optional ]

Attempts
[ number ]

[ Upload ]
```

Upload 流程：

```text
1. User selects video
2. Frontend requests upload authorization from Worker
3. Worker generates signed R2 upload URL
4. Browser uploads directly to R2
5. Upload success
6. Frontend sends metadata to Worker
7. Worker writes record to D1
8. Redirect back to archive
```

請處理：

- upload progress
- uploading state
- success state
- error state
- cancel / retry

不要讓使用者在 upload 時看到空白畫面。

---

## 8. Video Loading Strategy

效能非常重要。首頁未來可能有大量影片。

不要：

```text
render 100 videos
↓
browser downloads 100 videos
```

應該：

```text
D1
 ↓
fetch metadata
 ↓
render posters
 ↓
lazy load videos
 ↓
play only when visible
```

第一版請建立 `VideoCard`，支援：

- poster
- video
- loading
- isVisible
- isPlaying

使用 IntersectionObserver。只有影片進入 viewport 時才開始載入 / 播放。

影片預設：

```html
muted
playsInline
loop
```

不要 autoplay sound。

---

## 9. Video Card

建立 reusable：

```text
components/climbing/VideoCard.tsx
```

目前只需要支援：

- video
- poster
- grade
- date
- gym
- attempts

但是 metadata 預設不要全部顯示。視覺階段會決定 hover 時如何出現。先確保 component API 乾淨。

---

## 10. Video Detail

點擊影片後進入：

```text
/climb/[id]
```

內容：

```text
VIDEO

V3
Gym
Date
Attempts
```

影片放大展示。先不要做複雜 sidebar。頁面應該保持極簡。

---

## 11. Architecture

請建立清楚的 separation：

```text
app/
├── page.tsx
├── upload/
│   └── page.tsx
└── climb/
    └── [id]/
        └── page.tsx

components/
├── climbing/
│   ├── Archive.tsx
│   ├── VideoCard.tsx
│   ├── GradeFilter.tsx
│   └── VideoPlayer.tsx
│
└── ui/

lib/
├── db/
│   └── climbs.ts
│
├── storage/
│   └── r2.ts
│
└── types/
    └── climbing.ts

workers/
├── upload.ts
├── climbs.ts
└── storage.ts
```

如果目前 Next.js + Cloudflare 的 runtime 結構不同，可以依實際 framework 最佳實務調整。

重點是：

**UI 不應該直接操作 R2 / D1。**

應該：

```text
UI
 ↓
API / service
 ↓
D1 / R2
```

---

## 12. TypeScript

建立 shared types：

```ts
type ClimbGrade = "V1" | "V2" | "V3" | "V4" | "V5";

interface Climb {
  id: string;
  grade: ClimbGrade;
  date: string;
  gym: string;
  location?: string;
  attempts?: number;
  videoKey: string;
  posterKey?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}
```

不要到處自行定義相似型別。

---

## 13. Development Data

在 Cloudflare D1 尚未建立完成前，可以提供 mock data。

例如：

```ts
const mockClimbs = [
  {
    id: "demo-v3-001",
    grade: "V3",
    date: "2026-09-15",
    gym: "Demo Gym",
    attempts: 3,
    videoKey: "demo/v3-001.mp4",
    posterKey: "demo/v3-001.jpg",
  },
];
```

但是：

**不要把 mock data 與 production data 混在一起。**

---

## 14. Environment Variables

所有 Cloudflare credentials：

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
D1_DATABASE_ID
```

不要 hardcode。不要 commit `.env` / `.env.local`。提供 `.env.example`。

---

## 15. Cloudflare

專案最終部署：

```text
Cloudflare Pages
       ↓
Cloudflare Workers
       ↓
D1
       ↓
R2
```

請優先使用 Cloudflare 官方支援的 Next.js deployment / adapter。

如果某個 Next.js 功能與 Cloudflare runtime 不相容，不要自行偷偷換成 Vercel API。先指出問題並採用 Cloudflare compatible implementation。

---

## 16. 第一階段不要做的事情

目前不要加入：

- GSAP
- Lenis
- Three.js
- Framer Motion
- WebGL
- fancy cursor
- page transition
- parallax
- complex loading animation
- sound design

這些會在第二階段處理。

第一階段目標只有：

> 建立一個可靠的「上傳 → R2 → D1 → Archive → Video Detail」資料流。

---

## 17. Code Quality

- 使用 TypeScript
- 避免 any
- 建立 reusable components
- 不要過度 abstraction
- 不要建立沒有用途的 generic framework
- 保持 component 小而清楚
- server / client boundaries 清楚
- storage / database implementation 與 UI 分離

如果需要做 architectural decision，請優先選擇：

> Simple > Flexible > Clever

---

## 18. 第一階段完成後應提供

1. 完整 project structure
2. Cloudflare Pages / Workers / R2 / D1 各自負責什麼
3. local development 如何執行
4. 如何建立 D1 schema
5. 如何建立 R2 bucket
6. upload flow
7. production deployment flow
8. 目前還沒有實作的 Awwwards visual features

不要在沒有必要的情況下加入額外套件。

先完成 architecture 與 data flow，再進入 visual design。

---

## Implementation notes

實際落地時依現有 Next.js `src/` 結構與 Cloudflare 官方 adapter 做了這些調整：

- 專案、Worker、D1、R2 名稱都是 `cyc-afterhours`。
- 原始碼在 `src/`。Worker 實作在 `src/workers/`。
- 部署使用 `@opennextjs/cloudflare`。Next.js app 本身就是 Cloudflare Worker；Route Handlers 就是 API，不再另開一支獨立 Worker。
- `DATA_SOURCE=mock` 走本機 JSON / 檔案；`DATA_SOURCE=cloudflare` 走 D1 + R2。兩套 implementation 分開。
- Mock 上傳才會經過 `/api/uploads/local`。Production 是瀏覽器直傳 R2 signed URL。
- R2 object key 仍用 `climbing/...`，那是內容分類，不是專案名稱。
- 操作說明見根目錄 `README.md`。
