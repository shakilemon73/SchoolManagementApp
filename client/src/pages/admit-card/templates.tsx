import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TemplatesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/admit-cards/templates'],
    queryFn: async () => {
      const response = await fetch('/api/admit-cards/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Filter templates based on active tab
  const filteredTemplates = templates?.filter((template: any) => {
    if (activeTab === 'hsc') return template.category === 'hsc';
    if (activeTab === 'default') return template.category === 'default';
    if (activeTab === 'custom') return template.category === 'custom';
    return true;
  }) || [];

  const handleUseTemplate = (templateId: string, category?: string) => {
    if (category === 'hsc') {
      window.location.href = `/admit-card/hsc-generator?template=${templateId}`;
    } else {
      window.location.href = `/admit-card/create-single?template=${templateId}`;
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-700">হোম</Link>
            <span>/</span>
            <Link href="/documents/admit-cards" className="hover:text-gray-700">এডমিট কার্ড</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">টেমপ্লেট পরিচালনা</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">টেমপ্লেট পরিচালনা</h1>
              <p className="text-gray-600 mt-1">এডমিট কার্ডের টেমপ্লেট দেখুন ও পরিচালনা করুন</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/admit-card/create-template">
                <Button className="flex items-center gap-2">
                  <span className="material-icons text-sm">add</span>
                  নতুন টেমপ্লেট তৈরি করুন
                </Button>
              </Link>
              
              <Link href="/admit-card/bangla-generator">
                <Button variant="outline" className="flex items-center gap-2">
                  <span className="material-icons text-sm">translate</span>
                  বাংলা প্রবেশপত্র জেনারেটর
                </Button>
              </Link>
              
              <Link href="/documents/admit-cards">
                <Button variant="outline" className="flex items-center gap-2">
                  <span className="material-icons text-sm">arrow_back</span>
                  ড্যাশবোর্ডে ফিরুন
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <span className="material-icons text-blue-600 text-2xl mr-3">dashboard_customize</span>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {templates?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">মোট টেমপ্লেট</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <span className="material-icons text-indigo-600 text-2xl mr-3">school</span>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {templates?.filter((t: any) => t.category === 'hsc').length || 0}
                  </div>
                  <div className="text-sm text-gray-500">HSC টেমপ্লেট</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <span className="material-icons text-green-600 text-2xl mr-3">verified</span>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {templates?.filter((t: any) => t.category === 'default').length || 0}
                  </div>
                  <div className="text-sm text-gray-500">ডিফল্ট টেমপ্লেট</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <span className="material-icons text-purple-600 text-2xl mr-3">edit</span>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {templates?.filter((t: any) => t.category === 'custom').length || 0}
                  </div>
                  <div className="text-sm text-gray-500">কাস্টম টেমপ্লেট</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle>উপলব্ধ টেমপ্লেট</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  সব টেমপ্লেট ({templates?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="hsc">
                  HSC টেমপ্লেট ({templates?.filter((t: any) => t.category === 'hsc').length || 0})
                </TabsTrigger>
                <TabsTrigger value="default">
                  ডিফল্ট ({templates?.filter((t: any) => t.category === 'default').length || 0})
                </TabsTrigger>
                <TabsTrigger value="custom">
                  কাস্টম ({templates?.filter((t: any) => t.category === 'custom').length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template: any) => (
                      <Card key={template.id} className="group hover:shadow-lg transition-shadow">
                        <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center overflow-hidden rounded-t-lg">
                          {template.previewUrl ? (
                            <img 
                              src={template.previewUrl} 
                              alt={`${template.nameBn || template.name} প্রিভিউ`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <span className="material-icons text-6xl text-gray-300 mb-2">description</span>
                              <p className="text-sm text-gray-400">প্রিভিউ নেই</p>
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {template.nameBn || template.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <Badge 
                                variant={template.category === 'hsc' ? 'default' : template.category === 'default' ? 'secondary' : 'outline'}
                                className={`text-xs ${
                                  template.category === 'hsc' ? 'bg-indigo-100 text-indigo-800' :
                                  template.category === 'default' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {template.category === 'hsc' ? 'HSC' : 
                                 template.category === 'default' ? 'ডিফল্ট' : 'কাস্টম'}
                              </Badge>
                              {template.isActive && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  সক্রিয়
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4">
                            {template.category === 'hsc' ? 'HSC পরীক্ষার প্রবেশপত্র টেমপ্লেট' : 
                             template.description || 'এডমিট কার্ড টেমপ্লেট'}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleUseTemplate(template.id.toString(), template.category)}
                            >
                              <span className="material-icons text-sm mr-1">play_arrow</span>
                              ব্যবহার করুন
                            </Button>
                            
                            <Button variant="outline" size="sm">
                              <span className="material-icons text-sm">visibility</span>
                            </Button>
                            
                            <Button variant="outline" size="sm">
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="material-icons text-6xl text-gray-300 mb-4">dashboard_customize</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">কোন টেমপ্লেট পাওয়া যায়নি</h3>
                    <p className="text-gray-500 mb-6">
                      {activeTab === 'all' 
                        ? 'এখনো কোন টেমপ্লেট তৈরি করা হয়নি' 
                        : `কোন ${activeTab === 'default' ? 'ডিফল্ট' : 'কাস্টম'} টেমপ্লেট পাওয়া যায়নি`
                      }
                    </p>
                    <Link href="/admit-card/templates/create">
                      <Button>
                        <span className="material-icons mr-2">add</span>
                        নতুন টেমপ্লেট তৈরি করুন
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}