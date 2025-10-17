'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { URLData } from '@/types/qr-types';

interface URLFormProps {
  onChange: (data: URLData) => void;
  initialData?: URLData;
}

export default function URLForm({ onChange, initialData }: URLFormProps) {
  const [url, setUrl] = useState(initialData?.url || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData?.url) {
      setUrl(initialData.url);
    }
  }, [initialData]);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError('');

    if (value.trim() === '') {
      setError('URL is required');
      return;
    }

    try {
      new URL(value);
      onChange({
        type: 'url',
        url: value
      });
    } catch {
      setError('Invalid URL format. Please include http:// or https://');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="url">Website URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="mt-2"
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Enter a complete URL including http:// or https://
        </p>
      </div>
    </div>
  );
}

