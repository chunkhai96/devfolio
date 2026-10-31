# DESIGN.md — Andy Pang Interactive 3D Portfolio

**Version:** 1.0  
**Status:** Approved creative direction; implementation-agnostic  
**Experience name:** **The Digital Atelier**  
**Website:** https://andypangdev.com  
**Creative direction:** Hybrid premium architecture × exploratory game mechanics  
**Primary audience:** Recruiters, hiring managers, engineering peers, potential collaborators, and clients  
**Existing framework:** Nuxt (preserve; engineering decisions remain with Codex)

> **Design north star:** A sophisticated, explorable architectural portfolio: *the atmosphere of a private contemporary gallery, the tactility of a premium game environment, and the clarity of an excellent professional website.* Visitors should remember the experience, understand what Andy does, and access his work without friction.

---

## 1. Design intent and non-negotiables

### Desired impression

Within the first five seconds, the visitor should perceive:

1. **A distinctive authored world:** not a generic developer template or a raw Three.js demo.
2. **Visual maturity:** confident composition, realistic or art-directed materials, restrained effects, disciplined typography.
3. **Invitation to explore:** an unmistakable, low-effort interaction cue.
4. **Professional clarity:** Andy's name and professional identity are legible; a direct route to work and contact is always available.

### Core design principles

- **Architecture is the interface.** Space, light, and objects tell the story; conventional UI clarifies it.
- **Discovery, not friction.** Exploration is optional, useful, and rewarding. No forced onboarding or mandatory mini-game.
- **High fidelity over scale.** A few beautifully constructed spaces are better than an oversized empty map.
- **One cohesive world.** Do not mix unrelated visual styles, asset packs, or sci-fi tropes.
- **Restraint creates luxury.** Focus on detail, silhouette, material response, lighting, and elegant motion—not arbitrary geometry or neon effects.
- **Content remains primary.** The world presents genuine projects and experience, not fictional achievements or invented credentials.

### Explicit anti-patterns

Do **not** use floating rainbow cubes, default wireframe grids, random glowing spheres, cliché hacker code rain, stock cyberpunk cityscapes, oversaturated purple/cyan gradients, arbitrary particles, placeholder monoliths masquerading as finished artwork, tiny unreadable 3D text, excessively glossy plastic, or gratuitous glassmorphism. Do not use an astronaut/avatar/vehicle merely to make it “game-like.” No progress gates block professional content.

---

## 2. Visual identity

### 2.1 Palette

| Token | Hex | Intended use |
|---|---|---|
| `--ink` | `#101419` | Deep background, shadowed recesses, foundation |
| `--graphite` | `#303C48` | Main wall/metal tones and dark UI surfaces |
| `--titanium` | `#8A969E` | Structural metal, edges, selected labels |
| `--mist` | `#D7DFDF` | Architectural highlights, secondary text |
| `--porcelain` | `#F2F0E9` | Main text, warm exhibition surfaces |
| `--ice-cyan` | `#9AD8D6` | Interaction affordances, selected state, rare light accents |
| `--warm-light` | `#E6DFD3` | Gallery lighting and human warmth |
| `--deep-slate` | `#1A2229` | Recessed panels, UI backgrounds |

**Color ratios (guidance, not rigid metrics):** ~65% charcoal/graphite, 20% neutral titanium/stone, 10% warm off-white, 5% interaction accents. Cyan should function as a navigational signal, **not** a pervasive lighting wash. Avoid simultaneously introducing new saturated accent colors in individual portfolio zones.

### 2.2 Materials and textures

| Material | Visual specification | Where to use | Avoid |
|---|---|---|---|
| Honed basalt / charcoal limestone | Fine subtle grain, matte response, varied roughness, believable edge wear | Floors, plinths, anchor walls | Flat black planes with no texture |
| Brushed titanium / anodized aluminum | Fine directional grain, restrained reflection, realistic chamfers | Frames, railings, workstation components, reveals | Mirror-chrome everywhere |
| Smoked architectural glass | Dark transparent panels with believable reflections and visible boundaries | Select partitions, showcases, screens | Thick, murky black glass hiding content |
| Warm ceramic / limestone | Soft warm neutral, smooth but imperfect surfaces | Exhibits, hero plinth, gallery highlights | Pure emissive white architecture |
| OLED display surfaces | Deep blacks, crisp illuminated UI with low bloom | Project terminals and displays | Illegible holograms and fake code |
| Fabric / acoustic panels | Subtle woven texture and measured relief | Interior walls and lounge details | Repetitive texture stretching |

