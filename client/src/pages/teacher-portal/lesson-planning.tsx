import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDesignSystem } from '@/hooks/use-design-system';
import { designClasses } from '@/lib/design-utils';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Plus,
  Edit,
  Save,
  Copy,
  Trash2,
  Calendar,
  Clock,
  Target,
  Users,
  FileText,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Star,
  Lightbulb,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

// UX-Enhanced Components
const UXCard = ({ children, interactive = false, ...props }: any) => {
  const baseClasses = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200";
  const interactiveClasses = interactive ? "hover:scale-[1.02] cursor-pointer hover:border-slate-300 dark:hover:border-slate-600" : "";
  
  return (
    <Card className={cn(baseClasses, interactiveClasses)} {...props}>
      {children}
    </Card>
  );
};

const UXButton = ({ children, variant = "primary", size = "default", ...props }: any) => {
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg",
    ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 font-medium rounded-lg",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg"
  };
  const sizeClasses = size === "sm" ? "px-3 py-2 text-sm min-h-[40px]" : "px-4 py-2.5 min-h-[44px]";
  
  return (
    <Button className={cn(variantClasses[variant] || variantClasses.primary, sizeClasses, "flex items-center justify-center gap-2")} {...props}>
      {children}
    </Button>
  );
};

// Lesson Plan Schema
const lessonPlanSchema = z.object({
  title: z.string().min(2, 'শিরোনাম আবশ্যক'),
  subject: z.string().min(1, 'বিষয় নির্বাচন করুন'),
  class: z.string().min(1, 'শ্রেণী নির্বাচন করুন'),
  duration: z.string().min(1, 'সময়কাল আবশ্যক'),
  date: z.string().min(1, 'তারিখ আবশ্যক'),
  objectives: z.string().min(10, 'শিক্ষণ উদ্দেশ্য আবশ্যক'),
  materials: z.string().min(5, 'প্রয়োজনীয় উপকরণ আবশ্যক'),
  introduction: z.string().min(10, 'ভূমিকা আবশ্যক'),
  mainContent: z.string().min(20, 'মূল বিষয়বস্তু আবশ্যক'),
  activities: z.string().min(10, 'কার্যক্রম আবশ্যক'),
  assessment: z.string().min(10, 'মূল্যায়ন পদ্ধতি আবশ্যক'),
  homework: z.string().optional(),
  notes: z.string().optional(),
});

type LessonPlanData = z.infer<typeof lessonPlanSchema>;

