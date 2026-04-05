# Marital Purity Vow Management (Thanh Tu)

## Purpose
Enable married practitioners to establish, maintain, and receive guidance on sexual purity vows (thanh tu) while preserving healthy emotional bonds, providing practical framework for couples to distinguish between purified love and attachment, monitor mental-state compliance, and receive real-time dharma support.

## Owner
dharma-compliance (Vow Integrity Module)

## Actors
- **Married Practitioner (Initiator):** Sets vow, monitors thoughts, seeks guidance
- **Spouse (Co-practitioner):** Commits to same vow, provides mutual support
- **System:** Tracks vow status, logs intrusive thoughts, suggests targeted sutras
- **Dharma Support (Wenda Assistant):** Delivers contextual teachings on purity levels, emotional care boundaries, recovery protocols

## Trigger Events
1. Couple jointly establishes "thanh tu" (marital purity) vow with Bodhisattva
2. Practitioner reports intrusive sexual thoughts despite vow
3. Periodic vow-integrity checkpoint (monthly, quarterly)
4. Crisis: Accidental violation or severe mental-state breach

## Preconditions
- Both practitioners have Buddhist refuge (基礎)
- Couple is legally married or cohabiting long-term
- Both agree to vow (no coercion)
- Baseline understanding of "purity" (心靈潔淨 + 身體潔淨)

## Input Contract

### Vow Registration
```json
{
  "vow_id": "uuid",
  "practitioner_id": "uuid",
  "spouse_id": "uuid",
  "vow_date": "ISO8601",
  "vow_type": "MARITAL_PURITY_FULL",
  "purity_level": "FULL|EMOTIONAL|PHYSICAL",
  "allowed_contact": {
    "kiss": false,
    "hug": true,
    "sleep_arrangement": "SEPARATE_BEDS",
    "caretaking_exception": "SAME_GENDER_ASSIST_ONLY"
  },
  "recitation_daily": ["心經", "禮佛大懺悔文"],
  "notes": "string"
}
```

### Thought-State Log Entry
```json
{
  "log_id": "uuid",
  "vow_id": "uuid",
  "timestamp": "ISO8601",
  "thought_type": "SEXUAL|ATTACHMENT|JEALOUSY|PHYSICAL_URGE",
  "intensity": 1-10,
  "duration_minutes": "integer",
  "trigger": "string (e.g., shared bed, spouse appearance)",
  "response_action": "RECITATION|MEDITATION|SEPARATION|COLD_SHOWER",
  "recitation_used": ["經名"],
  "resolved": true|false,
  "reflection": "string"
}
```

### Guidance Request
```json
{
  "request_id": "uuid",
  "vow_id": "uuid",
  "category": "DEFINITION|BOUNDARY|EMOTIONAL_CARE|VIOLATION_RECOVERY|SLEEP_ARRANGEMENT|CAREGIVING",
  "question": "string (max 500 chars)",
  "context": "string (current situation)",
  "urgency": "ROUTINE|URGENT|CRISIS"
}
```

## Write Path

### Step 1: Vow Registration
- Couple records vow date, type, approved contact boundaries, daily recitation commitment
- System creates vow record (status: ACTIVE)
- Send confirmation + 11-item guidance checklist to both

### Step 2: Daily Thought-State Monitoring
- Practitioner logs intrusive thoughts (sexual, attachment, jealousy, physical urge)
- System categorizes thought type + intensity (1-10 scale)
- Log includes trigger identification (shared bed, spouse appearance, anniversary date, etc.)
- Practitioner records response action (recitation, meditation, separation, cold water rinse)
- System tracks resolution time (< 5 min = strong baseline)

### Step 3: Dharma Support Delivery
- System identifies pattern (e.g., 70% thoughts after evening, 90% triggered by spouse nearness)
- Route guidance request to Dharma Support (Wenda Assistant)
- Assistant returns:
  - **Definition:** Clarify "thanh tu" = not cold/indifferent, pure love with no lust
  - **Targeted Sutra:** Heart Sutra (心經) for clarity, Repentance (禮佛) for remorse
  - **Boundary Setting:** Sleep arrangement (separate beds > separate rooms), caretaking rules
  - **Emotional Care:** Spouse role in affirming love without physical escalation
  - **Escalation Path:** When to seek in-person teacher guidance

### Step 4: Violation Recovery
- If couple violates vow (any sexual contact):
  - Practitioner must report within 24 hours
  - System logs violation type (accidental touch vs. full breach)
  - Recitation escalation: 5-7 Repentance cycles recommended
  - Cooling-off period: Recommend 7-30 days re-establishment
  - **No shaming:** Vow can be re-established; slips are normal

### Step 5: Compliance Checkpoints
- **Monthly:** System prompts for vow integrity self-assessment
- **Quarterly:** Couple reviews thought patterns, adjusts boundaries if needed
- **Annual:** Renew vow commitment (optional deepening of purity level)

