# CYC Afterhours

## Visual & Motion Specification

> This document defines the visual architecture, motion language, transitions, and interaction principles of the CYC Afterhours website.
>
> The goal is not to create a feature-heavy climbing application.
> The goal is to create a **visual archive of movement**.

---

# 1. Core Concept

CYC Afterhours is a visual archive documenting climbing through video.

The website should feel closer to:

- an editorial archive
- a digital lookbook
- a visual diary
- a collection of moving images

It should NOT feel like:

- a fitness tracker
- a climbing database
- a social media feed
- a dashboard
- a conventional portfolio
- a CRUD management system

The content itself should introduce the person behind the website.

Avoid unnecessary:

- About page
- Resume
- Personal introduction
- Biography
- Progress statistics
- Achievement dashboard

The work is the introduction.

---

# 2. Primary Principle

## Do not design pages first.

Design the **transitions between states** first.

The website should feel like one continuous visual space rather than a collection of disconnected pages.

A user should feel:

> "I am moving through the archive."

Not:

> "I am navigating between pages."

---

# 3. Sitemap

Keep the information architecture intentionally small.

```text
LOADING
   ↓
ARCHIVE
   ├── ALL
   ├── V1
   ├── V2
   ├── V3
   ├── V4
   └── V5 (future)
        ↓
      CLIMB DETAIL
        ├── PREVIOUS
        └── NEXT

ARCHIVE
   ↓
UPLOAD
   ↓
SUCCESS
   ↓
ARCHIVE
```

There should be no unnecessary top-level pages.

---

# 4. Primary User Flow

The main experience is:

```text
Loading
   ↓
Archive
   ↓
Browse videos
   ↓
Hover / interact
   ↓
Open a climb
   ↓
Watch video
   ↓
Previous / Next
   ↓
Return to archive
```

The secondary flow is:

```text
Archive
   ↓
Upload
   ↓
Upload video
   ↓
Save metadata
   ↓
Success
   ↓
Return to Archive
```

---

# 5. The Archive Is a Space

The Archive should be treated as a persistent visual space.

It contains video objects.

Conceptually:

```text
                 ARCHIVE

     ┌──────────┐     ┌──────────┐
     │          │     │          │
     │  VIDEO   │     │  VIDEO   │
     │          │     │          │
     └──────────┘     └──────────┘

           ┌──────────────┐
           │              │
           │    VIDEO     │
           │              │
           └──────────────┘

     ┌──────────┐     ┌──────────┐
     │  VIDEO   │     │  VIDEO   │
     └──────────┘     └──────────┘
```

The archive can become denser as more climbing footage is accumulated.

The growing number of videos is a feature, not a problem.

---

# 6. Video Object Model

Each video should behave like a visual object.

Example:

```text
{
  id: "climb_001",
  grade: "V3",
  date: "2026-09-14",
  gym: "Gym Name",
  attempts: 3,
  video: "...",
  poster: "..."
}
```

The UI should treat the object consistently across different states.

A video object can exist in these states:

```text
CARD
  ↓
HOVER
  ↓
PREVIEW
  ↓
OPEN
  ↓
DETAIL
  ↓
NEXT / PREVIOUS
  ↓
CARD
```

The same object should visually connect these states whenever possible.

---

# 7. Transition Map

The following transitions are the core of the site.

## 7.1 Loading → Archive

### Goal

Create a short entrance into the archive.

Avoid a generic:

```text
spinner
loading bar
fade to white
```

Instead, the loading state should establish the visual identity of the website.

Possible sequence:

```text
LOGO / WORDMARK
       ↓
small motion
       ↓
archive begins revealing itself
       ↓
content enters
```

The archive should feel like it was already there and is being revealed.

Duration guideline:

```text
0.6s – 1.2s
```

Do not make the loading experience unnecessarily long.

---

# 8. Archive → Video Detail

This is the most important transition.

## Shared Element Transition

When a user selects a video card:

```text
ARCHIVE

┌──────────────┐
│              │
│    VIDEO     │
│              │
└──────────────┘
```

The selected card should visually expand into:

```text
DETAIL

┌──────────────────────────────┐
│                              │
│                              │
│            VIDEO             │
│                              │
│                              │
└──────────────────────────────┘
```

Do NOT simply:

