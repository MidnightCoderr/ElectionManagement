import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QR_ELEMENT_ID = 'qr-reader-container';

function QRScanner({ onScan }) {
    const [error, setError] = useState('');
    const scannerRef = useRef(null);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode(QR_ELEMENT_ID);
        scannerRef.current = html5QrCode;

        html5QrCode.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => { onScan(decodedText); },
            () => { /* ignore scan failures */ }
        ).catch(err => {
            console.error('QR start error:', err);
            setError('Camera access denied or not available. Please allow camera permissions.');
        });

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, [onScan]);

    return (
        <div style={{ width: '100%' }}>
            <div id={QR_ELEMENT_ID} style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }} />
            {error && (
                <p style={{ color: '#ef4444', marginTop: '12px', fontSize: '14px', textAlign: 'center' }}>{error}</p>
            )}
        </div>
    );
}

export default QRScanner;
