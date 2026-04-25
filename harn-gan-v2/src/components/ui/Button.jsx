const variants = {
  primary: 'bg-gradient-to-br from-[#e98574] to-[#d86756] text-white shadow-[0_12px_24px_rgba(216,103,86,0.20)] hover:-translate-y-px',
  secondary: 'bg-white text-[#35211d] border border-[rgba(102,62,52,0.10)] hover:-translate-y-px',
  ghost: 'bg-transparent text-[#7d6159] border border-dashed border-[rgba(125,97,89,0.18)] hover:-translate-y-px',
  danger: 'bg-[#fff2ef] text-[#a74e43] hover:-translate-y-px',
}

const Button = ({ type = 'button', variant = 'secondary', className = '', children, ...props }) => (
  <button
    type={type}
    className={`px-4 py-3 rounded-2xl font-bold text-sm border-0 cursor-pointer transition-all ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
)

export default Button
