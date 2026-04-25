const modes = [
  {
    value: 1,
    badge: 'เหมาะกับโต๊ะที่กินไม่เหมือนกัน',
    title: 'หารตามรายการอาหาร',
    desc: 'ใส่ชื่อเมนู ราคา และคนที่กินแต่ละรายการ',
    points: ['หลายจาน หลายคนกินไม่เท่ากัน', 'เหมาะกับการสั่งมาแชร์กัน'],
  },
  {
    value: 2,
    badge: 'เหมาะกับบิลรวม',
    title: 'หารเท่ากันทุกคน',
    desc: 'ใส่ยอดรวมทั้งหมด แล้วเฉลี่ยเท่ากันทั้งโต๊ะ',
    points: ['ทุกคนจ่ายใกล้เคียงกัน', 'เหมาะกับร้านอาหารทั่วไป'],
  },
]

const StepMode = ({ mode, onChange }) => (
  <div className="flex flex-col gap-4">
    <div>
      <h3 className="font-serif text-xl font-bold text-[#35211d] m-0">เลือกรูปแบบการหาร</h3>
      <p className="text-[#7d6159] text-sm mt-1">เริ่มจากเลือกวิธีคิดบิลให้เหมาะกับสถานการณ์</p>
    </div>
    <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
      {modes.map((m) => (
        <label
          key={m.value}
          className={`flex flex-col gap-2 p-5 rounded-2xl border cursor-pointer transition-all ${
            mode === m.value
              ? 'border-[rgba(232,133,116,0.35)] bg-gradient-to-b from-[rgba(255,235,229,0.95)] to-[rgba(255,251,248,0.98)]'
              : 'border-[rgba(102,62,52,0.10)] bg-[#fffdfb]'
          }`}
        >
          <input type="radio" className="hidden" checked={mode === m.value} onChange={() => onChange(m.value)} />
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-[rgba(232,133,116,0.14)] text-[#a74e43] w-fit">{m.badge}</span>
          <strong className="font-serif text-base text-[#35211d]">{m.title}</strong>
          <small className="text-[#7d6159] text-xs">{m.desc}</small>
          <ul className="text-[#7d6159] text-xs list-disc ml-4 space-y-1">
            {m.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </label>
      ))}
    </div>
  </div>
)

export default StepMode
