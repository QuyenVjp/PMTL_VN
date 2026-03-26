# DOC_DRIFT_REVIEW_PROTOCOL

Prompt skeleton để AI review drift trong `design/`:

1. chỉ ra exact file owner đang conflict
2. phân biệt `owner` với `overview`
3. không đề xuất architecture mới nếu chỉ cần dọn authority chain
4. ưu tiên:
   - exact version drift
   - duplicated baseline lists
   - misplaced canonical files
   - missing owner docs làm scaffold dễ lệch
5. output phải có:
   - confirmed issues
   - minimal canonical edit set
   - stale findings đã được fix rồi
