import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ResponsivePageLayout } from '@/components/layout/responsive-page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Download,
  Upload,
  Settings,
  Star,
  StarOff,
  Calendar,
  User,
  Clock,
  BarChart3,
  Palette,
  Layout,
  Image,
  Type,
  Layers,
  Grid3X3,
  List,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  TrendingUp,
  Activity,
  Bookmark,
  Share2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface DocumentTemplate {
  id: string;
  name: string;
  nameBn: string;
  type: 'idCard' | 'admitCard' | 'classRoutine' | 'teacherRoutine' | 'resultSheet' | 'marksheet' | 'feeReceipt' | 'admissionForm' | 'testimonial' | 'certificate' | 'transcript';
  description: string;
  descriptionBn: string;
  category: string;
  categoryBn: string;
  isDefault: boolean;
  isActive: boolean;
  isFavorite: boolean;
  usageCount: number;
  lastUsed: string;
  createdAt: string;
  lastModified: string;
  thumbnailColor: string;
  settings: {
    showLogo: boolean;
    showSignature: boolean;
    showQR: boolean;
    colorScheme: string;
    layout: string;
    fontSize: string;
    orientation: 'portrait' | 'landscape';
  };
  createdBy: string;
  version: string;
  tags: string[];
}

interface TemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  popularTemplates: number;
  totalUsage: number;
  weeklyGrowth: number;
  favoriteCount: number;
}

