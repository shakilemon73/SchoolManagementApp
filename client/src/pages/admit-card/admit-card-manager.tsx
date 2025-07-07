import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Template schemas
const templateSchema = z.object({
  name: z.string().min(1, 'টেমপ্লেটের নাম প্রয়োজন'),
  description: z.string().optional(),
  templateType: z.enum(['portrait_single', 'landscape_dual']),
  design: z.object({
    layout: z.string(),
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
    }),
    fonts: z.object({
      bengali: z.string(),
      english: z.string(),
    }),
    elements: z.object({
      showLogo: z.boolean(),
      showWatermark: z.boolean(),
      showQR: z.boolean(),
      showSignatures: z.boolean(),
    }),
  }),
});

const singleCardSchema = z.object({
  studentName: z.string().min(1, 'ছাত্রের নাম প্রয়োজন'),
  studentNameBn: z.string().optional(),
  rollNumber: z.string().min(1, 'রোল নম্বর প্রয়োজন'),
  className: z.string().min(1, 'শ্রেণী প্রয়োজন'),
  section: z.string().optional(),
  examType: z.string().min(1, 'পরীক্ষার ধরন প্রয়োজন'),
  examCenter: z.string().min(1, 'পরীক্ষা কেন্দ্র প্রয়োজন'),
  examDate: z.string().optional(),
  templateId: z.string().min(1, 'টেমপ্লেট নির্বাচন করুন'),
});

