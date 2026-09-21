# Story Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On `/`, ship one continuous scroll story — after work → on the way → gym → climb → real HTML video → existing archive — without Three.js/WebGL or Lenis.

**Architecture:** A pinned `StoryStage` inside `main` (the current overflow scroller) maps scroll progress `0…1` through one GSAP ScrollTrigger timeline. Hand-drawn layers are inline SVG/DOM. One real climb `<video>` is mask-revealed at the end, then the pin releases into the existing Archive. No new routes.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind, GSAP 3 + ScrollTrigger plugin, inline SVG, existing HTML video + D1/R2 climbs. No Lenis, Three.js, or WebGL.

## Global Constraints

- Chapters are visual states on `/`, not separate URLs (`afterhours-art-direction.md` §4).
- Hand-drawn world = SVG/DOM; reality = existing climb HTML video (`§3`, `§14–15`, `§33–34`).
- Scroll is the camera; ScrollTrigger maps progress to scene state (`§36–38`).
- Choose ONE illustration→video language and repeat it: **hold-shaped SVG mask expand** (`§11`).
- Do not introduce Three.js / WebGL / Lenis (`visual-motion-spec.md` §22–23, §28 Phase 5; art direction §33).
- Respect `prefers-reduced-motion`: skip the pin, show archive (`visual-motion-spec.md` §27).
- Do not mix photoreal / cartoon / AI object styles (`§9`, `§30`). Placeholder SVGs must be simple authored line drawings, swappable by file.
- Keep UI off D1/R2; reuse `listClimbsWithMedia` (`visual-motion-spec.md` §25).
- Reuse `motion` / `motionEase` from `src/lib/motion.ts`.
- SiteChrome, Upload, Climb detail, SharedMedia archive↔detail stay as they are.
- Sound is out of this slice (art direction §54 step 6 comes after the visual proof).
- Do not implement the full 9-beat MVP storyboard as unique illustrations; six beats below are enough to answer “does it feel like a story?” (`§31`, `§55`).

---

## Existing project (what we keep)

| Area | Status | Slice action |
| --- | --- | --- |
| `/` Archive + `ArchiveIntro` wordmark FLIP | Live | Replace intro overlay with story; keep Archive as the last beat |
| `main` `overflow-y-auto` + `body` `h-dvh overflow-hidden` | Live | `main` is the ScrollTrigger `scroller` |
| GSAP core (no ScrollTrigger registered) | Live | Add `gsap/ScrollTrigger` only |
| HTML `<video>` + posters via climbs-service | Live | One featured climb for the reveal |
| SharedMedia Flip for archive↔detail | Live | Do not reuse for story→video; in-stage mask is enough |
| `max-w-[720px]` column | Live | Story stage is full-bleed inside `main`; archive stays in the column |
| Hold PNGs in `public/` | Live | `hold-2.png` may texture the mask hold; story drawing is SVG |

Current conflict: `ArchiveIntro` is `overflow-hidden` and plays a paper overlay on every load. Nested `ScrollArea` also owns archive scrolling. Story cannot share that overlay model.

---

## Vertical slice media map

```text
progress     beat            draw with              motion
0.00–0.18    AFTER WORK      SVG room + character   ScrollTrigger (clock, stand, pack)
0.18–0.38    ON THE WAY      SVG street layers      ScrollTrigger (x-parallax, not a real city film)
0.38–0.56    THE GYM         SVG door / bench / wall ScrollTrigger (enter, shoes)
0.56–0.74    CLIMB           SVG climber + hold     ScrollTrigger (reach)
0.74–0.90    REAL VIDEO      HTML <video> + SVG mask  mask expand (ONE language)
0.90–1.00    ARCHIVE         existing Archive DOM   unpin; archive is document flow
```

### SVG / DOM (animate)

- Layered environment SVGs with stable element ids (`#clock`, `#backpack`, `#door`, …).
- Character as 5 poses composed from parts (`idle` / `walk` / `stand` / `reach` / `climb`) — GSAP `x/y/rotation/opacity` only, no skeletal IK.
- Chapter captions (`18:37`, `WORK IS OVER.`) as DOM text using existing `text-kicker` / `tracking-mark`.
- One recurring hand-drawn `path` whose `stroke-dashoffset` grows into a route, then a hold outline, then the video mask.