```text
click
→ route change
→ loading
→ new page
```

Instead:

```text
CARD
 ↓
expand
 ↓
DETAIL VIDEO
```

The user should understand spatially that the detail view is the same object they selected.

---

# 9. Video Detail → Archive

When returning to the archive:

Do not simply reload the archive.

The detail video should reverse its transition:

```text
DETAIL VIDEO
     ↓
shrink
     ↓
return to original card position
```

The user should visually recognize the original card.

This creates spatial memory.

---

# 10. Video → Video

Previous / Next should feel like moving through a film strip.

Avoid:

```text
page reload
loading screen
hard cut
```

Preferred:

```text
VIDEO A
   ↓
horizontal / directional movement
   ↓
VIDEO B
```

Possible conceptual layout:

```text
        PREVIOUS

   VIDEO A  →  VIDEO B  →  VIDEO C

                              NEXT
```

The exact direction can be decided during implementation, but it must remain consistent.

The direction of movement should communicate navigation direction.

---

# 11. Grade Filter

Current grades:

```text
ALL
V1
V2
V3
V4
```

Future:

```text
V5
V6
...
```

The grade filter should NOT behave like a traditional instant database filter.

Avoid:

```text
click V3
→ remove all cards
→ render V3
```

Instead, animate the existing visual space.

Example:

```text
ALL

[A] [B] [C]
[D] [E] [F]
[G] [H] [I]
```

Select V3:

```text
[C] [F] [H]
```

Cards that remain should move into their new positions.

Cards that disappear should:

```text
opacity → 0
scale → slightly smaller
```

Cards that remain should:

```text
position → new position
opacity → 1
scale → 1
```

The result should feel like:

> The archive is reorganizing itself.

Not:

> The page changed.

---

# 12. Filter Animation Strategy

Use layout-aware animation.

Preferred approach:

1. Determine current positions.
2. Determine target positions.
3. Animate from current → target.
4. Fade out removed items.
5. Fade in newly visible items.
6. Preserve visual continuity.

GSAP Flip is a good candidate for this behavior.

Do not introduce GSAP Flip until the underlying layout and data flow are stable.

---

# 13. Scroll as Navigation

Scrolling should not merely move the page vertically.

It should gradually reveal the archive.

Possible structure:

```text
2026.09
──────────────

V3

[ VIDEO ]   [ VIDEO ]

      [ VIDEO ]

[ VIDEO ]   [ VIDEO ]


2026.08
──────────────

V2

[ VIDEO ]       [ VIDEO ]

      [ VIDEO ]

[ VIDEO ]   [ VIDEO ]
```

Time can become part of the visual structure.

The archive can naturally become a visual timeline as more videos accumulate.

Do not create a complicated timeline UI unless it is visually justified.

---

# 14. Video Card Hover

Desktop hover should provide subtle feedback.

Possible states:

```text
DEFAULT
opacity: 1
scale: 1

HOVER
video preview starts
metadata appears
image/video scale slightly
cursor changes
```

Metadata can remain minimal.

Example:

```text
V3
03 ATTEMPTS
2026.09.14
```

Or:

```text
FRIDAY NIGHT
V3
21:43
```

Do not display excessive metadata.

---

# 15. Video Playback Strategy

The archive may eventually contain a large number of videos.

Therefore:

### Never autoplay every video.

Use:

```text
muted
playsInline
loop
```

Only play videos when appropriate.

Recommended behavior:

```text
video enters viewport
      ↓
poster → video
      ↓
play
```

When leaving viewport:

```text
pause
```

This reduces unnecessary CPU, memory, network and battery usage.

Use `IntersectionObserver` or an equivalent visibility system.

---

# 16. Archive Performance

The number of videos may become large.

The architecture must assume:

```text
100+
500+
1000+
```

media objects may eventually exist.

Therefore:

- Do not fetch every video file immediately.
- Fetch metadata first.
- Load poster images first.
- Lazy-load video sources.
- Only play videos near/in the viewport.
- Avoid mounting hundreds of active `<video>` elements.
- Paginate or progressively load metadata when necessary.
- Keep original media in R2.
- Use web-friendly playback derivatives when the archive becomes large.

Visual quality must not come at the cost of unusable performance.

---

# 17. Upload → Archive

Upload is a functional flow but should still belong to the same visual system.

