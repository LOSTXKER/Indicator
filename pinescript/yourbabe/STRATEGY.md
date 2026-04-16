# YOUR BABE Trading System — Reverse Engineering Notes

> แกะจากภาพ indicator settings + class notes (Day 1-4) + คำอธิบายจากผู้เรียน

---

## ภาพรวมระบบ

ใช้ **3 indicators** บน TradingView เปิด **2 จอพร้อมกัน** (M5 + M15)


| Indicator | ชื่อ                     | ประเภท                | หน้าที่หลัก                                                |
| --------- | ------------------------ | --------------------- | ---------------------------------------------------------- |
| 1         | Yourbabe's EMA 1.3.3     | Overlay (บนชาร์ต)     | EMA 6 เส้น + Sessions + AOF + HTF Background               |
| 2         | YOUR BABEs Indicator 2.2 | Oscillator (แยก pane) | TDI-based Sentiment/Price + Mountain fills                 |
| 3         | YOUR BABE 5.4            | Overlay (บนชาร์ต)     | สัญญาณ Buy/Sell + Dashboard Checklist + Bar Color + Alerts |


---

## กลยุทธ์: EMA Pullback Break Retest V-Shape

### Flow การเทรด

1. **Alert จาก Discord (M5)** → `(Not confirm) US30 ⏱️20:55 🟢` → รอแท่งปิด
2. **ดู M15** → มีแท่งเทียน **Break ออกจาก Pattern** (flag/wedge) ไหม? → ข้อ 1
3. **ดู M15** → **Fair Price** ราคาอยู่ใกล้ EMA 14/60 ไหม? → ข้อ 2
4. **ดู M5** → ราคา **Pullback มาที่ Fibo 38/50/61** พร้อมสัญญาณไหม? → ข้อ 3
5. **ดู M5** → สัญญาณเป็น **V-Shape** ไหม? → ข้อ 4
6. ผ่านครบ → **เข้าเทรด**

### Checklist (จาก Day 4 notes)

```
NC (Not Confirmed) → ตรวจ:
  1. BVS        — Best V Shape (ดูเอง จาก price action)
  2. Pattern    — Flag / Wedge / Pennant
  3. MOM        — Momentum bar
  4. Fair Price — ราคาใกล้ EMA
  5. Fibo       — Pullback ถึง Fibo zone

CF (Confirmed) → Entry
```

---

## Indicator 1: Yourbabe's EMA 1.3.3

### EMA Settings


| เส้น   | TF         | สี (ประมาณ) | หน้าที่         |
| ------ | ---------- | ----------- | --------------- |
| EMA 8  | Current TF | ส้ม (บาง)   | Momentum line   |
| EMA 14 | Current TF | ขาว (บาง)   | Dynamic S/R     |
| EMA 60 | Current TF | ฟ้า (บาง)   | Trend line      |
| EMA 8  | HTF        | ส้ม (หนา)   | HTF Momentum    |
| EMA 14 | HTF        | ขาว (หนา)   | HTF Dynamic S/R |
| EMA 60 | HTF        | ฟ้า (หนา)   | HTF Trend       |


### EMA Meaning (Day 1)

- EMA ใช้ทำอะไร:
  1. บอกค่าเฉลี่ยของราคา
  2. บอกแนวรับ-บ้าน Dynamic
  3. บอก Trend
- **EMA 8 ตัด 14 = Momentum signal**
- **EMA 14 ตัด 60 = Trend signal**

### TF Structure

- **M5** = EMA 8, 14, 60 ของ M5 **+ EMA 60 จาก M15**
- **M15** = EMA 8, 14, 60 ของ M15

### HTF Auto-detect (ประมาณ)


| Current TF | HTF |
| ---------- | --- |
| M1         | M5  |
| M5         | M15 |
| M15        | H1  |
| H1         | H4  |
| H4         | D   |


### Entry Conditions ตาม EMA (Day 1)

**M5:**

- Buy: EMA 8, 14, 60 ต้อง **Cross ขึ้น** ทั้งหมด
- Sell: EMA 8, 14, 60 ต้อง **Cross ลง** ทั้งหมด

**M15:**

