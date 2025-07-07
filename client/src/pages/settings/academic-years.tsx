import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ResponsivePageLayout } from '@/components/layout/responsive-page-layout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  CalendarDays,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Settings,
  Users,
  BookOpen,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  PieChart,
  Star,
  GraduationCap
} from 'lucide-react';

interface AcademicYear {
  id: string;
  name: string;
  nameBn: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  description: string;
  descriptionBn: string;
  totalStudents: number;
  totalClasses: number;
  totalTerms: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
}

interface AcademicTerm {
  id: string;
  name: string;
  nameBn: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string;
  descriptionBn: string;
  examScheduled: boolean;
  resultPublished: boolean;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface AcademicStats {
  totalYears: number;
  activeYears: number;
  completedYears: number;
  totalTerms: number;
  currentTerms: number;
  totalStudents: number;
}

// Enhanced schemas
const academicYearSchema = z.object({
  name: z.string().min(2, { message: "শিক্ষাবর্ষের নাম আবশ্যক" }),
  nameBn: z.string().min(2, { message: "বাংলা নাম আবশ্যক" }),
  startDate: z.string().min(1, { message: "শুরুর তারিখ আবশ্যক" }),
  endDate: z.string().min(1, { message: "শেষের তারিখ আবশ্যক" }),
  description: z.string().optional(),
  descriptionBn: z.string().optional(),
  isActive: z.boolean().default(false),
});

const academicTermSchema = z.object({
  name: z.string().min(2, { message: "টার্মের নাম আবশ্যক" }),
  nameBn: z.string().min(2, { message: "বাংলা নাম আবশ্যক" }),
  academicYearId: z.string().min(1, { message: "শিক্ষাবর্ষ নির্বাচন করুন" }),
  startDate: z.string().min(1, { message: "শুরুর তারিখ আবশ্যক" }),
  endDate: z.string().min(1, { message: "শেষের তারিখ আবশ্যক" }),
  description: z.string().optional(),
  descriptionBn: z.string().optional(),
});

export default function AcademicYearsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("years");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const [isTermDialogOpen, setIsTermDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Real database integration for academic years
  const { data: academicYears = [], isLoading: yearsLoading } = useQuery({
    queryKey: ['/api/academic-years'],
    enabled: true
  });

  // Real database integration for academic terms
  const { data: academicTerms = [], isLoading: termsLoading } = useQuery({
    queryKey: ['/api/enhanced-academic-terms'],
    enabled: true
  });

  // Real database integration for statistics
  const { data: academicStats } = useQuery({
    queryKey: ['/api/academic-years/stats'],
    enabled: true
  });



  // Calculate stats from real database data with fallback values
  const calculatedStats: AcademicStats = {
    totalYears: academicYears.length,
    activeYears: academicYears.filter((year: any) => year.isActive).length,
    completedYears: academicYears.filter((year: any) => year.status === 'completed').length,
    totalTerms: academicTerms.length,
    currentTerms: academicTerms.filter((term: any) => term.status === 'ongoing').length,
    totalStudents: academicStats?.totalStudents || 0
  };

  // Use database stats if available, otherwise use calculated stats
  const displayStats = academicStats || calculatedStats;

  // Form handlers
  const academicYearForm = useForm<z.infer<typeof academicYearSchema>>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: "",
      nameBn: "",
      startDate: "",
      endDate: "",
      description: "",
      descriptionBn: "",
      isActive: false,
    }
  });

  const academicTermForm = useForm<z.infer<typeof academicTermSchema>>({
    resolver: zodResolver(academicTermSchema),
    defaultValues: {
      name: "",
      nameBn: "",
      academicYearId: "",
      startDate: "",
      endDate: "",
      description: "",
      descriptionBn: "",
    }
  });

  // Enhanced mutations
  const createYearMutation = useMutation({
    mutationFn: async (data: z.infer<typeof academicYearSchema>) => {
      return apiRequest('/api/academic-years', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years'] });
      setIsYearDialogOpen(false);
      academicYearForm.reset();
      toast({
        title: "শিক্ষাবর্ষ তৈরি হয়েছে",
        description: "নতুন শিক্ষাবর্ষ সফলভাবে তৈরি করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "শিক্ষাবর্ষ তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const createTermMutation = useMutation({
    mutationFn: async (data: z.infer<typeof academicTermSchema>) => {
      return apiRequest('/api/enhanced-academic-terms', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-academic-terms'] });
      setIsTermDialogOpen(false);
      academicTermForm.reset();
      toast({
        title: "টার্ম তৈরি হয়েছে",
        description: "নতুন একাডেমিক টার্ম সফলভাবে তৈরি করা হয়েছে",
      });
    },
  });

  // Delete academic year mutation
  const deleteYearMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/academic-years/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years/stats'] });
      toast({
        title: "শিক্ষাবর্ষ মুছে ফেলা হয়েছে",
        description: "শিক্ষাবর্ষ সফলভাবে মুছে ফেলা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "শিক্ষাবর্ষ মুছে ফেলতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Update academic year mutation
  const updateYearMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/academic-years/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years/stats'] });
      toast({
        title: "শিক্ষাবর্ষ আপডেট হয়েছে",
        description: "শিক্ষাবর্ষ সফলভাবে আপডেট করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "শিক্ষাবর্ষ আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Toggle academic year status mutation
  const toggleYearStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/academic-years/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years/stats'] });
      toast({
        title: "স্ট্যাটাস আপডেট হয়েছে",
        description: "শিক্ষাবর্ষের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে",
      });
    },
  });

  // Set current academic year mutation
  const setCurrentYearMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/academic-years/${id}/set-current`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years/stats'] });
      toast({
        title: "বর্তমান শিক্ষাবর্ষ সেট করা হয়েছে",
        description: "নতুন বর্তমান শিক্ষাবর্ষ সফলভাবে সেট করা হয়েছে",
      });
    },
  });

  // Academic Terms CRUD operations
  const deleteTermMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/enhanced-academic-terms/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-academic-terms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years/stats'] });
      toast({
        title: "টার্ম মুছে ফেলা হয়েছে",
        description: "একাডেমিক টার্ম সফলভাবে মুছে ফেলা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "টার্ম মুছে ফেলতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const updateTermMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/enhanced-academic-terms/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-academic-terms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years/stats'] });
      toast({
        title: "টার্ম আপডেট হয়েছে",
        description: "একাডেমিক টার্ম সফলভাবে আপডেট করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "টার্ম আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const toggleTermStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/enhanced-academic-terms/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-academic-terms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-years/stats'] });
      toast({
        title: "টার্মের স্ট্যাটাস আপডেট হয়েছে",
        description: "একাডেমিক টার্মের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে",
      });
    },
  });

  // Action handlers
  const handleDeleteYear = (id: number) => {
    if (confirm("আপনি কি নিশ্চিত যে এই শিক্ষাবর্ষটি মুছে ফেলতে চান?")) {
      deleteYearMutation.mutate(id);
    }
  };

  const handleDeleteTerm = (id: number) => {
    if (confirm("আপনি কি নিশ্চিত যে এই টার্মটি মুছে ফেলতে চান?")) {
      deleteTermMutation.mutate(id);
    }
  };

  const handleToggleYearStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    toggleYearStatusMutation.mutate({ id, status: newStatus });
  };

  const handleSetCurrentYear = (id: number) => {
    setCurrentYearMutation.mutate(id);
  };

  const handleToggleTermStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ongoing' ? 'upcoming' : 'ongoing';
    toggleTermStatusMutation.mutate({ id, status: newStatus });
  };

  // Form handlers
  const handleYearSubmit = (data: z.infer<typeof academicYearSchema>) => {
    createYearMutation.mutate(data);
  };

  const handleTermSubmit = (data: z.infer<typeof academicTermSchema>) => {
    createTermMutation.mutate(data);
  };

  // Export functionality
  const handleExportYears = () => {
    const csvData = filteredYears.map(year => ({
      'শিক্ষাবর্ষ': year.nameBn,
      'ইংরেজি নাম': year.name,
      'শুরুর তারিখ': new Date(year.startDate).toLocaleDateString('bn-BD'),
      'শেষের তারিখ': new Date(year.endDate).toLocaleDateString('bn-BD'),
      'স্ট্যাটাস': getStatusLabel(year.status),
      'বর্তমান': year.isCurrent ? 'হ্যাঁ' : 'না',
      'শিক্ষার্থী': year.totalStudents || 0,
      'টার্ম': year.totalTerms || 0
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `academic-years-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "রপ্তানি সম্পন্ন",
      description: "শিক্ষাবর্ষের তথ্য সফলভাবে ডাউনলোড হয়েছে",
    });
  };

  const handleExportTerms = () => {
    const csvData = filteredTerms.map(term => {
      const academicYear = academicYears.find(y => y.id === term.academicYearId);
      return {
        'টার্মের নাম': term.nameBn,
        'ইংরেজি নাম': term.name,
        'শিক্ষাবর্ষ': academicYear?.nameBn || '',
        'শুরুর তারিখ': new Date(term.startDate).toLocaleDateString('bn-BD'),
        'শেষের তারিখ': new Date(term.endDate).toLocaleDateString('bn-BD'),
        'স্ট্যাটাস': getStatusLabel(term.status),
        'পরীক্ষা নির্ধারিত': term.examScheduled ? 'হ্যাঁ' : 'না',
        'ফলাফল প্রকাশিত': term.resultPublished ? 'হ্যাঁ' : 'না'
      };
    });

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `academic-terms-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "রপ্তানি সম্পন্ন",
      description: "একাডেমিক টার্মের তথ্য সফলভাবে ডাউনলোড হয়েছে",
    });
  };

  // Get status style
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'active': return { bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle };
      case 'completed': return { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Trophy };
      case 'draft': return { bg: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: Edit3 };
      case 'archived': return { bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: BookOpen };
      case 'ongoing': return { bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: Activity };
      case 'upcoming': return { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock };
      default: return { bg: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: Calendar };
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return 'সক্রিয়';
      case 'completed': return 'সম্পন্ন';
      case 'draft': return 'খসড়া';
      case 'archived': return 'সংরক্ষিত';
      case 'ongoing': return 'চলমান';
      case 'upcoming': return 'আসন্ন';
      default: return 'অজানা';
    }
  };

  // Filter data from real database
  const filteredYears = academicYears.filter((year: any) => {
    if (searchQuery && !year.name_bn?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all' && year.status !== statusFilter) return false;
    return true;
  });

  const filteredTerms = academicTerms.filter((term: any) => {
    if (searchQuery && !term.name_bn?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell>
      <ResponsivePageLayout
        title="শিক্ষাবর্ষ ব্যবস্থাপনা"
        description="শিক্ষাবর্ষ এবং একাডেমিক টার্ম পরিচালনা করুন"
      >
        <div className="space-y-6">
          {/* Enhanced stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">মোট শিক্ষাবর্ষ</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {displayStats.totalYears}
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
                    <p className="text-sm text-green-600 dark:text-green-400">সক্রিয় শিক্ষাবর্ষ</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {displayStats.activeYears}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">মোট টার্ম</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {displayStats.totalTerms}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">মোট শিক্ষার্থী</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {displayStats.totalStudents}
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
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="শিক্ষাবর্ষ খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="স্ট্যাটাস" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
                      <SelectItem value="active">সক্রিয়</SelectItem>
                      <SelectItem value="completed">সম্পন্ন</SelectItem>
                      <SelectItem value="draft">খসড়া</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    এক্সপোর্ট
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    সেটিংস
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <TabsList className="grid w-full lg:w-fit grid-cols-3">
                <TabsTrigger value="years">শিক্ষাবর্ষ</TabsTrigger>
                <TabsTrigger value="terms">একাডেমিক টার্ম</TabsTrigger>
                <TabsTrigger value="analytics">বিশ্লেষণ</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                {activeTab === 'years' && (
                  <Button 
                    variant="outline" 
                    onClick={handleExportYears}
                    disabled={filteredYears.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    ডাউনলোড
                  </Button>
                )}
                
                {activeTab === 'terms' && (
                  <Button 
                    variant="outline" 
                    onClick={handleExportTerms}
                    disabled={filteredTerms.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    ডাউনলোড
                  </Button>
                )}
                
                <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      নতুন শিক্ষাবর্ষ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>নতুন শিক্ষাবর্ষ তৈরি করুন</DialogTitle>
                      <DialogDescription>
                        নতুন একাডেমিক বছর সেটআপ করুন
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...academicYearForm}>
                      <form onSubmit={academicYearForm.handleSubmit((data) => createYearMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={academicYearForm.control}
                          name="nameBn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>শিক্ষাবর্ষের নাম (বাংলা)</FormLabel>
                              <FormControl>
                                <Input placeholder="যেমন: ২০২৫ শিক্ষাবর্ষ" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={academicYearForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>শিক্ষাবর্ষের নাম (English)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 2025 Academic Year" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={academicYearForm.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>শুরুর তারিখ</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={academicYearForm.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>শেষের তারিখ</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={academicYearForm.control}
                          name="descriptionBn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>বিবরণ</FormLabel>
                              <FormControl>
                                <Textarea placeholder="শিক্ষাবর্ষের বিবরণ..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end gap-3 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsYearDialogOpen(false)}>
                            বাতিল
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createYearMutation.isPending}
                            className="bg-gradient-to-r from-blue-500 to-purple-600"
                          >
                            {createYearMutation.isPending ? 'তৈরি হচ্ছে...' : 'তৈরি করুন'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isTermDialogOpen} onOpenChange={setIsTermDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      নতুন টার্ম
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>নতুন একাডেমিক টার্ম</DialogTitle>
                      <DialogDescription>
                        শিক্ষাবর্ষের জন্য নতুন টার্ম তৈরি করুন
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...academicTermForm}>
                      <form onSubmit={academicTermForm.handleSubmit((data) => createTermMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={academicTermForm.control}
                          name="academicYearId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>শিক্ষাবর্ষ</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="শিক্ষাবর্ষ নির্বাচন করুন" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {academicYears.map((year) => (
                                    <SelectItem key={year.id} value={year.id}>
                                      {year.nameBn}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={academicTermForm.control}
                          name="nameBn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>টার্মের নাম (বাংলা)</FormLabel>
                              <FormControl>
                                <Input placeholder="যেমন: প্রথম টার্ম" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={academicTermForm.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>শুরুর তারিখ</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={academicTermForm.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>শেষের তারিখ</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsTermDialogOpen(false)}>
                            বাতিল
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createTermMutation.isPending}
                          >
                            {createTermMutation.isPending ? 'তৈরি হচ্ছে...' : 'তৈরি করুন'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value="years" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>শিক্ষাবর্ষ</TableHead>
                        <TableHead>সময়কাল</TableHead>
                        <TableHead>শিক্ষার্থী</TableHead>
                        <TableHead>টার্ম</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredYears.map((year) => {
                        const statusStyle = getStatusStyle(year.status);
                        const StatusIcon = statusStyle.icon;
                        
                        return (
                          <TableRow key={year.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{year.nameBn}</div>
                                {year.isCurrent && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    বর্তমান
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{new Date(year.startDate).toLocaleDateString('bn-BD')}</div>
                                <div className="text-gray-500">থেকে {new Date(year.endDate).toLocaleDateString('bn-BD')}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span>{year.totalStudents}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-gray-500" />
                                <span>{year.totalTerms}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusStyle.bg}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {getStatusLabel(year.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleToggleYearStatus(year.id, year.status)}
                                  disabled={toggleYearStatusMutation.isPending}
                                  title="স্ট্যাটাস পরিবর্তন করুন"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleSetCurrentYear(year.id)}
                                  disabled={setCurrentYearMutation.isPending || year.isCurrent}
                                  title="বর্তমান শিক্ষাবর্ষ সেট করুন"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleDeleteYear(year.id)}
                                  disabled={deleteYearMutation.isPending}
                                  title="মুছে ফেলুন"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="terms" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTerms.map((term) => {
                  const statusStyle = getStatusStyle(term.status);
                  const StatusIcon = statusStyle.icon;
                  const academicYear = academicYears.find(y => y.id === term.academicYearId);
                  
                  return (
                    <Card key={term.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{term.nameBn}</CardTitle>
                            <CardDescription>{academicYear?.nameBn}</CardDescription>
                          </div>
                          <Badge className={statusStyle.bg}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(term.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">শুরু:</span>
                              <span>{new Date(term.startDate).toLocaleDateString('bn-BD')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">শেষ:</span>
                              <span>{new Date(term.endDate).toLocaleDateString('bn-BD')}</span>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>পরীক্ষা নির্ধারিত</span>
                              {term.examScheduled ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>ফলাফল প্রকাশিত</span>
                              {term.resultPublished ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex gap-2 w-full">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleToggleTermStatus(term.id, term.status)}
                            disabled={toggleTermStatusMutation.isPending}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            স্ট্যাটাস
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteTerm(term.id)}
                            disabled={deleteTermMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            মুছুন
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      শিক্ষাবর্ষ অনুযায়ী শিক্ষার্থী
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {academicYears.map((year) => (
                        <div key={year.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{year.nameBn}</span>
                            <span className="font-medium">{year.totalStudents} জন</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(year.totalStudents / 500) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      টার্ম অগ্রগতি
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">সম্পন্ন টার্ম</span>
                        <span className="font-semibold text-green-600">
                          {academicTerms.filter(t => t.status === 'completed').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">চলমান টার্ম</span>
                        <span className="font-semibold text-blue-600">
                          {academicTerms.filter(t => t.status === 'ongoing').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">আসন্ন টার্ম</span>
                        <span className="font-semibold text-orange-600">
                          {academicTerms.filter(t => t.status === 'upcoming').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsivePageLayout>
    </AppShell>
  );
}