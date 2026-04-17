# LINE Alert — Setup Guide

เชื่อม **TradingView Alert → LINE Webhook Proxy → LINE Group**
สำหรับ indicator `LOSTXKER Signal`

---

## Architecture

```
TradingView (Pine alert)
     │   POST JSON
     ▼
Vercel: /api/trading-alert
     │   LINE Messaging API (push)
     ▼
LINE Group
```

---

## 1) Deploy Webhook (ฝั่ง Vercel)

ที่ repo `[line-webhook-proxy](https://github.com/LOSTXKER/line-webhook-proxy)`:

1. คัดลอก `webhook/line-trading-alert/route.ts` (ในโปรเจกต์นี้) ไปวางที่
  `src/app/api/trading-alert/route.ts` ของ repo นั้น
2. ตั้งค่า **Environment Variables** ใน Vercel:
  - `LINE_CHANNEL_ACCESS_TOKEN` (มีอยู่แล้ว)
  - `LINE_TRADING_GROUP_ID` — Group ID ของกลุ่ม LINE
  (พิมพ์ `group id` ในกลุ่มเพื่อดู หรือดูจาก webhook log)
3. `git push` → Vercel deploy อัตโนมัติ
4. ทดสอบ health:
  ```
   GET https://line-webhook-proxy-one.vercel.app/api/trading-alert
   → { "status": "ok", "configured": true }
  ```

---

## 2) ตั้ง Alert ใน TradingView

เปิดกราฟ → Add Indicator: **LOSTXKER Signal**
กด **Alert (⏰)** → เลือก:


| ช่อง       | ค่า                                             |
| ---------- | ----------------------------------------------- |
| Condition  | `LOSTXKER Signal` → `Any alert() function call` |
| Expiration | Open-ended                                      |
| Alert name | `LX M5 Signal`                                  |


**Notifications tab:**


| ช่อง          | ค่า                                                                  |
| ------------- | -------------------------------------------------------------------- |
| Webhook URL ✅ | `https://line-webhook-proxy-one.vercel.app/api/trading-alert`        |
| Message       | `{{strategy.order.alert_message}}` (ปล่อยเฉย ๆ ได้ — Pine คุมเองหมด) |


> ช่อง Message ไม่ต้องกรอก เพราะ `alert()` ใน Pine ส่ง JSON payload มาเอง
> (แม้ใส่ก็ถูก override โดย message จาก `alert()`)

---

## 3) Pine Script ส่งอะไร

ทุกสัญญาณส่ง JSON ตามนี้:

```json
{
  "type":  "NOT_CONFIRM" | "CONFIRMED",
  "dir":   "BULL" | "BEAR",
  "pair":  "EURUSD",
  "tf":    "5",
  "price": "1.08523",
  "time":  "14:30"
}
```

### เวลา Fire


| Event                | เวลา trigger                | alert.freq           |
| -------------------- | --------------------------- | -------------------- |
| `NOT_CONFIRM` (ไว)   | ระหว่างแท่งวิ่ง (real-time) | `once_per_bar`       |
| `CONFIRMED` (ยืนยัน) | เมื่อแท่งปิด                | `once_per_bar_close` |


→ ต่อ 1 สัญญาณจริงจะได้ LINE ประมาณ 2 ข้อความ (ไว + ยืนยัน)

---

## 4) หน้าตาข้อความใน LINE

**Not Confirm:**

```
(Not confirm) GBPUSD ⏰ 00:45 🔴
⏳ รอแท่งปิดยืนยัน
```

**Confirmed:**

```
(Confirmed) GBPUSD ⏰ 00:50 🔴
✅ เตรียมหาจุดเข้า M15/M5
```

> One-liner style ตามต้นฉบับ + บรรทัด CTA
> 🟢 = BULL / Buy · 🔴 = BEAR / Sell

---

## 5) Troubleshooting


| อาการ                                | เช็ค                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| ไม่มี LINE เลย                       | Vercel Function Logs — ดูว่า request เข้ามาจริงมั้ย                                |
| Request เข้าแต่ LINE ไม่ส่ง          | `LINE_CHANNEL_ACCESS_TOKEN` หรือ `LINE_TRADING_GROUP_ID` ผิด                       |
| ข้อความเป็น `pair: {...raw JSON...}` | TradingView ใส่ placeholder ทับ message ของ Pine → ลบ Message ใน Notifications tab |
| ซ้ำซ้อน                              | Alert ซ้ำกัน — ลบ alert เก่าให้เหลือตัวเดียว                                       |
| Time ผิดโซน                          | Pine ใช้ `Time zone UTC+` ใน group "ALERT TIME" (default = 7 BKK)                  |


---

## 6) Rate Limit

- **LINE Messaging API**: 500 msgs/month ฟรี (ต่อ OA), Push ต่อวินาทีได้หลายร้อย
- **TradingView**: 1 alert / free plan, 10+ / Pro+
- สัญญาณ M5 ปกติจะออก 2–8 ครั้ง/วัน → ปลอดภัย

