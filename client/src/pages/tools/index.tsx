import { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ResponsivePageLayout } from '@/components/layout/responsive-page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Search, 
  Wrench, 
  Plus, 
  Calculator,
  FileText,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Download,
  Upload,
  Printer,
  Mail,
  Phone,
  MessageSquare,
  Video,
  Camera,
  Mic,
  Globe,
  Database,
  Shield,
  Clock,
  CheckCircle,
  Zap,
  TrendingUp,
  Sparkles,
  Star,
  Activity,
  Eye,
  Filter,
  Grid3X3,
  List,
  ArrowUpRight,
  CreditCard,
  ExternalLink,
  Play,
  Pause,
  Bell
} from 'lucide-react';

// Enhanced schemas following world-class UX principles
const toolSchema = z.object({
  name: z.string().min(1, 'টুলের নাম প্রয়োজন'),
  nameBn: z.string().min(1, 'বাংলা নাম প্রয়োজন'),
  category: z.string().min(1, 'বিভাগ নির্বাচন করুন'),
  description: z.string().min(1, 'বিবরণ প্রয়োজন'),
  descriptionBn: z.string().min(1, 'বাংলা বিবরণ প্রয়োজন'),
  icon: z.string().min(1, 'আইকন নির্বাচন করুন'),
  url: z.string().url('সঠিক URL প্রয়োজন'),
  isActive: z.boolean().default(true),
  isInternal: z.boolean().default(true),
  permissions: z.array(z.string()).optional(),
});

type ToolFormData = z.infer<typeof toolSchema>;

interface Tool {
  id: number;
  name: string;
  nameBn: string;
  category: string;
  description: string;
  descriptionBn: string;
  icon: string;
  isActive: boolean;
  isInternal: boolean;
  usageCount: number;
  lastUsed: string;
  performance: number;
  url?: string;
}

interface ToolStats {
  totalTools: number;
  activeTools: number;
  popularTools: number;
  averageUsageTime: number;
  totalUsage: number;
  weeklyGrowth: number;
}

