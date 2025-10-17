// QR Code Type Enum
export type QRType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'vcard' | 'mecard' | 'location';

// Export Format Types
export type ExportFormat = 'png' | 'pdf';
export type PNGResolution = 512 | 1024 | 2048;

// Color Configuration
export interface ColorConfig {
  foreground: string;
  background: string;
}

// Base QR Data Interface
export interface BaseQRData {
  type: QRType;
}

// URL Data
export interface URLData extends BaseQRData {
  type: 'url';
  url: string;
}

// Text Data
export interface TextData extends BaseQRData {
  type: 'text';
  text: string;
}

// Email Data
export interface EmailData extends BaseQRData {
  type: 'email';
  email: string;
  subject?: string;
  body?: string;
}

// Phone Data
export interface PhoneData extends BaseQRData {
  type: 'phone';
  phone: string;
}

// SMS Data
export interface SMSData extends BaseQRData {
  type: 'sms';
  phone: string;
  message?: string;
}

// Location Data
export interface LocationData extends BaseQRData {
  type: 'location';
  latitude: number;
  longitude: number;
  address?: string;
}

// VCard Related Types
export type PhoneType = 'mobile' | 'home' | 'work' | 'fax' | 'other';
export type EmailType = 'personal' | 'work' | 'other';
export type AddressType = 'home' | 'work' | 'postal' | 'other';

export interface VCardPhone {
  type: PhoneType;
  number: string;
}

export interface VCardEmail {
  type: EmailType;
  address: string;
}

export interface VCardAddress {
  type: AddressType;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface VCardSocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

// VCard Data
export interface VCardData extends BaseQRData {
  type: 'vcard';
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  prefix?: string;  // Mr., Mrs., Dr., etc.
  suffix?: string;  // Jr., Sr., III, etc.
  nickname?: string;
  birthday?: string;  // YYYY-MM-DD format
  photo?: string;  // Base64 encoded image
  
  // Contact Information
  phones: VCardPhone[];
  emails: VCardEmail[];
  
  // Professional Information
  organization?: string;
  jobTitle?: string;
  department?: string;
  role?: string;
  logo?: string;  // Base64 encoded image
  workWebsite?: string;
  
  // Address Information
  addresses: VCardAddress[];
  
  // Social Media & Additional
  socialMedia?: VCardSocialMedia;
  notes?: string;
}

// MeCard Data (Simplified Japanese standard)
export interface MeCardData extends BaseQRData {
  type: 'mecard';
  name: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
  note?: string;
}

// Union type for all QR data types
export type QRData = 
  | URLData 
  | TextData 
  | EmailData 
  | PhoneData 
  | SMSData 
  | LocationData 
  | VCardData 
  | MeCardData;

// History Item Interface
export interface HistoryItem {
  id: string;
  timestamp: number;
  type: QRType;
  data: QRData;
  colors: ColorConfig;
  thumbnail: string;  // Base64 encoded thumbnail image
}

// Storage Schema Version
export interface StorageSchema {
  version: number;
  items: HistoryItem[];
}

// QR Generation Options
export interface QRGenerationOptions {
  data: string;
  colors: ColorConfig;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

// Export Options
export interface ExportOptions {
  format: ExportFormat;
  resolution?: PNGResolution;
  filename?: string;
}

// Auto-save Tracker
export interface AutoSaveTracker {
  [key: string]: string; // Maps QRType to the last auto-saved history item ID
}

