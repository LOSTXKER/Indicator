# OVS/OVB Marker Logic — Auto Fibo Pullback

เอกสารอธิบายหลักการของระบบ Mark จุด OVS (Oversold) และ OVB (Overbought) ของไฟล์ `auto-fibo-pullback.pine`

---

## 1. เป้าหมายของระบบ

ทำเครื่องหมายจุด **price extremes** ที่สอดคล้องกับวงจรของ Stochastic Oscillator:

- **OVS (Oversold marker, ◆ cyan)** — จุด **low** ของ cycle
- **OVB (Overbought marker, ◆ orange)** — จุด **high** ของ cycle

Stochastic ใช้:

- `kVal = SMA(stoch(close, high, low, kPeriod), slowing)` — K-line ที่ smooth แล้ว
- `i_ovsLevel` (default 20) — เส้น oversold
- `i_ovbLevel` (default 80) — เส้น overbought

---

## 2. ข้อกำหนด (Requirements)

ที่ user ต้องการพร้อมกันทั้ง 3 ข้อ:


| #   | Requirement             | คำอธิบาย                                               |
| --- | ----------------------- | ------------------------------------------------------ |
| R1  | **Alternation**         | Marker บนกราฟต้องสลับ OVB → OVS → OVB → OVS เสมอ       |
| R2  | **Absolute extremes**   | OVS อยู่ที่ low จริง (รวม wick), OVB อยู่ที่ high จริง |
| R3  | **Stoch-driven cycles** | Cycle boundary กำหนดโดย K crossings (`K>80`, `K<20`)   |


> ⚠️ **R1 กับ R2 ขัดกันเองในบางเคส** (ดูหัวข้อ "Trade-off") — เราเลือกแก้แบบ hybrid

---

## 3. State Machine

```text
        K > i_ovbLevel (80)
   ┌───────────────────────────┐
   │                           ▼
SM_WAIT_OVS              SM_WAIT_OVB
(track lowest low)       (track highest high
 finalize OVS @ K>80)     finalize OVB @ K<20)
   ▲                           │
   │                           │
   └───────────────────────────┘
        K < i_ovsLevel (20)
```

### State: `SM_WAIT_OVS`

- กำลังรอยืนยัน OVS marker
- Track `ovsLo` = lowest low ที่เจอใน rising phase
- พบ `K > 80` → **finalize OVS** ที่ตำแหน่ง `ovsLo` → transition เข้า `SM_WAIT_OVB`

### State: `SM_WAIT_OVB`

- กำลังรอยืนยัน OVB marker
- Track `ovbHi` = highest high ที่เจอใน falling phase
- Track `lowSincePeak` (ดูหัวข้อ 5)
- พบ `K < 20` → **finalize OVB** ที่ตำแหน่ง `ovbHi` → transition เข้า `SM_WAIT_OVS`

---

## 4. ปัญหาที่เจอตอนพัฒนา

### เคส A — H2 Stacking (alternation พัง)

H2 timeframe มี bar ใหญ่ K กระโดด `>80 → <20` ในไม่กี่บาร์ → เคย track `ovbHi` ตั้งแต่ `SM_WAIT_OVS` → OVB marker ไปกองอยู่บาร์เดียวกับ OVS → เห็นเป็น `OVB OVB OVS OVS`

**Fix:** Reset `ovbHi := _h, ovbHiT := _t` ที่ K>80 trigger bar → OVB ขยับได้แค่หลัง trigger เท่านั้น

### เคส B — OVS ไม่อยู่ที่ wick ต่ำสุด (extremes พัง)

ภายใน cycle เดียวกัน (between OVB คนหนึ่งกับอีกคนหนึ่ง) มี wick ที่ลงต่ำกว่า OVS marker → user ต้องการให้ marker ขยับไปที่ wick

**ลองครั้งแรก (Option C แบบหลวม):** ขยับ OVS ทุก low ที่ต่ำกว่า → **break alternation** เพราะ OVS ขยับเลย OVB peak ไป → เห็น `OVB OVB OVS OVS OVB`

### เคส C — Wick หลัง peak (alternation พังอีกที)

Wick ต่ำที่อยู่ **หลัง** final peak ของ cycle → ถ้าขยับ OVS ไปที่ wick นี้ → time order: `OVB → OVS` ภายใน cycle → กลายเป็น `OVB OVB OVS OVS`