const batchSchema = z.object({
  batchName: z.string().min(1, 'ব্যাচের নাম প্রয়োজন'),
  examType: z.string().min(1, 'পরীক্ষার ধরন প্রয়োজন'),
  templateId: z.string().min(1, 'টেমপ্লেট নির্বাচন করুন'),
  filterType: z.enum(['class', 'section', 'all']),
  selectedClasses: z.array(z.string()).optional(),
  selectedSections: z.array(z.string()).optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;
type SingleCardForm = z.infer<typeof singleCardSchema>;
type BatchForm = z.infer<typeof batchSchema>;

// Default template designs
const defaultTemplates = [
  {
    id: 'classic-portrait',
    name: 'Classic Board Exam Style',
    description: 'Traditional JSC/SSC/HSC style admit card',
    templateType: 'portrait_single',
    design: {
      layout: 'traditional',
      colors: { primary: '#1E3A8A', secondary: '#F59E0B', accent: '#059669' },
      fonts: { bengali: 'SolaimanLipi', english: 'Times New Roman' },
      elements: { showLogo: true, showWatermark: true, showQR: true, showSignatures: true },
    },
  },
  {
    id: 'modern-portrait',
    name: 'Modern Institutional Style',
    description: 'Clean and modern design for institutions',
    templateType: 'portrait_single',
    design: {
      layout: 'modern',
      colors: { primary: '#059669', secondary: '#0EA5E9', accent: '#F59E0B' },
      fonts: { bengali: 'Kalpurush', english: 'Arial' },
      elements: { showLogo: true, showWatermark: true, showQR: true, showSignatures: true },
    },
  },
  {
    id: 'efficient-landscape',
    name: 'Efficient Dual Layout',
    description: 'Cost-effective dual card layout',
    templateType: 'landscape_dual',
    design: {
      layout: 'compact',
      colors: { primary: '#1D4ED8', secondary: '#6B7280', accent: '#10B981' },
      fonts: { bengali: 'SolaimanLipi', english: 'Arial' },
      elements: { showLogo: true, showWatermark: false, showQR: true, showSignatures: true },
    },
  },
  {
    id: 'premium-landscape',
    name: 'Premium Horizontal Layout',
    description: 'Full-featured horizontal design',
    templateType: 'landscape_dual',
    design: {
      layout: 'premium',
      colors: { primary: '#7C3AED', secondary: '#EC4899', accent: '#F59E0B' },
      fonts: { bengali: 'Nikosh', english: 'Georgia' },
      elements: { showLogo: true, showWatermark: true, showQR: true, showSignatures: true },
    },
  },
];

export default function AdmitCardManager() {
  const [activeTab, setActiveTab] = useState('single');
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplates[0]);
  const [previewData, setPreviewData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates from API
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/admit-card-templates'],
    queryFn: async () => {
      const response = await fetch('/api/admit-card-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // Update selected template when templates load
  React.useEffect(() => {
    console.log('Templates loaded:', templates);
    if (templates && templates.length > 0) {
      console.log('Setting first template:', templates[0]);
      setSelectedTemplate(templates[0]);
    }
  }, [templates]);

  // Forms
  const templateForm = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      templateType: 'portrait_single',
      design: {
        layout: 'traditional',
        colors: { primary: '#1E3A8A', secondary: '#F59E0B', accent: '#059669' },
        fonts: { bengali: 'SolaimanLipi', english: 'Times New Roman' },
        elements: { showLogo: true, showWatermark: true, showQR: true, showSignatures: true },
      },
    },
  });

  const singleForm = useForm<SingleCardForm>({
    resolver: zodResolver(singleCardSchema),
    defaultValues: {
      studentName: '',
      studentNameBn: '',
      rollNumber: '',
      className: '',
      section: '',
      examType: '',
      examCenter: '',
      examDate: '',
      templateId: 'classic-portrait',
    },
  });

  const batchForm = useForm<BatchForm>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batchName: '',
      examType: '',
      templateId: 'classic-portrait',
      filterType: 'class',
      selectedClasses: [],
      selectedSections: [],
    },
  });

  // Template preview component
  const TemplatePreview = ({ template, data }: { template: any; data: any }) => {
    const isLandscape = template.templateType === 'landscape_dual';
    const colors = template.design.colors;
    
    return (
      <div 
        className="bg-white border-2 border-gray-200 shadow-lg rounded-lg overflow-hidden"
        style={{ 
          width: isLandscape ? '400px' : '280px',
          height: isLandscape ? '280px' : '400px',
          fontSize: '8px',
        }}
      >
        {/* Header */}
        <div 
          className="text-center p-2 text-white"
          style={{ backgroundColor: colors.primary }}
        >
          {template.design.elements.showLogo && (
            <div className="w-8 h-8 bg-white rounded-full mx-auto mb-1 flex items-center justify-center">
              <span className="text-xs" style={{ color: colors.primary }}>লোগো</span>
            </div>
          )}
          <h3 className="text-xs font-bold">আদর্শ উচ্চ বিদ্যালয়</h3>
          <p className="text-xs opacity-90">Adarsha High School</p>
          <p className="text-xs opacity-80">ঢাকা, বাংলাদেশ</p>
        </div>

        {/* Title */}
        <div 
          className="text-center py-2"
          style={{ backgroundColor: `${colors.secondary}20` }}
        >
          <h2 className="text-sm font-bold" style={{ color: colors.secondary }}>
            প্রবেশপত্র / ADMIT CARD
          </h2>
          <p className="text-xs">বার্ষিক পরীক্ষা - ২০২৫</p>
        </div>

        {/* Content */}
        <div className={`p-2 flex ${isLandscape ? 'flex-row' : 'flex-col'} gap-2`}>
          {isLandscape ? (
            <>
              {/* First Card */}
              <div className="flex-1 border-r border-dashed border-gray-300 pr-2">
                <div className="flex gap-2">
                  <div className="w-12 h-16 bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-500">ছবি</span>
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div><strong>নাম:</strong> {data?.studentName || 'মোহাম্মদ রহমান'}</div>
                    <div><strong>রোল:</strong> {data?.rollNumber || '১২৩৪৫৬'}</div>
                    <div><strong>শ্রেণী:</strong> {data?.className || 'দশম'}</div>
                    <div><strong>কেন্দ্র:</strong> {data?.examCenter || 'ঢাকা সরকারি উচ্চ বিদ্যালয়'}</div>
                  </div>
                </div>
                {template.design.elements.showQR && (
                  <div className="mt-2 flex justify-end">
                    <div className="w-8 h-8 bg-gray-200 border border-gray-300">
                      <span className="text-xs">QR</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Second Card */}
              <div className="flex-1 pl-2">
                <div className="flex gap-2">
                  <div className="w-12 h-16 bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-500">ছবি</span>
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div><strong>নাম:</strong> ফাতেমা খাতুন</div>
                    <div><strong>রোল:</strong> ১২৩৪৫৭</div>
                    <div><strong>শ্রেণী:</strong> দশম</div>
                    <div><strong>কেন্দ্র:</strong> ঢাকা সরকারি উচ্চ বিদ্যালয়</div>
                  </div>
                </div>
                {template.design.elements.showQR && (
                  <div className="mt-2 flex justify-end">
                    <div className="w-8 h-8 bg-gray-200 border border-gray-300">
                      <span className="text-xs">QR</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Single Portrait Card */}
              <div className="flex gap-3">
                <div className="w-16 h-20 bg-gray-100 border border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">ছবি</span>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><strong>নাম:</strong><br/>{data?.studentName || 'মোহাম্মদ রহমান'}</div>
                    <div><strong>রোল:</strong><br/>{data?.rollNumber || '১২৩৪৫৬'}</div>
                    <div><strong>শ্রেণী:</strong><br/>{data?.className || 'দশম'}</div>
                    <div><strong>শাখা:</strong><br/>{data?.section || 'ক'}</div>
                  </div>
                </div>
                {template.design.elements.showQR && (
                  <div className="w-12 h-12 bg-gray-200 border border-gray-300 flex items-center justify-center">
                    <span className="text-xs">QR</span>
                  </div>
                )}
              </div>
              
              {/* Subject Table */}
              <div className="mt-3">
                <h4 className="text-xs font-bold mb-1">পরীক্ষার বিষয়সমূহ:</h4>
                <table className="w-full text-xs border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-1 text-left">বিষয়</th>
                      <th className="border border-gray-300 p-1">তারিখ</th>
                      <th className="border border-gray-300 p-1">সময়</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-1">গণিত</td>
                      <td className="border border-gray-300 p-1 text-center">০১/০২/২৫</td>
                      <td className="border border-gray-300 p-1 text-center">১০-১</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-1">বাংলা</td>
                      <td className="border border-gray-300 p-1 text-center">০৩/০২/২৫</td>
                      <td className="border border-gray-300 p-1 text-center">১০-১</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {template.design.elements.showSignatures && (
          <div className="p-2 border-t border-gray-200">
            <div className="flex justify-between text-xs">
              <div className="text-center">
                <div className="w-16 h-6 border-b border-gray-300 mb-1"></div>
                <span>ছাত্রের স্বাক্ষর</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-6 border-b border-gray-300 mb-1"></div>
                <span>অধ্যক্ষের স্বাক্ষর</span>
              </div>
            </div>
          </div>
        )}

        {/* Watermark */}
        {template.design.elements.showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="text-4xl font-bold transform rotate-45 text-gray-400">
              স্কুল লোগো
            </div>
          </div>
        )}
      </div>
    );
  };

  const generateSingle = useMutation({
    mutationFn: async (data: SingleCardForm) => {
      const response = await fetch('/api/admit-cards/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to generate admit card');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'সফল', description: 'এডমিট কার্ড সফলভাবে তৈরি হয়েছে' });
      singleForm.reset();
    },
    onError: () => {
      toast({ title: 'ত্রুটি', description: 'এডমিট কার্ড তৈরিতে ব্যর্থ', variant: 'destructive' });
    },
  });

  const generateBatch = useMutation({
    mutationFn: async (data: BatchForm) => {
      const response = await fetch('/api/admit-cards/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to generate batch');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'সফল', description: 'ব্যাচ সফলভাবে তৈরি হয়েছে' });
      batchForm.reset();
    },
    onError: () => {
      toast({ title: 'ত্রুটি', description: 'ব্যাচ তৈরিতে ব্যর্থ', variant: 'destructive' });
    },
  });

  return (
    <AppShell>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">হোম</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">এডমিট কার্ড পরিচালনা</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">এডমিট কার্ড পরিচালনা</h1>
              <p className="text-gray-600 mt-1">বাংলাদেশী শিক্ষা প্রতিষ্ঠানের জন্য এডমিট কার্ড তৈরি ও কাস্টমাইজ করুন</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Forms */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="single">একক কার্ড</TabsTrigger>
                <TabsTrigger value="batch">ব্যাচ তৈরি</TabsTrigger>
                <TabsTrigger value="templates">টেমপ্লেট</TabsTrigger>
              </TabsList>

              {/* Single Card Generation */}
              <TabsContent value="single">
                <Card>
                  <CardHeader>
                    <CardTitle>একক এডমিট কার্ড তৈরি</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...singleForm}>
                      <form onSubmit={singleForm.handleSubmit((data) => {
                        setPreviewData(data);
                        generateSingle.mutate(data);
                      })} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={singleForm.control}
                            name="studentName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ছাত্রের নাম (ইংরেজি) *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mohammad Rahman" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={singleForm.control}
                            name="studentNameBn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ছাত্রের নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <Input placeholder="মোহাম্মদ রহমান" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={singleForm.control}
                            name="rollNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>রোল নম্বর *</FormLabel>
                                <FormControl>
                                  <Input placeholder="123456" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={singleForm.control}
                            name="className"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>শ্রেণী *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ষষ্ঠ">ষষ্ঠ শ্রেণী</SelectItem>
                                    <SelectItem value="সপ্তম">সপ্তম শ্রেণী</SelectItem>
                                    <SelectItem value="অষ্টম">অষ্টম শ্রেণী</SelectItem>
                                    <SelectItem value="নবম">নবম শ্রেণী</SelectItem>
                                    <SelectItem value="দশম">দশম শ্রেণী</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={singleForm.control}
                            name="section"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>শাখা</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="শাখা নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ক">ক</SelectItem>
                                    <SelectItem value="খ">খ</SelectItem>
                                    <SelectItem value="গ">গ</SelectItem>
                                    <SelectItem value="ঘ">ঘ</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={singleForm.control}
                            name="examType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>পরীক্ষার ধরন *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="পরীক্ষার ধরন নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="বার্ষিক">বার্ষিক পরীক্ষা</SelectItem>
                                    <SelectItem value="অর্ধবার্ষিক">অর্ধবার্ষিক পরীক্ষা</SelectItem>
                                    <SelectItem value="টেস্ট">টেস্ট পরীক্ষা</SelectItem>
                                    <SelectItem value="JSC">জেএসসি</SelectItem>
                                    <SelectItem value="SSC">এসএসসি</SelectItem>
                                    <SelectItem value="HSC">এইচএসসি</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={singleForm.control}
                            name="examCenter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>পরীক্ষা কেন্দ্র *</FormLabel>
                                <FormControl>
                                  <Input placeholder="ঢাকা সরকারি উচ্চ বিদ্যালয়" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={singleForm.control}
                            name="examDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>পরীক্ষার তারিখ</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={singleForm.control}
                            name="templateId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>টেমপ্লেট *</FormLabel>
                                <Select onValueChange={(value) => {
                                  field.onChange(value);
                                  const template = defaultTemplates.find(t => t.id === value);
                                  if (template) setSelectedTemplate(template);
                                }} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {defaultTemplates.map((template) => (
                                      <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={generateSingle.isPending} className="w-full">
                          {generateSingle.isPending ? 'তৈরি হচ্ছে...' : 'এডমিট কার্ড তৈরি করুন'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Batch Generation */}
              <TabsContent value="batch">
                <Card>
                  <CardHeader>
                    <CardTitle>ব্যাচ এডমিট কার্ড তৈরি</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...batchForm}>
                      <form onSubmit={batchForm.handleSubmit((data) => generateBatch.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={batchForm.control}
                            name="batchName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ব্যাচের নাম *</FormLabel>
                                <FormControl>
                                  <Input placeholder="দশম শ্রেণী বার্ষিক পরীক্ষা ২০২৫" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={batchForm.control}
                            name="examType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>পরীক্ষার ধরন *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="পরীক্ষার ধরন নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="বার্ষিক">বার্ষিক পরীক্ষা</SelectItem>
                                    <SelectItem value="অর্ধবার্ষিক">অর্ধবার্ষিক পরীক্ষা</SelectItem>
                                    <SelectItem value="টেস্ট">টেস্ট পরীক্ষা</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={batchForm.control}
                            name="templateId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>টেমপ্লেট *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {defaultTemplates.map((template) => (
                                      <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={batchForm.control}
                            name="filterType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ফিল্টার ধরন *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="ফিল্টার ধরন নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="class">শ্রেণী অনুযায়ী</SelectItem>
                                    <SelectItem value="section">শাখা অনুযায়ী</SelectItem>
                                    <SelectItem value="all">সব ছাত্র-ছাত্রী</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Class Selection */}
                        {batchForm.watch('filterType') === 'class' && (
                          <div>
                            <Label className="text-base font-medium">শ্রেণী নির্বাচন</Label>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {['ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম'].map((cls) => (
                                <div key={cls} className="flex items-center space-x-2">
                                  <Checkbox id={cls} />
                                  <Label htmlFor={cls}>{cls} শ্রেণী</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section Selection */}
                        {batchForm.watch('filterType') === 'section' && (
                          <div>
                            <Label className="text-base font-medium">শাখা নির্বাচন</Label>
                            <div className="mt-2 grid grid-cols-4 gap-2">
                              {['ক', 'খ', 'গ', 'ঘ'].map((section) => (
                                <div key={section} className="flex items-center space-x-2">
                                  <Checkbox id={section} />
                                  <Label htmlFor={section}>শাখা {section}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button type="submit" disabled={generateBatch.isPending} className="w-full">
                          {generateBatch.isPending ? 'ব্যাচ তৈরি হচ্ছে...' : 'ব্যাচ তৈরি করুন'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Template Management */}
              <TabsContent value="templates">
                <Card>
                  <CardHeader>
                    <CardTitle>টেমপ্লেট কাস্টমাইজেশন</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>বিদ্যমান টেমপ্লেট</Label>
                        <Select onValueChange={(value) => {
                          const templateList = templates || defaultTemplates;
                          const template = templateList.find(t => t.id === value);
                          if (template) {
                            setSelectedTemplate(template);
                            templateForm.reset({
                              name: template.name,
                              description: template.description,
                              templateType: template.templateType as "portrait_single" | "landscape_dual",
                              design: template.design,
                            });
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {(templates || defaultTemplates).map((template: any) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <Form {...templateForm}>
                        <div className="space-y-4">
                          <FormField
                            control={templateForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>টেমপ্লেটের নাম</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={templateForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>বিবরণ</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={templateForm.control}
                            name="templateType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>টেমপ্লেট ধরন</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="portrait_single">পোর্ট্রেট (একক)</SelectItem>
                                    <SelectItem value="landscape_dual">ল্যান্ডস্কেপ (দুইটি)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Color Customization */}
                          <div className="space-y-3">
                            <Label className="text-base font-medium">রঙের সেটিং</Label>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>প্রাথমিক রঙ</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="color"
                                    value={templateForm.watch('design.colors.primary')}
                                    onChange={(e) => templateForm.setValue('design.colors.primary', e.target.value)}
                                    className="w-12 h-8 p-0 border-0"
                                  />
                                  <Input
                                    value={templateForm.watch('design.colors.primary')}
                                    onChange={(e) => templateForm.setValue('design.colors.primary', e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label>সেকেন্ডারি রঙ</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="color"
                                    value={templateForm.watch('design.colors.secondary')}
                                    onChange={(e) => templateForm.setValue('design.colors.secondary', e.target.value)}
                                    className="w-12 h-8 p-0 border-0"
                                  />
                                  <Input
                                    value={templateForm.watch('design.colors.secondary')}
                                    onChange={(e) => templateForm.setValue('design.colors.secondary', e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label>এক্সেন্ট রঙ</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="color"
                                    value={templateForm.watch('design.colors.accent')}
                                    onChange={(e) => templateForm.setValue('design.colors.accent', e.target.value)}
                                    className="w-12 h-8 p-0 border-0"
                                  />
                                  <Input
                                    value={templateForm.watch('design.colors.accent')}
                                    onChange={(e) => templateForm.setValue('design.colors.accent', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Font Settings */}
                          <div className="space-y-3">
                            <Label className="text-base font-medium">ফন্ট সেটিং</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>বাংলা ফন্ট</Label>
                                <Select 
                                  value={templateForm.watch('design.fonts.bengali')}
                                  onValueChange={(value) => templateForm.setValue('design.fonts.bengali', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SolaimanLipi">সোলাইমান লিপি</SelectItem>
                                    <SelectItem value="Kalpurush">কালপুরুষ</SelectItem>
                                    <SelectItem value="Nikosh">নিকোশ</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label>ইংরেজি ফন্ট</Label>
                                <Select 
                                  value={templateForm.watch('design.fonts.english')}
                                  onValueChange={(value) => templateForm.setValue('design.fonts.english', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                    <SelectItem value="Arial">Arial</SelectItem>
                                    <SelectItem value="Georgia">Georgia</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Element Toggles */}
                          <div className="space-y-3">
                            <Label className="text-base font-medium">উপাদান সেটিং</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={templateForm.watch('design.elements.showLogo')}
                                  onCheckedChange={(checked) => templateForm.setValue('design.elements.showLogo', checked)}
                                />
                                <Label>প্রতিষ্ঠানের লোগো</Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={templateForm.watch('design.elements.showWatermark')}
                                  onCheckedChange={(checked) => templateForm.setValue('design.elements.showWatermark', checked)}
                                />
                                <Label>জলছাপ</Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={templateForm.watch('design.elements.showQR')}
                                  onCheckedChange={(checked) => templateForm.setValue('design.elements.showQR', checked)}
                                />
                                <Label>QR কোড</Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={templateForm.watch('design.elements.showSignatures')}
                                  onCheckedChange={(checked) => templateForm.setValue('design.elements.showSignatures', checked)}
                                />
                                <Label>স্বাক্ষর স্থান</Label>
                              </div>
                            </div>
                          </div>

                          <Button type="button" className="w-full">
                            টেমপ্লেট সংরক্ষণ করুন
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>লাইভ প্রিভিউ</CardTitle>
                <p className="text-sm text-gray-600">
                  নির্বাচিত টেমপ্লেটের প্রিভিউ: {selectedTemplate.name}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                  <TemplatePreview template={selectedTemplate} data={previewData} />
                </div>
                
                <div className="mt-4 text-center space-x-2">
                  <Button variant="outline" size="sm">
                    <span className="material-icons text-sm mr-1">print</span>
                    প্রিন্ট করুন
                  </Button>
                  <Button variant="outline" size="sm">
                    <span className="material-icons text-sm mr-1">download</span>
                    ডাউনলোড
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Template Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>উপলব্ধ টেমপ্লেট</CardTitle>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">টেমপ্লেট লোড হচ্ছে...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {(templates || defaultTemplates).map((template: any) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate && selectedTemplate.id === template.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-gray-600">{template.description}</p>
                          </div>
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {template.templateType === 'portrait_single' ? 'পোর্ট্রেট' : 'ল্যান্ডস্কেপ'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// Template Preview Component
function TemplatePreview({ template, data }: { template: any, data: any }) {
  if (!template) return <div className="text-center py-8 text-gray-500">কোন টেমপ্লেট নির্বাচিত নয়</div>;

  const previewData = data || {
    studentName: "Mohammad Rahman",
    studentNameBn: "মোহাম্মদ রহমান",
    rollNumber: "123456",
    className: "Class 10",
    section: "A",
    examType: "Annual Examination",
    examYear: "2025",
    instituteName: "ABC High School",
    instituteNameBn: "এবিসি উচ্চ বিদ্যালয়"
  };

  const colors = template.design?.colors || { primary: '#1E3A8A', secondary: '#F59E0B', accent: '#10B981' };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className="bg-white border-2 rounded-lg p-6 shadow-lg"
        style={{ 
          borderColor: colors.primary,
          fontFamily: template.design?.fonts?.english || 'Arial'
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div 
            className="text-lg font-bold mb-2"
            style={{ color: colors.primary }}
          >
            {previewData.instituteName || "School Name"}
          </div>
          <div 
            className="text-sm mb-2"
            style={{ 
              color: colors.secondary,
              fontFamily: template.design?.fonts?.bengali || 'Arial'
            }}
          >
            {previewData.instituteNameBn || "স্কুলের নাম"}
          </div>
          <div 
            className="text-base font-semibold px-3 py-1 rounded"
            style={{ 
              backgroundColor: colors.primary + '20',
              color: colors.primary
            }}
          >
            ADMIT CARD
          </div>
        </div>

        {/* Student Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Name:</span>
            <span>{previewData.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">নাম:</span>
            <span style={{ fontFamily: template.design?.fonts?.bengali || 'Arial' }}>
              {previewData.studentNameBn}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Roll:</span>
            <span>{previewData.rollNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Class:</span>
            <span>{previewData.className} - {previewData.section}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Exam:</span>
            <span>{previewData.examType} {previewData.examYear}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t text-center text-xs text-gray-600">
          {template.name}
        </div>
      </div>
    </div>
  );
}