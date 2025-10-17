'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MeCardData } from '@/types/qr-types';

interface MeCardFormProps {
  onChange: (data: MeCardData) => void;
  initialData?: MeCardData;
}

export default function MeCardForm({ onChange, initialData }: MeCardFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [note, setNote] = useState(initialData?.note || '');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setUrl(initialData.url || '');
      setAddress(initialData.address || '');
      setNote(initialData.note || '');
    }
  }, [initialData]);

  const updateQRData = useCallback(() => {
    if (!name.trim()) return;

    const data: MeCardData = {
      type: 'mecard',
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      url: url.trim() || undefined,
      address: address.trim() || undefined,
      note: note.trim() || undefined
    };

    onChange(data);
  }, [name, phone, email, url, address, note, onChange]);

  useEffect(() => {
    updateQRData();
  }, [updateQRData]);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">
          <span className="italic">MeCard is a simplified contact format popular in Japan.</span> It&apos;s lighter than VCard 
          but supports fewer fields. Use VCard for comprehensive contact information.
        </p>
      </div>

      <div>
        <Label htmlFor="mecard-name">Name *</Label>
        <Input
          id="mecard-name"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">Required field</p>
      </div>

      <div>
        <Label htmlFor="mecard-phone">Phone</Label>
        <Input
          id="mecard-phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="mecard-email">Email</Label>
        <Input
          id="mecard-email"
          type="email"
          placeholder="contact@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="mecard-url">URL/Website</Label>
        <Input
          id="mecard-url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="mecard-address">Address</Label>
        <Input
          id="mecard-address"
          placeholder="123 Main St, City, State, ZIP"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Single line address format
        </p>
      </div>

      <div>
        <Label htmlFor="mecard-note">Note/Memo</Label>
        <Textarea
          id="mecard-note"
          placeholder="Additional notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2 min-h-[80px]"
        />
      </div>
    </div>
  );
}

