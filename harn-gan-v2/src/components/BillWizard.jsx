import Stepper from './ui/Stepper'
import Button from './ui/Button'
import StepMode from './steps/StepMode'
import StepParticipants from './steps/StepParticipants'
import StepCharges from './steps/StepCharges'
import StepPayment from './steps/StepPayment'

const BillWizard = ({ state, dispatch, completedSteps, goToStep, onNextStep, isStep2Complete, error, loading, onCalculate, allFriends, lateJoiners }) => (
  <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6 sm:py-4 min-h-0">
    <div className="flex-1 flex flex-col sm:rounded-3xl sm:border sm:border-[rgba(102,62,52,0.10)] sm:bg-[rgba(255,252,248,0.96)] sm:shadow-[0_26px_70px_rgba(142,82,66,0.12)] sm:p-7 min-h-[40rem] max-sm:pt-4">
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <span className="font-serif font-bold text-[#a74e43] text-lg flex-shrink-0 sm:hidden">Harn-Gan</span>
        <Stepper current={state.step} completed={completedSteps} errors={state.stepErrors} onStepClick={goToStep} />
      </div>

      <div className="hidden sm:block mb-5 flex-shrink-0">
        <h2 className="font-serif text-2xl font-bold text-[#35211d] m-0">เริ่มหารบิลกันเลย</h2>
        <p className="text-[#7d6159] text-sm mt-1">กรอกทีละขั้น แล้วกดคำนวณได้เลย</p>
      </div>

      {error && (
        <div className="flex-shrink-0 mb-4 px-4 py-3 rounded-xl border border-[rgba(209,93,103,0.2)] bg-[#fff0f1] text-[#b54253] text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-[28rem] sm:min-h-[32rem] pb-4">
        {state.step === 1 && <StepMode mode={state.mode} onChange={(m) => dispatch({ type: 'SET_MODE', mode: m })} />}
        {state.step === 2 && <StepParticipants state={state} dispatch={dispatch} mode={state.mode} lateJoiners={lateJoiners} />}
        {state.step === 3 && <StepCharges state={state} dispatch={dispatch} />}
        {state.step === 4 && <StepPayment state={state} dispatch={dispatch} allFriends={allFriends} mode={state.mode} />}
      </div>

      <div className="flex-shrink-0 flex flex-col gap-3 pt-3 border-t border-[rgba(102,62,52,0.08)] max-sm:pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" onClick={() => dispatch({ type: 'SET_STEP', step: state.step - 1 })}
            className={`w-full sm:w-auto ${state.step === 1 ? 'invisible' : ''}`}>
            ย้อนกลับ
          </Button>
          {state.step === 2 && !isStep2Complete && (
            <p className="text-[#a74e43] text-xs">✓ เพิ่มเพื่อนอย่างน้อย 1 คนและรายการอาหาร 1 รายการ</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto">
          {state.step < 4 && (
            <Button
              variant="primary"
              onClick={() => onNextStep(state.step + 1)}
              disabled={state.step === 2 && !isStep2Complete}
              className={state.step === 2 && !isStep2Complete ? 'opacity-50 cursor-not-allowed' : ''}
            >
              ถัดไป
            </Button>
          )}
          {state.step === 4 && (
            <Button variant="primary" onClick={onCalculate} disabled={loading}>
              {loading ? 'กำลังคำนวณ...' : 'คำนวณบิล'}
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
)

export default BillWizard