## FE Behavior

### Dashboard (Practitioner View)
- **Vow Status Card:**
  - Days since vow start
  - Purity level (FULL | EMOTIONAL | PHYSICAL)
  - Allowed contact boundaries (kiss ❌ | hug ✓ | sleep 🛏️ separate)
  - Next checkpoint date
- **Thought-State Summary (Last 7 Days):**
  - Graph: Thought frequency (0-10) by hour/trigger
  - Top triggers: "shared bed" (60%), "spouse appearance" (40%), "anniversary" (30%)
  - Success rate: "Resolved within 5 min" (75%)
- **Quick Log:** Button to record intrusive thought (1-click + intensity slider)
- **Guidance Library:**
  - Searchable by category: Definition, Boundaries, Emotional Care, Violation Recovery
  - Curated Wenda teachings (Vietnamese + Chinese)
  - Targeted sutras for thought types

### Guidance Response Page
- Display question + Dharma Assistant answer (clear, actionable)
- Example answer structure:
  1. **Definition:** "Thanh tu = 2 people live together cleanly, caring for each other, but without sexual activity"
  2. **Why It Matters:** "Once mind becomes pure, body must be pure. Day after sexual act, practitioner feels nausea; this is animal behavior"
  3. **How to Practice:** "Kiss like parent to child (no lust). Sleep separate beds. Help sick spouse but same-gender helper preferred"
  4. **Emotional Care:** "Transform worldly love into Bodhisattva love. Spouse should affirm commitment, not cold distance"
  5. **Targeted Recitation:** Heart Sutra (clarity) + Repentance (resolve wayward thoughts)
- **Related Questions:** Links to similar vow types, couple situations

### Couple Coordination View
- Optional: Spouse can view shared vow + thought-pattern summary (anonymized for spouse)
- Spouse can log support actions: "Prepared separate sleeping area," "Affirmed emotional care"
- Couple weekly check-in reminder (optional)

## Audit Trail
```json
{
  "vow_id": "uuid",
  "events": [
    {
      "event_type": "VOW_REGISTERED|THOUGHT_LOGGED|GUIDANCE_REQUESTED|VIOLATION_REPORTED|CHECKPOINT_COMPLETED|VOW_RENEWED|VOW_RELEASED",
      "timestamp": "ISO8601",
      "actor": "PRACTITIONER|SPOUSE|SYSTEM|DHARMA_SUPPORT",
      "details": "string",
      "previous_state": "object",
      "new_state": "object"
    }
  ]
}
```

**Audit Requirements:**
- All thought-state logs immutable (archive only, no delete)
- Violation reports flagged for follow-up (auto-email Dharma Support)
- Checkpoint completion required for vow renewal
- 7-year retention (statute of limitations on recovery period)

## Error Codes

| Code | Scenario | System Response |
|------|----------|-----------------|
| `PURITY_001` | Practitioner logs thought intensity 9-10 (crisis state) | Immediate escalation to Dharma Support + crisis contact option |
| `PURITY_002` | Violation reported within 24 hrs of occurrence | Mark vow "PAUSED," require recitation protocol before re-activation |
| `PURITY_003` | Violation reported >24 hrs after occurrence | Still accepted; treat as "delayed disclosure," same recovery path |
| `PURITY_004` | Spouse never registered for joint vow | System prompts "Recommend spouse enroll for mutual support" |
| `PURITY_005` | Practitioner logs 3+ violations in 30 days | Flag for teacher consultation (in-person preferred) |
| `PURITY_006` | Guidance request marked URGENT but no response in 24 hrs | Auto-escalate to senior Dharma Support |

## Related Use Cases
- **dharma-compliance:** vow-establishment, vow-violation-recovery, recitation-quota-enforcement
- **engagement:** couple-daily-ritual, emotional-validation, stress-management
- **wisdom-qa:** mental-purity-FAQs, thought-pattern-analysis
- **content:** sutra-specific-guidance (Heart Sutra, Repentance, Da Bei Zhou for emotional calm)
- **calendar:** vow-anniversary-tracking, checkpoint-reminders

## Schema Notes

### Database Tables
- `MaritalPurityVow` (vow_id, practitioner_id, spouse_id, vow_date, purity_level, contact_boundaries, status)
- `ThoughtStateLog` (log_id, vow_id, timestamp, thought_type, intensity, trigger, response_action, resolved)
- `GuidanceRequest` (request_id, vow_id, category, question, response, urgency, status)
- `VowAuditEvent` (event_id, vow_id, event_type, actor, timestamp, details)

### Indexes
- `idx_vow_practitioner_status` (practitioner_id, status)
- `idx_thought_log_vow_timestamp` (vow_id, timestamp DESC) — for daily/monthly summaries
- `idx_guidance_request_urgency_status` (urgency, status) — for Dharma Support queue