Flow:

```text
UPLOAD

select video
     ↓
metadata
     ↓
uploading
     ↓
success
     ↓
archive
```

After a successful upload:

```text
UPLOAD SUCCESS
      ↓
new video object appears
      ↓
archive
```

The newly uploaded object should feel like it has been added to the collection.

Avoid simply:

```text
upload complete
→ redirect
→ page reload
```

If practical, animate the new object into the archive.

---

# 18. Motion Language

The website should have a consistent motion language.

Do not independently animate every component.

Define a small set of motion behaviors.

Example:

```ts
const motion = {
  fast: 0.2,
  normal: 0.45,
  slow: 0.8,
  scene: 1.0,
};
```

General guidelines:

```text
Hover / micro interaction
200–300ms

Filter / layout transition
400–600ms

Page / scene transition
600–900ms

Major entrance
800–1200ms
```

These are starting points, not hard requirements.

Motion should feel intentional rather than uniformly slow.

---

# 19. Easing

Prefer a small number of easing curves.

Suggested starting point:

```text
micro interaction
power2.out

layout transition
power3.out

large transition
power4.inOut
```

Do not use a different easing curve for every element.

Consistency is more important than variety.

---

# 20. Motion Hierarchy

Animation priority:

### Level 1 — Spatial continuity

Highest priority.

Examples:

```text
card → detail
detail → card
video → video
filter → reorganized archive
```

### Level 2 — Content reveal

Examples:

```text
metadata
titles
grade
date
```

### Level 3 — Decorative motion

Examples:

```text
cursor
background
small typography movement
micro parallax
```

Do not implement Level 3 before Level 1 works.

---

# 21. Avoid Animation for Animation's Sake

Do NOT add:

- random parallax everywhere
- excessive text splitting
- unnecessary 3D
- constant background movement
- huge cursor effects
- excessive page transitions
- scroll hijacking
- animation on every element

The site should feel sophisticated because the transitions are connected, not because there are many effects.

---

# 22. Three.js / WebGL

Three.js should NOT be introduced simply because this is a visual website.

Only introduce WebGL if there is a strong visual concept that cannot be achieved efficiently with DOM/CSS/video/GSAP.

Potential future uses:

- experimental video surface
- spatial archive
- distortion
- image/video displacement
- interactive film-strip environment

But these are future possibilities.

The first version should prove the visual system with:

```text
HTML
CSS
Video
GSAP
IntersectionObserver
```

before adding WebGL complexity.

---

# 23. Recommended Technology

Current architecture:

```text
Next.js
TypeScript
Tailwind CSS
Cloudflare Pages
Cloudflare Workers
Cloudflare R2
Cloudflare D1
```

Visual layer:

```text
GSAP
GSAP Flip
ScrollTrigger
```

Optional later:

```text
Lenis
Three.js
WebGL
```

Do not add optional libraries until there is a demonstrated need.

---

# 24. Component Responsibilities

Keep visual components independent from data/storage implementation.

Suggested structure:

```text
components/
├── archive/
│   ├── Archive.tsx
│   ├── ArchiveGrid.tsx
│   ├── VideoCard.tsx
│   ├── GradeFilter.tsx
│   └── ArchiveTransition.tsx
│
├── climb/
│   ├── ClimbDetail.tsx
│   ├── ClimbVideo.tsx
│   ├── ClimbMeta.tsx
│   └── ClimbNavigation.tsx
│
├── upload/
│   ├── UploadForm.tsx
│   ├── UploadProgress.tsx
│   └── UploadSuccess.tsx
│
└── motion/
    ├── PageTransition.tsx
    ├── SharedVideoTransition.tsx
    └── motion.ts
```

The exact structure may change depending on the implementation, but responsibilities should remain separated.

---

# 25. Data / Visual Separation

The UI should never directly depend on R2 or D1 implementation details.

Prefer:

```text
UI
 ↓
Archive Service
 ↓
API / Worker
 ↓
D1 / R2
```

Not:

```text
VideoCard
 ↓
R2 API
 ↓
D1
```

The visual system should remain replaceable independently from the backend.

---

# 26. Responsive Behavior

Mobile is not a smaller desktop.

The interaction model should adapt.

Desktop:

```text
hover
cursor
grid
horizontal transitions
```

Mobile:

