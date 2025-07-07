import { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Custom API client for teacher portal with authentication
const teacherApiRequest = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('teacher-token');
  const sessionId = localStorage.getItem('teacher-session');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (sessionId) {
    headers['x-teacher-session'] = sessionId;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('teacher-auth');
      localStorage.removeItem('teacher-token');
      localStorage.removeItem('teacher-session');
      window.location.reload();
    }
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
};
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { UXProvider } from '@/components/ux-system';
import {
  BookOpen,
  Users,
  Calendar,
  ClipboardList,
  Plus,
  Edit,
  Save,
  Trash2,
  LogOut,
  Home,
  BarChart3,
  FileText,
  User,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Settings,
  Bell
} from 'lucide-react';

// Teacher Portal Query Client
const teacherQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

// Teacher Authentication Context
class TeacherAuthManager {
  private static instance: TeacherAuthManager;
  private teacher: any = null;
  private isAuthenticated = false;

  static getInstance() {
    if (!TeacherAuthManager.instance) {
      TeacherAuthManager.instance = new TeacherAuthManager();
    }
    return TeacherAuthManager.instance;
  }

  async login(teacherId: string, password: string) {
    try {
      // Demo authentication
      if (teacherId === 'demo' && password === '1234') {
        this.teacher = {
          id: 'demo',
          name: 'ডেমো শিক্ষক',
          email: 'demo@school.edu',
          subjects: ['গণিত', 'বিজ্ঞান'],
          classes: ['৮ম শ্রেণি', '৯ম শ্রেণি']
        };
        this.isAuthenticated = true;
        localStorage.setItem('teacher-auth', JSON.stringify(this.teacher));
        return this.teacher;
      }

      // Real API call for production
      const response = await fetch('/api/teacher/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherId, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.teacher) {
        this.teacher = data.teacher;
        this.isAuthenticated = true;
        localStorage.setItem('teacher-auth', JSON.stringify(this.teacher));
        localStorage.setItem('teacher-token', data.token);
        localStorage.setItem('teacher-session', data.sessionId);
        return this.teacher;
      }
      
      throw new Error(data.error || 'Invalid credentials');
    } catch (error) {
      throw new Error('লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  }

  logout() {
    this.teacher = null;
    this.isAuthenticated = false;
    localStorage.removeItem('teacher-auth');
  }

  getTeacher() {
    if (!this.teacher) {
      const stored = localStorage.getItem('teacher-auth');
      if (stored) {
        this.teacher = JSON.parse(stored);
        this.isAuthenticated = true;
      }
    }
    return this.teacher;
  }

  isLoggedIn() {
    return this.isAuthenticated || !!localStorage.getItem('teacher-auth');
  }
}

const teacherAuth = TeacherAuthManager.getInstance();

// Login Schema
const loginSchema = z.object({
  teacherId: z.string().min(1, 'শিক্ষক আইডি প্রয়োজন'),
  password: z.string().min(1, 'পাসওয়ার্ড প্রয়োজন'),
});

// Teacher Login Component
function TeacherLogin({ onLogin }: { onLogin: (teacher: any) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      teacherId: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { teacherId: string; password: string }) => {
      return teacherAuth.login(data.teacherId, data.password);
    },
    onSuccess: (teacher) => {
      toast({
        title: 'সফল লগইন',
        description: `স্বাগতম, ${teacher.name}`,
      });
      onLogin(teacher);
    },
    onError: (error: any) => {
      toast({
        title: 'লগইন ব্যর্থ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: { teacherId: string; password: string }) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            শিক্ষক পোর্টাল
          </h1>
          <p className="text-slate-600">
            আপনার অ্যাকাউন্টে লগইন করুন
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">
              শিক্ষক লগইন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-800">শিক্ষক আইডি</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            placeholder="T001 বা demo"
                            className="pl-10 h-12 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-800">পাসওয়ার্ড</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="পাসওয়ার্ড লিখুন"
                            className="pl-10 pr-10 h-12 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      লগইন হচ্ছে...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      লগইন করুন
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                ডেমো অ্যাকাউন্ট
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>আইডি:</strong> demo</div>
                <div><strong>পাসওয়ার্ড:</strong> 1234</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Teacher Navigation Component
function TeacherNavigation({ teacher, onLogout }: { teacher: any; onLogout: () => void }) {
  const [location, setLocation] = useLocation();

  const navItems = [
    { href: '/teacher-new', label: 'হোম', icon: Home },
    { href: '/teacher-new/dashboard', label: 'ড্যাশবোর্ড', icon: BarChart3 },
    { href: '/teacher-new/attendance', label: 'উপস্থিতি', icon: Users },
    { href: '/teacher-new/lessons', label: 'পাঠ পরিকল্পনা', icon: BookOpen },
    { href: '/teacher-new/assignments', label: 'অ্যাসাইনমেন্ট', icon: ClipboardList },
    { href: '/teacher-new/schedule', label: 'সময়সূচি', icon: Calendar },
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                শিক্ষক পোর্টাল
              </h1>
            </div>
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => setLocation(item.href)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-700 hidden sm:block">
              স্বাগতম, {teacher?.name || 'শিক্ষক'}
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              লগআউট
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Teacher Dashboard Component
function TeacherDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/teacher/stats'],
    queryFn: () => teacherApiRequest('/api/teacher/stats'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">ড্যাশবোর্ড</h1>
        <p className="text-slate-600 mt-2">আপনার শিক্ষকতার সামগ্রিক তথ্য</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ক্লাস</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClasses || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের ক্লাস</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todaysClasses || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অমীমাংসিত কাজ</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingAssignments || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক কার্যক্রম</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">৮ম শ্রেণির গণিত ক্লাস সম্পন্ন</p>
                  <p className="text-xs text-slate-500">২ ঘন্টা আগে</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">নতুন অ্যাসাইনমেন্ট তৈরি</p>
                  <p className="text-xs text-slate-500">৪ ঘন্টা আগে</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">উপস্থিতি আপডেট</p>
                  <p className="text-xs text-slate-500">৬ ঘন্টা আগে</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>আজকের সময়সূচি</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">৮ম শ্রেণি - গণিত</p>
                  <p className="text-xs text-slate-500">৯:০০ - ১০:০০ AM</p>
                </div>
                <Badge variant="outline">চলমান</Badge>
              </div>
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <Clock className="w-5 h-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">৯ম শ্রেণি - বিজ্ঞান</p>
                  <p className="text-xs text-slate-500">১১:০০ - ১২:০০ PM</p>
                </div>
                <Badge variant="secondary">আসছে</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Teacher Home Component
function TeacherHome() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          শিক্ষক পোর্টালে স্বাগতম
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          আপনার শিক্ষকতার সমস্ত কার্যক্রম পরিচালনা করুন একটি স্থান থেকে
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              ড্যাশবোর্ড
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">আপনার সামগ্রিক কার্যক্রমের পরিসংখ্যান দেখুন</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="w-6 h-6 text-green-600" />
              উপস্থিতি
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">শিক্ষার্থীদের উপস্থিতি নিন এবং পরিচালনা করুন</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-purple-600" />
              পাঠ পরিকল্পনা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">আপনার ক্লাসের পাঠ পরিকল্পনা তৈরি ও সংরক্ষণ করুন</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-orange-600" />
              অ্যাসাইনমেন্ট
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">শিক্ষার্থীদের জন্য অ্যাসাইনমেন্ট তৈরি ও মূল্যায়ন করুন</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-red-600" />
              সময়সূচি
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">আপনার ক্লাসের সময়সূচি দেখুন ও পরিচালনা করুন</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-gray-600" />
              সেটিংস
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">আপনার প্রোফাইল ও অ্যাকাউন্ট সেটিংস পরিবর্তন করুন</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Teacher Portal Component
function TeacherPortalContent() {
  const [teacher, setTeacher] = useState(null);
  
  useEffect(() => {
    const storedTeacher = teacherAuth.getTeacher();
    if (storedTeacher) {
      setTeacher(storedTeacher);
    }
  }, []);

  const handleLogin = (teacherData: any) => {
    setTeacher(teacherData);
  };

  const handleLogout = () => {
    teacherAuth.logout();
    setTeacher(null);
  };

  if (!teacher) {
    return <TeacherLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherNavigation teacher={teacher} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Switch>
          <Route path="/teacher-new" component={TeacherHome} />
          <Route path="/teacher-new/dashboard" component={TeacherDashboard} />
          <Route path="/teacher-new/attendance">
            <div className="text-center py-16">
              <Users className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">উপস্থিতি ব্যবস্থাপনা</h3>
              <p className="text-slate-500">শীঘ্রই আসছে...</p>
            </div>
          </Route>
          <Route path="/teacher-new/lessons">
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">পাঠ পরিকল্পনা</h3>
              <p className="text-slate-500">শীঘ্রই আসছে...</p>
            </div>
          </Route>
          <Route path="/teacher-new/assignments">
            <div className="text-center py-16">
              <ClipboardList className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">অ্যাসাইনমেন্ট ব্যবস্থাপনা</h3>
              <p className="text-slate-500">শীঘ্রই আসছে...</p>
            </div>
          </Route>
          <Route path="/teacher-new/schedule">
            <div className="text-center py-16">
              <Calendar className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">সময়সূচি</h3>
              <p className="text-slate-500">শীঘ্রই আসছে...</p>
            </div>
          </Route>
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

// Export Main Component
export default function TeacherPortalNew() {
  return (
    <QueryClientProvider client={teacherQueryClient}>
      <LanguageProvider>
        <UXProvider>
          <TeacherPortalContent />
        </UXProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}