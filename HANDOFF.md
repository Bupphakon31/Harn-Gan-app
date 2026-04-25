# HANDOFF.md — Harn-Gan Agent Handoff Log

> อัปเดตทุกครั้งที่มีการเปลี่ยนแปลง ไฟล์นี้คือ source of truth สำหรับ agent ตัวต่อไป

---

## สถานะปัจจุบัน

- **Phase:** 2 (React + Vite frontend in `harn-gan-v2`)
- **Stack:** React, Vite, Tailwind CSS, Lucide React, Decimal.js
- **Entry point:** `harn-gan-v2/src/main.jsx`
- **Frontend:** `harn-gan-v2/src/App.jsx`, `harn-gan-v2/src/components`, `harn-gan-v2/src/index.css`
- **Calculation logic:** still relies on `POST /api/calculate` for now
- **Plan อ้างอิง:** `AGENT.md` (tech stack Phase 2) + `HANDOFF.md` (source of truth)

---

## Product Direction Update

Harn-Gan ถูกล็อกทิศทางเป็น **split-first, payment-agnostic**

### เป้าหมายหลักของผลิตภัณฑ์
- แก้ปัญหาการหารค่าอาหารให้ดีที่สุด
- เน้นความแม่นยำ ความแฟร์ และความชัดเจนของผลลัพธ์
- ให้ผู้ใช้เอาผลคำนวณไปจ่ายกันเองตามช่องทางที่ถนัด
- ไม่ทำตัวเป็นแอปโอนเงิน / payment workflow แบบธนาคาร

### สิ่งที่ควรเป็น core
- item-based split
- even split
- free people
- late joiners
- service charge / VAT / shipping / discount
- settlement clarity ว่าใครควรจ่ายเท่าไร

### สิ่งที่ควรเป็น support feature
- export bill เป็นภาพ 1 หน้า
- copy/share summary
- PDF export เป็น phase ถัดไปถ้าจำเป็น

### สิ่งที่ไม่ใช่ scope หลัก
- payment tracking
- transfer confirmation
- bank integration
- reminder system เรื่องโอนเงิน

---

## สิ่งที่ทำเสร็จแล้ว (Phase 1)

### ✅ UI Refresh — Layout & Design System
- ปรับ `public/index.html` เป็น layout ใหม่:
  - `top-strip` hero card แบบ compact พร้อม trust cues 3 ใบ
  - `wizard` card เป็น multi-step form หลัก
  - `stepper` navigation 4 ขั้นตอน: รูปแบบ → คนและรายการ → ค่าเพิ่ม → วิธีจ่าย
  - `results` card แยกด้านล่าง พร้อม summary strip + result grid
- ปรับ `public/css/style.css` เป็น design system soft pastel:
  - CSS custom properties ครบ: colors, spacing scale, radius scale, shadows
  - Button variants: `btn-primary`, `btn-secondary`, `btn-ghost`, `icon-btn`
  - Card hierarchy 3 ระดับ: `.card` → `.section-card` → `.entry-card`
  - Responsive breakpoints: 1080px, 820px, 620px
  - Mobile: stepper scroll horizontal, entry-grid stack, summary cards แทน table

### ✅ Step Navigation
- Stepper แสดงสถานะ: `is-current`, `is-complete`, `is-locked`, `is-error`
- กด step ย้อนกลับได้ทันที, กด step ข้ามหน้าต้อง validate ผ่านก่อน
- Meta pills แสดง "ขั้นตอนปัจจุบัน" และ "ความคืบหน้า X/4"

### ✅ Step 2 — Friends & Items
- Friend rows และ item rows เป็น `.entry-card` แยกชัด
- Eater chip buttons toggle ชื่อเพื่อนเข้า/ออกจาก eaters input
- Preview pills แสดง count เพื่อน / รายการ / คนมาทีหลัง แบบ real-time
- Status chip บอก "ข้อมูลพร้อมแล้ว" / "ยังกรอกไม่ครบ"
- **Empty states** — friendsContainer และ itemsContainer แสดง dashed hint เมื่อว่าง
- **Late joiner preview pill** — เปลี่ยนสีเป็น accent เมื่อ detect late joiner ได้
- ลบ row ได้ทุก row (ไม่ lock row สุดท้ายไว้แล้ว ใช้ empty state แทน)

