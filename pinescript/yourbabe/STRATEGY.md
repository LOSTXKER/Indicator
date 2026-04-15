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

## Indicator 2: YOUR BABEs Indicator 2.2

### พื้นฐาน: TDI (Traders Dynamic Index)

ฐานคำนวณ = RSI + Bollinger Bands ของ RSI

### เส้นหลัก


| ชื่อใน Indicator    | คำอธิบาย       | สูตร (ประมาณ)                        |
| ------------------- | -------------- | ------------------------------------ |
| **Price** (ราคา)    | Fast line      | Fast MA ของ RSI (period สั้น เช่น 2) |
| **Sentiment 1**     | Slow line หลัก | Slow MA ของ RSI (period เช่น 7)      |
| **Sentiment 2**     | Slow line กลาง | MA ของ RSI (period เช่น 14)          |
| **Sentiment 3**     | Slow line ช้า  | MA ของ RSI (period เช่น 21)          |
| **Middle of Bands** | เส้นกลาง BB    | Midpoint ของ Bollinger Bands บน RSI  |


### สัญญาณจาก Oscillator (Day 3)

**Buy Signal:**

1. EMA 8, 14, 60 Crossover
2. **Price ตัด Sentiment ขึ้น** + **Sentiment อยู่เหนือเส้นกลาง (Middle of Bands)**

**Sell Signal:**

1. EMA 8, 14, 60 Crossunder
2. **Price ตัด Sentiment ลง** + **Sentiment อยู่ใต้เส้นกลาง**

### Mountain Fills

- **Mountain CG candle**: ตัวหลัก (Center of Gravity / แกนกลาง)
- **Mountain Surface Outside candle**: พื้นผิวด้านนอก
- **Mountain Surface Inside candle**: พื้นผิวด้านใน
- สร้างรูป "ภูเขา" ระหว่าง Price กับ Sentiment lines
- สี: เขียว (Price > Sentiment) / แดง (Price < Sentiment) / ส้ม (transition)

### M15 Cross-Timeframe

- **Sentiment (M15)**: ดึง Sentiment จาก M15 มาแสดง
- **Price (M15)**: ดึง Price จาก M15 มาแสดง
- **Mountain Surface candle (M15)**: ภูเขาของ M15

### Settings อื่นๆ

- **Sentiment Background Toggle**: พื้นหลังตาม Sentiment direction
- **Old version Toggle**: สลับไปใช้สูตรเก่า
- **Position Signal**: ตำแหน่ง signal shape (Top / Bottom)

---

## Indicator 3: YOUR BABE 5.4

### สัญญาณ Buy/Sell — Our Version (Research-backed Rebuild)

> ปรับปรุงจากเวอร์ชันเดิมที่มีปัญหา timing conflict ระหว่าง TDI crossover กับ sentiment check

**ปัญหาเดิม:**
- `ta.crossover()` เกิดแค่ 1 bar → ต้อง AND กับ `sentiment > middleBand` พอดี
- Sentiment (SMA period 9) ช้ากว่า Price Line → ตอน crossover เกิด, sentiment มักยังไม่ข้าม middle
- ทำให้พลาด signal หลายจุด โดยเฉพาะช่วง early reversal

**แนวทางใหม่ — 3 เงื่อนไขหลัก:**

**Buy Signal:**

1. **EMA Trend** — `ema8 > ema14` AND `close > ema60` (60 ไม่ขวาง, ไม่ต้องเรียงแบบ strict)
2. **TDI Momentum** — Price Line ตัด Sentiment ขึ้น **ภายใน 3 bars** + `priceLine > middleBand` (ใช้ priceLine แทน sentiment — เร็วกว่า)
3. **Pullback Proximity** — ราคาเคย pull back มาใกล้ EMA 14 (ภายใน 1.5 ATR) ใน 10 bars ล่าสุด

**Sell Signal:** กระจกของ Buy

**Filters เพิ่มเติม:**
- **TDI Squeeze** — block signal เมื่อ Bollinger Band width ของ RSI < 70% ของค่าเฉลี่ย (ตลาด sideways/choppy)
- **Flat EMA** — block เมื่อ EMA slope แบน (เดิม)
- **Powerful Mode** — ต้องมี momentum candle (เดิม)
- **Minimal Signal** — กรองเฉพาะ signal ที่มั่นใจสูง (เดิม)

