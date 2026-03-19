# MODULE_INTERACTIONS_PRACTICE

File này mở rộng `MODULE_INTERACTIONS.md` cho các module và flow mới liên quan tu tập thực tế.

## Interaction matrix bổ sung

| From | To | Ownership model | trigger (điểm kích hoạt) | Mode | Side effects |
|---|---|---|---|---|---|
| Engagement | Content | Content owns bài đọc chuẩn | mở `Ngôi Nhà Nhỏ`, bài tập hằng ngày | direct read | không write ngược |
| Engagement | Notification | Notification owns delivery | reminder đọc/đếm bài | async (bất đồng bộ) job | push nhắc theo giờ |
| Vows & Merit | Calendar | Calendar owns ngày tu học | gợi ý ngày phát nguyện/phóng sanh | direct read | build reminder candidates |
| Vows & Merit | Notification | Notification owns delivery | đến hạn vow, ngày phóng sanh | async (bất đồng bộ) job | push/email reminder |
| Vows & Merit | Content | Content owns lời khấn/bài đọc | mở checklist phóng sanh | direct read | không write ngược |
| Wisdom & QA | Content | Content owns canonical source entry | đọc Bạch thoại / khai thị | direct read | offline bundle (gói tải ngoại tuyến) build |
| Wisdom & QA | Search | Search owns retrieval engine | tra cứu vấn đáp | direct read | query index |
| Community | Vows & Merit | Vows & Merit owns journal | user muốn chia sẻ phóng sanh hoặc linh nghiệm | explicit export/share | tạo post mới, không lộ record riêng tư mặc định |
| Calendar | Engagement | Engagement owns self-state | build lịch tu học cá nhân | direct read | không write ngược |

## Quy tắc mới

- `Ngôi Nhà Nhỏ` là self-owned practice support, không phải content canonical.
- `Phát nguyện` là self-owned vow record, không phải note trong practice log.
- `Phóng sanh` journal là self-owned thực hành; community share là nhánh tách riêng.
- `Bạch thoại Phật pháp` và `Huyền học vấn đáp` là knowledge retrieval surfaces, không phải AI answer.

## Những tương tác không nên làm

- Community tự sở hữu `phát nguyện`.
- Notification tự suy diễn lịch tu học nếu calendar chưa cấp context.
- Wisdom & QA tự sinh câu trả lời mới thay cho nguồn.
- Engagement sửa trực tiếp canonical script của `Ngôi Nhà Nhỏ`.