### ✅ Step 3 — Extra Charges
- Field grid 2 คอลัมน์ (desktop) / 1 คอลัมน์ (mobile)
- Helper text ใต้แต่ละ field
- **Free people section ถูกย้ายออกจาก Step 3 แล้ว** → ไปอยู่ใน Step 4

### ✅ Step 4 — Payment Mode
- Choice cards: คนเดียวออกก่อน / หลายคนช่วยกันจ่าย
- Single payer: dropdown เลือกชื่อ
- Multi payer: checkbox เลือกคน + field ใส่จำนวนเงินจ่ายจริง
- **Free people section อยู่ท้าย Step 4** (optional card พร้อม toggle switch)
- Payment mode note อธิบาย output ที่จะได้

### ✅ Results Section
- Summary strip 4 ช่อง: ยอดรวม / รูปแบบ / วิธีจ่าย / จำนวนคน
- Per-person summary: cards (mobile) + table (desktop)
- Settlement card: single payer breakdown / multi payer pay-receive-exact
- Cost breakdown: subtotal, service charge, VAT, shipping, discount, grand total
- Late joiners table (hidden ถ้าไม่มี)

### ✅ Custom Modal — เพิ่มคนมาทีหลัง
- แทน `window.prompt()` ด้วย custom modal `#lateJoinerModal`
- Styled ด้วย design system เดิม (soft pastel, border-radius, shadow)
- รองรับ: ปุ่มยกเลิก, ปุ่มเพิ่มเลย, Enter confirm, Escape cancel, click outside close

### ✅ Copy & Thai text cleanup
- แก้ label หลักใน `index.html`: Service charge → ค่าบริการ, VAT → ภาษีมูลค่าเพิ่ม VAT, Supporting details → รายละเอียด, Late joiners → คนมาทีหลัง, Settlement → การชำระเงิน, Bill Wizard → ตั้งค่าบิล, Result → ผลลัพธ์
- แก้ `app.js`: Service charge/VAT ใน cost breakdown, error messages ให้สั้นและบอกวิธีแก้ชัดเจนขึ้น
- Field-level validation พร้อม scroll to first error
- Step error state แสดงบน stepper node
- `refreshDependentViews()` sync ทุก dependent UI เมื่อข้อมูลเปลี่ยน
- Sticky action footer (ย้อนกลับ / ถัดไป / คำนวณบิล)
- Reset form กลับ step 1 พร้อมล้างทุก state (ไม่ pre-add rows แล้ว ใช้ empty state)

---

## สิ่งที่ยังไม่ได้ทำ (Phase 1 — Remaining)

### 🔲 Mobile testing pass
- ทดสอบจริงที่ 360px: ทุก input กดง่ายด้วยนิ้ว
- ตรวจ action buttons มองเห็นชัดโดยไม่ต้องเลื่อนมาก
- ต้องทดสอบบน browser จริง ทำ code ไม่ได้

---

## Phase 2 — กำลังดำเนินการ

ย้าย frontend ไป React + Vite + Tailwind + Lucide + Decimal.js ตาม `AGENT.md`

Components ที่วางแผนไว้:
- `AppShell`, `BillWizard`
- `StepMode`, `StepParticipants`, `StepCharges`, `StepPayment`
- `ResultSummary`, `ResultSettlement`