### Not Confirm / Confirmed

- **ระหว่างแท่งเทียนยังไม่ปิด** (`barstate.isconfirmed == false`):
  - เงื่อนไขเข้าเกณฑ์ → `(Not confirm) SYMBOL ⏱️HH:MM 🟢/🔴`
- **แท่งเทียนปิดแล้ว** (`barstate.isconfirmed == true`):
  - เงื่อนไขยังเข้า → `(Confirmed) SYMBOL ⏱️HH:MM 🟢/🔴`
- 🟢 = Buy, 🔴 = Sell

### Bar Color — 7 สี (Our Version — Acceleration-aware)


| สี                  | เงื่อนไข                                                       | ความหมาย                     |
| ------------------- | -------------------------------------------------------------- | ---------------------------- |
| **เขียว (Green)**   | EMA bullish + PriceLine > Sentiment + momentum **accelerating** | Strong Bullish — กำลังเร่ง    |
| **น้ำเงิน (Blue)**  | EMA bullish + PriceLine > Sentiment + momentum **decelerating** | Moderate Bullish — กำลังชะลอ |
| **ฟ้า (Cyan)**      | EMA 8 > 14 แต่ TDI ยังไม่ชัด                                   | Weak Bullish                 |
| **แดง (Red)**       | EMA bearish + PriceLine < Sentiment + momentum **accelerating** | Strong Bearish — กำลังเร่ง    |
| **ส้ม (Orange)**    | EMA bearish + PriceLine < Sentiment + momentum **decelerating** | Moderate Bearish — กำลังชะลอ |
| **เทา (Gray)**      | Flat EMA / TDI Squeeze / sideways                              | Sideways / Low Volatility    |
| **เหลือง (Yellow)** | EMA cross ล่าสุด vs TDI ทิศตรงข้าม                             | **Divergence!**              |


> Green vs Blue = ดูจากการเร่ง/ชะลอของ priceLine (accelerating vs decelerating)

### Yellow Bar — Divergence (Day 1)

สำคัญมาก: **EMA ต้องเกิดก่อน Your babe**


| Yellow Side | เงื่อนไข                                      |
| ----------- | --------------------------------------------- |
| Buy side    | EMA 8,14 Crossover + Your babe Cross**under** |
| Sell side   | EMA 8,14 Crossunder + Your babe Cross**over** |


= EMA กับ Oscillator ขัดกัน = **สัญญาณเตือน**

### Momentum Bar (Day 1)

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


| หัวข้อ                                | สถานะ        | หมายเหตุ                                              |
| ------------------------------------- | ------------ | ----------------------------------------------------- |
| Bar Color — Blue vs Cyan distinction  | ✅ แก้แล้ว    | ใช้ acceleration/deceleration ของ priceLine            |
| Momentum Candle เงื่อนไขแน่ชัด        | ❓ ประมาณ     | น่าจะ body ใหญ่ + volume                              |
| Powerful Mode logic                   | ❓ ประมาณ     | น่าจะ filter เข้มขึ้น                                 |
| "Old version Toggle" ใน Indicator 2.2 | ❓ ไม่ทราบ    | สูตรเก่า vs ใหม่                                      |
| Speed line คืออะไรแน่                 | ✅ ยืนยันแล้ว | **เส้น trendline ของ pattern ที่ลากเอง** (ไม่ใช่ EMA) |
| Mountain CG สูตรแน่ชัด                | ❓ ประมาณ     | น่าจะ Center of Gravity ของ RSI                       |
| TDI parameters ที่แน่นอน              | ✅ แก้แล้ว    | **RSI 13 / Band 31 / Fast 1 / Slow 9** (จาก TDI.pine) |
| BVS ใน checklist หมายถึงอะไร          | ✅ ยืนยันแล้ว | **Best V Shape** — ดูเองจาก price action              |
| Signal timing conflict                | ✅ แก้แล้ว    | ใช้ 3-bar window + priceLine แทน sentiment             |


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

*สร้างจากการแกะภาพ indicator settings + class notes Day 1-4 + คำอธิบายจากผู้เรียน*
*Signal logic rebuild (Our Version): research-backed improvements — priceLine > middleBand, 3-bar window, pullback proximity, TDI squeeze*
*Last updated: 2026-04-15*