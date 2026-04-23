# Autoresearch In PMTL

Tài liệu này là entrypoint nhanh để mọi AI agent trong chat mới biết cách chạy pattern autoresearch trong repo này.

## Đọc theo thứ tự

1. `AGENTS.md`
2. `infra/tools/autoresearch/README.md`
3. `infra/tools/autoresearch/program.md`

## Quy ước cố định

- Chỉ được sửa `infra/tools/autoresearch/train.py` trong vòng lặp.
- `infra/tools/autoresearch/prepare.py` là judge read-only.
- Mỗi vòng chỉ một thay đổi nhỏ, score tăng mới giữ.

## Lệnh chuẩn

```powershell
just autoresearch
```

Hoặc:

```powershell
python infra/tools/autoresearch/runner.py --max-iters 120 --patience 20 --min-delta 0.0001
```

## Khi nào nên dùng

- Có một metric số duy nhất cần tối ưu.
- Scoring chạy tự động, không cần người chấm tay.
- Có thể cô lập biến cần tối ưu vào một file editable.

## Khi nào không nên dùng

- Bài toán cảm tính khó lượng hóa trực tiếp (brand design, UX cảm xúc thuần túy, định giá không có dữ liệu).
- Bài toán cần nhiều file thay đổi đồng thời và không thể cô lập.