---

## 5. Solution — Bounded Marker Movement (ทั้ง OVS และ OVB)

### 5.1 Bounded OVS Movement (ใน `SM_WAIT_OVB`)

#### หลักการ

> **OVS ขยับได้เฉพาะ wick ที่อยู่ระหว่าง 2 peaks** ใน `SM_WAIT_OVB`
> ถ้าหลัง wick ไม่มี peak ใหม่จนถึง K<20 → wick นั้นคือ **pending OVS ของรอบถัดไป** ไม่ใช่ของรอบปัจจุบัน

#### Tracker ที่ใช้


| Field                           | ความหมาย                                         | ใช้ตอนไหน     |
| ------------------------------- | ------------------------------------------------ | ------------- |
| `ovsLo`, `ovsLoT`               | Pending OVS ของ cycle ที่กำลัง track             | `SM_WAIT_OVS` |
| `ovbHi`, `ovbHiT`               | Running peak ของ cycle                           | `SM_WAIT_OVB` |
| `lockedOvsLbl`                  | Ref ไป OVS marker ที่ finalize แล้วแต่ยังขยับได้ | `SM_WAIT_OVB` |
| `lockedOvsLo`, `lockedOvsLoT`   | ราคา/เวลาของ OVS ที่ locked                      | `SM_WAIT_OVB` |
| `lowSincePeak`, `lowSincePeakT` | Lowest low ตั้งแต่ peak ล่าสุด                   | `SM_WAIT_OVB` |


#### Flow ใน `SM_WAIT_OVB`

```text
ทุกบาร์:
  ถ้า _h > ovbHi:                           # เจอ peak ใหม่
    ┌─ commit lowSincePeak:
    │     ถ้า lowSincePeak < lockedOvsLo:
    │         → ขยับ lockedOvsLbl ไป lowSincePeak
    │         → update prevOvsLo (สำหรับ trend HL/LL + DN Fibo รอบถัดไป)
    └─ ovbHi := _h
       lowSincePeak := na          # reset เริ่ม track ใหม่หลัง peak นี้
       updateOvbPending(_t, _h)
  
  ไม่ใช่ peak ใหม่:
    ถ้า _l < lowSincePeak:
      lowSincePeak := _l           # track lowest หลัง peak ล่าสุด

  ถ้า _isOvs (K<20):                # cycle จบ
    ├─ finalize OVB
    ├─ lockedOvsLbl := na          # lock OVS (ขยับไม่ได้แล้ว)
    └─ pending OVS รอบถัดไป:
         ถ้า lowSincePeak < _l:    # wick หลัง final peak ต่ำกว่า trigger bar
           ovsLo := lowSincePeak
         else:
           ovsLo := _l              # ใช้ trigger bar
```

#### ทำไมถึงรักษา Alternation ได้

- OVS marker ขยับได้เฉพาะตอน **เจอ peak ใหม่** → guarantees ว่า OVS time **< new peak time**
- Final peak (= OVB position) จะอยู่ **หลัง** OVS เสมอ
- Wick หลัง final peak ถูกโยนไปรอบถัดไป → **ไม่** กลายเป็น OVS ของรอบปัจจุบัน

#### Visualization

```text
เคสที่ขยับได้ (wick ก่อน final peak):

Price ─┐                                    
       │       ╱╲ (peak A)      ╱╲ (peak B = ovbHi sudah)
       │      ╱  ╲              ╱  ╲
       │ ◆OVS    ╲      ╱╲    ╱
       │           ╲   ╱  ╲  ╱
       │            ╲ ╱    ╲╱
       │             ╲ wick (ขยับ OVS ไปตรงนี้ ตอน peak B form)
       │              ◆moved
       └────────────────────────────────►
                                            
                K>80 trig          K<20 trig
                
เคสที่ขยับไม่ได้ (wick หลัง final peak):

Price ─┐
       │       ╱╲ (peak = ovbHi)
       │      ╱  ╲
       │ ◆OVS    ╲                              
       │           ╲                            
       │            ╲                           
       │             ╲                  
       │              ╲ wick (→ pending OVS รอบถัดไป)
       │               ◆carry to next
       └────────────────────────────────►
                K>80 trig            K<20 trig
```

### 5.2 Bounded OVB Movement (ใน `SM_WAIT_OVS`)

#### หลักการ

