import QRCodeStyling from 'qr-code-styling';
import { 
  QRData, 
  ColorConfig, 
  QRGenerationOptions,
  EmailData,
  SMSData,
  LocationData,
  VCardData,
  MeCardData
} from '@/types/qr-types';
import { encodeVCard } from './vcard-encoder';
import { encodeMeCard } from './mecard-encoder';
import { applyStrokeToLogo } from './logo-processor';

/**
 * Generates a QR code instance with the provided data and styling options
 * @param data The QR code data
 * @param colors Foreground and background colors
 * @param size QR code size in pixels (default: 300)
 * @returns QRCodeStyling instance
 */
export async function generateQRCode(
  data: QRData,
  colors: ColorConfig,
  size: number = 300
): Promise<QRCodeStyling> {
  const qrData = formatQRData(data);
  
  // Process logo if present
  let processedLogoImage: string | undefined;
  if (data.logo) {
    try {
      processedLogoImage = await applyStrokeToLogo(
        data.logo.image,
        data.logo.strokeWidth,
        data.logo.strokeColor
      );
    } catch (error) {
      console.error('Failed to process logo:', error);
      // Continue without logo if processing fails
    }
  }
  
  const options: QRGenerationOptions = {
    data: qrData,
    colors: colors,
    logo: data.logo,
    size: size,
    // Use High error correction when logo is present for better scanability
    errorCorrectionLevel: data.logo ? 'H' : 'M'
  };
  
  return createQRCodeStyling(options, processedLogoImage);
}

/**
 * Formats different QR data types into the appropriate string format
 */
function formatQRData(data: QRData): string {
  switch (data.type) {
    case 'url':
      return data.url;
      
    case 'text':
      return data.text;
      
    case 'email':
      return formatEmailData(data as EmailData);
      
    case 'phone':
      return `tel:${data.phone}`;
      
    case 'sms':
      return formatSMSData(data as SMSData);
      
    case 'location':
      return formatLocationData(data as LocationData);
      
    case 'vcard':
      return encodeVCard(data as VCardData);
      
    case 'mecard':
      return encodeMeCard(data as MeCardData);
      
    default:
      throw new Error(`Unsupported QR type: ${(data as QRData).type}`);
  }
}

/**
 * Formats email data as mailto: URI
 */
function formatEmailData(data: EmailData): string {
  let mailto = `mailto:${data.email}`;
  const params: string[] = [];
  
  if (data.subject) {
    params.push(`subject=${encodeURIComponent(data.subject)}`);
  }
  
  if (data.body) {
    params.push(`body=${encodeURIComponent(data.body)}`);
  }
  
  if (params.length > 0) {
    mailto += '?' + params.join('&');
  }
  
  return mailto;
}

/**
 * Formats SMS data as sms: URI
 */
function formatSMSData(data: SMSData): string {
  let sms = `sms:${data.phone}`;
  
  if (data.message) {
    // Use either '?' or '&' depending on platform
    // iOS uses '&', Android uses '?'
    // Using '?' for broader compatibility
    sms += `?body=${encodeURIComponent(data.message)}`;
  }
  
  return sms;
}

/**
 * Formats location data as geo: URI
 */
function formatLocationData(data: LocationData): string {
  return `geo:${data.latitude},${data.longitude}`;
}

/**
 * Creates a QRCodeStyling instance with the specified options
 */
