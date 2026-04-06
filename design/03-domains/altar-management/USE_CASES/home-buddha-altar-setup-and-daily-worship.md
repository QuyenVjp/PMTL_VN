# Bàn Phật Gia Đình — Cài Đặt và Thờ Phụng Hàng Ngày — Home Buddha Altar: Setup & Daily Worship

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh; Khai thị ngày 4/11/2021 về Đức Phật Thích Ca Mâu Ni
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

A Buddha altar in the home is not merely decorative—it is a spiritual presence that anchors the household in Buddhist practice. The altar invites Bodhisattva Guan Yin (and Shakyamuni Buddha per 2021 teaching) into the home, transforming daily practice and merit generation. The system guides practitioners to:

1. **Understand why an altar is essential** — spiritual efficacy of practice depends on proper invocation
2. **Invite and consecrate statues properly** — ensuring Bodhisattvas are genuinely present, not just objects
3. **Establish daily worship rhythm** — morning and evening incense, water offering, and maintenance
4. **Follow Shakyamuni Buddha addition protocol** — integrating latest 2021 teaching on dual worship (Guan Yin + Shakyamuni)
5. **Maintain altar purity and reverence** — spatial rules, object placement, gesture protocols
6. **Navigate common questions** — altar size, statue material, arrangement, when traveling, moving altar

This ensures the altar becomes a living gateway between household and spiritual realm, not merely ritual furniture.

## Owner Module

`altar-management` — BuddhaAltarService / AltarSetupGuard / DailyWorshipScheduler

## Actors

- **Practitioner**: Sets up altar, maintains daily worship, follows purity rules, invites statues
- **System**: Validates altar placement, tracks daily incense/water offerings, warns about protocol violations
- **Bodhisattvas**: Guan Yin, Shakyamuni Buddha, supporting Bodhisattvas (Nam Kinh, Thái Tuế, Quan Đế, Châu Thương, Quan Bình)
- **Ritual Expert**: Performs or guides consecration ceremony (khai quang — statue blessing)

## Trigger

1. Practitioner decides to set up home altar (new household, new practice)
2. Practitioner has already invited statues but hasn't formally established altar yet
3. Practitioner receives teaching about adding Shakyamuni Buddha (2021 update)
4. Practitioner has questions about altar maintenance, daily worship, statue arrangement
5. Practitioner needs to relocate or temporarily move altar

## Business Rules

### Part A: Why a Buddha Altar Is Essential

| Rule ID | Vietnamese | English | Rationale |
|---------|-----------|---------|-----------|
| ESSENTIAL_001 | Nếu điều kiện cho phép, phải lập bàn Phật trong nhà | If conditions allow, establish Buddha altar in home (MANDATORY) | Altar = inviting Bodhisattva into home; without it, spiritual efficacy differs greatly |
| ESSENTIAL_002 | Lập bàn Phật tức là thỉnh Bồ Tát về trong nhà | Setting up altar = inviting Bodhisattva to reside in household | Altar is not decoration but living spiritual presence |
| ESSENTIAL_003 | Hiệu quả tu tâm và đốt Ngôi Nhà Nhỏ khác biệt rất nhiều | Practice efficacy and Little House merit generation differ significantly with vs. without altar | Altar amplifies spiritual power of daily recitation and offerings |

### Part B: Inviting Bodhisattva Statues

#### Statue Selection

| Criterion | Requirement | Rationale |
|-----------|------------|-----------|
| **Primary statue** | Guan Yin Bodhisattva standing, holding willow branch & vase (净瓶), ceramic/porcelain material | Standing posture indicates active compassion; willow + vase = healing + purification |
| **Avoid auspicious beasts** | NO dragons, cranes, or auspicious animal statues | Animals carry karma; can interfere with pure spiritual energy |
| **Animal-free materials** | Ceramic, porcelain, stone, wood ONLY; NO bone, skin, fur, ivory, horn | Animal materials carry sentient suffering and defile altar purity |
| **Pre-blessing status** | Preferably un-blessed statue; practitioner invites Bodhisattva into statue after bringing home | If pre-blessed by master/temple, more auspicious but still requires invocation |
| **Secondary: Shakyamuni Buddha** | Required since Nov 4, 2021 teaching; standing or seated, ceramic, un-blessed preferred | All Dharma Gate practitioners must now worship both Guan Yin + Shakyamuni on altar |
| **Supporting Bodhisattvas** | Optional: Nam Kinh, Thái Tuế, Quan Đế, Châu Thương, Quan Bình (can be combined on one altar) | Secondary Bodhisattvas provide additional spiritual support |

**CRITICAL:** Do NOT delay setting up altar after inviting statues — delays show disrespect.

#### Inviting Bodhisattva Into Statue (Khai Quang / Blessing)

| Step | Action | Vietnamese | Notes |
|------|--------|-----------|-------|
| 1 | Request permission from practitioner's master or authorized lama | Xin phép Sư phụ hoặc các bậc cao tăng | Ideal: authorized master performs official blessing |
| 2 (alt) | Practitioner self-invokes if no authorized master available | Con tự thỉnh Bồ Tát an nhập vào bảo tượng | Prayer: "Cầu xin Quán Thế Âm Bồ Tát đại từ đại bi thỉnh [name of Buddha] an nhập vào bảo tượng mà con XXX đang thờ phụng" |
| 3 (alt) | Recite sacred name 108 times if self-invoking | Niệm 108 biến thánh hiệu "Nam Mô Thích Ca Mâu Ni Phật" (for Shakyamuni) or "Quán Thế Âm Bồ Tát" | 108 repetitions = complete spiritual transmission |

---

### Part C: Establishing the Altar (Lập Bàn Phật)

#### Spatial Placement Rules (Chi Tiết 13 Quy Tắc)