- Buy: EMA 8, 14 ต้อง **Cross ขึ้น** + **EMA 60 ไม่ขวาง** (อยู่ใต้ราคา)
- Sell: EMA 8, 14 ต้อง **Cross ลง** + **EMA 60 ไม่ขวาง** (อยู่เหนือราคา)

### EMA HTF Background

- **สีเขียว (transparency ~88)**: EMA 8 > 14 > 60 (HTF bullish alignment)
- **สีม่วง (transparency ~88)**: EMA 8 < 14 < 60 (HTF bearish alignment)
- ไม่แสดง: EMAs ไม่เรียงตัว

### AOF (Area of Flow)

- Range time: **11 ชั่วโมง** (ค่าเริ่มต้น)
- Shift: **-5** (เลื่อนกล่อง)
- แสดงเป็น **กล่อง (box)** ของกรอบราคา High-Low ในช่วงเวลาที่กำหนด

### Sessions (UTC+7)


| Session  | เวลา          | สี (ประมาณ) |
| -------- | ------------- | ----------- |
| Tokyo    | 05:00 - 14:00 | น้ำเงินเข้ม |
| London   | 14:00 - 00:00 | ส้ม/ทอง     |
| New York | 19:00 - 05:00 | แดงเข้ม     |


- **Session Label**: ป้ายชื่อ session
- **Server Close Mark**: เส้นแนวตั้งตอน server ปิด + รองรับ Daylight Saving
- **Bar back**: 500 แท่ง (จำนวนแท่งที่แสดง marks ย้อนหลัง)

---

## Indicator 2: YOUR BABEs Indicator 2.2 (Yourbabe)

### คำศัพท์ Yourbabe (ยืนยันจากคลิป)

- **"Yourbabe"** = Indicator ที่อยู่ข้างล่าง (oscillator pane) — ใช้เรียกรวมทั้ง indicator
- **"เส้นราคา" (Price Line)** = เอาราคากราฟ (close price) มาอยู่เป็นเส้น — เหมือนโหมดเส้นใน TradingView แต่ผ่านสูตร RSI เพื่อแปลงค่าเป็น 0-100 (ทิศทางเดียวกับราคา: ราคาขึ้นเส้นก็ขึ้น ราคาลงเส้นก็ลง)
- **"เส้นค่าเฉลี่ย" (Sentiment Line)** = ค่าเฉลี่ยของเส้นราคา (เอา RSI มาทำ SMA อีกที)
- **ราคาตัดขึ้น** (Price ตัด Sentiment ขึ้น) = **สีเขียว** ใน Mountain fills
- **ราคาตัดลง** (Price ตัด Sentiment ลง) = **สีแดง** ใน Mountain fills

### พื้นฐาน

เบื้องหลังคือ TDI (Traders Dynamic Index) — เอา **close price** ไปผ่าน RSI แล้วแสดงเป็นเส้นในช่วง 0-100
อาจารย์อธิบายว่า "เอาเส้นราคามาอยู่ใน Yourbabe" ซึ่งถูกใน concept เพราะ RSI สะท้อนทิศทางราคาโดยตรง

### เส้นหลัก


| ชื่อใน Indicator    | คำที่อาจารย์ใช้ | คำอธิบาย       | เบื้องหลัง (สูตร)                   |
| ------------------- | --------------- | -------------- | ----------------------------------- |
| **Price** (ราคา)    | เส้นราคา        | Fast line      | RSI ของ close price (ค่า 0-100)     |
| **Sentiment 1**     | เส้นค่าเฉลี่ย   | Slow line หลัก | SMA(RSI, 9) — ค่าเฉลี่ยของเส้นราคา  |
| **Sentiment 2**     | —               | Slow line กลาง | MA ของ RSI (period เช่น 14)         |
| **Sentiment 3**     | —               | Slow line ช้า  | MA ของ RSI (period เช่น 21)         |
| **Middle of Bands** | เส้นกลาง        | เส้นกลาง BB    | Midpoint ของ Bollinger Bands บน RSI |


### สัญญาณจาก Oscillator — แยกตาม TF (ยืนยันจากคลิป)

#### M15 — ใช้ 2 เส้นหลัก

เส้นที่แสดง: **เส้นราคา** + **เส้นค่าเฉลี่ย (Sentiment)**

**Buy Signal (M15):**

