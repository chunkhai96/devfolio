# Visual review — The Digital Atelier

Captured from the **actual browser build** (Chrome, WebGL 2, Apple M2 Max, 1440×900 CSS px at DPR 1.75, and 375×812 mobile emulation). Scene-only frames were read straight from the WebGL canvas; UI frames are browser screenshots. Reference: [DESIGN.md](../../DESIGN.md) §8.

## Snapshots

| # | File | Notes |
|---|---|---|
| 1 | `01-desktop-arrival-ui.jpg`, `01-desktop-arrival-scene.jpg` | **Strengths:** level camera with architectural lens shift (verticals stay parallel); kinetic sculpture under the oculus is the single focal point; corridor and gallery portals give two visible destinations. **Fixed:** at 4:3 the name overlapped sculpture highlights (measured 3.9:1) — the copy now carries its own soft local scrim, so contrast no longer depends on composition. |
| 2 | `02-desktop-hover-exhibit.jpg` | Hover/focus state: a thin ice-cyan edge on the RideS totem only — cyan stays a navigation signal, not a wash. Same cue fires from keyboard focus on the HTML marker. |
| 3 | `03-desktop-project-panel.jpg` | Exhibit framed three-quarter in the free area left of the panel (lens shift, not cropping). Panel: editorial type, real screenshot, only links that exist. Close/Esc/back returns to the gallery overview. |
| 4 | `04a`–`04e` | Gallery, lab, corridor, terrace and the contact close-up share the same stone, ceramic, titanium and light language; each room changes emphasis only. **Gallery revised** to a one-point museum view: bays on both sides, a central bench as leading line, and an index wall (all six real project screenshots) as the terminus — previously the end wall was blank and the angled view showed mostly empty floor. |
| 5 | `05a`–`05d` | Mobile is recomposed for portrait (sculpture + oculus above the name, corridor glow behind it), content opens as a bottom sheet with the exhibit framed above, and the room guide becomes a chip row. Tablets get their own symmetrical oculus → sculpture → corridor framing and the bottom-anchored copy layout. |
| 7 | `motion/07a`–`07d`, `motion/atelier-walkthrough.webm` | Motion evidence (`node scripts/motion-capture.mjs`): timed frame strips of atrium → gallery travel, exhibit open/close and the long gallery → terrace route, plus a WebM recording of the same session. |
| 6 | `06a-reduced-motion-corridor.jpg`, `06b-webgl-fallback-mobile.jpg` | Reduced motion: camera moves become instant cuts (measured 8 ms), sculpture and parallax freeze, CSS transitions off. No WebGL 2 (or `?nowebgl`): full text edition with every section; `/overview` is the same document. |
| – | `low-quality-atrium.jpg` | Mobile/low tier (`?low`): half-res lightmaps, no MSAA, sparser sculpture — same look. Found and fixed a NaN in the light shaft that only surfaced without MSAA. |

## Accessibility verification

| Check | Result |
|---|---|
| axe-core 4 — arrival, explore, all six panel types, mobile panel/guide/menu, `/overview` | **0 violations** after fixes (dialog element role, focusable scroll region, wordmark accessible name, skip links inside a landmark, marker group role). |
| Contrast of hero copy against the *rendered* scene (scrims composited per pixel, 95th-percentile background) | Lowest ratio per viewport: 1024×768 7.8:1 · 1440×900 6.0:1 · 1920×1080 9.4:1 · 768×1024 9.1:1 · 375×812 5.5:1 — all ≥ 4.5:1 (AA). Panels and room guide sit on ≥ 0.86-opaque surfaces. |
| Keyboard-only walk | Skip links → wordmark → dock → hero actions → social links. Explore/View projects hand focus to the room heading; Tab reaches each room/exhibit; Enter travels; panels move focus to their heading; Esc closes and returns focus to the item that opened it; changing room keeps focus on the room heading. |
| Touch targets (coarse pointer) | Social links, guide toggle and marker pins enlarged to ≥ 44 px hit areas. |
| Reduced motion | Camera travel becomes an instant cut (measured 8 ms); sculpture, parallax and CSS transitions stop. |
| No WebGL | Full text edition (`?nowebgl` to test); header links scroll to sections instead of driving the camera. |

### Safari engine (WebKit 26) — `yarn check:webkit`

Production build, emulated iPhone SE, iPhone 15 and iPad (touch input, device pixel ratio, Safari UA). Full results: `webkit/report.json`; screenshots and ARIA trees in `webkit/`.

| Check | iPhone SE | iPhone 15 | iPad |
|---|---|---|---|
| Hero text on screen | ~0.2 s | ~0.2 s | ~0.2 s |
| 3D ready (local server) | ~1.3 s | ~1.3 s | ~1.4 s |
| Tap → room → exhibit panel → focus on heading → Close → back to room | pass | pass | pass |
| Contact form reachable, 3 labelled fields | pass | pass | pass |
| `prefers-reduced-motion` honoured | pass | pass | pass |
| axe-core: arrival, room guide, panel, contact | 0 violations | 0 violations | 0 violations |
| Console errors | only Vercel Analytics script 404 (expected off Vercel) | same | same |

WebKit found three things Chrome had not: the intro overflowed under the header on the short iPhone SE screen (compact layout added), the wordmark washed out over the oculus (header scrim added), and the dev server's app manifest 404 (dev-only; production verified instead).

