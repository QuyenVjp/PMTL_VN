# Ghi Nhận Hướng Nhìn Khi Phóng Sinh — Skyward Gaze Protocol
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 47)
> **Trạng thái:** Advisory + gentle nudge
> **Cập nhật:** 2026-04-06

## Purpose
Tại địa điểm phóng sinh, khi tiến hành thả cá và tụng Kinh, **TUYỆT ĐỐI KHÔNG NÊN nhìn trực tiếp xuống mặt nước**. Tốt nhất phải ngẩng đầu hướng ánh mắt lên bầu trời để niệm, vì vậy năng lượng của lời tụng sẽ hướng lên trời, không bị khuất bởi mặt nước.

## Owner module
`altar-management` — life-liberation energy optimization

## Actors
- User (người phóng sinh)
- App (guidance display)
- Ceremony environment (water, sky)

## Trigger
User bắt đầu `[Bắt Đầu Phóng Sinh]` session

## Business Rules

| Rule | Detail |
|------|--------|
| Gaze Direction | Ngẩng đầu lên bầu trời, KHÔNG nhìn xuống nước |
| Energy Flow | Tụng niệm hướng lên, năng lượng không bị "giữ" bởi mặt nước |
| Advisory | Soft reminder (không hard block) |
| Timing | Suốt quá trình tụng kinh |

## Input Contract

```typescript
interface LifeLiberationSessionDto {
  locationName: string;
  waterType: "FRESHWATER" | "SALTWATER";
  speciesType: "FISH" | "TURTLE" | "SHRIMP" | "CRAB";
  sessionStartTime: Date;
}

interface GazeGuidanceDto {
  isGazingUpward: boolean;
  estimatedGazeDuration_seconds?: number;
}
```

## Write Path

```
POST /altar-management/life-liberation/start-session
  Input: LifeLiberationSessionDto
  → Initialize session
  → Display gaze guidance toast

GET /altar-management/life-liberation/current-guidance
  → Return: { message: "Ngẩng đầu nhìn lên bầu trời. KHÔNG nhìn xuống mặt nước!" }
```

## FE Behavior

```
[Bắt Đầu Phóng Sinh]
  ↓
[Modal hiển thị]
┌───────────────────────────────────┐
│ ⚠️ CẨN TRỌNG - HƯỚNG NHÌN         │
│                                   │
│ 🌤️ Hãy ngẩng đầu nhìn LÊN BẦU    │
│    TRỜI khi tụng niệm.            │
│                                   │
│ ❌ TUYỆT ĐỐI KHÔNG nhìn chăm chú  │
│    xuống mặt nước!                │
│                                   │
│ Năng lượng của lời tụng sẽ hướng  │
│ lên các cõi, không bị khuất.      │
│                                   │
│ [Tôi hiểu - Bắt đầu] [Hủy]      │
└───────────────────────────────────┘

[Tụng Kinh - Đang phóng sinh]
🕯️ Chú Đại Bi... [chữ hiển thị]
[🌤️ Nhớ ngẩng đầu nhìn lên bầu trời!]
```

## Schema Notes

```prisma
model LifeLiberationSession {
  id              String   @id @default(cuid())
  userId          String
  locationName    String
  waterType       String
  speciesType     String
  startTime       DateTime @default(now())
  endTime         DateTime?
  gazeReminders   Int @default(0)  // số lần user được remind
}
```

## Audit
Log mỗi lần gaze reminder được hiển thị

## Error Codes
Không có error codes (advisory chỉ)

## Notes
- Đây là soft advisory, không hard-block behavior
- Mục đích là educate user về energy flow

## Related
- `altar-management/life-liberation-eco-compatibility-check.md` — habitat validation