| Rule # | Requirement | Details | Consequence if Violated |
|--------|-----------|---------|------------------------|
| **1** | **Location: Bright & Clean** | Altar in relatively bright, clean, pure space (preferred) | Poor light/dirtiness = weak spiritual presence |
| **2** | **Backdrop: MUST touch wall** | Back of altar MUST rest against wall (NOT window glass) | Energy dissipates; no solid spiritual anchor |
| **3** | **Orientation: Ideal compass** | South-facing (altar sits South, faces North) OR North-facing (altar sits North, faces South) depending on hemisphere | Non-ideal orientation = reduced efficacy (but acceptable if space-limited) |
| **4** | **Away from toilet** | NEVER near or facing bathroom (bathroom door must always be closed) | Spiritual pollution; Bodhisattva's presence weakened by unclean energy |
| **5** | **Avoid external balcony** | NO balcony extending outside without foundation; OK if internal balcony | External exposure = unstable energy; spirits attracted to exposed spaces |
| **6** | **Avoid master bedroom** | NEVER in married couple's sleeping room (exception: elderly couple's room acceptable) | Intimate space energy interferes with Bodhisattva presence; inappropriate |
| **7** | **Away from kitchen** | NEVER directly facing kitchen | Cooking meat = blood/life-force pollution reaches altar |
| **8** | **No electronics below** | NOT on TV, refrigerator, or directly under air conditioner | Electronics emit yang/yin turbulence; electromagnetic fields interfere |
| **9** | **Bed head/foot clearance** | Bed foot NEVER faces altar directly; bed head NEVER rests against altar's back (no contact at all) | Physical proximity to sleeping body = disrespect to Bodhisattva |
| **10** | **Enclosed cabinet option (if space-limited)** | Can use cabinet with door/curtain (red preferred) above or covering altar; curtain drawn when NOT offering incense | If space extremely limited (bedroom/TV area), cabinet protects altar when not in use |
| **11** | **Single spatial level** | All Bodhisattva statues MUST be on same shelf/level (NOT scattered across different shelves/levels of bookcase/cabinet) | Split-level placement = fragmented spiritual presence; altar becomes discoordinated |
| **12** | **Backdrop decoration: East-facing painting** | Optional: hang yellow/gold Eastern landscape painting (東方台畫) behind altar to block negative qi | Painting acts as spiritual barrier against household interference |
| **13** | **Height & elevation** | Altar height should be medium (not too low, not too high); Bodhisattva eyes MUST be higher than practitioner's eyes when standing (practitioner looks slightly UP to statues). If too low, use refined box (NOT shoe box, NOT box with salt-fish smell history) to elevate statues. Can drape yellow cloth on altar table. | Too low = showing disrespect physically/spiritually; too high = inaccessible reverence |

**Additional placement constraints:**
- NO mirrors facing or beside altar (mirrors scatter spiritual energy)
- Daytime light must reach altar (window light or room light)
- Evening: dim light or deity lights on (NOT 24/7 bright; NOT dark)

#### Orientation & Arrangement (After 2021 Teaching)

