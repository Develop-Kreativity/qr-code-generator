import { HistoryItem, StorageSchema, QRData, ColorConfig } from '@/types/qr-types';
import { generateThumbnail } from './qr-export';
import QRCodeStyling from 'qr-code-styling';

const STORAGE_KEY = 'qr_generator_history';
const STORAGE_VERSION = 1;
const MAX_ITEMS = 50;
const MAX_STORAGE_SIZE = 5 * 1024 * 1024;  // 5MB in bytes

/**
 * Saves a generated QR code to local storage history
 * @param data QR code data
 * @param colors Color configuration used
 * @param qrCode QRCodeStyling instance for thumbnail generation
 * @returns The saved history item or null if save failed
 */
export async function saveToHistory(
  data: QRData,
  colors: ColorConfig,
  qrCode: QRCodeStyling
): Promise<HistoryItem | null> {
  try {
    const schema = loadSchema();
    
    // Check for duplicates (same type and data)
    const isDuplicate = schema.items.some(item => 
      item.type === data.type && 
      JSON.stringify(item.data) === JSON.stringify(data)
    );
    
    if (isDuplicate) {
      console.log('Duplicate QR code, not saving to history');
      return null;
    }
    
    // Generate thumbnail
    const thumbnail = await generateThumbnail(qrCode, 100);
    
    // Create history item
    const historyItem: HistoryItem = {
      id: generateId(),
      timestamp: Date.now(),
      type: data.type,
      data: data,
      colors: colors,
      thumbnail: thumbnail
    };
    
    // Add to beginning of array (most recent first)
    schema.items.unshift(historyItem);
    
    // Enforce maximum items limit
    if (schema.items.length > MAX_ITEMS) {
      schema.items = schema.items.slice(0, MAX_ITEMS);
    }
    
    // Check storage size and remove oldest items if necessary
    await enforceStorageLimit(schema);
    
    // Save to local storage
    saveSchema(schema);
    
    return historyItem;
    
  } catch (error) {
    console.error('Failed to save to history:', error);
    return null;
  }
}

/**
 * Retrieves all history items from local storage
 * @returns Array of history items, sorted by timestamp (newest first)
 */