### สิ่งที่ทำเสร็จแล้ว (Phase 2)
- สร้างโปรเจกต์ Vite React ใน `harn-gan-v2`
- ติดตั้ง `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `decimal.js`
- สร้าง `AppShell` และ `BillWizard` เพื่อแยก layout และ wizard logic
- ย้าย UI Phase 1 เข้า React components และใช้ Tailwind classes
- แทนที่ emoji hero cards ด้วยไอคอน Lucide
- ใช้ `Decimal.js` ในการคำนวณ subtotal และการแสดงผลสกุลเงิน
- ปรับปรุง validation ใน Step 4 ให้รองรับโหมดหลายคนจ่าย และตรวจสอบยอดรวมก่อนคำนวณ
- ไม่ให้ข้ามไป Step 3 ถ้ายังไม่มีเพื่อนอย่างน้อย 1 คนและรายการอาหารอย่างน้อย 1 รายการ
- ให้ Step 3 เป็น optional skip ได้เมื่อค่าค่าส่ง/VAT/ส่วนลด/ค่าบริการเป็นศูนย์ แต่ยังไม่แสดงติ๊กถูกจนกว่าจะใส่ค่าจริง
- ให้ Step 3 กลายเป็นติ๊กถูกโดยอัตโนมัติเมื่อเลื่อนไป Step 4 (เพื่อให้ flow ไม่ค้างบน optional steps)
- แสดงผล `late joiners` และ `free people` ในหน้าสรุปผล
- ปรับ container form ให้ความสูงคงที่เพื่อไม่ให้ UI ขยับมาก
- เพิ่ม helper text ใน Step 3 ว่า "ข้ามได้" และเพิ่ม hint บน Step 2 ถ้าปุ่ม Next ยังไม่สามารถกด
- ตรวจสอบว่าการ build ของ Vite ผ่านเรียบร้อย
- ปรับ Step 4 ให้แสดงสรุปคนออกเงินก่อนชัดเจน: ยอดจ่ายก่อน, ยอดคืนรวม, ยอดสุทธิ
- เพิ่ม `payerShare` ใน `calculateSinglePayerPayment()` เพื่อให้เห็นส่วนของคนออกก่อนชัดขึ้น
- อัปเดต `ResultSettlement` ให้โชว์ `payerShare` เป็นการ์ดสรุปแยก
- จำกัด free people ไม่ให้ถูกเลือกเป็นผู้จ่ายใน Step Payment ทั้งโหมด single payer และ multi payer
- เพิ่ม server-side validation กัน payload ที่พยายามส่งคนฟรีมาเป็น payer
- ปรับ calculation helpers ให้ normalize input, กันชื่อซ้ำ, และ validate เคส free people / payer
- ปรับข้อความ/summary ใน Step 4 และ ResultSettlement ให้ชัดว่าคนออกก่อนคือผู้สำรองจ่าย และยอดคืนไม่แสดงซ้ำกับ payer
- เสริม validation ฝั่ง multi payer ให้กันชื่อที่ไม่อยู่ในรายชื่อ, ยอดจ่ายที่ไม่ถูกต้อง, และกรณีไม่มีคนช่วยกันจ่าย
- ยืนยันว่า `npm --prefix harn-gan-v2 run build` และ `npm --prefix harn-gan-v2 run lint` ผ่านแล้ว

### สิ่งที่ยังไม่ได้ทำ (Phase 2 — Remaining)
- เก็บ edge cases เรื่องคนฟรี
- เก็บ edge cases เรื่องคนมาทีหลัง
- เก็บ edge cases เรื่องผู้จ่ายหลายคน
- ตรวจสอบ flow ของการคำนวณในโหมดที่เกี่ยวข้องกับ edge cases ข้างต้นเท่านั้น
- งาน UX/validation อื่น ๆ ที่ไม่เกี่ยวกับ edge cases เหล่านี้ให้เลื่อนไป Phase 3

---

## Phase 3 — Result-first UX

โฟกัสการทำให้ result page เป็นจุดแข็งของแอป

### เป้าหมาย
- ให้ผู้ใช้เห็นยอดที่ต้องจ่ายชัดเจนที่สุด
- ลดความซับซ้อนของข้อมูลที่ไม่ช่วยเรื่องการหาร
- ทำให้ผลลัพธ์อ่านง่าย ตรวจสอบง่าย และแชร์ต่อได้ง่าย

### งานย่อย
- จัดลำดับข้อมูลใน result page ใหม่
- ทำข้อความอธิบายผลลัพธ์ให้เข้าใจง่าย
- ซ่อนข้อมูลที่ไม่จำเป็นถ้าไม่มีค่า
- เตรียม structure ของข้อมูลให้ export ง่าย
- แยก data model ออกจาก UI ให้ชัด
- ออกแบบลำดับข้อมูลเพื่อปูทางไป export bill image v1

### สิ่งที่ต้องระวัง
- อย่าเพิ่ม payment flow เพิ่มเติม
- อย่าทำ result page ให้รกด้วยข้อมูลเชิงเทคนิค
- คงความชัดเจนของ settlement เป็นหลัก
- โฟกัสที่ผลลัพธ์การหารบิล ไม่ใช่ workflow การจ่ายเงิน

---

## Phase 4 — Export bill v1 เป็นภาพ

ทำ export เป็นภาพ 1 หน้า สำหรับแชร์ในแชท

### เป้าหมาย
- ส่งผลหารบิลต่อได้ทันที
- อ่านได้ในมือถือ
- ใช้งานจบในครั้งเดียวหลังคำนวณเสร็จ

### Scope v1
- ไฟล์ภาพ PNG 1 หน้า
- layout แนวตั้ง เหมาะกับมือถือ
- มี section:
  - Header
  - Summary
  - Special notes
  - Breakdown
  - Footer สั้น ๆ

### ข้อมูลที่ต้องมี
- ชื่อบิล / ร้าน / มื้ออาหาร
- วันที่เวลา
- ยอดรวม
- จำนวนคน
- คนที่ออกก่อน
- คนฟรี
- คนมาทีหลัง
- breakdown รายคน

### Acceptance criteria
- export ได้จริงจาก result page
- ภาพอ่านง่ายบนมือถือ
- คนในแชทเข้าใจยอดได้ทันที
- ไม่แตก ไม่เบลอ ไม่รกเกินไป

### สิ่งที่ยังไม่ควรทำใน v1
- PDF multi-page
- layout หลาย template
- edit export layout
- payment tracking ในไฟล์ export
- cloud storage
- advanced share sheet ที่ซับซ้อน

---

## Phase 5 — PDF export ถ้าจำเป็น

### เป้าหมาย
- รองรับคนที่อยากเก็บ record หรือพิมพ์
- ใช้ข้อมูลเดียวกับ image export
- ทำเฉพาะเมื่อ image export ใช้งานได้ดีแล้ว

### สิ่งที่ควรทำ
- PDF แบบเรียบง่าย
- เหมาะกับการเก็บหลักฐาน
- ไม่ซับซ้อนเกิน export image

---

## Phase 6 — Feature เสริมที่ช่วยเรื่อง split จริง

### สิ่งที่อาจทำต่อ
- copy summary แบบพร้อมส่งในแชท
- share text summary
- template สรุปยอดหลายแบบ
- history ภายในเครื่อง

### สิ่งที่ไม่ควรรีบทำ
- payment tracking
- transfer confirmation
- bank integration
- reminder system เรื่องโอนเงิน

---

## โครงสร้างไฟล์ที่สำคัญ

```
public/
  index.html     — HTML หลัก, templates, modal markup
  css/style.css  — Design system + component styles + modal styles (ท้ายไฟล์)
  js/app.js      — State, DOM logic, validation, API call, render functions
