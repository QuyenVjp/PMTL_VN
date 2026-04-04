# Hàng rào Động tác Vật lý của "Tâm Hương" — Heart Incense Physical Restraint

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Thắp Tâm Hương (khi đi xa, không có bàn thờ) là hành động kết nối Tâm linh với Bồ Tát bằng quán tưởng. **TUYỆT ĐỐI KHÔNG được làm bất kỳ động tác vật lý nào** — không quỳ lạy, không cầm nhang thật, không cắm nhang vào không khí hay màn hình. Tất cả chỉ được tưởng tượng trong đầu. Nếu vi phạm, sẽ thu hút ngạ quỷ, vong linh bám theo và xin Kinh.

---

## Owner module

`content` — HeartIncenseService / PhysicalRestraintValidator

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User activate [Thắp Tâm Hương] | ✅ Show RED warning modal |
| Modal warns: KHÔNG quỳ, KHÔNG cầm nhang thật | ✅ Require explicit checkbox |
| User checks acknowledgement | ✅ Allow proceed to visualization |
| During session | ✅ Auto-display Heart Incense Dharani text |
| End of session | ✅ Force 7x "True Words to Eliminate Disasters" recitation |
| Complete 7x | ✅ Finalize session |

---

## FE Behavior

```
[Thắp Tâm Hương] button

Click → RED WARNING MODAL:

🚨 CẢNH BÁO CỰC QUAN TRỌNG

TUYỆT ĐỐI KHÔNG làm bất kỳ
động tác vật lý nào:
  ❌ KHÔNG quỳ lạy
  ❌ KHÔNG cầm nhang thật
  ❌ KHÔNG cắm nhang vào không khí
  ❌ KHÔNG cắm nhang vào màn hình

✅ Tất cả động tác chỉ trong ĐẦU

Bạn cam kết:
[ ] Tôi hiểu và cam kết chỉ
    tưởng tượng, không làm động tác vật lý

[Quay lại]  [Tiếp tục] (disabled until checked)

---

After proceeding:

Visualization session starts
(Display Heart Incense Dharani text)
User mentally performs ritual

At end:
"Hoàn thành quán tưởng. Hãy niệm
Thất Phật Diệt Tội Chân Ngôn (Seven
Buddhas Disaster-Eliminating Mantra)
7 lần trước khi kết thúc:"

[Log 7x recitation]

[Hoàn thành] (enabled only after 7/7)
```

---

## Audit

| Action | Trigger |
|---|---|
| `heart_incense.started` | User begin session |
| `heart_incense.physical_restraint_acknowledged` | User confirm no physical actions |
| `heart_incense.final_mantra_recited` | Logged 7x disaster-eliminating mantra |
| `heart_incense.session_completed` | Session finalized |

---

## Notes

Hard physical constraint preventing ghost/spirit attraction through improper ritual execution.