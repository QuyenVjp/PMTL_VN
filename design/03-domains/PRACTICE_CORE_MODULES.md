# PRACTICE_CORE_MODULES

## Purpose
- Single source of truth cho các logic module lõi hỗ trợ người tu học PMTL.
- Dùng cho codegen lane (workflow, UX contract, schema hints).
- Không thêm domain mới; chỉ map vào `content`, `vows-merit`, `engagement`, `calendar`.

## Guardrails
- Source-backed caution, không hard-rule cực đoan.
- Offline-first, private-first, elderly-first.
- Không karaoke sync, không niệm online realtime, không game hóa.

## Module 1 - LittleHouseLifecycle
- Owner:
  - `content` (ritual copy + warning blocks)
  - `engagement` (self-state sheet/lifecycle)
- Core logic:
  - 6 bước: chuẩn bị -> niệm -> hoàn tất -> burn -> xử lý sau burn -> nhắc kiêng kỵ.
  - lifecycle: `draft -> signed -> chanted -> burned`.
  - max/day là advisory; special case phải có confirm step.
- UX flow:
  - stepper + checklist offline
  - counters lớn, thao tác tối giản
- Schema hint:
  - `little_house(id, owner_id, recipient, sheets_count, status, burn_date, post_burn_note)`

## Module 2 - VowMeritEngine
- Owner:
  - `vows-merit`
- Core logic:
  - tạo nguyện -> theo dõi tiến độ -> hoàn nguyện -> hồi hướng theo %.
  - dream chỉ là input tham khảo, không auto-create vow.
- UX flow:
  - vow wizard + merit transfer card + private dream notes.
- Schema hint:
  - `vow(id, user_id, content, deadline, status)`
  - `merit_transfer(id, vow_id, transfer_percent, target_label, note)`

## Module 3 - DailyGongkeTracker
- Owner:
  - `content` (canon guideline)
  - `engagement` (daily logs)
  - `calendar` (day context/advisory)
- Core logic:
  - 3 trụ cột daily + optional lanes.
  - busy mode cho phép `tâm hương` fallback.
- UX flow:
  - 1 màn daily check-in
  - quick toggle `Tôi bận hôm nay`
- Schema hint:
  - `daily_gongke_log(id, user_id, date, core_counts_json, busy_mode, heart_incense)`

## Module 4 - RepentanceJournal
- Owner:
  - `content` (guidance)
  - `engagement` (private log)
- Core logic:
  - nhật ký sám hối private, không public score.
  - mốc số lần hiển thị dạng advisory theo source tier.
- UX flow:
  - form cực ngắn: `số lần + ghi chú riêng`.
- Schema hint:
  - `repentance_log(id, user_id, date, count, private_note)`

## Module 5 - AltarMaintenanceGuard
- Owner:
  - `vows-merit`
- Core logic:
  - checklist thượng hương/bảo dưỡng/di chuyển.
  - move edge case có prep checklist riêng + khuyến nghị thao tác ban ngày.
  - busy/travel có lane `tâm hương`.
- UX flow:
  - checklist 1 bước/1 màn hình, có voice-guided.
- Schema hint:
  - `altar_log(id, user_id, date, action_type, checklist_state_json, note)`

## Module 6 - ElderlyPracticeMode
- Owner:
  - `engagement` (runtime behavior)
  - `content` (elderly copy)
- Core logic:
  - elderly toggle
  - red-dot assisted tracking
  - family support lane (opt-in/private)
  - forget-tolerant streak policy.
- UX flow:
  - font lớn, touch target lớn, voice-read.
- Schema hint:
  - `practice_profile(user_id, elderly_mode, assist_mode, assist_contact_ref)`

## Module 7 - LinhTinhActivationGuard
- Owner:
  - `content` (guidance)
  - `vows-merit` (support lanes)
  - `engagement` (symptom tags)
- Core logic:
  - tag-based suggestions: đau bất thường, mơ xấu, gia đình bất hòa.
  - chỉ gợi ý lane thực hành, không chẩn đoán y tế.
- UX flow:
  - quick log + suggestion card ngay trên dashboard.
- Schema hint:
  - `activation_log(id, user_id, date, symptom_tag, suggested_actions_json)`

## Module 8 - PersonalMeritDashboard
- Owner:
  - `engagement` (read model)
- Core logic:
  - tổng hợp private từ 5 pháp bảo lanes: công khóa, nguyện, nhà nhỏ, phóng sanh, sám hối.
  - chỉ hiển thị động lực cá nhân, không leaderboard.
- UX flow:
  - dashboard 1 màn, chữ lớn, tóm tắt rõ.
- Schema hint:
  - materialized read model `personal_merit_summary`.

## Domain Mapping
- `content`:
  - `DailyGongkeTracker`, `RepentanceJournal`, `LinhTinhActivationGuard`, phần canon của `LittleHouseLifecycle`.
- `vows-merit`:
  - `VowMeritEngine`, `AltarMaintenanceGuard`, `FamilyRelation` support lane.
- `calendar`:
  - day-context cho gongke/busy mode/special days.
- `engagement`:
  - `ElderlyPracticeMode`, `PersonalMeritDashboard`, self-state execution.

## Existing Reference Files
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-RITUAL-FLOW.md`
- `design/03-domains/content/REFERENCES/DAILY-GONGKE-STEPS.md`
- `design/03-domains/content/REFERENCES/ELDERLY-GONGKE.md`
- `design/03-domains/content/REFERENCES/DREAM-LOGIC.md`
- `design/03-domains/vows-merit/REFERENCES/VOW-BREACH-RECOVERY-GUIDE.md`
- `design/03-domains/vows-merit/REFERENCES/HEART-INCENSE-GUIDE.md`
- `design/03-domains/vows-merit/REFERENCES/FAMILY-RELATION-GUIDE.md`
- `design/03-domains/vows-merit/REFERENCES/PHAT-DAI-BAO-DUONG.md`
- `design/03-domains/engagement/REFERENCES/PRIVATE-ENCOURAGEMENT-CARDS.md`
