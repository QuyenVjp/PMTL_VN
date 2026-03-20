# SVG Precision Workflow

File này chốt khi nào PMTL_VN nên dùng `svg-precision` trong `design/`, cách dùng, và khi nào không nên dùng.

## Mục tiêu

`svg-precision` dùng cho SVG có yêu cầu:
- cấu trúc ổn định
- render nhất quán giữa viewer
- diff-friendly trong git
- có thể validate thay vì chỉ nhìn bằng mắt

Nó là workflow cho **design assets dạng text-first**, không phải thay Figma cho mọi loại khám phá giao diện.

## Dùng ở đâu trong `design/`

### Nên dùng

- sơ đồ topology, flow, state machine, data-flow khi cần SVG canonical thay vì ảnh chụp
- icon tùy biến riêng cho PMTL nếu Lucide không đủ
- chart tĩnh cho docs hoặc design reviews
- technical drawing, layout frame, wireframe tĩnh
- mockup SVG nhẹ để minh họa `design/ui/` mà cần commit/diff rõ ràng

### Không nên dùng

- mockup visual exploration cần cảm giác "high-fidelity"
- animation
- layout thử nghiệm nhanh còn thay đổi liên tục bằng mắt
- tài sản binary scan/reference như ảnh PNG, PDF extract, hoặc media content

## Quy ước output cho PMTL_VN

### Canonical locations

- `design/assets/svg/`:
  - icon hệ thống
  - symbol
  - reusable primitives
- `design/overview/svg/`:
  - architecture topology
  - execution map variants
- `design/ui/svg/`:
  - mockup tĩnh
  - layout studies
  - component anatomy

Nếu một module cần asset riêng, ưu tiên:
- `design/<module>/svg/`

### Sidecar files

Khi tạo SVG quan trọng, giữ đủ 2 hoặc 3 file:
- `name.spec.json` — spec canonical
- `name.svg` — output canonical
- `name.preview.png` — optional, chỉ khi review bằng image tiện hơn

Quy tắc:
- spec là nguồn để rebuild
- svg là artifact canonical để đọc trực tiếp trong docs
- png chỉ là preview phụ

## Quy tắc kỹ thuật bắt buộc

- luôn khai báo `canvas.width`, `canvas.height`, `canvas.viewBox`
- ưu tiên tọa độ tuyệt đối
- số liệu làm tròn 3-4 chữ số
- item tái sử dụng để trong `defs`
- hạn chế filter lạ
- text là vùng rủi ro; nếu cần pixel-stable thì chuyển thành shape hoặc chấp nhận khác biệt render

### Default sizes

- icon: `24x24` hoặc `32x32`
- chart: `800x450`
- diagram: `1200x800`
- desktop UI mockup: `1440x900`
- mobile UI mockup: `390x844`

## Fast path

1. Viết spec JSON từ template phù hợp
2. Build SVG
3. Validate SVG
4. Render preview PNG nếu review cần

### Commands

```bash
python scripts/svg_cli.py build spec.json out.svg
python scripts/svg_cli.py validate out.svg
python scripts/svg_cli.py render out.svg out.png --scale 2
python scripts/svg_cli.py diff a.svg b.svg diff.png --scale 2
```

## Áp dụng cho PMTL_VN UI

Trong `design/ui/`, skill này đặc biệt hợp cho:
- icon studies
- bottom nav / sidebar icon sets
- component anatomy diagrams
- screen wireframes cần commit theo text

Không dùng nó để ép tạo toàn bộ visual language của PMTL. Typography, atmosphere, spacing rhythm, và premium feel vẫn phải được quyết định ở `DESIGN_PRINCIPLES.md` và mockup/high-fidelity workflow khác.

## Áp dụng cho overview và module docs

Trong `design/overview/` và các module `design/<number>-*/`:
- nếu Mermaid đủ rõ thì giữ Mermaid
- nếu Mermaid không đủ cho layout kỹ thuật, marker arrows, exact geometry, hoặc canonical visual asset thì chuyển sang SVG bằng `svg-precision`

Rule:
- state machine logic: ưu tiên `.mmd`
- precise diagram asset: dùng `.spec.json` + `.svg`

## Review checklist

- [ ] Có `viewBox` đúng không
- [ ] Có validate pass không
- [ ] Có giữ spec JSON không
- [ ] Có đặt đúng thư mục không
- [ ] Có đang dùng SVG cho thứ đáng ra chỉ cần Mermaid không
- [ ] Nếu có text, đã chấp nhận rủi ro render khác font chưa

## Claude Code usage

Trong Claude Code, dùng skill `svg-precision` khi yêu cầu thuộc một trong các nhóm:
- icon
- diagram
- chart
- UI mockup tĩnh
- technical drawing

Prompt nên nói rõ:
- loại SVG
- kích thước canvas
- style direction
- output path trong `design/`
- có cần spec JSON + preview PNG hay không
