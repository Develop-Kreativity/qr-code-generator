'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HistoryItem } from '@/types/qr-types';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

interface HistoryCardProps {
  item: HistoryItem;
  onLoad: () => void;
  onDelete: () => void;
}

export default function HistoryCard({ item, onLoad, onDelete }: HistoryCardProps) {
  return (
    <Card className="p-3 bg-[#1a1a1a] border-[#333333] hover:bg-[#0a0a0a] hover:border-[#4a28fd] transition-colors cursor-pointer group">
      <div onClick={onLoad}>
        {/* Thumbnail */}
        <div className="aspect-square bg-[#0a0a0a] rounded overflow-hidden mb-3 border border-[#333333]">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={`QR Code - ${item.type}`}
              width={400}
              height={400}
              className="w-full h-full object-contain"
              unoptimized={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#a3a3a3]">
              No preview
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 bg-[#4a28fd]/20 text-[#4a28fd] rounded uppercase border border-[#4a28fd]/30">
              {item.type}
            </span>
            <span className="text-xs text-[#a3a3a3]">
              {format(new Date(item.timestamp), 'MMM d')}
            </span>
          </div>

          <p className="text-xs text-[#a3a3a3] line-clamp-2">
            {getPreviewText(item)}
          </p>
        </div>
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </Button>
    </Card>
  );
}

function getPreviewText(item: HistoryItem): string {
  const { data } = item;
  
  switch (data.type) {
    case 'url':
      return data.url;
    case 'text':
      return data.text.substring(0, 50);
    case 'email':
      return data.email;
    case 'phone':
      return data.phone;
    case 'sms':
      return `${data.phone}${data.message ? ': ' + data.message.substring(0, 30) : ''}`;
    case 'vcard':
      return `${data.firstName} ${data.lastName}`;
    case 'mecard':
      return data.name;
    case 'location':
      return `${data.latitude}, ${data.longitude}`;
    default:
      return 'QR Code';
  }
}

