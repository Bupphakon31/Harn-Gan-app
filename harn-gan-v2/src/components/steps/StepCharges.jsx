import Field, { Input } from '../ui/Field'

const charges = [
  { field: 'serviceCharge', label: 'ค่าบริการ (%)', hint: 'คิดเป็นเปอร์เซ็นต์จากยอดอาหาร' },
  { field: 'vat', label: 'ภาษีมูลค่าเพิ่ม VAT (%)', hint: 'คิดหลังรวมค่าบริการและค่าส่ง' },
  { field: 'shippingFee', label: 'ค่าส่ง', hint: 'เป็นจำนวนเงินรวม' },
  { field: 'discount', label: 'ส่วนลด', hint: 'เป็นจำนวนเงินรวมที่ลดทั้งบิล' },
]

const StepCharges = ({ state, dispatch }) => (
  <div className="flex flex-col gap-5">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-serif text-xl font-bold text-[#35211d] m-0">เพิ่มค่าบริการและส่วนลด</h3>
        <p className="text-[#7d6159] text-sm mt-1">ส่วนนี้เป็นตัวเลือกเสริม ถ้าไม่มีสามารถปล่อยเป็น 0 ได้ หรือข้ามไปคำนวณเลยก็ได้</p>
      </div>
      <span className="text-xs px-3 py-1.5 rounded-full bg-[rgba(157,210,177,0.18)] text-[#3f7d56] font-bold">ข้ามได้</span>
    </div>

    <div className="p-5 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-[#fffdfb]">
      <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-1">ค่าใช้จ่ายเพิ่มเติม</p>
      <h4 className="font-serif text-lg font-bold text-[#35211d] mb-4">ค่าบริการและภาษี</h4>
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {charges.map(({ field, label, hint }) => (
          <Field key={field} label={label} hint={hint}>
            <Input type="number" min="0" step="0.01"
              value={state[field]}
              onChange={e => dispatch({ type: 'SET_FIELD', field, value: e.target.value })} />
          </Field>
        ))}
      </div>
    </div>
  </div>
)

export default StepCharges
