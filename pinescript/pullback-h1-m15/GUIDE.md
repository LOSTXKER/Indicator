# LX Pullback H1 + M15 TDI Confirm

อินดิเคเตอร์จับจังหวะ **Pullback** ตามเทรน H4 — ใช้ H1 เป็น setup, M15 TDI เป็น trigger

## Logic หลัก

| ลำดับ | เงื่อนไข | TF |
|------|----------|-----|
| 1. Bias | `close > EMA60` = Buy bias / `close < EMA60` = Sell bias | **H4** |
| 2a. TDI | Price line (RSI13) เหนือ Mid band (SMA31 ของ RSI) = Buy / ใต้ = Sell | **H1** |
| 2b. EMA touch | แท่ง H1 มี wick แตะ EMA14 หรือ EMA60 (`low ≤ EMA ≤ high`) | **H1** |
| 3. M15 TDI PB | State machine — price line ต้องผ่าน 4 ขั้นตอนตามลำดับ (ดูด้านล่าง) | **M15** |

ครบทั้ง 3 ข้อพร้อมกัน → ยิงสัญญาณ **PB** (ลูกศร + label) ฝั่งตามทิศ bias

### ข้อ 3 — M15 TDI Pullback State Machine (Buy)

```
State 0  ──cross UP mid──►  State 1  ──cross UP slow──►  State 2
                                                            │
                                                     cross DN slow
                                                            │
                                                            ▼
                        PB SIGNAL! ◄──cross UP slow──  State 3
```

- **State 0**: รอ price line ตัดขึ้นเหนือ Mid
- **State 1**: ตัดขึ้น Mid แล้ว → รอตัดขึ้นเหนือ Slow MA (Sentiment)
- **State 2**: ตัดขึ้น Slow แล้ว → รอตัดลงใต้ Slow (pullback เกิด)
- **State 3**: ตัดลง Slow แล้ว → รอตัดขึ้น Slow อีกครั้ง → **PB Buy!**

> หาก price line กลับไปใต้ Mid → **reset กลับ State 0**
> หลังยิง signal → กลับ State 2 (พร้อมจับ pullback ถัดไป)

**Sell = กลับทิศทั้งหมด** (cross DN mid → cross DN slow → cross UP slow → cross DN slow = PB Sell)

## วิธีใช้

1. โหลดไฟล์ `pullback-h1-m15.pine` ใน TradingView (Pine Editor → Save)
2. Add to chart — **แนะนำดูบน M15** (condition 3 ทำงานบน M15)
   - บน M15: สัญญาณ H1 ใช้ค่าแท่งที่ปิดแล้ว (ไม่ repaint), M15 state machine ทำงานบน bar ปัจจุบัน
   - บน H1: H1 conditions ตรง, M15 signal จับจาก bar_index tracking (อาจพลาดบ้างถ้า signal ยิง-ดับภายใน H1 เดียว)
3. ตั้ง alert: เลือก condition `PB Buy` หรือ `PB Sell`

## องค์ประกอบบนชาร์ต

- **เส้นฟ้า** = H1 EMA14
- **เส้นม่วง** = H1 EMA60
- **เส้นเหลือง** = H4 EMA60 (เส้น bias)
- **พื้นหลังเขียวจาง** = H4 buy bias zone
- **พื้นหลังแดงจาง** = H4 sell bias zone
- **▲ PB เขียว** ใต้แท่ง = สัญญาณ Buy pullback
- **▼ PB แดง** เหนือแท่ง = สัญญาณ Sell pullback

## Inputs

| Group | Setting | ค่าเริ่มต้น |
|-------|---------|-----------|
| H4 BIAS | EMA Length | 60 |
| H1 EMA TOUCH | EMA Fast / Slow | 14 / 60 |
| | Allow touch EMA14 / EMA60 | true / true |
| TDI (shared) | RSI Period | 13 |
| | Band Length (Mid SMA) | 31 |
| | Price Line Period | 1 |
| | Sentiment Slow MA (M15) | 9 |
| DISPLAY | Show H1/H4 EMAs, label | true |

## หมายเหตุ Repaint

- ทุก `request.security()` ใช้ `barmerge.lookahead_off`
- H1/H4 data บน chart M15 จะใช้ `[1]` เพื่อให้สัญญาณคงที่หลัง bar ปิด
- M15 state machine ใช้ `var` state → ไม่ repaint ย้อนหลัง
- ตำแหน่งลูกศรจะ **ไม่เลื่อน** หลัง bar ปิด