### GSAP ScrollTrigger

- One pinned stage, one timeline, derived from `progress` (not dozens of independent tweens).
- Scene ENTER / ACTIVE / EXIT are ranges on that timeline (`§38`).
- `invalidateOnRefresh: true`; `kill()` on unmount.
- Desktop and mobile share the timeline; mobile uses fewer parallax offsets (`§40`).

### HTML video

- Only the featured real climb at beat 5.
- `muted` `playsInline` `preload="metadata"`; play when the mask opens; pause if user scrolls back.
- Source from `listClimbsWithMedia("ALL")[0]` (newest). Do not fetch archive videos during story.

### Stay static / do not build

- Full Taipei geography, MRT film, rain systems, multi-climb “another → more” montage (`§16` expansion).
- Sound / voiceover.
- Lenis smooth scroll.
- Three.js, GLSL, video displacement.
- New `/story` route.
- Replacing Archive / ClimbScene / Upload.
- Per-chapter illustration production beyond placeholder SVGs.

---

## File map

- Create: `src/lib/story-progress.ts` — progress → beat
- Create: `src/lib/story-progress.test.ts` — node:test
- Create: `src/assets/illustrations/character/*.svg`
- Create: `src/assets/illustrations/environment/{room,street,gym,wall}.svg`
- Create: `src/assets/illustrations/objects/{backpack,shoes,hold}.svg`
- Create: `src/components/story/StoryStage.tsx` — pin + scroller wiring
- Create: `src/components/story/useStoryTimeline.ts` — GSAP timeline factory
- Create: `src/components/story/StoryCaptions.tsx`
- Create: `src/components/story/FootageReveal.tsx` — video + SVG mask
- Modify: `src/app/page.tsx` — render StoryStage above Archive
- Modify: `src/app/layout.tsx` — only if story needs a scroller id; prefer `id="site-scroll"` on `main`
- Modify: `src/components/climbing/ArchiveIntro.tsx` — stop using the paper overlay when StoryStage owns `/` (delete overlay path or skip rendering)
- Do not modify: `SharedMedia.tsx`, `ClimbScene.tsx`, `UploadForm.tsx`

---

### Task 1: Progress mapper

**Files:**
- Create: `src/lib/story-progress.ts`
- Create: `src/lib/story-progress.test.ts`

**Interfaces:**
- Produces: `StoryBeat`, `STORY_BEATS`, `beatAt(progress: number): StoryBeat`, `localProgress(progress: number, beat: StoryBeat): number`

- [ ] **Step 1: Add mapper**

```ts
export const STORY_BEATS = [
  { id: "after-work", start: 0, end: 0.18 },
  { id: "on-the-way", start: 0.18, end: 0.38 },
  { id: "the-gym", start: 0.38, end: 0.56 },
  { id: "climb", start: 0.56, end: 0.74 },
  { id: "footage", start: 0.74, end: 0.9 },
  { id: "archive", start: 0.9, end: 1 },
] as const;

export type StoryBeatId = (typeof STORY_BEATS)[number]["id"];
export type StoryBeat = (typeof STORY_BEATS)[number];

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function beatAt(progress: number): StoryBeat {
  const p = clamp01(progress);
  return STORY_BEATS.find((beat) => p < beat.end) ?? STORY_BEATS[STORY_BEATS.length - 1];
}

export function localProgress(progress: number, beat: StoryBeat): number {
  const span = beat.end - beat.start;
  if (span <= 0) return 1;
  return clamp01((clamp01(progress) - beat.start) / span);
}
```

- [ ] **Step 2: Test with node:test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { beatAt, localProgress } from "./story-progress";

test("beatAt maps edges", () => {
  assert.equal(beatAt(0).id, "after-work");
  assert.equal(beatAt(0.18).id, "on-the-way");
  assert.equal(beatAt(0.9).id, "archive");
  assert.equal(beatAt(1).id, "archive");
});

