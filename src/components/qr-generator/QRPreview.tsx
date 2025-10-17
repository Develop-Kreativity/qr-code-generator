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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      return;
    }

    // Validate data
    const validation = validateQRData(data);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid QR data');
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      return;
    }

    // Generate and display QR code
    const generateAndDisplayQR = async () => {
      try {
        setError('');

        // Generate QR code (now async operation due to logo processing)
        const newQrCode = await generateQRCode(data, colors, 300);
        
        // Notify parent component FIRST so export section appears immediately
        callbackRef.current(newQrCode);

        // If there's a background image, composite it on canvas
        if (colors.backgroundImage && canvasRef.current) {
          await compositeQRWithBackground(newQrCode, colors.backgroundImage, canvasRef.current);
        } else {
          // Otherwise, render QR code normally in the container
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
            await newQrCode.append(containerRef.current);
          }
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
          <>
            {/* Canvas for composited QR + background image */}
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="rounded"
              style={{ 
                display: colors.backgroundImage ? 'block' : 'none'
              }}
            />
            {/* Container for regular QR code (no background image) */}
            <div
              ref={containerRef}
              style={{ display: colors.backgroundImage ? 'none' : 'block' }}
            />
          </>
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

/**
 * Composites QR code with background image on a canvas
 */
async function compositeQRWithBackground(
  qrCode: QRCodeStyling,
  backgroundImage: { image: string; opacity: number },
  canvas: HTMLCanvasElement
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const size = canvas.width;

    // Load background image
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.onload = async () => {
      try {
        // Draw background image
        ctx.globalAlpha = backgroundImage.opacity;
        ctx.drawImage(bgImg, 0, 0, size, size);
        ctx.globalAlpha = 1.0;

        // Get QR code as data URL
        const qrBlob = await qrCode.getRawData('png');
        if (!qrBlob) {
          reject(new Error('Failed to generate QR data'));
          return;
        }

        // Convert blob to data URL
        const qrDataUrl = await new Promise<string>((resolveUrl, rejectUrl) => {
          const reader = new FileReader();
          reader.onloadend = () => resolveUrl(reader.result as string);
          reader.onerror = rejectUrl;
          reader.readAsDataURL(qrBlob);
        });

        // Load QR code image
        const qrImg = new Image();
        qrImg.onload = () => {
          // Draw QR code on top of background
          ctx.drawImage(qrImg, 0, 0, size, size);
          resolve();
        };
        qrImg.onerror = () => {
          reject(new Error('Failed to load QR image'));
        };
        qrImg.src = qrDataUrl;

      } catch (err) {
        reject(err);
      }
    };
    bgImg.onerror = () => {
      reject(new Error('Failed to load background image'));
    };
    bgImg.src = backgroundImage.image;
  });
}
