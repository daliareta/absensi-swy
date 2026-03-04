import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (errorMessage) => {
        // Silently handle scan errors (common during scanning)
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner", err));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">Scan QR Code Lokasi</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            Tutup
          </button>
        </div>
        <div className="p-4">
          <div id="qr-reader" className="w-full"></div>
          {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
          <p className="mt-4 text-xs text-slate-500 text-center">
            Arahkan kamera ke QR Code yang tersedia di lokasi kantor.
          </p>
        </div>
      </div>
    </div>
  );
}
