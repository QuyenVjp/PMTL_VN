# ORIENTALRADIO_ALTAR_SETUP_PACK_2026-03-31

## Purpose
- Ghi nhận block `How to Set Up a Buddhist Altar` do owner cung cấp.
- Chuẩn hóa thành checklist + field mapping để đội design/API dùng sau.
- Đây là `research/design input`, chưa phải hard runtime rule.

## 1) Location rules (normalized)
- Bàn thờ nên ở nơi sáng, sạch, yên tĩnh.
- Tựa tường; tránh tựa cửa sổ, tránh gần gương.
- Hướng ưu tiên:
  - Nam bán cầu: tọa Nam hướng Bắc
  - Bắc bán cầu: tọa Bắc hướng Nam
  - nếu điều kiện không cho phép: hướng khác vẫn chấp nhận.
- Tránh gần/đối diện toilet; cửa toilet nên luôn đóng.
- Không đặt ở ban công treo ngoài khối nhà.
- Tránh phòng ngủ vợ chồng (phòng người già có thể linh hoạt theo điều kiện).
- Không đối diện bếp.
- Không đặt trên TV/tủ lạnh, không đặt ngay dưới máy lạnh.
- Tránh chân giường đối diện bàn thờ; đầu giường không tựa trực tiếp sau bàn thờ.
- Trường hợp bất khả kháng có thể dùng tủ có cửa/rèm đỏ; không dùng chụp kính phủ tượng/ảnh.
- Thờ trên một mặt phẳng (không chia tầng kiểu kệ sách).
- Có thể dùng tranh nền vàng (landscape) để ổn định trường khí.
- Độ cao bàn thờ: ảnh/tượng nên cao hơn tầm mắt nhẹ.
- Có thể phủ khăn vàng mặt bàn thờ.

## 2) Required accessories (normalized)

### Bắt buộc
- `Incense burner`
  - ưu tiên sứ; tránh kim loại
  - tránh in kinh/chữ/hình thú linh vật
  - có thể 1 lư/bodhisattva để tỏ lòng cung kính.
- `Incense`
  - nên nhất quán một loại nhang phù hợp
  - 1 hoặc 3 cây (3 là chuẩn cung kính hơn)
  - không dùng nhang gãy.
- `Water cups`
  - 1 cốc/bodhisattva
  - cốc chuyên dụng, không dùng lẫn mục đích khác
  - thay nước mỗi ngày
  - không uống trực tiếp từ cốc cúng (rót ra cốc khác).
- `Oil lamps`
  - ưu tiên thủy tinh/sứ; tránh màu đen, tránh in chữ/ảnh
  - dầu thực vật lỏng (olive/cải/bắp/…)
  - không dùng dầu động vật, dầu quá nặng mùi, dầu quá đặc
  - khi nhang tắt thì tắt đèn dầu.

### Tùy chọn
- `Fruits`
  - dùng trái tươi (apple/orange/mango/pineapple/watermelon…)
  - tránh peach/banana theo source này
  - đĩa mới, chuyên dụng.
- `Flowers`
  - hoa tươi phù hợp; tránh hoa có gai
  - tránh chậu cây có đất đặt trên bàn thờ
  - bình sứ đơn giản, không in chữ/ảnh kinh tượng.

## 3) Step-by-step setup flow (normalized)

### Step 1: Đặt vật phẩm
- Nâng vật phẩm bằng hai tay trước khi đặt.
- Thứ tự ảnh/tượng theo hướng dẫn source (Guan Yin trung tâm; Nanjing/Tai Sui/Guan Di set theo vị trí quy định).
- Đặt lư hương, đèn dầu, trái cây, hoa, cốc nước.

