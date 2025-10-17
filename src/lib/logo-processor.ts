/**
 * Logo Processing Utility
 * Applies stroke/border to logo images for better visibility on QR codes
 */

/**
 * Applies a stroke (border) to a logo image
 * @param imageDataUrl Base64 data URL of the logo image
 * @param strokeWidth Width of the stroke in pixels
 * @param strokeColor Hex color for the stroke
 * @returns Promise that resolves to a Base64 data URL of the processed image
 */
export async function applyStrokeToLogo(
  imageDataUrl: string,
  strokeWidth: number,
  strokeColor: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create image element
    const img = new Image();
    
    img.onload = () => {
      try {
        // Create canvas with padding for stroke
        const padding = strokeWidth * 2;
        const canvasSize = Math.max(img.width, img.height) + padding;
        
        const canvas = document.createElement('canvas');
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Calculate position to center the image
        const x = (canvasSize - img.width) / 2;
        const y = (canvasSize - img.height) / 2;
        
        // If stroke width is greater than 0, draw the stroke
        if (strokeWidth > 0) {
          // Draw stroke background (rounded rectangle)
          ctx.fillStyle = strokeColor;
          ctx.beginPath();
          
          const radius = strokeWidth;
          const strokeX = x - strokeWidth;
          const strokeY = y - strokeWidth;
          const strokeWidth2 = img.width + strokeWidth * 2;
          const strokeHeight = img.height + strokeWidth * 2;
          
          // Draw rounded rectangle for stroke
          ctx.moveTo(strokeX + radius, strokeY);
          ctx.lineTo(strokeX + strokeWidth2 - radius, strokeY);
          ctx.quadraticCurveTo(strokeX + strokeWidth2, strokeY, strokeX + strokeWidth2, strokeY + radius);
          ctx.lineTo(strokeX + strokeWidth2, strokeY + strokeHeight - radius);
          ctx.quadraticCurveTo(strokeX + strokeWidth2, strokeY + strokeHeight, strokeX + strokeWidth2 - radius, strokeY + strokeHeight);
          ctx.lineTo(strokeX + radius, strokeY + strokeHeight);
          ctx.quadraticCurveTo(strokeX, strokeY + strokeHeight, strokeX, strokeY + strokeHeight - radius);
          ctx.lineTo(strokeX, strokeY + radius);
          ctx.quadraticCurveTo(strokeX, strokeY, strokeX + radius, strokeY);
          ctx.closePath();
          ctx.fill();
        }
        
        // Draw the original image on top
        ctx.drawImage(img, x, y, img.width, img.height);
        
        // Convert canvas to data URL
        const processedDataUrl = canvas.toDataURL('image/png');
        resolve(processedDataUrl);
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Set image source
    img.src = imageDataUrl;
  });
}

/**
 * Converts a File object to a Base64 data URL
 * @param file File object from file input
 * @returns Promise that resolves to a Base64 data URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validates if a file is a valid image format
 * @param file File object to validate
 * @returns True if file is a valid image format
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  return validTypes.includes(file.type);
}

