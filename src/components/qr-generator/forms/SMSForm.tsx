'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SMSData } from '@/types/qr-types';

interface SMSFormProps {
  onChange: (data: SMSData) => void;
  initialData?: SMSData;
}

export default function SMSForm({ onChange, initialData }: SMSFormProps) {
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [message, setMessage] = useState(initialData?.message || '');

  useEffect(() => {
    if (initialData) {
      setPhone(initialData.phone || '');
      setMessage(initialData.message || '');
    }
  }, [initialData]);

  const updateQRData = (phoneVal: string, messageVal: string) => {
    if (phoneVal.trim()) {
      onChange({
        type: 'sms',
        phone: phoneVal,
        message: messageVal || undefined
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sms-phone">Phone Number</Label>
        <Input
          id="sms-phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            updateQRData(e.target.value, message);
          }}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Include country code for international numbers
        </p>
      </div>

      <div>
        <Label htmlFor="sms-message">Message (Optional)</Label>
        <Textarea
          id="sms-message"
          placeholder="Pre-filled message text..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            updateQRData(phone, e.target.value);
          }}
          className="mt-2 min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Character count: {message.length}
        </p>
      </div>
    </div>
  );
}

