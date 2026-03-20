# Practice PDF Extract Index

> Ghi chú cho sinh viên:
> Đây là thư mục output tự động từ pipeline local PDF.
> Mỗi tài liệu có bản `.md`, `.json`, và ảnh từng trang để anh mở preview trong VS Code.

## Cấu trúc thư mục
- Mỗi tài liệu có một thư mục riêng theo slug.
- `document.md`: bản dễ đọc cho người.
- `document.json`: bản có cấu trúc cho AI/script.
- `images/`: ảnh từng trang đã render.

## Tài liệu đã extract
| Tài liệu | Source type | Method | Confidence | Needs review | Flow hints | Folder |
|---|---|---|---|---|---|---|
| 1. Các bước niệm kinh bài tập (cho người mới bắt đầu)_V2 12.2017 | `text_pdf` | `direct_text_extraction` | `high` | `true` | daily-recitation-flow, mental-incense-flow | `1-cac-buoc-niem-kinh-bai-tap-cho-nguoi-moi-bat-au-v2-12-2017` |
| 2.Sách kinh | `mixed_text_and_scan_pdf` | `hybrid_text_extraction_plus_ocr` | `medium` | `true` | - | `2-sach-kinh` |
| 3. Trình tự thắp tâm hương(上心香的程序) | `text_pdf` | `direct_text_extraction` | `high` | `true` | mental-incense-flow | `3-trinh-tu-thap-tam-huong` |
| 4.Trình tự phát nguyện | `text_pdf` | `direct_text_extraction` | `high` | `true` | vow-making-flow | `4-trinh-tu-phat-nguyen` |
| 5. Nghi thức phóng sinh Pháp Môn tâm Linh (心灵法门放生仪式) | `text_pdf` | `direct_text_extraction` | `high` | `true` | life-release-flow | `5-nghi-thuc-phong-sinh-phap-mon-tam-linh` |
| 6. Phương pháp tụng niệm NGÔI NHÀ NHỎ và những điều cần lưu ý (小房子念誦方法與注意事項) | `text_pdf` | `direct_text_extraction` | `high` | `true` | mental-incense-flow, little-house-recitation-flow, little-house-burning-without-altar-flow | `6-phuong-phap-tung-niem-ngoi-nha-nho-va-nhung-ieu-can-luu-y` |
| 7. Quy trình đốt ngôi nhà nhỏ không có bàn thờ PMTL | `text_pdf` | `direct_text_extraction` | `high` | `true` | mental-incense-flow, little-house-recitation-flow, little-house-burning-without-altar-flow | `7-quy-trinh-ot-ngoi-nha-nho-khong-co-ban-tho-pmtl` |

## Mẹo dùng
- Nếu muốn đọc nhanh: mở `document.md`.
- Nếu muốn feed cho AI hoặc script khác: mở `document.json`.
- Nếu muốn kiểm tra scan/infographic: mở thư mục `images/`.