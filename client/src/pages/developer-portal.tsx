import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  School, 
  Users, 
  CreditCard, 
  Settings, 
  FileText, 
  Key, 
  Activity,
  Shield,
  BarChart3,
  Globe,
  UserCog,
  Monitor,
  Database
} from 'lucide-react';
import UserManagement from '@/components/portal/user-management';
import AdvancedAnalytics from '@/components/portal/advanced-analytics';
import TemplateManagement from '@/components/portal/template-management';
import SystemMonitoring from '@/components/portal/system-monitoring';
import { LanguageText } from '@/components/ui/language-text';

interface SchoolInstance {
  id: number;
  schoolId: string;
  name: string;
  subdomain: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  planType: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'trial' | 'expired';
  maxStudents: number;
  maxTeachers: number;
  maxDocuments: number;
  usedDocuments: number;
  createdAt: string;
  apiKey: string;
}

interface SchoolCredits {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
}

interface DashboardStats {
  totalSchools: number;
  activeSchools: number;
  trialSchools: number;
  recentSchools: SchoolInstance[];
}

export default function DeveloperPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [newSchoolDialog, setNewSchoolDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolInstance | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      localStorage.setItem('portal_token', data.token);
      setIsLoggedIn(true);
      toast({ title: 'Login successful', description: `Welcome back, ${data.admin.fullName}` });
    },
    onError: (error: any) => {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    },
  });

  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery<DashboardStats>({
    queryKey: ['/api/portal/analytics/overview'],
    enabled: isLoggedIn && !!authToken,
    queryFn: async () => {
      const response = await fetch('/api/portal/analytics/overview', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  // Fetch schools
  const { data: schools, isLoading: schoolsLoading } = useQuery<SchoolInstance[]>({
    queryKey: ['/api/portal/schools'],
    enabled: isLoggedIn && !!authToken,
    queryFn: async () => {
      const response = await fetch('/api/portal/schools', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch schools');
      return response.json();
    }
  });

  // Create school mutation
  const createSchoolMutation = useMutation({
    mutationFn: async (schoolData: any) => {
      const response = await fetch('/api/portal/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(schoolData),
      });
      if (!response.ok) throw new Error('Failed to create school');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/schools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portal/analytics/overview'] });
      setNewSchoolDialog(false);
      toast({ title: 'Success', description: 'School created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('portal_token');
    setIsLoggedIn(false);
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const schoolData = Object.fromEntries(formData);
    createSchoolMutation.mutate(schoolData);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      suspended: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.expired}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Developer Portal
            </CardTitle>
            <CardDescription>
              Sign in to manage your school management instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold">Developer Portal</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <School className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Schools</p>
                  <p className="text-2xl font-bold">{dashboardStats?.totalSchools || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Schools</p>
                  <p className="text-2xl font-bold">{dashboardStats?.activeSchools || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Trial Schools</p>
                  <p className="text-2xl font-bold">{dashboardStats?.trialSchools || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold">+12%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schools" className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="schools" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">School Instances</h2>
              <Dialog open={newSchoolDialog} onOpenChange={setNewSchoolDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    <LanguageText
                      en="Add School"
                      bn="স্কুল যোগ করুন"
                      ar="إضافة مدرسة"
                    />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      <LanguageText
                        en="Create New School Instance"
                        bn="নতুন স্কুল ইনস্ট্যান্স তৈরি করুন"
                        ar="إنشاء مثيل مدرسة جديد"
                      />
                    </DialogTitle>
                    <DialogDescription>
                      <LanguageText
                        en="Register a new school to start using the management system."
                        bn="ম্যানেজমেন্ট সিস্টেম ব্যবহার শুরু করতে একটি নতুন স্কুল নিবন্ধন করুন।"
                        ar="سجل مدرسة جديدة لبدء استخدام نظام الإدارة."
                      />
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSchool} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        <LanguageText
                          en="School Name"
                          bn="স্কুলের নাম"
                          ar="اسم المدرسة"
                        />
                      </Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">
                        <LanguageText
                          en="Contact Email"
                          bn="যোগাযোগের ইমেইল"
                          ar="البريد الإلكتروني للاتصال"
                        />
                      </Label>
                      <Input id="contactEmail" name="contactEmail" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">
                        <LanguageText
                          en="Contact Phone"
                          bn="যোগাযোগের ফোন"
                          ar="هاتف الاتصال"
                        />
                      </Label>
                      <Input id="contactPhone" name="contactPhone" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">
                        <LanguageText
                          en="Address"
                          bn="ঠিকানা"
                          ar="العنوان"
                        />
                      </Label>
                      <Textarea id="address" name="address" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="planType">
                        <LanguageText
                          en="Plan Type"
                          bn="প্ল্যানের ধরন"
                          ar="نوع الخطة"
                        />
                      </Label>
                      <Select name="planType" defaultValue="basic">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">
                            <LanguageText
                              en="Basic"
                              bn="বেসিক"
                              ar="أساسي"
                            />
                          </SelectItem>
                          <SelectItem value="pro">
                            <LanguageText
                              en="Pro"
                              bn="প্রো"
                              ar="محترف"
                            />
                          </SelectItem>
                          <SelectItem value="enterprise">
                            <LanguageText
                              en="Enterprise"
                              bn="এন্টারপ্রাইজ"
                              ar="مؤسسي"
                            />
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={createSchoolMutation.isPending}>
                      {createSchoolMutation.isPending ? (
                        <LanguageText
                          en="Creating..."
                          bn="তৈরি করা হচ্ছে..."
                          ar="جاري الإنشاء..."
                        />
                      ) : (
                        <LanguageText
                          en="Create School"
                          bn="স্কুল তৈরি করুন"
                          ar="إنشاء مدرسة"
                        />
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {schoolsLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : schools?.length ? (
                schools.map((school) => (
                  <Card key={school.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{school.name}</h3>
                            {getStatusBadge(school.status)}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">School ID:</span> {school.schoolId}</p>
                            <p><span className="font-medium">Subdomain:</span> {school.subdomain}.yourapp.com</p>
                            <p><span className="font-medium">Contact:</span> {school.contactEmail}</p>
                            <p><span className="font-medium">Plan:</span> {school.planType.charAt(0).toUpperCase() + school.planType.slice(1)}</p>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Students</p>
                              <p className="font-medium">{school.maxStudents}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Teachers</p>
                              <p className="font-medium">{school.maxTeachers}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Documents</p>
                              <p className="font-medium">{school.usedDocuments}/{school.maxDocuments}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Globe className="h-4 w-4 mr-1" />
                            Visit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No schools yet</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first school instance.</p>
                    <Button onClick={() => setNewSchoolDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First School
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedAnalytics authToken={authToken || ''} />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManagement authToken={authToken || ''} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement authToken={authToken || ''} />
          </TabsContent>

          <TabsContent value="monitoring">
            <SystemMonitoring authToken={authToken || ''} />
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>
                  Control which features are available to each school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Video Portal</h3>
                            <p className="text-sm text-gray-600">Enable video conferencing</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Available</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Parent Portal</h3>
                            <p className="text-sm text-gray-600">Parent access dashboard</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">SMS Notifications</h3>
                            <p className="text-sm text-gray-600">SMS alert system</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Beta</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}