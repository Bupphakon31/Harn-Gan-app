import { useState } from 'react'
import { d, currency } from './lib/money'
import { useWizard } from './lib/useWizard'
import AppShell from './components/AppShell'
import BillWizard from './components/BillWizard'
import ResultSummary from './components/results/ResultSummary'

const App = () => {
  const { state, dispatch, getLateJoiners, getAllFriends } = useWizard()
  const [result, setResult] = useState(null)
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const lateJoiners = getLateJoiners()
  const allFriends = getAllFriends()
  const friendNames = state.friends.map(f => f.name.trim()).filter(Boolean)
  const isStep2Complete = friendNames.length > 0 && (state.mode === 2
    ? Number(state.totalAmount) > 0
    : state.items.some(i => i.name && i.price && i.eaters.length > 0))

  const isStep3Complete = state.step > 3 || [state.serviceCharge, state.vat, state.shippingFee, state.discount]
    .some((value) => Number(value) > 0)

  const completedSteps = new Set([1])
  if (isStep2Complete) {
    completedSteps.add(2)
  }
  if (isStep3Complete) {
    completedSteps.add(3)
  }
  if (state.paymentMode === 1 ? state.singlePayer : state.multiPayers.length > 0) {
    completedSteps.add(4)
  }

  const canGoToStep = (target) => {
    if (target <= state.step) return true
    if (target === 2) return true
    if (target === 3) return completedSteps.has(2)
    if (target === 4) return completedSteps.has(3) || isStep2Complete
    return false
  }

  const goToStep = (target) => {
    if (target === 3 && !isStep2Complete) return
    if (canGoToStep(target)) {
      dispatch({ type: 'SET_STEP', step: target })
    }
  }

  const onNextStep = (nextStep) => {
    if (nextStep === 3 && !isStep2Complete) return
    dispatch({ type: 'SET_STEP', step: nextStep })
  }

  const validate = () => {
    const friends = state.friends.map(f => f.name.trim()).filter(Boolean)
    if (!friends.length) return 'กรุณาใส่ชื่อเพื่อนอย่างน้อย 1 คน'

    if (state.mode === 1) {
      const filled = state.items.filter(i => i.name || i.price || i.eaters.length)
      if (!filled.length) return 'กรุณาเพิ่มรายการอาหารอย่างน้อย 1 รายการ'
      for (const i of filled) {
        if (!i.name) return 'กรุณาใส่ชื่อรายการอาหาร'
        if (!i.price) return 'กรุณาใส่ราคารายการอาหาร'
        if (!i.eaters.length) return 'กรุณาเลือกคนกินอย่างน้อย 1 คน'
      }
    } else {
      if (!(Number(state.totalAmount) > 0)) return 'กรุณาใส่ยอดรวมให้มากกว่า 0'
    }

    if (state.hasFreePeople && !state.freePeople.length) {
      return 'เปิดใช้งานคนฟรีแล้ว โปรดเลือกอย่างน้อย 1 คน'
    }

    if (state.paymentMode === 1 && !state.singlePayer) return 'กรุณาเลือกคนที่ออกเงินก่อน'
    if (state.paymentMode === 2) {
      if (!state.multiPayers.length) return 'กรุณาเลือกคนที่ช่วยกันออกเงิน'

      const payerAmounts = state.multiPayers.map(name => d(state.multiPayerAmounts[name] || 0))
      if (payerAmounts.some(amount => amount.lte(0))) {
        return 'กรุณาใส่ยอดจ่ายจริงของผู้ที่ช่วยกันออกเงิน'
      }

      const expectedTotal = calculateExpectedTotal()
      const totalPaid = payerAmounts.reduce((sum, amount) => sum.plus(amount), d(0))
      if (!totalPaid.equals(expectedTotal)) {
        return `ยอดที่ช่วยกันจ่ายต้องเท่ากับ ${currency(expectedTotal)} เพื่อคำนวณบิลให้ถูกต้อง`
      }
    }

    return null
  }

  const calculateExpectedTotal = () => {
    const subtotal = state.mode === 2
      ? d(state.totalAmount || 0)
      : state.items.filter(i => i.name && i.price).reduce((sum, i) => sum.plus(d(i.price)), d(0))

    const serviceCharge = subtotal.times(d(state.serviceCharge || 0).div(100))
    const shippingFee = d(state.shippingFee || 0)
    const vat = subtotal.plus(serviceCharge).plus(shippingFee).times(d(state.vat || 0).div(100))
    const discount = d(state.discount || 0)

    return subtotal.plus(serviceCharge).plus(shippingFee).plus(vat).minus(discount)
  }

  const calculate = async () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }

    setError('')
    setLoading(true)

    try {
      const payload = {
        mode: state.mode,
        friends: allFriends,
        items: state.mode === 1 ? state.items.filter(i => i.name && i.price).map(i => ({
          name: i.name,
          price: Number(i.price),
          eaters: i.eaters,
        })) : [],
        totalAmount: state.mode === 2 ? Number(state.totalAmount) : 0,
        serviceChargePercent: Number(state.serviceCharge) || 0,
        vatPercent: Number(state.vat) || 0,
        shippingFee: Number(state.shippingFee) || 0,
        discount: Number(state.discount) || 0,
        paymentMode: state.paymentMode,
        payerInfo: state.paymentMode === 1
          ? { payer: state.singlePayer }
          : { payers: state.multiPayers.map((name) => ({ name, amount: Number(state.multiPayerAmounts[name]) || 0 })) },
        freePeople: state.hasFreePeople ? state.freePeople : [],
        lateJoiners,
      }

      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'คำนวณไม่สำเร็จ')
      setResult(data.result)
      setPaymentDetails(data.paymentDetails)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    dispatch({ type: 'RESET' })
    setResult(null)
    setPaymentDetails(null)
    setError('')
  }

  return (
    <AppShell>
      {result ? (
        <ResultSummary result={result} paymentDetails={paymentDetails} paymentMode={state.paymentMode} onReset={reset} />
      ) : (
        <BillWizard
          state={state}
          dispatch={dispatch}
          completedSteps={completedSteps}
          goToStep={goToStep}
          onNextStep={onNextStep}
          isStep2Complete={isStep2Complete}
          error={error}
          loading={loading}
          onCalculate={calculate}
          allFriends={allFriends}
          lateJoiners={lateJoiners}
        />
      )}
    </AppShell>
  )
}

export default App
