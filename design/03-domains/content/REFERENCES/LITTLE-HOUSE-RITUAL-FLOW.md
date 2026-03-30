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

## Canonical Composition (Design Reference)
- Cấu trúc một tờ `Ngôi Nhà Nhỏ` gồm 4 nhóm kinh/chú:
  - `Đại Bi`: `27`
  - `Tâm Kinh`: `49`
  - `Vãng Sinh`: `84`
  - `Thất Phật Diệt Tội`: `87`
- UI tracker phải hiển thị rõ từng nhóm riêng; không gộp thành một counter duy nhất.
- Việc chấm đỏ là thao tác ghi nhận tiến độ theo nhóm, cần map trực tiếp vào trạng thái sheet.

## Writing/Marking Rules (Implementation Hints)
- Trước khi niệm:
  - điền trường người tặng và người nhận trước khi bắt đầu.
  - dùng lane validation rõ cho thông tin định danh.
- Trong lúc niệm:
  - mỗi biến hoàn thành tương ứng một dấu ghi nhận tiến độ.
  - không cho phép “chấm hàng loạt” không theo biến để tránh sai trạng thái sheet.
- Hoàn tất:
  - cho phép bước review trước khi khóa `chanted`.
  - nếu user báo điền/chấm sai, mở nhánh xử lý lỗi thay vì ép tiếp tục trên tờ cũ.

## Lifecycle State Contract
- Trạng thái chuẩn nên đi theo:
  - `draft` -> `signed` -> `chanted` -> `burned` -> `archived`
- `signed` chỉ hợp lệ khi đã điền đủ trường người tặng/người nhận theo variant dùng.
- `burned` cần có metadata tối thiểu:
  - thời điểm
  - điều kiện bối cảnh (ban ngày/đặc biệt)
  - ghi chú hậu xử lý tro (tùy chọn)

## Burn/Post-process Hints
- Burn lane mặc định:
  - đốt từng tờ, thao tác cẩn trọng
  - có checklist dụng cụ phù hợp trước khi bắt đầu
- Thời điểm:
  - ưu tiên ban ngày; điều kiện bất lợi chỉ hiện advisory + xác nhận đặc biệt
- Hậu xử lý:
  - yêu cầu user chọn một phương án xử lý tro trong checklist để đóng phiên
  - không để flow kết thúc mà thiếu post-process acknowledgement

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
- Trong quá trình niệm:
  - có thể thêm `energy-support hint` bằng Đại Bi ở đầu phiên hoặc khi user báo mệt.
  - không ép một công thức duy nhất; giữ lane này ở mức hỗ trợ theo context.
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
- Với cụm diễn đạt kiểu “tiền tệ tâm linh”:
  - chỉ dùng trong `source context note`
  - không dùng làm copy gamified hoặc cơ chế tính điểm.

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
