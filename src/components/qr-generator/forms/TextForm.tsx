'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TextData } from '@/types/qr-types';

interface TextFormProps {
  onChange: (data: TextData) => void;
  initialData?: TextData;
}

export default function TextForm({ onChange, initialData }: TextFormProps) {
  const [text, setText] = useState(initialData?.text || '');

  useEffect(() => {
    if (initialData?.text) {
      setText(initialData.text);
    }
  }, [initialData]);

  const handleTextChange = (value: string) => {
    setText(value);
    
    if (value.trim()) {
      onChange({
        type: 'text',
        text: value
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Text Content</Label>
        <Textarea
          id="text"
          placeholder="Enter any text you want to encode in the QR code..."
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="mt-2 min-h-[150px]"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Character count: {text.length}
        </p>
      </div>
    </div>
  );
}

