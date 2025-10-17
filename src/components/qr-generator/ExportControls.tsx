'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { exportQRCode } from '@/lib/qr-export';
import { saveToHistory } from '@/lib/local-storage';
import { QRData, ColorConfig, ExportFormat, PNGResolution } from '@/types/qr-types';
import QRCodeStyling from 'qr-code-styling';
import { Download, Loader2, Save } from 'lucide-react';

interface ExportControlsProps {
  qrCode: QRCodeStyling;
  qrData: QRData | null;
  colors: ColorConfig;
}

export default function ExportControls({ qrCode, qrData, colors }: ExportControlsProps) {
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pngResolution, setPngResolution] = useState<PNGResolution>(1024);
  const [message, setMessage] = useState('');

  const handleExport = async (format: ExportFormat) => {
    if (!qrData) return;

    try {
      setExporting(true);
      setMessage('');

      const filename = `qr_${qrData.type}`;
      await exportQRCode(qrCode, format, filename, pngResolution);

      setMessage(`✓ Exported as ${format.toUpperCase()}`);
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('Export error:', error);
      setMessage(`✗ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!qrData) return;

    try {
      setSaving(true);
      setMessage('');

      const historyItem = await saveToHistory(qrData, colors, qrCode);

      if (historyItem) {
        setMessage('✓ Saved to history');
      } else {
        setMessage('Already in history');
      }

      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('Save error:', error);
      setMessage('✗ Failed to save to history');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* PNG Resolution Selector */}
      <div>
        <Label htmlFor="resolution" className="text-white">PNG Resolution</Label>
        <Select
          value={pngResolution.toString()}
          onValueChange={(value) => setPngResolution(parseInt(value) as PNGResolution)}
        >
          <SelectTrigger id="resolution" className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="512">Small (512x512px)</SelectItem>
            <SelectItem value="1024">Medium (1024x1024px)</SelectItem>
            <SelectItem value="2048">Large (2048x2048px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleExport('png')}
          disabled={exporting}
          className="gap-2 bg-[#4a28fd] hover:bg-[#6b48ff] text-white"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          PNG
        </Button>

        <Button
          onClick={() => handleExport('svg')}
          disabled={exporting}
          className="gap-2 bg-[#1a1a1a] border border-[#333333] hover:bg-[#0a0a0a] hover:border-[#4a28fd] text-white"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          SVG
        </Button>

        <Button
          onClick={() => handleExport('pdf')}
          disabled={exporting}
          className="gap-2 bg-[#1a1a1a] border border-[#333333] hover:bg-[#0a0a0a] hover:border-[#4a28fd] text-white"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          PDF
        </Button>

        <Button
          onClick={() => handleExport('eps')}
          disabled={exporting}
          className="gap-2 bg-[#1a1a1a] border border-[#333333] hover:bg-[#0a0a0a] hover:border-[#4a28fd] text-white"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          EPS
        </Button>
      </div>

      {/* Save to History Button */}
      <Button
        onClick={handleSaveToHistory}
        disabled={saving}
        className="w-full gap-2 bg-[#1a1a1a] border border-[#333333] hover:bg-[#0a0a0a] hover:border-[#4a28fd] text-white"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save to History
      </Button>

      {/* Status Message */}
      {message && (
        <p className={`text-sm text-center ${message.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <p className="text-xs text-[#a3a3a3] text-center italic">
        Note: EPS exports as SVG format. Convert to EPS using Illustrator or Inkscape for print workflows.
      </p>
    </div>
  );
}

