import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Grid, List, X } from 'lucide-react';

interface EnhancedSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  categories: Array<{ id: string; name: string; nameBn: string; count: number }>;
  totalResults: number;
}

export function EnhancedSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  categories,
  totalResults
}: EnhancedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Accessibility: Clear search with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchQuery) {
        onSearchChange('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, onSearchChange]);

  return (
    <div className="space-y-4">
      {/* Search Bar with Enhanced UX */}
      <div className="relative">
        <div className={`relative transition-all duration-200 ${
          isFocused ? 'transform scale-[1.02] shadow-lg' : 'shadow-sm'
        }`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="ডকুমেন্ট খুঁজুন... (যেমন: আইডি কার্ড, রেজাল্ট শিট)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="pl-10 pr-12 h-12 text-lg border-2 focus:border-blue-500 transition-all duration-200"
            aria-label="ডকুমেন্ট সার্চ করুন"
            role="searchbox"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
              aria-label="সার্চ পরিষ্কার করুন"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Search Results Count */}
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">{totalResults}</span> টি ফলাফল পাওয়া গেছে
          </div>
        )}
      </div>

      {/* Filter and View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <Filter className="h-4 w-4" />
            ফিল্টার
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">1</Badge>
            )}
          </Button>

          {/* Quick Category Filters */}
          <div className="hidden md:flex items-center gap-2">
            {categories.slice(0, 4).map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className="text-sm"
              >
                {category.nameBn}
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="px-3 py-2"
            aria-label="গ্রিড ভিউ"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="px-3 py-2"
            aria-label="লিস্ট ভিউ"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <Card id="filter-panel" className="mt-4">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">ক্যাটাগরি অনুযায়ী ফিল্টার</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategoryChange('all')}
                    className="justify-start"
                  >
                    সব ডকুমেন্ট
                    <Badge variant="secondary" className="ml-auto px-1 py-0 text-xs">
                      {categories.reduce((sum, cat) => sum + cat.count, 0)}
                    </Badge>
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => onCategoryChange(category.id)}
                      className="justify-start"
                    >
                      {category.nameBn}
                      <Badge variant="secondary" className="ml-auto px-1 py-0 text-xs">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {(selectedCategory !== 'all' || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">সক্রিয় ফিল্টার:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              সার্চ: "{searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {categories.find(c => c.id === selectedCategory)?.nameBn}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCategoryChange('all')}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}