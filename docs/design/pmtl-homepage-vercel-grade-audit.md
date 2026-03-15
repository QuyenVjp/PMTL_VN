# PMTL Homepage Audit

## Goal

Bring the homepage closer to a "Vercel-grade but warm Buddhist" standard:

- precise, disciplined, calm
- warm editorial identity preserved
- fewer visual dialects per page
- more consistency in spacing, hierarchy, and interaction

## Executive Summary

The homepage already has a strong foundation:

- semantic color tokens already exist
- typography pairing is solid for a Buddhist editorial product
- multiple sections already show premium intent
- the layout has enough content depth to feel product-grade

What is missing is not taste. It is system discipline.

The current homepage behaves like several good sections designed with slightly different rules. The main regression versus Next.js/Vercel is inconsistency in:

- surface vocabulary
- radius scale
- accent density
- card anatomy
- hover and motion rules
- section rhythm

## Priority Fixes

### P1. Reduce the surface system to 3 primary surfaces

Current issue:

- sections mix `bg-card`, `bg-card/70`, `bg-background/55`, `bg-secondary/30`, `bg-black/12`, `bg-black/32`, `bg-black/34`, gold tints, and blur-heavy overlays
- this creates too many layer personalities on one page

Target:

- `Surface 1`: default page background
- `Surface 2`: standard card/panel
- `Surface 3`: emphasized panel or hero glass layer

Recommendation:

- homepage cards should mostly use one standard panel recipe
- reserve tinted/glass surfaces for hero and one CTA block only
- avoid combining border tint + gradient tint + glow tint on the same component

Affected areas:

- `HeroSection.tsx`
- `PhaoBaoSection.tsx`
- `ContentFeeds.tsx`
- `NewsletterSignup.tsx`

### P1. Lock a single radius scale

Current issue:

- homepage mixes `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-[1.75rem]`, and `rounded-[2rem]`
- the same semantic object type does not keep the same corner language

Target:

- `sm`: controls and compact UI
- `md`: standard panels and dropdowns
- `lg`: feature cards and major sections

Recommendation:

- use `rounded-md` for controls, pills, search, small chips
- use `rounded-xl` for standard cards
- use `rounded-2xl` only for marquee blocks like newsletter or one hero-adjacent panel
- remove arbitrary radii unless they define a flagship block

Affected areas:

- `Header.tsx`
- `PhaoBaoSection.tsx`
- `ActionCards.tsx`
- `ContentFeeds.tsx`
- `NewsletterSignup.tsx`

### P1. Make gold strategic, not ambient

Current issue:

- gold appears in headings, icons, labels, dots, dividers, pills, buttons, metadata, hover states, and decorative glows at the same time
- because gold is everywhere, it stops carrying hierarchy

Target:

- gold should mean one of three things only:
  - sacred emphasis
  - active state
  - primary CTA

Recommendation:

- default card icons should lean neutral or muted bronze, not full gold
- reserve strong gold for:
  - hero highlight line
  - primary action
  - one metadata accent per card
  - key spiritual/ritual markers
- downgrade many hover states from `text-gold` to `text-foreground`

Affected areas:

- `HeroSection.tsx`
- `PhaoBaoSection.tsx`
- `AboutSection.tsx`
- `ContentFeeds.tsx`
- `Footer.tsx`

### P1. Standardize card anatomy

Current issue:

- cards currently use different internal rhythms and different information order
- some cards open with icon, some with label, some with date, some with title directly

Target anatomy:

- eyebrow
- title
- description
- meta or CTA

Recommendation:

- every homepage card should follow this order, even if one row is omitted
- eyebrow should be small, uppercase or muted label, never louder than the title
- meta/CTA should live at the bottom edge to give cards a shared baseline

Best fit areas:

- `PhaoBaoSection.tsx`
- `ActionCards.tsx`
- `ContentFeeds.tsx`

### P1. Reduce decorative motion and keep only structural motion

Current issue:

- many sections animate independently with slightly different entrance patterns
- some components combine fade, translate, scale, glow, hover border, and icon movement in one block

Target:

- motion should communicate reveal, affordance, or content replacement
- default rule: opacity + translate only

Recommendation:

- keep hero crossfade because it has product meaning
- for grid cards, prefer one reveal style across homepage
- hover should mostly use:
  - border opacity
  - text contrast
  - `translateY(-1px)` or small arrow translation
- remove decorative scale-ups unless content is image-led

Affected areas:

- `HeroSection.tsx`
- `PhaoBaoSection.tsx`
- `AboutSection.tsx`
- `ActionCards.tsx`
- `ContentFeeds.tsx`

### P1. Tighten section rhythm

Current issue:

