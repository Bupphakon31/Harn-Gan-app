import Decimal from 'decimal.js'

Decimal.set({ rounding: Decimal.ROUND_HALF_UP })

export const d = (v) => new Decimal(v || 0)

export const currency = (value) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(
    d(value).toNumber()
  )

export const fmt = (value) =>
  new Intl.NumberFormat('th-TH').format(d(value).toNumber())