### Step 2: Thỉnh an
- Bật đèn dầu.
- Dâng nhang (3 cây), lạy theo nghi thức.
- Ngày đặc biệt có thể làm “big incense” (sandalwood).
- Quỳ thỉnh từng vị theo bài khấn mẫu.
- Các đoạn số lượng 108/21 và nghi thức kèm theo thuộc lane ritual-specific.
- Kết bằng 7 Đại Bi + 7 Tâm Kinh, rồi lạy tổng.

### Step 3: Khấn nguyện cá nhân
- Phát nguyện theo khả năng thực tế.
- Cầu nguyện điều hợp lý: sức khỏe, gia đạo, công việc…

### Step 4: Tạ lễ
- Lạy tạ và niệm lời cảm tạ chư Phật/Bồ Tát/Hộ Pháp.

## 4) Data model hints for future ingestion
- `altarLocationRules[]`
- `altarRequiredItems[]`
- `altarOptionalItems[]`
- `altarSetupFlow[]`
- `altarInvocationScripts[]`
- `altarConstraints[]`
- `sourceTags`:
  - `sourceFamily=orientalradio`
  - `evidenceType=instruction`
  - `productizationMode=checklist/advisory`

## 5) Product safety guardrails
- Các chỉ dẫn ritual số lượng lớn (ví dụ 108 lần) để ở `advisory`, không bắt buộc bằng validator cứng.
- Các claim năng lượng/trường khí để nhãn `belief_statement`.
- Không diễn đạt thành “không làm theo sẽ bị chắc chắn tai nạn”.

## 6) Additional altar-care extract (owner batch)

### Why set up altar
- Neu dieu kien cho phep, nen lap ban tho tai nha.
- Y chinh theo source:
  - lap ban tho ~ thinh Bo Tat ve nha
  - tang hieu qua cong khoa va lane Little House.

### Inviting Bodhisattva into statue/image
- Khuyen nghi chon tuong/anh Quan Am phu hop lane GYC (dung posture canonical).
- Tuong/anh nen moi, sach, va khong lam tu vat lieu dong vat:
  - xuong, da, long, nga voi...
- Co the tu lam nghi thuc thinh an tai nha, nhung source danh gia cao lane duoc bac tu hanh co duc hanh lam le.
- Khi da thinh tuong/anh thi nen lap ban tho som, tranh de lau.

### Quantity and removal caution
- Tranh tho qua nhieu tuong/anh.
- Neu can rut bot tuong/anh da tung dang huong:
  - coi la lane nhay cam
  - can nghi thuc xin phep/sam hoi theo huong dan source (bao gom 7-7-7 va Little House bo sung).
- Productization:
  - day la `advanced_ritual_reference`
  - khong mo mac dinh cho newbie flow.

### Daily respect after altar setup
- Uu tien dang huong sang + toi; neu khong the thi toi thieu buoi sang.
- Nuoc cung thay moi hang ngay.
- Khi vang nha: dung heart-incense sang/toi.
- Ban tho giu toi gian, sach, chi de vat pham phu hop.
- Khong tron cac he tho khac tren cung mot ban tho (neu co thi tach khu rieng).
- Khi dang nhang/den:
  - tranh dong vao vat pham/tuong/anh
  - tranh bat TV neu TV gan ban tho.
- Ban dem giu anh sang khu vuc tho phu hop theo huong dan source.

### Physical placement safety
- Tat ca tuong/anh va phu kien ban tho phai duoc dat tren be do co diem tua xuong dat.
- Khong dat tren cau truc nho ra, treo lo lung.

### Moving / cleaning protocol
- Sau khi da thinh an, khong tu y cham vao tuong/anh neu khong can.
- Neu bui nhieu:
  - lau nhe ban ngay bang khan moi
  - co the niem Tam Kinh khi lau (theo source).
- Neu bat buoc di doi vi tri:
  - dang nhang xin phep
  - niem Dai Bi + Tam Kinh (3 lan moi bai theo batch owner)
  - doi vi tri sau khi nhang tat.

