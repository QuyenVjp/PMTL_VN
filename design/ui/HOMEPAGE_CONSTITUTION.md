# Homepage Constitution — PMTL_VN

> Companion document for [LANDING_PAGE_DESIGN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/LANDING_PAGE_DESIGN.md).
> This file sharpens homepage art direction, atmosphere, and composition.
> Route authority still belongs to `PAGE_INVENTORY.md`. Navigation authority still belongs to `NAVIGATION_ARCHITECTURE.md`.

---

## 1. Purpose

Homepage PMTL_VN must do 4 jobs at the same time:

1. Introduce the pháp môn with dignity.
2. Prove this is a real tu học product, not a brochure.
3. Guide new users into the 5 Đại Pháp Bảo without overload.
4. Open a calm, premium first impression that shows design maturity without becoming fintech theater.

This homepage is not allowed to feel like:

- a startup SaaS landing page
- a donation funnel
- a content farm
- a productivity tracker
- a generic “AI premium” template

It should feel like:

- a modern editorial sanctuary
- a digital temple gate
- a trusted entry point into a living practice system

---

## 2. Visual Laws

Homepage decisions must obey these 3 laws:

### Law 1 — Editorial Precision

- Typography is the primary design instrument.
- Grid rhythm must feel exact, not improvised.
- Surfaces must be deliberate, with repeated card anatomy and restrained decoration.
- Spacing must create calm through control, not through emptiness alone.

### Law 2 — Sacred Warmth

- Light mode is the default emotional home.
- Warm cream, parchment, bronze, and restrained gold carry the identity.
- Gold is a sacred emphasis, not a blanket wash.
- Imagery of Quan Thế Âm Bồ Tát is treated as reverent focal content, never as decorative stock filler.

### Law 3 — Module Gateway, Not Just Marketing

- Every major section must open a useful path into practice, study, or orientation.
- Homepage should help the user begin, continue, or deepen tu học.
- CTAs must guide toward real modules, not generic “learn more” dead ends.

---

## 3. What To Borrow From React Bits Style

The reference direction is useful for structure, not identity.

Borrow:

- strong hero discipline
- exact spacing and clean edge alignment
- elegant serif display headlines
- premium bento-card composition
- alternation between spacious light sections and one deep dark contrast section
- modern CTA/button clarity
- phone/device preview as proof of product depth

Do not borrow:

- black-and-white fintech mood as the core atmosphere
- startup testimonial language
- sales-led statistics as the primary proof layer
- hard-sell email capture hero
- cold compliance aesthetics

Rule:

`Borrow the form language. Replace the emotional language.`

---

## 4. Color Constitution

## 4.1 Core direction

Light mode must dominate the homepage.
Dark is used only where a wisdom or sacred contrast is needed.

The homepage should read as:

- luminous
- warm
- high-end
- calm

not:

- beige and sleepy
- yellow and noisy
- luxury-fashion gold
- dark-first fintech

## 4.2 Canonical homepage tokens

These tokens are the preferred homepage palette direction.
They are intentionally close to the gold system the user approved.

