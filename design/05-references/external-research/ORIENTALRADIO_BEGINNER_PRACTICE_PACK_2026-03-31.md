# ORIENTALRADIO_BEGINNER_PRACTICE_PACK_2026-03-31

## Purpose
- Luu goi noi dung `For Beginners` do owner cung cap (praying procedure, recitation, little house, faq lane).
- Chuan hoa de doi design/API co the ingest sau nay.
- Day la `research archive` + `design input`, chua phai runtime canon bat buoc.

## Source family
- `Oriental Radio / For Beginners`
- Captured blocks:
  - Praying Procedure
  - Performing Recitation
  - About the Little House
  - Making Great Vows
  - Life Liberation
  - Buddhist Scriptures (ebook/audio)
  - Altar Set Up
  - FAQ

## A. Praying Procedure (normalized)

### Core flow
1. Dang huong, quy truoc ban tho.
2. Khong co ban tho: dung `Heart Incense`; khong quy/lay vat ly.
3. Xung danh tri an chu Phat/Bo Tat theo thu tu huong dan.
4. Niem 1 Dai Bi + 1 Tam Kinh.
5. Khan nguyen hoac phat nguyen theo tinh huong.
6. Lap lai phan tri an.
7. Niem `Qi Fo Mie Zui Zhen Yan` 7 lan.
8. Dung day, le 1/3 lay, lui 1 buoc, ket thuc hoac vao cong khoa.

### Structured entities candidate
- `greetingScript[]`:
  - targetName
  - repeatCount
  - bowCount
- `preRecitation`:
  - daBeiCount
  - xinJingCount
- `wishRules`:
  - maxWishCount (recommendation = 3)
  - vowTemplate
  - prayerTemplate
- `closingScript`:
  - qiFoMieZuiZhenYanCount = 7
  - bowCount = 1|3

### Safety / UX guardrail
- `no-altar-mode` phai hien ro:
  - khong quy/le bai bang than the
  - chi dung visualisation / tam huong
- Muc `max 3 wishes` de o lane `recommendation`, khong hard-validator.

## B. Performing Recitation (normalized)

### Daily baseline suggested
- Dai Bi: 3-7
- Tam Kinh: 3-7
- Chuan De: 21-49
- Le Phat 88: 1-7
- Ket hop: Little House + Phong Sanh + Phat Nguyen

### Sutra/mantra notes
- Tam Kinh: tranh sau 22:00.
- Dai Bi: co lane tang 21/49 khi khan cap (pre-op).
- Cac mantra:
  - Vang Sinh
  - Chuan De
  - Giai Ket
  - Tieu Tai Cat Tuong

### Product constraints
- Cac cau “cure illnesses”, “transform destiny” gan nhan:
  - `belief_statement`
  - `non-medical-claim`
- UI phai co disclaimer y khoa khi nguoi dung co trieu chung nghiem trong.

## C. Little House (normalized)

### Composition
- Dai Bi: 27
- Tam Kinh: 49
- Vang Sinh: 84
- Qi Fo Mie Zui Zhen Yan: 87

### Claimed usage lanes
- Sieu do nguoi da mat.
- Hoa giai oan ket nghiep luc.
- Giam nghiep chuong, ho tro vuot nghich canh.

### Operational instructions (high value)
- Mau giay vang A4, form dung chuan.
- Ghi nguoi nhan cong duc theo template:
  - karmic creditor
  - child of <mother/father>
  - deceased full name
- Bi ngat quang niem:
  - dung `Ong Lai Mu Suo He` de pause/resume
  - bai ngan hoac ngat >2h thi nen niem lai
- Cham do:
  - chi do sau khi niem xong
  - but do, cham trong vong tron (khong tick/cross)
- Time/weather guard:
  - tranh Tam Kinh + Vang Sinh sau 22h, luc thoi tiet xau
- Dot:
  - uu tien 8h, 10h, 16h
  - khung hop le: 6h den truoc hoang hon neu thoi tiet tot
  - tranh dot sau hoang hon, ngay mua/ram
  - tro khong xa/xa toilet

### Dream feedback lane
- Dream positive signal:
  - doi tuong mac dep, bieu cam tot, boi canh sang.
- Dream unresolved signal:
  - boi canh xau/toi, tiep tuc dot bo sung.

### Number guidance sample
- aborted/miscarried child:
  - toi thieu 7
  - thuong 21+
- deceased person:
  - toi thieu 7
- karmic creditor of house:
  - co the bat dau 4 roi theo doi.

## D. Mapping to PMTL design surfaces
- `practice-support/heart-incense`:
  - no-altar-only mental mode
  - praying procedure skeleton
- `practice-support/recitation-guide`:
  - baseline counts + time/weather cautions
- `practice-support/little-house-writing-rules`:
  - naming/dotting/pause-resume
- `practice-support/little-house-allocation-guidelines`:
  - range 4/7/21+ theo scenario
- `vietnam-home-practice-guide`:
  - workplace/no-altar/ethics guardrails

## E. Content safety tags (required)
- `belief_statement`
- `ritual_guidance`
- `medical_disclaimer_required`
- `source_family = orientalradio`
- `source_tier = external_reference`

## Link back
- `design/05-references/external-research/ORIENTALRADIO_PMtl_SOURCE_DIGEST_2026-03-31.md`
- `design/05-references/external-research/ORIENTALRADIO_UNDERSTANDING_GYC_2026-03-31.md`