1. EMA 8, 14, 60 Crossover
2. **Price ตัด Sentiment ขึ้น** + **Sentiment อยู่เหนือเส้นกลาง (Middle of Bands)**

**Sell Signal (M15):**

1. EMA 8, 14, 60 Crossunder
2. **Price ตัด Sentiment ลง** + **Sentiment อยู่ใต้เส้นกลาง**

#### M5 — เพิ่ม "รวบเส้น" อีก 3 เส้น

เส้นที่แสดง: **เส้นราคา** + **เส้นค่าเฉลี่ย (Sentiment)** + **รวบเส้น (3 เส้น sentiment เพิ่มเติม)**

- **รวบเส้น** = 3 เส้น sentiment ที่ period ต่างกัน — มองดูเหมือนเส้นเดียวเพราะค่าใกล้กัน
- Period: **6, 7, 8** (ทดลองจนใกล้เคียงต้นฉบับ — 3 เส้นเกาะกันเป็นกลุ่มเดียว)

**สีของเส้นใน M5 (ยืนยันจากคลิป):**


| เส้น         | สี        | เงื่อนไข                                       |
| ------------ | --------- | ---------------------------------------------- |
| **เส้นกลาง** | **ส้ม**   | เส้นราคาอยู่ **ต่ำกว่า** เส้นกลาง              |
| **เส้นกลาง** | **ม่วง**  | เส้นราคาอยู่ **เหนือ** เส้นกลาง                |
| **เส้นราคา** | **เขียว** | ตัดรวบเส้น **ขึ้น** (แค่โดนเส้นเดียวก็เปลี่ยน) |
| **เส้นราคา** | **แดง**   | ตัดรวบเส้น **ลง** (แค่โดนเส้นเดียวก็เปลี่ยน)   |


**Buy Signal (M5):**

1. EMA 8, 14, 60 ตัดขึ้น
2. **Price ตัด รวบเส้น ขึ้น** + **รวบเส้น อยู่เหนือ Sentiment**

**Sell Signal (M5):**

1. EMA 8, 14, 60 ตัดลง
2. **Price ตัด รวบเส้น ลง** + **รวบเส้น อยู่ใต้ Sentiment**

> M5 ต่างจาก M15 ตรงที่: มี **รวบเส้น** (3 เส้นราคาเพิ่ม) เข้ามาเป็นเงื่อนไข — เช็ค Price ตัดรวบเส้น + ตำแหน่งรวบเส้นเทียบกับ Sentiment

### Mountain Fills

- **Mountain CG candle**: ตัวหลัก (Center of Gravity / แกนกลาง)
- **Mountain Surface Outside candle**: พื้นผิวด้านนอก
- **Mountain Surface Inside candle**: พื้นผิวด้านใน
- สร้างรูป "ภูเขา" ระหว่าง Price กับ Sentiment lines
- สี: เขียว (Price > Sentiment) / แดง (Price < Sentiment) / ส้ม (transition)

### M15 Cross-Timeframe

> ⚠️ ยืนยันจากคลิป: **ไม่มีการดึง M15 มาแสดงบน M5** — settings เหล่านี้อาจเป็น feature ที่ปิดอยู่หรือใช้บน TF อื่น

- **Sentiment (M15)**: ดึง Sentiment จาก M15 มาแสดง (อาจปิดอยู่)
- **Price (M15)**: ดึง Price จาก M15 มาแสดง (อาจปิดอยู่)
- **Mountain Surface candle (M15)**: ภูเขาของ M15 (อาจปิดอยู่)

### Settings อื่นๆ

- **Sentiment Background Toggle**: พื้นหลังตาม Sentiment direction
- **Old version Toggle**: สลับไปใช้สูตรเก่า
- **Position Signal**: ตำแหน่ง signal shape (Top / Bottom)

---

## Indicator 3: YOUR BABE Signal

### สัญญาณ Buy/Sell — แยกตาม TF (ยืนยันจากคลิป + Rebuild)

> Signal logic ต่างกันระหว่าง M5 กับ M15 — implement ใน `yourbabe-signal.pine`

**M15 Buy Signal:**

1. EMA 8 > 14 > 60 (aligned bullish)
2. Price ตัด Sentiment ขึ้น + Sentiment > Middle Band

**M15 Sell Signal:** กระจกของ Buy

**M5 Buy Signal:**