**Physical plausibility:** Consistent modeling scale, intentional bevels, believable material roughness, realistic joints, seams, support structures, and reflections. A visually strong object is not just a primitive with a material applied to it.

### 2.3 Lighting and atmospheric direction

- **Overall:** twilight / controlled interior architectural photography; shadow detail must remain readable.
- **Key light:** broad, diffused warm-white architectural lighting (approximately 3500–4200 K in reference intent).
- **Fill:** soft neutral-cool ambient illumination; avoid black crush and flat global light.
- **Accents:** sparse desaturated cyan edge highlights at interactive fixtures, not across entire architecture.
- **Practical lights:** recessed ceiling strips, concealed coves, soft exhibit spots, thin luminous seams.
- **Shadow:** soft-edged yet contact-grounded; objects must appear to have weight.
- **Atmosphere:** gentle depth falloff and very restrained haze only when it improves spatial layering.
- **Post effects:** subtle ambient occlusion/color treatment; bloom only on actual light sources, never enough to blur text or surfaces.

Maintain color and exposure consistency between scenes. The physical appearance in the **actual browser** is the final reference; offline Blender renders are a means of directing art, not proof of delivery fidelity.

### 2.4 Geometry language

- Architecture: long horizontal lines, monolithic volumes, generous negative space, tall openings, recessed reveals, occasional controlled curves.
- Furnishings: bespoke, deliberately shaped, premium industrial and museum display objects.
- Surface detail: visible construction logic; bevels, panel gaps, tasteful fasteners, edges, shelves, frames, fixtures.
- Avoid procedural repetition without irregularity or purpose. No “box city” appearance.
- Contrast a few hero details with quiet secondary surfaces. Not everything deserves equal density.

---

## 3. Spatial concept and world layout

### 3.1 The Digital Atelier

A single cohesive architectural campus organized around a **central atrium**. Visitors can explore connected rooms as exhibition destinations. The world should feel spatially plausible: clear paths, consistent building language, legible thresholds, intentional sightlines.

**Conceptual zones:**

1. **Arrival Atrium — Identity.** A striking, restrained hero scene with a sculptural object or architectural portal. Andy's name, concise professional positioning, and immediate Explore / View Projects / Contact actions are visible in crisp HTML UI. This is the visual signature and performance priority.
2. **Project Gallery — Work.** Museum-style exhibit bays or interactive stations displaying actual projects. Each hero project has a distinct object/display treatment; interaction opens a readable case-study panel with screenshots and links.
3. **AI & Engineering Lab — Capabilities.** A realistic-but-stylized studio/lab area exhibiting systems, tools, or selected technical themes. Use bespoke terminals and diagrams rather than random neon machines or invented technical claims.
4. **Career Corridor — Experience.** A chronological architectural sequence with curated highlights; professional roles and achievements appear in accessible panels. Use lighting and spatial depth to mark progression rather than a gimmicky level system.
5. **Connection Terrace — Contact.** A serene final space with a clear contact call-to-action, accessible links, and a visual conclusion. No requirement to complete a journey to reach it.

These are art-direction anchors, not an exact room count or mandated scene graph. Codex may adjust the geometry and transitions for coherence and performance **without replacing the overall concept**.

### 3.2 Spatial storytelling

- Arrival reveals the main architectural identity and at least one enticing destination.
- Main pathways should expose partial previews of adjacent areas (light, object silhouettes, framed sightlines).
- Every destination has one hero visual, a navigational affordance, and an obvious exit/return path.
- The same architectural materials and lighting language persist across spaces; each area may vary **emphasis**, not visual identity.
- Avoid endlessly repeated corridors, complex mazes, or empty wandering.

### 3.3 Camera and composition

**Default viewpoint:** elevated human-scale architectural perspective, not extreme first-person shooter framing or overhead toy-game orthographic view. The experience may use constrained orbit or guided spatial movement. Keep heroic architecture legible.

For every key viewport:

- Establish a clear **foreground / subject / background** hierarchy.
- Compose with approximately one strong focal area, substantial breathable negative space, and a purposeful visual pathway.
- Keep identity copy and actions against uncluttered, high-contrast surfaces.
- Prefer cinematic 28–50 mm equivalent architectural perspectives as a reference mood, adapting as required for usability.
- Avoid extreme wide-angle distortion and fast automatic camera moves.
- Ensure close-up detail shots support, not replace, orientation within the world.
- Use safe composition zones so important 3D elements remain visible around responsive UI.