> **OVB ขยับขึ้นได้เฉพาะ wick ที่อยู่ระหว่าง 2 valleys** ใน `SM_WAIT_OVS`
> ถ้าหลัง wick ไม่มี valley ใหม่จนถึง K>80 → wick นั้นถูกทิ้ง (ไม่ carry ไปรอบถัดไป เพื่อป้องกัน H2 stacking)

#### Tracker ที่ใช้ (symmetric กับ OVS)

| Field                                 | ความหมาย                                         | ใช้ตอนไหน     |
| ------------------------------------- | ------------------------------------------------ | ------------- |
| `lockedOvbLbl`                        | Ref ไป OVB marker ที่ finalize แล้วแต่ยังขยับได้ | `SM_WAIT_OVS` |
| `lockedOvbHi`, `lockedOvbHiT`        | ราคา/เวลาของ OVB ที่ locked                      | `SM_WAIT_OVS` |
| `highSinceValley`, `highSinceValleyT` | Highest high ตั้งแต่ valley ล่าสุด               | `SM_WAIT_OVS` |

#### Flow ใน `SM_WAIT_OVS`

```text
ทุกบาร์:
  ถ้า _l < ovsLo:                           # เจอ valley ใหม่
    ┌─ commit highSinceValley:
    │     ถ้า highSinceValley > lockedOvbHi:
    │         → ขยับ lockedOvbLbl ไป highSinceValley
    │         → update prevOvbHi, confOvbHi (สำหรับ trend HH/LH + UP Fibo รอบถัดไป)
    └─ ovsLo := _l
       highSinceValley := na       # reset เริ่ม track ใหม่หลัง valley นี้
       updateOvsPending(_t, _l)

  ไม่ใช่ valley ใหม่:
    ถ้า _h > highSinceValley:
      highSinceValley := _h        # track highest หลัง valley ล่าสุด

  ถ้า _isOvb (K>80):                # cycle จบ
    ├─ finalize OVS
    ├─ lockedOvbLbl := na          # lock OVB (ขยับไม่ได้แล้ว)
    ├─ highSinceValley := na       # ทิ้ง (ไม่ carry ไปรอบถัดไป)
    └─ ovbHi := _h                 # reset เริ่ม track OVB ที่ trigger bar
```

#### ทำไมถึงรักษา Alternation ได้

- OVB marker ขยับได้เฉพาะตอน **เจอ valley ใหม่** → guarantees ว่า OVB time **< new valley time**
- Final valley (= OVS position) จะอยู่ **หลัง** OVB เสมอ
- High หลัง final valley ถูกทิ้ง (ไม่ carry) → ไม่ทำให้ OVB กระโดดเลย OVS

#### ความแตกต่างจาก OVS Movement

- OVS ฝั่ง: `lowSincePeak` หลัง final peak → **carry ไปเป็น pending OVS** รอบถัดไป
- OVB ฝั่ง: `highSinceValley` หลัง final valley → **ทิ้ง** (ไม่ carry) เพื่อป้องกัน H2 stacking ที่เคยเกิด (ovbHi reset ที่ trigger bar ตาม fix เคส A)

---

## 6. Trade-offs ที่รู้และยอมรับ

### 6.1 OVS อาจไม่ใช่ "absolute lowest" ของ cycle

ถ้า lowest low อยู่หลัง final peak → marker ของ cycle นั้นไม่ได้อยู่ที่ low จริง (ไปอยู่กับรอบถัดไปแทน)

**เหตุผลที่ยอม:** เพื่อรักษา R1 (alternation)

### 6.2 Fibo อาจ stale หลัง marker ขยับ

**UP Fibo** สร้างตอน K>80 ใช้ `_sLo, _sLoT` snapshot — ถ้า OVS ขยับใน `SM_WAIT_OVB` ภายหลัง → Fibo anchor ยังอยู่ที่เดิม (stale)

**DN Fibo** สร้างตอน K<20 ใช้ `_fHi, _fHiT` snapshot — ถ้า OVB ขยับใน `SM_WAIT_OVS` ภายหลัง → Fibo anchor ยังอยู่ที่เดิม (stale)

ทั้งสองกรณี Fibo ของ **รอบถัดไป** ใช้ `prevOvsLo` / `prevOvbHi` ที่อัปเดตแล้ว → ถูกต้อง