1. EMA 8 > 14 > 60 (aligned bullish)
2. Price ตัดรวบเส้น (sentiment group) ขึ้น + รวบเส้น > Sentiment

**M5 Sell Signal:** กระจกของ Buy

**Filters (Toggle ได้ทั้งหมด):**

- **Powerful Mode** — ต้องมี momentum candle (body > avg body × 1.5) ถึงจะแสดง signal หลัก
- **Powerful Minimal Display** — ถ้าเปิด + ไม่ powerful → แสดง signal เบา (diamond)
- **Fair Price** — ราคาต้องใกล้ EMA 14 (< ATR×2) หรือ EMA 60 (< ATR×3)
- **V-Shape Line Checking** — ต้องมี V-Shape reversal ใน lookback period (default 60 bars) — แยก Buy/Sell
- **Flat EMA Detect** — ตรวจ EMA slope แบน: OFF / ON-Hide (ซ่อน signal) / ON-Short / ON-Long (threshold ต่างกัน)
- **Flat EMA Minimal Signal** — ตอน Flat EMA แต่ filter อื่นผ่าน → แสดง signal เบา (triangle)

### Not Confirm / Confirmed

- **ระหว่างแท่งเทียนยังไม่ปิด** (`barstate.isconfirmed == false`):
  - เงื่อนไขเข้าเกณฑ์ → `(Not confirm) SYMBOL ⏱️HH:MM 🟢/🔴`
- **แท่งเทียนปิดแล้ว** (`barstate.isconfirmed == true`):
  - เงื่อนไขยังเข้า → `(Confirmed) SYMBOL ⏱️HH:MM 🟢/🔴`
- 🟢 = Buy, 🔴 = Sell

### Bar Color — เฉพาะ M15 เท่านั้น (ยืนยันจากคลิป: M5 ไม่มีสีแท่งเทียน)

มีแค่ **3 สี** เท่านั้น (ยืนยันจากคลิป — ไม่มี Blue, Cyan, Orange, Gray)


| สี                  | เงื่อนไข                                                       | ความหมาย           |
| ------------------- | -------------------------------------------------------------- | ------------------ |
| **เขียว (Green)**   | EMA 8/14 ตัดกันขึ้น **+** Yourbabe ตัดขึ้น (ทิศเดียวกัน)       | Bullish Momentum   |
| **แดง (Red)**       | EMA 8/14 ตัดกันลง **+** Yourbabe ตัดลง (ทิศเดียวกัน)           | Bearish Momentum   |
| **เหลือง (Yellow)** | EMA ตัด**ก่อน** + Yourbabe ตัด**ทิศตรงข้าม** (ดูตารางด้านล่าง) | **Divergence!**    |
| *(ไม่มีสี)*         | ไม่เข้าเงื่อนไขด้านบน                                          | สีปกติของแท่งเทียน |


### Yellow Bar — Divergence (ยืนยันจากคลิป)

สำคัญมาก: **EMA ต้องตัดก่อน Yourbabe** (ลำดับเวลาสำคัญ)


| Yellow Side | เงื่อนไข                                     |
| ----------- | -------------------------------------------- |
| ฝั่งขาขึ้น  | EMA 8/14 ตัดกัน**ขึ้น** + Yourbabe ตัด**ลง** |
| ฝั่งขาลง    | EMA 8/14 ตัดกัน**ลง** + Yourbabe ตัด**ขึ้น** |


= EMA กับ Yourbabe ขัดกัน = **สัญญาณเตือน Divergence**

### Momentum Bar (Day 1 + ยืนยันจากคลิป)

- **Momentum bar เกิดจาก**: EMA 8/14 ตัดกัน **+** Yourbabe ตัด (ทิศเดียวกัน)
  - ขาขึ้น: EMA 8/14 ตัดขึ้น + Yourbabe ตัดขึ้น → แท่งเขียว (= Green bar)
  - ขาลง: EMA 8/14 ตัดลง + Yourbabe ตัดลง → แท่งแดง (= Red bar)
- Momentum ที่สนใจ **ต้องอยู่ในชุดที่ Break Speed line เท่านั้น**
- เงื่อนไข:
  1. MOM ชุดก่อนหน้าโดนทำลาย (previous momentum set broken)
  2. อาจทำให้เกิด New High/Low

