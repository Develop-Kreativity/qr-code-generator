import { MeCardData } from '@/types/qr-types';

/**
 * Encodes MeCard data according to the Japanese MeCard standard
 * MeCard is a simpler alternative to vCard, commonly used in Japan
 * Format: MECARD:N:Name;TEL:Phone;EMAIL:Email;URL:URL;ADR:Address;NOTE:Note;;
 * 
 * @param data MeCardData object containing contact information
 * @returns Properly formatted MeCard string for QR code encoding
 */
export function encodeMeCard(data: MeCardData): string {
  const fields: string[] = [];
  
  // Name (Required field)
  if (data.name) {
    fields.push(`N:${escapeMeCardValue(data.name)}`);
  }
  
  // Phone
  if (data.phone) {
    fields.push(`TEL:${escapeMeCardValue(data.phone)}`);
  }
  
  // Email
  if (data.email) {
    fields.push(`EMAIL:${escapeMeCardValue(data.email)}`);
  }
  
  // URL/Website
  if (data.url) {
    fields.push(`URL:${escapeMeCardValue(data.url)}`);
  }
  
  // Address
  if (data.address) {
    fields.push(`ADR:${escapeMeCardValue(data.address)}`);
  }
  
  // Note/Memo
  if (data.note) {
    fields.push(`NOTE:${escapeMeCardValue(data.note)}`);
  }
  
  // MeCard format: MECARD:field1;field2;field3;;
  // Note: Double semicolon at the end is required
  return `MECARD:${fields.join(';')};;`;
}

/**
 * Escapes special characters in MeCard values
 * MeCard uses different escaping rules than vCard
 */
function escapeMeCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/:/g, '\\:')    // Escape colons
    .replace(/;/g, '\\;')    // Escape semicolons
    .replace(/,/g, '\\,')    // Escape commas
    .replace(/"/g, '\\"');   // Escape quotes
}

/**
 * Validates MeCard data before encoding
 * @param data MeCardData to validate
 * @returns true if valid, false otherwise
 */
export function validateMeCard(data: MeCardData): boolean {
  // Name is required
  if (!data.name || data.name.trim() === '') {
    return false;
  }
  
  // At least one additional field should be present
  const hasAdditionalField = !!(
    data.phone ||
    data.email ||
    data.url ||
    data.address ||
    data.note
  );
  
  return hasAdditionalField;
}

