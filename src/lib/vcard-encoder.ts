import { VCardData, VCardPhone, VCardEmail, VCardAddress } from '@/types/qr-types';

/**
 * Encodes VCard data according to RFC 2426 (vCard 3.0 specification)
 * @param data VCardData object containing all contact information
 * @returns Properly formatted vCard string for QR code encoding
 */
export function encodeVCard(data: VCardData): string {
  const lines: string[] = [];
  
  // vCard header
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  
  // Full Name (FN) - Required field
  const fullName = [
    data.prefix,
    data.firstName,
    data.middleName,
    data.lastName,
    data.suffix
  ].filter(Boolean).join(' ');
  lines.push(`FN:${escapeVCardValue(fullName)}`);
  
  // Structured Name (N) - Last;First;Middle;Prefix;Suffix
  const structuredName = [
    data.lastName || '',
    data.firstName || '',
    data.middleName || '',
    data.prefix || '',
    data.suffix || ''
  ].join(';');
  lines.push(`N:${escapeVCardValue(structuredName)}`);
  
  // Nickname
  if (data.nickname) {
    lines.push(`NICKNAME:${escapeVCardValue(data.nickname)}`);
  }
  
  // Birthday (ISO 8601 format: YYYY-MM-DD)
  if (data.birthday) {
    const bdayFormatted = data.birthday.replace(/-/g, '');
    lines.push(`BDAY:${bdayFormatted}`);
  }
  
  // Photo (Base64 encoded)
  if (data.photo) {
    // Remove data URL prefix if present
    const photoData = data.photo.replace(/^data:image\/[^;]+;base64,/, '');
    lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${photoData}`);
  }
  
  // Phone Numbers
  data.phones.forEach((phone: VCardPhone) => {
    const phoneType = mapPhoneType(phone.type);
    lines.push(`TEL;TYPE=${phoneType}:${escapeVCardValue(phone.number)}`);
  });
  
  // Email Addresses
  data.emails.forEach((email: VCardEmail) => {
    const emailType = mapEmailType(email.type);
    lines.push(`EMAIL;TYPE=${emailType}:${escapeVCardValue(email.address)}`);
  });
  
  // Organization
  if (data.organization) {
    lines.push(`ORG:${escapeVCardValue(data.organization)}`);
  }
  
  // Job Title
  if (data.jobTitle) {
    lines.push(`TITLE:${escapeVCardValue(data.jobTitle)}`);
  }
  
  // Department
  if (data.department) {
    lines.push(`X-DEPARTMENT:${escapeVCardValue(data.department)}`);
  }
  
  // Role
  if (data.role) {
    lines.push(`ROLE:${escapeVCardValue(data.role)}`);
  }
  
  // Company Logo
  if (data.logo) {
    const logoData = data.logo.replace(/^data:image\/[^;]+;base64,/, '');
    lines.push(`LOGO;ENCODING=b;TYPE=JPEG:${logoData}`);
  }
  
  // Work Website
  if (data.workWebsite) {
    lines.push(`URL;TYPE=WORK:${escapeVCardValue(data.workWebsite)}`);
  }
  
  // Addresses
  data.addresses.forEach((address: VCardAddress) => {
    const addressType = mapAddressType(address.type);
    // ADR format: ;;Street;City;State;PostalCode;Country
    const addressValue = [
      '',  // Post office box (not used)
      '',  // Extended address (not used)
      address.street || '',
      address.city || '',
      address.state || '',
      address.postalCode || '',
      address.country || ''
    ].join(';');
    lines.push(`ADR;TYPE=${addressType}:${escapeVCardValue(addressValue)}`);
  });
  
  // Social Media & Additional URLs
  if (data.socialMedia) {
    if (data.socialMedia.linkedin) {
      lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${escapeVCardValue(data.socialMedia.linkedin)}`);
    }
    if (data.socialMedia.twitter) {
      lines.push(`X-SOCIALPROFILE;TYPE=twitter:${escapeVCardValue(data.socialMedia.twitter)}`);
    }
    if (data.socialMedia.facebook) {
      lines.push(`X-SOCIALPROFILE;TYPE=facebook:${escapeVCardValue(data.socialMedia.facebook)}`);
    }
    if (data.socialMedia.instagram) {
      lines.push(`X-SOCIALPROFILE;TYPE=instagram:${escapeVCardValue(data.socialMedia.instagram)}`);
    }
    if (data.socialMedia.website) {
      lines.push(`URL:${escapeVCardValue(data.socialMedia.website)}`);
    }
  }
  
  // Notes
  if (data.notes) {
    lines.push(`NOTE:${escapeVCardValue(data.notes)}`);
  }
  
  // vCard footer
  lines.push('END:VCARD');
  
  // Join with CRLF as per vCard specification
  return lines.join('\r\n');
}

/**
 * Escapes special characters in vCard values
 */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/,/g, '\\,')    // Escape commas
    .replace(/;/g, '\\;')    // Escape semicolons
    .replace(/\n/g, '\\n');  // Escape newlines
}

/**
 * Maps phone type to vCard phone type constant
 */
function mapPhoneType(type: string): string {
  const typeMap: Record<string, string> = {
    'mobile': 'CELL',
    'home': 'HOME',
    'work': 'WORK',
    'fax': 'FAX',
    'other': 'VOICE'
  };
  return typeMap[type] || 'VOICE';
}

/**
 * Maps email type to vCard email type constant
 */
function mapEmailType(type: string): string {
  const typeMap: Record<string, string> = {
    'personal': 'HOME',
    'work': 'WORK',
    'other': 'INTERNET'
  };
  return typeMap[type] || 'INTERNET';
}

/**
 * Maps address type to vCard address type constant
 */
function mapAddressType(type: string): string {
  const typeMap: Record<string, string> = {
    'home': 'HOME',
    'work': 'WORK',
    'postal': 'POSTAL',
    'other': 'INTL'
  };
  return typeMap[type] || 'INTL';
}