### Dashboard Checklist (แสดงเฉพาะ M15)

แสดงเป็นตาราง ✅/❌ ตรวจ 5 เงื่อนไข:


| #   | เงื่อนไข               | วิธีตรวจ (ประมาณ)                                      |
| --- | ---------------------- | ------------------------------------------------------ |
| 1   | **BVS** (Best V Shape) | ดูเองจาก price action — ราคาทำ V-Shape reversal        |
| 2   | **Pattern**            | มี consolidation / flag / wedge (ยากที่จะ auto-detect) |
| 3   | **MOM** (Momentum)     | มี Momentum bar ล่าสุด                                 |
| 4   | **Fair Price**         | ราคาอยู่ใกล้ EMA 14 หรือ 60                            |
| 5   | **Fibo**               | ราคาอยู่ใน Fibo zone 38-61 (ประมาณ)                    |


### V-Shape Line Checking

- **Toggle**: เปิด/ปิด
- **ค่า**: 60 (น่าจะเป็น lookback bars)
- ตรวจจับ V-Shape = ราคาร่วงแล้วกลับตัวเร็ว (sharp reversal) ใน Price Action

### Flat EMA Detect

- **ON - Short**: ตรวจจับ EMA แบน (sideway)
- วิธีตรวจ (ประมาณ): slope ของ EMA ต่ำกว่า threshold / EMA 8 กับ 14 ชิดกัน
- เมื่อ Flat EMA → **ไม่ส่งสัญญาณ** (หลีกเลี่ยง sideway)

### Flat EMA Minimal Signal

- เมื่อ Flat EMA แต่ยังมีเงื่อนไขอื่นผ่าน → แสดง signal แบบ minimal

### Powerful Mode

- กรอง signal เข้มขึ้น (ประมาณ: ต้องมี momentum แรงกว่าปกติ)

### Minimal Signal

- แสดงสัญญาณน้อยลง กรองเฉพาะที่มั่นใจสูง

### HTF Candle Display

- แสดงแท่งเทียนจาก TF สูง overlay บนชาร์ต
- Settings: จำนวนแท่ง, สี body/border/wick, ระยะห่าง, ความกว้าง
- **Initialize Time**: 5 วินาที (delay ก่อนวาด)
- **Candle**: 10 แท่ง
- **Distance of Display**: 10
- **Space Between Candle**: 1
- **Candle Width**: 1

### Alert Settings

- **Alert Mode**: ทั้งคู่ (ส่งทั้ง Buy + Sell)
- **Specific Time Alert**: เปิด/ปิด
- **Timezone**: UTC+7
- **Start Time**: 07:30
- **End Time**: 01:00
- ส่ง alert เฉพาะในช่วง Tokyo-London-NY session

### MOM Paint

- ระบายสี Momentum bar บนชาร์ต
- **MOM Theme Color**: ค่าเริ่มต้น

---

## Fibonacci Rules (Day 4)

### Levels ที่ใช้

**Retracement:** 0.382, 0.5, 0.618, 0.786, 0.886

**Extension:** 1.618, 1.702, 1.816

### การลาก Fibo (Manual)

- **ขาขึ้น**: ลากจาก **Low ของ Swing ล่าสุดที่แตะ Speed line** → ไปยัง **High**
- **ขาลง**: ลากจาก **High ของ Swing ล่าสุดที่แตะ Speed line** → ไปยัง **Low**

### กฎห้ามเทรด


| เงื่อนไข                     | ผล                             |
| ---------------------------- | ------------------------------ |
| ย่อถึง **88.6%**             | ❌ ไม่เทรด (pullback ลึกเกินไป) |
| **ไส้ (wick) ทะลุ 2 levels** | ❌ ไม่เทรด (volatile เกินไป)    |
| **หัว (body) ทะลุ level 0**  | ❌ ไม่เทรด (trend หัก)          |


---

## Patterns (Day 2)

### ประเภท Pattern

- **Bull Flag / Bear Flag**: ใช้เวลา 50 นาที - 3 ชั่วโมง
- **Pennant / Falling Wedge**: ใช้เวลาสั้นกว่า (~5 นาที+)
- **Rising Wedge / Falling Wedge**

### กฎ Pattern

