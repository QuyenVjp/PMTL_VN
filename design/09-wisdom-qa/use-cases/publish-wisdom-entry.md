# Publish Wisdom Entry

## Purpose
- Xuất bản một entry chính thống thuộc `Bạch thoại Phật pháp`, `khai thị`, `Phật ngôn Phật ngữ`, hoặc `bài pháp hội` để surface tra cứu có nguồn rõ ràng.

## owner module (module sở hữu)
- `wisdom-qa`

## Actors
- `admin`
- `super-admin`

## trigger (điểm kích hoạt)
- Admin publish một `wisdomEntries` record đã được biên dịch hoặc curate xong.

## preconditions (điều kiện tiên quyết)
- Entry có source URL chính thức.
- Có title gốc và title dịch nếu đã dịch.
- Có loại entry rõ ràng và tag chuẩn hóa.

## Read set
- `wisdomEntries`
- media/audio/video refs nếu có
- taxonomy/tag mapping nội bộ nếu có

## write path (thứ tự ghi dữ liệu chuẩn)
1. Validate source mapping và metadata.
2. Chuẩn hóa alias tiếng Việt / tiếng Hoa cho search.
3. Ghi canonical record (bản ghi chuẩn gốc) vào `wisdomEntries`.
4. Chuyển trạng thái sang publish.
5. Append audit `wisdom.entry.publish`.
6. Enqueue search sync cho `Kho Trí Huệ`.
7. Nếu có audio/video liên quan, sync relation metadata.

## async (bất đồng bộ) side-effects
- search sync
- optional offline bundle (gói tải ngoại tuyến) refresh

## success result (kết quả thành công)
- Entry xuất hiện ở surface đọc/nghe đúng nhóm.

## Errors
- `400`: thiếu source URL hoặc metadata chuẩn hóa.
- `401`: chưa đăng nhập.
- `403`: không đủ quyền.
- `404`: media/source ref không tồn tại.
- `409`: conflict alias hoặc publicId.
- `500`: lỗi service (lớp xử lý nghiệp vụ) hoặc downstream sync.

## Notes for AI/codegen
- Không publish entry nếu chưa rõ nguồn chính thức.
- Search alias phải phục vụ cả tiếng Việt và tiếng Hoa gốc.