**Desktop:** wide cinematic framing with architectural depth.  
**Tablet:** tighter crop, simplified overlays, fewer competing affordances.  
**Mobile:** deliberate vertical recomposition or a tailored guided experience; do not shrink desktop scene and hope it works.

---

## 4. Interaction design: exploration without friction

### 4.1 Primary interaction model

**Preferred behavior:** point-and-click exploration with guided, smooth camera travel between architectural landmarks. Hover/focus highlights reveal interactable exhibits. A compact persistent navigation menu allows direct jumps to any section.

- **Click / tap:** choose an exhibit, portal, or destination.
- **Hover / focus:** understated feedback such as a controlled cyan edge light, outline, label, or slight material response.
- **Camera:** eased motion, stable horizon, careful deceleration; never disorienting spins.
- **Information:** important long-form text lives in legible 2D overlay panels or normal Nuxt pages, not solely on 3D surfaces.
- **Return:** visible close/back controls and a reliable route to the central atrium.
- **Skip:** direct navigation always accessible regardless of exploration state.

Optional deeper exploration (WASD or character mode) may be introduced only if it passes usability review and does not compromise core navigation. No forced tutorial, physics gimmick, combat, puzzles, or unlocking content.

### 4.2 Interaction states

| State | Visual behavior | UX requirement |
|---|---|---|
| Idle | Gentle environmental animation | Scene remains readable and calm |
| Discoverable | Small contextual marker or subtle lighting cue | No hunting for invisible click targets |
| Hover / focus | Cyan accent + label, optionally small scale/material shift | Keyboard focus equivalent |
| Selected | Clear active cue and camera/content response | No ambiguity about action result |
| Transition | Smooth movement; UI remains stable | Predictable and interruptible |
| Panel open | Dim or quiet scene slightly; readable content layer | Escape/back/close works; focus managed |
| Loading | Branded but honest progressive loading state | Useful fallback; no fake progress |
| Error / no WebGL | Full standard portfolio access | No blank screen |

### 4.3 Motion grammar

- **Micro-interactions:** roughly 150–250 ms for hover/focus feedback.
- **UI panels:** roughly 250–450 ms for enter/exit, avoiding long choreography.
- **Camera travel:** generally 700–1400 ms for moderate jumps; longer only when spatially justified. These are art-direction targets, not hard coded values.
- Easing should be soft, precise, and settled; no repeated spring bounce.
- Ambient movement should be very subtle: light shifts, screen content movement, slow sculptural rotation where appropriate.
- Do not animate everything simultaneously.
- Reduced-motion mode should eliminate optional camera travel and decorative movement and provide instant meaningful navigation.

### 4.4 Rewarding discovery

Visitors may find a few curated easter eggs, subtle environmental reactions, or optional developer notes, but must never miss essential information by bypassing them. The site is **a portfolio with playful discovery**, not a full game with required progression.

---

## 5. Typography, interface, and content presentation

### 5.1 Typography

**Recommended free font pairing:**

- **Display/headings:** `Space Grotesk`, weights 500–700, disciplined tracking; optionally consider `Sora` if it renders better with the final composition.
- **Body/controls:** `Inter`, weights 400–600.
- **Technical micro-labels:** `IBM Plex Mono`, used sparingly for metadata, coordinates, technical tags, and exhibit numbers.

Do not use novelty gaming fonts, sci-fi stencil fonts, or a mixture of several display families. No faux terminal aesthetic for primary copy.

**Type hierarchy (desktop starting targets, responsive rather than fixed):**

| Role | Suggested size | Treatment |
|---|---:|---|
| Hero name | `clamp(3rem, 6vw, 6.25rem)` | Clean, confident; tight line-height |
| Hero professional descriptor | `1.125–1.5rem` | High legibility, calm tone |
| Section title | `2–3.5rem` | Short editorial titles |
| Card title | `1.25–1.625rem` | Clear and scannable |
| Body | `1rem–1.125rem` | Comfortable line-height 1.5–1.7 |
| Eyebrow/meta | `0.75–0.875rem` | Small caps/mono only when helpful |

Minimum mobile body text should remain comfortably legible; do not place essential copy on moving 3D meshes.

### 5.2 UI form language

- Content panels: deep-slate or charcoal surfaces with subtle borders; use backdrop blur only where contrast remains excellent.
- Borders: thin, restrained, typically 1 px; avoid thick glowing strokes.
- Radius: subtle (typically 8–16 px), not bubbly cards.
- Buttons: clear outlines/fills, premium typography, strong touch targets.
- Navigation: a compact, elegant top/side dock that doesn't compete with the scene.
- Status/labels: quiet typography with selective cyan for active location.
- Icons: simple consistent stroke weight; no mismatched icon packs.