export function getHistory(): HistoryItem[] {
  try {
    const schema = loadSchema();
    return schema.items;
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Retrieves a single history item by ID
 * @param id History item ID
 * @returns History item or undefined if not found
 */
export function getHistoryItem(id: string): HistoryItem | undefined {
  const schema = loadSchema();
  return schema.items.find(item => item.id === id);
}

/**
 * Deletes a history item by ID
 * @param id History item ID to delete
 * @returns true if deleted successfully, false otherwise
 */
export function deleteHistoryItem(id: string): boolean {
  try {
    const schema = loadSchema();
    const initialLength = schema.items.length;
    schema.items = schema.items.filter(item => item.id !== id);
    
    if (schema.items.length < initialLength) {
      saveSchema(schema);
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('Failed to delete history item:', error);
    return false;
  }
}

/**
 * Clears all history items from local storage
 * @returns true if cleared successfully, false otherwise
 */
export function clearHistory(): boolean {
  try {
    const schema: StorageSchema = {
      version: STORAGE_VERSION,
      items: []
    };
    saveSchema(schema);
    return true;
  } catch (error) {
    console.error('Failed to clear history:', error);
    return false;
  }
}

/**
 * Filters history items by QR type
 * @param type QR type to filter by
 * @returns Filtered array of history items
 */
export function filterHistoryByType(type: string): HistoryItem[] {
  const schema = loadSchema();
  return schema.items.filter(item => item.type === type);
}

/**
 * Sorts history items
 * @param sortBy Sort criteria: 'newest' | 'oldest' | 'type'
 * @returns Sorted array of history items
 */
export function sortHistory(sortBy: 'newest' | 'oldest' | 'type'): HistoryItem[] {
  const schema = loadSchema();
  const items = [...schema.items];
  
  switch (sortBy) {
    case 'newest':
      return items.sort((a, b) => b.timestamp - a.timestamp);
    case 'oldest':
      return items.sort((a, b) => a.timestamp - b.timestamp);
    case 'type':
      return items.sort((a, b) => a.type.localeCompare(b.type));
    default:
      return items;
  }
}

/**
 * Exports history as JSON for backup
 * @returns JSON string of history data
 */
export function exportHistoryAsJSON(): string {
  const schema = loadSchema();
  return JSON.stringify(schema, null, 2);
}

/**
 * Imports history from JSON backup
 * @param jsonString JSON string of history data
 * @returns true if imported successfully, false otherwise
 */
export function importHistoryFromJSON(jsonString: string): boolean {
  try {
    const schema: StorageSchema = JSON.parse(jsonString);
    
    // Validate schema
    if (!schema.version || !Array.isArray(schema.items)) {
      throw new Error('Invalid history data format');
    }
    
    // Merge with existing history (avoid duplicates)
    const existingSchema = loadSchema();
    const mergedItems = [...schema.items];
    
    existingSchema.items.forEach(existingItem => {
      const isDuplicate = mergedItems.some(item => item.id === existingItem.id);
      if (!isDuplicate) {
        mergedItems.push(existingItem);
      }
    });
    
    // Sort by timestamp (newest first)
    mergedItems.sort((a, b) => b.timestamp - a.timestamp);
    
    // Enforce limits
    const limitedItems = mergedItems.slice(0, MAX_ITEMS);
    
    const newSchema: StorageSchema = {
      version: STORAGE_VERSION,
      items: limitedItems
    };
    
    saveSchema(newSchema);
    return true;
    
  } catch (error) {
    console.error('Failed to import history:', error);
    return false;
  }
}

/**
 * Gets the current storage size in bytes
 * @returns Storage size in bytes
 */
export function getStorageSize(): number {
  try {
    const schema = loadSchema();
    const jsonString = JSON.stringify(schema);
    return new Blob([jsonString]).size;
  } catch (error) {
    console.error('Failed to calculate storage size:', error);
    return 0;
  }
}

/**
 * Checks if storage is available
 * @returns true if localStorage is available, false otherwise
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// ===== Private Helper Functions =====

/**
 * Loads the storage schema from local storage
 */
function loadSchema(): StorageSchema {
  try {
    if (!isStorageAvailable()) {
      return createEmptySchema();
    }
    
    const jsonString = localStorage.getItem(STORAGE_KEY);
    
    if (!jsonString) {
      return createEmptySchema();
    }
    
    const schema: StorageSchema = JSON.parse(jsonString);
    
    // Validate and migrate if necessary
    if (schema.version !== STORAGE_VERSION) {
      return migrateSchema(schema);
    }
    
    return schema;
    
  } catch (error) {
    console.error('Failed to load schema:', error);
    return createEmptySchema();
  }
}

/**
 * Saves the storage schema to local storage
 */
function saveSchema(schema: StorageSchema): void {
  try {
    if (!isStorageAvailable()) {
      throw new Error('Local storage is not available');
    }
    
    const jsonString = JSON.stringify(schema);
    localStorage.setItem(STORAGE_KEY, jsonString);
    
  } catch (error) {
    console.error('Failed to save schema:', error);
    throw error;
  }
}

/**
 * Creates an empty storage schema
 */
function createEmptySchema(): StorageSchema {
  return {
    version: STORAGE_VERSION,
    items: []
  };
}

/**
 * Migrates schema from old version to current version
 */
function migrateSchema(oldSchema: StorageSchema): StorageSchema {
  // For now, just return a new schema
  // In future versions, implement actual migration logic
  console.log('Migrating schema from version', oldSchema.version, 'to', STORAGE_VERSION);
  return createEmptySchema();
}

/**
 * Enforces storage size limit by removing oldest items
 */
async function enforceStorageLimit(schema: StorageSchema): Promise<void> {
  let currentSize = new Blob([JSON.stringify(schema)]).size;
  
  while (currentSize > MAX_STORAGE_SIZE && schema.items.length > 1) {
    // Remove oldest item (last in array)
    schema.items.pop();
    currentSize = new Blob([JSON.stringify(schema)]).size;
  }
}

/**
 * Generates a unique ID for history items
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