test("localProgress is 0 at start and 1 at end", () => {
  const gym = beatAt(0.38);
  assert.equal(localProgress(0.38, gym), 0);
  assert.equal(localProgress(0.56, gym), 1);
});
```

Run: `npx tsx --test src/lib/story-progress.test.ts`  
Expected: pass.

- [ ] **Step 3: Commit** (only if the user asked to commit)

---

### Task 2: Placeholder SVG layers

**Files:**
- Create: `src/assets/illustrations/environment/room.svg`
- Create: `src/assets/illustrations/environment/street.svg`
- Create: `src/assets/illustrations/environment/gym.svg`
- Create: `src/assets/illustrations/environment/wall.svg`
- Create: `src/assets/illustrations/character/{head,body,arm-left,arm-right,leg-left,leg-right}.svg`
- Create: `src/assets/illustrations/objects/{backpack,shoes,hold}.svg`

**Interfaces:**
- Produces: SVGs imported as React components **or** inline strings. Prefer importing SVG as React via simple components that paste the markup (no new SVGR dependency). Root `viewBox="0 0 720 960"`. Every animatable node has an `id`.

- [ ] **Step 1: Room SVG with ids** `clock`, `chair`, `desk`, `window`, `backpack`. Line-only, `stroke="currentColor"`, `fill="none"`.
- [ ] **Step 2: Street SVG** with `buildings`, `scooter`, `sign` groups offset for parallax.
- [ ] **Step 3: Gym + wall + hold** path that later doubles as `mask` (`id="hold-mask"`).
- [ ] **Step 4: Character parts** as separate files, composed in `StoryStage`.

These are stand-ins. Replacing the file later must not require timeline rewrites if ids stay stable.

---

### Task 3: Scroller contract

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/climbing/ArchiveIntro.tsx`

**Interfaces:**
- Produces: `main#site-scroll` is the only scroller. Story pin distance ≈ `500vh`. Archive sits after the spacer.

- [ ] **Step 1: Add `id="site-scroll"` to `main` in `layout.tsx`.** Keep `overflow-y-auto`.
- [ ] **Step 2: Disable `ArchiveIntro` overlay.** Render `{children}` only (or delete the overlay branch). Wordmark already lives in `SiteChrome`; story scene 1 can fade captions without the paper curtain.
- [ ] **Step 3: `page.tsx` structure**

```tsx
<section className="relative flex min-h-0 w-full flex-1 flex-col">
  <h1 className="sr-only">Climbing Archive</h1>
  <StoryStage featured={climbs[0] ?? null} />
  <div className="relative z-10 flex w-full flex-1 flex-col items-center md:justify-center">
    <Archive climbs={climbs} initialFilter={grade} />
  </div>
</section>
```

- [ ] **Step 4: Manual check** — `/` still lists climbs with no story JS yet (StoryStage can be an empty `div` with `h-[100vh]` placeholder).

---

### Task 4: StoryStage pin + empty timeline

**Files:**
- Create: `src/components/story/StoryStage.tsx`
- Create: `src/components/story/useStoryTimeline.ts`

**Interfaces:**
- Consumes: `beatAt`, `#site-scroll`
- Produces: pinned stage; `onProgress(progress: number)`

- [ ] **Step 1: Register plugin once**

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
```

- [ ] **Step 2: Pin**

```ts
ScrollTrigger.create({
  scroller: "#site-scroll",
  trigger: stage,
  start: "top top",
  end: "+=500%",
  pin: true,
  scrub: 0.6,
  animation: timeline,
  invalidateOnRefresh: true,
});
```

`scrub: 0.6` is slight smoothing without Lenis.

- [ ] **Step 3: Reduced motion** — if `matchMedia("(prefers-reduced-motion: reduce)")`, do not pin; `StoryStage` `display: none` / `height: 0`.
- [ ] **Step 4: Kill on unmount** `timeline.kill(); trigger.kill();`
- [ ] **Step 5: Verify** scrolling `main` pins a paper-colored full-area stage for ~5 viewports, then archive appears.

---

### Task 5: AFTER WORK + ON THE WAY

**Files:**
- Modify: `src/components/story/StoryStage.tsx`
- Modify: `src/components/story/useStoryTimeline.ts`
- Create: `src/components/story/StoryCaptions.tsx`

**Captions (DOM, not SVG):**

```text
18:37  WORK IS OVER.
18:51  ON THE WAY.
```

- [ ] **Step 1: Stack room and street absolutely inside the stage** (`opacity` crossfade at 0.18).
- [ ] **Step 2: Timeline** — clock `rotation`; character `y` stand; backpack to shoulder; street `x` parallax on `#buildings` / `#scooter`.
- [ ] **Step 3: Captions** opacity tied to beat local progress.
- [ ] **Step 4: Verify desktop + a 390px-wide window.** City is a short horizontal shift, not a second pin.

