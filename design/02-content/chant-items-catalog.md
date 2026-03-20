# Chant Items Catalog

> Ghi chú cho sinh viên:
> File này không thay thế collection thật `chantItems`.
> Nó là bản design dễ đọc để biết nên đổ những bài niệm nào vào hệ quản trị mới và field nào cần điền.

---

markmap:
colorFreezeLevel: 2
initialExpandLevel: 3

---

# Chant Items Catalog

## Cách đọc nhanh

- `kind`: loại bài niệm / mẫu khấn / nghi thức mở đầu
- `recommended_count`: số gợi ý nên hiện ở preset
- `openingPrayer`: lời nguyện mở đầu hoặc mục đích dùng bài
- `timeRules`: luật thời gian hoặc ngữ cảnh nên nhắc user
- `needs_review`: chỗ nào cần rà lại wording hoặc số biến trước khi nhập hệ quản trị mới

## Nhóm công khóa hằng ngày

### 1. Tịnh Khẩu Nghiệp Chân Ngôn

- `kind`: `mantra`
- `purpose`: làm sạch khẩu nghiệp trước thời công phu hoặc nghi thức
- `recommended_count`:
  - `7` biến: mặc định
  - `13` biến: trường hợp người chưa ăn chay theo tài liệu thắp tâm hương
- `openingPrayer`:
  - không cần lời khấn dài riêng
  - thường đứng ở bước chuẩn bị trước khi vào bài niệm chính
- `timeRules`:
  - dùng trước công khóa
  - dùng trước nghi thức thắp tâm hương
- `source_docs`:
  - `1. Các bước niệm kinh bài tập...`
  - `3. Trình tự thắp tâm hương...`
- `needs_review`: `false`

### 2. Chú Đại Bi

- `kind`: `mantra`
- `purpose`: hộ thân, tăng công lực, hỗ trợ tiêu tai giải nạn
- `recommended_count`:
  - `3-7` biến: công khóa hằng ngày cho người mới
  - `21` hoặc `49+` biến: trường hợp nặng theo tài liệu hằng ngày
  - `1` biến: trong nghi thức phóng sinh
- `openingPrayer`:
  - “Thỉnh cầu Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát Ma Ha Tát phù hộ cho con **(tên)** thân thể khỏe mạnh, tăng cường công lực.”
- `timeRules`:
  - có thể niệm trong khung `5h sáng -> 12h đêm` theo tài liệu hằng ngày
  - khi đi phóng sinh có thể bắt đầu niệm ngay trên đường
- `source_docs`:
  - `1. Các bước niệm kinh bài tập...`
  - `5. Nghi thức phóng sinh...`
- `needs_review`: `false`

### 3. Tâm Kinh

- `kind`: `sutra`
- `purpose`: khai mở trí tuệ, giữ đầu óc tỉnh táo bình tĩnh, tiêu trừ phiền não
- `recommended_count`:
  - `3-7` biến: công khóa hằng ngày
  - `1` biến: trong nghi thức phóng sinh
- `openingPrayer`:
  - “Thỉnh cầu ... phù hộ cho con **(tên)** khai mở trí tuệ, đầu óc tỉnh táo bình tĩnh, tiêu trừ phiền não.”
- `timeRules`:
  - có thể niệm trước `10h tối` và ban ngày theo tài liệu hằng ngày
- `source_docs`:
  - `1. Các bước niệm kinh bài tập...`
  - `5. Nghi thức phóng sinh...`
- `needs_review`: `false`

### 4. Lễ Phật Đại Sám Hối Văn

- `kind`: `sutra`
- `purpose`: sám hối, tiêu trừ nghiệp chướng
- `recommended_count`:
  - `1-7` biến
- `openingPrayer`:
  - “Thỉnh cầu ... giúp con sám hối và tiêu trừ nghiệp chướng...”
- `timeRules`:
  - thuộc công khóa hằng ngày
- `source_docs`:
  - `1. Các bước niệm kinh bài tập...`
- `needs_review`: `false`

### 5. Tiêu Tai Cát Tường Thần Chú

- `kind`: `mantra`
- `purpose`: cầu bình an thuận lợi, tiêu tai cát tường
- `recommended_count`:
  - `21`
  - `27`
  - `49`
- `openingPrayer`:
  - “Thỉnh cầu ... phù hộ cho con **(tên)** tiêu tai cát tường, bình an thuận lợi.”
- `timeRules`:
  - dùng như bài bổ sung trong công khóa
- `source_docs`:
  - `1. Các bước niệm kinh bài tập...`
- `needs_review`: `false`

### 6. Chuẩn Đề Thần Chú

- `kind`: `mantra`
- `purpose`: cầu tâm tưởng sự thành
- `recommended_count`:
  - `21`
  - `27`
  - `49`
- `openingPrayer`:
  - “Thỉnh cầu ... phù hộ cho con **(tên)** tâm tưởng sự thành...”
- `timeRules`:
  - dùng như bài bổ sung trong công khóa
- `source_docs`:
  - `1. Các bước niệm kinh bài tập...`
- `needs_review`: `false`

### 7. Bổ Khuyết Chân Ngôn

- `kind`: `closing-mantra`
- `purpose`: khép lại phần niệm, dùng sau công khóa
- `recommended_count`:
  - `3`
  - `7`
- `openingPrayer`:
  - không cần lời khấn riêng
- `timeRules`:
  - niệm sau khi hoàn tất Kinh Văn Bài Tập Hàng Ngày
  - không bắt buộc sau từng bài riêng
