# NIEM-KINH-CORE-RULES

## Owner
- `content` (canon wording)
- tiêu thụ bởi `engagement` daily practice flows

## Mục đích
- Chuẩn hóa logic thực hành `Niệm Kinh` trong app theo hướng product-safe.
- Dùng cho FE copy, form hints, validation advisory và codegen mapping.

## Product Positioning
- `Niệm Kinh` là nền tảng thực hành hằng ngày trong 5 pháp bảo.
- Tách rõ với `Little House`:
  - daily recitation là lane duy trì nền tảng
  - little-house là lane xử lý mục tiêu riêng theo lifecycle
- Không cộng gộp đếm daily recitation vào little-house sheet.

## Core Set (Daily Baseline)
- `Đại Bi`
- `Tâm Kinh`
- `Lễ Phật Đại Sám Hối Văn`
- Các chú hỗ trợ là optional lane theo nhu cầu.

## Core + Optional Model
- Logic FE/BE nên tách 2 tầng rõ:
  - `core_required`: 3 trụ cột nền
  - `optional_support`: tiểu chú theo nhu cầu từng ngày
- Khi user chỉ làm optional lane mà bỏ core:
  - hệ thống chỉ nhắc mềm “ưu tiên core trước”
  - không hard-block lưu nhật ký.
- Nấc count tham chiếu cho optional lane: `21/27/49` (advisory).

## Optional Support Lanes
- `Chuẩn Đề`: lane cầu học tập/sự nghiệp hợp pháp.
- `Giải Kết`: lane hóa giải mâu thuẫn.
- `Vãng Sinh`: lane hồi hướng cho các trường hợp phù hợp.
- `Tiêu Tai Cát Tường`: lane cho sự cố/rắc rối đột xuất.

## Practical Rules (Advisory)
- Trước khi thực hành:
  - có thể hiển thị bước xưng danh + lời nguyện ngắn.
  - khuyến nghị không đặt quá nhiều điều cầu trong một lần.
  - có thể gợi ý giới hạn mềm: tối đa 3 điều cầu trong một phiên.
- Khi thực hành:
  - ưu tiên đọc rõ ràng, ổn định, không gấp gáp.
  - có thể nhắc đầy đủ tiêu đề kinh/chú ở phần hướng dẫn.
  - đọc nhẩm nhẹ và đều nhịp; tránh đọc quá gấp hoặc quá căng.
- Theo thời gian:
  - khung giờ nhạy cảm chỉ hiển thị dạng advisory, không khóa cứng mặc định.
  - nếu user yếu mệt, gợi ý chuyển sang ban ngày.
  - có thể hiển thị cảnh báo mềm cho khung 2-5 AM theo source note.
  - với `Tâm Kinh` và `Vãng Sinh`, UI nên có warning mềm riêng khi user chọn giờ muộn hoặc thời tiết bất lợi.
- Tụng thay:
  - nếu user chọn “tụng thay”, yêu cầu điền rõ người nhận.
  - nếu user chọn nhiều người nhận, yêu cầu tách record theo từng đối tượng.

## Interruption Rules
- Ở môi trường công sở hoặc bối cảnh dễ bị gián đoạn:
  - nếu đang niệm bài dài mà bị sếp/đồng nghiệp/cuộc gọi ngắt quãng:
    - cho phép lane `tam-dung-ngan`
    - đọc `Ong Lai Mu Suo He` 1 lần trước khi dừng
    - xử lý xong việc thì đọc lại `Ong Lai Mu Suo He` 1 lần rồi tiếp tục phần còn dang dở
- Nếu đang niệm bài chú ngắn:
  - ưu tiên niệm lại từ đầu sau khi bị ngắt
- Product rule:
  - hiển thị dưới dạng `resume guidance`
  - không auto-split count hoặc tự cộng biến cho phần bị ngắt

## Workplace / Busy-mode Rules
- Công ty hoặc nơi đông người vẫn có thể là lane thực hành hợp lệ nếu:
  - tìm được chỗ tương đối yên
  - niệm nhỏ vừa đủ cho chính mình nghe
  - không đọc quá to
  - không đọc thầm tuyệt đối kiểu chỉ lướt trong đầu
- `Tuyet doi khong` mang kinh sách hoặc thực hành trong nhà vệ sinh.
- Với môi trường công sở:
  - `Tâm Hương` là fallback chuẩn trước khi vào công khóa
  - chỉ cho phép quán tưởng trong tâm
  - không biểu diễn động tác chắp tay/cắm hương/lạy thật giữa nơi làm việc
- Mọi kinh/chú đều phải đọc đầy đủ tiêu đề trước khi vào nội dung chính.

## Weather-sensitive Rules
- Nếu trời mưa to, sấm chớp, hoặc âm u nặng:
  - tạm dừng lane `Tâm Kinh`
  - tạm dừng lane `Vãng Sinh Chú`
  - ưu tiên lane an toàn hơn như `Chú Đại Bi` hoặc các chú ngắn phù hợp
- Đây là `source-backed caution`, không phải hard-fail validator cho mọi flow.

## Long-term Aspiration Lane
- Trong product canon, `Niệm Kinh` không chỉ là lane giải quyết rắc rối đời sống trước mắt.
- Cần giữ thêm lớp `aspiration note` cho người dùng nâng cao:
  - mục tiêu dài hạn là thanh lọc nghiệp lực và tiến về giải thoát khỏi luân hồi
  - `Vãng Sinh Chú` và `Kinh A Di Đà` là lane tham khảo cho nguyện lực Tịnh độ trong bối cảnh phù hợp
  - với người cao tuổi hoặc người có nguyện vãng sinh rõ, có thể hiển thị note tham khảo về `Kinh A Di Đà 3-7 bien/ngay`
  - ở giai đoạn lâm chung hoặc quá yếu, lane tối giản là xưng niệm danh hiệu `Nam mo Dai Tu Dai Bi Quan The Am Bo Tat`
- Product rule:
  - chỉ giữ ở mức `orientation / aspiration`
  - không claim chắc chắn “thoát luân hồi” như một machine outcome

## UX Contract
- Có `Busy mode` và `Heart incense fallback`.
- Không fear-based popup.
- Không phán định đúng/sai tâm linh tự động.
- Dữ liệu nhạy cảm (dream/health/family) phải private mặc định.

## Non-goals
- Không karaoke sync.
- Không niệm online realtime.
- Không claim chắc chắn chữa bệnh hoặc bảo chứng kết quả.

## References
- `design/03-domains/content/REFERENCES/DAILY-GONGKE-STEPS.md`
- `design/03-domains/content/REFERENCES/HEART-SUTRA-RULES.md`
- `design/03-domains/content/REFERENCES/DAIBI-SPECIAL-USES.md`
- `design/03-domains/content/REFERENCES/TEN-SMALL-MANTRAS-USAGE.md`
- `design/03-domains/content/REFERENCES/REPENTANCE-GUIDE.md`
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-RITUAL-FLOW.md`
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`
