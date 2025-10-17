import QRCodeStyling from 'qr-code-styling';
import { jsPDF } from 'jspdf';
import { ExportFormat, PNGResolution } from '@/types/qr-types';
import { format } from 'date-fns';

/**
 * Exports a QR code in the specified format
 * @param qrCode QRCodeStyling instance
 * @param exportFormat Export format (png, svg, pdf, eps)
 * @param filename Base filename (without extension)
 * @param resolution PNG resolution (only used for PNG export)
 */
export async function exportQRCode(
  qrCode: QRCodeStyling,
  exportFormat: ExportFormat,
  filename: string,
  resolution: PNGResolution = 1024
): Promise<void> {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const fullFilename = `${filename}_${timestamp}`;
  
  switch (exportFormat) {
    case 'png':
      await exportAsPNG(qrCode, fullFilename, resolution);
      break;
    case 'svg':
      await exportAsSVG(qrCode, fullFilename);
      break;
    case 'pdf':
      await exportAsPDF(qrCode, fullFilename);
      break;
    case 'eps':
      await exportAsEPS(qrCode, fullFilename);
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
  resolution: PNGResolution
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
    const data = await exportQR.getRawData('png');
    
    if (!data) {
      throw new Error('Failed to generate PNG data');
    }
    
    // Convert to Blob if it's a Buffer (Node.js environment)
    const blob = data instanceof Blob ? data : new Blob([new Uint8Array(data as unknown as ArrayBuffer)]);
    
    // Download the blob
    downloadBlob(blob, `${filename}.png`);
    
  } catch (error) {
    console.error('PNG export failed:', error);
    throw new Error('Failed to export QR code as PNG');
  }
}

/**
 * Exports QR code as SVG with proper rendering attributes
 * Uses non-destructive approach to avoid mutating the original QR instance
 */
async function exportAsSVG(
  qrCode: QRCodeStyling,
  filename: string
): Promise<void> {
  try {
    // Get raw SVG data without affecting DOM
    const data = await qrCode.getRawData('svg');
    
    if (!data) {
      throw new Error('Failed to generate SVG data');
    }
    
    // Convert to Blob if it's a Buffer (Node.js environment)
    const blob = data instanceof Blob ? data : new Blob([new Uint8Array(data as unknown as ArrayBuffer)], { type: 'image/svg+xml' });
    
    // Read SVG content and enhance with proper attributes
    const svgText = await blob.text();
    
    // Add shape-rendering attribute for crisp edges if not present
    const enhancedSVG = svgText.includes('shape-rendering')
      ? svgText
      : svgText.replace(/<svg/, '<svg shape-rendering="crispEdges"');
    
    // Create blob and download
    const enhancedBlob = new Blob([enhancedSVG], { type: 'image/svg+xml' });
    downloadBlob(enhancedBlob, `${filename}.svg`);
    
  } catch (error) {
    console.error('SVG export failed:', error);
    throw new Error('Failed to export QR code as SVG');
  }
}

/**
 * Exports QR code as PDF
 * Uses non-destructive approach to avoid mutating the original QR instance
 */
async function exportAsPDF(
  qrCode: QRCodeStyling,
  filename: string
): Promise<void> {
  try {
    // Get QR code as PNG data without affecting DOM
    const data = await qrCode.getRawData('png');
    
    if (!data) {
      throw new Error('Failed to generate PNG data');
    }
    
    // Convert to Blob if it's a Buffer (Node.js environment)
    const blob = data instanceof Blob ? data : new Blob([new Uint8Array(data as unknown as ArrayBuffer)]);
    
    // Convert blob to data URL
    const dataUrl = await blobToDataURL(blob);
    
    // Create PDF document (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // A4 dimensions: 210mm x 297mm
    // Center QR code on page
    const qrSize = 100;  // 100mm x 100mm QR code
    const xPos = (210 - qrSize) / 2;
    const yPos = 50;  // 50mm from top
    
    // Add QR code image to PDF
    pdf.addImage(dataUrl, 'PNG', xPos, yPos, qrSize, qrSize);
    
    // Add metadata text
    pdf.setFontSize(10);
    pdf.text(`Generated: ${format(new Date(), 'PPpp')}`, 105, 170, { align: 'center' });
    
    // Save PDF
    pdf.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export QR code as PDF');
  }
}

/**
 * Exports QR code as EPS (Encapsulated PostScript)
 * Note: Exports as SVG with .eps extension for professional tool conversion
 */
async function exportAsEPS(
  qrCode: QRCodeStyling,
  filename: string
): Promise<void> {
  try {
    // Get QR code as SVG (most compatible vector format)
    const data = await qrCode.getRawData('svg');
    
    if (!data) {
      throw new Error('Failed to generate SVG data');
    }
    
    // Convert to Blob if it's a Buffer (Node.js environment)
    const blob = data instanceof Blob ? data : new Blob([new Uint8Array(data as unknown as ArrayBuffer)], { type: 'image/svg+xml' });
    
    // Download as SVG file (users can convert to EPS using professional tools)
    // This is more reliable than attempting browser-based conversion
    downloadBlob(blob, `${filename}.svg`);
    
    // Note: True EPS conversion requires server-side tools like Inkscape
    console.info('SVG file generated. Convert to EPS using Illustrator or Inkscape for best results.');
    
  } catch (error) {
    console.error('EPS export failed:', error);
    throw new Error('Failed to export QR code. Please try SVG format instead.');
  }
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

