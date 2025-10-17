'use client';

import { useRef, useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoConfig } from '@/types/qr-types';
import { fileToDataURL, isValidImageFile, applyStrokeToLogo } from '@/lib/logo-processor';
import { Upload, X } from 'lucide-react';

interface QRLogoUploadProps {
  logo: LogoConfig | undefined;
  backgroundColor: string;
  onChange: (logo: LogoConfig | undefined) => void;
}

export default function QRLogoUpload({ logo, backgroundColor, onChange }: QRLogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update preview when logo changes
  useEffect(() => {
    if (logo) {
      // Generate preview with stroke
      applyStrokeToLogo(logo.image, logo.strokeWidth, logo.strokeColor)
        .then(processedImage => {
          setPreviewImage(processedImage);
        })
        .catch(error => {
          console.error('Failed to generate preview:', error);
          setPreviewImage(logo.image);
        });
    } else {
      setPreviewImage(null);
    }
  }, [logo]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidImageFile(file)) {
      alert('Please select a valid image file (PNG, JPG, or SVG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image file size must be less than 2MB');
      return;
    }

    setIsProcessing(true);

    try {
      const dataUrl = await fileToDataURL(file);
      
      // Create new logo config with default stroke settings
      const newLogo: LogoConfig = {
        image: dataUrl,
        strokeWidth: 4,  // Default stroke width
        strokeColor: backgroundColor  // Use QR background color as default
      };

      onChange(newLogo);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStrokeWidthChange = (value: number) => {
    if (!logo) return;

    onChange({
      ...logo,
      strokeWidth: value
    });
  };

  const handleStrokeColorChange = (color: string) => {
    if (!logo) return;

    onChange({
      ...logo,
      strokeColor: color
    });
  };

  const handleRemoveLogo = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-wide text-[#a3a3a3]">Logo (Optional)</h3>
        {logo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveLogo}
            className="text-red-400 hover:text-red-300 hover:bg-[#1a1a1a]"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Upload Section */}
      {!logo && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={isProcessing}
            className="w-full border-dashed border-2 border-[#333333] bg-[#0a0a0a] hover:bg-[#1a1a1a] hover:border-[#4a28fd] text-white h-24"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-[#a3a3a3]" />
              <span className="text-sm text-[#a3a3a3]">
                {isProcessing ? 'Processing...' : 'Click to upload logo'}
              </span>
              <span className="text-xs text-[#666666]">PNG, JPG, or SVG (max 2MB)</span>
            </div>
          </Button>
        </div>
      )}

      {/* Logo Controls */}
      {logo && (
        <div className="space-y-4">
          {/* Preview */}
          <div className="flex justify-center p-4 bg-[#0a0a0a] rounded-lg border border-[#333333]">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Logo preview"
                className="max-w-[120px] max-h-[120px] object-contain"
              />
            ) : (
              <div className="w-[120px] h-[120px] flex items-center justify-center text-[#a3a3a3] text-sm">
                Loading preview...
              </div>
            )}
          </div>

          {/* Stroke Width Control */}
          <div>
            <Label htmlFor="stroke-width" className="text-white">
              Stroke Width: {logo.strokeWidth}px
            </Label>
            <div className="flex gap-2 mt-2">
              <input
                id="stroke-width"
                type="range"
                min="0"
                max="20"
                step="1"
                value={logo.strokeWidth}
                onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
                className="flex-1 h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer accent-[#4a28fd]"
              />
              <Input
                type="number"
                min="0"
                max="20"
                value={logo.strokeWidth}
                onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
                className="w-16 text-center"
              />
            </div>
          </div>

          {/* Stroke Color Control */}
          <div>
            <Label htmlFor="stroke-color" className="text-white">Stroke Color</Label>
            <div className="flex gap-2 mt-2">
              <input
                id="stroke-color"
                type="color"
                value={logo.strokeColor}
                onChange={(e) => handleStrokeColorChange(e.target.value)}
                className="h-10 w-full rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={logo.strokeColor}
                onChange={(e) => handleStrokeColorChange(e.target.value)}
                className="h-10 w-24 px-2 text-sm rounded border border-border"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Change Logo Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={isProcessing}
            className="w-full border-[#333333] bg-[#1a1a1a] hover:bg-[#0a0a0a] hover:border-[#4a28fd] text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Change Logo
          </Button>
        </div>
      )}

      <p className="text-xs text-[#a3a3a3] italic">
        The logo will be centered in the QR code. A stroke helps ensure visibility against the QR pattern.
      </p>
    </div>
  );
}

