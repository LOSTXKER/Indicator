# OVS/OVB Base Indicator — คู่มือการใช้งานฉบับสมบูรณ์

> **Pine Script v6** | Overlay Indicator | Multi-Timeframe (H4 / H1 / M15)

---

## สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [แนวคิดหลัก (Core Concepts)](#2-แนวคิดหลัก)
3. [ฟีเจอร์ทั้งหมด](#3-ฟีเจอร์ทั้งหมด)
  - [3.1 OVS/OVB State Machine](#31-ovsovb-state-machine)
  - [3.2 RSI Mountain Cut](#32-rsi-mountain-cut)
  - [3.3 EMA + Cloud](#33-ema--cloud)
  - [3.4 Trend Labels (UP/DN)](#34-trend-labels-updn)
  - [3.5 Session / Kill Zone (ICT)](#35-session--kill-zone-ict)
  - [3.6 Previous Day High/Low](#36-previous-day-highlow)
  - [3.7 H1 Swing Tracking](#37-h1-swing-tracking)
  - [3.8 H1 Pullback — Fib Zone (OTE)](#38-h1-pullback--fib-zone-ote)
  - [3.9 H1 Pullback — Phase 2 (Confirmation Triangles)](#39-h1-pullback--phase-2-confirmation-triangles)
  - [3.10 Fair Value Gap (FVG)](#310-fair-value-gap-fvg)
  - [3.11 Order Block (OB)](#311-order-block-ob)
  - [3.12 Liquidity Sweep (SWP)](#312-liquidity-sweep-swp)
  - [3.13 OTE Confluence Label](#313-ote-confluence-label)
  - [3.14 H1 Bollinger Bands](#314-h1-bollinger-bands)
  - [3.15 M15 Momentum Candle](#315-m15-momentum-candle)
  - [3.16 Flag Pattern Lines](#316-flag-pattern-lines)
4. [Timeframe ที่แนะนำ](#4-timeframe-ที่แนะนำ)
5. [ขั้นตอนการเทรดจริง (Trading Workflow)](#5-ขั้นตอนการเทรดจริง)
6. [สรุปสัญลักษณ์บนชาร์ต](#6-สรุปสัญลักษณ์บนชาร์ต)
7. [ระบบ Alert 3 ระดับ](#7-ระบบ-alert-3-ระดับ)
8. [การตั้งค่า (Settings)](#8-การตั้งค่า)
9. [คำเตือน](#9-คำเตือน)

---

## 1. ภาพรวม

Indicator ตัวนี้ออกแบบมาเพื่อช่วยเทรดเดอร์ **เฝ้าระวังและเตรียมตัว** สำหรับการเทรด Pullback โดยใช้หลัก **Smart Money Concepts (SMC)** + **ICT** ผสมผสานกับ Technical Analysis แบบคลาสสิก

**ไม่ได้ให้สัญญาณซื้อขายอัตโนมัติ** — แต่ช่วยให้คุณเห็น:

- ทิศทางเทรนด์ (Multi-TF)
- โซนที่ราคามีโอกาสกลับตัว (OTE Zone + Fib)
- ระดับ confluence ของโซนนั้นๆ (EMA, FVG, OB, SWP, PDH/PDL, Kill Zone)
- สัญญาณ Momentum บน M15

**เทรดเดอร์ต้องตัดสินใจเอง** โดยอาศัย Price Action เป็นหลัก

---

## 2. แนวคิดหลัก

### Multi-Timeframe Analysis


| Timeframe | บทบาท                                                       |
| --------- | ----------------------------------------------------------- |
| **H4**    | กำหนด Bias หลัก — ADX + EMA ตัดสินว่าเทรนด์ขึ้น/ลง/sideways |
| **H1**    | หา Setup — ตรวจจับ Pullback, FVG, OB, Sweep, Fib Zone       |
| **M15**   | จังหวะ Entry — Momentum Candle บอกว่าแรงซื้อ/ขายเริ่มกลับมา |


### หลักการ Pullback Trading

1. ดูเทรนด์ H4/H1 ว่าไปทางไหน
2. รอราคา pullback เข้าโซน OTE (Fib 38.2–78.6%)
3. ดู confluence ในโซน (EMA, FVG, OB, PDH/PDL, Sweep, Kill Zone)
4. รอ Price Action ยืนยัน (แท่งกลับตัว, M15 momentum)
5. Entry ด้วย M15 หรือ M5

---

## 3. ฟีเจอร์ทั้งหมด

### 3.1 OVS/OVB State Machine

**หลักการ:** ใช้ Stochastic Oscillator ตรวจจับจุด Oversold (OVS) และ Overbought (OVB) สลับกัน

**วิธีทำงาน:**

- เมื่อ Stochastic K < 20 (OVS Level) → เข้าสู่สถานะ "รอ OVS" → บันทึกจุดต่ำสุด
- เมื่อ Stochastic K > 80 (OVB Level) → สลับสถานะ → บันทึกจุดสูงสุด
- วนลูป OVS → OVB → OVS → ...

**สัญลักษณ์บนชาร์ต:**

- `⏳ S` = กำลังรอ confirm OVS (จุดต่ำสุดยังอัปเดตอยู่)
- `S` (เพชรสี aqua เล็กๆ) = OVS ยืนยันแล้ว
- `⏳ B` = กำลังรอ confirm OVB (จุดสูงสุดยังอัปเดตอยู่)
- `B` (เพชรสีส้มเล็กๆ) = OVB ยืนยันแล้ว

**วิธีใช้:**

- จุด S (Oversold) = โซนที่ราคาอาจกลับขึ้น — สนใจ Long
- จุด B (Overbought) = โซนที่ราคาอาจกลับลง — สนใจ Short
- ใช้เป็น **reference point** ไม่ใช่สัญญาณเข้าทันที

---

### 3.2 RSI Mountain Cut

**หลักการ:** ตรวจจับ pattern RSI ที่ลง Oversold → ขึ้น Overbought → ลง Oversold อีกครั้ง (OVS-OVB-OVS) เรียกว่า "ภูเขา RSI"

**วิธีทำงาน:**

1. RSI ลงต่ำกว่า 30 (OVS ครั้งแรก)
2. RSI ขึ้นสูงกว่า 70 (OVB)
3. RSI ลงต่ำกว่า 30 อีกครั้ง (OVS ครั้งที่สอง) → **RSI Cut!**

**สัญลักษณ์:** พื้นหลังสีม่วงจาง

**วิธีใช้:** RSI Cut มักเกิดที่จุดเปลี่ยนเทรนด์ — ระวังการกลับตัวรุนแรง

---

### 3.3 EMA + Cloud

**หลักการ:** EMA สองเส้น (Fast 14 / Slow 60) แสดงทิศทางเทรนด์

**สัญลักษณ์:**

- **เส้นเหลือง** = EMA Fast (14)
- **เส้นส้ม** = EMA Slow (60)
- **พื้นหลังเขียว** = EMA Fast อยู่เหนือ Slow (ขาขึ้น)
- **พื้นหลังแดง** = EMA Fast อยู่ใต้ Slow (ขาลง)

**วิธีใช้:**

- เทรดตามทิศทาง Cloud เท่านั้น (Cloud เขียว = Long, Cloud แดง = Short)
- เมื่อ EMA พัน/ตัดกันบ่อย = Sideways → หลีกเลี่ยงการเทรด

---

### 3.4 Trend Labels (UP/DN)

**หลักการ:** วิเคราะห์ Structure (HH/HL/LH/LL) จากจุด OVS/OVB เพื่อตัดสินเทรนด์

**สัญลักษณ์:**

- **UP** (เขียว) = Uptrend ยืนยัน (HH + HL)
- **DN** (แดง) = Downtrend ยืนยัน (LH + LL)
- **⚠HL / ⚠HH / ⚠LL / ⚠LH** (เหลือง) = กำลังเปลี่ยนเทรนด์ (Warning)

**วิธีใช้:**

- ดูที่ป้ายล่าสุด — ถ้าเป็น UP ให้ bias Long, ถ้าเป็น DN ให้ bias Short
- ป้ายเหลือง ⚠ = ระวัง อาจกำลังเปลี่ยนเทรนด์

---

### 3.5 Session / Kill Zone (ICT)

**หลักการ:** ช่วงเวลาที่ Smart Money มักเข้ามาเคลื่อนราคา (ICT Kill Zones)


| Kill Zone        | เวลา (NY)   | สีพื้นหลัง | ลักษณะ                        |
| ---------------- | ----------- | ---------- | ----------------------------- |
| **Asian**        | 19:00–22:00 | ม่วงจาง    | สร้าง Range / Liquidity Pool  |
| **London**       | 02:00–05:00 | น้ำเงินจาง | กำหนดทิศทางของวัน             |
| **New York**     | 07:00–10:00 | ส้มจาง     | Volatility สูง / ช่วงเทรดหลัก |
| **London Close** | 10:00–12:00 | เขียวจาง   | Reversal หรือ Continuation    |


**วิธีใช้:**

- เทรดเฉพาะช่วง **London** และ **New York** Kill Zone เป็นหลัก (volatility สูง, directional bias ชัด)
- Asian Session ใช้กำหนด Range — รอดู breakout ในช่วง London
- London Close ใช้สำหรับ reversal trade

---

### 3.6 Previous Day High/Low

**หลักการ:** จุดสูงสุดและต่ำสุดของวันก่อนหน้า — เป็น Key Level ที่ราคามักจะ react

**สัญลักษณ์:**

- **PDH** = Previous Day High (เส้นน้ำเงินจาง + label)
- **PDL** = Previous Day Low (เส้นน้ำเงินจาง + label)

**วิธีใช้:**

- PDH/PDL เป็นแนวรับ/ต้านที่สำคัญ
- ถ้า PDH/PDL อยู่ในโซน Fib → confluence เพิ่ม → จุด entry มีคุณภาพสูงขึ้น
- การ sweep ผ่าน PDH/PDL แล้วกลับ = สัญญาณ reversal ที่แข็งแรง

---

### 3.7 H1 Swing Tracking

**หลักการ:** ตรวจจับ Swing High / Swing Low บน H1 ด้วย Pivot + ATR filter เพื่อจับ "impulse leg" ที่แท้จริง

**วิธีทำงาน:**

- ใช้ `ta.pivothigh` / `ta.pivotlow` (lookback = Swing Lookback setting)
- กรอง swing ที่เล็กเกินไปออก (ต้องมี range >= 1x ATR)
- จับคู่ Impulse Leg: **HH ↔ HL** (ขาขึ้น) / **LH ↔ LL** (ขาลง)
- Impulse Leg ใช้คำนวณ Fibonacci

**สัญลักษณ์:**

- **วงกลมสีขาวจาง** เหนือ/ใต้แท่ง = จุด Swing High/Low ที่ถูกยืนยัน

**วิธีใช้:**

- Swing High/Low เป็น Liquidity Pool — ราคามักจะกลับมากวาด (Sweep)
- ใช้เป็น reference สำหรับ SL placement

---

### 3.8 H1 Pullback — Fib Zone (OTE)

**หลักการ:** วาดเส้น Fibonacci Retracement จาก Impulse Leg ของ H1 เพื่อกำหนดโซน Pullback ที่ดีที่สุด

**Fibonacci Levels:**


| Level     | ความหมาย                           | เส้น               |
| --------- | ---------------------------------- | ------------------ |
| **38.2%** | จุดเริ่มต้นของ Pullback Zone       | จุด (dotted), จาง  |
| **61.8%** | จุดเริ่ม OTE (Optimal Trade Entry) | ขีด (dashed), ชัด  |
| **78.6%** | จุดสิ้นสุด OTE                     | จุด (dotted), กลาง |


**วิธีคำนวณ:**

- **ขาขึ้น (Bull):** วัดจาก Impulse High ลงมา → 38.2% / 61.8% / 78.6%
- **ขาลง (Bear):** วัดจาก Impulse Low ขึ้นไป → 38.2% / 61.8% / 78.6%

**สีแท่งเทียน (Bar Color):**

- แท่ง **เขียว** = ราคาอยู่ในโซน Fib ขาขึ้น (เตรียม Long)
- แท่ง **แดง** = ราคาอยู่ในโซน Fib ขาลง (เตรียม Short)
- แท่งปกติ = ราคาอยู่นอกโซน

**โซน OTE (61.8–78.6%) คือจุด entry ที่ดีที่สุด** — ราคา pullback มาถึงโซนนี้มีโอกาสกลับตัวสูง

**เมื่อไหร่ที่เส้น Fib หายไป:**

- เมื่อ H1 Trend เป็น Sideways (ADX < 20) — ไม่มี directional bias
- เมื่อ swing ใหม่เกิดขึ้น → เส้นจะถูกวาดใหม่ตาม impulse leg ล่าสุด

---

### 3.9 H1 Pullback — Phase 2 (Confirmation Triangles)

**หลักการ:** เมื่อมีแท่งกลับตัว (reversal candle) ปรากฏในโซนสำคัญ + Fib depth >= 38.2% → แสดงสามเหลี่ยมยืนยัน

**เงื่อนไข (ทุกข้อต้องเป็นจริง):**

1. H1 Trend ชัด (ADX >= 20)
2. H4 Trend ไม่สวนทาง
3. มีแท่ง pullback ติดต่อกัน (ตามค่า PB Candles)
4. มีแท่งกลับตัว (เขียวหลังลง = bull, แดงหลังขึ้น = bear)
5. อยู่ใกล้ Swing / EMA / FVG (zone proximity)
6. Fib depth อย่างน้อย 38.2%

**สัญลักษณ์:**

- **▲ เขียว** ใต้แท่ง = Bull Pullback Confirmation
- **▼ แดง** เหนือแท่ง = Bear Pullback Confirmation

**วิธีใช้:**

- สามเหลี่ยมบอกว่า **"มีแท่งกลับตัวในโซนที่ดีแล้ว"** — เป็นสัญญาณให้ลงไปดู M15/M5 เพื่อหา entry
- ไม่ใช่สัญญาณ entry ตรงๆ — ต้องรอ Price Action confirm

---

### 3.10 Fair Value Gap (FVG)

**หลักการ:** FVG คือช่องว่างระหว่าง 3 แท่งเทียนที่ราคาวิ่งเร็วเกินไปจนเกิด "gap" — ราคามักจะกลับมาเติมเต็ม

**วิธีตรวจจับ:**

- **Bull FVG:** Low ของแท่งปัจจุบัน > High ของแท่ง 2 แท่งก่อน → มีช่องว่างขาขึ้น
- **Bear FVG:** High ของแท่งปัจจุบัน < Low ของแท่ง 2 แท่งก่อน → มีช่องว่างขาลง

**สัญลักษณ์:**

- **กล่องเขียว** มีข้อความ "FVG" = Bull FVG (โซนรับ)
- **กล่องแดง** มีข้อความ "FVG" = Bear FVG (โซนต้าน)

**Mitigation (กล่องหายไป):**

- Bull FVG หายเมื่อราคาปิดต่ำกว่าขอบล่างของ FVG
- Bear FVG หายเมื่อราคาปิดสูงกว่าขอบบนของ FVG
- = FVG ถูก "เติมเต็ม" แล้ว ไม่มีผลอีก

**วิธีใช้:**

- FVG เป็น **แม่เหล็กราคา** — ราคามักจะกลับมาที่ FVG ก่อนไปต่อ
- Bull FVG ในโซน OTE = จุด entry Long ที่ดีมาก
- Bear FVG ในโซน OTE = จุด entry Short ที่ดีมาก

---

### 3.11 Order Block (OB)

**หลักการ:** OB คือแท่งเทียนสุดท้ายที่สวนทิศทางก่อน Impulse Move รุนแรง — จุดที่ Smart Money วาง order

**วิธีตรวจจับ:**

1. ต้องมี FVG เกิดขึ้น (displacement / impulse move)
2. แท่งกลาง (displacement candle) ต้องมี body > 1.5 เท่าของ body เฉลี่ย 14 แท่ง
3. แท่ง 2 แท่งก่อน FVG ต้องเป็นแท่งสวนทาง:
  - **Bull OB:** แท่งแดง (bearish) ก่อน impulse ขึ้น
  - **Bear OB:** แท่งเขียว (bullish) ก่อน impulse ลง

**สัญลักษณ์:**

- **กล่องสี teal/cyan** มีข้อความ "OB" = **Bull Order Block** (โซนรับของสถาบัน)
- **กล่องสีส้ม** มีข้อความ "OB" = **Bear Order Block** (โซนต้านของสถาบัน)

**Mitigation:**

- Bull OB หายเมื่อราคาปิดต่ำกว่า OB → สถาบันถอนออกแล้ว
- Bear OB หายเมื่อราคาปิดสูงกว่า OB → สถาบันถอนออกแล้ว

**วิธีใช้:**

- OB เป็น **แนวรับ/ต้านที่แข็งแรงมาก** เพราะเป็นจุดที่สถาบันวาง order
- OB + FVG ในโซน OTE = **confluence สูงมาก** → จุด entry ที่ดีที่สุด
- ใช้ขอบ OB เป็น SL reference (SL ใต้/เหนือ OB)

**ความแตกต่างจาก FVG:**


|         | FVG                    | OB                    |
| ------- | ---------------------- | --------------------- |
| สี Bull | เขียว                  | Teal/Cyan             |
| สี Bear | แดง                    | ส้ม                   |
| ข้อความ | "FVG"                  | "OB"                  |
| แนวคิด  | ช่องว่างราคา (gap)     | จุดวาง order สถาบัน   |
| ใช้เป็น | โซนที่ราคาจะกลับมาเติม | แนวรับ/ต้านที่แข็งแรง |


---

### 3.12 Liquidity Sweep (SWP)

**หลักการ:** ราคา wick ทะลุ Swing High/Low แต่ปิดกลับมา — เป็นการ "กวาด Stop Loss" ของรายย่อย (Stop Hunt / Swing Failure Pattern)

**วิธีตรวจจับ:**

- **Bull Sweep:** H1 Low < Last Swing Low **แต่** H1 Close > Last Swing Low
- **Bear Sweep:** H1 High > Last Swing High **แต่** H1 Close < Last Swing High

**สัญลักษณ์:**

- **◆ เพชรสี cyan** ใต้แท่ง = Bull Sweep (กวาด stop ขาลง → เตรียมขึ้น)
- **◆ เพชรสี magenta** เหนือแท่ง = Bear Sweep (กวาด stop ขาขึ้น → เตรียมลง)

**วิธีใช้:**

- Sweep มักเป็น **จุดเริ่มต้นของการกลับตัว** — Smart Money กวาด liquidity แล้วดันราคากลับ
- Bull Sweep ในโซน OTE ขาขึ้น = สัญญาณ Long ที่มีคุณภาพสูงมาก
- Bear Sweep ในโซน OTE ขาลง = สัญญาณ Short ที่มีคุณภาพสูงมาก
- Sweep + OB + FVG = confluence ที่ดีที่สุด

---

### 3.13 OTE Confluence Label

**หลักการ:** รวม confluence ทั้งหมดไว้ใน label เดียวที่เส้น Fib 61.8% เพื่อให้เห็นภาพรวมทันที

**ตำแหน่ง:** ด้านขวาของเส้น Fib 61.8%

**รูปแบบ:** `OTE | EMA FVG OB SWP PDH PDL KZ`


| ตัวย่อ  | ความหมาย                                   | เงื่อนไข                          |
| ------- | ------------------------------------------ | --------------------------------- |
| **OTE** | แสดงเสมอ                                   | เป็นชื่อโซน (Optimal Trade Entry) |
| **EMA** | EMA Fast อยู่ในโซน Fib                     | EMA เป็น Dynamic S/R เพิ่มเติม    |
| **FVG** | มี FVG ที่ยังไม่ถูก mitigate ซ้อนอยู่ในโซน | ราคาจะถูกดึงเข้าหา FVG            |
| **OB**  | มี Order Block ซ้อนอยู่ในโซน               | สถาบันวาง order ไว้ตรงนี้         |
| **SWP** | มี Liquidity Sweep ภายใน 10 แท่ง           | Smart Money กวาด stop แล้ว        |
| **PDH** | Previous Day High อยู่ในโซน                | Key Level เพิ่มเติม               |
| **PDL** | Previous Day Low อยู่ในโซน                 | Key Level เพิ่มเติม               |
| **KZ**  | อยู่ในช่วง London หรือ NY Kill Zone        | ช่วงเวลาที่มี volume สูง          |


**วิธีใช้:**

- **ยิ่งมี confluence เยอะ = จุด entry ยิ่งมีคุณภาพสูง**
- ขั้นต่ำที่แนะนำ: อย่างน้อย 2-3 confluence ก่อน entry
- ตัวอย่างที่ดี: `OTE | EMA FVG OB KZ` = 4 confluence → เตรียม entry ได้เลย
- ตัวอย่างที่ควรระวัง: `OTE` เฉยๆ ไม่มี confluence → ยังไม่น่าเข้า

---

### 3.14 H1 Bollinger Bands

**หลักการ:** Bollinger Bands บน H1 (ค่าเริ่มต้น: 20 period, 2.0 multiplier)

**สัญลักษณ์:** เส้นส้มจาง 3 เส้น (Upper / Middle / Lower)

**วิธีใช้:**

- ปิดไว้เป็นค่าเริ่มต้น (เปิดได้ใน Settings)
- ใช้ดู volatility — BB แคบ = volatility ต่ำ (เตรียมระเบิด)
- ราคาชน BB Upper/Lower = overbought/oversold ใน H1

---

### 3.15 M15 Momentum Candle

**หลักการ:** วิเคราะห์ขนาด body ของแท่ง M15 เทียบกับค่าเฉลี่ย เพื่อดู momentum

**เงื่อนไข (แสดงเฉพาะ TF M15):**


| สีแท่ง                  | ความหมาย                     |
| ----------------------- | ---------------------------- |
| **เขียวเข้ม** (#1B5E20) | Super Bull — body > 1.5x avg |
| **เขียว** (#66BB6A)     | Above Avg Bull — body > avg  |
| **แดงเข้ม** (#B71C1C)   | Super Bear — body > 1.5x avg |
| **แดง** (#EF5350)       | Above Avg Bear — body > avg  |
| ปกติ                    | body ≤ avg                   |


**วิธีใช้:**

- ใช้บน M15 เพื่อหาจังหวะ entry หลังจากเห็น setup บน H1
- รอแท่ง **Super Bull** (เขียวเข้ม) ใน uptrend = momentum กลับมาแล้ว → entry Long
- รอแท่ง **Super Bear** (แดงเข้ม) ใน downtrend = momentum กลับมาแล้ว → entry Short

---

### 3.16 Flag Pattern Lines

**หลักการ:** วาดเส้น Flag Pattern จากจุด pivot ระหว่าง OVS กับ OVB

**สัญลักษณ์:** เส้นสีขาวจาง 2 เส้น (upper + lower) ที่ลากออกไปทางขวา

**วิธีใช้:**

- ปิดไว้เป็นค่าเริ่มต้น
- ใช้ดู pattern consolidation ก่อน breakout
- Breakout จากเส้น Flag = สัญญาณเทรนด์ไปต่อ

---

## 4. Timeframe ที่แนะนำ


| สิ่งที่ดู            | Timeframe                                        |
| -------------------- | ------------------------------------------------ |
| Bias / ทิศทางหลัก    | H4 (อ่านจาก Trend Labels + EMA Cloud)            |
| หา Setup / โซน entry | **H1** (Fib Zone, FVG, OB, Sweep, Phase 2)       |
| จังหวะ Entry         | **M15** (Momentum Candle) หรือ M5 (Price Action) |
| SL / TP              | H1 (Swing High/Low)                              |


---

## 5. ขั้นตอนการเทรดจริง (Trading Workflow)

### Step 1: ดู Bias (H1)

- ดูป้าย **UP/DN** → กำหนดทิศทาง
- ดู **EMA Cloud** → เขียว = Long, แดง = Short
- ถ้า Sideways → **ไม่เทรด**

### Step 2: รอ Pullback เข้าโซน (H1)

- ดูว่าแท่งเปลี่ยนสี (เขียว/แดง) → ราคาเข้าโซน Fib แล้ว
- ดูเส้น Fib: ยิ่งลึก (ใกล้ 61.8–78.6%) ยิ่งดี

### Step 3: อ่าน Confluence (H1)

- ดู OTE Label → มี confluence อะไรบ้าง
- **ยิ่งเยอะยิ่งดี:** EMA + FVG + OB + SWP + KZ = สัญญาณคุณภาพสูง
- ดูว่ามีกล่อง FVG / OB ซ้อนอยู่ในโซนหรือไม่
- มี Sweep diamond หรือไม่

### Step 4: รอ Confirmation (H1 → M15)

- H1: ดูว่ามี **▲/▼ สามเหลี่ยม** (Phase 2) หรือไม่
- M15: รอ **Momentum Candle** (แท่งเขียวเข้ม/แดงเข้ม)
- หรือลงไป M5 ดู Price Action (engulfing, pin bar, etc.)

### Step 5: Entry + Risk Management

- **Entry:** เมื่อ M15/M5 ยืนยัน
- **SL:** ใต้/เหนือ Swing Low/High ของ M15 (หรือใต้/เหนือ OB)
- **TP:** RR 2:1 ขึ้นไป (หรือ Swing High/Low ถัดไปของ H1)

### ตัวอย่าง Setup ที่ดี (Bull):

```
H1: UP trend, ADX > 20
→ ราคา Pullback ลงมาในโซน Fib (แท่งเปลี่ยนเป็นเขียว)
→ OTE Label: "OTE | EMA FVG OB SWP KZ"
→ มีกล่อง OB + FVG ซ้อนในโซน
→ มี ◆ cyan Sweep diamond
→ มี ▲ Phase 2 Triangle
→ M15: แท่ง Super Bull (เขียวเข้ม) ปรากฏ
→ Entry Long, SL ใต้ OB, TP ที่ Swing High H1
```

---

## 6. สรุปสัญลักษณ์บนชาร์ต

### Labels & Markers


| สัญลักษณ์                     | สี                | ความหมาย                                  |
| ----------------------------- | ----------------- | ----------------------------------------- |
| `⏳ S` / `S` ◆                 | Aqua/Cyan         | Stochastic Oversold (pending/confirmed)   |
| `⏳ B` / `B` ◆                 | ส้ม               | Stochastic Overbought (pending/confirmed) |
| `UP`                          | เขียว             | Uptrend confirmed                         |
| `DN`                          | แดง               | Downtrend confirmed                       |
| `⚠HL` / `⚠HH` / `⚠LL` / `⚠LH` | เหลือง            | Trend change warning                      |
| ○ วงกลม                       | ขาวจาง            | Swing High/Low (H1)                       |
| ▲ สามเหลี่ยม                  | เขียว             | Bull Pullback Phase 2                     |
| ▼ สามเหลี่ยม                  | แดง               | Bear Pullback Phase 2                     |
| ◆ เพชร                        | Cyan (#00BCD4)    | Bull Liquidity Sweep                      |
| ◆ เพชร                        | Magenta (#E040FB) | Bear Liquidity Sweep                      |


### Boxes


| กล่อง       | สี Bull         | สี Bear       | ข้อความ |
| ----------- | --------------- | ------------- | ------- |
| FVG         | เขียว (#00C853) | แดง (#D50000) | "FVG"   |
| Order Block | Teal (#00ACC1)  | ส้ม (#FF6D00) | "OB"    |


### Lines


| เส้น           | สไตล์        | ความหมาย                  |
| -------------- | ------------ | ------------------------- |
| Fib 38.2%      | Dotted, จาง  | เริ่มต้น Pullback Zone    |
| Fib 61.8%      | Dashed, ชัด  | เริ่มต้น OTE              |
| Fib 78.6%      | Dotted, กลาง | สิ้นสุด OTE               |
| EMA Fast       | เหลือง, หนา  | EMA 14                    |
| EMA Slow       | ส้ม, หนา     | EMA 60                    |
| PDH / PDL      | น้ำเงินจาง   | Previous Day High/Low     |
| BB Upper/Lower | ส้มจาง       | Bollinger Bands (ถ้าเปิด) |


### Bar Colors


| สีแท่ง          | เงื่อนไข                   | TF     |
| --------------- | -------------------------- | ------ |
| เขียว (#00E676) | ราคาอยู่ใน Fib Zone ขาขึ้น | H1     |
| แดง (#FF5252)   | ราคาอยู่ใน Fib Zone ขาลง   | H1     |
| เขียวเข้ม       | M15 Super Bull Momentum    | M15    |
| เขียวอ่อน       | M15 Above Avg Bull         | M15    |
| แดงเข้ม         | M15 Super Bear Momentum    | M15    |
| แดงอ่อน         | M15 Above Avg Bear         | M15    |
| ม่วง            | RSI Mountain Cut           | ทุก TF |


### Backgrounds


| สีพื้นหลัง    | ความหมาย           |
| ------------- | ------------------ |
| เขียวจาง      | EMA Cloud Bull     |
| แดงจาง        | EMA Cloud Bear     |
| ม่วงจาง       | Asian Kill Zone    |
| น้ำเงินจาง    | London Kill Zone   |
| ส้มจาง        | New York Kill Zone |
| เขียวอ่อนจาง  | London Close KZ    |
| น้ำเงินจางมาก | OVS Zone (ถ้าเปิด) |
| แดงจางมาก     | OVB Zone (ถ้าเปิด) |


---

## 7. ระบบ Alert 3 ระดับ

Indicator มีระบบ Alert 3 ระดับ ออกแบบมาให้ **ไม่ดังบ่อยเกินจน alert fatigue** แต่ **ดังเมื่อ actionable จริงๆ**

### Tier 1 — เตรียมตัว (Zone Entry)


| Alert                 | เงื่อนไข                          | ความหมาย               |
| --------------------- | --------------------------------- | ---------------------- |
| 🟡 T1 Zone Entry Bull | ราคาเข้าโซน Fib ครั้งแรก (ขาขึ้น) | "กลับมาดูชาร์ตได้แล้ว" |
| 🟡 T1 Zone Entry Bear | ราคาเข้าโซน Fib ครั้งแรก (ขาลง)   | "กลับมาดูชาร์ตได้แล้ว" |


- ดังแค่ **ครั้งแรก** ที่ราคาเข้าโซน (ไม่ดังซ้ำขณะอยู่ในโซน)
- เมื่อราคาออกจากโซนแล้วกลับเข้ามาใหม่ → ดังอีกครั้ง

### Tier 2 — โอกาสดี (High Confluence)


| Alert                      | เงื่อนไข                                     | ความหมาย                         |
| -------------------------- | -------------------------------------------- | -------------------------------- |
| 🟠 T2 High Confluence Bull | อยู่ในโซน Fib + confluence >= 3 ตัว (ขาขึ้น) | "จุดนี้น่าสนใจมาก เริ่มหา entry" |
| 🟠 T2 High Confluence Bear | อยู่ในโซน Fib + confluence >= 3 ตัว (ขาลง)   | "จุดนี้น่าสนใจมาก เริ่มหา entry" |


- Confluence ที่นับ: EMA, FVG, OB, SWP, PDH, PDL, KZ (7 ตัว)
- ดังเมื่อมี **3 ตัวขึ้นไป** พร้อมกัน เช่น `EMA + FVG + KZ`

### Tier 3 — พร้อม Entry (Action)


| Alert                 | เงื่อนไข                             | ความหมาย                                  |
| --------------------- | ------------------------------------ | ----------------------------------------- |
| 🔴 T3 Sweep+Zone Bull | Liquidity Sweep เกิดในโซน Fib ขาขึ้น | "Smart Money กวาด stop แล้ว เตรียม Long"  |
| 🔴 T3 Sweep+Zone Bear | Liquidity Sweep เกิดในโซน Fib ขาลง   | "Smart Money กวาด stop แล้ว เตรียม Short" |
| 🔴 T3 PB Confirm Bull | Phase 2 แท่งกลับตัวยืนยัน (ขาขึ้น)   | "แท่งกลับตัวแล้ว เตรียม entry Long"       |
| 🔴 T3 PB Confirm Bear | Phase 2 แท่งกลับตัวยืนยัน (ขาลง)     | "แท่งกลับตัวแล้ว เตรียม entry Short"      |


### JSON Message Format

ทุก alert ส่ง JSON ที่ต่อ webhook ได้ทันที:

```json
{
  "tier": 3,
  "type": "SWEEP_ZONE",
  "dir": "BULL",
  "pair": "BTCUSD",
  "tf": "H1",
  "price": "67543.20",
  "action": "พร้อม — Sweep ในโซน OTE เตรียม entry Long"
}
```


| Field    | คำอธิบาย                                                      |
| -------- | ------------------------------------------------------------- |
| `tier`   | ระดับ 1/2/3 (ยิ่งสูงยิ่ง urgent)                              |
| `type`   | ประเภท: `ZONE_ENTRY`, `HIGH_CONF`, `SWEEP_ZONE`, `PB_CONFIRM` |
| `dir`    | ทิศทาง: `BULL` หรือ `BEAR`                                    |
| `pair`   | สินทรัพย์ (auto จาก TradingView)                              |
| `tf`     | Timeframe                                                     |
| `price`  | ราคาปัจจุบัน                                                  |
| `action` | คำอธิบายภาษาไทย ว่าควรทำอะไร                                  |


### วิธีตั้ง Alert ใน TradingView

1. คลิกขวาบนชาร์ต → **Add Alert**
2. Condition → เลือก **OVS/OVB Base**
3. เลือก alert ที่ต้องการ เช่น `🔴 T3 Sweep+Zone Bull`
4. Options → "Once Per Bar Close" (แนะนำ) หรือ "Once Per Bar"
5. Notifications → เปิด App notification / Email / Webhook ตามต้องการ

### แนะนำ: ควรตั้ง Alert ตัวไหน?


| สไตล์เทรด                     | แนะนำ              |
| ----------------------------- | ------------------ |
| Active (นั่งดูบ่อย)           | T2 + T3 ทั้งหมด    |
| Part-time (ดูเป็นช่วง)        | T1 + T3 ทั้งหมด    |
| Passive (แจ้งเตือนอย่างเดียว) | T3 ทั้งหมด (4 ตัว) |


---

## 8. การตั้งค่า (Settings)

### ⚙️ Stochastic


| Parameter | Default | คำอธิบาย             |
| --------- | ------- | -------------------- |
| K Period  | 9       | Stochastic K period  |
| Slowing   | 3       | Stochastic smoothing |
| OVS Level | 20      | ระดับ Oversold       |
| OVB Level | 80      | ระดับ Overbought     |


### 📍 RSI Cut


| Parameter       | Default | คำอธิบาย                  |
| --------------- | ------- | ------------------------- |
| เปิดใช้ RSI Cut | true    | เปิด/ปิด RSI Mountain Cut |
| RSI Period      | 14      | RSI period                |
| RSI OVS Level   | 30      | RSI Oversold threshold    |
| RSI OVB Level   | 70      | RSI Overbought threshold  |


### 📍 EMA


| Parameter              | Default | คำอธิบาย          |
| ---------------------- | ------- | ----------------- |
| Fast EMA               | 14      | EMA เร็ว          |
| Slow EMA               | 60      | EMA ช้า           |
| แสดงเส้น EMA           | true    | แสดง/ซ่อนเส้น EMA |
| แสดงพื้นหลัง EMA Cross | true    | แสดง/ซ่อน Cloud   |


### 🎯 Pullback Strategy


| Parameter             | Default | คำอธิบาย                       |
| --------------------- | ------- | ------------------------------ |
| ADX Length            | 14      | ช่วงคำนวณ ADX                  |
| ADX Sideway Threshold | 20      | ADX ต่ำกว่านี้ = Sideways      |
| BB Length             | 20      | Bollinger Bands period         |
| BB Multiplier         | 2.0     | Bollinger Bands StdDev         |
| PB Candles            | 1       | จำนวนแท่ง pullback ก่อนกลับตัว |
| Swing Lookback        | 6       | ช่วงหา Swing High/Low          |
| H1 Pullback           | true    | เปิด/ปิด H1 Pullback           |
| แสดงจุด PB (Phase 2)  | true    | แสดง/ซ่อน สามเหลี่ยมและวงกลม   |
| แสดง PB Fib Zone      | true    | แสดง/ซ่อน เส้น Fib + สีแท่ง    |
| แสดง Liquidity Sweep  | true    | แสดง/ซ่อน เพชร Sweep           |
| แสดง Order Block      | true    | แสดง/ซ่อน กล่อง OB             |
| แสดง H1 BB            | false   | แสดง/ซ่อน Bollinger Bands H1   |


### 📦 FVG (Fair Value Gap)


| Parameter        | Default | คำอธิบาย                       |
| ---------------- | ------- | ------------------------------ |
| แสดง H1 FVG      | true    | เปิด/ปิด FVG                   |
| จำนวน FVG สูงสุด | 10      | จำนวน FVG/OB box สูงสุดบนชาร์ต |


### ⏰ Session / Kill Zone


| Parameter              | Default | คำอธิบาย            |
| ---------------------- | ------- | ------------------- |
| Asian Kill Zone        | true    | 19:00–22:00 NY      |
| London Kill Zone       | true    | 02:00–05:00 NY      |
| New York Kill Zone     | true    | 07:00–10:00 NY      |
| London Close Kill Zone | true    | 10:00–12:00 NY      |
| แสดงพื้นหลัง Session   | true    | แสดง/ซ่อนสีพื้นหลัง |


### 📏 Key Levels


| Parameter             | Default | คำอธิบาย          |
| --------------------- | ------- | ----------------- |
| แสดง Previous Day H/L | true    | แสดง/ซ่อน PDH/PDL |


### 📈 Momentum Candle


| Parameter        | Default | คำอธิบาย                           |
| ---------------- | ------- | ---------------------------------- |
| Avg Body Period  | 15      | ช่วงคำนวณค่าเฉลี่ย body            |
| Super Multiplier | 1.5     | เกณฑ์ Super Momentum (เท่าของ avg) |
| แสดงสีแท่ง M15   | true    | เปิด/ปิด M15 momentum bar color    |


### 📊 แสดงผล


| Parameter             | Default | คำอธิบาย                     |
| --------------------- | ------- | ---------------------------- |
| แสดงจุด OVS/OVB       | true    | แสดง/ซ่อน S/B markers        |
| จำนวนจุดสูงสุด        | 30 คู่  | จำกัด markers บนชาร์ต        |
| แสดงป้ายเทรน          | true    | แสดง/ซ่อน UP/DN labels       |
| แสดงพื้นหลังโซน       | false   | แสดง/ซ่อน OVS/OVB background |
| แสดงเส้น Flag Pattern | false   | แสดง/ซ่อน Flag lines         |
| Pivot Length (Flag)   | 2       | Pivot สำหรับ Flag Pattern    |


---

## 9. คำเตือน

- Indicator นี้เป็น **เครื่องมือช่วยวิเคราะห์** ไม่ใช่ระบบเทรดอัตโนมัติ
- **ต้องใช้ Price Action ยืนยันเสมอ** ก่อน entry
- confluence สูง ≠ 100% ถูก — ยังมีโอกาสผิดได้เสมอ
- ใช้ **Risk Management** ทุกครั้ง — SL ต้องมี, position size ต้องเหมาะสม
- ไม่เทรดเมื่อ Sideways (ADX < 20) หรือ EMA พัน
- Pullback ช่วงท้ายเทรนด์มีความเสี่ยงสูง — ดู divergence + structure change ประกอบ
- Backtest และ paper trade ก่อนใช้เงินจริง

