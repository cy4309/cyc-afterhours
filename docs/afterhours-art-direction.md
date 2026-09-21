# AFTERHOURS

## Art Direction & Storyboard Specification

> This document defines the creative direction, visual storytelling system, scene structure, illustration language, sound direction, and relationship between hand-drawn elements and real climbing footage.
>
> This document should be read together with:
>
> `/docs/visual-motion-spec.md`
>
> `visual-motion-spec.md` defines motion behavior and transition rules.
>
> This document defines what those transitions are trying to communicate.

---

# 1. Creative Direction

## Core idea

AFTERHOURS is not simply a climbing video archive.

It is a visual story about what happens **after work**.

The website should communicate:

> Work ends.
> The day continues.
> Somewhere between leaving the desk and touching the first hold, another world begins.

The climbing videos are the real-world evidence of that experience.

The hand-drawn world represents the emotional / narrative layer.

The real climbing footage represents reality.

---

# 2. Creative Positioning

AFTERHOURS should feel like:

- an interactive visual story
- a moving sketchbook
- a visual diary
- an editorial film
- a collection of memories
- a personal archive

It should NOT feel like:

- a fitness app
- a climbing performance tracker
- a social media feed
- a statistics dashboard
- an AI-generated website
- a generic WebGL showcase

The experience should feel personal and imperfect.

---

# 3. Core Visual Concept

The experience consists of two visual worlds.

```text
HAND-DRAWN WORLD
       ↓
 imagination / memory / atmosphere
       ↓
────────────────────────────────
       ↓
REAL WORLD
       ↓
 climbing footage / actual moments
```

The hand-drawn world should gradually lead into real climbing footage.

The transition between the two worlds is one of the main creative concepts of the site.

---

# 4. Story Structure

The homepage should initially behave like a short interactive story.

Conceptual structure:

```text
INTRO
  ↓
CHAPTER 01 — AFTER WORK
  ↓
CHAPTER 02 — ON THE WAY
  ↓
CHAPTER 03 — THE GYM
  ↓
CHAPTER 04 — CLIMB
  ↓
CHAPTER 05 — ARCHIVE
```

The exact amount of content may change during implementation.

Do not make every chapter a separate URL.

The chapters should exist primarily as **visual states within one continuous experience**.

---

# 5. Chapter 01 — AFTER WORK

## Purpose

Establish the emotional premise.

The user has finished work.

The climbing session has not started yet.

Possible opening:

```text
AFTERHOURS

18:37

WORK IS OVER.
```

Keep this extremely simple.

Do not introduce a large amount of explanatory copy.

---

## Visual direction

Use a hand-drawn environment.

Possible elements:

- desk
- computer
- chair
- backpack
- shoes
- small room
- clock
- window
- city outside

Do not attempt to create a highly detailed illustration.

The environment should feel like a sketchbook.

---

## Motion

The user scrolls.

Small environmental movement begins:

```text
clock
  ↓
moves slightly

curtain
  ↓
moves

character
  ↓
stands up

backpack
  ↓
moves onto shoulder
```

These should be subtle.

Avoid making everything move simultaneously.

---

# 6. Chapter 02 — ON THE WAY

## Purpose

Create a transition from work to climbing.

The character leaves the previous scene.

Possible text:

```text
18:51

ON THE WAY.
```

---

## Visual concept

The environment moves horizontally.

Possible elements:

- street
- buildings
- traffic
- MRT
- scooter
- pedestrian
- street lights
- signs
- Taipei visual details

The environment does not need to be geographically accurate.

It should feel like a personal memory of moving through the city.

---

# 7. Taipei Should Be Present, But Subtle

The website can include small details that make the experience feel specifically personal.

Examples:

- Taiwanese street signs
- MRT entrance
- convenience store
- scooter
- road markings
- apartment buildings
- climbing gym exterior
- rainy streets
- night lighting

Do not turn this into a "Taipei tourism" website.

The city is the background.

The story is:

> going somewhere after work.

---

# 8. Chapter 03 — THE GYM

