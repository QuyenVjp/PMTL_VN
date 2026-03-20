# 🔥 Đánh Giá Thẳng Thắn: Design Folder PMTL_VN

> Góc nhìn senior khó tính. Chỉ chê, không khen. Ưu tiên free stack cho sinh viên.

---

## Tóm Tắt Sau Khi Rà Soát Toàn Bộ

Đã đọc **toàn bộ 17 file root + 12 thư mục module** trong `design/`.
Tổng cộng hơn **4,000 dòng** docs. Dưới đây là danh sách các vấn đề chia theo mức nghiêm trọng.

---

## 🚨 VẤN ĐỀ NGHIÊM TRỌNG (Phải sửa trước khi code)

### 1. Backend chốt NestJS nhưng codebase thật đang là Payload CMS

Docs liên tục nói `NestJS là backend authority`, `Prisma là ORM`, `apps/api` dùng NestJS.
Nhưng repo thật (`apps/cms`) đang chạy **Payload CMS + Next.js 16 + Drizzle**.

Docs này đang **nói dối codebase**. Hoặc docs phải sửa lại cho đúng stack hiện tại, hoặc anh phải thật sự rebuild backend từ đầu bằng NestJS. Không được giữ 2 sự thật song song.

> [!CAUTION]
> Đây là lỗi **nguy hiểm nhất** của toàn bộ folder `design/`. AI và người đọc sẽ generate code sai stack.

### 2. `IMPLEMENTATION_MAPPING.md` gần như rỗng giá trị

File chỉ có **49 dòng**, toàn bộ status là `required before launch` hoặc `planned`.
Không có **một dòng nào** ghi `implemented` kèm code reference thật.
File tồn tại để "chặn ảo giác design = runtime" nhưng bản thân nó lại... là ảo giác.

### 3. Không có docs cho đường đi thật của dữ liệu (data flow thực tế)

`.mmd` files chỉ vẽ flow **lý tưởng tương lai**. Không có sơ đồ nào cho flow **hiện tại đang chạy**.
Anh đang code trên Payload CMS nhưng docs vẽ flow NestJS + outbox + dispatcher + worker.
Sinh viên đọc xong sẽ không hiểu hệ thống đang sống ở đâu.

### 4. Quá nhiều file cross-cutting nói cùng một thứ

| Chủ đề                      | Files nói về nó                                                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Postgres là source of truth | `README.md`, `CORE_DECISIONS.md`, `ARCHITECTURE_GOVERNANCE.md`, `INFRA.md`, `INFRA_DEEP_DIVE.md`, `FAILURE_MODE_MATRIX.md`, `STUDENT_VPS_PRODUCTION_ROADMAP.md` |
| Không bật Meilisearch sớm   | Ít nhất **6 files** nhắc lại                                                                                                                                    |
| Rate limit bắt buộc         | Ít nhất **5 files**                                                                                                                                             |
| Backup restore là bắt buộc  | Ít nhất **5 files**                                                                                                                                             |

Lặp lại 5-7 lần cùng một ý không phải là "nhấn mạnh" — đó là **thiếu cấu trúc DRY cho docs**.
Khi cần cập nhật một quy tắc, anh phải sửa ở 6 files. Đó là maintenance nightmare.

---

## ⚠️ VẤN ĐỀ ĐÁNG LO NGẠI (Nên sửa sớm)

### 5. SECURITY_BASELINE.md quá philosophy, thiếu thực thi cụ thể

File ghi:

- _"min password length 12"_ — OK.
- _"Argon2id"_ — OK.
- _"CSRF strategy rõ"_ — Không rõ. Strategy cụ thể là gì? CSRF token? SameSite cookie đủ chưa?
- _"CSP baseline policy"_ — Không có policy thật nào được viết ra. Chỉ ghi "phải có".
- _"webhook replay window 5 phút"_ — Anh có webhook nào chưa? File đang thiết kế cho hệ chưa tồn tại.

**Verdict**: Security file đọc xong tưởng an toàn, nhưng thực tế chưa có gì enforce được.

### 6. SLA_SLO.md viết số đẹp nhưng chưa đo được

- _"public read < 500ms"_, _"search < 250ms"_, _"search index updated < 10s"_
- Anh chưa có tool đo. Chưa có load test. Chưa có monitoring.
- Viết SLO mà không có cách đo = viết wish list, không phải engineer.

### 7. FAILURE_MODE_MATRIX.md rất chi tiết nhưng cho một hệ chưa tồn tại

File có 284 dòng mô tả chi tiết failure mode cho: Valkey down, Meilisearch down, object storage down, outbox fail, worker down.
Nhưng ở phase 1, **anh không có bất kỳ thứ nào trong đó** (không Valkey, không Meilisearch, không worker, không outbox, không object storage).
File chỉ thực sự cần phần `Postgres down` và `media storage down` — còn lại là premature.

### 8. 10 module design cho 1 solo dev = over-scoping rõ ràng

| Module          | File count |
| --------------- | ---------- |
| 00-identity     | 7 files    |
| 01-content      | 13 files   |
| 02-community    | 7 files    |
| 03-engagement   | 7 files    |
| 04-moderation   | 8 files    |
| 05-search       | 6 files    |
| 06-calendar     | 9 files    |
| 07-notification | 7 files    |
| 08-vows-merit   | 6 files    |
| 09-wisdom-qa    | 10 files   |

