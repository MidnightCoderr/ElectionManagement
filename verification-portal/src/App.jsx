import { useState } from 'react'
import Home from './pages/Home.jsx'
import VerifyReceipt from './pages/VerifyReceipt.jsx'

/**
 * App.jsx
 * Root component. Handles simple two-page routing:
 *   'home'    Home (receipt input + QR scanner)
 *   'result'  VerifyReceipt (blockchain result)
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');
        :root {
          --p1:#5b3fd4;--p2:#7c5cfc;--p3:#9d7dfd;--p4:#c4b0fa;
          --sans:'DM Sans',system-ui,sans-serif;
          --serif:'DM Serif Display',Georgia,serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #040408;
          color: #f2f2ff;
        }

        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pop   { 0% { transform: scale(0); opacity:0; } 100% { transform: scale(1); opacity:1; } }
        @keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        button:hover { opacity: .9; }
        input:focus { border-color: rgba(124,92,252,0.5) !important; box-shadow: 0 0 0 3px rgba(124,92,252,0.12) !important; }
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