## Purpose

The story arrives at the climbing gym.

Possible text:

```text
19:17

THE GYM.
```

---

## Scene

The character enters.

Possible visual elements:

```text
door
↓
shoe bench
↓
climbing shoes
↓
chalk bag
↓
climbing wall
```

This is the point where the visual world starts becoming climbing-specific.

---

# 9. Hand-Drawn Objects

Important objects should have their own illustrations.

Potential objects:

```text
climbing shoe
chalk bag
chalk
hold
brush
crash pad
water bottle
backpack
hand
```

These objects should be drawn in the same visual language.

Avoid mixing:

```text
photorealistic object
+
cartoon object
+
AI illustration
```

The illustration system should feel authored by one person.

---

# 10. Chapter 04 — CLIMB

This is the most important chapter.

The hand-drawn world begins to connect with real footage.

Possible sequence:

```text
HAND-DRAWN CLIMBER
       ↓
reaches for hold
       ↓
hand-drawn hold
       ↓
hold becomes real
       ↓
REAL CLIMBING VIDEO
```

This transition should feel like entering the memory itself.

---

# 11. Illustration → Real Video Transition

This should become one of the signature interactions of AFTERHOURS.

Conceptual example:

```text
HAND-DRAWN:

        ○
       /|\
       / \
     [ WALL ]


        ↓


        ○
       /|\
       / \
     [ VIDEO ]
```

The real climbing footage can appear through:

- mask reveal
- expanding frame
- hand-drawn outline
- ink wipe
- paper tear
- frame morph
- hold-shaped reveal

Do not use all of these.

Choose ONE visual transition language and repeat it consistently.

---

# 12. The Hand-Drawn Line as a Navigation Device

Hand-drawn lines can become a recurring visual motif.

For example:

```text
───────────────────
```

The line begins as a simple sketch.

During scroll:

```text
───────────────╮
               │
               ╰────────
```

Eventually the line becomes:

```text
climbing route
```

Then:

```text
climbing hold
```

Then:

```text
video boundary
```

The line should visually connect scenes.

---

# 13. Climbing Movement as Visual Language

The website should borrow concepts from climbing itself.

Not as decoration, but as interaction principles.

Possible concepts:

### Reach

An element extends toward another element.

```text
A ───────────→ B
```

### Deadpoint

A short moment of suspension.

```text
A
 \
  \
   ○
    \
     B
```

The animation briefly pauses at the apex.

### Dyno

A large movement between two positions.

```text
A
        ↓

                 B
```

### Flag

An asymmetrical composition.

One side of the layout becomes visually weighted while the other remains open.

These concepts should influence motion and composition without being explicitly explained to the user.

---

# 14. Real Climbing Footage

The real videos should remain authentic.

Do not heavily filter the climbing footage.

Avoid:

- excessive color grading
- fake film grain over everything
- artificial distortion
- unnecessary AI effects

The contrast between imperfect real footage and hand-drawn illustration is valuable.

The real footage should feel like:

> this actually happened.

---

# 15. Video Presentation

When a real video appears:

```text
V3
03 ATTEMPTS
2026.09.14
```

Keep metadata minimal.

Possible alternate metadata:

```text
FRIDAY NIGHT
V3
21:43
```

or:

```text
TAIPEI
V3
ATTEMPT 03
```

Do not turn the video into a data card.

The video is the hero.

---

# 16. Transition Into Archive

After several story scenes, the experience should gradually reveal the archive.

Concept:

```text
ONE CLIMB
       ↓
ANOTHER CLIMB
       ↓
ANOTHER
       ↓
MORE
       ↓
MORE
       ↓
ARCHIVE
```

The archive should feel like the story has accumulated memories.

---

# 17. Archive Scene

Once the user reaches the archive:

```text
ARCHIVE

ALL     V1     V2     V3     V4
```

The experience changes from:

```text
STORY MODE
```

to:

```text
ARCHIVE MODE
```

This is intentional.

---

# 18. Story Mode vs Archive Mode