export default function ToolsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddToolOpen, setIsAddToolOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enhanced form handling following Luke Wroblewski's principles
  const toolForm = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: '',
      nameBn: '',
      category: '',
      description: '',
      descriptionBn: '',
      icon: '',
      url: '',
      isActive: true,
      isInternal: true,
      permissions: [],
    },
  });

  // Mock tools data for demonstration - following Don Norman's visibility principle
  const tools: Tool[] = [
    {
      id: 1,
      name: 'Video Conference',
      nameBn: 'ভিডিও কনফারেন্স',
      category: 'communication',
      description: 'Host virtual meetings and classes',
      descriptionBn: 'ভার্চুয়াল মিটিং এবং ক্লাস পরিচালনা করুন',
      icon: 'Video',
      isActive: true,
      isInternal: true,
      usageCount: 156,
      lastUsed: '২ ঘন্টা আগে',
      performance: 98,
      url: '/video-conferencing'
    },
    {
      id: 2,
      name: 'Payment Gateway',
      nameBn: 'পেমেন্ট গেটওয়ে',
      category: 'finance',
      description: 'Process payments securely',
      descriptionBn: 'নিরাপদে পেমেন্ট প্রক্রিয়া করুন',
      icon: 'CreditCard',
      isActive: true,
      isInternal: true,
      usageCount: 89,
      lastUsed: '১ দিন আগে',
      performance: 95,
      url: '/financial'
    },
    {
      id: 3,
      name: 'Document Generator',
      nameBn: 'ডকুমেন্ট জেনারেটর',
      category: 'documents',
      description: 'Generate official documents',
      descriptionBn: 'অফিসিয়াল ডকুমেন্ট তৈরি করুন',
      icon: 'FileText',
      isActive: true,
      isInternal: true,
      usageCount: 234,
      lastUsed: '৩০ মিনিট আগে',
      performance: 99,
      url: '/documents'
    },
    {
      id: 4,
      name: 'Live Notifications',
      nameBn: 'লাইভ নোটিফিকেশন',
      category: 'communication',
      description: 'Real-time notification system',
      descriptionBn: 'রিয়েল-টাইম নোটিফিকেশন সিস্টেম',
      icon: 'Bell',
      isActive: true,
      isInternal: true,
      usageCount: 345,
      lastUsed: '১৫ মিনিট আগে',
      performance: 97,
      url: '/notifications/live'
    },
    {
      id: 5,
      name: 'Analytics Dashboard',
      nameBn: 'অ্যানালিটিক্স ড্যাশবোর্ড',
      category: 'analytics',
      description: 'Comprehensive data analytics',
      descriptionBn: 'ব্যাপক ডেটা বিশ্লেষণ',
      icon: 'BarChart3',
      isActive: true,
      isInternal: true,
      usageCount: 178,
      lastUsed: '১ ঘন্টা আগে',
      performance: 94,
      url: '/analytics'
    }
  ];

  // Mock stats data following Dieter Rams' "less is more" principle
  const toolStats: ToolStats = {
    totalTools: 12,
    activeTools: 11,
    popularTools: 5,
    averageUsageTime: 25,
    totalUsage: 1250,
    weeklyGrowth: 12.5,
  };

  // Filter tools based on search and category - Steve Krug's "don't make me think"
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.nameBn.includes(searchQuery) ||
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchQuery, categoryFilter]);

  // Get icon component mapping
  const iconComponents: Record<string, any> = {
    Video, CreditCard, FileText, Bell: MessageSquare, BarChart3, Calculator, Calendar, Users, Settings,
    Download, Upload, Printer, Mail, Phone, Camera, Mic, Globe, Database, Shield
  };

  // Tool categories with Bengali translation
  const categories = [
    { value: 'all', label: 'সকল বিভাগ' },
    { value: 'communication', label: 'যোগাযোগ' },
    { value: 'finance', label: 'অর্থ' },
    { value: 'documents', label: 'ডকুমেন্ট' },
    { value: 'analytics', label: 'বিশ্লেষণ' },
    { value: 'management', label: 'ব্যবস্থাপনা' },
  ];

  // Enhanced mutations following Aarron Walter's hierarchy of user needs
  const addToolMutation = useMutation({
    mutationFn: async (data: ToolFormData) => {
      return apiRequest('/api/tools', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      setIsAddToolOpen(false);
      toolForm.reset();
      toast({
        title: "টুল যোগ করা হয়েছে",
        description: "নতুন টুল সফলভাবে যোগ করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "টুল যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const toggleToolMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest(`/api/tools/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      toast({
        title: "টুল আপডেট হয়েছে",
        description: "টুলের স্ট্যাটাস পরিবর্তন করা হয়েছে",
      });
    },
  });

  // Enhanced tool card component following Julie Zhuo's user-centered design
  const ToolCard = ({ tool }: { tool: Tool }) => {
    const IconComponent = iconComponents[tool.icon] || Wrench;
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {tool.nameBn}
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {tool.descriptionBn}
                </p>
              </div>
            </div>
            <Badge 
              variant={tool.isActive ? "default" : "secondary"}
              className="text-xs"
            >
              {tool.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-3">
            <span>ব্যবহার: {tool.usageCount}</span>
            <span>শেষ: {tool.lastUsed}</span>
          </div>
          
          {/* Performance indicator */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">পারফরমেন্স</span>
              <span className="font-medium text-gray-900 dark:text-white">{tool.performance}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${tool.performance}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 h-8 text-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => tool.url && (window.location.href = tool.url)}
            >
              <Play className="h-3 w-3 mr-1" />
              চালু করুন
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 px-3"
              onClick={() => setSelectedTool(tool)}
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Enhanced list view component
  const ToolListItem = ({ tool }: { tool: Tool }) => {
    const IconComponent = iconComponents[tool.icon] || Wrench;
    
    return (
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{tool.nameBn}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{tool.descriptionBn}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>ব্যবহার: {tool.usageCount}</span>
              <span>শেষ: {tool.lastUsed}</span>
              <span>পারফরমেন্স: {tool.performance}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={tool.isActive ? "default" : "secondary"}>
            {tool.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
          </Badge>
          <Button size="sm" onClick={() => tool.url && (window.location.href = tool.url)}>
            <Play className="h-4 w-4 mr-1" />
            চালু করুন
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <ResponsivePageLayout
        title="টুল ম্যানেজার"
        description="স্কুল পরিচালনার জন্য প্রয়োজনীয় সকল টুল এক জায়গায়"
      >
        <Tabs defaultValue="tools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">টুল ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="video-conference">ভিডিও কনফারেন্স</TabsTrigger>
            <TabsTrigger value="live-notifications">লাইভ নোটিফিকেশন</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-6">
          {/* Enhanced stats overview following Susan Weinschenk's psychology principles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-blue-600" />
                  মোট টুল
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {toolStats.totalTools}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  +{toolStats.weeklyGrowth}% এই সপ্তাহে
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  সক্রিয় টুল
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {toolStats.activeTools}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {((toolStats.activeTools / toolStats.totalTools) * 100).toFixed(1)}% আপটাইম
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  জনপ্রিয় টুল
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {toolStats.popularTools}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  এই সপ্তাহে
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  গড় ব্যবহারের সময়
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {toolStats.averageUsageTime}মি
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  প্রতি সেশনে
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced search and filters following Alan Cooper's goal-directed design */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="টুল খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48 border-gray-200 dark:border-gray-700">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                      className="h-8 px-3"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('list')}
                      className="h-8 px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Dialog open={isAddToolOpen} onOpenChange={setIsAddToolOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        নতুন টুল
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>নতুন টুল যোগ করুন</DialogTitle>
                        <DialogDescription>
                          আপনার স্কুলের জন্য নতুন টুল যোগ করুন
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...toolForm}>
                        <form onSubmit={toolForm.handleSubmit((data) => addToolMutation.mutate(data))} className="space-y-4">
                          <FormField
                            control={toolForm.control}
                            name="nameBn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>টুলের নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <Input placeholder="যেমন: ভিডিও কনফারেন্স" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={toolForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>টুলের নাম (English)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Video Conference" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={toolForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>বিভাগ</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.slice(1).map((category) => (
                                      <SelectItem key={category.value} value={category.value}>
                                        {category.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={toolForm.control}
                            name="url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end gap-3 pt-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsAddToolOpen(false)}
                            >
                              বাতিল
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={addToolMutation.isPending}
                              className="bg-gradient-to-r from-blue-500 to-purple-600"
                            >
                              {addToolMutation.isPending ? 'যোগ করা হচ্ছে...' : 'যোগ করুন'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced tools display following Farai Madzima's progressive disclosure */}
          <div className="space-y-6">
            {filteredTools.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    কোনো টুল পাওয়া যায়নি
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    আপনার অনুসন্ধানের সাথে মিলে এমন কোনো টুল নেই
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}>
                    সব টুল দেখুন
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTools.map((tool) => (
                      <ToolListItem key={tool.id} tool={tool} />
                    ))}
                  </div>
                )}
                
                {/* Results summary */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
                  {filteredTools.length} টি টুল পাওয়া গেছে
                  {searchQuery && ` "${searchQuery}" এর জন্য`}
                  {categoryFilter !== 'all' && ` ${categories.find(c => c.value === categoryFilter)?.label} বিভাগে`}
                </div>
              </>
            )}
          </div>
        </TabsContent>

          <TabsContent value="video-conference" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-500" />
                  ভিডিও কনফারেন্সিং সিস্টেম
                </CardTitle>
                <CardDescription>
                  অনলাইন ক্লাস এবং মিটিং পরিচালনার জন্য সমন্বিত প্ল্যাটফর্ম
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Video Conference Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Video className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">সক্রিয় মিটিং</p>
                          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">৩</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">অংশগ্রহণকারী</p>
                          <p className="text-xl font-bold text-green-900 dark:text-green-100">১৫৬</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400">মোট সময়</p>
                          <p className="text-xl font-bold text-purple-900 dark:text-purple-100">৩৯ঘ</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    size="lg" 
                    className="h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => window.location.href = '/video-conferencing'}
                  >
                    <Video className="h-5 w-5 mr-2" />
                    নতুন মিটিং শুরু করুন
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-16"
                    onClick={() => window.location.href = '/video-conferencing'}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    মিটিং সময়সূচী দেখুন
                  </Button>
                </div>

                {/* Recent Meetings */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সাম্প্রতিক মিটিং</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((meeting) => (
                      <div key={meeting} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">গণিত ক্লাস - দশম শ্রেণী</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">২৪ জন অংশগ্রহণকারী • ১ ঘন্টা আগে</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">বিস্তারিত</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="live-notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-green-500" />
                  লাইভ নোটিফিকেশন সিস্টেম
                </CardTitle>
                <CardDescription>
                  রিয়েল-টাইম আপডেট এবং গুরুত্বপূর্ণ বিজ্ঞপ্তি পরিচালনা
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Notification Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Bell className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">মোট</p>
                          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">১২</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">লাইভ</p>
                          <p className="text-xl font-bold text-green-900 dark:text-green-100">৪</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <ExternalLink className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-orange-600 dark:text-orange-400">জরুরি</p>
                          <p className="text-xl font-bold text-orange-900 dark:text-orange-100">২</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Eye className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400">অপঠিত</p>
                          <p className="text-xl font-bold text-purple-900 dark:text-purple-100">৭</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Button 
                    size="lg" 
                    className="h-16 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    onClick={() => window.location.href = '/notifications/live'}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    নতুন নোটিফিকেশন পাঠান
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-16"
                    onClick={() => window.location.href = '/notifications/live'}
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    সব নোটিফিকেশন দেখুন
                  </Button>
                </div>

                {/* Recent Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সাম্প্রতিক নোটিফিকেশন</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((notification) => (
                      <div key={notification} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">নতুন বই সংযোজিত হয়েছে</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">গ্রন্থাগার • ১৫ মিনিট আগে</p>
                          </div>
                        </div>
                        <Badge variant="secondary">মাঝারি</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ResponsivePageLayout>
    </AppShell>
  );
}