utilities/
  calculations.js — Bill calculation logic (ไม่ต้องแตะใน Phase 1)
server.js        — Express server + /api/calculate endpoint
AGENT.md         — Tech stack spec (Phase 2 target)
HANDOFF.md       — ไฟล์นี้ (อัปเดตทุกครั้งที่มีการเปลี่ยนแปลง)
README.md        — Project overview
project_info__7.md — Product direction + roadmap split-first
```

---

## API Contract (คงเดิม Phase 1)

`POST /api/calculate` — payload:
```json
{
  "mode": 1,
  "friends": ["มินต์", "แบงก์"],
  "items": [{ "name": "พิซซ่า", "price": 300, "eaters": ["มินต์"] }],
  "totalAmount": 0,
  "serviceChargePercent": 10,
  "vatPercent": 7,
  "shippingFee": 0,
  "discount": 0,
  "paymentMode": 1,
  "payerInfo": { "payer": "มินต์" },
  "freePeople": [],
  "lateJoiners": []
}
```

Response: `{ success, result: { summary, grandTotal, subtotal, serviceCharge, vat, shippingFee, discount, lateJoiners }, paymentDetails, paymentMode }`

---

## หมายเหตุสำหรับ Agent ตัวต่อไป

- อ่าน `AGENT.md` สำหรับ tech stack Phase 2
- อ่าน pinned context `README.md` สำหรับ project overview
- อ่าน `project_info__7.md` เพื่อเข้าใจ product direction แบบ split-first
- **อย่าแตะ `utilities/calculations.js`** ใน Phase 1 เว้นแต่มี bug
- **อย่าเปลี่ยน API shape** ใน Phase 1
- ถ้าจะทำ export ให้เริ่มจาก image v1 ก่อน PDF
- ทุกครั้งที่ทำงานเสร็จ ให้อัปเดต section "สิ่งที่ทำเสร็จแล้ว" และ "สิ่งที่ยังไม่ได้ทำ" ในไฟล์นี้
