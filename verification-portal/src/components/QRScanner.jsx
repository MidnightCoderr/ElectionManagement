import { useState, useRef, useEffect } from 'react'

/**
 * QRScanner.jsx
 * Camera-based QR code scanner.
 * Uses the browser's MediaDevices API for camera access.
 * Parses receipt IDs from QR codes via a simple URL/text pattern.
 *
 * Props:
 *   onScan(receiptId: string) — called when a valid receipt QR is detected
 *   onClose()                 — called when the user dismisses the scanner
 */
export default function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const [error, setError]     = useState(null)
  const [active, setActive]   = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const streamRef = useRef(null)
  const trackRef  = useRef(null)

  // ── Start camera ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        trackRef.current  = stream.getVideoTracks()[0]
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        setActive(true)
      } catch (err) {
        if (!cancelled) {
          setError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access and try again.'
              : 'Camera not available on this device.'
          )
        }
      }
    }

    startCamera()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // ── Mock QR detection (replace with real BarcodeDetector / jsQR) ────────
  // In production: use `new BarcodeDetector({ formats: ['qr_code'] })`
  // or the jsQR library on a requestAnimationFrame loop against a canvas.
  function handleSimulatedScan() {
    const mockReceipt = '12ABC34'
    onScan(mockReceipt)
  }

  // ── Torch toggle ─────────────────────────────────────────────────────────
  async function toggleTorch() {
    if (!trackRef.current) return
    try {
      await trackRef.current.applyConstraints({ advanced: [{ torch: !torchOn }] })
      setTorchOn(t => !t)
    } catch {
      // torch not supported — silently ignore
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const s = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: 24,
    },
    title: {
      color: '#fff', fontSize: 18, fontWeight: 800, marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    viewfinder: {
      position: 'relative', width: '100%', maxWidth: 340,
      aspectRatio: '1', borderRadius: 16, overflow: 'hidden',
      background: '#000',
    },
    video: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
    corners: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
    },
    scanLine: {
      position: 'absolute', left: 20, right: 20, height: 2,
      background: 'rgba(37,99,235,.8)',
      boxShadow: '0 0 8px rgba(37,99,235,.6)',
      animation: 'scanMove 2s linear infinite',
    },
    errorBox: {
      background: 'rgba(231,76,60,.15)', border: '1px solid rgba(231,76,60,.4)',
      borderRadius: 12, padding: '16px 20px', maxWidth: 340, width: '100%',
      color: '#E74C3C', fontSize: 14, textAlign: 'center', lineHeight: 1.6,
    },
    btnRow: { display: 'flex', gap: 10, marginTop: 20, width: '100%', maxWidth: 340 },
    btn: {
      flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
      fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer',
      transition: 'all .15s',
    },
    closeBtn: { background: '#21262d', color: '#e6edf3', border: '1px solid #30363d' },
    mockBtn:  { background: '#2563EB', color: '#fff' },
    torchBtn: {
      background: torchOn ? '#F4D03F' : '#21262d',
      color: torchOn ? '#000' : '#e6edf3',
      border: '1px solid #30363d',
      padding: '12px 16px', borderRadius: 10, border: 'none',
      fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    },
    hint: { color: '#8b949e', fontSize: 12, marginTop: 12, textAlign: 'center' },
  }

  return (
    <>
      <style>{`
        @keyframes scanMove {
          0%   { top: 15%; }
          50%  { top: 80%; }
          100% { top: 15%; }
        }
      `}</style>
      <div style={s.overlay}>
        <div style={s.title}>📷 Scan Your QR Code</div>

        {error ? (
          <div style={s.errorBox}>{error}</div>
        ) : (
          <div style={s.viewfinder}>
            <video ref={videoRef} style={s.video} muted playsInline />
            {/* Corner brackets */}
            <svg style={s.corners} viewBox="0 0 340 340" fill="none">
              {[
                [20,20,'H60 M20,20 V60'],
                [320,20,'H280 M320,20 V60'],
                [20,320,'H60 M20,320 V280'],
                [320,320,'H280 M320,320 V280'],
              ].map(([x,y,d], i) => (
                <path key={i} d={`M${x},${y} ${d}`}
                  stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
              ))}
            </svg>
            {active && <div style={s.scanLine} />}
          </div>
        )}

        <div style={s.hint}>
          {active ? 'Hold the QR code from your receipt steady inside the frame' : 'Starting camera…'}
        </div>

        <div style={s.btnRow}>
          <button style={{ ...s.btn, ...s.closeBtn }} onClick={onClose}>✕ Close</button>
          {active && (
            <button style={s.torchBtn} onClick={toggleTorch}>
              {torchOn ? '🔦 Torch On' : '🔦 Torch'}
            </button>
          )}
          {active && (
            <button style={{ ...s.btn, ...s.mockBtn }} onClick={handleSimulatedScan}>
              ⚡ Use Demo QR
            </button>
          )}
        </div>
      </div>
    </>
  )
}
