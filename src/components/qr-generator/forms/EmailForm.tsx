'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EmailData } from '@/types/qr-types';

interface EmailFormProps {
  onChange: (data: EmailData) => void;
  initialData?: EmailData;
}

export default function EmailForm({ onChange, initialData }: EmailFormProps) {
  const [email, setEmail] = useState(initialData?.email || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setEmail(initialData.email || '');
      setSubject(initialData.subject || '');
      setBody(initialData.body || '');
    }
  }, [initialData]);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError('');

    if (value.trim() === '') {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(value)) {
      setError('Invalid email format');
      return;
    }

    updateQRData(value, subject, body);
  };

  const updateQRData = (emailVal: string, subjectVal: string, bodyVal: string) => {
    if (emailVal && validateEmail(emailVal)) {
      onChange({
        type: 'email',
        email: emailVal,
        subject: subjectVal || undefined,
        body: bodyVal || undefined
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="contact@example.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="mt-2"
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>

      <div>
        <Label htmlFor="subject">Subject (Optional)</Label>
        <Input
          id="subject"
          type="text"
          placeholder="Email subject"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            updateQRData(email, e.target.value, body);
          }}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="body">Message (Optional)</Label>
        <Textarea
          id="body"
          placeholder="Email message body..."
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            updateQRData(email, subject, e.target.value);
          }}
          className="mt-2 min-h-[100px]"
        />
      </div>
    </div>
  );
}

