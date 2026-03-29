# PMTL Autoresearch Starter

Khung này giúp AI agent tự chạy vòng lặp tối ưu với nguyên tắc:

- `program.md`: mục tiêu + quy tắc
- `train.py`: file duy nhất được phép sửa
- `prepare.py`: file chấm điểm, không được sửa
- `runner.py`: vòng lặp keep/revert tự động

## Chạy nhanh

```powershell
just autoresearch
```

Hoặc:

```powershell
py infra/tools/autoresearch/runner.py --max-iters 120 --patience 20 --min-delta 0.0001
```

## Cách hoạt động

1. Đọc baseline score từ `prepare.py`.
2. Mutate `train.py` (mặc định qua `mutate_train.py`).
3. Chấm lại score.
4. Nếu tăng đủ `min_delta` thì giữ, không thì revert.
5. Lặp đến khi hết `max-iters` hoặc hết `patience`.

## Áp dụng vào bài toán thật

1. Giữ nguyên `runner.py`.
2. Thay logic trong `prepare.py` bằng metric thật của bạn.
3. Thay `mutate_train.py` bằng editor lane bạn muốn (AI CLI hoặc script riêng), nhưng chỉ cho phép sửa `train.py`.
4. Giữ nguyên guardrails:
   - một thay đổi nhỏ mỗi vòng
   - keep khi score tăng
   - revert ngay khi không tăng
   - luôn log lịch sử để audit

## Lưu ý quan trọng

- Nếu metric sai, loop vẫn tối ưu rất nhanh theo metric đó và có thể lệch mục tiêu thực.
- Nên dùng holdout cố định trong `prepare.py` để tránh overfit.
- Không cho phép chỉnh `prepare.py` trong quá trình chạy.
