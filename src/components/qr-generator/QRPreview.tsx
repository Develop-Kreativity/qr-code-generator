'use client';

import { useEffect, useRef, useState } from 'react';
import { QRData, ColorConfig } from '@/types/qr-types';
import { generateQRCode, validateQRData } from '@/lib/qr-generator';
import QRCodeStyling from 'qr-code-styling';

interface QRPreviewProps {
  data: QRData | null;
  colors: ColorConfig;
  onQRCodeGenerated: (qrCode: QRCodeStyling) => void;
}

export default function QRPreview({ data, colors, onQRCodeGenerated }: QRPreviewProps) {
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onQRCodeGenerated);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onQRCodeGenerated;
  }, [onQRCodeGenerated]);

  useEffect(() => {
    // Reset state when no data
    if (!data) {
      setError('');
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
      return;
    }

    // Validate data
    const validation = validateQRData(data);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid QR data');
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
      return;
    }

    // Generate and display QR code
    const generateAndDisplayQR = async () => {
      try {
        setError('');

        // Generate QR code (synchronous operation)
        const newQrCode = generateQRCode(data, colors, 300);
        
        // Notify parent component FIRST so export section appears immediately
        callbackRef.current(newQrCode);

        // Now append to DOM - this is async but we do it after notifying parent
        if (canvasRef.current) {
          // Clear and append in one go to minimize flicker
          canvasRef.current.innerHTML = '';
          await newQrCode.append(canvasRef.current);
        }

      } catch (err) {
        console.error('QR generation error:', err);
        setError('Failed to generate QR code. Data may be too large or invalid.');
      }
    };

    generateAndDisplayQR();
  }, [data, colors]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center min-h-[300px] bg-[#0a0a0a] rounded-lg p-6 border border-[#333333]">
        {error && (
          <div className="text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!error && !data && (
          <div className="text-center">
            <p className="text-sm text-[#a3a3a3]">
              Fill in the form to generate your QR code
            </p>
          </div>
        )}

        {!error && data && (
          <div ref={canvasRef} className="flex items-center justify-center" />
        )}
      </div>

      {data && !error && (
        <div className="flex items-center justify-between text-xs text-[#a3a3a3]">
          <span className="px-2 py-1 bg-[#1a1a1a] rounded border border-[#333333]">
            Type: <span className="uppercase text-[#4a28fd]">{data.type}</span>
          </span>
          <span className="italic">Scan with your phone camera to test</span>
        </div>
      )}
    </div>
  );
}