export default function TemplatesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch templates from Supabase
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['/api/document-templates'],
    queryFn: () => fetch('/api/document-templates').then(res => res.json())
  });

  // Fallback templates data for demo (only used if API fails)
  const fallbackTemplates: DocumentTemplate[] = [
    {
      id: 'tpl-001',
      name: 'Standard ID Card',
      nameBn: 'স্ট্যান্ডার্ড আইডি কার্ড',
      type: 'idCard',
      description: 'Professional student ID card with photo and QR code',
      descriptionBn: 'ছবি এবং QR কোড সহ পেশাদার শিক্ষার্থী আইডি কার্ড',
      category: 'student_documents',
      categoryBn: 'ছাত্র ডকুমেন্ট',
      isDefault: true,
      isActive: true,
      isFavorite: true,
      usageCount: 345,
      lastUsed: '২ ঘন্টা আগে',
      createdAt: '2023-01-15',
      lastModified: '2023-11-20',
      thumbnailColor: '#3b82f6',
      settings: {
        showLogo: true,
        showSignature: false,
        showQR: true,
        colorScheme: 'blue',
        layout: 'standard',
        fontSize: 'medium',
        orientation: 'portrait'
      },
      createdBy: 'System Admin',
      version: '2.1',
      tags: ['id', 'student', 'photo', 'qr']
    },
    {
      id: 'tpl-002',
      name: 'Digital Admit Card',
      nameBn: 'ডিজিটাল এডমিট কার্ড',
      type: 'admitCard',
      description: 'Modern admit card with exam schedule and guidelines',
      descriptionBn: 'পরীক্ষার সময়সূচী এবং নির্দেশিকা সহ আধুনিক এডমিট কার্ড',
      category: 'exam_documents',
      categoryBn: 'পরীক্ষা ডকুমেন্ট',
      isDefault: true,
      isActive: true,
      isFavorite: false,
      usageCount: 210,
      lastUsed: '১ দিন আগে',
      createdAt: '2023-02-10',
      lastModified: '2023-10-15',
      thumbnailColor: '#8b5cf6',
      settings: {
        showLogo: true,
        showSignature: true,
        showQR: false,
        colorScheme: 'purple',
        layout: 'modern',
        fontSize: 'small',
        orientation: 'portrait'
      },
      createdBy: 'Exam Controller',
      version: '1.8',
      tags: ['admit', 'exam', 'schedule']
    },
    {
      id: 'tpl-003',
      name: 'Detailed Result Sheet',
      nameBn: 'বিস্তারিত ফলাফল শিট',
      type: 'resultSheet',
      description: 'Comprehensive result sheet with grades and analysis',
      descriptionBn: 'গ্রেড এবং বিশ্লেষণ সহ ব্যাপক ফলাফল শিট',
      category: 'academic_reports',
      categoryBn: 'একাডেমিক রিপোর্ট',
      isDefault: false,
      isActive: true,
      isFavorite: true,
      usageCount: 156,
      lastUsed: '৩ ঘন্টা আগে',
      createdAt: '2023-03-20',
      lastModified: '2023-12-01',
      thumbnailColor: '#10b981',
      settings: {
        showLogo: true,
        showSignature: true,
        showQR: false,
        colorScheme: 'green',
        layout: 'detailed',
        fontSize: 'small',
        orientation: 'landscape'
      },
      createdBy: 'Academic Head',
      version: '3.0',
      tags: ['result', 'grade', 'analysis', 'academic']
    },
    {
      id: 'tpl-004',
      name: 'Fee Receipt',
      nameBn: 'ফি রসিদ',
      type: 'feeReceipt',
      description: 'Standard fee payment receipt with payment details',
      descriptionBn: 'পেমেন্ট বিবরণ সহ স্ট্যান্ডার্ড ফি পেমেন্ট রসিদ',
      category: 'financial_documents',
      categoryBn: 'আর্থিক ডকুমেন্ট',
      isDefault: true,
      isActive: true,
      isFavorite: false,
      usageCount: 892,
      lastUsed: '৩০ মিনিট আগে',
      createdAt: '2023-01-10',
      lastModified: '2023-11-25',
      thumbnailColor: '#f59e0b',
      settings: {
        showLogo: true,
        showSignature: true,
        showQR: true,
        colorScheme: 'amber',
        layout: 'compact',
        fontSize: 'medium',
        orientation: 'portrait'
      },
      createdBy: 'Accounts Department',
      version: '2.5',
      tags: ['fee', 'receipt', 'payment', 'financial']
    },
    {
      id: 'tpl-005',
      name: 'Achievement Certificate',
      nameBn: 'অর্জন সনদপত্র',
      type: 'certificate',
      description: 'Elegant certificate template for achievements and awards',
      descriptionBn: 'অর্জন এবং পুরস্কারের জন্য মার্জিত সনদপত্র টেমপ্লেট',
      category: 'certificates',
      categoryBn: 'সনদপত্র',
      isDefault: false,
      isActive: true,
      isFavorite: true,
      usageCount: 78,
      lastUsed: '২ দিন আগে',
      createdAt: '2023-04-05',
      lastModified: '2023-10-30',
      thumbnailColor: '#ef4444',
      settings: {
        showLogo: true,
        showSignature: true,
        showQR: false,
        colorScheme: 'red',
        layout: 'elegant',
        fontSize: 'large',
        orientation: 'landscape'
      },
      createdBy: 'Principal',
      version: '1.2',
      tags: ['certificate', 'achievement', 'award', 'recognition']
    }
  ];

  // Use actual templates data if available, otherwise fallback
  const actualTemplates = templates.length > 0 ? templates : fallbackTemplates;

  // Calculate template stats
  const templateStats: TemplateStats = {
    totalTemplates: actualTemplates.length,
    activeTemplates: actualTemplates.filter((t: any) => t.isActive).length,
    popularTemplates: actualTemplates.filter((t: any) => (t.usageCount || 0) > 200).length,
    totalUsage: actualTemplates.reduce((sum: number, t: any) => sum + (t.usageCount || 0), 0),
    weeklyGrowth: 12.8,
    favoriteCount: actualTemplates.filter((t: any) => t.isFavorite).length
  };

  // Filter templates
  const filteredTemplates = actualTemplates.filter((template: any) => {
    if (activeTab === 'favorites' && !template.isFavorite) return false;
    if (activeTab === 'popular' && (template.usageCount || 0) < 200) return false;
    if (activeTab === 'recent' && template.updatedAt && new Date(template.updatedAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) return false;

    if (searchQuery && !template.nameBn?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !template.descriptionBn?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    if (categoryFilter !== 'all' && template.category !== categoryFilter) return false;
    if (typeFilter !== 'all' && template.type !== typeFilter) return false;

    return true;
  });

  // Template categories
  const categories = [
    { value: 'all', label: 'সকল বিভাগ' },
    { value: 'student_documents', label: 'ছাত্র ডকুমেন্ট' },
    { value: 'exam_documents', label: 'পরীক্ষা ডকুমেন্ট' },
    { value: 'academic_reports', label: 'একাডেমিক রিপোর্ট' },
    { value: 'financial_documents', label: 'আর্থিক ডকুমেন্ট' },
    { value: 'certificates', label: 'সনদপত্র' },
  ];

  // Document types
  const documentTypes = [
    { value: 'all', label: 'সকল ধরন' },
    { value: 'idCard', label: 'আইডি কার্ড' },
    { value: 'admitCard', label: 'এডমিট কার্ড' },
    { value: 'resultSheet', label: 'ফলাফল শিট' },
    { value: 'feeReceipt', label: 'ফি রসিদ' },
    { value: 'certificate', label: 'সনদপত্র' },
    { value: 'testimonial', label: 'প্রশংসাপত্র' },
  ];

  // Enhanced mutations
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      return apiRequest('/api/templates', {
        method: 'POST',
        body: JSON.stringify(templateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "টেমপ্লেট তৈরি হয়েছে",
        description: "নতুন টেমপ্লেট সফলভাবে তৈরি করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "টেমপ্লেট তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      return apiRequest(`/api/templates/${id}/favorite`, {
        method: 'PATCH',
        body: JSON.stringify({ isFavorite }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
  });

  // Get template type icon and color
  const getTemplateTypeStyle = (type: string) => {
    switch(type) {
      case 'idCard': return { icon: User, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' };
      case 'admitCard': return { icon: Calendar, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' };
      case 'resultSheet': return { icon: BarChart3, color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' };
      case 'feeReceipt': return { icon: FileText, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' };
      case 'certificate': return { icon: Sparkles, color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' };
      case 'testimonial': return { icon: Star, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' };
      default: return { icon: FileText, color: 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300' };
    }
  };

  // Template card component following Julie Zhuo's user-centered design
  const TemplateCard = ({ template }: { template: DocumentTemplate }) => {
    const typeStyle = getTemplateTypeStyle(template.type);
    const IconComponent = typeStyle.icon;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: template.thumbnailColor + '20', color: template.thumbnailColor }}
              >
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {template.nameBn}
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {template.descriptionBn}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {template.isDefault && (
                <Badge variant="outline" className="text-xs">
                  ডিফল্ট
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => toggleFavoriteMutation.mutate({ id: template.id, isFavorite: !template.isFavorite })}
              >
                {template.isFavorite ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>ব্যবহার: {template.usageCount}</span>
              <span>শেষ: {template.lastUsed}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <Badge className={typeStyle.color}>
                {documentTypes.find(dt => dt.value === template.type)?.label}
              </Badge>
              <span className="text-gray-500">v{template.version}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className="flex-1 h-8 text-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={() => setSelectedTemplate(template)}
              >
                <Eye className="h-3 w-3 mr-1" />
                প্রিভিউ
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-3"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-3"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Template list item component
  const TemplateListItem = ({ template }: { template: DocumentTemplate }) => {
    const typeStyle = getTemplateTypeStyle(template.type);
    const IconComponent = typeStyle.icon;

    return (
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: template.thumbnailColor + '20', color: template.thumbnailColor }}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{template.nameBn}</h3>
              {template.isDefault && (
                <Badge variant="outline" className="text-xs">ডিফল্ট</Badge>
              )}
              {template.isFavorite && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{template.descriptionBn}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>ব্যবহার: {template.usageCount}</span>
              <span>শেষ: {template.lastUsed}</span>
              <span>সংস্করণ: {template.version}</span>
              <Badge className={typeStyle.color}>
                {documentTypes.find(dt => dt.value === template.type)?.label}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setSelectedTemplate(template)}>
            <Eye className="h-4 w-4 mr-1" />
            প্রিভিউ
          </Button>
          <Button size="sm" variant="outline">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <ResponsivePageLayout
        title="ডকুমেন্ট টেমপ্লেট"
        description="পেশাদার ডকুমেন্ট তৈরির জন্য টেমপ্লেট পরিচালনা করুন"
      >
        <div className="space-y-6">
          {/* Enhanced stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">মোট টেমপ্লেট</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {templateStats.totalTemplates}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">সক্রিয় টেমপ্লেট</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {templateStats.activeTemplates}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">জনপ্রিয় টেমপ্লেট</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {templateStats.popularTemplates}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">মোট ব্যবহার</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {templateStats.totalUsage.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced controls */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-3xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="টেমপ্লেট খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="বিভাগ" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="ধরন" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                  
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    আপলোড
                  </Button>
                  
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        নতুন টেমপ্লেট
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>নতুন টেমপ্লেট তৈরি করুন</DialogTitle>
                        <DialogDescription>
                          আপনার স্কুলের জন্য নতুন ডকুমেন্ট টেমপ্লেট তৈরি করুন
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="template-name">টেমপ্লেটের নাম</Label>
                          <Input id="template-name" placeholder="যেমন: নতুন আইডি কার্ড" />
                        </div>
                        
                        <div>
                          <Label htmlFor="template-type">ডকুমেন্টের ধরন</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="ধরন নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                              {documentTypes.slice(1).map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="template-description">বিবরণ</Label>
                          <Textarea id="template-description" placeholder="টেমপ্লেটের বিবরণ লিখুন..." />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          বাতিল
                        </Button>
                        <Button 
                          className="bg-gradient-to-r from-blue-500 to-purple-600"
                          onClick={() => createTemplateMutation.mutate({})}
                          disabled={createTemplateMutation.isPending}
                        >
                          {createTemplateMutation.isPending ? 'তৈরি হচ্ছে...' : 'তৈরি করুন'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 lg:w-fit">
              <TabsTrigger value="all">সকল ({templateStats.totalTemplates})</TabsTrigger>
              <TabsTrigger value="favorites">প্রিয় ({templateStats.favoriteCount})</TabsTrigger>
              <TabsTrigger value="popular">জনপ্রিয় ({templateStats.popularTemplates})</TabsTrigger>
              <TabsTrigger value="recent">সাম্প্রতিক</TabsTrigger>
              <TabsTrigger value="custom">কাস্টম</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredTemplates.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      কোনো টেমপ্লেট পাওয়া যায়নি
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      আপনার অনুসন্ধানের সাথে মিলে এমন কোনো টেমপ্লেট নেই
                    </p>
                    <Button variant="outline" onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                      setTypeFilter('all');
                    }}>
                      সব টেমপ্লেট দেখুন
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredTemplates.map((template: any) => (
                        <TemplateCard key={template.id} template={template} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTemplates.map((template: any) => (
                        <TemplateListItem key={template.id} template={template} />
                      ))}
                    </div>
                  )}
                  
                  {/* Results summary */}
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
                    {filteredTemplates.length} টি টেমপ্লেট পাওয়া গেছে
                    {searchQuery && ` "${searchQuery}" এর জন্য`}
                    {categoryFilter !== 'all' && ` ${categories.find(c => c.value === categoryFilter)?.label} বিভাগে`}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Template preview dialog */}
          {selectedTemplate && (
            <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {selectedTemplate.nameBn}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTemplate.descriptionBn}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Preview area */}
                    <div className="lg:col-span-2">
                      <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">টেমপ্লেট প্রিভিউ</p>
                          <p className="text-sm text-gray-500 mt-1">{selectedTemplate.nameBn}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Template details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">টেমপ্লেট তথ্য</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">ধরন:</span>
                            <span>{documentTypes.find(dt => dt.value === selectedTemplate.type)?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ব্যবহার:</span>
                            <span>{selectedTemplate.usageCount} বার</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">সংস্করণ:</span>
                            <span>v{selectedTemplate.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">তৈরিকারী:</span>
                            <span>{selectedTemplate.createdBy}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-semibold mb-2">সেটিংস</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span>লোগো দেখান</span>
                            <Switch checked={selectedTemplate.settings.showLogo} disabled />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>সই দেখান</span>
                            <Switch checked={selectedTemplate.settings.showSignature} disabled />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>QR কোড</span>
                            <Switch checked={selectedTemplate.settings.showQR} disabled />
                          </div>
                          <div className="flex justify-between">
                            <span>রঙের স্কিম:</span>
                            <span className="capitalize">{selectedTemplate.settings.colorScheme}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Edit3 className="h-4 w-4 mr-1" />
                          সম্পাদনা
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-1" />
                          কপি
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          ডাউনলোড
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </ResponsivePageLayout>
    </AppShell>
  );
}