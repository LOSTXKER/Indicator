# OVS/OVB Marker Logic — Auto Fibo Pullback

เอกสารอธิบายหลักการของระบบ Mark จุด OVS (Oversold) และ OVB (Overbought) ของไฟล์ `auto-fibo-pullback.pine`

---

## 1. เป้าหมายของระบบ

ทำเครื่องหมายจุด **price extremes** ที่สอดคล้องกับวงจรของ Stochastic Oscillator:

- **OVS (Oversold marker, ◆ cyan)** — จุด **low ที่ต่ำสุด** ในช่วงระหว่าง 2 OVB
- **OVB (Overbought marker, ◆ orange)** — จุด **high ที่สูงสุด** ในช่วงระหว่าง 2 OVS

Stochastic ใช้:

- `kVal = SMA(stoch(close, high, low, kPeriod), slowing)` — K-line ที่ smooth แล้ว
- `i_ovsLevel` (default 20) — เส้น oversold
- `i_ovbLevel` (default 80) — เส้น overbought

---

## 2. ข้อกำหนด (Requirements)

3 หลักการง่ายๆ ที่ต้องเป็นจริงพร้อมกัน:

| #   | Requirement              | คำอธิบาย                                                          |
| --- | ------------------------ | ----------------------------------------------------------------- |
| R1  | **Alternation**          | Marker ต้องสลับ OVB → OVS → OVB → OVS เสมอ ห้ามซ้อน               |
| R2  | **Absolute extremes**    | OVS = low จริง (รวม wick), OVB = high จริง — ไม่ติดกรอบรอบ Stoch |
| R3  | **Stoch-driven trigger** | K crossings (`K>80`, `K<20`) เป็นแค่ "trigger" ตอน place marker   |

**Key insight**: R3 ใช้ Stoch แค่เป็น *trigger* ไม่ใช่ *boundary* ของการหา extreme

---

## 3. Marker-to-Marker Tracking Model

แทนที่จะให้ K crossings เป็นกรอบของการ track extreme เราใช้ **previous opposite marker** เป็นจุดอ้างอิง:

```text
trkLow  = lowest  low  ตั้งแต่ "OVB marker ก่อนหน้า" จนถึงปัจจุบัน
trkHigh = highest high ตั้งแต่ "OVS marker ก่อนหน้า" จนถึงปัจจุบัน
```

ทั้ง 2 trackers อัปเดต **ทุกบาร์** ไม่สนใจ K trigger หรือ state

### State Machine

```text
        K > i_ovbLevel (80)
   ┌───────────────────────────┐
   │                           ▼
SM_WAIT_OVS              SM_WAIT_OVB
(รอ K>80 → place OVS)    (รอ K<20 → place OVB)
   ▲                           │
   │                           │
   └───────────────────────────┘
        K < i_ovsLevel (20)
```

**State** กำหนดแค่ว่า "ตอนนี้รอ trigger ตัวไหน" — ไม่กระทบการ track extreme

---

## 4. Algorithm

### ทุกบาร์ (`tick`)

```text
if l < trkLow:
    trkLow  = l
    trkLowT = t
    update pending OVS marker (ถ้า state = SM_WAIT_OVS)

if h > trkHigh:
    trkHigh  = h
    trkHighT = t
    update pending OVB marker (ถ้า state = SM_WAIT_OVB)
```

### ตอน K > 80 (state = SM_WAIT_OVS)

```text
1. Place OVS marker ที่ (trkLow, trkLowT)  ← extreme ที่ track มา
2. Update trend / Fibo logic
3. Reset trkLow  = (l, t) ของ trigger bar  ← เริ่ม track ใหม่
4. Validate trkHigh:
     ถ้า trkHighT >= TS (OVS marker time)  → keep (high หลัง OVS = candidate ของ OVB ถัดไป)
     else                                    → reset trkHigh = (h, t)
5. switch to SM_WAIT_OVB
6. แสดง pending OVB marker ที่ (trkHigh, trkHighT)
```

### ตอน K < 20 (state = SM_WAIT_OVB)

```text
1. Place OVB marker ที่ (trkHigh, trkHighT)
2. Update trend / Fibo logic
3. Reset trkHigh = (h, t) ของ trigger bar
4. Validate trkLow:
     ถ้า trkLowT >= TB (OVB marker time)  → keep
     else                                   → reset trkLow = (l, t)
5. switch to SM_WAIT_OVS
6. แสดง pending OVS marker ที่ (trkLow, trkLowT)
```

