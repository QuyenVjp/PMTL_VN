# PMTL Precision Design Playbook

## Positioning

PMTL should feel:

- warm
- composed
- editorial
- spiritual but not ornamental
- premium through discipline, not decoration

The target is not to copy Next.js or Vercel visually.

The target is to borrow their precision:

- strict hierarchy
- limited visual vocabulary
- consistent component anatomy
- quiet but exact motion

## Core Principle

Use Buddhist warmth as the atmosphere.
Use Vercel-grade discipline as the system.

## 1. Surface System

Use only 3 surface levels across homepage and major marketing pages.

### Surface 1: Page Ground

- role: page background
- feel: warm cream or deep earth, low noise
- use: section background, body canvas

### Surface 2: Standard Panel

- role: default card and dropdown surface
- feel: restrained contrast, crisp border, no theatrical shadow
- use: cards, accordions, list containers, footer panels

### Surface 3: Emphasis Panel

- role: only for hero overlays and one marquee CTA block
- feel: soft glass or elevated panel, but still calm
- use: hero search, hero stat group, newsletter shell

Rule:

- if a component needs more than one tint, blur, and glow to stand out, the hierarchy is wrong

## 2. Radius Scale

Use a fixed semantic radius scale.

- `rounded-md`: inputs, buttons, chips, nav items, small controls
- `rounded-xl`: standard cards and content panels
- `rounded-2xl`: marquee blocks only

Rules:

- do not introduce arbitrary radii unless the block is intentionally flagship
- objects with the same semantic role must share the same radius

## 3. Accent Strategy

Gold is sacred emphasis, not background seasoning.

Gold may be used for:

- one hero highlight
- primary CTA
- active selection
- one key metadata token
- ritual or spiritual marker

Gold should not be the default for:

- every icon
- every link hover
- every divider
- every small badge
- every secondary CTA

Default hierarchy should come from:

- foreground contrast
- scale
- spacing
- border clarity

## 4. Card Anatomy

Homepage cards should follow one shared internal order:

1. eyebrow
2. title
3. description
4. meta or CTA

Rules:

- eyebrow is small, quiet, and optional
- title carries the main visual weight
- description should stay within a disciplined line length
- meta or CTA should sit at the bottom edge for alignment across a row

## 5. Typography

### Role split

- display serif for spiritual and editorial authority
- clean sans for body, metadata, and interface language

### Tone rules

- headlines should feel contemplative, not luxurious
- body copy should be readable first, elegant second
- labels should be quiet and sparse

### Scale rules

- keep one homepage display scale family
- avoid using oversized display serif in too many consecutive sections
- keep metadata small but not fragile

## 6. Spacing and Rhythm

Use spacing to build calm.

### Section shell

- each section should have a predictable top and bottom rhythm
- intro block width should repeat across sections
- heading-to-content gap should be standardized

### Card spacing

- standardize inner padding by card size
- standardize gaps between eyebrow, title, description, and CTA
- do not let one card type feel dense while another feels airy without intention

## 7. Motion

Motion must be structural, not ornamental.

### Default motion

- enter: fade + slight rise
- hover: border contrast + tiny translate
- content replace: fade or crossfade

### Allowed emphasis

- gentle image scale
- arrow shift on CTA
- hero crossfade

### Avoid

- stacking glow + scale + lift + color change together
- large hover jumps
- heavy blur theatrics outside hero

## 8. Interaction Style

PMTL interactions should feel:

- responsive
- respectful
- quiet

Rules:

- hover should usually brighten intent, not shout with color
- pressed states should feel slightly denser, not flashy
- navigation should prioritize predictability over novelty

## 9. Component Recipes

### Standard Card

- `rounded-xl`
- single border recipe
- quiet background
- minimal shadow or none
- anatomy: eyebrow, title, description, CTA

### Feature Card

- same recipe as standard card
- larger title scale
- asymmetry allowed, styling language unchanged

### Sidebar List

- list-first, not card-first
- compact row rhythm
- calmer hover than primary content cards

### Hero Glass

- only place where glass, blur, and atmospheric layering can be stronger
- even here, cap accents to one main highlight logic

### Marquee CTA

- one elevated block per page is enough
- simplify internal sub-panels so the outer shell stays dominant

## 10. What "Vercel-grade but warm Buddhist" Means in Practice

It means:

- fewer component personalities
- fewer color events
- stronger grid discipline
- cleaner text hierarchy
- calmer, more deliberate interaction

It does not mean:

- turning PMTL into a black-and-white SaaS site
- replacing editorial warmth with sterile tech minimalism
- removing spiritual tone from the brand

## Implementation Checklist

- Does this component use one of the 3 approved surfaces?
- Does its radius match its semantic role?
- Is gold carrying real meaning here?
- Does the card follow the shared anatomy?
- Is motion limited to opacity and transform unless there is a good reason?
- Is the spacing rhythm consistent with adjacent sections?
- Would this still feel premium if the gold accent were removed?

If the answer to the last question is no, the component is relying on decoration instead of structure.
