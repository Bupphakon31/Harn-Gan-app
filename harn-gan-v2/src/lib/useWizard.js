import { useReducer } from 'react'

const initialState = {
  step: 1,
  mode: 1,
  friends: [{ id: 1, name: '' }],
  items: [{ id: 1, name: '', price: '', eaters: [] }],
  totalAmount: '',
  serviceCharge: '0',
  vat: '0',
  shippingFee: '0',
  discount: '0',
  paymentMode: 1,
  singlePayer: '',
  multiPayers: [],
  multiPayerAmounts: {},
  freePeople: [],
  hasFreePeople: false,
  stepErrors: new Set(),
}

let nextId = 10

const normalizeNames = (values = []) => {
  if (!Array.isArray(values)) return []
  return [...new Set(
    values
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
  )]
}

const getLateJoinerNames = (state) => {
  const friendNames = normalizeNames(state.friends.map((friend) => friend.name))
  const lateJoiners = []

  state.items.forEach((item) => {
    item.eaters.forEach((name) => {
      if (!friendNames.includes(name) && !lateJoiners.includes(name)) {
        lateJoiners.push(name)
      }
    })
  })

  return lateJoiners
}

const getActiveNames = (state) => normalizeNames([
  ...state.friends.map((friend) => friend.name),
  ...getLateJoinerNames(state),
])

const sanitizePaymentState = (state) => {
  const activeNames = getActiveNames(state)
  const activeSet = new Set(activeNames)
  const freePeople = state.hasFreePeople ? normalizeNames(state.freePeople).filter((name) => activeSet.has(name)) : []
  const freeSet = new Set(freePeople)

  const singlePayer = activeSet.has(state.singlePayer) && !freeSet.has(state.singlePayer)
    ? state.singlePayer
    : ''

  const multiPayers = normalizeNames(state.multiPayers).filter((name) => activeSet.has(name) && !freeSet.has(name))
  const multiPayerAmounts = Object.fromEntries(
    multiPayers
      .filter((name) => state.multiPayerAmounts[name] !== undefined)
      .map((name) => [name, state.multiPayerAmounts[name]])
  )

  return {
    ...state,
    freePeople,
    singlePayer,
    multiPayers,
    multiPayerAmounts,
  }
}

const withPaymentSanitization = (state) => sanitizePaymentState(state)

const reducer = (state, action) => {
  let nextState

  switch (action.type) {
    case 'SET_STEP':
      nextState = { ...state, step: action.step }
      break
    case 'SET_MODE':
      nextState = { ...state, mode: action.mode }
      break
    case 'SET_FIELD':
      nextState = { ...state, [action.field]: action.value }
      break
    case 'ADD_FRIEND':
      nextState = { ...state, friends: [...state.friends, { id: ++nextId, name: '' }] }
      break
    case 'UPDATE_FRIEND':
      nextState = { ...state, friends: state.friends.map(f => f.id === action.id ? { ...f, name: action.name } : f) }
      break
    case 'REMOVE_FRIEND':
      nextState = { ...state, friends: state.friends.filter(f => f.id !== action.id) }
      break
    case 'ADD_ITEM':
      nextState = { ...state, items: [...state.items, { id: ++nextId, name: '', price: '', eaters: [] }] }
      break
    case 'UPDATE_ITEM':
      nextState = { ...state, items: state.items.map(i => i.id === action.id ? { ...i, ...action.data } : i) }
      break
    case 'REMOVE_ITEM':
      nextState = { ...state, items: state.items.filter(i => i.id !== action.id) }
      break
    case 'TOGGLE_EATER': {
      const item = state.items.find(i => i.id === action.itemId)
      if (!item) return state
      const eaters = item.eaters.includes(action.name)
        ? item.eaters.filter(e => e !== action.name)
        : [...item.eaters, action.name]
      nextState = { ...state, items: state.items.map(i => i.id === action.itemId ? { ...i, eaters } : i) }
      break
    }
    case 'ADD_LATE_JOINER': {
      const item = state.items.find(i => i.id === action.itemId)
      if (!item || item.eaters.includes(action.name)) return state
      nextState = { ...state, items: state.items.map(i => i.id === action.itemId ? { ...i, eaters: [...i.eaters, action.name] } : i) }
      break
    }
    case 'SET_STEP_ERROR':
      nextState = { ...state, stepErrors: new Set([...state.stepErrors, action.step]) }
      break
    case 'CLEAR_STEP_ERROR': {
      const s = new Set(state.stepErrors)
      s.delete(action.step)
      nextState = { ...state, stepErrors: s }
      break
    }
    case 'RESET':
      nextState = {
        ...initialState,
        friends: [{ id: ++nextId, name: '' }],
        items: [{ id: ++nextId, name: '', price: '', eaters: [] }],
        stepErrors: new Set(),
      }
      break
    default:
      return state
  }

  return withPaymentSanitization(nextState)
}

export const useWizard = () => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    friends: [{ id: 1, name: '' }],
    items: [{ id: 1, name: '', price: '', eaters: [] }],
    stepErrors: new Set(),
  })

  const getLateJoiners = () => getLateJoinerNames(state)

  const getAllFriends = () => getActiveNames(state)

  return { state, dispatch, getLateJoiners, getAllFriends }
}
