'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { VCardData, VCardPhone, VCardEmail, VCardAddress, PhoneType, EmailType, AddressType } from '@/types/qr-types';
import { Plus, X } from 'lucide-react';

interface VCardFormProps {
  onChange: (data: VCardData) => void;
  initialData?: VCardData;
}

export default function VCardForm({ onChange, initialData }: VCardFormProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [middleName, setMiddleName] = useState(initialData?.middleName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [prefix, setPrefix] = useState(initialData?.prefix || '');
  const [suffix, setSuffix] = useState(initialData?.suffix || '');
  const [nickname, setNickname] = useState(initialData?.nickname || '');
  const [birthday, setBirthday] = useState(initialData?.birthday || '');
  
  const [phones, setPhones] = useState<VCardPhone[]>(initialData?.phones || [{ type: 'mobile', number: '' }]);
  const [emails, setEmails] = useState<VCardEmail[]>(initialData?.emails || [{ type: 'personal', address: '' }]);
  const [addresses, setAddresses] = useState<VCardAddress[]>(initialData?.addresses || []);
  
  const [organization, setOrganization] = useState(initialData?.organization || '');
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [workWebsite, setWorkWebsite] = useState(initialData?.workWebsite || '');
  
  const [linkedin, setLinkedin] = useState(initialData?.socialMedia?.linkedin || '');
  const [twitter, setTwitter] = useState(initialData?.socialMedia?.twitter || '');
  const [facebook, setFacebook] = useState(initialData?.socialMedia?.facebook || '');
  const [instagram, setInstagram] = useState(initialData?.socialMedia?.instagram || '');
  const [website, setWebsite] = useState(initialData?.socialMedia?.website || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const updateQRData = useCallback(() => {
    if (!firstName.trim() || !lastName.trim()) return;

    const data: VCardData = {
      type: 'vcard',
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      prefix: prefix.trim() || undefined,
      suffix: suffix.trim() || undefined,
      nickname: nickname.trim() || undefined,
      birthday: birthday || undefined,
      phones: phones.filter(p => p.number.trim()),
      emails: emails.filter(e => e.address.trim()),
      addresses: addresses,
      organization: organization.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      department: department.trim() || undefined,
      role: role.trim() || undefined,
      workWebsite: workWebsite.trim() || undefined,
      socialMedia: {
        linkedin: linkedin.trim() || undefined,
        twitter: twitter.trim() || undefined,
        facebook: facebook.trim() || undefined,
        instagram: instagram.trim() || undefined,
        website: website.trim() || undefined
      },
      notes: notes.trim() || undefined
    };

    onChange(data);
  }, [firstName, lastName, phones, emails, addresses, organization, jobTitle, department, role, 
      workWebsite, middleName, prefix, suffix, nickname, birthday, linkedin, twitter, facebook, 
      instagram, website, notes, onChange]);

  useEffect(() => {
    updateQRData();
  }, [updateQRData]);

  const addPhone = () => {
    setPhones([...phones, { type: 'mobile', number: '' }]);
  };

  const removePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const updatePhone = (index: number, field: 'type' | 'number', value: string) => {
    const newPhones = [...phones];
    if (field === 'type') {
      newPhones[index].type = value as PhoneType;
    } else {
      newPhones[index].number = value;
    }
    setPhones(newPhones);
  };

  const addEmail = () => {
    setEmails([...emails, { type: 'personal', address: '' }]);
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, field: 'type' | 'address', value: string) => {
    const newEmails = [...emails];
    if (field === 'type') {
      newEmails[index].type = value as EmailType;
    } else {
      newEmails[index].address = value;
    }
    setEmails(newEmails);
  };

  const addAddress = () => {
    setAddresses([...addresses, { type: 'home', street: '', city: '', state: '', postalCode: '', country: '' }]);
  };

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const updateAddress = (index: number, field: keyof VCardAddress, value: string) => {
    const newAddresses = [...addresses];
    if (field === 'type') {
      newAddresses[index].type = value as AddressType;
    } else {
      newAddresses[index][field] = value;
    }
    setAddresses(newAddresses);
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Personal Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="prefix">Prefix</Label>
            <Input
              id="prefix"
              placeholder="Mr., Dr."
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="suffix">Suffix</Label>
            <Input
              id="suffix"
              placeholder="Jr., III"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Phone Numbers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Phone Numbers</h3>
          <Button type="button" variant="outline" size="sm" onClick={addPhone}>
            <Plus className="h-4 w-4 mr-2" /> Add Phone
          </Button>
        </div>

        {phones.map((phone, index) => (
          <div key={index} className="flex gap-2">
            <Select value={phone.type} onValueChange={(value) => updatePhone(index, 'type', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="fax">Fax</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Phone number"
              value={phone.number}
              onChange={(e) => updatePhone(index, 'number', e.target.value)}
            />
            {phones.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removePhone(index)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Separator />

      {/* Email Addresses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Email Addresses</h3>
          <Button type="button" variant="outline" size="sm" onClick={addEmail}>
            <Plus className="h-4 w-4 mr-2" /> Add Email
          </Button>
        </div>

        {emails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <Select value={email.type} onValueChange={(value) => updateEmail(index, 'type', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="email"
              placeholder="Email address"
              value={email.address}
              onChange={(e) => updateEmail(index, 'address', e.target.value)}
            />
            {emails.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeEmail(index)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Separator />

      {/* Professional Information */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Professional Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="workWebsite">Work Website</Label>
          <Input
            id="workWebsite"
            type="url"
            placeholder="https://company.com"
            value={workWebsite}
            onChange={(e) => setWorkWebsite(e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      <Separator />

      {/* Addresses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Addresses</h3>
          <Button type="button" variant="outline" size="sm" onClick={addAddress}>
            <Plus className="h-4 w-4 mr-2" /> Add Address
          </Button>
        </div>

        {addresses.map((address, index) => (
          <div key={index} className="space-y-3 p-4 border border-border rounded-md">
            <div className="flex items-center justify-between">
              <Select value={address.type} onValueChange={(value) => updateAddress(index, 'type', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="postal">Postal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeAddress(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Input
              placeholder="Street address"
              value={address.street || ''}
              onChange={(e) => updateAddress(index, 'street', e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="City"
                value={address.city || ''}
                onChange={(e) => updateAddress(index, 'city', e.target.value)}
              />
              <Input
                placeholder="State/Province"
                value={address.state || ''}
                onChange={(e) => updateAddress(index, 'state', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Postal Code"
                value={address.postalCode || ''}
                onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
              />
              <Input
                placeholder="Country"
                value={address.country || ''}
                onChange={(e) => updateAddress(index, 'country', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Social Media & Web</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/username"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="twitter">Twitter/X</Label>
            <Input
              id="twitter"
              placeholder="https://twitter.com/username"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/username"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="https://instagram.com/username"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="website">Personal Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://yourwebsite.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      <Separator />

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional information..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2 min-h-[80px]"
        />
      </div>
    </div>
  );
}