---

### Task 6: THE GYM + CLIMB

**Files:**
- Modify: `src/components/story/useStoryTimeline.ts`
- Environment: `gym.svg`, `wall.svg`, character reach pose, `objects/hold.svg`

- [ ] **Step 1: Crossfade street → gym at 0.38; gym → wall at 0.56.**
- [ ] **Step 2: Shoes / chalk bag opacity in gym ACTIVE.**
- [ ] **Step 3: Climb beat** — arm rotation toward `#hold`; line `stroke-dashoffset` 1 → 0.
- [ ] **Step 4: Verify** one continuous pin, no extra scroll hijacking.

---

### Task 7: REAL VIDEO mask reveal

**Files:**
- Create: `src/components/story/FootageReveal.tsx`
- Modify: `src/app/page.tsx` (pass `featured` climb)

**Interfaces:**
- Consumes: `ClimbWithMedia | null` (`videoUrl`, `posterUrl`, `grade`, `attempts`)
- Produces: HTML video visible through SVG mask

- [ ] **Step 1: `FootageReveal`** — absolutely fill the stage; `<video>` behind; SVG `mask` using `#hold-mask` scaled from ~8% to 120% of the stage between progress 0.74–0.88.
- [ ] **Step 2: Play when local footage progress > 0.15; pause and reset when progress < 0.74 (user scrolled back).**
- [ ] **Step 3: Caption `grade` + attempts with existing `formatAttempts`.**
- [ ] **Step 4: If `featured` is null, skip video and fade to archive.**
- [ ] **Step 5: Verify** only this `<video>` exists during story; archive cards still poster-only.

Do **not** route to `/climb/[id]` here. Watching in-stage is enough. Optional: a quiet “Archive” control after the mask opens is out of scope; scrolling continues.

---

### Task 8: ARCHIVE handoff

**Files:**
- Modify: `src/components/story/useStoryTimeline.ts`
- Modify: `src/components/climbing/Archive.tsx` only if the nested `ScrollArea` fights window/`main` scroll after unpin

- [ ] **Step 1: At 0.9–1.0** fade story layers to 0; pin ends; archive is the next sibling in document flow.
- [ ] **Step 2: If archive cannot scroll**, change Story-complete layout so `ScrollArea` `flex-1 min-h-0` still works inside remaining `main` height (current archive behavior). Do not keep the stage pinned over the grid.
- [ ] **Step 3: SharedMedia still works** from archive cards.
- [ ] **Step 4: Verify** `/climb/[id]` and back; grade filter; hold toggle / upload unchanged.

---

### Task 9: Reduced motion + mobile pass

- [ ] **Step 1: Reduced motion skips pin and `FootageReveal`; archive is first paint.**
- [ ] **Step 2: Mobile** — reduce street `x` deltas; keep the same beats.
- [ ] **Step 3: `npm run lint` and `npm run build`.**

---

## Out of slice (explicit)

- Sound, voiceover, Lenis, WebGL.
- Extra climbs montage before archive.
- Production illustrations beyond placeholder SVGs.
- Replacing `ArchiveIntro` wordmark-to-chrome FLIP as a separate intro (story replaces it).

---

## Spec coverage

| Spec | Task |
| --- | --- |
| Art §4 one URL / visual states | 3–4 |
| Art §5–10 chapters | 5–6 |
| Art §11 one video transition | 7 |
| Art §12 line motif | 6 |
| Art §17–18 story then archive | 8 |
| Art §31 / §55 vertical slice | all |
| Art §33–37 SVG + ScrollTrigger + pin | 2, 4 |
| Art §40 mobile simplify | 9 |
| Motion §22–23 no WebGL/Lenis | global |
| Motion §27 reduced motion | 4, 9 |
| Motion §25 data separation | 7 uses climbs-service only |

## Placeholder scan

No TBD. Sound called out as out of scope rather than “add later inside a task”.
