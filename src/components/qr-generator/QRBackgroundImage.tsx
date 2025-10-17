'use client';

import { useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { BackgroundImageConfig } from '@/types/qr-types';

interface QRBackgroundImageProps {
  backgroundImage?: BackgroundImageConfig;
  onChange: (config: BackgroundImageConfig | undefined) => void;
}

export default function QRBackgroundImage({ backgroundImage, onChange }: QRBackgroundImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opacity = backgroundImage?.opacity ?? 1;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, SVG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dataUrl = await fileToDataURL(file);
      onChange({
        image: dataUrl,
        opacity: opacity
      });
    } catch (err) {
      setError('Failed to load image. Please try again.');
      console.error('Image upload error:', err);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onChange(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpacityChange = (newOpacity: number) => {
    if (backgroundImage) {
      onChange({
        ...backgroundImage,
        opacity: newOpacity
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-wide text-[#a3a3a3]">Background Image</h3>
        {backgroundImage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveImage}
            className="text-red-400 hover:text-red-300 hover:bg-[#1a1a1a]"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Upload Section */}
      {!backgroundImage && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={loading}
            className="w-full border-dashed border-2 border-[#333333] bg-[#0a0a0a] hover:bg-[#1a1a1a] hover:border-[#4a28fd] text-white h-24"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-[#a3a3a3]" />
              <span className="text-sm text-[#a3a3a3]">
                {loading ? 'Uploading...' : 'Click to upload background image'}
              </span>
              <span className="text-xs text-[#666666]">JPG, PNG, SVG, or WebP (max 5MB)</span>
            </div>
          </Button>
        </div>
      )}

      {/* Preview and Controls */}
      {backgroundImage && (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <div className="w-full h-32 rounded border border-[#333333] overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
              <img
                src={backgroundImage.image}
                alt="Background preview"
                className="max-w-full max-h-full object-contain"
                style={{ opacity: backgroundImage.opacity }}
              />
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white">Background Opacity</Label>
              <span className="text-sm text-[#a3a3a3]">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <p className="text-xs text-[#a3a3a3] italic">
              Adjust opacity to ensure QR code remains scannable
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}

/**
 * Converts a File to a data URL
 */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
