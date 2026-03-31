# WENDA20170120-FOOD-TREASURES

## Source
- Family: `Wenda / Hoi dap`
- Code: `Wenda20170120 15:28`
- Theme: thuc pham duoc xem la "bao vat" va canh bao sat sinh do tham duc an uong

## Canon-friendly extraction for product/design
- Trong lane khai thi nay, thong diep chinh khong phai "mon nao than duoc", ma la:
  - nhan gian da co du thuc pham rau-cu-dau-ngu-coc de sinh ton
  - con nguoi khong can sat sinh de "bo duong"
  - sat sinh vi tham duc se lam nghiep chung tang, thien tai nhan hoa de khoi
- Lane thuc pham duoc nhac den theo huong "ho tro thong khi / thai doc":
  - ky tu
  - tao do
  - dan sam (dung vua phai, khong lam dung)
  - nhan sam / tay duong sam
  - nam, nam huong
  - dau nanh
  - cu cai (uu tien cu cai trang)
  - dau xanh

## Product guardrails
- Khong duoc bien cac item tren thanh medical claim (khong "tri benh chac chan").
- Neu dua vao app runtime, bat buoc:
  - gan nhan `sourceCode` + `timestamp` ro rang
  - de o lane `guidance / tham khao`, khong de o lane validator bat buoc
  - wording nhan manh "giam sat sinh, nuoi duong tu bi, an chay can bang"
- Khong dung wording kich dong so hai ("an mon nay se gap nan"), chi giu warning dao duc-nghiep luc o muc can than.

## Suggested mapping
- `vietnamHomePracticeGuide.vegetarianDisciplineRules[]`
  - them rule nhan manh "thuc pham nhan gian da du, khong can sat sinh"
- `vietnamHomePracticeGuide.officeNutritionNotes[]`
  - them note nhom thuc pham ho tro nhe cho nguoi lam viec tri oc
- `vietnamHomePracticeGuide.supplementalDietNotes[]`
  - danh dau ro cac item la lane tham khao Wenda, khong phai don thuoc

## Cross references
- `design/03-domains/vows-merit/REFERENCES/VEGETARIAN-PRACTICE-AND-VOW-GUIDE.md`
- `design/04-execution-overlay/api/schemas/practice-support.seed.vi.json`