### 5.3 Content strategy

Preserve real portfolio facts and existing project destinations from the current Nuxt site. Do not invent roles, client names, certifications, metrics, project outcomes, or technologies. If content is missing, flag it rather than fabricating it.

Every project should prioritize:

1. Project name and one-line value proposition.
2. Visual evidence (screenshots, demo, or legitimate illustration).
3. Your contribution and technologies used.
4. Outcomes only when verified.
5. Direct link to details, demo, or repository when available.

Use professional, concise microcopy. Avoid self-congratulatory clichés such as “Welcome to my universe,” “I create magic,” or “Unlock the future.”

**Illustrative entry copy (subject to content verification):**

- `Andy Pang`
- `Explore my work` / `View projects` / `About` / `Get in touch`
- `Explore the atelier` as an optional navigation cue, not required hero marketing copy.

---

## 6. Responsive and accessible experience

### Desktop

Full-bleed architectural canvas, deliberate perspective, consistent persistent navigation. Mouse and keyboard affordances. Support large screens without oversized text or empty uncontrolled space.

### Mobile

Prioritize readable content, prominent tap targets, quick navigation, and low-friction camera transitions. A simplified or static 3D representation is acceptable if it preserves the aesthetic and communicates the same work.

### Accessibility baseline

- Key routes and content work without 3D, mouse, audio, or complex animations.
- Provide keyboard navigation, visible focus, semantic regions, accessible names, and predictable Escape/back behavior.
- Respect operating-system reduced-motion preferences.
- Meet WCAG AA text contrast targets (4.5:1 for normal text; 3:1 for large text and important graphical affordances), checking against actual scene backgrounds.
- Avoid relying exclusively on color to indicate interactivity.
- Preserve meaningful page title, metadata, headings, and crawlable project content.

---

## 7. Visual reference board and interpretation

These are **reference categories**, not licenses to copy exact layouts, proprietary assets, or brand identities.