### Light mode

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.19 0.01 72);
  --card: oklch(0.995 0.004 82);
  --card-foreground: oklch(0.19 0.01 72);
  --primary: oklch(0.8512 0.1254 73.9788);
  --primary-foreground: oklch(0.14 0.02 72);
  --secondary: oklch(0.9458 0.0454 76.3285);
  --secondary-foreground: oklch(0.24 0.02 72);
  --muted: oklch(0.9593 0.011 76.5971);
  --muted-foreground: oklch(0.5319 0.0413 75.9565);
  --accent: oklch(0.9197 0.0677 76.018);
  --accent-foreground: oklch(0.18 0.02 72);
  --border: oklch(0.8978 0.0278 76.4745);
  --ring: oklch(0.8512 0.1254 73.9788);
}
```

### Dark contrast sections only

```css
.dark {
  --background: oklch(0.1651 0.0141 76.6248);
  --foreground: oklch(0.9726 0.0227 76.527);
  --card: oklch(0.2044 0.0207 75.5143);
  --card-foreground: oklch(0.9726 0.0227 76.527);
  --primary: oklch(0.8512 0.1254 73.9788);
  --secondary: oklch(0.2898 0.035 75.0019);
  --muted: oklch(0.2843 0.0269 75.6534);
  --muted-foreground: oklch(0.7409 0.0338 76.3513);
  --accent: oklch(0.3627 0.0619 72.5775);
  --accent-foreground: oklch(0.9197 0.0677 76.018);
  --border: oklch(0.3399 0.0342 75.5286);
}
```

## 4.3 Practical color rules

- Main page background should feel like parchment light, not pure sterile white.
- Cards should float subtly above the background with warm shadow, not gray-blue shadow.
- Gold appears on CTAs, active focus, key numbers, key lines, and selected details only.
- Section contrast should come more from value and surface than from extra hues.

---

## 5. Typography Constitution

## 5.1 Font direction

Preferred homepage direction:

- Sans: `Montserrat`
- Serif display: `Cormorant Garamond`
- Mono or utility numbers: `Geist Mono`

Typography split:

- Serif for spiritual authority, premium editorial tone, and large statements.
- Sans for UI labels, metadata, nav, and explanatory body copy.

Important:

- Vietnamese dấu must be tested carefully before final implementation.
- If any serif rendering weakens Vietnamese readability, fallback to a stronger Vietnamese-capable serif while preserving this same editorial tone.

## 5.2 Scale

- Hero display: `clamp(3.6rem, 7vw, 6.4rem)`
- Section title: `clamp(2.2rem, 4vw, 3.4rem)`
- Card title: `1.25rem` to `1.55rem`
- Body lead: `1.05rem` to `1.15rem`
- Utility copy: `0.9rem` to `0.98rem`

Rules:

- Headline letter-spacing should be slightly tightened.
- Body text should not become airy or fashion-editorial to the point of lowering readability.
- Serif must never dominate small utility UI.

---

## 6. Homepage Architecture

Homepage structure should follow this sequence:

1. `The Gate`
2. `Five Treasures`
3. `Why This Path Exists`
4. `Daily Practice Proof`
5. `Wisdom Chamber`
6. `Module Gateway`
7. `Closing Invitation`

Each section must feel distinct, but the whole page must read as one composed ritual journey.

---

## 7. Section-by-Section Direction

## 7.1 The Gate

### Goal

Answer:

- What is this?
- Why should I care?
- Does this feel trustworthy, beautiful, and serious?

### Composition

Desktop must be asymmetric but stable.
Do not use a generic centered hero block copied from fintech templates.

Recommended composition:

- left: editorial headline, sacred subcopy, two decisive CTAs
- right: framed sacred panel with Quan Thế Âm Bồ Tát imagery or equivalent reverent visual treatment
- background: luminous warm field with subtle architectural grid or temple-line geometry

### Visual mood

- deep bronze haze near edges
- cream-to-gold gradients kept soft
- thin linework, not decorative patterns everywhere
- sacred image framed like an icon panel, not a billboard

### Copy tone

Headline should sound like invitation, not advertising.

Good:

- “Bước vào hành trình tu học với một không gian được thiết kế để đồng hành lâu dài.”
- “Một cổng vào nhẹ nhàng cho người mới, và một nền tảng vững chãi cho người đang hành trì.”

Avoid:

- promise inflation
- productivity language
- conversion-hungry urgency

### CTA logic

Primary:

- `Bắt đầu tu học`

Secondary:

- `Khám phá 5 Đại Pháp Bảo`

Small tertiary text link:

- `Đã có tài khoản? Đăng nhập`

Do not use:

- “Book demo”
- “Start free trial”
- “Join 40,000 users”

## 7.2 Five Treasures

### Goal

Translate the pháp môn into 5 visible gateways.

### Layout

This section must be the first major proof of system thinking.

Use:

- premium bento grid
- uneven card spans
- repeated anatomy
- restrained hover behavior

Each card must contain:

- treasure name
- spiritual function
- one-line orientation
- one clear path inward

### Visual rule

The cards should feel architectural, not playful.

Recommended card personality:

- rounded but not bubbly
- subtle internal gradient or grain
- thin border
- small icon or symbolic line motif
- hover = slight lift + warmer surface, not big transform

### Content rule

Each treasure card must answer:

- what this module helps with
- who should enter here first
- what kind of practice or study happens here

## 7.3 Why This Path Exists

### Goal

State the philosophical difference between PMTL and noisy digital products.

This section must make clear:

- PMTL is not gamified
- PMTL is not performance theater
- PMTL supports sincerity, continuity, and understanding

### Composition

Use a quiet editorial layout:

- left: one pull quote or design principle
- right: 2 to 3 short paragraphs

No icons.
No product tiles.
No vanity metrics.

## 7.4 Daily Practice Proof

### Goal

Show that PMTL is a working practice product, not just a belief page.

### Composition

- left: phone mockup or controlled device frame
- right: 4-step micro story of a user’s daily flow

Suggested flow:

1. See today’s guidance
2. Begin practice
3. Record practice honestly
4. Continue into deeper modules when needed

### UX rule

The preview must feel usable by a real practitioner.
No fantasy dashboards.
No gamification streaks.
No flashy mini charts.

## 7.5 Wisdom Chamber

### Goal

Create depth, reverence, and contrast.

### Composition

This is the main dark section.

It should contain:

- Bạch Thoại or lời dạy preview
- one or two curated Q&A excerpts
- one path into deeper reading or listening

### Dark rule

Dark mode here must feel like:

- lacquered wood
- temple bronze
- candlelit reading room

not:

- black SaaS dashboard
- cyber luxury
- purple AI glow

## 7.6 Module Gateway

### Goal

Make the homepage operational.

This section should point toward core working areas such as:

- lịch tu
- ngôi nhà nhỏ
- phát nguyện
- tra cứu
- học offline

### Rule

This is not a features grid.
It is a directional gateway for different practice intents.

Think in user intent buckets:

- “Tôi muốn bắt đầu”
- “Tôi muốn duy trì công khóa”
- “Tôi muốn tra cứu lời dạy”
- “Tôi muốn học sâu hơn”

## 7.7 Closing Invitation

### Goal

Close with calm resolve.

The final CTA area should feel ceremonial and simple.
One strong button, one softer alternate path.

It must not feel like a sales close.

---

## 8. Sacred Imagery Rule

If using Quan Thế Âm Bồ Tát imagery:

- use one primary image, not many
- place it in a framed or contained composition
- avoid aggressive crops
- avoid layering floating badges or UI clutter over the face
- avoid using the image merely as texture

Approved uses:

- reverent side panel in hero
- framed visual anchor in a transitional section
- still, luminous supporting image with breathing room

Avoid:

- background wallpaper behind text
- parallax spectacle
- decorative repetition

---

## 9. Surface Language

Homepage surfaces should use a small, disciplined vocabulary:

- parchment background
- ivory cards
- muted bronze dividers
- gold emphasis
- deep espresso contrast sections

Card hierarchy:

- default cards use soft borders and low, warm shadow
- important cards get slightly deeper shadow and brighter edge
- no glassmorphism overload
- no thick frosted blur stacks

---

## 10. Responsive Constitution

## Desktop

- asymmetry is allowed and encouraged
- headline can span multiple lines dramatically
- sacred image can occupy a full side column
- bento grid should show composition intelligence

## Tablet

- preserve section rhythm
- simplify asymmetry before it breaks
- keep the sacred focal point visible above the fold

## Mobile

- hero becomes single-column
- sacred panel moves below the copy or becomes a compact framed insert
- primary CTA remains immediate
- card stacks become calm, legible, and not too tall
- no decorative layers that slow scanning

Mobile homepage must still feel premium, not collapsed.

---

## 11. Motion Tone

Motion exists to guide, not impress.

Allowed:

- fade and rise
- staggered reveal
- subtle card lift
- gentle phone-state transitions

Avoid:

- continuous looping spectacle
- shimmer-heavy surfaces
- dramatic horizontal slides
- parallax dependency for meaning

Reduce-motion must degrade cleanly.

---

## 12. Copy Tone

Homepage language should be:

- invitational
- grounded
- reverent
- clear

Not:

- over-poetic to the point of vagueness
- preachy
- conversion-obsessed
- app-marketing generic

Use short sentences.
Use concrete spiritual intent.
Let typography and spacing carry some of the emotion.

---

## 13. Acceptance Criteria

Homepage direction is correct only if all statements below are true:

- A designer can immediately see that the visual standard is above generic shadcn marketing output.
- A practitioner can immediately see this is for real tu học, not self-optimization theater.
- The light mode looks warm, premium, and gold-led without becoming loud.
- The dark section adds gravity instead of turning the site into fintech noir.
- The 5 Đại Pháp Bảo feel like actual gateways, not decorative categories.
- The page clearly leads into real modules and real practice paths.
- On mobile, the page still feels composed and premium.

---

## 14. Notes For AI Design And Codegen

- Preserve [LANDING_PAGE_DESIGN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/LANDING_PAGE_DESIGN.md) as the main landing-page owner.
- Use this file to sharpen art direction, palette discipline, and homepage emotional logic.
- Do not invent route names here; route canon lives elsewhere.
- When converting this into UI, prefer high-precision composition over more components.
- If forced to choose, sacrifice decorative effects before sacrificing readability or sacred tone.
