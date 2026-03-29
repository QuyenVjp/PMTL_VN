# LITTLE-HOUSE-RITUAL-FLOW

## Owner
- `content` (ritual wording + guidance blocks)
- `engagement` (self-owned tracker state)

## Purpose
- Sổ tay thiết kế cho các màn hình và flow liên quan tới `Ngôi Nhà Nhỏ`.
- Giữ đúng tinh thần `source-backed caution`: tôn trọng nguồn, không overclaim thành hard-rule tuyệt đối nếu nguồn chỉ ở mức khuyến cáo.

## Scope
- Dùng cho route public guide `Ngôi Nhà Nhỏ`, member tracker `/tu-tap/nha-nho`, và các companion card trên dashboard.
- Không dùng file này để áp đặt quy định pháp lý hoặc y tế.

## Ritual Flow (6 bước)
1. Chuẩn bị và điền thông tin tờ.
2. Niệm theo cấu trúc đã được content owner duyệt cho trường hợp cụ thể.
3. Hoàn tất một tờ và kiểm tra lại thông tin trước khi chuyển trạng thái.
4. Thực hiện bước đốt theo hướng dẫn an toàn, có nhắc quy trình cung thỉnh.
5. Xử lý phần còn lại sau đốt theo hướng dẫn vệ sinh và tôn trọng nghi thức.
6. Nhắc phần kiêng kị sau đốt ở mức nhẹ nhàng, không tạo sợ hãi.

## External Nuance Notes (for design only)
- Có thể hiển thị caution về:
  - đốt từng tờ một
  - bắt đầu từ góc `敬赠`
  - hạn chế chạm tro trực tiếp
  - khoảng nghỉ khi đổi recipient trong cùng đợt
  - mức trần số tờ/ngày theo nguồn tham chiếu
- Có thể thêm lane `self-storage`:
  - witness-prayer trước khi niệm
  - lưu trữ riêng bằng túi/bao bảo quản
  - nhắc recharge định kỳ theo nguồn tham chiếu
- Edge cases có thể đưa vào FAQ/caution:
  - cadence cho mốc 49 ngày
  - mưa/không có phat dai
  - xử lý session nhiều recipient
- Có thể thêm tracker tag `linh-tinh-kich-hoat` khi user tự khai báo:
  - đau bất thường
  - mơ xấu liên tiếp
  - trạng thái bất an mạnh
- Khi có tag này, hệ thống chỉ gợi ý lane tăng cường theo source note; không tự chẩn đoán y tế.
- Với tag liên quan mơ thấy Phật đài bất thường/mất tượng:
  - chỉ mở guidance card phục hồi nghi thức
  - không tự kết luận tâm linh tuyệt đối
- Với case bệnh mạn tính:
  - chỉ cho phép hiển thị testimonial ở lane private encouragement
  - không được diễn đạt như cam kết điều trị.
- Các mục trên là `source-backed caution` cho UI copy; chỉ chuyển thành hard validation nếu owner canon hóa trong contract.

## UX Rules
- Phải có checklist ngắn theo từng bước; ưu tiên chữ lớn, câu ngắn cho người lớn tuổi.
- Warning viết ở dạng `Khuyến nghị theo nguồn tham chiếu`, không dùng giọng phán quyết.
- Không game hóa: không badge, không leaderboard, không hiệu ứng ăn mừng.
- Không autoplay audio, không karaoke sync, không niệm online realtime.

## Content Wording Policy
- Cho phép các câu cảnh báo như “nên…”, “khuyến nghị…”, “theo nguồn …”.
- Không dùng câu tuyệt đối kiểu “nếu không làm X thì chắc chắn Y”.
- Nếu có nhiều nguồn khác nhau, hiển thị bản tóm tắt trung tính + link nguồn.

## Implementation Notes
- `content` giữ bản nghi thức và warning blocks.
- `engagement` chỉ giữ self-state: counter, status, timestamps, history.
- Tracker không được tự phát sinh “phán định tâm linh”; chỉ hiển thị trạng thái thao tác.

## References
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-SPEC.MD`
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-EXPERIENCE-ARCHITECTURE.MD`
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-TECH-FEATURES.MD`
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-SPECIAL-CASES.md`
- `design/03-domains/content/REFERENCES/DREAM-LOGIC.md`
- `design/03-domains/vows-merit/REFERENCES/FAMILY-RELATION-GUIDE.md`
- `design/03-domains/engagement/USE_CASES/manage-ngoi-nha-nho-sheet.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
