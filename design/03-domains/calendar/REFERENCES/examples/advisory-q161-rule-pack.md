# Advisory Rule Pack Example: Q161 (Lễ Phật Đại Sám Hối Văn)

File này mô tả `calendar advisory payload` cho một nguồn rule phức hợp có nhiều loại cap và nhiều audience.

## Source binding

- `sourceRefKey`: `q161`
- `sourcePublicRef`: `wisdom-qa:q161`
- `sourceVersion`: `q161-vn-community-translation-r1`
- `reviewStatus`: `human_review_required`

## Rule pack identity

- `rulePackKey`: `lphv_special_days_q161`
- `chantKey`: `le_phat_dai_sam_hoi_van`
- `appliesToDayKinds[]`:
  - `major_holiday`
  - `buddha_bodhisattva_vesak_day`
  - `tet_window_day`
  - `regular_mung_1_or_ram`
  - `dharma_assembly_day`

## Recitation caps (single-day)

- `singleDayCaps[]`
  - `major_holiday_standard`: `27`
  - `buddha_bodhisattva_standard`: `49`
  - `dia_tang_special`: `79`
  - `trung_cuu_special`: `63`
  - `trung_nguyen_special`: `21`
  - `regular_mung_1_or_ram`: `21`

## Cross-day caps

- `crossDayCapRules[]`
  - `ruleKey`: `tet_30_m1_total_87`
  - `windowStartRef`: `tet_day_30_or_29_if_no_30`
  - `windowEndRef`: `tet_day_1`
  - `maxTotalCount`: `87`
  - `countingMethod`: `sum_of_days`
  - `conditionSummaryVi`: `Tổng số biến của cụm 2 ngày không vượt 87.`

## Audience caps

- `audienceCapRules[]`
  - `pregnant_or_postpartum`: `7` / ngày đặc biệt
  - `children_under_12`: `7` / ngày đặc biệt (an toàn nhất)
  - `children_12_to_under_18`: `49` cho cụm `30 Tết + Mùng 1`
  - `adult_18_plus`: theo full cap của ngày (bao gồm cap `87` trong cụm Tết)

## Time windows

- `timeWindowRules[]`
  - `regular_day_avoid`: `22:00 -> 05:00`
  - `special_day_24h_with_altar`: `00:00 -> 24:00`
  - `dharma_assembly_outside_hall`: `05:00 -> 22:00`

## Household conditions

- `householdConditions[]`
  - `no_altar`:
    - phải thắp Tâm hương trước khi niệm
    - nếu niệm nhiều phiên trong ngày, mỗi phiên phải thắp Tâm hương lại
  - `has_altar_but_not_offered_today`:
    - ra ngoài niệm vẫn phải thắp Tâm hương trước

## Little House caps by day family

- `littleHouseCapRules[]`
  - `buddha_days_except_dia_tang`:
    - `total_self_types <= 49`
    - `special_case <= 69`
  - `dia_tang_birthday`:
    - `per_target_type <= 78`
  - `new_year_day_1`:
    - `total_all_types <= 69`
  - `yuanxiao`:
    - `total_all_types <= 49`
    - `special_case <= 69`
  - `trung_thu_or_doan_ngo`:
    - `total_all_types <= 49`
  - `thanh_minh_or_trung_nguyen_or_dong_chi`:
    - `per_type <= 49`
  - `trung_cuu`:
    - `per_type <= 21`
  - `other_special_day_from_q161`:
    - `per_type <= 21`

## Guardrails

- `hardGuardrails[]`
  - không vượt cap ngày sau khi cộng cả `kinh bài tập` + `kinh văn tích lũy`
  - không niệm vượt cap riêng của audience
  - không đốt `Kinh Văn Tự Tu Lễ Phật` nếu không có bàn thờ
  - bản đốt tự tu trong ngày không vượt cap recitation của ngày đó

## Notification candidate payload

- `notificationPlan`
  - `preNotifyEnabled`: `true`
  - `leadTimes`: `T-1`, `same_day`
  - `eligibleChannels`: `push`, `email`
  - `audienceScope`: `opted_in_members`

## Suggested implementation split

- `wisdom-qa`
  - source + translation + canonical rule extraction
- `calendar`
  - date resolution + advisory compose + cap enforcement metadata
- `engagement`
  - self-log validation theo `hardGuardrails` của advisory package