---

## 5. ทำไมแก้ปัญหาทุกเคส?

### ปัญหาเดิม (ก่อน refactor)

ระบบเดิม track `ovsLo` ใน `SM_WAIT_OVS` และ `ovbHi` ใน `SM_WAIT_OVB` เท่านั้น — ไม่ track ข้าม state

```text
OVS1   ──── OVB1 (4890) ──── V-bottom (4850) ──── peak2 (4885) ──── K>80 (h=4870) ──── K<20
                                                  ↑                  ↑                   ↑
                                            (ก่อน K>80)         (เพิ่ง trigger)   (place OVB ตรงนี้)
```

ในระบบเดิม:
- Cycle 1 ปิด: place OVB1 ที่ 4890 ✓
- SM_WAIT_OVS: track lowest → V-bottom 4850 ✓
- K>80 fires → place OVS2 ที่ 4850 ✓
- เริ่ม SM_WAIT_OVB: `ovbHi` reset ที่ K>80 trigger bar (h=4870)
- 4885 (ก่อน trigger) **หาย!** เพราะระบบไม่ track ก่อน trigger
- K<20 → place OVB2 ที่ 4870 ❌ (user ต้องการ 4885)

### ระบบใหม่ (marker-to-marker)

```text
หลัง place OVB1 (K<20): reset trkHigh = (h@trigger, t)
                                        ↓
SM_WAIT_OVS เริ่ม:
  - V-bottom 4850 → trkLow updates
  - peak2 4885 → trkHigh updates (เพราะ track ทุกบาร์!)
  - K>80 → place OVS ที่ V-bottom
           validate trkHigh: TP(peak2) > TS(V-bottom) → keep ✓
SM_WAIT_OVB ต่อ:
  - trkHigh = 4885 (carry-forward!)
  - K<20 → place OVB ที่ 4885 ✓
```

---

## 6. Validation Rules — ทำไมต้อง validate?

`trkHigh` track ตั้งแต่ **OVS marker ก่อนหน้า** ไม่ใช่ตั้งแต่ K trigger ก่อนหน้า ดังนั้น:

- บางครั้ง trkHigh มี value ที่เกิด **ก่อน** OVS marker ที่เพิ่ง place → invalid
- เช็ค `trkHighT >= ovsMarkerT` — ถ้าใช่ keep, ถ้าไม่ reset

ตัวอย่าง: peak เกิดก่อน V-bottom (เช่นเดียวกัน reverse scenario)

```text
peak (4885)@T1 ──── V-bottom (4850)@T2 ──── K>80@T3
       ↑                ↑
   trkHigh = 4885   trkLow = V-bottom
                    
K>80 fires:
  Place OVS @ V-bottom (T2)
  Validate trkHigh: T1 < T2 → INVALID → reset trkHigh = (h@T3, T3)
  
→ peak 4885 (ก่อน OVS) ไม่กลายเป็น OVB ตัวถัดไป (chronologically ผิด)
```

---

## 7. Cycle Lifecycle

```text
                       OVB1                 OVS2 (V)             OVB2 (peak)
                        ◆                     ◆                     ◆
                        │                     │                     │
       ↑              80 ┼────────────────────┴─────────────────────┼─── K
       │                 │                                          │
       │              20 ┼──────────┬─────────────────┬─────────────┴───
       │                 │          │                 │
       │               OVS1     (K<20)              (K>80)
       │
       │  trkLow:   tracking ─── reset ──── tracking ─── reset ──── tracking
       │  trkHigh:  reset ──── tracking ─── reset ──── tracking ─── reset
       │
       │  state:    SM_WAIT_OVB    SM_WAIT_OVS    SM_WAIT_OVB    SM_WAIT_OVS
```

- ทุก marker placement = **reset opposite tracker** + **validate same-side tracker**
- Marker ไม่เคยขยับหลัง finalize — แม้เจอ extreme ดีกว่า เพราะ
  - ถ้าเป็น extreme หลัง marker → ถูกใช้ในรอบถัดไปแทน
  - ถ้าเป็น extreme ก่อน marker → invalid เสมอ (chronology)

---

## 8. Field Reference — TFEngine

