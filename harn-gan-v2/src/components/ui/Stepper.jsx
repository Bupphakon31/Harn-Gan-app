const STEPS = [
  { n: 1, label: 'รูปแบบ' },
  { n: 2, label: 'คนและรายการ' },
  { n: 3, label: 'ค่าบริการ' },
  { n: 4, label: 'วิธีจ่าย' },
]

const Stepper = ({ current, completed, errors, onStepClick }) => (
  <nav className="flex gap-2 items-center">
    {STEPS.map(({ n, label }) => {
      const isCurrent = n === current
      const isDone = completed.has(n)
      const isError = errors.has(n)
      const isLocked = n > current && !isDone

      return (
        <button
          key={n}
          type="button"
          onClick={() => onStepClick(n)}
          className={[
            'flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-bold transition-all',
            isCurrent && !isError ? 'border-[rgba(232,133,116,0.42)] bg-gradient-to-b from-[rgba(255,235,229,0.98)] to-[rgba(255,248,244,0.98)] flex-1' : '',
            isDone && !isError ? 'border-[rgba(68,143,92,0.24)] bg-gradient-to-b from-[rgba(239,249,242,0.98)] to-[rgba(252,255,253,0.98)]' : '',
            isError ? 'border-[rgba(209,93,103,0.34)] bg-gradient-to-b from-[rgba(255,238,240,0.98)] to-[rgba(255,249,250,0.98)]' : '',
            isLocked ? 'border-[rgba(102,62,52,0.10)] bg-white/50 text-[#a58a82]' : '',
          ].filter(Boolean).join(' ')}
        >
          <span className={[
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0',
            isDone && !isError ? 'bg-[rgba(47,139,87,0.15)] text-[#2f8b57]' : '',
            isError ? 'bg-[rgba(209,93,103,0.14)] text-[#d15d67]' : '',
            !isDone && !isError ? 'bg-[#fff0ec] text-[#a74e43]' : '',
          ].filter(Boolean).join(' ')}>
            {isDone && !isError ? '✓' : isError ? '!' : n}
          </span>
          {isCurrent && <span className="hidden sm:block truncate">{label}</span>}
        </button>
      )
    })}
  </nav>
)

export default Stepper