- ราคาต้องย่อ **ไม่ถึงจุด Speed line** (ไม่ทะลุ trendline ของ pattern)
- ถ้าแท่งเทียนทะลุ Speed line = **ไม่เทรด** (Over-extended)

---

## สิ่งที่ยังไม่แน่ใจ (ต้องดูคลิปเพิ่ม)


| หัวข้อ                                | สถานะ           | หมายเหตุ                                                         |
| ------------------------------------- | --------------- | ---------------------------------------------------------------- |
| Bar Color M15                         | ✅ ยืนยันจากคลิป | มีแค่ 3 สี: Green, Red, Yellow — **ไม่มี** Blue/Cyan/Orange/Gray |
| M5 vs M15 แสดงผลต่างกันอย่างไร        | ✅ ยืนยันจากคลิป | M5 มี รวบเส้น + ไม่มีสีแท่ง / M15 มีสีแท่ง + ไม่มีรวบเส้น        |
| M5 Bar Color                          | ✅ ยืนยันจากคลิป | **M5 ไม่มีสีแท่งเทียน** — Bar Color ใช้เฉพาะ M15                 |
| M15 data ดึงมาแสดงบน M5               | ✅ ยืนยันจากคลิป | **ไม่มี** — ไม่ได้ดึง M15 sentiment มาแสดง                       |
| เส้นม่วงใน Yourbabe oscillator        | ✅ ยืนยันจากคลิป | คือ **เส้นกลาง (Middle Band)** ตอนราคาอยู่เหนือ                  |
| รวบเส้น คือ period อะไรบ้าง           | ✅ ทดลองแล้ว     | 3 เส้น sentiment period **6, 7, 8** — ใกล้เคียงต้นฉบับมากที่สุด  |
| Momentum Candle เงื่อนไขแน่ชัด        | ❓ ประมาณ        | น่าจะ body ใหญ่ + volume                                         |
| Powerful Mode logic                   | ❓ ประมาณ        | น่าจะ filter เข้มขึ้น                                            |
| "Old version Toggle" ใน Indicator 2.2 | ❓ ไม่ทราบ       | สูตรเก่า vs ใหม่                                                 |
| Speed line คืออะไรแน่                 | ✅ ยืนยันแล้ว    | **เส้น trendline ของ pattern ที่ลากเอง** (ไม่ใช่ EMA)            |
| Mountain CG สูตรแน่ชัด                | ❓ ประมาณ        | น่าจะ Center of Gravity ของ RSI                                  |
| TDI parameters ที่แน่นอน              | ✅ แก้แล้ว       | **RSI 13 / Band 31 / Fast 1 / Slow 9** (จาก TDI.pine)            |
| BVS ใน checklist หมายถึงอะไร          | ✅ ยืนยันแล้ว    | **Best V Shape** — ดูเองจาก price action                         |
| Signal timing conflict                | ✅ แก้แล้ว       | ใช้ 3-bar window + priceLine แทน sentiment                       |


---

## TDI Parameters (ที่ใช้จริง — จาก TDI.pine)

```
RSI Period      = 13
Band Length     = 31
Fast MA (Price) = SMA(RSI, 1)   ← Price Line = raw RSI
Slow MA (Sent.) = SMA(RSI, 9)
Volatility Band = 1.6185 × StdDev(RSI, 31)
Middle of Bands = (Upper + Lower) / 2
```

> ⚠️ ค่าเดิมที่คาดไว้ (34, 2, 7) **ไม่ตรง** — แก้เป็น (31, 1, 9) แล้วทุกไฟล์

---

## Alert Format (Discord)

```
ก่อนแท่งปิด:  (Not confirm) US30 ⏱️20:55 🟢
หลังแท่งปิด:  (Confirmed) US30 ⏱️20:55 🟢
```

- 🟢 = Buy signal
- 🔴 = Sell signal
- ⏱️ = เวลาที่สัญญาณเกิด

---

*สร้างจากการแกะภาพ indicator settings + class notes Day 1-4 + คำอธิบายจากผู้เรียน + ยืนยันจากคลิป*
*Full Rebuild: ทำใหม่ทั้ง 3 ไฟล์ตามข้อมูลที่ยืนยันจากคลิป — TF-aware signals, 3-color bar, ruobsen*
*Last updated: 2026-04-15*