1. **Luxury architectural visualization:** search terms `minimalist dark contemporary museum interior`, `charcoal stone brushed metal architecture`, `cinematic art gallery interior warm spotlights`. Learn from composition, negative space, material discipline, and believable lighting.
2. **Premium interactive creative sites:** review [Bruno Simon's portfolio](https://bruno-simon.com/) *for discoverability, playfulness, and world-based navigation only*. Do **not** imitate its vehicle or playful low-poly style.
3. **Editorial luxury UI:** search terms `minimal dark editorial portfolio typography`, `premium design studio website dark`, `museum exhibition interface`. Learn from typography, restraint, and readable overlays.
4. **Cinematic sci-fi environments:** search terms `grounded futuristic architectural laboratory`, `high-end interactive virtual gallery`, `cinematic near-future interior`. Borrow material plausibility and lighting, not militarized/cyberpunk clichés.

**Reference priority:** Approved screenshots or moodboard images supplied in the repository outrank broad search results and verbal inspiration. If image references conflict, flag the conflict; never silently blend unrelated aesthetics.

**Reference assets to collect before final modeling:**

- `references/01-atrium-composition.*` — single clear hero composition
- `references/02-material-lighting.*` — stone/titanium/glass under approved lighting
- `references/03-project-gallery.*` — art-directed exhibition layout
- `references/04-ui-typography.*` — UI panel/navigation treatment

These are placeholders for reference files, not claims that such assets already exist.

---

## 8. Mandatory quality bar and acceptance rubric

**Review the actual browser build using comparable screenshots, not only code or Blender renders.** Artistic acceptance requires visual evidence. Compare mobile and desktop separately.

Score each dimension 1–5:

| Dimension | 1 — Reject | 3 — Adequate | 5 — Target |
|---|---|---|---|
| Overall art direction | Disjointed/generic | Mostly consistent | Singular, memorable, cohesive |
| Composition | Chaotic/empty | Clear focal point | Cinematic, intentional depth and hierarchy |
| Modeling | Obvious placeholder blocks | Functional detail | Believable silhouettes, joints, designed objects |
| Materials | Plastic/flat | Some physical realism | Nuanced response, consistent textures and roughness |
| Lighting | Flat/neon/black crush | Readable | Architectural, dimensional, atmospheric |
| Typography/UI | Unreadable/mismatched | Functional | Editorial, restrained, polished |
| Motion | Jarring/disorienting | Usable | Controlled, fluid, meaningful |
| Exploration | Confusing | Discoverable | Immediately intuitive and rewarding |
| Content clarity | Hidden or invented | Reachable | Direct, accurate, memorable |
| Responsive/accessibility | Broken | Partial | Thoughtful and verified across devices |

### Release gate

- **No 1 or 2** in any dimension.
- **Average at least 4.2/5** across the rubric as an internal evaluation target; self-scoring is insufficient without screenshots and observable evidence.
- Core visual dimensions (composition, modeling, materials, lighting) must score **at least 4/5**.
- Full usability, content, and accessibility checks must pass independently; aesthetics cannot excuse broken functionality.
- Final approval of subjective aesthetic quality remains with the site owner.

### Specific visual rejection criteria

Reject/revise when:

- The main world consists predominantly of crude primitives with no constructed detailing.
- Surfaces look like flat diffuse colors without controlled texture/material response.
- Emissive cyan/purple washes dominate the architectural forms.
- Lighting destroys depth or makes important information illegible.
- Different rooms appear to come from unrelated art packs.
- Hero typography clashes with major architecture or is hard to read.
- The world looks impressive only in a Blender render, not in a real browser screenshot.
- The mobile experience is merely a cropped, unusable desktop canvas.

### Review snapshots

Capture at minimum:

1. Desktop arrival scene (initial state).
2. Desktop scene with a selected destination.
3. One project-detail panel and its return state.
4. A second distinct zone showing consistent material/light treatment.
5. Mobile arrival and mobile content access.
6. Reduced-motion and WebGL fallback states.

Annotate each snapshot with specific strengths, weaknesses, and subsequent fixes. Fix visual problems at the source instead of masking them with post-processing.

---

## 9. Performance and delivery experience

The environment should feel premium because it **loads reliably and responds smoothly**.

- Target a smooth experience on representative mainstream desktop hardware, and a deliberately simplified responsive experience on mid-range mobile devices.
- Use **60 fps desktop / 30 fps mobile** as aspirational sustained interaction targets, measured on declared test devices rather than promised universally.
- Keep a meaningful first render and quick access to professional content even if 3D assets load progressively.
- Avoid unnecessary autoplay audio; if any sound is included, default to off or ask permission and provide clear controls.
- Favor adaptive quality and selective detail over a heavyweight single scene.
- Do not compromise contrast, legibility, or touch behavior to preserve visual effects.

No specific library, rendering backend, asset compression method, modeling strategy, or file structure is prescribed here; these are engineering decisions for Codex.

---

## 10. Decision rights for autonomous implementation

### Locked creative decisions — do not change silently

- Hybrid architectural-gallery + playful-discovery concept.
- Restrained dark architectural palette with warm neutrals and selective muted cyan.
- Realistic/stylized-premium material language, **not** cartoon low-poly or generic cyberpunk.
- Spatial world centered on meaningful portfolio destinations.
- Discoverable interaction without forced gameplay or blocking navigation.
- Excellent conventional typography and accessible content layer.
- Actual rendered visual quality as a release criterion.

### Open to Codex

- Nuxt-compatible 3D/rendering/animation packages.
- Modeling workflow: Blender manual/procedural scripts, free models, texture baking, hybrid techniques.
- Exact mesh topology, assets, light implementation, shaders, and camera controller.
- Scene architecture, state management, components, routing, loading, optimization, and testing tools.
- Detailed floorplan and how many rooms can be delivered cohesively.
- Additional touches that reinforce the defined art direction.

### Escalate only when

- A major visual departure from this design is being proposed.
- The chosen style cannot meet usability/performance requirements without substantial simplification.
- Essential factual portfolio content is unavailable or contradictory.
- Licensing or paid-asset constraints block a needed creative choice.
- Destructive operations or production deployment require approval.

---

## 11. Final handoff instruction to Codex

> Treat this document as the authoritative **art direction and experience contract**, not as a coding task list. Inspect the existing Nuxt repository; select your own tools, architecture, art pipeline, and implementation plan. Maintain fidelity to the approved references, validate actual Blender and browser renders, and iterate until the visual acceptance criteria are met. Keep the world intuitive, the content truthful, and the entire portfolio accessible. Do not declare visual completion from successful builds alone. Do not deploy to production without approval.

**Definition of success:** A visitor enjoys exploring the site, immediately recognizes a coherent premium visual identity, understands Andy's work, and can reach any key portfolio destination effortlessly.
