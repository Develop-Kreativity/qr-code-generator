'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRType, QRData, ColorConfig } from '@/types/qr-types';
import QRCodeStyling from 'qr-code-styling';
import { History } from 'lucide-react';
import QRPreview from '@/components/qr-generator/QRPreview';
import QRColorPicker from '@/components/qr-generator/QRColorPicker';
import ExportControls from '@/components/qr-generator/ExportControls';
import URLForm from '@/components/qr-generator/forms/URLForm';
import TextForm from '@/components/qr-generator/forms/TextForm';
import EmailForm from '@/components/qr-generator/forms/EmailForm';
import PhoneForm from '@/components/qr-generator/forms/PhoneForm';
import SMSForm from '@/components/qr-generator/forms/SMSForm';
import LocationForm from '@/components/qr-generator/forms/LocationForm';
import VCardForm from '@/components/qr-generator/forms/VCardForm';
import MeCardForm from '@/components/qr-generator/forms/MeCardForm';
import HistoryGallery from '@/components/history/HistoryGallery';
import { saveToHistory, updateHistoryItem } from '@/lib/local-storage';

// Default company colors
const DEFAULT_COLORS: ColorConfig = {
  foreground: '#4a28fd',  // Company primary color (vivid blue)
  background: '#ffffff'   // White background for QR code readability
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<QRType>('url');
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [colors, setColors] = useState<ColorConfig>(DEFAULT_COLORS);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Track the last auto-saved history entry ID per QR type
  const autoSaveTracker = useRef<Record<string, string>>({});
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const handleDataChange = useCallback((data: QRData) => {
    setQrData(data);
  }, []);

  const handleColorChange = useCallback((newColors: ColorConfig) => {
    setColors(newColors);
  }, []);

  const handleQRCodeGenerated = useCallback((code: QRCodeStyling) => {
    setQrCode(code);
  }, []);

  const handleLoadFromHistory = useCallback((data: QRData, historyColors: ColorConfig) => {
    setQrData(data);
    setColors(historyColors);
    setActiveTab(data.type);
    setShowHistory(false);
  }, []);

  // Auto-save function with debouncing
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Only auto-save if we have valid QR data and QR code instance
    if (!qrData || !qrCode) {
      return;
    }

    // Set up new timer for 5 seconds
    autoSaveTimer.current = setTimeout(async () => {
      try {
        const currentType = qrData.type;
        const existingEntryId = autoSaveTracker.current[currentType];

        if (existingEntryId) {
          // Update existing entry for this QR type
          const updatedItem = await updateHistoryItem(
            existingEntryId,
            qrData,
            colors,
            qrCode
          );
          if (updatedItem) {
            console.log('Auto-saved: Updated existing entry for', currentType);
          }
        } else {
          // Create new entry for this QR type
          const newItem = await saveToHistory(qrData, colors, qrCode);
          if (newItem) {
            autoSaveTracker.current[currentType] = newItem.id;
            console.log('Auto-saved: Created new entry for', currentType);
          }
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 5000); // 5 seconds delay

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [qrData, colors, qrCode]);

  // When switching tabs, clear the tracking for the previous tab type
  // This ensures the next edit on that tab creates a new entry
  const handleTabChange = useCallback((value: string) => {
    const newTab = value as QRType;
    
    // Clear the auto-save tracking for the current tab before switching
    if (activeTab && autoSaveTracker.current[activeTab]) {
      delete autoSaveTracker.current[activeTab];
    }
    
    setActiveTab(newTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header */}
      <header className="border-b border-[#333333] bg-[#111111]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-white">QR Code Generator</h1>
              <p className="text-sm text-[#a3a3a3] mt-1">
                Create QR codes for various data types with custom styling
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="gap-2 bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#4a28fd] hover:border-[#4a28fd]"
            >
              <History className="h-4 w-4" />
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7">
            <Card className="p-6 bg-[#1a1a1a] border-[#333333]">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 mb-6">
                  <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                  <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
                  <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
                  <TabsTrigger value="phone" className="text-xs">Phone</TabsTrigger>
                  <TabsTrigger value="sms" className="text-xs">SMS</TabsTrigger>
                  <TabsTrigger value="vcard" className="text-xs">VCard</TabsTrigger>
                  <TabsTrigger value="mecard" className="text-xs">MeCard</TabsTrigger>
                  <TabsTrigger value="location" className="text-xs">Location</TabsTrigger>
                </TabsList>

                <div className="space-y-6">
                  <TabsContent value="url" className="mt-0">
                    <URLForm onChange={handleDataChange} initialData={qrData?.type === 'url' ? qrData : undefined} />
                  </TabsContent>

                  <TabsContent value="text" className="mt-0">
                    <TextForm onChange={handleDataChange} initialData={qrData?.type === 'text' ? qrData : undefined} />
                  </TabsContent>

                  <TabsContent value="email" className="mt-0">
                    <EmailForm onChange={handleDataChange} initialData={qrData?.type === 'email' ? qrData : undefined} />
                  </TabsContent>

                  <TabsContent value="phone" className="mt-0">
                    <PhoneForm onChange={handleDataChange} initialData={qrData?.type === 'phone' ? qrData : undefined} />
                  </TabsContent>

                  <TabsContent value="sms" className="mt-0">
                    <SMSForm onChange={handleDataChange} initialData={qrData?.type === 'sms' ? qrData : undefined} />
                  </TabsContent>

                  <TabsContent value="vcard" className="mt-0">
                    <VCardForm onChange={handleDataChange} initialData={qrData?.type === 'vcard' ? qrData : undefined} />
                  </TabsContent>

                  <TabsContent value="mecard" className="mt-0">
                    <MeCardForm onChange={handleDataChange} initialData={qrData?.type === 'mecard' ? qrData : undefined} />
                  </TabsContent>

                  <TabsContent value="location" className="mt-0">
                    <LocationForm onChange={handleDataChange} initialData={qrData?.type === 'location' ? qrData : undefined} />
                  </TabsContent>

                  {/* Color Picker */}
                  <div className="pt-4 border-t border-border">
                    <QRColorPicker colors={colors} onChange={handleColorChange} />
                  </div>
                </div>
              </Tabs>
            </Card>
          </div>

          {/* Right Column: Preview & Export */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 bg-[#1a1a1a] border-[#333333]">
              <h2 className="text-lg mb-4 text-white">Preview</h2>
              <QRPreview
                data={qrData}
                colors={colors}
                onQRCodeGenerated={handleQRCodeGenerated}
              />
            </Card>

            {qrCode && (
              <Card className="p-6 bg-[#1a1a1a] border-[#333333]">
                <h2 className="text-lg mb-4 text-white">Export</h2>
                <ExportControls qrCode={qrCode} qrData={qrData} colors={colors} />
              </Card>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#111111] border-l border-[#333333] shadow-lg z-50 overflow-y-auto">
            <HistoryGallery
              onClose={() => setShowHistory(false)}
              onLoadItem={handleLoadFromHistory}
            />
          </div>
        )}
      </main>
    </div>
  );
}