## Story Mode

Characteristics:

```text
slow
cinematic
illustrated
sound-driven
scroll-driven
narrative
```

## Archive Mode

Characteristics:

```text
faster
dense
video-focused
interactive
exploratory
data-driven
```

The transition between these modes should feel deliberate.

---

# 19. Archive Composition

The archive should support a growing amount of footage.

Example:

```text
2026.09

V3

[ VIDEO ]      [ VIDEO ]

       [ VIDEO ]

[ VIDEO ]      [ VIDEO ]


2026.08

V2

[ VIDEO ]        [ VIDEO ]

      [ VIDEO ]

[ VIDEO ] [ VIDEO ]
```

As more footage is added, the archive becomes richer.

Do not redesign the layout manually every time new content is uploaded.

The visual system should generate the composition.

---

# 20. Hand-Drawn Elements Inside Archive

Use illustration sparingly inside the archive.

Possible examples:

- small hand-drawn arrows
- handwritten grade labels
- route lines
- scribbles
- annotations
- small climbing figures
- circles around selected videos

Do not turn every card into an illustrated card.

The archive should remain primarily about the footage.

---

# 21. Illustration Style

The illustration system should feel:

- hand-drawn
- slightly imperfect
- personal
- editorial
- minimal
- expressive
- slightly rough

Avoid:

- generic AI cartoon style
- overly polished vector illustration
- corporate illustration
- generic "cute" illustration
- excessive anime styling
- excessive realism

The desired feeling is:

> someone actually drew this.

---

# 22. Line Quality

Do not make every line perfectly uniform.

Allow:

- slight wobble
- different line weights
- small imperfections
- uneven spacing
- hand-written annotations
- occasional overlap

However, establish a consistent overall visual system.

"Hand-drawn" does not mean random.

---

# 23. Typography

Typography should contrast with the illustration.

Recommended principle:

```text
Illustration
    +
Strong typography
```

Possible typography hierarchy:

```text
AFTERHOURS
large

18:37
small

WORK IS OVER.
medium / large

V3
small / medium
```

Do not use too many typefaces.

Prefer:

```text
1 display typeface
+
1 functional typeface
```

Potentially use handwritten typography only for small annotations.

Do not make the entire site handwritten.

---

# 24. Color Direction

Avoid a giant color palette.

Start with:

```text
paper / warm neutral
ink / dark
one accent
```

The climbing footage can introduce additional color naturally.

The illustration world should remain controlled.

The real-world video can be visually richer.

This contrast is intentional.

---

# 25. Texture

Consider subtle textures:

- paper grain
- ink texture
- scanned paper
- imperfect edges
- subtle noise

Texture should remain extremely subtle.

Do not put a strong noise overlay over the entire website.

Performance and readability take priority.

---

# 26. Sound Direction

Sound should be treated as part of the narrative.

Not simply:

```text
background music
```

Instead:

```text
environment
+
movement
+
music
+
climbing sounds
```

Possible layers:

```text
CITY
  footsteps
  traffic
  MRT
  distant ambience

GYM
  shoes
  chalk
  voices
  holds
  impact

CLIMB
  breathing
  movement
  landing
  chalk
```

Music can gradually enter as the narrative progresses.

---

# 27. Sound Interaction

Do not automatically force sound on the user.

The browser may block autoplay audio.

Provide a clear sound control.

Possible UI:

```text
SOUND
OFF
```

Then:

```text
SOUND
ON
```

When enabled, audio can become part of the storytelling.

---

# 28. Sound as Transition

Audio can help connect scenes.

Example:

```text
CITY
──────
traffic

      ↓

GYM
──────
traffic fades
gym ambience enters

      ↓

CLIMB
──────
music enters
```

Sound should transition before or during visual transitions where appropriate.

This can make scenes feel continuous even when visuals change.

---

# 29. Voiceover

Voiceover is optional.

Do not use AI-generated voice simply because it is available.

If narration is eventually used, it should feel human.

The content should also remain minimal.

The website does not need a narrator explaining everything.

