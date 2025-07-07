import { useState } from 'react';
import { bangladeshIDTemplates, BangladeshIDTemplate } from './bangladesh-id-templates';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface BangladeshTemplateProps {
  onSelect: (template: BangladeshIDTemplate) => void;
  selectedTemplateId?: string;
}

export default function BangladeshIDTemplateSelector({ 
  onSelect,
  selectedTemplateId 
}: BangladeshTemplateProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Filter templates based on search query and category
  const filteredTemplates = bangladeshIDTemplates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.nameInBangla.includes(searchQuery) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = 
      categoryFilter === 'all' || 
      template.tags.includes(categoryFilter);
      
    return matchesSearch && matchesCategory;
  });
  
  // Categories for filtering
  const categories = [
    { id: 'all', name: 'সব ধরণের', icon: 'apps' },
    { id: 'government', name: 'সরকারি', icon: 'account_balance' },
    { id: 'modern', name: 'আধুনিক', icon: 'palette' },
    { id: 'traditional', name: 'ঐতিহ্যবাহী', icon: 'history_edu' },
    { id: 'private', name: 'বেসরকারি', icon: 'business' },
    { id: 'islamic', name: 'ইসলামিক', icon: 'mosque' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Input
            className="pl-9 py-6"
            placeholder="টেমপ্লেট খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            search
          </span>
        </div>

        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={categoryFilter === category.id ? "default" : "outline"}
              className={`flex items-center gap-1 whitespace-nowrap px-3 py-2 ${
                categoryFilter === category.id ? 'bg-primary text-white' : ''
              }`}
              onClick={() => setCategoryFilter(category.id)}
            >
              <span className="material-icons text-lg">{category.icon}</span>
              <span>{category.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <Card 
              key={template.id}
              className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${
                selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelect(template)}
            >
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ 
                  backgroundColor: template.colors.background,
                  backgroundImage: 'url(/placeholder-card.png)',
                  borderBottom: `4px solid ${template.colors.primary}`
                }}
              >
                <div className="h-full flex items-center justify-center">
                  <div 
                    className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm"
                    style={{ color: template.colors.primary }}
                  >
                    <div className="text-lg font-bold">{template.nameInBangla}</div>
                    <div className="text-sm">{template.name}</div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-primary">
                    {template.nameInBangla}
                  </h3>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {template.layout === 'portrait' ? 'পোর্ট্রেট' : 'ল্যান্ডস্কেপ'}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
                
                <div className="flex gap-1 mt-2">
                  {template.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag} 
                      className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 justify-between">
                <div className="flex -space-x-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div 
                      key={i}
                      className="w-4 h-4 rounded-full border border-white" 
                      style={{ 
                        backgroundColor: i === 0 
                          ? template.colors.primary 
                          : i === 1 
                            ? template.colors.secondary 
                            : i === 2 
                              ? template.colors.accent 
                              : template.colors.text
                      }}
                    />
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <span className="material-icons text-sm">visibility</span>
                  <span>প্রিভিউ</span>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
            <span className="material-icons text-5xl text-gray-300 mb-4">search_off</span>
            <h3 className="text-xl font-medium text-gray-700">কোন টেমপ্লেট পাওয়া যায়নি</h3>
            <p className="text-gray-500 mt-2">
              দুঃখিত, আপনার অনুসন্ধানের সাথে মিলে এমন কোন টেমপ্লেট নেই।
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
            >
              সব ফিল্টার মুছুন
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}