**Standard Dharma Gate altar arrangement (left to right, from practitioner's viewpoint):**

```
┌─────────────────────────────────────────────────┐
│ ALTAR ARRANGEMENT (7 Bodhisattvas if full setup)│
├─────────────────────────────────────────────────┤
│                                                 │
│ Thái Tuế | Nam Kinh | Quán Thế Âm | Thích Ca  │
│  Bồ Tát  | Bồ Tát   | Bồ Tát      | Phật     │
│                    (CENTRAL PAIR)              │
│ | Quan Bình | Quan Đế | Châu Thương          │
│ | Bồ Tát    | Bồ Tát  | Bồ Tát               │
│                                                 │
│ Halo/backdrop should frame central pair        │
│ (Guan Yin on LEFT, Shakyamuni on RIGHT)       │
└─────────────────────────────────────────────────┘
```

**Key placement rules:**

| Position | Statue | Sizing Notes |
|----------|--------|--------------|
| **Center-left** | Guan Yin Bodhisattva | Primary; should be prominent or equal to Shakyamuni |
| **Center-right** | Shakyamuni Buddha (NEW since 2021) | Must NOT be smaller than secondary Bodhisattvas (Nam Kinh, etc.) |
| **Left-outer** | Thái Tuế Bodhisattva | If space limited, can omit |
| **Left-inner** | Nam Kinh Bodhisattva | Important secondary; often kept |
| **Right-inner** | Quan Bình Bodhisattva | If space limited, can omit |
| **Right-middle** | Quan Đế Bodhisattva | Often kept for household protection |
| **Right-outer** | Châu Thương Bodhisattva | If space limited, can omit |

**If space constraints exist:**
- Minimum: Guan Yin + Shakyamuni ONLY (both central, equal size)
- Acceptable: Guan Yin + Shakyamuni + 1–2 secondary Bodhisattvas
- Shakyamuni image can be 10–20% smaller IF clearly explained, but NOT significantly smaller than secondary figures
- Better to have smaller altar with proper arrangement than large altar with wrong proportions

#### Choosing an Auspicious Date & Time

| Factor | Rule | Example |
|--------|------|---------|
| **Lunar calendar** | Preferably lunar 1st/15th (full/new moon) OR Bodhisattva commemoration day | Lunar 2/19 (Guan Yin birthday), Lunar 4/8 (Shakyamuni birthday) |
| **Morning time** | Between 6 AM – 12 PM (noon) | Ascending yang energy; auspicious for inauguration |
| **Avoid night** | Never establish altar after sunset | Yin energy dominates; diminishes spiritual clarity |
| **Clean environment** | No funeral rites, medical emergencies, negative events that day | Ensure household harmony before inviting Bodhisattva |

---

### Part C.2: Ritual Objects & Offerings (Pháp Khí và Phẩm Cúng)

#### Incense Censer (Lư Hương)

| Rule # | Requirement | Details | Note |
|--------|-----------|---------|------|
| **1** | **Mandatory** | Altar MUST have incense censer; NO censer = NOT a Buddha altar | Critical; defines altar identity |
| **2** | **Material: Ceramic/Porcelain preferred** | Use ceramic or porcelain; AVOID metal (bronze/copper with dragons OK if engraved "Luck"/"Longevity" but plain preferable) | Metal can interfere with spiritual energy |
| **3** | **NO forbidden images** | Censer must NOT have dragon, animal, Buddha image, or scripture carved on it | Imagery can fragment spiritual focus |
| **4** | **One censer per Bodhisattva (ideal)** | Each primary Bodhisattva should have own censer; shows deep reverence | If space limited, secondary Bodhisattvas can share |
| **5** | **Initial filler** | New censer (no ash yet) can use uncooked rice until ash accumulates naturally | Replace with incense ash as practice continues |
| **6** | **Changing censer ritual** | When replacing old censer: if NO scripture on old censer → recite 7× Heart Sutra; if scripture present → recite 7-7-7 (Compassion, Heart Sutra, Repentance mantras). Wrap old censer in red cloth, bring to temple for proper disposal. | Respectful retirement of ritual object |

#### Incense (Nhang)

| Rule # | Requirement | Details | Note |
|--------|-----------|---------|------|
| **1** | **Best type** | Use smokeless, un-corded sandalwood incense (đàn hương không khói, không lõi) | Smoke-heavy or tower/stick incense discouraged |
| **2** | **Quantity per offering** | Can use 1 stick (simple) or 3 sticks (more reverent) | 3 sticks shows greater respect |
| **3** | **NO broken incense** | NEVER use cracked or broken incense sticks | Broken = incomplete offering energy |
| **4** | **Cutting method** | If incense too long, cut cleanly with scissors (do NOT hand-break) | Scissors = clean separation; hand-breaking = disrespect |
| **5** | **Packaging disposal** | Incense box with Bodhisattva image CANNOT be discarded casually; bring to temple for proper disposal | Packaging with sacred image requires reverent treatment |

#### Water Offering Cup (Ly Nước Cúng)

| Rule # | Requirement | Details | Note |
|--------|-----------|---------|------|
| **1** | **One per Bodhisattva** | Each Bodhisattva must have separate water cup | Shows individual reverence |
| **2** | **Material: Ceramic with lid preferred** | Use ceramic/porcelain cup with lid, no text, no images | Lid keeps water pure; plain = undistracted offering |
| **3** | **Water type** | Use potable/drinking water; hot or cold both acceptable | Any clean drinking water is suitable |
| **4** | **Daily replacement** | Change water EVERY day; do NOT mix water from different Bodhisattvas | Fresh water = fresh spiritual offering |
| **5** | **Serving protocol** | Do NOT drink directly from offering cup; pour into separate cup first. Do NOT mix water from multiple cups together. | Maintains sanctity of altar water |
| **6** | **Statue replacement** | If changing Bodhisattva statue, get new water cup | Old cup = old spiritual imprint |

#### Oil Lamp (Đèn Dầu)

| Rule # | Requirement | Details | Note |
|--------|-----------|---------|------|
| **1** | **Mandatory** | Altar MUST have oil lamp; critical ritual object | Lamp = light of wisdom/compassion |
| **2** | **Material: Clear glass or ceramic** | Use glass or ceramic lamp, NOT black, NO scripture images | Clarity lets light shine through |
| **3** | **Quantity** | Can use 1 or multiple lamps per number of Bodhisattvas | 1 lamp minimum; more = greater offering |
| **4** | **Placement** | Position lamp to right of practitioner (left side of Bodhisattva when facing altar) | Standard position for balance |
| **5** | **Oil type: Vegetable only** | Use plant-based oil (olive, corn, etc.); NEVER animal fat, sesame, soy oil | Animal fat = karmic pollution; soy oil too heavy |
| **6** | **Light timing** | Lamp lit when offering incense AND burning Little House; keep OFF when no incense/offerings | Don't burn continuously without ritual purpose |
| **7** | **Extinguishing method** | Cover or lower lamp wick to extinguish; NEVER blow out with mouth | Blowing = disrespect; covers/wick-lowering = reverent |
| **8** | **Refueling while lit** | Can add oil while lamp is burning | Safe if done carefully |
| **9** | **Lotus bud sign** | If lamp wick forms lotus flower bud shape = auspicious sign of spiritual response (感應) | Indicates Bodhisattva presence |
| **10** | **Empty lamp rule** | NEVER leave lamp burning without incense/ritual activity | Burning lamp = calling Bodhisattva; purposeless burning = wasteful |

#### Fruit Offerings (Trái Cây Cúng)

| Rule # | Requirement | Details | Note |
|--------|-----------|---------|------|
| **1** | **Optional but encouraged** | Fruit offerings are not mandatory but show care and reverence | Fresh fruit = aliveness |
| **2** | **Fruit selection** | Choose fragrant, fresh fruits; prefer fruits that last (oranges, apples, pomegranates) | Avoid banana, peach (quick decay); foods easily spoiled |
| **3** | **Commitment rule** | Once purchased as offering, must offer fully; do NOT eat before placing on altar | Partial offering = incomplete sacrifice |
| **4** | **Plate requirement** | Place on separate, new plate (no scripture images) | Dedicated plate shows reverence |
| **5** | **Quantity arrangement** | Can stack tiers but each tier must be ODD number (1, 3, 5, etc.) | Odd numbers = auspicious |
| **6** | **One fruit type per plate** | Each plate has ONE fruit variety only | Mixing = energy diffusion |
| **7** | **Plate must not be empty** | Never place empty plate on altar | Empty plate = spiritual gap |
| **8** | **Fruit preparation** | Wash fruit clean, dry with cloth, remove stickers/labels | Pure presentation |
| **9** | **Replacement protocol** | When removing to eat, ask permission and replace with fresh fruit immediately | Shows continuity of offering |

#### Flower Offerings (Hoa Cúng)

| Rule # | Requirement | Details | Note |
|--------|-----------|---------|------|
| **1** | **Optional** | Flower offerings not mandatory but add beauty and purity | Fresh flowers = living offering |
| **2** | **Vase: Ceramic preferred** | Use ceramic/porcelain vase, plain (no text, no images) | Clean vessel |
| **3** | **Suitable flowers** | Lotus, orchid, jasmine preferred; suitable flowers without thorns or unclean symbolism | Avoid thorn-bearing or spiritually unsuitable flowers |
| **4** | **Stem count** | Even number if 2 vases; can be odd number per vase if single vase | Balance in arrangement |
| **5** | **Mixed varieties** | Can combine multiple flower types in one vase | Diversity = richness |
| **6** | **Replacement timing** | Change flowers only BEFORE incense/lamp lit | Ritual purity during worship |

---

### Part C.3: Inviting Bodhisattva Into Statue (Thỉnh Bồ Tát An Nhập)

#### Preparation for Invocation

| Step | Requirement | Details |
|------|------------|---------|
| **Choose auspicious date/time** | Lunar 1st, 15th, or auspicious day | 8 AM, 10 AM, or 4 PM preferred |
| **Prepare altar** | Complete setup: water, fruit, oil, incense ready | Everything in place before invocation |
| **Clean environment** | No negative events that day; household in harmony | Negative energy blocks Bodhisattva entry |

#### Invocation Procedure (Standard Protocol)

```
1. PRAYER (Chắp tay khấn):
   "Cầu xin Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm
    Quán Thế Âm Bồ Tát hiển linh, an nhập vào bảo tượng con XXX cung phụng."

2. STATE INTENTION:
   (Optional: share aspiration, request blessing, vow practice commitment)

3. LIGHT 3 INCENSE STICKS
   (Keep burning continuously during entire ritual)

4. RECITE MANTRAS (keep incense burning throughout):
   • Compassion Mantra: 7 repetitions
   • Heart Sutra: 7 repetitions
   • Repentance Mantra: 3 repetitions

5. PROSTRATE: 3 full bows

6. WAIT for incense to burn completely
   (Incense = communication channel; when burned, transmission complete)

NOTE: More recitations = stronger transmission. Can extend mantra count as desired.
```

#### Shakyamuni Buddha Invocation (Post-2021)

```
For Shakyamuni Buddha:

1. PRAYER:
   "Cầu xin Quán Thế Âm Bồ Tát đại từ đại bi thỉnh Nam Mô Thích Ca Mâu Ni
    Phật an nhập vào bảo tượng con XXX cung phụng."

2. RECITE sacred name 108 times:
   "Nam Mô Thích Ca Mâu Ni Phật"

3. KEEP INCENSE BURNING throughout entire 108-repetition count

4. Upon completion: 3 full prostrations + gratitude prayer
```

---

### Part C.4: Inviting Supporting Bodhisattvas (Hộ Pháp Bồ Tát)

If inviting additional Bodhisattvas (Thái Tuế, Nam Kinh, Quan Đế, Quan Bình, Châu Thương):

#### Arrangement Position

| Position | Bodhisattva | Notes |
|----------|-------------|-------|
| **Center** | Guan Yin (left), Shakyamuni (right) | Primary pair |
| **Far left** | Thái Tuế Bodhisattva | Protector of children |
| **Left-inner** | Nam Kinh Bodhisattva | Guides for health/career |
| **Right-inner** | Quan Bình Bodhisattva | Lesser deity |
| **Right-middle** | Quan Đế Bodhisattva | Protector, loyalty energy |
| **Right-outer** | Châu Thương Bodhisattva | Lesser deity |

#### Invocation Sequence (Maintain continuous incense throughout)

```
1. Light incense; keep burning continuously for entire ritual

2. FOR EACH BODHISATTVA, recite prayer:
   "Cung thỉnh Quán Thế Âm Bồ Tát đại từ đại bi thỉnh [Bodhisattva Name]
    Bồ Tát an nhập vào bảo tượng con XXX thờ phụng"

3. RECITE specific mantra 108 times for each Bodhisattva:
   • Thái Tuế Bodhisattva → 108× "Prosperity & Luck Mantra" (大吉祥天女咒)
   • Nam Kinh Bodhisattva → 108× sacred name
   • Quan Đế Bodhisattva → 108× sacred name + 21× Pure Land Mantra (往生咒)
   • Quan Bình, Châu Thương → 108× sacred names each

4. WAIT for incense to burn down completely

5. Prostrate 3 times; offer gratitude prayer
```

#### Thái Tuế Bodhisattva Special Note

```
If Thái Tuế statue has image/carving:
→ Must replace image annually during Lunar New Year
  (Symbolic renewal of protective energy for coming year)
```

---

### Part D: Daily Worship Practices (Hàng Ngày)

#### Morning & Evening Incense

| Time | Requirement | Details |
|------|-------------|---------|
| **Morning (Sáng)** | Incense MUST be offered | Ideal: 6–8 AM; latest by 10 AM |
| **Evening (Tối)** | Incense SHOULD be offered | Ideal: 5–7 PM; if impossible, mental incense (tâm hương) is acceptable if away |
| **If traveling/away** | Mental incense 2x daily | Morning once, evening once; recite: "Tâm hương [practitioner name] đưa lên Bồ Tát" |
| **Minimum** | At least morning incense guaranteed | If evening not possible, morning alone is acceptable |
| **Water offering** | Change daily (morning or evening) | Must be pure, clean water; no dirt, insects, or contamination |
| **Evening light management** | Draw curtains/close windows after dusk | Prevents low-level spirits from entering household through open space |

#### Incense Offering Methods

##### Standard Sandalwood Incense (Đàn Hương)

```
1. Light ONE large sandalwood stick
2. Wave/fan to blow out flame (NOT mouth — absolute prohibition)
3. Incense smoke 3 times in front of Shakyamuni Buddha's censer
4. Incense smoke 3 times in front of Guan Yin Bodhisattva's censer
5. Tap incense stick gently to align with Shakyamuni's censer opening
6. Insert vertically into Shakyamuni's censer
7. (If incense reusable, do not fully insert; keep for next offering)
```

**Rules:**
- Each Buddha/Bodhisattva with separate censer gets own incense stick (Shakyamuni + Guan Yin = 2 sticks if separate censers)
- If shared censer (rare): 1 incense stick sufficient
- NEVER blow with mouth; use hand-fanning only
- Incense should smoke gently, not roar or create excessive ash

##### Block-Form Incense (Thỏi Đàn Hương Nén)

For pressed incense blocks that self-combust continuously:

```
1. Light one block
2. Let it burn in front of Shakyamuni's censer until fully ignited
3. Insert into Shakyamuin's censer (will burn continuously)
4. Light second block for Guan Yin's censer
5. Insert into Guan Yin's censer
(No need to wave/blow — self-ignites)
```

#### Candle & Oil Lamp Allocation

| Deity | Incense Censer | Oil Lamps | Candles | Water Cup |
|-------|---|---|---|---|
| **Shakyamuni Buddha (added 2021)** | 1 (own) | 1 (own) | Optional | 1 (own) |
| **Guan Yin Bodhisattva** | 1 (own) | 1 (own) | Optional | 1 (own) |
| **Nam Kinh Bodhisattva** | Shared or own | Shared | Optional | Optional |
| **Secondary Bodhisattvas** (if present) | Shared | Shared | Optional | Optional |

**Critical rules:**
- Shakyamuni + Guan Yin must NEVER share same censer (violates protocol)
- If altar previously had 6 censers + 6 lamps, ADD 1 censer + 1 lamp for Shakyamuni
- If altar had only 1 large censer + 2 lamps, can keep without expansion (acceptable compromise)
- Water cups must be clean, pure water; change daily
- Candles should be lit ONLY when incense/oil lamps are burning; NOT 24/7

#### Maintenance & Cleanliness

| Rule | Requirement | Consequence |
|------|-------------|------------|
| **No touching statues** | Do NOT touch Bodhisattva statues frequently | Touching = disrespect; can diminish presence |
| **Dust cleaning (if needed)** | Use NEW cloth, damp with pure water, gently wipe ONCE per year max | During wiping: recite Heart Sutra (Tâm Kinh) |
| **Repositioning statue** | If must move: offer incense first, explain to Bodhisattva, recite 3× Compassion Mantra + 3× Heart Sutra, wait for incense to burn down, then move | Moving without ritual = theft of Bodhisattva's position |
| **No secular items on altar** | Remove: books, lighters, matches, talismans, incense boxes, candy, snacks, salt fish | Secular items defile pure space |
| **Only Buddhist objects** | Allowed on altar: statues, images, incense, oil lamps, water cups, fruit offerings (very simple) | No mixing with other religions (Daoism, Christianity, etc.) — must have separate altar |
| **Area below altar** | Can store Buddhist texts and ritual items (scriptures, prayer beads, flags) | NO trash, toiletries, food, medications |
| **Night lighting** | Area around altar should have ambient light (not pitch darkness, not overly bright) | Light shows reverence; darkness shows neglect |

---

### Part E: Shakyamuni Buddha Addition Protocol (2021 Teaching Update)

**Official Teaching (November 4, 2021):**
> "From now onward, Dharma Gate Buddha altars MUST worship Shakyamuni Buddha together with Guan Yin Bodhisattva."

#### Transition for Existing Altars

| Altar Status | Action | Timeline |
|---|---|---|
| **New altar setup** | Include both Guan Yin + Shakyamuni from start | When establishing altar |
| **Existing altar (Guan Yin only)** | Invite Shakyamuni Buddha and add to center-right position | As soon as condition allows; can coordinate with lunar auspicious date |
| **Cannot expand immediately** | Keep Guan Yin; add Shakyamuni image smaller (but NOT smaller than Nam Kinh/secondary Bodhisattvas) | Temporary solution; expand when possible |
| **Absolutely no space** | Guan Yin alone is acceptable temporarily, but should plan expansion | NOT ideal; explain to practitioner importance of dual worship |

#### How to Invite Shakyamuni Buddha

**Prayer for inviting Shakyamuni:**
```
"Cầu xin Quán Thế Âm Bồ Tát đại từ đại bi thỉnh Nam Mô Thích Ca Mâu Ni Phật
an nhập vào bảo tượng mà con XXX đang thờ phụng."

[Then recite Shakyamuni's sacred name 108 times:]
"Nam Mô Thích Ca Mâu Ni Phật"
```

#### Order of Inviting Bodhisattvas (When Establishing Full Altar)

Sequential order (most important to least):

```
1. Shakyamuni Buddha (Thích Ca Mâu Ni Phật)
2. Guan Yin Bodhisattva (Quán Thế Âm Bồ Tát)
3. Nam Kinh Bodhisattva (Nam Kinh Bồ Tát)
4. Thái Tuế Bodhisattva (Thái Tuế Bồ Tát)
5. Quan Đế Bodhisattva (Quan Đế Bồ Tát)
6. Châu Thương Bodhisattva (Châu Thương Bồ Tát)
7. Quan Bình Bodhisattva (Quan Bình Bồ Tát)
```

---

### Part F: Prostration & Gratitude Rituals

#### Number of Prostrations (Số Lạy)

| Bodhisattva | Prostrations | Timing |
|---|---|---|
| **Shakyamuni Buddha** | 3 bows (ba lạy) | Daily morning incense |
| **Guan Yin Bodhisattva** | 3 bows (ba lạy) | Daily morning incense |
| **Each secondary Bodhisattva** (if present) | 3 bows each | Optional; can combine if time limited |

**Prostration form:**
- Kneel facing altar
- Bow 3 times (forehead touches floor or ground)
- Rise and step back

#### Gratitude Prayer Sequence (Cảm Ân)

**When offering daily incense:**

```
1. "Cảm ân Nam Mô Thích Ca Mâu Ni Phật"

2. "Cảm ân Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát"

3. "Cảm ân Nam Kinh Bồ Tát"

4. "Cảm ân Thái Tuế Bồ Tát"

5. "Cảm ân Quan Đế Bồ Tát"

6. "Cảm ân Châu Thương Bồ Tát"

7. "Cảm ân Quan Bình Bồ Tát"
```

(Skip any Bodhisattva not present on altar)

**When traveling / away from altar:**
- Mental gratitude (tâm cảm ân) is acceptable
- "Sáng: Tâm cảm ân Nam Mô Thích Ca Mâu Ni Phật và Quán Thế Âm Bồ Tát"
- Same mental gratitude in evening

---

## Input Contract (TypeScript DTOs)

```typescript
interface BuddhaAltarSetupDto {
  practitionerId: string;
  altarId: string;

  // Setup phase
  setupDate: Date;                  // lunar auspicious date chosen
  statuesInvited: {
    primaryBodhisattva: 'guan_yin';  // always Guan Yin
    shakyamuniBuddha: boolean;       // true if added (required post-2021)
    secondaryBodhisattvas: string[]; // ['nam_kinh', 'tai_tui', 'quan_de', 'chau_thuong', 'quan_binh']
  };

  // Physical placement
  altarLocation: string;             // "living room", "bedroom", "home shrine room"
  elevationMethod: 'table' | 'shelf' | 'cabinet' | 'stand'; // never floor
  lightingAvailable: boolean;        // daytime + evening visibility
  mirrorNearby: boolean;            // should be false

  // Incense/offering setup
  censersCount: number;              // must match number of primary deities
  oilLampsCount: number;            // should equal censers count
  waterCupsCount: number;           // 1 per primary deity minimum

  // Blessing status
  masterBlessedStatues: boolean;    // true if officially blessed; false if self-blessed
  shakyamuniInvocationCompleted: boolean; // true after Shakyamuni 108-name recitation
}

interface DailyWorshipLogDto {
  altarId: string;
  date: Date;

  // Morning ritual
  morningIncenseOffered: boolean;
  morningTime: string?;              // HH:MM format
  morningWaterChanged: boolean;
  morningProstrations: number;       // should be ≥6 (3 for Shakyamuni + 3 for Guan Yin)

  // Evening ritual
  eveningIncenseOffered: boolean;
  eveningTime: string?;
  eveningWaterChanged: boolean;
  eveningProstrations?: number;

  // Health checks
  allCensersHaveIncense: boolean;
  oilLampsLit: boolean;
  altarAreaClean: boolean;
  noSecularItemsOnAltar: boolean;

  // Notes
  issues?: string[];                 // e.g., "oil lamp ran out", "water cup dirty"
}

interface AltarMaintenanceDto {
  altarId: string;
  lastCleaned: Date;

  // Routine maintenance
  dustLevel: 'clean' | 'light_dust' | 'heavy_dust';
  waterCondition: 'pure' | 'cloudy' | 'contaminated';
  incenseStockLevel: 'full' | 'low' | 'empty';
  oilLampFuel: 'full' | 'low' | 'needs_refill';

  // Physical checks
  statuteIntegrity: 'intact' | 'needs_repair' | 'broken';
  censersCondition: 'good' | 'damaged' | 'needs_replacement';

  // Compliance
  noSecularItems: boolean;
  properElevation: boolean;
  lightingAdequate: boolean;

  // Needed actions
  actionRequired: string[];          // e.g., "change water", "refill lamp oil"
}
```

## Write Path (Pseudocode API)

### 1. Validate Altar Location & Setup

```
POST /api/altar-management/buddha-altar/validate-setup

1. Extract altarLocation, elevationMethod, lightingAvailable, mirrorNearby
2. Validate physical placement:
   - IF elevationMethod = 'floor':
     → BLOCK: "Bàn Phật phải đặt trên bàn/kệ/tủ, không được để trên sàn"
   - IF mirrorNearby = true:
     → WARNING: "Gương phía trước bàn Phật làm yếu đi ý lực của Bồ Tát"
   - IF lightingAvailable = false:
     → WARNING: "Cần ánh sáng ban ngày chiếu tới bàn Phật"

3. Check for auspicious date:
   - Preferably lunar 1st/15th or Bodhisattva commemoration day
   - Morning time (6 AM–12 PM)

4. RETURN setup validation with warnings/blocks
```

### 2. Invite Bodhisattvas (Khai Quang)

```
POST /api/altar-management/buddha-altar/invoke-bodhisattva

Input:
  - statueType: 'guan_yin' | 'shakyamuni' | etc.
  - invocationMethod: 'master_blessed' | 'self_invoke'
  - practitionerId: string

1. IF invocationMethod = 'self_invoke':
   → Generate prayer template:
      "Cầu xin Quán Thế Âm Bồ Tát đại từ đại bi thỉnh [statue name] an nhập vào bảo tượng"

2. IF statueType = 'shakyamuni':
   → Require 108 recitations of "Nam Mô Thích Ca Mâu Ni Phật"
   → Track completion count

3. Mark statue as "invoked" in database
4. Log invocation timestamp
5. RETURN confirmation + next step (establish altar on auspicious date)
```

### 3. Log Daily Worship

```
POST /api/altar-management/buddha-altar/:altarId/daily-worship

Input: DailyWorshipLogDto

1. Validate required daily practices:
   - IF morningIncenseOffered = false:
     → WARNING: "Phải dâng hương sáng hàng ngày"
   - IF morningWaterChanged = false:
     → REMINDER: "Nước cúng phải thay mỗi ngày"

2. Calculate prostration count:
   - Expected minimum: 3 (Shakyamuni) + 3 (Guan Yin) = 6 total
   - IF morningProstrations < 6:
     → LOG as "reduced" but not blocked

3. Check altar cleanliness:
   - IF noSecularItemsOnAltar = false:
     → FLAG: "Vật cấm trên bàn Phật: [list items]"

4. Track streak (consecutive days of morning incense offered)
5. RETURN daily log + encouragement/reminders
```

### 4. Altar Maintenance Scheduler

```
PATCH /api/altar-management/buddha-altar/:altarId/maintenance-check

1. Check last cleaned date
   - IF > 1 year: WARNING about dust buildup
   - IF cleaning needed: RECOMMEND gentle wiping with new cloth + Heart Sutra recitation

2. Monitor consumables:
   - incenseStockLevel < 'low' → alert to replenish
   - oilLampFuel = 'needs_refill' → notify
   - waterCondition != 'pure' → immediate replacement

3. Validate altar integrity:
   - IF statuteIntegrity != 'intact' → escalate to repair protocol
   - IF censersCondition != 'good' → flag for replacement

4. Track next maintenance window (annual gentle cleaning acceptable)
5. RETURN action list + timeline
```

### 5. Traveling Away from Altar

```
POST /api/altar-management/buddha-altar/traveling-mode

Input:
  - duration: 'short' (1–3 days) | 'medium' (4–7 days) | 'long' (>1 week)
  - returnDate: Date

1. IF duration = 'short':
   → ALLOW: "Niệm tâm hương sáng và tối"
   → Remind: morning + evening mental incense minimum

2. IF duration = 'long':
   → RECOMMEND: Invite local practitioner to offer incense at home altar
   → Or: automated reminder for mental incense 2x daily

3. Track absence period; notify practitioner of return date
4. Upon return: PROMPT for altar health check + fresh water offering
5. RETURN traveling guidance + reminders
```

---

## FE Behavior (ASCII Wireframe)

### ALTAR SETUP CHECKLIST

```
┌────────────────────────────────────────────┐
│ KIỂM TRA AN TRỊ BÀN PHẬT                  │
├────────────────────────────────────────────┤
│                                            │
│ 1. Chọn ngày lành                         │
│    ○ Âm lịch 1/15 (hỏi kiếp)              │
│    ○ Ngày kỉ niệm Bồ Tát (2/19, 4/8,...)│
│    ○ Thời gian: 6–12 sáng ✓               │
│                                            │
│ 2. Chuẩn bị tượng Bồ Tát                  │
│    ✅ Quán Thế Âm Bồ Tát (đứng, cầm      │
│       tịnh bình)                          │
│    ✅ Thích Ca Mâu Ni Phật (từ 2021)     │
│    ⬜ Tượng thứ cấp (Nam Kinh, v.v.)      │
│                                            │
│ 3. Xác nhận vị trí bàn Phật               │
│    ✅ Đặt trên bàn/kệ/tủ (không sàn)    │
│    ✅ Có ánh sáng ban ngày                 │
│    ⚠️  Có gương đối diện? [Không ✓]      │
│                                            │
│ [Bắt Đầu Thỉnh Bồ Tát]  [Chi Tiết]       │
│                                            │
└────────────────────────────────────────────┘
```

### DAILY WORSHIP TRACKER

```
┌────────────────────────────────────────────┐
│ HÀNG NGÀY — THỜ PHỤNG BÀN PHẬT             │
├────────────────────────────────────────────┤
│                                            │
│ Hôm nay: Thứ 3, 5/3/2026                 │
│                                            │
│ ✅ Dâng hương sáng (7:30 AM)              │
│ ✅ Thay nước (sáng 8:00 AM)               │
│ ✅ Lạy Bồ Tát (3 + 3 = 6 lạy)             │
│                                            │
│ ⬜ Dâng hương tối (chưa)                   │
│ ⬜ Thay nước tối (chưa)                    │
│                                            │
│ Chuỗi liên tục: 47 ngày ✓                  │
│                                            │
│ [Ghi Nhận Thêm]  [Xem Chi Tiết]           │
│                                            │
│ ℹ️  Tối nay hãy nhớ dâng hương lúc 6 PM   │
│                                            │
└────────────────────────────────────────────┘
```

### MOVING/TEMPORARILY RELOCATING ALTAR

```
┌────────────────────────────────────────────┐
│ DI CHUYỂN BÀN PHẬT — HƯỚNG DẪN             │
├────────────────────────────────────────────┤
│                                            │
│ Bước 1: Dâng hương xin phép                │
│ "Xin Quán Thế Âm Bồ Tát cho phép con      │
│  di chuyển bàn Phật đến vị trí mới"       │
│                                            │
│ Bước 2: Niệm kinh                         │
│ • Chú Đại Bi: 3 biến                     │
│ • Tâm Kinh: 3 biến                       │
│                                            │
│ Bước 3: Đợi nhang tàn                     │
│ Nhang cần cháy hết trước khi di chuyển    │
│                                            │
│ Bước 4: Di chuyển nhẹ nhàng                │
│ Không va chạm; giữ tượng Bồ Tát thẳng    │
│                                            │
│ [Bắt Đầu]  [Tôi Đã Xong]                  │
│                                            │
└────────────────────────────────────────────┘
```

---

## Schema Notes (Prisma Snippet)

```prisma
model BuddhaAltar {
  id                    String   @id @default(cuid())
  practitionerId        String

  // Setup metadata
  setupDate             DateTime
  setupAuspiciousDay    String?  // lunar date or commemoration
  setupCompleted        Boolean @default(false)

  // Physical placement
  location              String   // "living room", "bedroom", "shrine room"
  elevationMethod       String   // "table", "shelf", "cabinet", "stand"
  lightingAvailable     Boolean
  mirrorNearby          Boolean @default(false)

  // Bodhisattvas present
  hasGuanYin            Boolean @default(true)
  hasShakyamunibuddha   Boolean @default(false)  // should be true post-2021
  secondaryBodhisattvas String[] @default([])     // ["nam_kinh", "tai_tui", ...]

  // Ritual objects
  censersCount          Int @default(1)
  oilLampsCount         Int @default(1)
  waterCupsCount        Int @default(1)

  // Blessing & invocation
  masterBlessedStatues  Boolean @default(false)
  selfInvocationCompleted Boolean @default(false)
  shakyamuniInvoked     Boolean @default(false)

  // Daily worship tracking
  consecutiveDaysOffered Int @default(0)         // streak counter
  lastMorningIncense    DateTime?
  lastEveningIncense    DateTime?
  lastWaterChange       DateTime?

  // Maintenance
  lastCleaned           DateTime?
  lastMaintenanceCheck  DateTime?

  // Status
  status                String @default("SETUP_PENDING")
                        // SETUP_PENDING → ACTIVE → TRAVELING → ACTIVE

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  practitioner          Practitioner @relation(fields: [practitionerId], references: [id])
  dailyLogs             AltarDailyLog[]
  maintenanceLogs       AltarMaintenanceLog[]

  @@index([practitionerId])
  @@index([status])
}

model AltarDailyLog {
  id                    String   @id @default(cuid())
  altarId               String
  altar                 BuddhaAltar @relation(fields: [altarId], references: [id])

  logDate               DateTime

  // Morning
  morningIncenseOffered Boolean @default(false)
  morningIncenseTime    String?  // HH:MM
  morningWaterChanged   Boolean @default(false)
  morningProstrations   Int @default(0)

  // Evening
  eveningIncenseOffered Boolean @default(false)
  eveningIncenseTime    String?
  eveningWaterChanged   Boolean @default(false)
  eveningProstrations   Int @default(0)

  // Health
  censersIntact         Boolean @default(true)
  oilLampsLit           Boolean @default(false)
  altarClean            Boolean @default(true)
  noSecularItems        Boolean @default(true)

  // Issues
  issues                String[]
  notes                 String?

  createdAt             DateTime @default(now())

  @@index([altarId])
  @@index([logDate])
}

model AltarMaintenanceLog {
  id                    String   @id @default(cuid())
  altarId               String
  altar                 BuddhaAltar @relation(fields: [altarId], references: [id])

  maintenanceDate       DateTime
  maintenanceType       String   // "dust_clean", "water_refill", "incense_refill", "oil_refill"

  dustLevel             String   // "clean", "light_dust", "heavy_dust"
  waterCondition        String   // "pure", "cloudy", "contaminated"
  incenseStock          String   // "full", "low", "empty"
  oilFuel               String   // "full", "low", "needs_refill"

  statuteIntegrity      String   // "intact", "needs_repair", "broken"
  censersCondition      String   // "good", "damaged"

  actionsPerformed      String[]
  actionsNeeded         String[]

  createdAt             DateTime @default(now())

  @@index([altarId])
  @@index([maintenanceDate])
}

model AltarBodhisattva {
  id                    String   @id @default(cuid())
  altarId               String

  deity                 String   // "guan_yin", "shakyamuni", "nam_kinh", etc.
  invocationDate        DateTime?
  invocationMethod      String?  // "master_blessed", "self_invoke"
  invocationCompleted   Boolean @default(false)

  censerId              String?  // link to censer if separate
  oilLampId             String?
  waterCupId            String?

  // Position on altar
  positionIndex         Int      // 0=far left, 1=left, 2=center-left, 3=center-right, etc.
  sizeRatio             Float @default(1.0) // relative to primary Bodhisattva

  createdAt             DateTime @default(now())

  @@index([altarId])
}
```

---

## Audit

All altar setup and daily worship activities logged:

| Action | Code | Trigger |
|--------|------|---------|
| Altar location validated | `altar.location_approved` | Setup phase |
| Bodhisattva invoked | `altar.bodhisattva_invoked` | Khai quang ceremony |
| Shakyamuni Buddha added (2021 teaching) | `altar.shakyamuni_added` | New altar or altar upgrade |
| Morning incense offered | `altar.morning_incense_offered` | Daily morning ritual |
| Evening incense offered | `altar.evening_incense_offered` | Daily evening ritual |
| Water changed | `altar.water_changed` | Daily maintenance |
| Altar cleaned | `altar.maintenance_cleaning` | Annual or as-needed |
| Altar relocating (temporary) | `altar.relocation_mode_on` | Traveling or emergency |
| Altar health check failed | `altar.health_warning` | Maintenance issue detected |
| Streak broken | `altar.streak_broken` | Missed morning incense |
| Streak milestone reached | `altar.streak_milestone` | 7/30/100 consecutive days |

```sql
INSERT INTO audit_log (action, altar_id, details, created_at)
VALUES ('altar.morning_incense_offered', $1, $2, NOW())
```

---

## Errors

| Code | HTTP | Message VI | Message EN |
|------|------|-----------|-----------|
| `altar_elevation_invalid` | 400 | Bàn Phật phải đặt trên bàn/kệ/tủ, không được để trên sàn | Altar must be elevated on table/shelf/cabinet |
| `bodhisattva_not_invoked` | 400 | Chưa thỉnh Bồ Tát an nhập vào tượng | Bodhisattva not invoked into statue yet |
| `shakyamuni_not_added_post_2021` | 400 | Từ 2021, bàn Phật phải thờ cả Thích Ca Mâu Ni | Shakyamuni Buddha required since 2021 |
| `shakyamuni_too_small` | 400 | Tượng Thích Ca không được nhỏ hơn các Bồ Tát khác | Shakyamuni statue too small relative to others |
| `shared_censer_violation` | 422 | Quán Thế Âm và Thích Ca không được dùng chung lư hương | Guan Yin + Shakyamuni require separate censers |
| `secular_items_on_altar` | 422 | Không được để vật cấm trên bàn Phật: [list] | Forbidden items on altar |
| `morning_incense_missed` | 422 | Chưa dâng hương sáng hôm nay | Morning incense not offered |
| `water_contaminated` | 422 | Nước cúng không sạch sẽ — thay ngay | Altar water contaminated; change immediately |

---

## Notes for AI/Codegen

1. **Altar Setup Validation**:
   - Parse `elevationMethod` → must be one of: table, shelf, cabinet, stand (block floor)
   - Check `mirrorNearby` → warn if true
   - Check `lightingAvailable` → warn if false
   - Validate auspicious date (lunar 1st/15th OR Bodhisattva commemoration day)

2. **Bodhisattva Invocation Tracking**:
   - When `invocationMethod = self_invoke`, require 108 recitations of sacred name
   - For Shakyamuni: track "Nam Mô Thích Ca Mâu Ni Phật" count until 108
   - Mark `invocationCompleted = true` only after 108 count reached

3. **Daily Worship Streak**:
   - Query `lastMorningIncense` date
   - IF date ≠ today → streak broken; reset counter
   - IF date = today AND date > yesterday → increment counter
   - Display streak on dashboard (7-day/30-day/100-day milestones)

4. **Censers & Lighting Logic**:
   - For post-2021 altars: Shakyamuni + Guan Yin = SEPARATE censers (enforce in schema)
   - Secondary Bodhisattvas can share censers with primary if space limited
   - Oil lamps: 1 per primary deity minimum (Shakyamuni + Guan Yin = 2 lamps if possible)
   - If altar expanded from old setup (Guan Yin only): detect and recommend adding Shakyamuni

5. **Traveling Mode**:
   - When `status = TRAVELING`, remind practitioner of mental incense 2x daily
   - Lock daily worship log (no morning incense required, mental incense sufficient)
   - Upon return (status → ACTIVE): prompt for water change + altar health check

6. **Maintenance Scheduling**:
   - `lastCleaned` > 1 year → warn about dust
   - Gentle wiping acceptable once/year (use new cloth + Heart Sutra)
   - Check water cups daily (visual inspection in app or manual log)
   - Track incense/oil stock; auto-alert when low

7. **Shakyamuni Buddha Addition (Post-2021)**:
   - Auto-detect altar setup date
   - IF setup before Nov 4, 2021 AND no Shakyamuni yet → display educational message + prompt to add
   - Allow flexible timeline (practitioner can add when ready)
   - Track completion of Shakyamuni invocation separately from Guan Yin

---

## Related

- `altar-management/USE_CASES/incense-offering-ritual-procedure.md` — Detailed ritual steps for daily incense offering
- `altar-management/USE_CASES/self-blessing-activation-sequence.md` — Self-invocation protocol if no master available
- `altar-management/USE_CASES/statue-blessing-scheduler.md` — Scheduling official khai quang ceremony
- `altar-management/USE_CASES/statue-hygiene-mantra-protocol.md` — Gentle cleaning procedures with Heart Sutra
- `altar-management/USE_CASES/multi-deity-oil-lamp-allocation.md` — Oil lamp distribution for multiple deities
- `altar-management/USE_CASES/internal-relocation-lock.md` — Protocol for moving altar within home
- `wisdom-qa/USE_CASES/daily-recitation-system.md` — Daily foundation mantra practice (supports altar worship)
- `engagement/USE_CASES/little-house-burning-ritual-procedure.md` — Little House burning (typically done before altar)

---

## Xin Quán Thế Âm Bồ Tát từ bi, nếu trong quá trình con dịch và chia sẻ, có chỗ nào không đúng lý, không đúng pháp, xin Quán Thế Âm Bồ Tát, Chư vị Thần Hộ Pháp có thể tha thứ cho con.