**TODO ถ้าจะแก้:** Recreate Fibo เมื่อ marker ขยับ (หรือใช้ shared reference)

### 6.3 Deferred Confirmation

Marker ไม่ได้ confirm ทันทีที่ finalize แต่จะ confirm ต่อเมื่อ **marker ตัวถัดไปของ type เดียวกัน** ปรากฏ:

- OVS(N) confirm เมื่อ OVS(N+1) ถูก finalize
- OVB(N) confirm เมื่อ OVB(N+1) ถูก finalize

**Visual:** marker ที่ยัง unconfirmed แสดงเป็น **semi-transparent** (60% transparency), เมื่อ confirm แล้วเปลี่ยนเป็น **solid color**

**Tracker:** `unconfOvsLbl` / `unconfOvbLbl` — ref ไป marker ที่รอ confirmation

**การขยับ:** ใช้ bounded movement เดิม (หัวข้อ 5) เท่านั้น — marker lock ที่ phase transition (K<20 lock OVS, K>80 lock OVB) เพื่อรักษา alternation

### 6.4 H2 ที่ K กระโดด >80→<20 ในบาร์เดียว

- OVS marker จะอยู่ที่ K>80 trigger bar
- OVB marker จะอยู่ที่ K<20 trigger bar (ถัดไป)
- ทั้งสองอาจอยู่ติดกันมาก (visual overlap) แต่ alternation ยังถูก

---

## 7. Cycle Lifecycle (Reference)

```text
Cycle N timeline:

  [K<20 prev]                                              [K<20 curr]
       │                                                        │
       ▼                                                        ▼
  ┌────────────────┬─────────────────────────────────────┐
  │  SM_WAIT_OVS   │           SM_WAIT_OVB                │
  │                │                                       │
  │  track ovsLo   │  track ovbHi                         │
  │  (rising)      │  track lowSincePeak                  │
  │  track         │  ขยับ OVS marker (ถ้า peak ใหม่)     │
  │  highSinceV.   │                                       │
  │  ขยับ OVB      │                                       │
  │  marker (ถ้า   │                                       │
  │  valley ใหม่)  │                                       │
  │                │                                       │
  │       [K>80]   │                                       │
  │       finalize │                                       │
  │       OVS marker──► lockedOvsLbl (ขยับได้)            │
  │       lock OVB │                                       │
  │                │                                       │
  │                │                       finalize OVB ──┤──► lockedOvbLbl (ขยับได้ใน next SM_WAIT_OVS)
  │                │                       lock OVS ──────┤
  │                │                       carry          │
  │                │                       lowSincePeak ──┤──► next cycle's ovsLo
  └────────────────┴─────────────────────────────────────┘
```

---

## 8. ความสัมพันธ์กับ Fibo Sets

- **UP Fibo** (สร้างตอน K>80, cycle N OVS confirm)
  - Anchor: `prevOvbHi` (cycle N-1's OVB) → `_sLo` (cycle N's OVS, ตอนนั้น)
  - หมวด HK / SB ตาม trend HL/LL
- **DN Fibo** (สร้างตอน K<20, cycle N OVB confirm)
  - Anchor: `prevOvsLo` (cycle N's OVS, **อัปเดตล่าสุด** ถ้าขยับ) → `_fHi` (cycle N's OVB)
  - หมวด HK / SB ตาม trend HH/LH

ระบบ trend (`trendAfterOvs` / `trendAfterOvb`) ทำงานบน `prevOvsLo` / `prevOvbHi` ที่อัปเดตทุกครั้งที่ marker ขยับ — ดังนั้น HL/LL/HH/LH คำนวณบน position สุดท้ายเสมอ

---

## 9. Lessons Learned

1. **เขียน invariant ก่อน code** — เคสนี้วนหลายรอบเพราะ R1 (alternation) กับ R2 (extremes) ขัดกันโดยไม่ได้นั่งเขียน trade-off ตั้งแต่แรก
2. **Edge timeframes (H2) เป็น stress test ที่ดี** — bar ใหญ่ทำให้ assumptions ที่ซ่อนอยู่ใน TF ปกติ ถูกเปิดโปง
3. **"Movable marker" pattern** ใช้ได้แต่ต้องมี **bounded window** ชัดเจน (ในเคสนี้คือ "ระหว่าง 2 peaks") ไม่งั้นจะหลุด invariant

