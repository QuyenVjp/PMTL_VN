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
- không ôm user-state hoặc moderation source-of-truth

## Collections thuộc module

### Editorial documents
- `posts`
- `hubPages`
- `beginnerGuides`
- `downloads`

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

## Current responsibilities

### Authoring
- tạo và cập nhật nội dung biên tập
- gắn taxonomy
- liên kết media
- biên tập metadata public

### Publish
- dùng Payload drafts cho workflow gốc
- public delivery dựa trên publish state
- giữ `publishedAt` cho read/search contract

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

### Audience visibility rule
- current repo chủ yếu public hóa editorial content theo publish state
- nếu collection nào cần `public / members-only / private` sau này, field đó phải nằm trên chính collection owner

### Public identity
- `publicId` cho public/API identity
- `slug` cho public route và SEO khi collection có slug

## References ra ngoài module

### Identity
- author/editor refs
- audit actor refs

### Calendar
- `posts.eventContext.relatedEvent` chỉ tham chiếu event
- event ownership không nằm trong content

### Community
- `postComments.post` tham chiếu post
- content không sở hữu comment thread

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

## Current shape by area

### Posts
- bài viết editorial
- có taxonomy, source metadata, series metadata, related posts
- có search fields và counters phục vụ public read model

### Hub pages
- landing/curation pages
- block-based composition
- curated links tới posts và downloads

### Beginner guides
- tài liệu nhập môn / hướng dẫn thực hành
- thiên về rich educational content hơn bài blog ngắn

### Downloads
- tài nguyên tải về và metadata hiển thị
- có thể liên kết media upload hoặc external URL

### Practice support
- `chantItems` là owner của bài niệm / chú / script / audio / preview image
- `chantPlans` là owner của plan công khóa hoặc nghi thức
- các tài liệu như niệm hằng ngày, thắp tâm hương, phát nguyện, phóng sinh, Ngôi Nhà Nhỏ nên map vào lớp này hoặc vào `downloads` / `beginnerGuides`
- `practice-support-reference.md` là file nối giữa PDF thực tế và content model

### Sutra library
- `sutras` là root document
- `sutraVolumes` và `sutraChapters` tạo reading tree
- `sutraGlossary` gắn term-level context vào sutra tree

## Key actors
- `editor`
- `admin`
- `member`
- `guest`

## Current rules
- published content mới được public cache/index
- search source fields nằm trên owner document
- content model split collections, không dùng single mega-table
- audience visibility không được hardcode ngoài owner collection
- user-state phải nằm ngoài content
- practice support content là public/editorial reference data, không phải user-state