**80+ files design** cho **0 implemented modules** (theo chính `IMPLEMENTATION_MAPPING.md`).
Đây không phải planning — đây là **over-design paralysis**.
Solo dev nên tập trung 3-4 modules core trước, ship ra, rồi mở rộng.

### 9. Schema `.dbml` không match stack thật

Các schema DBML viết theo style raw SQL / Prisma: `id`, `created_at`, `updated_at` kiểu PostgreSQL thuần.
Nhưng Payload CMS có schema riêng của nó, tự generate migration, tự add `_status`, `_locked`, `created_at` kiểu khác.
DBML files hiện tại sẽ mislead khi map sang code thật.

### 10. `STUDENT_VPS_PRODUCTION_ROADMAP.md` — 614 dòng dạy DevOps

Markmap mindset roadmap 614 dòng dạy SSH, Docker, Linux, deploy, CI/CD.
Nội dung tốt nhưng **không thuộc design folder**. Đây là learning guide, nên nằm ở `docs/learning/` hoặc wiki riêng.
Để ở `design/` làm loãng mục đích của thư mục chốt kiến trúc.

---

## 🟡 VẤN ĐỀ NHẸ HƠN NHƯNG VẪN ĐÁNG NÓI

### 11. README.md quá dài (475 dòng)

README nên là entry point ngắn gọn: đọc gì, ở đâu, làm gì trước.
File hiện tại nhồi cả glossary, error strategy, performance SLA, security notes, preview tips, PDF mapping, launch gate — tất cả vào 1 file.
Viết README 475 dòng không ai đọc hết.

### 12. Thuật ngữ bilingual không nhất quán

Một số file dùng format `term (giải thích tiếng Việt)` rất chuẩn. Nhưng nhiều file khác lại dùng:

- Comment thuần tiếng Việt không giải thích thuật ngữ kỹ thuật
- Hoặc thuần tiếng Anh

Quy tắc `EN_VI_NOTATION_RULES.md` tồn tại nhưng **chính các file khác không tuân thủ 100%**.

### 13. `INFRA.md` vs `INFRA_DEEP_DIVE.md` — boundary không rõ

- `INFRA.md` (518 dòng) = "tổng quan"
- `INFRA_DEEP_DIVE.md` (963 dòng) = "chi tiết"

Nhưng `INFRA.md` đã rất chi tiết, và `INFRA_DEEP_DIVE.md` lặp lại rất nhiều context.
Nên merge lại hoặc tách thật rõ: 1 file tổng quan < 100 dòng, 1 file deep dive có phần mà tổng quan không có.

### 14. Use-cases folder chưa được kiểm chứng

Mỗi module có `use-cases/` folder. Nhưng tôi nghi ngờ nhiều use-case viết theo template nhưng chưa ai review xem nó khớp reality hay không — đặc biệt khi stack thật khác stack design.

### 15. Không có ADR (Architecture Decision Records) format chuẩn

`CORE_DECISIONS.md` gộp 18 decisions vào 1 file 509 dòng.
Chuẩn industry là **1 decision = 1 file** (theo ADR format), dễ track, dễ link, dễ update.
Gộp hết vào 1 file dài → khó maintain, khó tham chiếu.

---

## 🧰 GỢI Ý HÀNH ĐỘNG (Theo thứ tự ưu tiên)

| #   | Hành động                                                                               | Vì sao                                                |
| --- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | **Chốt stack thật**: docs ghi Payload CMS hay NestJS? Sửa toàn bộ docs cho đúng sự thật | Design không match code = docs vô dụng                |
| 2   | **Cắt scope xuống 3-4 modules core**, documentation cho phần đó thật kỹ                 | Solo dev không cần 80 file design chưa implement      |
| 3   | **Sửa `IMPLEMENTATION_MAPPING.md`** để phản ánh cái đã có đáng tin                      | Anti-hallucination file mà bản thân nó hallucinate    |
| 4   | **DRY-hóa docs**: mỗi quy tắc chỉ nằm 1 chỗ, các file khác link tới                     | 7 file nói cùng 1 ý = unmaintainable                  |
| 5   | Tách `STUDENT_VPS_PRODUCTION_ROADMAP.md` ra khỏi `design/`                              | Đây là learning guide, không phải architecture doc    |
| 6   | Viết CSP policy thật, CSRF strategy thật, không chỉ "phải có"                           | Security checklist không bằng security implementation |
| 7   | Rút `README.md` xuống < 100 dòng                                                        | Entry point quá dài = không ai đọc                    |
| 8   | Chuyển DBML schemas cho khớp ORM đang dùng (Drizzle hay Prisma)                         | Schema docs phải match schema code                    |

---

## Kết Luận Thẳng

**Điểm mạnh** _(buộc phải nói dù chỉ chê)_: tư duy phân pha, anti-overengineering, viết cho sinh viên dễ hiểu, failure mode matrix discipline.

**Vấn đề gốc**: Design folder **thiết kế cho một hệ thống chưa tồn tại** bằng một stack **khác stack đang chạy**. Docs rất nhiều, rất dài, rất chi tiết — nhưng giá trị bị phá bởi sự **lặp lại** và **lệch sự thật**.

Nếu anh muốn docs này có giá trị thật: **chốt 1 sự thật, viết ngắn, match code**.
