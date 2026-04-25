import { Cake, Receipt, Wallet } from 'lucide-react'

const benefits = [
  {
    icon: Cake,
    title: 'สองรูปแบบการหาร',
    detail: 'หารตามรายการ หรือหารเท่ากันทุกคน',
  },
  {
    icon: Receipt,
    title: 'ค่าส่วนเพิ่มครบ',
    detail: 'รองรับ service charge, VAT, ค่าส่ง และส่วนลด',
  },
  {
    icon: Wallet,
    title: 'สรุปการจ่ายชัด',
    detail: 'คนเดียวออกก่อนหรือหลายคนช่วยกันจ่าย',
  },
]

const AppShell = ({ children }) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,214,204,0.70),_transparent_30%)] bg-[radial-gradient(circle_at_top_right,_rgba(182,230,204,0.55),_transparent_26%)] bg-[linear-gradient(180deg,_#fff7f2_0%,_#fffaf7_42%,_#fff5ef_100%)] text-[#35211d]">
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6">
      <header className="hidden sm:block w-full rounded-[32px] border border-[rgba(102,62,52,0.10)] bg-[rgba(255,252,248,0.96)] shadow-[0_26px_70px_rgba(142,82,66,0.12)] p-8">
        <div className="grid grid-cols-[1.2fr_1fr] gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-2">Harn-Gan</p>
            <h1 className="font-serif text-4xl font-bold leading-tight">หารกันให้ง่ายขึ้น</h1>
            <p className="text-[#7d6159] mt-3 max-w-xl leading-relaxed">แอปช่วยหารบิลที่จัดขั้นตอนให้เป็นระเบียบ ใช้งานง่าย และสรุปผลให้ชัดเจนทั้งโต๊ะ</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {benefits.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="rounded-3xl border border-[rgba(232,133,116,0.18)] bg-gradient-to-b from-white to-[rgba(255,244,238,0.96)] p-4">
                <Icon size={24} className="text-[#d86756]" />
                <strong className="block text-sm text-[#35211d] mt-3">{title}</strong>
                <small className="text-[#7d6159] text-xs">{detail}</small>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-6 mt-6">
        {children}
      </main>
    </div>
  </div>
)

export default AppShell
