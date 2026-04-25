import { currency } from '../../lib/money'

const ResultSettlement = ({ paymentDetails, paymentMode }) => {
  if (!paymentDetails) return null

  const totalReimbursement = paymentDetails.breakdown.reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0,
  )

  return (
    <div className="p-5 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-[#fffdfb]">
      <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-1">การชำระเงิน</p>
      <h3 className="font-serif text-lg font-bold text-[#35211d] mb-4">สรุปการจ่ายเงิน</h3>

      {paymentMode === 1 ? (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-[#fff8f4] border border-[rgba(232,133,116,0.14)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-1">คนที่ออกเงินก่อน</p>
                <p className="font-bold text-[#35211d]">{paymentDetails.payer}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(232,133,116,0.14)] text-[#a74e43] font-bold">
                จ่ายก่อน
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-xl bg-[#fffdfb] border border-[rgba(102,62,52,0.10)]">
              <span className="block text-[#7d6159] text-xs mb-1">จ่ายไปก่อนทั้งหมด</span>
              <span className="font-mono text-[#35211d]">{currency(paymentDetails.totalPaid)}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#fffdfb] border border-[rgba(102,62,52,0.10)]">
              <span className="block text-[#7d6159] text-xs mb-1">ส่วนของคนออกก่อน</span>
              <span className="font-mono text-[#35211d]">{currency(paymentDetails.payerShare)}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#fffdfb] border border-[rgba(102,62,52,0.10)]">
              <span className="block text-[#7d6159] text-xs mb-1">คนอื่นต้องคืนรวม</span>
              <span className="font-mono text-[#35211d]">{currency(totalReimbursement)}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#eef9f2] border border-[rgba(47,139,87,0.14)]">
              <span className="block text-[#2f8b57] text-xs mb-1">สุดท้ายคนออกก่อนออกเอง</span>
              <span className="font-mono text-[#2f8b57]">{currency(paymentDetails.netAmount)}</span>
            </div>
          </div>

          <p className="text-xs text-[#7d6159]">
            ยอดด้านล่างคือเงินที่คนอื่นต้องโอนคืนให้ผู้จ่ายก่อน โดยส่วนของคนออกก่อนจะแสดงแยกเพื่อให้เห็นว่าเขาถูกคำนวณอยู่จริง
          </p>

          <div className="flex flex-col gap-2">
            {paymentDetails.breakdown.map((entry, index) => (
              <div key={index} className="flex justify-between p-3 rounded-xl bg-[#fffdfb] border border-[rgba(102,62,52,0.10)]">
                <span className="text-sm">{entry.from} ต้องคืน {entry.to}</span>
                <span className="font-mono">{currency(entry.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {paymentDetails.breakdown.map((entry, index) => (
            <div key={index} className={`flex justify-between p-3 rounded-xl border ${
              entry.type === 'receive' ? 'bg-[#eef9f2] border-[rgba(47,139,87,0.14)]' :
              entry.type === 'exact' ? 'bg-[#f8f6f5] border-[rgba(125,97,89,0.10)]' :
              'bg-[#fff8f4] border-[rgba(232,133,116,0.14)]'
            }`}>
              <span className="font-bold">{entry.person}</span>
              <span className="font-mono">
                {entry.type === 'pay' ? `จ่ายเพิ่ม ${currency(entry.amount)}` :
                 entry.type === 'receive' ? `ได้คืน ${currency(entry.amount)}` : 'จ่ายพอดี'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ResultSettlement
