const Field = ({ label, hint, error, children }) => (
  <div className="flex flex-col gap-2">
    {label && <span className="font-bold text-[#35211d] text-sm">{label}</span>}
    {hint && <small className="text-[#7d6159] text-xs -mt-1">{hint}</small>}
    {children}
    {error && <div className="text-[#d15d67] text-xs font-semibold">{error}</div>}
  </div>
)

export const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full min-h-[46px] border border-[rgba(125,97,89,0.18)] rounded-xl px-3 py-2 bg-white text-[#35211d] focus:outline-none focus:border-[rgba(232,133,116,0.45)] focus:ring-2 focus:ring-[rgba(232,133,116,0.12)] transition-all ${className}`}
    {...props}
  />
)

export const Select = ({ className = '', children, ...props }) => (
  <select
    className={`w-full min-h-[46px] border border-[rgba(125,97,89,0.18)] rounded-xl px-3 py-2 bg-white text-[#35211d] focus:outline-none focus:border-[rgba(232,133,116,0.45)] focus:ring-2 focus:ring-[rgba(232,133,116,0.12)] transition-all ${className}`}
    {...props}
  >
    {children}
  </select>
)

export default Field
