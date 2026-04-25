import { currency, d, fmt } from '../../lib/money'
import ResultSettlement from './ResultSettlement'

const statCard = (label, value) => (
  <div className="rounded-2xl border border-[rgba(232,133,116,0.16)] bg-gradient-to-b from-[#fff7f2] to-[#fffdfb] p-4 shadow-[0_10px_24px_rgba(142,82,66,0.05)]">
    <span className="block text-xs font-semibold uppercase tracking-wider text-[#7d6159]">{label}</span>
    <span className="mt-2 block text-base font-mono text-[#35211d] sm:text-lg">{value}</span>
  </div>
)

const sectionTitle = (eyebrow, title, desc) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43]">{eyebrow}</p>
    <h2 className="font-serif text-2xl font-bold text-[#35211d] m-0 sm:text-3xl">{title}</h2>
    {desc && <p className="text-sm text-[#7d6159]">{desc}</p>}
  </div>
)

const ResultSummary = ({ result, paymentDetails, paymentMode, onReset }) => {
  const sorted = [...result.summary].sort((a, b) => d(b.totalToPay).cmp(d(a.totalToPay)))

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-[rgba(102,62,52,0.10)] bg-[rgba(255,252,248,0.96)] p-5 shadow-[0_22px_60px_rgba(142,82,66,0.08)] sm:flex-row sm:items-start sm:justify-between sm:p-6">
        {sectionTitle('ผลลัพธ์', 'ผลลัพธ์การคำนวณ', 'ดูภาพรวมก่อน แล้วค่อยไล่รายละเอียดรายคนทีละส่วน')}
        <button
          onClick={onReset}
          className="w-full rounded-2xl border border-[rgba(102,62,52,0.10)] bg-white px-4 py-3 text-sm font-bold text-[#35211d] transition-all hover:-translate-y-px sm:w-auto"
        >
          เริ่มใหม่
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCard('ยอดรวมทั้งหมด', currency(result.grandTotal))}
        {statCard('จำนวนคนในบิล', `${fmt(result.summary.length)} คน`)}
        {statCard('ค่าบริการ', currency(result.serviceCharge))}
        {statCard('ภาษี VAT', currency(result.vat))}
      </div>

      <div className="rounded-[28px] border border-[rgba(102,62,52,0.10)] bg-[#fffdfb] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43]">สรุปหลัก</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h3 className="font-serif text-lg font-bold text-[#35211d] m-0 sm:text-xl">แต่ละคนต้องจ่ายเท่าไร</h3>
          <span className="rounded-full border border-[rgba(102,62,52,0.10)] bg-white px-3 py-1.5 text-xs font-semibold text-[#7d6159]">
            {result.freePeople?.length ? `${result.freePeople.length} คนฟรี` : 'ไม่มีคนฟรี'}
          </span>
        </div>

        <div className="mt-4 grid gap-2">
          {sorted.map((person) => (
            <div
              key={person.name}
              className="flex items-start justify-between gap-4 rounded-2xl border border-[rgba(232,133,116,0.14)] bg-[#fff8f4] p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#35211d]">{person.name}</span>
                  {person.isFree && (
                    <span className="rounded-full bg-[rgba(47,139,87,0.14)] px-2 py-0.5 text-xs font-bold text-[#2f8b57]">
                      ฟรี
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#7d6159]">
                  {person.isFree ? 'ไม่ต้องจ่าย' : 'ยอดหลังคิดทุกค่าแล้ว'}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[#35211d]">{currency(person.totalToPay)}</span>
            </div>
          ))}
        </div>
      </div>

      {paymentDetails && (
        <ResultSettlement paymentDetails={paymentDetails} paymentMode={paymentMode} />
      )}

      {result.lateJoiners && result.lateJoiners.length > 0 && (
        <div className="rounded-[28px] border border-[rgba(102,62,52,0.10)] bg-[#fffdfb] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43]">คนมาทีหลัง</p>
          <h3 className="mt-1 font-serif text-lg font-bold text-[#35211d]">รายการคนมาทีหลัง</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {result.lateJoiners.map(({ name, items }) => (
              <div key={name} className="rounded-2xl border border-[rgba(232,133,116,0.14)] bg-[#fff8f4] p-4">
                <p className="font-bold text-[#35211d]">{name}</p>
                <p className="mt-1 text-sm text-[#7d6159]">กิน: {items.join(', ') || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.freePeople && result.freePeople.length > 0 && (
        <div className="rounded-[28px] border border-[rgba(102,62,52,0.10)] bg-[#fffdfb] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43]">คนฟรี</p>
          <h3 className="mt-1 font-serif text-lg font-bold text-[#35211d]">คนที่ไม่ต้องจ่าย</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.freePeople.map((name) => (
              <span key={name} className="rounded-full bg-[rgba(47,139,87,0.14)] px-3 py-2 text-sm text-[#2f8b57]">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[28px] border border-[rgba(102,62,52,0.10)] bg-[#fffdfb] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43]">รายละเอียด</p>
        <h3 className="mt-1 font-serif text-lg font-bold text-[#35211d]">รายละเอียดค่าใช้จ่าย</h3>
        <div className="mt-4 grid gap-2">
          {[
            ['ยอดอาหาร', result.subtotal],
            ['ค่าบริการ', result.serviceCharge],
            ['ภาษีมูลค่าเพิ่ม (VAT)', result.vat],
            ['ค่าส่ง', result.shippingFee],
            ['ส่วนลด', d(result.discount || 0).negated()],
            ['ยอดรวมสุทธิ', result.grandTotal],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-white px-4 py-3"
            >
              <span className="text-sm text-[#7d6159]">{label}</span>
              <span className="font-mono text-[#35211d]">{currency(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ResultSummary