- `source_docs`:
  - `1. Các bước niệm kinh bài tập...`
- `needs_review`: `false`

### 8. Thất Phật Diệt Tội Chân Ngôn

- `kind`: `mantra`
- `purpose`: dùng trong bước thanh tịnh, sám hối, và một số nghi thức
- `recommended_count`:
  - `3`: cuối công khóa hằng ngày
  - `7`: trong thắp tâm hương và nghi thức phóng sinh
- `openingPrayer`:
  - không cần lời khấn dài riêng
- `timeRules`:
  - phụ thuộc flow
  - nên hiển thị dưới dạng preset theo ritual context
- `source_docs`:
  - `1. Các bước niệm kinh bài tập...`
  - `3. Trình tự thắp tâm hương...`
  - `5. Nghi thức phóng sinh...`
- `needs_review`: `false`

## Nhóm ritual templates

### 9. Mẫu khấn phát nguyện

- `kind`: `prayer-template`
- `purpose`: dùng cho flow phát nguyện
- `recommended_count`:
  - `1` lần đọc theo mỗi lần phát nguyện
- `openingPrayer`:
  - bắt đầu bằng phần cảm tạ chư vị Bồ Tát
  - sau đó mới vào câu “Con **(tên)** xin phát nguyện...”
- `timeRules`:
  - dùng trong flow phát nguyện
  - cần guardrail “chỉ nên cầu 2-3 việc, nói cụ thể”
- `source_docs`:
  - `4. Trình tự phát nguyện`
- `needs_review`: `false`

### 10. Mẫu khấn phóng sinh

- `kind`: `prayer-template`
- `purpose`: dùng cho flow phóng sinh cho bản thân hoặc thay người khác
- `recommended_count`:
  - `1` lần đọc theo mỗi phiên phóng sinh
- `openingPrayer`:
  - “Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát... hôm nay con XXX phóng sinh...”
- `timeRules`:
  - có 2 biến thể:
    - cho bản thân
    - thay người khác
- `source_docs`:
  - `5. Nghi thức phóng sinh...`
- `needs_review`: `false`

### 11. Mẫu thỉnh cầu trước khi tụng Ngôi Nhà Nhỏ

- `kind`: `prayer-template`
- `purpose`: mở đầu trước khi tụng Ngôi Nhà Nhỏ
- `recommended_count`:
  - phần “Nam mô đại từ đại bi...” `3` lần
  - phần thỉnh cầu chính `1` lần
- `openingPrayer`:
  - “Nam mô đại từ đại bi, cứu khổ cứu nạn, quảng đại linh cảm Quán Thế Âm Bồ Tát Ma Ha Tát. (3 lần)”
  - rồi đến câu thỉnh cầu giúp chuyển tặng Ngôi Nhà Nhỏ
- `timeRules`:
  - dùng sau khi đã điền rõ phần `Kính Tặng` và `Tặng`
- `source_docs`:
  - `6. Phương pháp tụng niệm Ngôi Nhà Nhỏ...`
- `needs_review`: `false`

### 12. Mẫu khấn trước và sau khi đốt Ngôi Nhà Nhỏ

- `kind`: `prayer-template`
- `purpose`: hỗ trợ flow đốt Ngôi Nhà Nhỏ không có bàn thờ
- `recommended_count`:
  - `1` lần trước khi đốt
  - `1` lần sau khi đốt
- `openingPrayer`:
  - có phần “Cảm tạ...” `3` lần
  - có câu thỉnh cầu chuyển số lượng tấm cho người nhận
- `timeRules`:
  - dùng riêng cho flow đốt
  - trong khi đốt không niệm kinh hay nói chuyện ngoài câu xin từ bi ngắn
- `source_docs`:
  - `7. Quy trình đốt ngôi nhà nhỏ không có bàn thờ PMTL.pdf`
- `needs_review`: `true`
  - lý do: cần rà lại wording cuối câu khấn và thao tác đốt

## Gợi ý `chantPlans`

### Daily beginner plan

- mở đầu:
  - `Tịnh Khẩu Nghiệp Chân Ngôn`
- cốt lõi:
  - `Chú Đại Bi`
  - `Tâm Kinh`
  - `Lễ Phật Đại Sám Hối Văn`
- bổ sung:
  - `Tiêu Tai Cát Tường Thần Chú`
  - `Chuẩn Đề Thần Chú`
- khép lại:
  - `Bổ Khuyết Chân Ngôn`
  - `Thất Phật Diệt Tội Chân Ngôn`

### Life release ritual plan

- cảm ân mở đầu
- `Chú Đại Bi` `1`
- `Tâm Kinh` `1`
- `Thất Phật Diệt Tội Chân Ngôn` `7`
- mẫu khấn phóng sinh

### Little House support plan

- phần chuẩn bị `Kính Tặng / Tặng`
- mẫu thỉnh cầu trước khi tụng
- cụm các bài niệm cấu thành Ngôi Nhà Nhỏ
- guideline chấm hoàn thành
- flow đốt theo ngữ cảnh

## Assumption

- Phần `recommended_count` ở đây chỉ ghi những con số đã thấy khá rõ trong tài liệu hiện có.
- Với cấu phần nội bộ của Ngôi Nhà Nhỏ, file này chưa chốt chi tiết từng bài + từng số biến nếu extract chưa đủ sạch.
- Nếu cần chốt sâu hơn cho Ngôi Nhà Nhỏ, nên tạo một file spec riêng chỉ cho `little-house`.
