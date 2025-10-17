'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getHistory, deleteHistoryItem, clearHistory, filterHistoryByType, sortHistory } from '@/lib/local-storage';
import { HistoryItem, QRData, ColorConfig } from '@/types/qr-types';
import HistoryCard from './HistoryCard';
import { X, Trash2, Search } from 'lucide-react';

interface HistoryGalleryProps {
  onClose: () => void;
  onLoadItem: (data: QRData, colors: ColorConfig) => void;
}

export default function HistoryGallery({ onClose, onLoadItem }: HistoryGalleryProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'type'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = () => {
    const history = getHistory();
    setItems(history);
  };

  const applyFiltersAndSort = useCallback(() => {
    let result = [...items];

    // Apply type filter
    if (filterType !== 'all') {
      result = filterHistoryByType(filterType);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        const text = getSearchText(item).toLowerCase();
        return text.includes(query);
      });
    }

    // Apply sort
    if (filterType === 'all') {
      result = sortHistory(sortBy);
      
      // Re-apply search after sort
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter(item => {
          const text = getSearchText(item).toLowerCase();
          return text.includes(query);
        });
      }
    } else {
      // Manual sort for filtered results
      result.sort((a, b) => {
        if (sortBy === 'newest') return b.timestamp - a.timestamp;
        if (sortBy === 'oldest') return a.timestamp - b.timestamp;
        return a.type.localeCompare(b.type);
      });
    }

    setFilteredItems(result);
  }, [items, filterType, sortBy, searchQuery]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const getSearchText = (item: HistoryItem): string => {
    const { data } = item;
    
    switch (data.type) {
      case 'url':
        return data.url;
      case 'text':
        return data.text;
      case 'email':
        return `${data.email} ${data.subject || ''} ${data.body || ''}`;
      case 'phone':
        return data.phone;
      case 'sms':
        return `${data.phone} ${data.message || ''}`;
      case 'vcard':
        return `${data.firstName} ${data.lastName} ${data.organization || ''} ${data.jobTitle || ''}`;
      case 'mecard':
        return `${data.name} ${data.email || ''} ${data.phone || ''}`;
      case 'location':
        return `${data.latitude} ${data.longitude} ${data.address || ''}`;
      default:
        return '';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this QR code from history?')) {
      deleteHistoryItem(id);
      loadHistory();
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all history? This action cannot be undone.')) {
      clearHistory();
      loadHistory();
    }
  };

  const handleLoadItem = (item: HistoryItem) => {
    onLoadItem(item.data, item.colors);
  };

  return (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Header */}
      <div className="p-4 border-b border-[#333333] flex items-center justify-between">
        <h2 className="text-lg text-white">QR Code History</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:text-[#4a28fd] hover:bg-[#1a1a1a]">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-3 border-b border-[#333333] bg-[#111111]">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#0a0a0a] hover:border-[#4a28fd] data-[state=open]:border-[#4a28fd] data-[state=open]:ring-1 data-[state=open]:ring-[#4a28fd]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#333333] z-[100]">
            <SelectItem value="all" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">All Types</SelectItem>
            <SelectItem value="url" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">URL</SelectItem>
            <SelectItem value="text" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">Text</SelectItem>
            <SelectItem value="email" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">Email</SelectItem>
            <SelectItem value="phone" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">Phone</SelectItem>
            <SelectItem value="sms" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">SMS</SelectItem>
            <SelectItem value="vcard" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">VCard</SelectItem>
            <SelectItem value="mecard" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">MeCard</SelectItem>
            <SelectItem value="location" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">Location</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'type')}>
          <SelectTrigger className="bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#0a0a0a] hover:border-[#4a28fd] data-[state=open]:border-[#4a28fd] data-[state=open]:ring-1 data-[state=open]:ring-[#4a28fd]">
            <SelectValue placeholder="Newest First" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#333333] z-[100]">
            <SelectItem value="newest" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">Newest First</SelectItem>
            <SelectItem value="oldest" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">Oldest First</SelectItem>
            <SelectItem value="type" className="text-white hover:bg-[#4a28fd]/20 focus:bg-[#4a28fd]/20 data-[highlighted]:bg-[#4a28fd]/20">By Type</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear All */}
        {items.length > 0 && (
          <Button
            size="sm"
            onClick={handleClearAll}
            className="w-full gap-2 bg-[#1a1a1a] border border-[#333333] hover:bg-red-900/20 hover:border-red-500 text-white"
          >
            <Trash2 className="h-4 w-4" />
            Clear All History
          </Button>
        )}
      </div>

      {/* Gallery */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#111111]">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#a3a3a3]">
              {items.length === 0
                ? 'No QR codes saved yet'
                : 'No results found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onLoad={() => handleLoadItem(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#333333] bg-[#111111]">
        <p className="text-xs text-center text-[#a3a3a3]">
          {filteredItems.length} of {items.length} QR codes
        </p>
      </div>
    </div>
  );
}

