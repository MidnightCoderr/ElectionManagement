import { useState } from 'react'
import Home from './pages/Home.jsx'
import VerifyReceipt from './pages/VerifyReceipt.jsx'

/**
 * App.jsx
 * Root component. Handles simple two-page routing:
 *   'home'   → Home (receipt input + QR scanner)
 *   'result' → VerifyReceipt (blockchain result)
 */
function App() {
  const [page, setPage]           = useState('home')
  const [receiptId, setReceiptId] = useState('')

  function handleVerify(id) {
    setReceiptId(id)
    setPage('result')
  }

  function handleBack() {
    setPage('home')
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Baloo 2', sans-serif; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pop {
          0%   { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40%            { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        button:hover { opacity: .9; }
        input:focus { border-color: #2563EB !important; }

        /* QR box hover */
        button[data-qr]:hover {
          border-color: #2563EB !important;
          color: #60A5FA;
        }
      `}</style>

      {page === 'home' && (
        <Home onVerify={handleVerify} />
      )}

      {page === 'result' && (
        <VerifyReceipt receiptId={receiptId} onBack={handleBack} />
      )}
    </>
  )
}

export default App