## Business Rules

1. **Definition of Marital Purity (Thanh Tu):**
   - Both partners live together cleanly (心靈潔淨 + 身體潔淨)
   - No sexual contact; mutual care replaces physical intimacy
   - Respect like "newly-wed courtesy" (相敬如賓)
   - Treat as Dharma friends (佛友), not romantic partners
   - Daily chanting, vegetarian, no worldly attachment

2. **Allowed Physical Contact:**
   - ✅ Hug with no lustful intent
   - ✅ Kiss like parent-to-child (no sexual escalation, zero lust thought)
   - ✅ Caretaking (bathing, medical) if same-gender helper unavailable (but monitor male partner carefully)
   - ❌ Sleep sharing (separate beds minimum; separate rooms preferred)
   - ❌ Any sexual activity (full stop)

3. **Purity Levels & Progression:**
   - **FULL:** No sexual contact, separate beds, limited touch
   - **EMOTIONAL:** Emotional intimacy preserved; physical distance maintained
   - **PHYSICAL:** Hug/kiss allowed if no lustful intent; monitored via thought logs

4. **Thought-State Severity:**
   - **1-3:** Normal; expect 1-2 daily (response: quick recitation, < 5 min)
   - **4-6:** Challenging; seek guided recitation daily
   - **7-8:** Urgent; adjust lifestyle (more separation, cold water rinse, outdoor time)
   - **9-10:** Crisis; escalate to Dharma Support + consider temporary retreat

5. **Recitation Protocol (Daily Minimum):**
   - **Heart Sutra (心經):** Clarity, mental purity — 3x daily
   - **Repentance (禮佛大懺悔文):** Resolve wayward thoughts — 5-7x when intrusive thoughts spike
   - **Da Bei Zhou (大悲咒):** Emotional calm, compassion — 7x if spouse-triggered

6. **Violation Response (NOT Punishment):**
   - Honest disclosure within 24 hrs = faster recovery
   - Recitation escalation: 7-21 days intensive practice
   - Vow CAN be re-established (slips expected, shame unhelpful)
   - No permanent disqualification (compassion principle)

7. **Spouse Role (Critical for Success):**
   - Affirm emotional love despite no physical escalation
   - Avoid cold/indifferent behavior (thanh tu ≠ neglect)
   - Help maintain separation (prep separate beds, give space)
   - Monitor own thoughts during caretaking (male especially)
   - Join daily recitation for mutual reinforcement

8. **Caretaking Exception (Medical/Recovery):**
   - If spouse post-surgery/illness cannot self-bathe:
   - **Same-gender helper FIRST CHOICE**
   - If unavailable: same-gender friend/family over spouse
   - If truly unavailable: spouse can assist, but:
     - Minimize contact (use washcloth, not bare hands where possible)
     - Recitation BEFORE + AFTER caretaking
     - Male practitioner esp. monitor sexual thoughts (higher risk)
     - Report in thought-state log

9. **Sleep Arrangement (Most Critical Boundary):**
   - **Minimum:** Separate beds in same room
   - **Recommended:** Separate rooms (if housing allows)
   - **Upgraded:** Separate floors (ideal for advanced practitioners)
   - **Rationale:** Physical contact during sleep = risk of involuntary escalation

10. **Emotional Care vs. Purity Tension (Dharma Balance):**
    - Transform romantic love into **Bodhisattva love** (無我 = no selfish possession)
    - Show affection through: thoughtful words, respect, care for wellbeing
    - NOT through physical escalation or possessive attention
    - Example: "I love you deeply as Bodhisattva loves all beings" (universal, not exclusive)

11. **Annual Vow Renewal & Deepening:**
    - Couple can maintain same purity level OR deepen (e.g., EMOTIONAL → FULL)
    - Re-establish vow with renewed commitment (optional ceremony)
    - Reflect on past year: What worked? What was hardest?
    - Update contact boundaries if needed (tighter for struggling couples)

12. **Teacher Escalation (When to Seek In-Person Guidance):**
    - 3+ violations in 30 days → In-person consultation
    - Couple experiencing marriage stress (separate concept from purity) → Seek teacher counseling
    - Practitioner unsure if they have "causal affinity" (根基) for vow → Teacher assessment
    - Crisis state (thought intensity 9-10 daily) → Teacher intervention

---

## Implementation Notes
- All content delivered in Vietnamese + simplified Chinese (for diaspora)
- Dharma Support responses use **accessible language**, not abstract philosophy
- Thought-state logs are **private** (not shaming); only system sees details
- Spouse coordination is **optional** (respects privacy)
- Violation recovery is **compassionate** (not punitive)
- System serves as **pre-teacher aide** (real teachers remain authority on deep cases)