- sections are individually spacious, but the page rhythm is not uniform
- heading blocks, card gaps, and end spacing vary enough to break overall cadence

Target:

- each section should feel like a variation inside one editorial system

Recommendation:

- standard section shell:
  - intro block width cap
  - consistent top/bottom spacing
  - fixed gap between heading and content
- use one divider language across the page
- avoid one section feeling card-dense while the next feels essay-like without a deliberate transition

## Section Findings

### Header

What works:

- sticky behavior and blur support a premium shell
- compact structure is directionally correct

What hurts quality:

- desktop nav, dropdowns, mobile sheet, and auth controls use different density and radius rules
- gold is used too early in nav affordances, making the bar feel busier than Vercel-grade navigation

Recommendation:

- flatten nav interactions
- use smaller contrast changes instead of gold-first hover treatment
- standardize dropdown panel shape to the same panel recipe used elsewhere

### Hero

What works:

- cinematic mood is strong
- type scale is ambitious and memorable
- search CTA is product-relevant

What hurts quality:

- too many competing accents: gold highlight line, gold search icon, gold button, gold dots, radial glow, glass cards
- stats cards feel like a different component family from lower-page cards

Recommendation:

- keep the large editorial headline
- reduce hero accent count
- make stat cards the canonical homepage card recipe, or align them with the main card recipe
- choose either glow-led hero or border-led hero, not both at full strength

### Five Dharma Treasures

What works:

- content structure is naturally suited to a card grid
- iconography helps first-time readers

What hurts quality:

- card anatomy is close to correct but icon and gold usage are too assertive on every item
- hover adds too much decorative reward for a calm spiritual product

Recommendation:

- move to calmer icons
- keep CTA row but lower its contrast
- ensure every card shares the same internal baseline and spacing

### Action Cards

What works:

- best candidate for Vercel-style discipline on the homepage
- hierarchy is clear and the split layout has intention

What hurts quality:

- still slightly over-decorated via strong gold icon treatment and elevated hover
- primary and secondary cards are structurally related, but visually more different than needed

Recommendation:

- use this section as the reference pattern for future homepage cards
- keep asymmetry, but unify panel recipe and CTA rhythm

### About Section

What works:

- content depth is strong
- editorial side plus accordion side gives a serious product feel

What hurts quality:

- this section shifts into a more ornate tone than the rest of the homepage
- gradient headline, quote border, stat cards, accordion cards, and info box together create too many style voices

Recommendation:

- simplify to one strong headline moment
- remove one decorative layer
- make accordion panels flatter and more disciplined

### Content Feeds

What works:

- this section is valuable product-wise because it proves freshness and breadth
- left/main plus right/sidebar structure is useful

What hurts quality:

- too many card types in one section
- mixed metadata treatments
- sidebar categories feel more dashboard-like than editorial

Recommendation:

- unify both feed cards under one card anatomy
- make sidebar calmer, smaller, and more list-driven
- treat category list as navigation, not feature content

### Newsletter

What works:

- messaging is strong and brand-aligned
- layout already feels like a composed, premium CTA

What hurts quality:

- arbitrary radii make it feel separate from the rest of the page
- inner digest pills and form card add another micro-system

Recommendation:

- keep this as the single "softly elevated" block on the page
- simplify its internal panel hierarchy
- reduce the number of shape styles inside it

### Footer

What works:

- information density is useful and mature

What hurts quality:

- it becomes link-heavy and visually loose after a relatively disciplined body
- current treatment is more utilitarian than intentionally composed

Recommendation:

- tighten columns and vertical rhythm
- reduce decorative hover emphasis
- make footer feel more like a quiet information shelf

## Recommended Homepage System

### Surface Rules

- page background stays warm and quiet
- standard cards use one shared panel recipe
- only hero and newsletter may use elevated or glass-like variants

### Accent Rules

- gold is not a decorative default
- gold highlights action, sacred emphasis, or active state
- neutral text contrast should do most of the hierarchy work

### Motion Rules

- default enter: fade + rise
- default hover: border contrast + tiny translate
- image cards may use gentle scale
- avoid motion stacks with glow + scale + translate + color shifts together

### Typography Rules

- headings remain serif-led
- body remains clean and restrained
- reduce the number of places where label text tries to look ceremonial

### Layout Rules

- section intro width should be predictable
- heading-to-grid gap should be standardized
- card height alignment matters more than decorative variance

## Suggested Refactor Order

1. Normalize tokens in `app/globals.css` for surfaces, radius, and motion.
2. Refactor homepage cards into one shared anatomy and panel recipe.
3. Simplify hero accent density.
4. Flatten nav, sidebar, and footer interaction styling.
5. Re-check the full page for rhythm and contrast, not section by section.