function createQRCodeStyling(options: QRGenerationOptions, processedLogoImage?: string): QRCodeStyling {
  const { colors } = options;
  
  // Configure gradient if enabled
  const dotsGradient = colors.gradientEnabled ? {
    type: colors.gradientType || 'linear',
    rotation: (colors.gradientRotation || 0) * (Math.PI / 180), // Convert degrees to radians
    colorStops: [
      { offset: 0, color: colors.foreground },
      { offset: 1, color: colors.gradientSecondaryColor || colors.foreground }
    ]
  } : undefined;
  
  // Configure background color (transparent if enabled or if background image is present)
  const backgroundColor = (colors.transparentBackground || colors.backgroundImage) ? 'transparent' : colors.background;
  
  return new QRCodeStyling({
    width: options.size,
    height: options.size,
    data: options.data,
    margin: 10,
    image: processedLogoImage,  // Add processed logo image
    qrOptions: {
      typeNumber: 0,  // Auto-detect
      mode: 'Byte',
      errorCorrectionLevel: options.errorCorrectionLevel || 'M'
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 0
    },
    dotsOptions: {
      color: colors.gradientEnabled ? undefined : colors.foreground,
      gradient: dotsGradient,
      type: 'rounded'  // Options: 'rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'
    },
    backgroundOptions: {
      color: backgroundColor
    },
    cornersSquareOptions: {
      color: colors.gradientEnabled ? undefined : colors.foreground,
      gradient: dotsGradient,
      type: 'extra-rounded'
    },
    cornersDotOptions: {
      color: colors.gradientEnabled ? undefined : colors.foreground,
      gradient: dotsGradient,
      type: 'dot'
    }
  });
}

/**
 * Validates QR data before generation
 * @param data QR data to validate
 * @returns Validation result with error message if invalid
 */
export function validateQRData(data: QRData): { valid: boolean; error?: string } {
  switch (data.type) {
    case 'url': {
      const urlData = data as { url: string };
      if (!urlData.url || urlData.url.trim() === '') {
        return { valid: false, error: 'URL is required' };
      }
      try {
        new URL(urlData.url);
      } catch {
        return { valid: false, error: 'Invalid URL format' };
      }
      break;
    }
      
    case 'text': {
      const textData = data as { text: string };
      if (!textData.text || textData.text.trim() === '') {
        return { valid: false, error: 'Text is required' };
      }
      break;
    }
      
    case 'email': {
      const emailData = data as { email: string };
      if (!emailData.email || !isValidEmail(emailData.email)) {
        return { valid: false, error: 'Valid email address is required' };
      }
      break;
    }
      
    case 'phone': {
      const phoneData = data as { phone: string };
      if (!phoneData.phone || phoneData.phone.trim() === '') {
        return { valid: false, error: 'Phone number is required' };
      }
      break;
    }
      
    case 'sms': {
      const smsData = data as { phone: string };
      if (!smsData.phone || smsData.phone.trim() === '') {
        return { valid: false, error: 'Phone number is required' };
      }
      break;
    }
      
    case 'location': {
      const locationData = data as { latitude: number; longitude: number };
      if (locationData.latitude < -90 || locationData.latitude > 90) {
        return { valid: false, error: 'Latitude must be between -90 and 90' };
      }
      if (locationData.longitude < -180 || locationData.longitude > 180) {
        return { valid: false, error: 'Longitude must be between -180 and 180' };
      }
      break;
    }
      
    case 'vcard': {
      const vcardData = data as { firstName: string; lastName: string };
      if (!vcardData.firstName || vcardData.firstName.trim() === '') {
        return { valid: false, error: 'First name is required for VCard' };
      }
      if (!vcardData.lastName || vcardData.lastName.trim() === '') {
        return { valid: false, error: 'Last name is required for VCard' };
      }
      break;
    }
      
    case 'mecard': {
      const mecardData = data as { name: string };
      if (!mecardData.name || mecardData.name.trim() === '') {
        return { valid: false, error: 'Name is required for MeCard' };
      }
      break;
    }
  }
  
  return { valid: true };
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Estimates the data capacity for a given QR code
 * Returns approximate maximum characters based on error correction level
 */
export function estimateQRCapacity(errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'): number {
  // Approximate capacities for alphanumeric data (version 40)
  const capacities = {
    'L': 4296,  // Low (7% error recovery)
    'M': 3391,  // Medium (15% error recovery)
    'Q': 2420,  // Quartile (25% error recovery)
    'H': 1852   // High (30% error recovery)
  };
  
  return capacities[errorCorrectionLevel];
}

