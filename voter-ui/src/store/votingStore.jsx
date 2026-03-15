/**
 * votingStore.js
 * Lightweight React context + useReducer store for all voting state.
 * No external state library needed.
 */
import { createContext, useContext, useReducer } from 'react'

// ── Initial state ──────────────────────────────────────────────────────────
const initialState = {
  step:              1,       // 1-7
  locale:            'en',    // active language code
  voter:             null,    // { name, district } — set after biometric auth
  selectedCandidate: null,    // candidate object
  receipt:           null,    // { id, timestamp, txHash, terminal } — after vote cast
  error:             null,    // error message string
}

// ── Action types ────────────────────────────────────────────────────────────
export const ACTIONS = {
  NEXT_STEP:         'NEXT_STEP',
  GO_TO_STEP:        'GO_TO_STEP',
  SET_LOCALE:        'SET_LOCALE',
  SET_VOTER:         'SET_VOTER',
  SELECT_CANDIDATE:  'SELECT_CANDIDATE',
  SET_RECEIPT:       'SET_RECEIPT',
  SET_ERROR:         'SET_ERROR',
  RESET:             'RESET',
}

// ── Reducer ────────────────────────────────────────────────────────────────
function votingReducer(state, action) {
  switch (action.type) {
    case ACTIONS.NEXT_STEP:
      return { ...state, step: state.step + 1, error: null }
    case ACTIONS.GO_TO_STEP:
      return { ...state, step: action.payload, error: null }
    case ACTIONS.SET_LOCALE:
      return { ...state, locale: action.payload }
    case ACTIONS.SET_VOTER:
      return { ...state, voter: action.payload }
    case ACTIONS.SELECT_CANDIDATE:
      return { ...state, selectedCandidate: action.payload, step: 5 }
    case ACTIONS.SET_RECEIPT:
      return { ...state, receipt: action.payload }
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload }
    case ACTIONS.RESET:
      return { ...initialState }
    default:
      return state
  }
}

// ── Context + Provider ─────────────────────────────────────────────────────
const VotingContext = createContext(null)

export function VotingProvider({ children }) {
  const [state, dispatch] = useReducer(votingReducer, initialState)
  return (
    <VotingContext.Provider value={{ state, dispatch }}>
      {children}
    </VotingContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useVotingStore() {
  const ctx = useContext(VotingContext)
  if (!ctx) throw new Error('useVotingStore must be used inside <VotingProvider>')
  return ctx
}
