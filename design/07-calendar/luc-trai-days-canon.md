# Luc Trai Days Canon

File này chốt canon cho `六齋日` trong boundary của `07-calendar`.

Mục tiêu:

- không để logic `mùng 8 / 14 / 15 / 23 / 29 / 30` bị nhét thành 1 cục text mơ hồ
- cho `Calendar` có rule family rõ để compose advisory
- giữ `Wisdom-QA` là owner của source-backed doctrine, transcript, và provenance
- cho admin có surface đủ sâu để preview, override, refresh, và audit

## Canonical owner split

### `07-calendar` sở hữu

- `day family` classification cho `六齋日`
- `dayRole`
- `recommendedActions`
- `warningProfile`
- `fallbackSuggestions`
- advisory composition rules
- read-model projection và preview logic

### `10-wisdom-qa` sở hữu

- transcript / discourse / source-backed text gốc
- `sourceRefs`
- family taxonomy như `wenda`, `event_discourse`, `btpp_radio`
- review status, official provenance, quote boundaries

## Rule family

- Canonical family key: `luc_trai_days`
- Default lunar days:
  - `8`
  - `14`
  - `15`
  - `23`
  - `29`
  - `30`
- Đây là `monthly lunar recurrence family`, không phải hardcode riêng cho một tháng cụ thể

## Day-role matrix

| Lunar day | Canonical role key | Meaning vi | Advisory weight |
|---|---|---|---|
| `8` | `heavenly_kings_senior_ministers` | Tứ Đại Thiên Vương sai trọng thần quan sát thiện ác | `high` |
| `14` | `heavenly_kings_prince_observation` | Tứ Đại Thiên Vương sai Thái tử quan sát | `high` |
| `15` | `heavenly_kings_personal_inspection` | Tứ Đại Thiên Vương đích thân tuần tra thiên hạ | `highest` |
| `23` | `heavenly_kings_assistant_ministers` | Tứ Đại Thiên Vương sai phụ thần quan sát; có nhiều Bồ Tát giáng hạ | `high` |
| `29` | `heavenly_kings_prince_observation` | Tứ Đại Thiên Vương sai Thái tử xuống quan sát | `high` |
| `30` | `heavenly_kings_personal_inspection` | Cuối tháng, Tứ Đại Thiên Vương đích thân quan sát | `highest` |

## Recommended action families

Mỗi advisory thuộc `luc_trai_days` nên compose từ các `actionKind` có cấu trúc:

- `life_release`
- `vegetarian_observance`
- `charity_good_deeds`
- `filial_piety`
- `respect_three_jewels`
- `six_paramitas_copractice`
- `eight_precepts_if_applicable`

UI có thể render ngắn, nhưng data layer phải giữ list action families riêng.

## Warning profile

Mỗi advisory của `luc_trai_days` phải hỗ trợ warning blocks theo family, không chỉ text tự do:

- `avoid_wrongdoing`
- `avoid_creating_karma`
- `do_not_treat_special_day_as_license_for_superstition`
- `source_backed_only`

Nếu có wording nhạy cảm như `giảm lộc`, `trừ toán`, `giảm phúc`, FE/admin phải render qua source-backed advisory note hoặc warning card có `sourceRefs`, không biến thành copy editorial không provenance.

## Fallback semantics

- Nếu missed-day chính là `15`, advisory có thể gợi ý fallback sequence:
  - `23`
  - `29`
  - `30`
- `14` cũng được phép surfaced như `nearby recommended day`, nhưng không được mô tả là semantic equivalent hoàn toàn với `15`
- fallback là `advisory guidance`, không rewrite canonical `dayRole`

## Output requirements for advisory compose

Khi `compose-daily-practice-advisory` gặp `luc_trai_days`, output nên có:

- `dayTags` gồm:
  - `luc_trai_day`
  - `suggested_life_release_day`
  - `vegetarian_day`
- `announcementCopy`
  - headline cho loại ngày
  - intro ngắn giải nghĩa role của ngày
- `practiceRecommendations`
  - actions được khuyến nghị
- `warningCards`
  - warning profile phù hợp
- `fallbackSuggestions`
  - nếu day là `15`, có thể gợi ý `23`, `29`, `30`
- `sourceRefs`
  - canonical source ids, không copy full text

## Admin obligations

Admin workspace lịch phải có đủ 5 lane:

1. list `lunarEventOverrides`
2. create/edit/archive override
3. preview advisory theo ngày hoặc rule family
4. trigger refresh read-model có result summary
5. inspect freshness/status của projection

Không được coi `POST /admin/calendar/lunar-overrides` là đủ E2E.

## Non-goals

- không tạo owner doctrine mới trong `calendar`
- không copy full transcript `Wenda / Khai thị / pháp hội` sang `calendar`
- không biến fallback semantics thành rule engine mê tín hoặc scoring cơ học

## Notes for AI/codegen

- `luc_trai_days` là first-class rule family, không phải text snippet tùy hứng.
- `dayRole`, `recommendedActions`, `warningProfile`, `fallbackSuggestions` nên là field data riêng hoặc enum-backed records.
- Khi FE cần copy hiển thị, ưu tiên derive từ structured fields + source refs thay vì hardcode một đoạn rất dài.
