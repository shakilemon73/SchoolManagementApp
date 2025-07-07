import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Clock, Users, BookOpen, GraduationCap, Settings, Eye, Download, Share2, Plus, Edit, Trash2, Copy, Filter, Search, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
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
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';

// Form schemas following UX best practices
const classRoutineSchema = z.object({
  className: z.string().min(1, "ক্লাস নাম প্রয়োজন"),
  section: z.string().min(1, "সেকশন প্রয়োজন"),
  academicYear: z.string().min(1, "শিক্ষাবর্ষ প্রয়োজন"),
  instituteName: z.string().min(1, "প্রতিষ্ঠানের নাম প্রয়োজন"),
  classTeacher: z.string().min(1, "শ্রেণি শিক্ষকের নাম প্রয়োজন"),
  effectiveDate: z.string().min(1, "কার্যকর তারিখ প্রয়োজন"),
});

type ClassRoutineFormData = z.infer<typeof classRoutineSchema>;

export default function ClassRoutinesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management following Don Norman's principles
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Form management with proper error handling
  const form = useForm<ClassRoutineFormData>({
    resolver: zodResolver(classRoutineSchema),
    defaultValues: {
      className: "",
      section: "",
      academicYear: new Date().getFullYear().toString(),
      instituteName: "",
      classTeacher: "",
      effectiveDate: new Date().toISOString().split('T')[0],
    },
  });

  // API queries with proper error handling - connected to authentic database
  const { data: routines, isLoading, error } = useQuery({
    queryKey: ['/api/class-routines'],
    queryFn: async () => {
      const response = await fetch('/api/class-routines');
      if (!response.ok) throw new Error('Failed to fetch routines');
      return response.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/class-routines/stats'],
    queryFn: async () => {
      const response = await fetch('/api/class-routines/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  // Mutations for CRUD operations with authentic database connection
  const createRoutineMutation = useMutation({
    mutationFn: async (data: ClassRoutineFormData) => {
      const response = await fetch('/api/class-routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routine: data }),
      });
      if (!response.ok) throw new Error('Failed to create routine');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/class-routines'] });
      queryClient.invalidateQueries({ queryKey: ['/api/class-routines/stats'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "ক্লাস রুটিন তৈরি হয়েছে",
        description: "নতুন ক্লাস রুটিন সফলভাবে তৈরি করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ক্লাস রুটিন তৈরি করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Filtered data based on search and filter
  const filteredRoutines = routines?.filter((routine: any) => {
    const matchesSearch = routine.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         routine.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         routine.classTeacher?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || routine.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  // Dashboard component following Dieter Rams' principles
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট রুটিন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সক্রিয় রুটিন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.active || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-900">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">খসড়া রুটিন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.draft || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full dark:bg-yellow-900">
                <Edit className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">শিক্ষক</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.teachers || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            দ্রুত কার্যক্রম
          </CardTitle>
          <CardDescription>
            সাধারণ কাজগুলি দ্রুত সম্পন্ন করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="h-20 flex flex-col gap-2"
            >
              <Plus className="h-6 w-6" />
              নতুন রুটিন তৈরি করুন
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              রুটিন ডাউনলোড করুন
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Share2 className="h-6 w-6" />
              রুটিন শেয়ার করুন
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Routines */}
      <Card>
        <CardHeader>
          <CardTitle>সাম্প্রতিক রুটিন</CardTitle>
          <CardDescription>
            সম্প্রতি তৈরি করা ক্লাস রুটিনগুলি
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">লোড হচ্ছে...</span>
            </div>
          ) : filteredRoutines.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">কোনো ক্লাস রুটিন পাওয়া যায়নি</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                className="mt-4"
              >
                প্রথম রুটিন তৈরি করুন
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoutines.slice(0, 5).map((routine: any) => (
                <div key={routine.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">{routine.className} - {routine.section}</h3>
                      <p className="text-sm text-gray-500">{routine.classTeacher}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={routine.status === 'active' ? 'default' : 'secondary'}>
                      {routine.status === 'active' ? 'সক্রিয়' : 'খসড়া'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          দেখুন
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          সম্পাদনা করুন
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          কপি করুন
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          মুছে ফেলুন
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Table View Component following accessibility guidelines
  const TableView = () => (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ক্লাস, সেকশন বা শিক্ষক খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব</SelectItem>
              <SelectItem value="active">সক্রিয়</SelectItem>
              <SelectItem value="draft">খসড়া</SelectItem>
              <SelectItem value="archived">সংরক্ষিত</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            ফিল্টার
          </Button>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            নতুন রুটিন
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ক্লাস</TableHead>
              <TableHead>সেকশন</TableHead>
              <TableHead>শিক্ষক</TableHead>
              <TableHead>শিক্ষাবর্ষ</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>তৈরির তারিখ</TableHead>
              <TableHead className="text-right">কার্যক্রম</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>লোড হচ্ছে...</p>
                </TableCell>
              </TableRow>
            ) : filteredRoutines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">কোনো ক্লাস রুটিন পাওয়া যায়নি</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    প্রথম রুটিন তৈরি করুন
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredRoutines.map((routine: any) => (
                <TableRow key={routine.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium">{routine.className}</TableCell>
                  <TableCell>{routine.section}</TableCell>
                  <TableCell>{routine.classTeacher}</TableCell>
                  <TableCell>{routine.academicYear}</TableCell>
                  <TableCell>
                    <Badge variant={routine.status === 'active' ? 'default' : 'secondary'}>
                      {routine.status === 'active' ? 'সক্রিয়' : 'খসড়া'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(routine.createdAt).toLocaleDateString('bn-BD')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          দেখুন
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          সম্পাদনা করুন
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          ডাউনলোড করুন
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          কপি করুন
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          মুছে ফেলুন
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  // Create Form Component following Jakob Nielsen's usability heuristics
  const CreateRoutineForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createRoutineMutation.mutate(data))} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">মৌলিক তথ্য</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ক্লাস নাম *</FormLabel>
                  <FormControl>
                    <Input placeholder="যেমন: ষষ্ঠ শ্রেণি" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>সেকশন *</FormLabel>
                  <FormControl>
                    <Input placeholder="যেমন: ক" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>শিক্ষাবর্ষ *</FormLabel>
                  <FormControl>
                    <Input placeholder="যেমন: ২০২৫" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instituteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>প্রতিষ্ঠানের নাম *</FormLabel>
                  <FormControl>
                    <Input placeholder="যেমন: ঢাকা আদর্শ উচ্চ বিদ্যালয়" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classTeacher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>শ্রেণি শিক্ষক *</FormLabel>
                  <FormControl>
                    <Input placeholder="যেমন: মোহাম্মদ আলী" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>কার্যকর তারিখ *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsCreateDialogOpen(false)}
          >
            বাতিল
          </Button>
          <Button 
            type="submit" 
            disabled={createRoutineMutation.isPending}
          >
            {createRoutineMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                তৈরি হচ্ছে...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                রুটিন তৈরি করুন
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  const renderFeatureList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {[
        { id: "6-day-week", name: "৬-দিনের সপ্তাহের জন্য ডিজাইন (বাংলাদেশে প্রচলিত)" },
        { id: "prayer-break", name: "নামাজের বিরতির সময় অন্তর্ভুক্ত করুন" },
        { id: "teacher-subject", name: "বিষয় ও শিক্ষকের নাম উভয়ই সমর্থন করে" },
        { id: "period-length", name: "কাস্টমাইজেবল পিরিয়ডের দৈর্ঘ্য (৩০-৬০ মিনিট)" },
        { id: "print-options", name: "ক্লাসরুম ও ব্যক্তিগত শিক্ষার্থীদের জন্য প্রিন্ট অপশন" },
        { id: "color-coding", name: "বিষয়ের ক্যাটাগরি অনুযায়ী রঙের কোডিং" },
        { id: "bengali-calendar", name: "গ্রেগরিয়ান ক্যালেন্ডারের পাশাপাশি বাংলা মাস/ক্যালেন্ডার সমর্থন" },
        { id: "bilingual", name: "বাংলা ও ইংরেজি উভয় ভাষায় প্রদর্শনের অপশন" }
      ].map((feature) => (
        <div key={feature.id} className="flex items-start gap-2 p-4 border rounded-lg">
          <div className="min-w-4 pt-1">
            <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="text-sm text-gray-700">{feature.name}</p>
        </div>
      ))}
    </div>
  );

  // Main render function with enhanced UX/UI design
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              ক্লাস রুটিন ব্যবস্থাপনা
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              আধুনিক ও ব্যবহারকারী-বান্ধব ক্লাস রুটিন তৈরি ও পরিচালনা করুন
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/class-routines'] })}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              নতুন রুটিন
            </Button>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>ত্রুটি</AlertTitle>
            <AlertDescription>
              ডেটা লোড করতে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              ড্যাশবোর্ড
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              রুটিন পরিচালনা
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              বৈশিষ্ট্যসমূহ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardView />
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <TableView />
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  উন্নত বৈশিষ্ট্যসমূহ
                </CardTitle>
                <CardDescription>
                  বাংলাদেশি শিক্ষা প্রতিষ্ঠানের জন্য বিশেষভাবে ডিজাইন করা বৈশিষ্ট্যসমূহ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderFeatureList()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                নতুন ক্লাস রুটিন তৈরি করুন
              </DialogTitle>
              <DialogDescription>
                আপনার ক্লাসের জন্য একটি নতুন রুটিন তৈরি করুন। সমস্ত প্রয়োজনীয় তথ্য পূরণ করুন।
              </DialogDescription>
            </DialogHeader>
            <CreateRoutineForm />
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}