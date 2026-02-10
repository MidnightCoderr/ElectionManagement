import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import './QRScanner.css';

function QRScanner({ onScan }) {
    const [error, setError] = useState('');

    const handleScan = (result) => {
        if (result) {
            onScan(result.text);
        }
    };

    const handleError = (err) => {
        console.error('QR Scanner error:', err);
        setError('Camera access denied or not available');
    };

    return (
        <div className="qr-scanner">
            <QrReader
                constraints={{ facingMode: 'environment' }}
                onResult={handleScan}
                onError={handleError}
                className="qr-video"
            />
            {error && <p className="scanner-error">{error}</p>}
        </div>
    );
}

export default QRScanner;
