'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ColorConfig } from '@/types/qr-types';

interface QRColorPickerProps {
  colors: ColorConfig;
  onChange: (colors: ColorConfig | Partial<ColorConfig>) => void;
}

const PRESET_COLORS = [
  { name: 'Company Primary', foreground: '#4a28fd', background: '#ffffff' },
  { name: 'Company Dark', foreground: '#111111', background: '#ffffff' },
  { name: 'Inverted Primary', foreground: '#ffffff', background: '#4a28fd' },
  { name: 'Classic Black', foreground: '#000000', background: '#ffffff' },
  { name: 'Deep Purple', foreground: '#6b48ff', background: '#ffffff' },
  { name: 'Light Purple', foreground: '#8b6bff', background: '#ffffff' },
];

export default function QRColorPicker({ colors, onChange }: QRColorPickerProps) {
  const handleForegroundChange = (color: string) => {
    onChange({ foreground: color });
  };

  const handleBackgroundChange = (color: string) => {
    onChange({ background: color });
  };

  const handleTransparentToggle = () => {
    onChange({ transparentBackground: !colors.transparentBackground });
  };

  const handlePresetClick = (preset: { foreground: string; background: string }) => {
    onChange({ foreground: preset.foreground, background: preset.background });
  };

  const handleReset = () => {
    onChange({ 
      foreground: '#4a28fd', 
      background: '#ffffff',
      transparentBackground: false
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-wide text-[#a3a3a3]">Customize Colors</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReset} 
          className="text-white hover:text-[#4a28fd] hover:bg-[#1a1a1a]"
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="foreground-color">Foreground</Label>
          <div className="flex gap-2 mt-2">
            <input
              id="foreground-color"
              type="color"
              value={colors.foreground}
              onChange={(e) => handleForegroundChange(e.target.value)}
              className="h-10 w-full rounded border border-[#333333] cursor-pointer bg-[#0a0a0a]"
            />
            <input
              type="text"
              value={colors.foreground}
              onChange={(e) => handleForegroundChange(e.target.value)}
              className="h-10 w-24 px-2 text-sm rounded border border-[#333333] bg-[#0a0a0a] text-white focus:border-[#4a28fd] focus:outline-none"
              placeholder="#000000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="background-color">Background</Label>
          <div className="flex gap-2 mt-2">
            <input
              id="background-color"
              type="color"
              value={colors.background}
              onChange={(e) => handleBackgroundChange(e.target.value)}
              disabled={colors.transparentBackground}
              className="h-10 w-full rounded border border-[#333333] cursor-pointer bg-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              type="text"
              value={colors.background}
              onChange={(e) => handleBackgroundChange(e.target.value)}
              disabled={colors.transparentBackground}
              className="h-10 w-24 px-2 text-sm rounded border border-[#333333] bg-[#0a0a0a] text-white focus:border-[#4a28fd] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="#ffffff"
            />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              id="trans-bg"
              checked={colors.transparentBackground || false}
              onChange={handleTransparentToggle}
              className="w-4 h-4 rounded border-[#333333] bg-[#0a0a0a] text-[#4a28fd] focus:ring-[#4a28fd] focus:ring-offset-0 cursor-pointer"
            />
            <Label htmlFor="trans-bg" className="text-sm text-[#a3a3a3] cursor-pointer">
              Transparent Background
            </Label>
          </div>
        </div>
      </div>

      {/* Preset Color Swatches */}
      <div>
        <Label className="mb-2 block text-white">Preset Colors</Label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset)}
              className="flex items-center gap-2 p-2 rounded border border-[#333333] bg-[#1a1a1a] hover:bg-[#0a0a0a] hover:border-[#4a28fd] transition-colors text-white"
              title={preset.name}
            >
              <div className="flex h-6 w-6 rounded overflow-hidden border border-[#333333]">
                <div className="w-1/2" style={{ backgroundColor: preset.foreground }} />
                <div className="w-1/2" style={{ backgroundColor: preset.background }} />
              </div>
              <span className="text-xs truncate">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#a3a3a3] italic">
        Ensure sufficient contrast between foreground and background for optimal scanning
      </p>
    </div>
  );
}