| Field           | ชนิด    | ใช้ทำอะไร                                        |
| --------------- | ------- | ------------------------------------------------ |
| `sm`            | `int`   | State machine: 0=WAIT_OVS, 1=WAIT_OVB            |
| `trkLow`        | `float` | Lowest low ตั้งแต่ OVB marker ก่อนหน้า           |
| `trkLowT`       | `int`   | Time ของ `trkLow`                                |
| `trkHigh`       | `float` | Highest high ตั้งแต่ OVS marker ก่อนหน้า         |
| `trkHighT`      | `int`   | Time ของ `trkHigh`                               |
| `prevOvsLo`    | `float` | Value ของ OVS marker ก่อนหน้า (สำหรับ trend/Fibo) |
| `prevOvsLoT`   | `int`   | Time ของ OVS marker ก่อนหน้า                     |
| `prevOvbHi`    | `float` | Value ของ OVB marker ก่อนหน้า                    |
| `prevOvbHiT`   | `int`   | Time ของ OVB marker ก่อนหน้า                     |
| `confOvbHi`    | `float` | OVB confirmed (สำหรับ UP Fibo)                   |
| `confOvbHiT`   | `int`   | Time ของ confirmed OVB                           |
| `trend`         | `int`   | -2/-1/0/1/2 (DN warn / DN / neutral / UP / UP warn) |
| `curOvsLbl`    | `label` | Pending OVS marker (จะ finalize ตอน K>80)        |
| `curOvbLbl`    | `label` | Pending OVB marker (จะ finalize ตอน K<20)        |

---

## 9. Trend Logic (Two-Strike System)

หลังจาก marker ถูก place ระบบอัปเดต trend ตามคอนเซป "two-strike":

### After OVS placement
- `isHL` (Higher Low: OVS ใหม่ > OVS เก่า)
- `isLL` (Lower Low: OVS ใหม่ < OVS เก่า)

### After OVB placement
- `isHH` (Higher High: OVB ใหม่ > OVB เก่า)
- `isLH` (Lower High: OVB ใหม่ < OVB เก่า)

### Transition table

| Current Trend | Event | New Trend | ความหมาย                       |
| ------------- | ----- | --------- | ------------------------------ |
| 0 (neutral)   | HL    | 2 (⚠HL)   | warn: เริ่มยก low → strike 1   |
| 0             | LL    | -1 (DN)   | confirmed downtrend            |
| 2 (⚠HL)       | HH    | 1 (UP)    | strike 2 confirmed UP          |
| 1 (UP)        | LH    | -2 (⚠LH)  | warn: ทำ high ต่ำลง → strike 1 |
| -2 (⚠LH)      | LL    | -1 (DN)   | strike 2 confirmed DN          |
| -2            | HH    | 1 (UP)    | recover ก่อน strike 2          |

→ **Trend เปลี่ยนต้องใช้ 2 sequential confirmations** (warning ก่อน → confirm จริง)

---

## 10. Fibo Logic

- **UP Fibo (target)** — สร้างตอน K>80 (place OVS ใหม่) ใช้ `confOvbHi` (ตัวก่อนหน้า) → `prevOvsLo` (ใหม่)
- **DN Fibo (target)** — สร้างตอน K<20 (place OVB ใหม่) ใช้ `prevOvsLo` (ก่อนหน้า) → `confOvbHi` (ใหม่)
- **Entry Fibo** — สร้างทุกครั้งคู่กับ target Fibo สำหรับ entry zone (ใช้ระดับ 0.618/0.786)

ทั้งหมด reference จุด **OVS/OVB ที่ถูก place ตาม marker-to-marker model** — ไม่มีการอ้างอิงตำแหน่ง K trigger โดยตรง

---

## 11. ข้อดีของ Model นี้

1. **เรียบง่าย** — แค่ 2 trackers + reset/validate rules
2. **จับ extreme จริง** — ไม่หลุด peak/valley ที่เกิดก่อน K trigger
3. **Alternation รักษา 100%** — chronology check ป้องกัน marker ซ้อนตำแหน่ง
4. **Marker ไม่ขยับ** — placed = locked (ลบ `lockedOvsLbl`/`lockedOvbLbl` ทิ้งได้)
5. **MTF compatible** — engine ทุก TF ใช้ logic เดียวกันโดยไม่เพี้ยน

---

## 12. Lessons Learned

- **อย่าผูก extreme tracking กับ K trigger** — Stoch lag ทำให้พลาด extreme จริง
- **Marker-to-marker > K-to-K** — ใช้ marker ก่อนหน้าเป็นกรอบ ตรง intent ผู้ใช้
- **Validate via timestamp comparison** — ถูกกว่าและง่ายกว่า "บังคับ reset ที่ trigger"
- **Continuous tracking + state-driven visual update** — แยก concern ระหว่าง logic กับ UI
