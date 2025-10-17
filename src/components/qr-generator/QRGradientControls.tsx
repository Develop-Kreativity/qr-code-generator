'use client';

import { Label } from '@/components/ui/label';
import { ColorConfig } from '@/types/qr-types';

interface QRGradientControlsProps {
  colors: ColorConfig;
  onChange: (config: Partial<ColorConfig>) => void;
}

export default function QRGradientControls({ colors, onChange }: QRGradientControlsProps) {
  const gradientEnabled = colors.gradientEnabled || false;
  const gradientSecondaryColor = colors.gradientSecondaryColor || '#8900D5';
  const gradientType = colors.gradientType || 'linear';
  const gradientRotation = colors.gradientRotation || 0;

  const handleToggleGradient = () => {
    onChange({ 
      gradientEnabled: !gradientEnabled,
      gradientSecondaryColor: gradientSecondaryColor,
      gradientType: gradientType,
      gradientRotation: gradientRotation
    });
  };

  const handleSecondaryColorChange = (color: string) => {
    onChange({ gradientSecondaryColor: color });
  };

  const handleGradientTypeChange = (type: 'linear' | 'radial') => {
    onChange({ gradientType: type });
  };

  const handleRotationChange = (rotation: number) => {
    onChange({ gradientRotation: rotation });
  };

  // Generate preview gradient style
  const getPreviewStyle = () => {
    if (!gradientEnabled) return {};
    
    const color1 = colors.foreground;
    const color2 = gradientSecondaryColor;
    
    if (gradientType === 'radial') {
      return {
        background: `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`
      };
    } else {
      return {
        background: `linear-gradient(${gradientRotation}deg, ${color1} 0%, ${color2} 100%)`
      };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-wide text-[#a3a3a3]">Gradient Effects</h3>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enable-gradient"
            checked={gradientEnabled}
            onChange={handleToggleGradient}
            className="w-4 h-4 rounded border-[#333333] bg-[#0a0a0a] text-[#4a28fd] focus:ring-[#4a28fd] focus:ring-offset-0 cursor-pointer"
          />
          <Label 
            htmlFor="enable-gradient" 
            className="text-sm text-white cursor-pointer"
          >
            Enable Gradient
          </Label>
        </div>
      </div>

      {gradientEnabled && (
        <div className="space-y-4 pt-2">
          {/* Secondary Color Picker */}
          <div className="space-y-2">
            <Label className="text-white">Secondary Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={gradientSecondaryColor}
                onChange={(e) => handleSecondaryColorChange(e.target.value)}
                className="h-10 w-full rounded border border-[#333333] cursor-pointer bg-[#0a0a0a]"
              />
              <input
                type="text"
                value={gradientSecondaryColor}
                onChange={(e) => handleSecondaryColorChange(e.target.value)}
                className="h-10 w-24 px-2 text-sm rounded border border-[#333333] bg-[#0a0a0a] text-white focus:border-[#4a28fd] focus:outline-none"
                placeholder="#8900D5"
              />
            </div>
          </div>

          {/* Gradient Type Selector */}
          <div className="space-y-2">
            <Label className="text-white">Gradient Type</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="gradient-linear"
                  name="gradient-type"
                  checked={gradientType === 'linear'}
                  onChange={() => handleGradientTypeChange('linear')}
                  className="w-4 h-4 border-[#333333] bg-[#0a0a0a] text-[#4a28fd] focus:ring-[#4a28fd] focus:ring-offset-0 cursor-pointer"
                />
                <Label 
                  htmlFor="gradient-linear" 
                  className="text-sm text-[#a3a3a3] cursor-pointer"
                >
                  Linear
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="gradient-radial"
                  name="gradient-type"
                  checked={gradientType === 'radial'}
                  onChange={() => handleGradientTypeChange('radial')}
                  className="w-4 h-4 border-[#333333] bg-[#0a0a0a] text-[#4a28fd] focus:ring-[#4a28fd] focus:ring-offset-0 cursor-pointer"
                />
                <Label 
                  htmlFor="gradient-radial" 
                  className="text-sm text-[#a3a3a3] cursor-pointer"
                >
                  Radial
                </Label>
              </div>
            </div>
          </div>

          {/* Rotation Slider - Only for Linear Gradients */}
          {gradientType === 'linear' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Rotation</Label>
                <span className="text-sm text-[#a3a3a3]">{gradientRotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={gradientRotation}
                onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                className="w-full h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </div>
          )}

          {/* Gradient Preview */}
          <div className="space-y-2">
            <Label className="text-white">Preview</Label>
            <div
              className="h-16 w-full rounded border border-[#333333]"
              style={getPreviewStyle()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
