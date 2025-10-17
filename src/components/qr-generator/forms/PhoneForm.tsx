'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneData } from '@/types/qr-types';

interface PhoneFormProps {
  onChange: (data: PhoneData) => void;
  initialData?: PhoneData;
}

export default function PhoneForm({ onChange, initialData }: PhoneFormProps) {
  const [phone, setPhone] = useState(initialData?.phone || '');

  useEffect(() => {
    if (initialData?.phone) {
      setPhone(initialData.phone);
    }
  }, [initialData]);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    
    if (value.trim()) {
      onChange({
        type: 'phone',
        phone: value
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Include country code for international numbers (e.g., +1 for US)
        </p>
      </div>
    </div>
  );
}

