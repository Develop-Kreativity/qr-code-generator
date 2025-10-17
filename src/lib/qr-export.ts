import QRCodeStyling from 'qr-code-styling';
import { jsPDF } from 'jspdf';
import { ExportFormat, PNGResolution, ColorConfig } from '@/types/qr-types';
import { format } from 'date-fns';

/**
 * Exports a QR code in the specified format
 * @param qrCode QRCodeStyling instance
 * @param exportFormat Export format (png, pdf)
 * @param filename Base filename (without extension)
 * @param resolution PNG resolution (only used for PNG export)
 * @param colors Color configuration (needed for background image)
 */
export async function exportQRCode(
  qrCode: QRCodeStyling,
  exportFormat: ExportFormat,
  filename: string,
  resolution: PNGResolution = 1024,
  colors?: ColorConfig
): Promise<void> {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const fullFilename = `${filename}_${timestamp}`;
  
  switch (exportFormat) {
    case 'png':
      await exportAsPNG(qrCode, fullFilename, resolution, colors);
      break;
    case 'pdf':
      await exportAsPDF(qrCode, fullFilename, colors);
      break;
    default:
      throw new Error(`Unsupported export format: ${exportFormat}`);
  }
}

/**
 * Exports QR code as PNG with specified resolution
 * Uses non-destructive approach to avoid mutating the original QR instance
 */
async function exportAsPNG(
  qrCode: QRCodeStyling,
  filename: string,
  resolution: PNGResolution,
  colors?: ColorConfig
): Promise<void> {
  try {
    // Create isolated QR instance for export to avoid mutating original
    // Access _options property which contains the QR configuration
    const options = (qrCode as QRCodeStyling & { _options: Record<string, unknown> })._options;
    const exportQR = new QRCodeStyling({
      ...options,
      width: resolution,
      height: resolution
    });
    
    // Get raw PNG data without affecting DOM
    const qrData = await exportQR.getRawData('png');
    
    if (!qrData) {
      throw new Error('Failed to generate PNG data');
    }
    
    // Convert to Blob if it's a Buffer (Node.js environment)
    const qrBlob = qrData instanceof Blob ? qrData : new Blob([new Uint8Array(qrData as unknown as ArrayBuffer)]);
    
    // If there's a background image, composite them together
    if (colors?.backgroundImage) {
      const compositeBlob = await compositeQRWithBackground(qrBlob, colors.backgroundImage, resolution);
      downloadBlob(compositeBlob, `${filename}.png`);
    } else {
      // Download the QR code directly
      downloadBlob(qrBlob, `${filename}.png`);
    }
    
  } catch (error) {
    console.error('PNG export failed:', error);
    throw new Error('Failed to export QR code as PNG');
  }
}

/**
 * Exports QR code as PDF
 * Uses non-destructive approach to avoid mutating the original QR instance
 */
async function exportAsPDF(
  qrCode: QRCodeStyling,
  filename: string,
  colors?: ColorConfig
): Promise<void> {
  try {
    // Create isolated QR instance for export to avoid mutating original
    // Access _options property which contains the QR configuration
    const options = (qrCode as QRCodeStyling & { _options: Record<string, unknown> })._options;
    const exportQR = new QRCodeStyling({
      ...options
    });
    
    // Get QR code as PNG data without affecting DOM
    const qrData = await exportQR.getRawData('png');
    
    if (!qrData) {
      throw new Error('Failed to generate PNG data');
    }
    
    // Convert to Blob if it's a Buffer (Node.js environment)
    const qrBlob = qrData instanceof Blob ? qrData : new Blob([new Uint8Array(qrData as unknown as ArrayBuffer)]);
    
    // If there's a background image, composite them together
    let finalBlob = qrBlob;
    if (colors?.backgroundImage) {
      finalBlob = await compositeQRWithBackground(qrBlob, colors.backgroundImage, 1024);
    }
    
    // Convert blob to data URL
    const dataUrl = await blobToDataURL(finalBlob);
    
    // Create PDF document (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // A4 dimensions: 210mm x 297mm
    // Center QR code on page (vertically and horizontally)
    const qrSize = 100;  // 100mm x 100mm QR code
    const xPos = (210 - qrSize) / 2;
    const yPos = (297 - qrSize) / 2;  // Center vertically on A4
    
    // Add QR code image to PDF
    pdf.addImage(dataUrl, 'PNG', xPos, yPos, qrSize, qrSize);
    
    // Save PDF
    pdf.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export QR code as PDF');
  }
}

/**
 * Composites QR code with background image
 * @param qrBlob QR code blob (with transparent background)
 * @param backgroundImage Background image configuration
 * @param size Output size
 * @returns Promise that resolves to composite image blob
 */
async function compositeQRWithBackground(
  qrBlob: Blob,
  backgroundImage: { image: string; opacity: number },
  size: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    // Load background image
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.onload = () => {
      // Draw background image
      ctx.globalAlpha = backgroundImage.opacity;
      ctx.drawImage(bgImg, 0, 0, size, size);
      ctx.globalAlpha = 1.0;
      
      // Load QR code image
      const qrUrl = URL.createObjectURL(qrBlob);
      const qrImg = new Image();
      qrImg.onload = () => {
        // Draw QR code on top
        ctx.drawImage(qrImg, 0, 0, size, size);
        URL.revokeObjectURL(qrUrl);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create composite blob'));
          }
        }, 'image/png');
      };
      qrImg.onerror = () => {
        URL.revokeObjectURL(qrUrl);
        reject(new Error('Failed to load QR code image'));
      };
      qrImg.src = qrUrl;
    };
    bgImg.onerror = () => reject(new Error('Failed to load background image'));
    bgImg.src = backgroundImage.image;
  });
}

/**
 * Converts a Blob to a data URL
 * @param blob The blob to convert
 * @returns Promise that resolves to data URL string
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generates a thumbnail of the QR code for history storage
 * Uses non-destructive approach to avoid mutating the original QR instance
 * @param qrCode QRCodeStyling instance
 * @param size Thumbnail size in pixels (default: 100)
 * @returns Base64 encoded thumbnail image
 */
export async function generateThumbnail(
  qrCode: QRCodeStyling,
  size: number = 100
): Promise<string> {
  try {
    // Create isolated QR instance for thumbnail to avoid mutating original
    // Access _options property which contains the QR configuration
    const options = (qrCode as QRCodeStyling & { _options: Record<string, unknown> })._options;
    const thumbnailQR = new QRCodeStyling({
      ...options,
      width: size,
      height: size
    });
    
    // Get PNG data without affecting DOM
    const data = await thumbnailQR.getRawData('png');
    
    if (!data) {
      throw new Error('Failed to generate thumbnail data');
    }
    
    // Convert to Blob if it's a Buffer (Node.js environment)
    const blob = data instanceof Blob ? data : new Blob([new Uint8Array(data as unknown as ArrayBuffer)]);
    
    // Convert blob to base64 data URL
    const dataUrl = await blobToDataURL(blob);
    
    return dataUrl;
    
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    return '';
  }
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