---

# 30. AI Usage

AI may be used for:

- visual exploration
- moodboards
- composition exploration
- environment references
- storyboard iteration
- early concept development

AI should NOT automatically define the final visual identity.

Final illustration assets should be:

- edited
- redrawn
- simplified
- combined
- art-directed

The goal is not:

> "AI-generated hand-drawn website."

The goal is:

> "A website that feels hand-made."

Santioni's production process is a useful reference here: their team used AI for early exploration but deliberately took creative control back when generated imagery became generic, returning to manual sketches and specific framing.

---

# 31. Production Strategy

Do not attempt to create the entire story immediately.

Build one vertical slice first.

The vertical slice should be:

```text
AFTER WORK
     ↓
ON THE WAY
     ↓
THE GYM
     ↓
CLIMB
     ↓
REAL VIDEO
```

If this sequence feels good, expand the experience.

If it does not feel good, do not create additional chapters yet.

---

# 32. MVP Storyboard

The first prototype should contain only:

## Scene 01

```text
AFTERHOURS

18:37

WORK IS OVER.
```

Hand-drawn room.

---

## Scene 02

Character picks up backpack.

```text
18:42
```

---

## Scene 03

Character leaves.

Hand-drawn city.

```text
18:51
ON THE WAY
```

---

## Scene 04

Gym entrance.

```text
19:17
THE GYM.
```

---

## Scene 05

Climbing shoe / chalk / wall.

---

## Scene 06

Hand-drawn climber reaches for a hold.

---

## Scene 07

The hold transforms into a real video.

```text
V3
ATTEMPT 03
```

---

## Scene 08

Video expands.

User can watch the actual climbing footage.

---

## Scene 09

Video collapses into archive.

```text
ARCHIVE
```

This is enough to prove the concept.

---

# 33. Animation Implementation

Recommended initial stack:

```text
Next.js
TypeScript
Tailwind CSS
GSAP
GSAP ScrollTrigger
SVG
HTML Video
IntersectionObserver
```

Optional later:

```text
Lenis
Three.js
WebGL
GLSL
```

Do not introduce Three.js just because the reference site uses WebGL.

The creative concept must justify it.

Santioni is a useful reference precisely because its WebGL implementation is tightly connected to its comic-like art direction, hatching, character movement and scene masking.

---

# 34. SVG First

Hand-drawn assets should preferably start as SVG.

Possible structure:

```text
assets/
└── illustrations/
    ├── character/
    │   ├── head.svg
    │   ├── body.svg
    │   ├── arm-left.svg
    │   ├── arm-right.svg
    │   ├── leg-left.svg
    │   └── leg-right.svg
    │
    ├── environment/
    │   ├── room.svg
    │   ├── street.svg
    │   ├── gym.svg
    │   └── wall.svg
    │
    └── objects/
        ├── shoes.svg
        ├── chalk.svg
        ├── backpack.svg
        └── hold.svg
```

This makes individual elements animatable.

---

# 35. Character Animation

Do not attempt a complete animation system.

For MVP, use a small set of poses:

```text
idle
walking
standing
reaching
climbing
```

Each pose can be composed from SVG parts.

Example:

```text
character
├── head
├── torso
├── arm
├── arm
├── leg
└── leg
```

GSAP can control:

- rotation
- translation
- scale
- opacity

This is sufficient for the first prototype.

---

# 36. Scroll Architecture

Think of scroll as the camera.

Not:

```text
scroll = page movement
```

Instead:

```text
scroll
   ↓
camera position
   ↓
scene progression
```

Conceptually:

```text
0%     ROOM
20%    LEAVING
40%    CITY
60%    GYM
80%    CLIMB
100%   VIDEO
```

Use GSAP ScrollTrigger to map scroll progress to scene state.

---

# 37. Sticky Scene

A chapter can use a sticky viewport:

```text
┌─────────────────────────┐
│                         │
│       SCENE             │
│                         │
│                         │
└─────────────────────────┘
          ↑
       viewport

scroll →
scene evolves
```