**Screen-reader proxy.** The accessibility tree WebKit hands to VoiceOver (`webkit/*-aria*.yml`) reads: skip links → banner (home link, menu) → main → described 3D image → "Andy Pang" region (eyebrow, h1, summary, roles, actions, profiles); panels expose a named dialog with Close, a labelled region, h2, image alt text, links and an "Other exhibits" navigation; the room guide is a labelled region with a heading and a button list. Fixed from this pass: separators that made VoiceOver read "EngineerMRC Asia" and run-on role names.

Not done here: a physical handset (the iOS Simulator needs a one-time "Let Claude use it" grant in the simulator panel) and a live VoiceOver/NVDA session.

## Rubric — independent reviews

My own earlier self-assessment (4.3) was not confirmed. Four independent art-direction reviews, each run by a fresh reviewer that saw only DESIGN.md and the production captures (never this file), scored the build:

| Round | Avg | Composition | Modeling | Materials | Lighting | Gate |
|---|---:|---:|---:|---:|---:|---|
| 1 (dev captures) | 3.4 | 3 | 3 | 3 | 3 | fail |
| 2 (production, Safari engine) | 3.5 | 3 | 3 | 3 | 3 | fail |
| 3 (+ iOS Simulator) | 3.4 | 3 | 3 | 3 | 3 | fail |
| 4 (after furniture/terrace pass) | 3.5 | 3 | 3 | 3 | 3 | fail |
| 5 (Poly Haven scanned materials, horizon portal) | 3.5 | 3 | 3 | 3 | 3 | fail |
| 6 (room-identity pass: per-room palettes, lab baffles, corridor fins, framed displays) | 3.5 | 3 | 3 | 3 | 3 | fail |
| 7 (scanned CC0 furniture: lab stools, terrace lounge) | 3.5 | 3 | 3 | 3 | 3 | fail |
| 8 (framing fix, lab/corridor light, calmer finishes, terrace reframe) | 3.8 | 4 | 3 | 4 | 4 | fail (modeling, avg) |
| 9 (coursed portal, assembled lectern, engineered stands, tablet sheet) | 3.6 | 3 | 3 | 3 | 4 | fail |
| 10 (header legibility, corridor framing, honed portal stone, fluted lecterns) | 3.6 | 3 | 3 | 3 | 4 | fail |
| 11 (bespoke display fixtures, limestone niches, reeded lectern/plinth, motion strips) | 3.65 | 3.5 | 3 | 3 | 3.5 | fail |
| 12 (closed light wells, stone-only portal, canopy tie-rods, doorway-led 1.8 s travel, named gallery markers) | 3.75 | 3.5 | 3.5 | 3.5 | 3.5 | fail |

Non-visual dimensions are consistently 4 (typography/UI, exploration, content, responsive/a11y). No dimension has ever scored ≤ 2. Every round's concrete defects were fixed before the next (hover cue, overlaid titles, Tailwind class collisions, culled canopy, NaN shaft, marker clutter, contrast, phone layout, etc.), but the four core visual scores did not move: the gap is material/modeling density, not individual bugs.

**Status against §8: the release gate is not met.** See "Open items" for the options to close it.

Mobile budget (low tier, 562×1218 render target, forced GPU sync on M2 Max): ~1.0 ms/frame in every room; 24–51 draw calls; 76k triangles in the atrium and 10–22k in the wings, down from ~150k everywhere once the sculpture was culled when off-screen and given a lighter mobile mesh. Mid-range phone GPUs are roughly 15–25× slower than this Mac, which puts the estimate at ~15–25 ms (≈40–65 fps), with the adaptive resolution drop as a backstop. That is an estimate, not a device measurement.

Performance: ~3 ms per frame (forced GPU sync) at 2520×1575 with MSAA ×4 on M2 Max; adaptive DPR drops resolution if the frame rate falls under ~42 fps. Initial 3D payload ≈ 3.4 MB (desktop) / ≈ 2.1 MB (mobile); hero copy and navigation render before any 3D loads.

## Open items for the owner

- **Visual gate (§8):** twelve independent reviews: 3.4–3.5 through round 7, then 3.8 / 3.6 / 3.6 / 3.65 / 3.75 after the framing, lighting and modeling passes (round-to-round variance is about ±0.2). In round 12 all four core visual dimensions reached 3.5 for the first time (gate needs 4); reviewers describe it as a competent real-time archviz piece rather than a memorable one. Reaching 4+ on composition/modeling/materials/lighting most likely needs authored hero assets per room from a 3D artist (or a sculpted, higher-poly modeling pass), not more procedural iteration. Previously: Scanned materials (round 5) improved realism but not the core scores; reviewers now ask for room-specific identities (distinct material palettes and a hero object per room), constructed detail on the portal/displays/plinths, and stronger light hierarchy. That is a larger art-direction pass rather than further polish.

- Project data has no per-project technologies, contribution or outcomes — panels show only what `data/project.ts` contains.
- `public/images/project-devfolio.webp` now shows the redesigned site (full-res capture of the live 3D frame + UI); the previous image is in git history.
- Please spot-check on a physical mid-range phone (30 fps target) and with VoiceOver/NVDA. WebKit emulation and ARIA-tree review cover layout, touch flows and semantics, not real GPU performance or live speech output.
