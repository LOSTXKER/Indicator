# Signal Filter Experiments Log

> ปัญหา: สัญญาณเราครบ (ตรงกับต้นฉบับ 100%) แต่**มีเกิน** — ต้องหาวิธีกรองส่วนเกินออก
> โดยไม่ทำให้สัญญาณที่ถูกต้องหายไป

---

## สถานะปัจจุบัน (Baseline)

สัญญาณ **ครบ** ตรงต้นฉบับ ไม่มี filter พิเศษ (ยกเว้น optional toggles ที่ปิดอยู่)

```
coreBuy  = isM5 and emaBull and ema14 > ema60 and close > htfEma60 and crossUpAboveMid
coreSell = isM5 and not emaBull and ema14 < ema60 and close < htfEma60 and crossDnBelowMid
```

- `crossUpAboveMid` = Price ตัดรวบเส้น**เส้นไหนก็ได้**ขึ้น + เส้นนั้น > bbMa
- ไม่มี cooldown, ไม่มี canBuy/canSell

---

## Scenario ที่ลองแล้ว

### 1. hadFirstDip / hadFirstRise (Break-Retest ต้นเทรน)

**หลักการ**: หลัง EMA 8 ตัด 14 → ต้องรอ Price ลงต่ำกว่ารวบเส้นทั้ง 3 ก่อน 1 ครั้ง

**โค้ด**:

```pine
var bool canBuy = false
if ta.crossover(ema8, ema14)
    canBuy := false
if emaBull and priceLine < math.min(sentiment1, math.min(sentiment2, sentiment3))
    canBuy := true
// coreBuy ต้องมี canBuy
```

**ผล**: ❌ สัญญาณหายเยอะ — ต้นเทรนหลายจุดที่ต้นฉบับมี signal แต่เราไม่มี
เพราะในเทรนแรง Price ไม่ลงต่ำกว่ารวบเส้นทั้ง 3

---

### 2. hadFirstDip + ลดเป็น sentiment2 (เส้นกลาง)

**หลักการ**: เหมือน #1 แต่ลดเกณฑ์จาก "ต่ำกว่าทั้ง 3" เป็น "ต่ำกว่า sentiment2"

**โค้ด**:

```pine
if emaBull and priceLine < sentiment2
    canBuy := true
```

**ผล**: ❌ ยังไม่ครบ — บาง pullback ตื้นไม่ถึง sentiment2

---

### 3. hadFirstDip + crossunder เส้นไหนก็ได้

**หลักการ**: reset canBuy เมื่อ Price ตัดลงผ่านรวบเส้น**เส้นไหนก็ได้**

**โค้ด**:

```pine
bool dipAny = ta.crossunder(priceLine, sentiment1) or ta.crossunder(priceLine, sentiment2) or ta.crossunder(priceLine, sentiment3)
if emaBull and dipAny
    canBuy := true
```

**ผล**: ❌ ยังไม่ครบ — บาง signal ที่ต้นฉบับมี ของเราไม่มี

---

### 4. hadFirstDip + cooldown หลัง signal

**หลักการ**: #1 + หลัง signal เกิดแล้ว canBuy = false ต้อง dip ใหม่

**โค้ด**:

```pine
if buySignal
    canBuy := false  // ล็อคหลัง signal
```

**ผล**: ❌ สัญญาณไม่ครบ — signal ที่เกิดใกล้กันหายหมด

---

### 5. Cooldown N แท่ง (bars-based)

**หลักการ**: หลัง signal ต้องรออย่างน้อย N แท่งก่อน signal ถัดไป

**โค้ด**:

```pine
var int lastBuyBar = 0
int cooldownBars = 3  // หรือ 1
bool buyCoolOk = bar_index - lastBuyBar > cooldownBars
if buySignal
    lastBuyBar := bar_index
```

**ผล**:

- N=3: ❌ สัญญาณไม่ครบ (กัน signal ที่ห่างกัน 2-3 แท่ง)
- N=1: ❌ ยังไม่ครบ (กัน signal แท่งติดกัน)

---

### 6. Flat EMA Detect (ON - Hide)

**หลักการ**: ถ้า EMA 8-14 ชิดกัน (gap < ATR x threshold) → ซ่อน signal

**ผล**: ❌ กรองเกิน — signal ที่ถูกต้องในเทรนช้าก็โดนซ่อนไปด้วย
ปัญหา: threshold ยากที่จะจูนให้กรองแค่ส่วนเกินโดยไม่กรองส่วนที่ถูก

---

### 7. รวบเส้นทั้ง 3 ต้องเหนือ/ใต้ bbMa

**หลักการ**: เปลี่ยนจากเช็คแค่เส้นที่ถูกตัด เป็นทั้ง 3 ต้องอยู่ด้านเดียว

**โค้ด**:

```pine
bool allAboveMid = sentiment1 > bbMa and sentiment2 > bbMa and sentiment3 > bbMa
bool crossUpAboveMid = (xUp1 or xUp2 or xUp3) and allAboveMid
```

**ผล**: ยังไม่ได้ลอง

---

## Scenario ที่ยังไม่ได้ลอง

### ~~A. รวบเส้นทั้ง 3 เหนือ/ใต้ bbMa~~ ❌ ลองแล้ว — สัญญาณไม่ครบ

- กรองเข้มเกินไป — บาง signal ที่ถูกต้องมีแค่ 1-2 เส้นเหนือ bbMa

### ~~B. จำกัด 1 signal ต่อ 1 EMA cross cycle~~ ❌ ลองแล้ว — สัญญาณหายเยอะมาก

- 1 รอบ EMA cross มี signal หลายตัว ต้นฉบับก็มีหลายตัว

### C. Price Line ต้องเหนือ/ใต้ bbMa

- เพิ่มเงื่อนไข: Price Line เองต้องอยู่ฝั่งถูกด้วย

### D. EMA 8 > 14 > 60 เข้มงวด

- ต้อง `ema8 > ema14 > ema60` ครบ ไม่ใช่แค่ `emaBull + ema14>ema60`

### E. Cooldown per-line (ไม่ใช่ per-signal)

- Track ว่าแต่ละเส้น (sent1, sent2, sent3) เคย fire แล้วหรือยังในรอบ pullback นี้

### ~~F. ใช้ sentiment2 (period 8) แทนรวบเส้น 3 เส้น~~ ❌ ลองแล้ว — สัญญาณไม่ครบ

- บาง signal ต้นฉบับเกิดจากตัด sent1 หรือ sent3 ไม่ใช่ sent2

### ~~G. Cooldown based on Price crossing below sentMax~~ ❌ ลองแล้ว — สัญญาณไม่ครบ

- เงื่อนไขเบาสุดแล้วแต่ยังบล็อค signal ที่ไม่มี pullback

---

## บันทึก

- ต้นฉบับใช้ "Break Retest" เป็นหลัก
- สัญญาณที่**เกิน**มักเป็นช่วง EMA ค่อนข้างแบน หรือ pullback ตื้นที่ Price แค่แตะรวบเส้นแล้วกลับ
- สัญญาณที่ครบคือเวอร์ชัน baseline (ไม่มี filter พิเศษ)

