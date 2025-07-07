import React, { useState, useRef } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ResponsivePageLayout } from '@/components/layout/responsive-page-layout';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useSchoolAdmin } from '@/hooks/use-school-admin';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  Settings, 
  Palette, 
  Globe, 
  BarChart3,
  Users,
  GraduationCap,
  Building,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// School admin specific schemas
const basicInfoSchema = z.object({
  name: z.string().min(2, { message: "স্কুলের নাম আবশ্যক" }),
  nameInBangla: z.string().min(2, { message: "বাংলায় স্কুলের নাম আবশ্যক" }),
  address: z.string().min(5, { message: "ঠিকানা আবশ্যক" }),
  addressInBangla: z.string().min(5, { message: "বাংলা ঠিকানা আবশ্যক" }),
  email: z.string().email({ message: "সঠিক ইমেইল প্রদান করুন" }),
  phone: z.string().min(10, { message: "সঠিক ফোন নম্বর প্রদান করুন" }),
  website: z.string().url({ message: "সঠিক ওয়েবসাইট URL" }).optional().or(z.literal("")),
  principalName: z.string().min(2, { message: "প্রিন্সিপালের নাম আবশ্যক" }),
  establishmentYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  eiin: z.string().min(5, { message: "সঠিক EIIN নম্বর" }),
});

const brandingSchema = z.object({
  primaryColor: z.string().min(4, { message: "রঙ নির্বাচন করুন" }),
  secondaryColor: z.string().min(4, { message: "রঙ নির্বাচন করুন" }),
  accentColor: z.string().min(4, { message: "রঙ নির্বাচন করুন" }),
  motto: z.string().optional(),
  mottoBn: z.string().optional(),
  useWatermark: z.boolean(),
  useLetterhead: z.boolean(),
});

const systemPreferencesSchema = z.object({
  timezone: z.string(),
  language: z.enum(["bn", "en"]),
  dateFormat: z.string(),
  currency: z.string(),
  academicYearStart: z.string(),
  weekStartsOn: z.enum(["sunday", "monday"]),
  enableNotifications: z.boolean(),
  enableSMS: z.boolean(),
  enableEmail: z.boolean(),
  autoBackup: z.boolean(),
  dataRetention: z.coerce.number().min(30).max(3650),
  maxStudents: z.coerce.number().min(50).max(10000),
  maxTeachers: z.coerce.number().min(5).max(500),
});

