# BRD Research Index

> **Owner:** `design/05-references/brd-research/INDEX.md`
> **Cập nhật:** 2026-04-04
> **Governance:** [FOLDER_CANON.md](../../00-governance/FOLDER_CANON.md) — BRD Research Files section

File này là index pointer cho tất cả BRD (Business Requirements Document) research files.
BRD files là **input snapshot** — không phải canonical owner.
Logic từ BRDs phải được phân phối vào `design/03-domains/<domain>/USE_CASES/` mới có giá trị implementation.

---

## BRD Files (hiện tại ở design/ root — legacy location)

| File | Phase | Nội dung chính | Distribution status |
|---|---|---|---|
| [BRD_PHASE_20_GOLDEN_PRACTICES.md](../../BRD_PHASE_20_GOLDEN_PRACTICES.md) | Phase 20 | Golden practices: yin-time guard, location-bound vow, recitation economy, merit transfer engine, karma debt tracking | ✅ Distributed — xem `design/03-domains/*/USE_CASES/` |
| [BRD_PHASE_21_DHARMA_PROTECTOR_ENGINE.md](../../BRD_PHASE_21_DHARMA_PROTECTOR_ENGINE.md) | Phase 21 | Dharma protector engine: Thái Tuế, Calamity year, print calibration, merit fraction engine | ✅ Distributed |
| [BRD_PHASE_22_BEHAVIORAL_GUARDS_AND_IMMUTABILITY.md](../../BRD_PHASE_22_BEHAVIORAL_GUARDS_AND_IMMUTABILITY.md) | Phase 22 | Behavioral guards: offline sync spoofing, commitment gates, karma balance cascade, anti-skimming, depth tracker | ✅ Distributed |
| [BRD_PHASE_23_SPATIAL_GUARDS_AND_ENVIRONMENTAL_SENSING.md](../../BRD_PHASE_23_SPATIAL_GUARDS_AND_ENVIRONMENTAL_SENSING.md) | Phase 23 | Spatial environment guards: posture enforcement, no-water-staring, no-altar prerequisite, burn sanitization | ✅ Distributed |
| [BRD_PHASE_24_PHYSICAL_DIGITAL_INTEGRITY_AND_KARMA_PRECISION.md](../../BRD_PHASE_24_PHYSICAL_DIGITAL_INTEGRITY_AND_KARMA_PRECISION.md) | Phase 24 | Physical-digital integrity: face-down detection, pause mantra seal, bodhisattva invocation, casualty debt, form disposal polarity | ✅ Distributed |

---

## Distribution Map — Phase 20

| BRD Logic | Domain | USE_CASE file |
|---|---|---|
| Yin-Time Offline Sync Guard | `engagement` | `yin-time-offline-guard.md` |
| Location-Bound Vow | `vows-merit` | `location-bound-vow.md` |
| Recitation Economy Segregation | `engagement` | `recitation-economy-segregation.md` |
| Merit Transfer Engine | `content` | `bhff-quota-transfer-engine.md` |
| Karma Debt / Immutable Ledger | `engagement` | `karma-debt-ledger.md` |
| Sutra Physical Z-Index | `content` | `sutra-physical-z-index-rule.md` |
| BHFF Reading Merit Transfer | `content` | `bhff-reading-merit-transfer-engine.md` |

## Distribution Map — Phase 21

| BRD Logic | Domain | USE_CASE file |
|---|---|---|
| Thái Tuế / Calamity Year | `calendar` | `zodiac-tai-sui-clash-enforcer.md` |
| Print Hardware Calibration Lock | `engagement` | `print-hardware-calibration-lock.md` |
| Merit Fraction Engine | `content` | `bhff-quota-transfer-engine.md` |
| Proxy Liberation Karma Shield | `engagement` | `proxy-liberation-karma-shield.md` |
| Daily Recitation Starter Lock | `wisdom-qa` | `daily-recitation-starter-mahaprajna-sutra-lock.md` |

## Distribution Map — Phase 22

| BRD Logic | Domain | USE_CASE file |
|---|---|---|
| Offline Sync Spoofing Guard | `engagement` | `yin-time-offline-guard.md` |
| Commitment Gate (Lễ Phật >3/day) | `wisdom-qa` | `heavy-karma-activation-nnn-commitment-gate.md` |
| Anti-Skimming Merit Guard | `content` | `anti-skimming-merit-guard.md` |
| Re-Reading Depth Tracker | `content` | `re-reading-depth-tracker.md` |
| Non-Fungible Repentance Rule | `wisdom-qa` | `non-fungible-repentance-rule.md` |
| Prayer Request Anti-Greed | `vows-merit` | `prayer-request-specificity-anti-greed-validator.md` |
| Pregnant Creature Merit Multiplier | `vows-merit` | `pregnant-creature-merit-multiplier.md` |
| Karma Cascade Alert + Auto-Downgrade | `wisdom-qa` | `heavy-karma-activation-nnn-commitment-gate.md` |

## Distribution Map — Phase 23

| BRD Logic | Domain | USE_CASE file |
|---|---|---|
| Hardware Posture Enforcer | `content` | `hardware-posture-enforcer.md` |
| Post-Burn Sanitization Protocol | `engagement` | `burn-container-sanitization-protocol.md` |
| Auto-Downgrade Lock (karma) | `wisdom-qa` | `heavy-karma-activation-nnn-commitment-gate.md` |
| Ecological Liability Exemption Prayer | `vows-merit` | `ecological-liability-exemption-prayer.md` |
| No-Water-Staring Protocol | `vows-merit` | `no-water-staring-protocol.md` |
| No-Altar Prerequisite Enforcer | `engagement` | `no-altar-prerequisite-enforcer.md` |
| Midnight Override Prefilled LH | `wisdom-qa` | `midnight-override-prefilled-lh.md` |
| Zen-PureLand Syncretic Router | `wisdom-qa` | `zen-pure-land-syncretic-router.md` |

## Distribution Map — Phase 24

| BRD Logic | Domain | USE_CASE file |
|---|---|---|
| Face-Down Detection | `content` | `ereader-anti-face-down.md` |
| Pause Mantra Seal | `content` | `pause-mantra-seal.md` |
| Pre-Recitation Bodhisattva Invocation | `vows-merit` | `vow-six-bodhisattva-sequence.md` |
| Casualty Debt Calculator | `vows-merit` | `casualty-debt-calculator.md` |
| Post-Liberation Dietary Restraint | `vows-merit` | `post-liberation-dietary-restraint.md` |
| Pain-Triggered Karma Radar | `wisdom-qa` | `pain-triggered-karma-radar.md` |
| Metal Container Ban | `engagement` | `metal-container-ban.md` |
| Form Disposal Polarity Guard | `engagement` | `form-disposal-polarity-guard.md` |
| Sacred Item Damage Protocol | `altar-management` | `sacred-item-damage-protocol.md` |
| Little House Ash Disposal | `engagement` | `little-house-ash-disposal.md` |
| Print Border Restriction | `engagement` | `print-hardware-calibration-lock.md` |

---

## Rules for new BRD phases

1. Tạo file mới tại `design/05-references/brd-research/BRD_PHASE_XX_*.md` — không phải `design/` root
2. Phân phối logic vào đúng domain USE_CASES trước khi bắt đầu implement
3. Cập nhật bảng Distribution Map ở file này
4. File BRD chỉ là source snapshot — không reference trực tiếp từ code
