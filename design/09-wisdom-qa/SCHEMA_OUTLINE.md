# Wisdom & QA Schema Outline

## Owner module
- `09-wisdom-qa`

## Collection candidate 1: `wisdomEntries`

### Purpose
- entry đọc/nghe cho `Bạch thoại Phật pháp`, khai thị, bài học trọng yếu

### Core fields
- `id`
- `publicId`
- `sourceUrl`
- `sourceType`
  - `baihua`
  - `kaishi`
  - `program_audio`
  - `program_video`
- `sourceLanguage`
- `titleOriginal`
- `titleVietnamese`
- `summaryVietnamese`
- `bodyOriginal`
- `bodyVietnamese`
- `audioRef`
- `videoRef`
- `topicTags`
- `speaker`
- `publishedAt`
- `isOfficial`

## Collection candidate 2: `qaEntries`

### Purpose
- đoạn hoặc bài hỏi đáp đã được chuẩn hóa để retrieval

### Core fields
- `id`
- `publicId`
- `sourceUrl`
- `qaType`
  - `metaphysics_qa`
  - `buddhist_qa`
- `questionOriginal`
- `questionVietnamese`
- `answerOriginal`
- `answerVietnamese`
- `problemTags`
- `keywordAliases`
- `topicTags`
- `speaker`
- `publishedAt`
- `isOfficial`

## Collection candidate 3: `offlineBundles`

### Purpose
- lưu metadata gói offline theo user/device

### Core fields
- `id`
- `user`
- `bundleType`
  - `baihua_series`
  - `qa_favorites`
  - `night_reading_pack`
- `version`
- `entryRefs`
- `downloadedAt`
- `lastSyncedAt`
- `deviceKey`

## Service boundary

- `wisdom.service.ts`
  - normalize source metadata
  - map bilingual reading model
  - offline bundle build
- `qa.service.ts`
  - keyword normalization
  - retrieval prep
  - answer excerpt mapping

## Notes for AI/codegen

- Đây là retrieval/content-serving schema.
- Không để AI-generated answer trở thành canonical row.