const LessonPlanCard = ({ plan, onEdit, onDuplicate, onDelete }: any) => (
  <UXCard interactive>
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {plan.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {plan.subject}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {plan.class}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {plan.duration}
            </span>
          </div>
        </div>
        <Badge variant={plan.status === 'completed' ? 'default' : 'secondary'}>
          {plan.status === 'completed' ? 'সম্পন্ন' : 'পরিকল্পিত'}
        </Badge>
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
        {plan.objectives}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-500">
          {plan.date}
        </span>
        <div className="flex items-center gap-2">
          <UXButton variant="ghost" size="sm" onClick={() => onEdit(plan)}>
            <Edit className="w-4 h-4" />
          </UXButton>
          <UXButton variant="ghost" size="sm" onClick={() => onDuplicate(plan)}>
            <Copy className="w-4 h-4" />
          </UXButton>
          <UXButton variant="ghost" size="sm" onClick={() => onDelete(plan.id)}>
            <Trash2 className="w-4 h-4" />
          </UXButton>
        </div>
      </div>
    </CardContent>
  </UXCard>
);

export default function LessonPlanning() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterClass, setFilterClass] = useState('all');

  // Initialize UX design system
  useDesignSystem();

  const form = useForm<LessonPlanData>({
    resolver: zodResolver(lessonPlanSchema),
    defaultValues: {
      title: '',
      subject: '',
      class: '',
      duration: '',
      date: '',
      objectives: '',
      materials: '',
      introduction: '',
      mainContent: '',
      activities: '',
      assessment: '',
      homework: '',
      notes: '',
    },
  });

  // Fetch lesson plans
  const { data: lessonPlans = [], isLoading } = useQuery({
    queryKey: ['/api/lesson-plans'],
    staleTime: 60000,
  });

  // Fetch classes and subjects for teacher
  const { data: classes = [] } = useQuery({
    queryKey: ['/api/teachers/classes'],
    staleTime: 300000,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/teachers/subjects'],
    staleTime: 300000,
  });

  // Create/Update lesson plan mutation
  const saveLessonPlan = useMutation({
    mutationFn: (planData: any) => {
      const url = editingPlan ? `/api/lesson-plans/${editingPlan.id}` : '/api/lesson-plans';
      const method = editingPlan ? 'PATCH' : 'POST';
      return apiRequest(url, {
        method,
        body: JSON.stringify(planData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lesson-plans'] });
      toast({
        title: "সফল হয়েছে!",
        description: editingPlan ? "পাঠ পরিকল্পনা আপডেট হয়েছে" : "নতুন পাঠ পরিকল্পনা তৈরি হয়েছে",
      });
      setIsDialogOpen(false);
      setEditingPlan(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "পাঠ পরিকল্পনা সংরক্ষণে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Delete lesson plan mutation
  const deleteLessonPlan = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/lesson-plans/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lesson-plans'] });
      toast({
        title: "সফল হয়েছে!",
        description: "পাঠ পরিকল্পনা মুছে ফেলা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "পাঠ পরিকল্পনা মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LessonPlanData) => {
    saveLessonPlan.mutate(data);
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    form.reset(plan);
    setIsDialogOpen(true);
  };

  const handleDuplicate = (plan: any) => {
    const duplicatedPlan = {
      ...plan,
      title: `${plan.title} (কপি)`,
      date: new Date().toISOString().split('T')[0],
    };
    delete duplicatedPlan.id;
    form.reset(duplicatedPlan);
    setEditingPlan(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('আপনি কি নিশ্চিত যে এই পাঠ পরিকল্পনা মুছে ফেলতে চান?')) {
      deleteLessonPlan.mutate(id);
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingPlan(null);
  };

  // Filter lesson plans
  const filteredPlans = lessonPlans.filter((plan: any) => {
    const matchesSubject = filterSubject === 'all' || plan.subject === filterSubject;
    const matchesClass = filterClass === 'all' || plan.class === filterClass;
    return matchesSubject && matchesClass;
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">পাঠ পরিকল্পনা লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              পাঠ পরিকল্পনা
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              কার্যকর শিক্ষাদানের জন্য পাঠ পরিকল্পনা তৈরি ও পরিচালনা করুন
            </p>
          </div>
          <div className="flex items-center gap-3">
            <UXButton variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              টেমপ্লেট ডাউনলোড
            </UXButton>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <UXButton onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন পাঠ পরিকল্পনা
                </UXButton>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPlan ? 'পাঠ পরিকল্পনা সম্পাদনা' : 'নতুন পাঠ পরিকল্পনা তৈরি করুন'}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">মূল তথ্য</TabsTrigger>
                        <TabsTrigger value="content">বিষয়বস্তু</TabsTrigger>
                        <TabsTrigger value="assessment">মূল্যায়ন</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic" className="space-y-4 mt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>পাঠের শিরোনাম</FormLabel>
                                <FormControl>
                                  <Input placeholder="পাঠের শিরোনাম লিখুন" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>বিষয়</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {subjects.map((subject: any) => (
                                      <SelectItem key={subject.id} value={subject.name}>
                                        {subject.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="class"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>শ্রেণী</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="শ্রেণী নির্বাচন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {classes.map((cls: any) => (
                                      <SelectItem key={cls.id} value={cls.name}>
                                        {cls.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>সময়কাল</FormLabel>
                                <FormControl>
                                  <Input placeholder="৪৫ মিনিট" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>তারিখ</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="objectives"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>শিক্ষণ উদ্দেশ্য</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="এই পাঠের শেষে শিক্ষার্থীরা যা অর্জন করবে..."
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="materials"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>প্রয়োজনীয় উপকরণ</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="বই, চার্ট, প্রজেক্টর, ইত্যাদি..."
                                  rows={2}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="content" className="space-y-4 mt-6">
                        <FormField
                          control={form.control}
                          name="introduction"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ভূমিকা (১০ মিনিট)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="পাঠের শুরুতে কীভাবে ছাত্রদের আগ্রহ সৃষ্টি করবেন..."
                                  rows={4}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mainContent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>মূল বিষয়বস্তু (২৫ মিনিট)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="পাঠের মূল অংশ, ধাপে ধাপে ব্যাখ্যা..."
                                  rows={6}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="activities"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>শিক্ষার্থী কার্যক্রম (১০ মিনিট)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="গ্রুপ ওয়ার্ক, প্রশ্নোত্তর, আলোচনা ইত্যাদি..."
                                  rows={4}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="assessment" className="space-y-4 mt-6">
                        <FormField
                          control={form.control}
                          name="assessment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>মূল্যায়ন পদ্ধতি</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="কীভাবে শিক্ষার্থীদের বুঝতে পারলেন মূল্যায়ন করবেন..."
                                  rows={4}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="homework"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>বাড়ির কাজ (ঐচ্ছিক)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="পরবর্তী ক্লাসের জন্য বাড়ির কাজ..."
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>অতিরিক্ত নোট (ঐচ্ছিক)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="অন্য কোনো গুরুত্বপূর্ণ তথ্য..."
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <UXButton 
                        type="button" 
                        variant="secondary"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        বাতিল
                      </UXButton>
                      <UXButton 
                        type="submit"
                        disabled={saveLessonPlan.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saveLessonPlan.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                      </UXButton>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <UXCard>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">বিষয়</label>
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব বিষয়</SelectItem>
                      {subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">শ্রেণী</label>
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব শ্রেণী</SelectItem>
                      {classes.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.name}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>মোট: {filteredPlans.length} টি পরিকল্পনা</span>
              </div>
            </div>
          </CardContent>
        </UXCard>

        {/* Lesson Plans Grid */}
        {filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan: any) => (
              <LessonPlanCard
                key={plan.id}
                plan={plan}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <UXCard>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                কোনো পাঠ পরিকল্পনা পাওয়া যায়নি
              </h3>
              <p className="text-slate-500 dark:text-slate-500 mb-6">
                আপনার প্রথম পাঠ পরিকল্পনা তৈরি করুন এবং কার্যকর শিক্ষাদান শুরু করুন
              </p>
              <UXButton onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                পাঠ পরিকল্পনা তৈরি করুন
              </UXButton>
            </CardContent>
          </UXCard>
        )}
      </div>
    </AppShell>
  );
}