```text
tap
swipe
scroll
viewport-based autoplay
```

Do not depend on hover for essential information.

Video detail should support:

```text
swipe left → next
swipe right → previous
```

if this improves the experience.

---

# 27. Accessibility / Reduced Motion

Respect:

```css
prefers-reduced-motion
```

When reduced motion is enabled:

- Disable large spatial transitions.
- Reduce parallax.
- Reduce decorative movement.
- Keep navigation functional.
- Do not rely on animation to communicate information.

Motion enhances the experience but must not be required to understand the content.

---

# 28. Implementation Order

Do not implement the entire visual system at once.

Follow this order.

## Phase 1 — Functional Foundation

Make sure this works:

```text
Upload
 ↓
R2
 ↓
D1
 ↓
Archive
 ↓
Video Detail
```

No fancy animation required.

---

## Phase 2 — Archive Interaction

Implement:

```text
Video Card
Hover
Video Preview
Grade Filter
Viewport Playback
```

Still keep the visual design relatively simple.

---

## Phase 3 — Core Motion

Implement in this order:

```text
1. Archive → Detail
2. Detail → Archive
3. Previous → Next
4. Grade Filter
5. Upload → Archive
6. Loading → Archive
```

These transitions are the heart of the experience.

---

## Phase 4 — Visual Direction

Only after the motion system works:

- Typography
- Grid composition
- Video crops
- Whitespace
- Metadata styling
- Cursor
- Hover behavior
- Color system
- Editorial rhythm

---

## Phase 5 — Advanced Effects

Only if justified:

```text
GSAP ScrollTrigger
Lenis
image/video distortion
WebGL
Three.js
```

---

# 29. Design Test

At the end of each visual implementation, ask:

### Question 1

Does the transition make the user understand where the object came from?

### Question 2

Does the next state feel connected to the previous state?

### Question 3

Would the website still feel good if all decorative effects were removed?

### Question 4

Does the animation communicate hierarchy or spatial relationships?

### Question 5

Is the animation helping the archive feel like one continuous collection?

If the answer is no, simplify.

---

# 30. Definition of Success

The website should eventually feel like:

```text
OPEN
 ↓
ENTER
 ↓
DISCOVER
 ↓
WATCH
 ↓
MOVE
 ↓
WATCH
 ↓
MOVE
 ↓
DISCOVER
```

rather than:

```text
HOME
 ↓
CLICK
 ↓
PAGE
 ↓
BACK
 ↓
FILTER
 ↓
PAGE
 ↓
CLICK
```

The goal is a **continuous visual experience**.

The website should make the user want to keep moving through the archive.

---

# 31. Important Instruction for AI / Cursor

When implementing this project:

1. Do not add new pages unless necessary.
2. Do not add features just because they are technically interesting.
3. Do not add animation without defining its relationship to another state.
4. Prioritize shared-element and spatial transitions.
5. Preserve the user's mental map of the archive.
6. Keep data logic separate from visual components.
7. Assume the number of videos will grow significantly.
8. Optimize video loading from the beginning.
9. Prefer simple DOM/CSS/GSAP solutions before WebGL.
10. Do not redesign the information architecture without discussing the reason.
11. Do not introduce unnecessary UI such as dashboards, statistics, profiles, or social features.
12. When implementing a new interaction, first identify:
    - starting state
    - ending state
    - elements that persist
    - elements that disappear
    - elements that move
    - timing
    - easing
    - mobile behavior

The primary question should always be:

> **How does this state connect to the state before and after it?**

Not:

> **What animation can we add here?**

---

# 32. Final Mental Model

Think of CYC Afterhours as:

```text
                  ONE VISUAL SPACE

                         ↓

                 ┌─────────────┐
                 │   ARCHIVE   │
                 └──────┬──────┘
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
         V1            V2            V3
          │             │             │
          └─────────────┼─────────────┘
                        ↓
                      VIDEO
                        │
                ┌───────┴───────┐
                ↓               ↓
             PREVIOUS          NEXT
                │               │
                └───────┬───────┘
                        ↓
                      VIDEO

                        ↑
                        │
                     UPLOAD
                        │
                        ↓
                     ARCHIVE
```

The pages are not the product.

**The movement between them is the product.**

The archive is the space.

The videos are the objects.

The transitions are the experience.
