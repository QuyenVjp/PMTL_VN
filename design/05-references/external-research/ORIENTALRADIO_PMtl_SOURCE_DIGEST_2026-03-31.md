# ORIENTALRADIO_PMtl_SOURCE_DIGEST_2026-03-31

## Purpose
- Thu thap text lane tu website Oriental Radio Singapore de bo sung context PMTL/XLFM.
- Scope lan nay chi cap nhat `design/` (khong dong vao runtime code, khong can Docker).
- Day la `research digest`, chua phai canon production.

## Source URLs
- https://orientalradio.com.sg/en-about-xlfm/
- https://orientalradio.com.sg/en-introduction-to-xlfm/
- https://orientalradio.com.sg/en-for-beginners/
- https://orientalradio.com.sg/en-faq/
- https://orientalradio.com.sg/en-xlfm-sg/
- Deep capture:
  - `design/05-references/external-research/ORIENTALRADIO_BEGINNER_PRACTICE_PACK_2026-03-31.md`
  - `design/05-references/external-research/ORIENTALRADIO_BEGINNER_PRACTICE_PACK_PART2_2026-03-31.md`
  - `design/05-references/external-research/ORIENTALRADIO_ALTAR_SETUP_PACK_2026-03-31.md`
  - `design/05-references/external-research/ORIENTALRADIO_ALTAR_GUIDE_SECTION1_FULL_VI_2026-03-31.md`
  - `design/05-references/external-research/ORIENTALRADIO_UNDERSTANDING_GYC_2026-03-31.md`
  - `design/05-references/external-research/ORIENTALRADIO_MASTER_JUN_HONG_LU_TIMELINE_2026-03-31.md`

## Directly extracted information (normalized)

### 1) About / positioning
- Trang `About Us` gom cac lane chinh:
  - Introduction to Guan Yin Citta Dharma Door
  - Introduction to Master Jun Hong Lu
  - About Our Practice Centre
  - For Beginners
  - Our Events
  - Declaration
- Dieu nay phu hop voi huong tach `about + beginner + events + declaration` thanh cac content family rieng, khong gom chung vao mot bai dai.

### 2) Intro to Guan Yin Citta
- Noi dung gioi thieu nhan manh:
  - phap mon duoc truyen day boi Quan The Am Bo Tat
  - lane giai kho o nhan gian qua bo ba thuc hanh:
    - recitation
    - making vows
    - life liberation
  - ket hop hoc `Buddhism in Plain Terms` de tu tam-duong tanh
- Candidate mapping:
  - `practice-support` cho practical flow
  - `wisdom-qa`/`btpp` cho lane hoc tap, giai thich giao ly

### 3) Beginner lane structure
- Trang `For Beginners` hien thi 6 khu:
  - Daily Recitation
  - Little House
  - Buddhist Altar
  - Three Golden Buddhist Practices
  - FAQ
  - eBook
- Candidate mapping cho PMTL:
  - `niem-kinh`: Daily Recitation
  - `ngoi-nha-nho`: Little House
  - `tu-tu-tai-gia`: Buddhist Altar + FAQ + Heart Incense fallback
  - `practice-support`: Three Golden Buddhist Practices (overview)

### 4) FAQ lane (high-value operational text)
- `en-faq` chua nhieu rule practical co the dung cho support cards:
  - xu ly altar khi di xa / khi chuyen nha
  - gio dang huong + ky luat den dau/nen
  - recitation environment do/don't
  - heart incense fallback khi khong co altar
  - daily recitation va little-house framing
- Candidate extraction tags:
  - `altar-travel`
  - `altar-relocation`
  - `incense-discipline`
  - `heart-incense-without-altar`
  - `daily-recitation-baseline`
  - `little-house-purpose`

### 5) Singapore practice centre profile
- `en-xlfm-sg` cung cap:
  - dia chi trung tam
  - phone/mobile
  - opening hours
  - huong dan di chuyen (MRT/bus)
- Candidate mapping:
  - `contact/practice-centre` lane rieng trong web info pages
  - khong tron vao practice rules.

## Design implications for PMTL
- Nen tiep tuc dung owner-bounded content families:
  - `practice-support` cho huong dan thao tac
  - `wisdom-qa` cho hoi-dap va source code/time
  - `events` cho hoat dong trung tam
  - `about` cho profile/chinh danh
- `FAQ` tu nguon nay rat giau tactical text; nen ingest thanh:
  - `question`
  - `answer`
  - `riskLevel`
  - `sourceCode/sourceUrl`
  - `productizationMode` (card/checklist/reference-only)

## Constraints / caution
- Nguon web nay la source reference huu ich, nhung PMTL van can giu:
  - ton trong legal/compliance wording noi dia
  - khong bien thanh medical-claim engine
  - tach ro `source-backed rule` vs `supplemental interpretation`

## Suggested next design-only tasks
1. Tao `FAQ ingestion spec` cho `en-faq` (field-level) trong `design/04-execution-overlay/api/`.
2. Tao `about/events/contact content map` de gom lane `en-about-xlfm` + `en-xlfm-sg`.
3. Bo sung `sourceUrl/sourceCapturedAt/sourceFamily` cho cards can render tren web/admin.
4. Tach rieng founder/credential timeline vao file co governance label:
   - `design/05-references/external-research/ORIENTALRADIO_MASTER_JUN_HONG_LU_TIMELINE_2026-03-31.md`