The page itself can be tall while the visual scene remains pinned.

This creates the feeling that the user is controlling a camera.

---

# 38. Scene Transitions

Each scene should have:

```text
ENTER
ACTIVE
EXIT
```

Example:

```text
THE GYM

ENTER
door appears
        ↓
ACTIVE
character enters
        ↓
EXIT
camera moves toward wall
```

Do not independently trigger dozens of animations.

Define scene progress and derive animation from that progress.

---

# 39. Transition Priority

When implementing, prioritize:

```text
1. Scene continuity
2. Character movement
3. Environment movement
4. Illustration → video transition
5. Typography
6. Decorative effects
```

If performance becomes an issue, remove decorative effects first.

Never sacrifice the core transition.

---

# 40. Mobile

Mobile should have a simplified version of the same story.

Do not attempt to preserve every desktop effect.

Potential changes:

```text
desktop:
wide city scene

mobile:
vertical city scene
```

```text
desktop:
multiple environmental layers

mobile:
fewer layers
```

```text
desktop:
complex character movement

mobile:
simplified movement
```

The story must remain intact even if the visual implementation is simplified.

---

# 41. Performance

The experience may eventually contain many videos.

Therefore:

- Do not preload every video.
- Use poster images.
- Lazy-load video sources.
- Only activate videos when needed.
- Pause videos outside the viewport.
- Keep illustration assets lightweight.
- Avoid unnecessarily large SVG files.
- Compress textures.
- Avoid huge canvas buffers on mobile.
- Prefer CSS/SVG/DOM when they can achieve the same effect.

The first story sequence should remain lightweight.

---

# 42. Archive Performance

The archive may eventually contain:

```text
100+
500+
1000+
```

climbing videos.

The story layer must therefore remain separate from archive rendering.

Conceptually:

```text
STORY
 ↓
small controlled number of assets

ARCHIVE
 ↓
dynamic dataset
 ↓
lazy loading
```

Do not attempt to render hundreds of videos simultaneously.

---

# 43. Transition Between Story and Archive

The final story scene should naturally become the archive.

Possible sequence:

```text
REAL VIDEO
     ↓
video shrinks
     ↓
more videos appear around it
     ↓
grid expands
     ↓
ARCHIVE
```

The first video becomes the first object in the archive.

This is extremely important.

Do not make:

```text
story ends
→ blank screen
→ archive page loads
```

The archive should feel like it grew out of the story.

---

# 44. Archive → Detail

Once inside the archive, follow the rules in:

```text
/docs/visual-motion-spec.md
```

Use shared-element transitions.

A video card should expand into the detail video.

---

# 45. Detail → Archive

Reverse the transition.

The video should return to its original spatial position when possible.

---

# 46. Detail → Detail

Previous / Next should feel like moving through the archive.

Possible direction:

```text
PREVIOUS ← VIDEO → NEXT
```

Use directional movement consistently.

---

# 47. Grade Filter

The filter remains:

```text
ALL
V1
V2
V3
V4
```

The archive should reorganize rather than instantly disappear and re-render.

Use GSAP Flip if appropriate.

The filter is a spatial transformation.

---

# 48. Upload

Upload remains functional and simple.

The upload flow is not part of the cinematic story.

It should visually belong to the same design system but should prioritize usability.

```text
UPLOAD
 ↓
VIDEO
 ↓
GRADE
 ↓
DATE
 ↓
GYM
 ↓
ATTEMPTS
 ↓
UPLOAD
```

After success:

```text
UPLOAD
 ↓
NEW VIDEO
 ↓
ARCHIVE
```

---

# 49. Navigation Philosophy

The website should not constantly expose a traditional navigation bar.

Navigation can emerge contextually.

Possible controls:

```text
SOUND
MENU
ARCHIVE
BACK
NEXT
```

Keep them quiet.

The story should remain the primary focus.

---

# 50. Creative Restraint

The following should NOT be added unless they solve a real creative problem:

- excessive 3D
- particles
- liquid shaders
- random cursor effects
- excessive parallax
- infinite scroll tricks
- animated gradients
- glowing UI
- unnecessary noise
- excessive text animation
- random WebGL scenes

Awwwards-style does not mean "maximum effects."

The strongest interactive storytelling examples use animation to support narrative, transitions and visual hierarchy.

---

# 51. The Human Factor

The most important creative goal is:

> The site should feel made by a person.

Use real personal details.

Potential subjects to illustrate:

- actual climbing shoes
- actual backpack
- actual gym
- actual climbing holds
- actual route colors
- actual streets
- actual objects from the user's routine

These details should not be generic.

They are what separates the project from an AI-generated visual concept.

---

# 52. Art Direction Test

Before approving an illustration, ask:

### Does this look like it could belong to anyone?

If yes:

Make it more specific.

### Does it look too polished?

Add controlled imperfection.

### Does it look AI-generated?

Simplify and redraw.

### Does it communicate the story?

If not, remove it.

---

# 53. Reference Philosophy

Reference websites should be used for:

- pacing
- interaction patterns
- storytelling
- composition
- transitions
- sound design
- technical ideas

Do NOT copy:

- characters
- exact illustrations
- exact scenes
- exact typography
- exact layouts
- exact animations

Santioni should be treated as a reference for **storytelling methodology**, not as an art style to reproduce.

---

# 54. Development Workflow

When implementing a new scene:

## Step 1

Write the storyboard.

```text
SCENE
PURPOSE
START STATE
END STATE
```

## Step 2

Identify assets.

```text
character
environment
objects
text
audio
video
```

## Step 3

Define the transition.

```text
what enters?
what moves?
what transforms?
what exits?
```

## Step 4

Implement a static version.

No animation.

## Step 5

Add scene motion.

## Step 6

Add sound.

## Step 7

Add the transition into the next scene.

## Step 8

Test mobile.

## Step 9

Optimize.

---

# 55. Vertical Slice Requirement

Before building the complete homepage, implement only:

```text
SCENE 01
AFTER WORK
        ↓
SCENE 02
ON THE WAY
        ↓
SCENE 03
THE GYM
        ↓
SCENE 04
CLIMB
        ↓
REAL VIDEO
        ↓
ARCHIVE
```

Do not build all chapters first.

This vertical slice must answer:

> Does AFTERHOURS actually feel like a story?

If yes, expand.

If no, revise the art direction before adding more content.

---

# 56. Final Experience

The intended emotional sequence is:

```text
CURIOUS
   ↓
ENTER
   ↓
RECOGNIZE
   ↓
MOVE
   ↓
ARRIVE
   ↓
ANTICIPATE
   ↓
CLIMB
   ↓
WATCH
   ↓
DISCOVER
   ↓
EXPLORE
```

The final transition should move from:

```text
story
```

into:

```text
archive
```

so naturally that the user does not feel a boundary.

---

# 57. Final Mental Model

AFTERHOURS should feel like:

```text
                    AFTERHOURS

                         │
                         ↓

                  HAND-DRAWN WORLD
                         │
                         ↓
                     AFTER WORK
                         │
                         ↓
                       CITY
                         │
                         ↓
                       GYM
                         │
                         ↓
                      CLIMB
                         │
                         ↓
                  HAND-DRAWN HOLD
                         │
                         ↓
                    REAL VIDEO
                         │
                         ↓
                     ANOTHER
                         │
                         ↓
                       MORE
                         │
                         ↓
                      ARCHIVE
                         │
               ┌─────────┴─────────┐
               ↓                   ↓
             FILTER              VIDEO
               │                   │
               └─────────┬─────────┘
                         ↓
                      EXPLORE
```

The fundamental idea is:

> **Illustration creates the world.**
>
> **Sound creates the atmosphere.**
>
> **Scroll controls the camera.**
>
> **Real footage provides truth.**
>
> **The archive preserves the memories.**

The goal is not to make the most technically complicated website.

The goal is to make the user feel that they have briefly entered someone's life after work.
