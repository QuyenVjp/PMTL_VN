# Content Module

> Ghi chú cho sinh viên:
> Hãy nhớ thật kỹ: content ở repo này chỉ giữ nội dung biên tập và thư viện kinh.
> Bookmark, progress, practice log không thuộc content nữa.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Content Module

## Mục tiêu
- quản lý editorial content đang có thật trong repo
- giữ taxonomy và media linkage rõ ràng
- hỗ trợ publish workflow, public delivery, search source fields
- hỗ trợ `giới thiệu pháp môn`, `sơ học`, hub chính thức, download hub
- hỗ trợ `thư viện ảnh/video pháp môn` như một public surface curated, không chỉ là media upload grid
- hỗ trợ các `feature surface` content-first như `Ngôi Nhà Nhỏ` mà không lẫn với self-state
- không ôm user-state hoặc moderation source-of-truth

## Collections thuộc module

### Editorial documents
- `posts`
- `hubPages`
- `beginnerGuides`
- `downloads`
- `mediaCollections`

### Practice support content
- `chantItems`
- `chantPlans`

### Scripture library
- `sutras`
- `sutraVolumes`
- `sutraChapters`
- `sutraGlossary`

### Taxonomy & media
- `categories`
- `tags`
- `media`
- `mediaCollections` curated refs

## Current responsibilities

### Authoring
- tạo và cập nhật nội dung biên tập
- gắn taxonomy
- liên kết media
- biên tập metadata public

### Publish
- dùng explicit status machine cho workflow gốc
- public delivery dựa trên publish state
- giữ `publishedAt` cho read/search contract (hợp đồng dữ liệu/nghiệp vụ)

### Search source fields
- `contentPlainText`
- `normalizedSearchText`
- các field summary cần cho search và public DTO

### Practice support references
- script kinh/chú
- preset số biến gợi ý
- opening prayer / prayer template
- time rules
- PDF hướng dẫn và ảnh preview
- `Kinh Bài Tập Hằng Ngày` hub, step-by-step guide, scenario presets, FAQ, download companions
- `Little House` guide map, case variants, FAQ, download panels, image compare, version/source notes
- `Phóng Sanh` hub, ritual guides, ritual variants, FAQ, download panels
- `Thư viện pháp môn` hub, media collections, featured playlists/albums

### Audience visibility rule
- current repo chủ yếu public hóa editorial content theo publish state
- nếu collection nào cần `public / members-only / private` sau này, field đó phải nằm trên chính collection owner

### Public identity
- `publicId` cho public/API identity
- `slug` cho public route và SEO khi collection có slug

## References ra ngoài module

### Identity
- author/admin biên soạn refs
- audit actor refs

### Calendar
- `posts.eventContext.relatedEvent` chỉ tham chiếu event
- event ownership không nằm trong content

### Community
- `postComments.post` tham chiếu post
- content không sở hữu comment thread hoặc comment write-path
- content chỉ sở hữu post identity + public read surface mà comment thread bám vào

### Search
- content chỉ sở hữu source fields
- indexing/document lifecycle thuộc search module

## Những gì content không sở hữu
- bookmarks
- reading progress
- practice logs
- moderation reports
- push jobs
- push subscriptions
- request guard / rate-limit state

## Current shape by area (Cấu trúc hiện tại theo từng mảng)

### Posts
- bài viết editorial
- có taxonomy, source metadata, series metadata, related posts
- có search fields và counters phục vụ public read model (mô hình dữ liệu đọc)

### Hub pages
- landing/curation pages
- block-based composition
- curated links tới posts và downloads

### Beginner guides
- tài liệu nhập môn / hướng dẫn thực hành
- thiên về rich educational content hơn bài blog ngắn
- đây là nơi phù hợp cho:
  - `Giới thiệu pháp môn`
  - `Hướng dẫn sơ học`
  - `Bắt đầu công khóa`
  - `Cách lập Phật đài`
  - `Các bước tu học đầu tiên`

### Downloads
- tài nguyên tải về và metadata hiển thị
- có thể liên kết media upload hoặc external URL
- phù hợp làm:
  - `Kinh văn và bản in`
  - `audio/video download hub`
  - resource hub cho người mới và người tu lâu năm

### Official hubs and notices
- `hubPages` nên giữ:
  - giới thiệu pháp môn
  - sơ đồ bắt đầu học
  - chuyên đề download
  - thông báo chính thức hoặc hub điều hướng
- `Kinh Bài Tập Hằng Ngày` hub và grouped landing pages
- `Ngôi Nhà Nhỏ` hub và grouped landing pages
- `Phóng Sanh` hub và ritual detail pages
- `Thư viện pháp môn` hub và collection detail pages

### Practice support
- `chantItems` là owner của bài niệm / chú / script / audio / preview image
- `chantPlans` là owner của plan công khóa hoặc nghi thức
- các tài liệu như niệm hằng ngày, thắp tâm hương, phát nguyện, phóng sinh, Ngôi Nhà Nhỏ nên map vào lớp này hoặc vào `downloads` / `beginnerGuides`
- `practice-support-reference.md` là file nối giữa PDF thực tế và content model
- `Kinh Bài Tập Hằng Ngày` là first-class content surface:
  - `hubPages` giữ hub và group landing
  - `beginnerGuides` giữ step guides, lưu ý, FAQ, scenario pages
  - `downloads` giữ PDF companion, sách kinh, checklist in ra
- `Phóng Sanh` là first-class content surface:
  - `hubPages` giữ hub và route pillar
  - `beginnerGuides` giữ nghi thức, variant pages, FAQ-style pages
  - `downloads` giữ PDF nghi thức, checklist và card mẫu khấn
- `Ngôi Nhà Nhỏ` là first-class content surface:
  - `hubPages` giữ hub và group landing
  - `beginnerGuides` giữ guide detail, FAQ-style longform, image-rich instruction pages
  - `downloads` giữ mẫu in, PDF, assets tải xuống
- `Thư viện pháp môn` là first-class content surface:
  - `hubPages` giữ hub `/thu-vien/phap-mon`
  - `mediaCollections` giữ photo albums, video playlists, mixed galleries
  - `media_assets` vẫn chỉ là asset-level owner, không thay collection owner

### Sutra library
- `sutras` là root document
- `sutraVolumes` và `sutraChapters` tạo reading tree
- `sutraGlossary` gắn term-level context vào sutra tree

## Key actors
- `admin`
- `super-admin`
- `member`
- `guest`

## Current rules (Quy tắc hiện tại)
- published content mới được public cache/index
- search source fields nằm trên owner document
- content model split collections, không dùng single mega-table
- audience visibility không được hardcode ngoài owner collection
- user-state phải nằm ngoài content
- practice support content là public/editorial reference data, không phải user-state
- `chantPlans` là editorial/practice reference data; việc user chọn, theo, hoặc hoàn thành plan thuộc user-state module khác
- `giới thiệu pháp môn` và `sơ học` là first-class content surface, không phải chỉ là vài post rời rạc
- search source fields là content-owned because they describe editorial documents; bookmark/progress/practice projections không vì thế mà chuyển ownership vào content
