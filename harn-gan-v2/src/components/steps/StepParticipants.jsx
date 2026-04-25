import { useState } from 'react'
import { Plus, X, UserPlus } from 'lucide-react'
import Field, { Input } from '../ui/Field'
import Button from '../ui/Button'

const LateJoinerModal = ({ onConfirm, onClose }) => {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 bg-[rgba(53,33,29,0.35)] backdrop-blur-sm flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm flex flex-col gap-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <UserPlus className="text-[#a74e43] mt-1 flex-shrink-0" size={22} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-1">เพิ่มคนมาทีหลัง</p>
            <h4 className="font-serif text-lg font-bold text-[#35211d] m-0">ใส่ชื่อคนที่เข้าร่วมทีหลัง</h4>
            <p className="text-[#7d6159] text-sm mt-1">ชื่อนี้จะถูกเพิ่มเข้าในช่องคนกินของรายการนี้</p>
          </div>
        </div>
        <Field label="ชื่อ">
          <Input autoFocus placeholder="เช่น ต้น" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onConfirm(name); if (e.key === 'Escape') onClose() }} />
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>ยกเลิก</Button>
          <Button variant="primary" onClick={() => onConfirm(name)}>เพิ่มเลย</Button>
        </div>
      </div>
    </div>
  )
}

const ItemRow = ({ item, friends, onUpdate, onRemove, onAddLateJoiner }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const toggleEater = (name) => {
    const eaters = item.eaters.includes(name)
      ? item.eaters.filter(e => e !== name)
      : [...item.eaters, name]
    onUpdate({ eaters })
  }

  return (
    <div className="relative p-4 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-gradient-to-b from-[#fffdfc] to-[#fff7f2]">
      <button onClick={onRemove} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#fff2ef] text-[#a74e43] flex items-center justify-center hover:-translate-y-px transition-all">
        <X size={14} />
      </button>
      <div className="grid grid-cols-[1fr_120px] gap-3 mb-3 max-sm:grid-cols-1">
        <Field label="ชื่อรายการ">
          <Input placeholder="เช่น พิซซ่า" value={item.name} onChange={e => onUpdate({ name: e.target.value })} />
        </Field>
        <Field label="ราคา">
          <Input type="number" min="0" step="0.01" placeholder="0.00" value={item.price} onChange={e => onUpdate({ price: e.target.value })} />
        </Field>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-bold text-[#35211d] text-sm">คนกิน</span>
        <div className="flex flex-wrap gap-2">
          {friends.length > 0
            ? friends.map(name => (
                <button key={name} type="button" onClick={() => toggleEater(name)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    item.eaters.includes(name)
                      ? 'bg-[#fff0ec] border-[rgba(232,133,116,0.35)] text-[#a74e43] font-bold'
                      : 'bg-white border-[rgba(232,133,116,0.18)] text-[#7d6159]'
                  }`}>
                  {name}
                </button>
              ))
            : <span className="text-[#a58a82] text-xs">เพิ่มชื่อเพื่อนก่อน แล้วกดเลือกคนกินได้เลย</span>
          }
        </div>
        <button type="button" onClick={() => setModalOpen(true)}
          className="self-start text-xs px-3 py-1.5 rounded-full border border-[rgba(102,62,52,0.10)] bg-white text-[#7d6159] hover:-translate-y-px transition-all flex items-center gap-1">
          <Plus size={12} /> คนมาทีหลัง
        </button>
      </div>
      {modalOpen && (
        <LateJoinerModal
          onConfirm={(name) => { if (name.trim()) onAddLateJoiner(name.trim()); setModalOpen(false) }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

const StepParticipants = ({ state, dispatch, mode, lateJoiners }) => {
  const friendNames = state.friends.map(f => f.name.trim()).filter(Boolean)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#35211d] m-0">เพิ่มคนและข้อมูลบิล</h3>
          <p className="text-[#7d6159] text-sm mt-1">กรอกชื่อเพื่อนก่อน แล้วค่อยเพิ่มรายการหรือยอดรวม</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-start sm:justify-end">
          <span className="text-xs px-3 py-1.5 rounded-full border border-[rgba(232,133,116,0.16)] bg-white text-[#a74e43] font-bold">
            เพื่อน {friendNames.length} คน
          </span>
          {mode === 1 && (
            <span className={`text-xs px-3 py-1.5 rounded-full border font-bold ${
              lateJoiners.length > 0
                ? 'bg-[rgba(232,133,116,0.14)] border-[rgba(232,133,116,0.30)] text-[#a74e43]'
                : 'border-[rgba(232,133,116,0.16)] bg-white text-[#a74e43]'
            }`}>
              มาทีหลัง {lateJoiners.length} คน
            </span>
          )}
        </div>
      </div>

      {/* Friends */}
      <div className="p-5 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-[#fffdfb]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-1">รายชื่อเริ่มต้น</p>
            <h4 className="font-serif text-lg font-bold text-[#35211d] m-0">เพื่อนในโต๊ะ</h4>
          </div>
          <Button variant="secondary" onClick={() => dispatch({ type: 'ADD_FRIEND' })}>
            <Plus size={14} className="inline mr-1" />เพิ่มเพื่อน
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {state.friends.map(f => (
            <div key={f.id} className="relative p-4 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-gradient-to-b from-[#fffdfc] to-[#fff7f2]">
              <button onClick={() => dispatch({ type: 'REMOVE_FRIEND', id: f.id })}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#fff2ef] text-[#a74e43] flex items-center justify-center hover:-translate-y-px transition-all">
                <X size={14} />
              </button>
              <Field label="ชื่อเพื่อน">
                <Input placeholder="เช่น มินต์" value={f.name}
                  onChange={e => dispatch({ type: 'UPDATE_FRIEND', id: f.id, name: e.target.value })} />
              </Field>
            </div>
          ))}
        </div>
      </div>

      {/* Items (mode 1) */}
      {mode === 1 && (
        <div className="p-5 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-[#fffdfb]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-1">รายการอาหาร</p>
              <h4 className="font-serif text-lg font-bold text-[#35211d] m-0">เมนูที่ต้องหาร</h4>
            </div>
            <Button variant="secondary" onClick={() => dispatch({ type: 'ADD_ITEM' })}>
              <Plus size={14} className="inline mr-1" />เพิ่มรายการ
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {state.items.map(item => (
              <ItemRow key={item.id} item={item} friends={friendNames}
                onUpdate={(data) => dispatch({ type: 'UPDATE_ITEM', id: item.id, data })}
                onRemove={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
                onAddLateJoiner={(name) => dispatch({ type: 'ADD_LATE_JOINER', itemId: item.id, name })}
              />
            ))}
          </div>
          <p className="text-[#7d6159] text-xs mt-3">ถ้ามีชื่อที่ไม่อยู่ในรายชื่อเพื่อน ระบบจะนับเป็น "คนมาทีหลัง" ให้อัตโนมัติ</p>
        </div>
      )}

      {/* Total (mode 2) */}
      {mode === 2 && (
        <div className="p-5 rounded-2xl border border-[rgba(102,62,52,0.10)] bg-[#fffdfb]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#a74e43] mb-1">ยอดรวม</p>
          <h4 className="font-serif text-lg font-bold text-[#35211d] mb-4">ยอดบิลทั้งหมด</h4>
          <Field label="ยอดรวมก่อนคิดค่าเพิ่ม">
            <Input type="number" min="0" step="0.01" placeholder="0.00"
              value={state.totalAmount}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'totalAmount', value: e.target.value })} />
          </Field>
        </div>
      )}
    </div>
  )
}

export default StepParticipants
