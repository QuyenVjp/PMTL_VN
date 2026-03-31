# ORIENTALRADIO_MASTER_JUN_HONG_LU_TIMELINE_2026-03-31

## Purpose
- Luu ban text chi tiet ve `Introduction to Master Jun Hong Lu` de phuc vu research lane.
- Nguon input: owner paste truc tiep + doi chieu lane URL Oriental Radio.
- Day la `research_only`, khong auto dua len public copy.

## Source lane
- Primary page family: `https://orientalradio.com.sg/en-about-xlfm/`
- Related detail page (expected): `https://orientalradio.com.sg/en-about-master-lu/`

## Captured text summary (normalized)
- Master Jun Hong Lu (JP) duoc mo ta la President, Director, Founder cua 2OR Australia Oriental TV and Radio.
- Duoc mo ta co vai tro lon trong cong dong Hoa tai Australia; quoc te hoa thong qua lane van hoa Truyen thong Trung Hoa, hoa binh the gioi, va Buddhist teachings.
- Claim ve quy mo nguoi theo hoc: hon 10 trieu nguoi trong vai nam.
- Mo ta mission:
  - truyen ba van hoa truyen thong Trung Hoa
  - long tu bi, khuyen nguoi bo ac hanh thien
  - lanh dao AOMB (Australia Oriental Media Buddhist Charity Association)
  - AOMB co thong tin ABN/ACNC va claim NGO lane UN Global Compact (07/2015)

## Recognition timeline (as captured text)
- 08/07/2012:
  - London, World Religious Union Conference (60th anniversary celebration context)
  - claim duoc trao `World Peace Award (Buddhism)` + `Ambassador for World Peace`
- 18/12/2013:
  - Berlin
  - claim `Award for Exceptional Contribution and Peace Advocacy to the Global Community`
- 18/12/2013:
  - Annual Conference on Cultural Diplomacy 2013, Berlin
  - co danh sach nhieu lanh dao chinh tri/tong giao tham du
- 01/04/2014:
  - Rome, University of Siena
  - claim `Honorary Visiting Professorship` (Global Governance and Cultural Diplomacy program context)
- 24/03/2014:
  - New York, UN-supported summit
  - claim danh xung `Ambassador of Peace Education`
- 23/03/2014:
  - Culture of Peace Summit tai UN Headquarters
  - claim keynote ve ung dung Buddhism + Chinese traditional culture de thuc day hoa binh
- 28/05/2015:
  - International Buddhist Conference (UN Day of Vesak), Bangkok
  - claim tham du voi vai tro special guest
- 09/2015:
  - UN High Level Forum on The Culture of Peace, New York
  - claim duoc moi tham du/phat bieu
- 17/03/2017:
  - claim duoc Tong thong Sri Lanka moi trao doi va trao giai
- 24/05/2018:
  - UNESCO lane `2018 United Nations Vesak Festival`, Paris
  - claim duoc moi keynote

## Data governance for PMTL design
- Tat ca cac muc tren phai duoc gan nhan:
  - `credential_claim`
  - `research_only`
  - `verification_required`
- Khong dung nguyen van de marketing product neu chua cross-check doc lap.
- Neu can render tren app/admin:
  - tach ro `event`, `award`, `speech`, `organizer`, `date`, `location`, `sourceUrl`, `evidenceTier`
  - co trang thai `unverified/partially_verified/verified`.

## Suggested structured fields (future)
- `timelineId`
- `claimType` (`award` | `invitation` | `conference_attendance` | `title`)
- `claimTitle`
- `claimDate`
- `location`
- `organization`
- `description`
- `sourceFamily` (`orientalradio`)
- `sourceUrl`
- `verificationStatus`
- `notes`

## Link back
- `design/05-references/external-research/XLFM_FOUNDER_PROFILE_AND_RISK.md`
- `design/05-references/external-research/ORIENTALRADIO_PMtl_SOURCE_DIGEST_2026-03-31.md`
