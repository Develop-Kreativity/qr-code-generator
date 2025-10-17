'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationData } from '@/types/qr-types';

interface LocationFormProps {
  onChange: (data: LocationData) => void;
  initialData?: LocationData;
}

export default function LocationForm({ onChange, initialData }: LocationFormProps) {
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [errors, setErrors] = useState({ latitude: '', longitude: '' });

  useEffect(() => {
    if (initialData) {
      setLatitude(initialData.latitude?.toString() || '');
      setLongitude(initialData.longitude?.toString() || '');
      setAddress(initialData.address || '');
    }
  }, [initialData]);

  const validateAndUpdate = (lat: string, lng: string, addr: string) => {
    const newErrors = { latitude: '', longitude: '' };
    
    // Handle empty inputs - don't show errors, just don't generate QR
    if (!lat || !lng) {
      setErrors(newErrors);
      return;
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    // Validate latitude
    if (isNaN(latNum)) {
      newErrors.latitude = 'Invalid latitude';
    } else if (latNum < -90 || latNum > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    // Validate longitude
    if (isNaN(lngNum)) {
      newErrors.longitude = 'Invalid longitude';
    } else if (lngNum < -180 || lngNum > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);

    // Only generate QR if both coordinates are valid
    if (!newErrors.latitude && !newErrors.longitude) {
      onChange({
        type: 'location',
        latitude: latNum,
        longitude: lngNum,
        address: addr || undefined
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="latitude">Latitude</Label>
        <Input
          id="latitude"
          type="number"
          step="any"
          placeholder="37.7749"
          value={latitude}
          onChange={(e) => {
            setLatitude(e.target.value);
            validateAndUpdate(e.target.value, longitude, address);
          }}
          className="mt-2"
        />
        {errors.latitude && <p className="text-sm text-red-500 mt-1">{errors.latitude}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Range: -90 to 90
        </p>
      </div>

      <div>
        <Label htmlFor="longitude">Longitude</Label>
        <Input
          id="longitude"
          type="number"
          step="any"
          placeholder="-122.4194"
          value={longitude}
          onChange={(e) => {
            setLongitude(e.target.value);
            validateAndUpdate(latitude, e.target.value, address);
          }}
          className="mt-2"
        />
        {errors.longitude && <p className="text-sm text-red-500 mt-1">{errors.longitude}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Range: -180 to 180
        </p>
      </div>

      <div>
        <Label htmlFor="address">Address (Optional)</Label>
        <Input
          id="address"
          type="text"
          placeholder="San Francisco, CA"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            validateAndUpdate(latitude, longitude, e.target.value);
          }}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Human-readable address for reference
        </p>
      </div>
    </div>
  );
}

