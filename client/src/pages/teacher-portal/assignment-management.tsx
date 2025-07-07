import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UXCard, UXButton } from '@/components/ux-system';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  ClipboardList,
  Plus,
  Edit,
  Save,
  Trash2,
  Calendar as CalendarIcon,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  GraduationCap,
  FileText,
  Send
} from 'lucide-react';

// Assignment Schema
const assignmentSchema = z.object({
  title: z.string().min(1, 'অ্যাসাইনমেন্টের শিরোনাম প্রয়োজন'),
  description: z.string().min(1, 'বিবরণ প্রয়োজন'),
  subjectId: z.string().min(1, 'বিষয় নির্বাচন করুন'),
  classId: z.string().min(1, 'ক্লাস নির্বাচন করুন'),
  dueDate: z.date({ required_error: 'শেষ তারিখ প্রয়োজন' }),
  totalMarks: z.number().min(1, 'পূর্ণমান ১ এর বেশি হতে হবে'),
  assignmentType: z.string().min(1, 'অ্যাসাইনমেন্টের ধরণ নির্বাচন করুন'),
  instructions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

type AssignmentData = z.infer<typeof assignmentSchema>;

const variantClasses = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg",
  ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 font-medium rounded-lg",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg"
};

export default function AssignmentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AssignmentData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      subjectId: '',
      classId: '',
      totalMarks: 100,
      assignmentType: '',
      instructions: '',
      attachments: [],
    },
  });

  // Fetch assignments
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['/api/teacher/assignments'],
    queryFn: () => apiRequest('/api/teacher/assignments'),
  });

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ['/api/teacher/subjects'],
    queryFn: () => apiRequest('/api/teacher/subjects'),
  });

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['/api/teacher/classes'],
    queryFn: () => apiRequest('/api/teacher/classes'),
  });

  // Create/Update assignment mutation
  const assignmentMutation = useMutation({
    mutationFn: (data: AssignmentData) => {
      if (editingAssignment) {
        return apiRequest(`/api/teacher/assignments/${editingAssignment.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      }
      return apiRequest('/api/teacher/assignments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/assignments'] });
      setIsDialogOpen(false);
      setEditingAssignment(null);
      form.reset();
      toast({
        title: editingAssignment ? 'অ্যাসাইনমেন্ট আপডেট করা হয়েছে' : 'অ্যাসাইনমেন্ট তৈরি করা হয়েছে',
        description: 'সফলভাবে সম্পন্ন হয়েছে',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'ত্রুটি',
        description: error.message || 'একটি সমস্যা হয়েছে',
        variant: 'destructive',
      });
    },
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/teacher/assignments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/assignments'] });
      toast({
        title: 'অ্যাসাইনমেন্ট মুছে ফেলা হয়েছে',
        description: 'সফলভাবে সম্পন্ন হয়েছে',
      });
    },
  });

  const onSubmit = (data: AssignmentData) => {
    assignmentMutation.mutate(data);
  };

  const handleEdit = (assignment: any) => {
    setEditingAssignment(assignment);
    form.reset({
      title: assignment.title,
      description: assignment.description,
      subjectId: assignment.subjectId?.toString(),
      classId: assignment.classId?.toString(),
      dueDate: new Date(assignment.dueDate),
      totalMarks: assignment.totalMarks,
      assignmentType: assignment.assignmentType,
      instructions: assignment.instructions || '',
      attachments: assignment.attachments || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই অ্যাসাইনমেন্টটি মুছে ফেলতে চান?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredAssignments = assignments?.filter((assignment: any) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'সক্রিয়', variant: 'default' },
      completed: { label: 'সম্পন্ন', variant: 'secondary' },
      overdue: { label: 'বিলম্বিত', variant: 'destructive' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const assignmentTypes = [
    { value: 'homework', label: 'বাড়ির কাজ' },
    { value: 'project', label: 'প্রকল্প' },
    { value: 'essay', label: 'রচনা' },
    { value: 'presentation', label: 'উপস্থাপনা' },
    { value: 'research', label: 'গবেষণা' },
    { value: 'practical', label: 'ব্যবহারিক' },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">অ্যাসাইনমেন্ট লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            অ্যাসাইনমেন্ট ব্যবস্থাপনা
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            ছাত্রদের জন্য অ্যাসাইনমেন্ট তৈরি ও পরিচালনা করুন
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <UXButton onClick={() => {
              setEditingAssignment(null);
              form.reset();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              নতুন অ্যাসাইনমেন্ট
            </UXButton>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UXCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অ্যাসাইনমেন্ট</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments?.length || 0}</div>
          </CardContent>
        </UXCard>

        <UXCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয় অ্যাসাইনমেন্ট</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments?.filter((a: any) => a.status === 'active').length || 0}
            </div>
          </CardContent>
        </UXCard>

        <UXCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের শেষ তারিখ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments?.filter((a: any) => {
                const today = new Date().toDateString();
                return new Date(a.dueDate).toDateString() === today;
              }).length || 0}
            </div>
          </CardContent>
        </UXCard>

        <UXCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">বিলম্বিত</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {assignments?.filter((a: any) => a.status === 'overdue').length || 0}
            </div>
          </CardContent>
        </UXCard>
      </div>

      {/* Search and Filter */}
      <UXCard>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="অ্যাসাইনমেন্ট খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="স্ট্যাটাস" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব</SelectItem>
                <SelectItem value="active">সক্রিয়</SelectItem>
                <SelectItem value="completed">সম্পন্ন</SelectItem>
                <SelectItem value="overdue">বিলম্বিত</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </UXCard>

      {/* Assignments Table */}
      <UXCard>
        <CardHeader>
          <CardTitle>অ্যাসাইনমেন্ট তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো অ্যাসাইনমেন্ট নেই</h3>
              <p className="mt-1 text-sm text-gray-500">আপনার প্রথম অ্যাসাইনমেন্ট তৈরি করুন।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>শিরোনাম</TableHead>
                    <TableHead>বিষয়</TableHead>
                    <TableHead>ক্লাস</TableHead>
                    <TableHead>শেষ তারিখ</TableHead>
                    <TableHead>পূর্ণমান</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment: any) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>{assignment.subject?.name || 'N/A'}</TableCell>
                      <TableCell>{assignment.class?.name || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(assignment.dueDate), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{assignment.totalMarks}</TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(assignment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(assignment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </UXCard>

      {/* Assignment Dialog */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAssignment ? 'অ্যাসাইনমেন্ট সম্পাদনা' : 'নতুন অ্যাসাইনমেন্ট তৈরি'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>অ্যাসাইনমেন্টের শিরোনাম</FormLabel>
                    <FormControl>
                      <Input placeholder="যেমন: গণিত অনুশীলনী ১" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjectId"
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
                        {(subjects as any[])?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
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
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ক্লাস</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ক্লাস নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(classes as any[])?.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
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
                name="assignmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>অ্যাসাইনমেন্টের ধরণ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ধরণ নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="totalMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>পূর্ণমান</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>বিবরণ</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="অ্যাসাইনমেন্টের বিস্তারিত বিবরণ লিখুন..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>নির্দেশনা (ঐচ্ছিক)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="বিশেষ নির্দেশনা বা গাইডলাইন..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>শেষ তারিখ</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>তারিখ নির্বাচন করুন</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                বাতিল
              </Button>
              <UXButton type="submit" disabled={assignmentMutation.isPending}>
                {assignmentMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    সংরক্ষণ করুন
                  </>
                )}
              </UXButton>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Empty State for no assignments */}
      {assignments?.length === 0 && (
        <UXCard>
          <CardContent className="text-center py-12">
            <ClipboardList className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              কোনো অ্যাসাইনমেন্ট নেই
            </h3>
            <p className="text-slate-500 dark:text-slate-500 mb-6">
              আপনার প্রথম অ্যাসাইনমেন্ট তৈরি করুন এবং ছাত্রদের কাজ দিন
            </p>
            <UXButton onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              অ্যাসাইনমেন্ট তৈরি করুন
            </UXButton>
          </CardContent>
        </UXCard>
      )}
    </div>
  );
}