import Field, { Select } from '../ui/Field'
import { currency, d } from '../../lib/money'

const StepPayment = ({ state, dispatch, allFriends, mode }) => {
  const subtotal = mode === 2
    ? d(state.totalAmount || 0)
    : state.items.reduce((sum, i) => sum.plus(d(i.price || 0)), d(0))

  const items = state.items.filter(i => i.name && i.price)
  const payableFriends = state.hasFreePeople
    ? allFriends.filter(name => !state.freePeople.includes(name))
    : allFriends

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#35211d] m-0">เลือกวิธีจ่ายเงิน</h3>
          <p className="text-[#7d6159] text-sm mt-1">กำหนดว่าจะมีคนเดียวออกก่อน หรือหลายคนช่วยกันจ่าย</p>
        </div>
      </div>

      {/* Bill summary */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fff7f1] border border-[rgba(102,62,52,0.10)] text-sm">
          <span className="text-[#7d6159]">ยอดอาหาร</span>
          <strong className="font-mono text-[#35211d]">{currency(subtotal)}</strong>
        </span>
        {mode === 1 && items.map(i => (
          <span key={i.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[rgba(102,62,52,0.10)] text-xs">
            <span className="text-[#7d6159]">{i.name}</span>
            <strong className="font-mono text-[#35211d]">{currency(i.price)}</strong>
          </span>
        ))}
        {mode === 2 && (
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[rgba(102,62,52,0.10)] text-sm">
            <span className="text-[#7d6159]">จำนวนคน</span>
            <strong className="text-[#35211d]">{allFriends.length} คน</strong>
          </span>
        )}
      </div>

      {/* Payment mode cards */}
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        {[
          { value: 1, badge: 'จบง่าย', title: 'คนเดียวออกก่อน', desc: 'ระบบจะสรุปให้ว่าแต่ละคนต้องโอนคืนให้ใคร' },
          { value: 2, badge: 'ยืดหยุ่น', title: 'หลายคนช่วยกันจ่าย', desc: 'ใส่ว่าแต่ละคนจ่ายจริงเท่าไร แล้วค่อยคำนวณ' },
        ].map(m => (
          <label key={m.value} className={`flex flex-col gap-2 p-4 rounded-2xl border cursor-pointer transition-all ${
            state.paymentMode === m.value
              ? 'border-[rgba(232,133,116,0.35)] bg-gradient-to-b from-[rgba(255,235,229,0.95)] to-[rgba(255,251,248,0.98)]'
              : 'border-[rgba(102,62,52,0.10)] bg-[#fffdfb]'
          }`}>
            <input type="radio" className="hidden" checked={state.paymentMode === m.value}
              onChange={() => dispatch({ type: 'SET_FIELD', field: 'paymentMode', value: m.value })} />
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-[rgba(232,133,116,0.14)] text-[#a74e43] w-fit">{m.badge}</span>
            <strong className="font-serif text-sm text-[#35211d]">{m.title}</strong>
            <small className="text-[#7d6159] text-xs">{m.desc}</small>
          </label>
        ))}
      </div>

      {/* Single payer */}
      {state.paymentMode === 1 && (
        <div className="p-5 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-[#fffdfb]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-3">คนที่ออกเงินก่อน</p>
          <Field label="เลือกชื่อ">
            <Select value={state.singlePayer}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'singlePayer', value: e.target.value })}>
              <option value="">เลือกชื่อ</option>
              {payableFriends.map(name => <option key={name} value={name}>{name}</option>)}
            </Select>
            <p className="text-[#7d6159] text-xs mt-2">
              คนที่เลือกจะเป็นผู้สำรองจ่ายก่อน ส่วนผลลัพธ์ด้านล่างจะแสดงว่าใครต้องคืนเงินให้คนนี้
            </p>
            {payableFriends.length === 0 && (
              <p className="text-[#a74e43] text-xs mt-2">ไม่มีคนที่สามารถออกเงินก่อนในโหมดนี้</p>
            )}
          </Field>
        </div>
      )}

      {/* Multi payer */}
      {state.paymentMode === 2 && (
        <div className="p-5 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-[#fffdfb]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-1">หลายคนช่วยกันจ่าย</p>
          <h4 className="font-serif text-base font-bold text-[#35211d] mb-3">ติ๊กคนที่จ่ายจริง แล้วใส่ยอด</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {payableFriends.map(name => (
              <label key={name} className={`flex items-center gap-2 px-3 py-2 rounded-full border cursor-pointer text-sm transition-all ${
                state.multiPayers.includes(name)
                  ? 'bg-[#fff0ec] border-[rgba(232,133,116,0.35)] text-[#a74e43] font-bold'
                  : 'bg-white border-[rgba(102,62,52,0.10)] text-[#7d6159]'
              }`}>
                <input type="checkbox" className="hidden"
                  checked={state.multiPayers.includes(name)}
                  onChange={() => {
                    const next = state.multiPayers.includes(name)
                      ? state.multiPayers.filter(p => p !== name)
                      : [...state.multiPayers, name]
                    dispatch({ type: 'SET_FIELD', field: 'multiPayers', value: next })
                  }} />
                {name}
              </label>
            ))}
          </div>
          {state.multiPayers.length > 0 && payableFriends.length > 0 && (
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              {state.multiPayers.filter(name => payableFriends.includes(name)).map(name => (
                <Field key={name} label={`${name} จ่ายจริง`}>
                  <input type="number" min="0" step="0.01" placeholder="0.00"
                    className="w-full min-h-[46px] border border-[rgba(125,97,89,0.18)] rounded-xl px-3 py-2 bg-white text-[#35211d] focus:outline-none focus:border-[rgba(232,133,116,0.45)] focus:ring-2 focus:ring-[rgba(232,133,116,0.12)] transition-all"
                    value={state.multiPayerAmounts[name] ?? ''}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'multiPayerAmounts', value: { ...state.multiPayerAmounts, [name]: e.target.value } })} />
                </Field>
              ))}
            </div>
          )}
          {state.multiPayers.length > 0 && payableFriends.length === 0 && (
            <p className="text-[#a74e43] text-xs mt-2">ไม่มีคนที่สามารถช่วยกันจ่ายได้ในตอนนี้</p>
          )}
        </div>
      )}

      {/* Free people */}
      <div className="p-5 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-gradient-to-b from-[#fffaf7] to-[#fffdfb]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-1">ตัวเลือกเพิ่มเติม</p>
            <h4 className="font-serif text-base font-bold text-[#35211d] m-0">คนที่ไม่ต้องจ่าย</h4>
            <p className="text-[#7d6159] text-xs mt-1">ถ้าเลือกคนฟรี ระบบจะเฉลี่ยยอดใหม่ให้คนอื่น</p>
          </div>
          <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-[rgba(102,62,52,0.10)] bg-white cursor-pointer text-sm">
            <input type="checkbox" className="accent-[#d86756]"
              checked={state.hasFreePeople}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'hasFreePeople', value: e.target.checked })} />
            เปิดใช้งาน
          </label>
        </div>
        {state.hasFreePeople && (
          <div className="flex flex-wrap gap-2 mt-3">
            {allFriends.map(name => (
              <label key={name} className={`flex items-center gap-2 px-3 py-2 rounded-full border cursor-pointer text-sm transition-all ${
                state.freePeople.includes(name)
                  ? 'bg-[rgba(47,139,87,0.14)] border-[rgba(47,139,87,0.24)] text-[#2f8b57] font-bold'
                  : 'bg-white border-[rgba(102,62,52,0.10)] text-[#7d6159]'
              }`}>
                <input type="checkbox" className="hidden"
                  checked={state.freePeople.includes(name)}
                  onChange={() => {
                    const next = state.freePeople.includes(name)
                      ? state.freePeople.filter(p => p !== name)
                      : [...state.freePeople, name]
                    dispatch({ type: 'SET_FIELD', field: 'freePeople', value: next })
                  }} />
                {name}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StepPayment
