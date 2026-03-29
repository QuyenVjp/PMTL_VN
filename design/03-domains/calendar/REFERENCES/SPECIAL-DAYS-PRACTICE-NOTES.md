# SPECIAL-DAYS-PRACTICE-NOTES

## Owner
- `calendar`

## Purpose
- Notes cho advisory cards vào các ngày đặc biệt (phat dan, vu lan, qingming, ngay via, v.v.).
- Dùng ở `/lich`, `/lich-ca-nhan`, và contextual cards trong `/dashboard`.

## Advisory Model
- Card phải gồm:
  - `dayContext`: hôm nay là ngày gì
  - `recommendedPractice`: lane tăng cường phù hợp
  - `caution`: điều nên tránh
  - `sourceRef`: link về source-backed doc

## Implementation Rule
- Không hard-block hành vi user theo ngày đặc biệt.
- Nếu có burn/ritual time nuance, hiển thị dưới dạng “khuyến nghị theo nguồn”.
- Nếu bận, luôn có fallback “minimum core practice” thay vì để user bỏ trắng.

## References
- `design/03-domains/calendar/REFERENCES/PRACTICE_ADVISORY_MODEL.MD`
- `design/03-domains/calendar/REFERENCES/LUC-TRAI-DAYS-CANON.MD`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`

