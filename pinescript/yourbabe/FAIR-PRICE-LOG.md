# Fair Price Filter Experiments Log

> ปัญหา: เมื่อต้นฉบับเปิด Fair Price → สัญญาณบางจุดหาย (ราคา overextended)
> เป้าหมาย: หาวิธีวัด "Fair Price" ที่ตรงกับต้นฉบับ

---

## ข้อสังเกตจากภาพต้นฉบับ

- Fair Price **ปิด**: มีสัญญาณครบ
- Fair Price **เปิด**: สัญญาณหายบางจุด (ช่วงราคาวิ่งไกลจาก EMA)
- สัญญาณที่หาย = ช่วงที่ราคา overextended (ห่างจาก EMA มาก)

---

## Scenario ที่ลองแล้ว

### ~~1. ระยะจาก EMA14 หรือ EMA60 (or)~~ ❌

```pine
isFairPrice = abs(close - ema14) < ATR * 2.0 or abs(close - ema60) < ATR * 3.0
```

**ผล**: แทบไม่กรองเลย เพราะ EMA14 ตามราคาใกล้เสมอ → `or` ทำให้ผ่านง่าย

### ~~2. ระยะจาก EMA60 อย่างเดียว~~ ❌

```pine
isFairPrice = abs(close - ema60) < ATR * fairPriceX
```

**ผล**: ปรับ 0.5 ก็ยังมีสัญญาณ (ไม่แน่ใจว่า logic ถูก) → ยังไม่ตรงต้นฉบับ

---

## Scenario ที่ยังไม่ได้ลอง

### ~~A. ระยะจาก EMA14 และ EMA60 (and)~~ ❌ ลองแล้ว — กรองเกิน

- ค่า 2.0 ก็กรองสัญญาณที่ถูกออกแล้ว — EMA14 ตาม close ใกล้เกินไปทำให้วัดไม่แม่น

### B. ราคาอยู่ระหว่าง EMA14 กับ EMA60 (Value Zone)

```pine
isFairPrice = (close >= math.min(ema14, ema60) and close <= math.max(ema14, ema60))
```

- ราคา pullback เข้ามาใน zone ระหว่าง EMA14 กับ 60

### C. ราคาอยู่ระหว่าง EMA14 กับ EMA60 หรือใกล้ EMA14

```pine
inZone = close >= min(ema14, ema60) and close <= max(ema14, ema60)
nearEma14 = abs(close - ema14) < ATR * 1.5
isFairPrice = inZone or nearEma14
```

- Value Zone + ยอมให้ใกล้ EMA14 ก็ผ่าน (pullback ตื้น)

### D. % ห่างจาก EMA60

```pine
isFairPrice = abs(close - ema60) / ema60 * 100 < threshold_pct
```

- วัดเป็น % ไม่ใช่ ATR

### E. ระยะจาก HTF EMA60 (M15)

```pine
isFairPrice = abs(close - htfEma60) < ATR * X
```

- วัดจาก HTF EMA แทน current TF

### F. Candle position — ราคาปิดใกล้ EMA (ไม่ใช่ close ปัจจุบัน)

```pine
isFairPrice = abs(close[1] - ema60[1]) < ATR * X
```

- เช็คแท่งก่อนหน้าแทน

### G. EMA14-EMA60 spread ไม่กว้างเกิน

```pine
isFairPrice = abs(ema14 - ema60) < ATR * X
```

- ถ้า EMA14 กับ 60 ห่างกันมาก = overextended ทั้ง trend

### ~~H. TDI Price Line ไม่ Overbought/Oversold~~ ❌ ลองแล้ว — กรองผิดจุด

- RSI 70 ทำให้สัญญาณที่ถูกหาย + สัญญาณที่ผิดยังอยู่
- RSI ไม่ใช่ตัววัด Fair Price ของต้นฉบับ

### I. TDI Price Line ไม่ไกลจาก รวบเส้น

```pine
isFairPrice = abs(priceLine - sentiment2) < threshold
```

- ราคาใน TDI ต้องอยู่ใกล้รวบเส้น (ไม่ overextended ในมุม momentum)

---

## สถานะปัจจุบัน

`isFairPrice = true` (placeholder — ไม่กรอง) รอทดสอบ scenario