## Links
- `design/05-references/external-research/ORIENTALRADIO_BEGINNER_PRACTICE_PACK_2026-03-31.md`
- `design/05-references/external-research/ORIENTALRADIO_BEGINNER_PRACTICE_PACK_PART2_2026-03-31.md`

## 7) Web-verified addendum (direct crawl on 2026-03-31)

### Source path map
- Guide index:
  - `https://orientalradio.com.sg/en-setting-up-an-altar/`
- Section pages captured:
  - `.../eng-altar-setup-guide/1-the-purpose-of-having-a-buddhist-altar/`
  - `.../eng-altar-setup-guide/2-introduction-of-bodhisattvas-worshipped-on-the-guan-yin-citta-altar/`
  - `.../eng-altar-setup-guide/3-placement-of-an-altar/`
  - `.../eng-altar-setup-guide/5-things-to-pay-attention-to-when-paying-respect-to-bodhisattva-part-1/`
  - `.../eng-altar-setup-guide/5-things-to-pay-attention-to-when-paying-respect-to-bodhisattva-part-3/`
  - `.../eng-altar-setup-guide/5-things-to-pay-attention-to-when-paying-respect-to-bodhisattva-part-4/`
  - `.../eng-altar-setup-guide/5-things-to-pay-attention-to-when-paying-respect-to-bodhisattva-part-6/`
  - `.../eng-altar-setup-guide/5-things-to-pay-attention-to-when-paying-respect-to-bodhisattva-part-7/`
  - `.../eng-altar-setup-guide/6-1-etiquette-and-taboos-about-an-altar/`
  - `.../eng-altar-setup-guide/6-2-the-procedure-of-setting-up-an-altar/`
  - `.../eng-altar-setup-guide/6-3-basic-procedures-of-paying-respect-to-the-bodhisattvas-on-a-daily-basis/`
  - `.../eng-altar-setup-guide/7-altar-keeping/`
  - `.../8-frequently-asked-questions-regarding-altars/`

### Newly confirmed operational details
- Placement:
  - cua so phong khach hoac phong rieng (neu co) la layout uu tien.
  - huong dat khong quan trong bang boi canh sach-se-trang-nghiem.
  - tranh toilet/bep/giuong doi huong truc tiep.
  - khong dat duoi may lanh thoi truc tiep vao anh/tuong.
  - neu bat kha khang: dung tu co cua/man rem do; dong khi khong dang huong.
- Etiquette:
  - rua tay, trang phuc nghiem tuc, han che noi to.
  - khong hanh le ngay sau toilet (moc 15 phut) hoac sau hanh vi than mat (moc 5 gio) theo source.
  - co danh sach ngay/gio de lap ban tho (mung 1/15 am, buoi sang; uu tien 8h, 10h; tranh mua giong).
- Setup procedure:
  - thu tu tong quat: dat vat pham -> dang den/nhang -> thinh -> le -> phat nguyen -> ta le.
  - co lane dem so mantra/tan xuat (108/21/7...) thuoc `advanced_ritual_reference`.
- Daily altar routine:
  - thay nuoc/trai/hoa truoc huong buoi sang.
  - nhang toi khong qua 22:00.
  - tat den dau truoc khi nhang tat; tat den lotus dien sau nghi le.
- Altar-keeping:
  - trai cay phai rua va boc nhan truoc khi cung.
  - trai hu/hoa heo thay kip thoi.
  - tro nhang, nhang chua chay het can xu ly gon gang.
  - lau anh/tuong bang khan moi, lau nhe khi khong dang nhang.
  - khong dung chat tay rua manh cho mat anh/tuong.
- FAQ index:
  - co nhom cau hoi rieng cho den lotus, di doi ban tho, tam huong khi vang nha, setup ho nguoi khac.

### Canonization recommendation
- Dua cac muc placement/etiquette/daily-routine vao lane `source-backed practical`.
- Giu cac muc 108/21/777 va cac interpretive sign (huong khoi nhang, wick lotus...) o lane `reference_only`.