export default function SchoolAdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // School admin Supabase hook
  const {
    dashboard,
    schoolSettings,
    statistics,
    permissions,
    dashboardLoading,
    basicSettingsLoading,
    statisticsLoading,
    updateBasicSettingsMutation,
    updateBrandingMutation,
    updateSystemSettingsMutation,
    uploadFileMutation,
    createBackupMutation,
    restoreDataMutation,
    isUpdatingBasic,
    isUpdatingBranding,
    isUpdatingSystem,
    isUploading,
    isBackingUp,
    isRestoring
  } = useSchoolAdmin();

  // File upload handler for school files
  const handleFileUpload = async (type: 'logo' | 'banner' | 'letterhead') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        await uploadFileMutation.mutateAsync({
          type,
          fileName: file.name,
          fileData: base64Data
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Backup and restore handlers
  const handleCreateBackup = async () => {
    await createBackupMutation.mutateAsync();
  };

  const handleRestoreData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const backupData = JSON.parse(reader.result as string);
          await restoreDataMutation.mutateAsync(backupData);
        } catch (error) {
          toast({
            title: "ত্রুটি",
            description: "ব্যাকআপ ফাইল পড়তে সমস্যা হয়েছে",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Form handlers
  const basicInfoForm = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: '',
      nameInBangla: '',
      address: '',
      addressInBangla: '',
      email: '',
      phone: '',
      website: '',
      principalName: '',
      establishmentYear: new Date().getFullYear(),
      eiin: '',
    },
  });

  const brandingForm = useForm<z.infer<typeof brandingSchema>>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      motto: '',
      mottoBn: '',
      useWatermark: false,
      useLetterhead: false,
    },
  });

  const systemForm = useForm<z.infer<typeof systemPreferencesSchema>>({
    resolver: zodResolver(systemPreferencesSchema),
    defaultValues: {
      timezone: 'Asia/Dhaka',
      language: 'bn',
      dateFormat: 'DD/MM/YYYY',
      currency: 'BDT',
      academicYearStart: '01/01',
      weekStartsOn: 'sunday',
      enableNotifications: true,
      enableSMS: false,
      enableEmail: true,
      autoBackup: true,
      dataRetention: 365,
      maxStudents: 500,
      maxTeachers: 50,
    },
  });

  // Update forms when school settings load
  React.useEffect(() => {
    if (schoolSettings) {
      basicInfoForm.reset({
        name: schoolSettings.name || '',
        nameInBangla: schoolSettings.nameInBangla || '',
        address: schoolSettings.address || '',
        addressInBangla: schoolSettings.addressInBangla || '',
        email: schoolSettings.email || '',
        phone: schoolSettings.phone || '',
        website: schoolSettings.website || '',
        principalName: schoolSettings.principalName || '',
        establishmentYear: schoolSettings.establishmentYear || new Date().getFullYear(),
        eiin: schoolSettings.eiin || '',
      });

      brandingForm.reset({
        primaryColor: schoolSettings.primaryColor || '#3B82F6',
        secondaryColor: schoolSettings.secondaryColor || '#10B981',
        accentColor: schoolSettings.accentColor || '#F59E0B',
        motto: schoolSettings.motto || '',
        mottoBn: schoolSettings.mottoBn || '',
        useWatermark: schoolSettings.useWatermark || false,
        useLetterhead: schoolSettings.useLetterhead || false,
      });

      systemForm.reset({
        timezone: schoolSettings.timezone || 'Asia/Dhaka',
        language: schoolSettings.language || 'bn',
        dateFormat: schoolSettings.dateFormat || 'DD/MM/YYYY',
        currency: schoolSettings.currency || 'BDT',
        academicYearStart: schoolSettings.academicYearStart || '01/01',
        weekStartsOn: schoolSettings.weekStartsOn || 'sunday',
        enableNotifications: schoolSettings.enableNotifications || true,
        enableSMS: schoolSettings.enableSMS || false,
        enableEmail: schoolSettings.enableEmail || true,
        autoBackup: schoolSettings.autoBackup || true,
        dataRetention: schoolSettings.dataRetention || 365,
        maxStudents: schoolSettings.maxStudents || 500,
        maxTeachers: schoolSettings.maxTeachers || 50,
      });
    }
  }, [schoolSettings, basicInfoForm, brandingForm, systemForm]);

  // Form submission handlers
  const onBasicInfoSubmit = async (data: z.infer<typeof basicInfoSchema>) => {
    await updateBasicSettingsMutation.mutateAsync(data);
  };

  const onBrandingSubmit = async (data: z.infer<typeof brandingSchema>) => {
    await updateBrandingMutation.mutateAsync(data);
  };

  const onSystemSubmit = async (data: z.infer<typeof systemPreferencesSchema>) => {
    await updateSystemSettingsMutation.mutateAsync(data);
  };

  // Show loading state for school admin
  if (dashboardLoading || basicSettingsLoading) {
    return (
      <AppShell>
        <ResponsivePageLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg">স্কুল অ্যাডমিন ড্যাশবোর্ড লোড হচ্ছে...</p>
            </div>
          </div>
        </ResponsivePageLayout>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ResponsivePageLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">স্কুল অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-muted-foreground">
              আপনার স্কুলের সেটিংস এবং ডেটা পরিচালনা করুন
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                ওভারভিউ
              </TabsTrigger>
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                মৌলিক তথ্য
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                ব্র্যান্ডিং
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                সিস্টেম
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                ডেটা
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics?.students?.total || 450}</div>
                    <p className="text-xs text-muted-foreground">
                      সক্রিয়: {statistics?.students?.active || 445}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট শিক্ষক</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics?.teachers?.total || 35}</div>
                    <p className="text-xs text-muted-foreground">
                      সক্রিয়: {statistics?.teachers?.active || 34}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট ক্লাস</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics?.academics?.totalClasses || 12}</div>
                    <p className="text-xs text-muted-foreground">
                      উপস্থিতি: {statistics?.academics?.averageAttendance || '92%'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">সিস্টেম স্থিতি</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">সক্রিয়</div>
                    <p className="text-xs text-muted-foreground">
                      ডেটাবেস: {statistics?.system?.databaseSize || '125 MB'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>সাম্প্রতিক কার্যকলাপ</CardTitle>
                  <CardDescription>আপনার স্কুলের সাম্প্রতিক পরিবর্তনসমূহ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard?.recentActivity?.map((activity: any) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.user} - {new Date(activity.timestamp).toLocaleString('bn-BD')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    স্কুলের মৌলিক তথ্য
                  </CardTitle>
                  <CardDescription>
                    আপনার স্কুলের প্রাথমিক তথ্য আপডেট করুন
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...basicInfoForm}>
                    <form onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={basicInfoForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>স্কুলের নাম (ইংরেজি)</FormLabel>
                              <FormControl>
                                <Input placeholder="স্কুলের নাম" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={basicInfoForm.control}
                          name="nameInBangla"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>স্কুলের নাম (বাংলা)</FormLabel>
                              <FormControl>
                                <Input placeholder="স্কুলের নাম বাংলায়" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={basicInfoForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ইমেইল</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="school@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={basicInfoForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ফোন নম্বর</FormLabel>
                              <FormControl>
                                <Input placeholder="+8801XXXXXXXXX" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" disabled={isUpdatingBasic}>
                        {isUpdatingBasic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        মৌলিক তথ্য সংরক্ষণ করুন
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    স্কুল ব্র্যান্ডিং
                  </CardTitle>
                  <CardDescription>
                    আপনার স্কুলের রঙ, লোগো এবং ব্র্যান্ডিং পরিচালনা করুন
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <Label>স্কুল লোগো</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        {schoolSettings?.logoUrl ? (
                          <img src={schoolSettings.logoUrl} alt="লোগো" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => handleFileUpload('logo')}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? 'আপলোড হচ্ছে...' : 'লোগো আপলোড'}
                      </Button>
                    </div>
                  </div>

                  <Form {...brandingForm}>
                    <form onSubmit={brandingForm.handleSubmit(onBrandingSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={brandingForm.control}
                          name="primaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>প্রাথমিক রঙ</FormLabel>
                              <FormControl>
                                <Input type="color" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={brandingForm.control}
                          name="secondaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>গৌণ রঙ</FormLabel>
                              <FormControl>
                                <Input type="color" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={brandingForm.control}
                          name="accentColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>উচ্চারণ রঙ</FormLabel>
                              <FormControl>
                                <Input type="color" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" disabled={isUpdatingBranding}>
                        {isUpdatingBranding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        ব্র্যান্ডিং সংরক্ষণ করুন
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Preferences Tab */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    সিস্টেম পছন্দসমূহ
                  </CardTitle>
                  <CardDescription>
                    আপনার স্কুলের সিস্টেম সেটিংস কনফিগার করুন
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...systemForm}>
                    <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={systemForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ভাষা</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="ভাষা নির্বাচন করুন" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="bn">বাংলা</SelectItem>
                                  <SelectItem value="en">ইংরেজি</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={systemForm.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>টাইমজোন</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="টাইমজোন নির্বাচন করুন" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Asia/Dhaka">এশিয়া/ঢাকা</SelectItem>
                                  <SelectItem value="Asia/Kolkata">এশিয়া/কলকাতা</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={systemForm.control}
                          name="enableNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">বিজ্ঞপ্তি সক্ষম করুন</FormLabel>
                                <FormDescription>
                                  সিস্টেম বিজ্ঞপ্তি এবং আপডেট পান
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" disabled={isUpdatingSystem}>
                        {isUpdatingSystem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        সিস্টেম সেটিংস সংরক্ষণ করুন
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management Tab */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    ডেটা ব্যাকআপ এবং পুনরুদ্ধার
                  </CardTitle>
                  <CardDescription>
                    আপনার স্কুলের ডেটা নিরাপদে ব্যাকআপ এবং পুনরুদ্ধার করুন
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">সর্বশেষ ব্যাকআপ</p>
                      <p className="text-sm text-gray-600">
                        {statistics?.system?.lastBackup ? 
                          new Date(statistics.system.lastBackup).toLocaleString('bn-BD') : 
                          'কোনো ব্যাকআপ নেই'
                        }
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={handleCreateBackup}
                      disabled={isBackingUp}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isBackingUp ? 'তৈরি হচ্ছে...' : 'ব্যাকআপ তৈরি করুন'}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleRestoreData}
                      disabled={isRestoring}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isRestoring ? 'পুনরুদ্ধার হচ্ছে...' : 'ডেটা পুনরুদ্ধার করুন'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions Info */}
              <Card>
                <CardHeader>
                  <CardTitle>আপনার অনুমতিসমূহ</CardTitle>
                  <CardDescription>
                    স্কুল অ্যাডমিন হিসেবে আপনার ক্ষমতা এবং সীমাবদ্ধতা
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-600">অনুমতিপ্রাপ্ত</h4>
                      <ul className="text-sm space-y-1">
                        <li>✓ স্কুলের মৌলিক তথ্য সম্পাদনা</li>
                        <li>✓ ব্র্যান্ডিং এবং রঙ পরিবর্তন</li>
                        <li>✓ ফাইল আপলোড এবং পরিচালনা</li>
                        <li>✓ ডেটা ব্যাকআপ এবং পুনরুদ্ধার</li>
                        <li>✓ সিস্টেম সেটিংস কনফিগারেশন</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">সীমাবদ্ধ</h4>
                      <ul className="text-sm space-y-1">
                        <li>✗ অন্যান্য স্কুলের ডেটা দেখা</li>
                        <li>✗ সিস্টেম অ্যাডমিন নিয়োগ</li>
                        <li>✗ গ্লোবাল সিস্টেম সেটিংস</li>
                        <li>✗ সম্পূর্ণ ডেটা মুছে ফেলা</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsivePageLayout>
    </AppShell>
  );
}