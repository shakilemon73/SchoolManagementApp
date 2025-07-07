import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const studentSchema = z.object({
  studentName: z.string().min(2, 'শিক্ষার্থীর নাম প্রয়োজন'),
  studentNameBn: z.string().optional(),
  studentId: z.string().optional(),
  rollNumber: z.string().min(1, 'রোল নম্বর প্রয়োজন'),
  registrationNumber: z.string().optional(),
  className: z.string().min(1, 'শ্রেণী নির্বাচন করুন'),
  section: z.string().optional(),
  examType: z.string().min(1, 'পরীক্ষার ধরন নির্বাচন করুন'),
  examDate: z.string().optional(),
  subjects: z.array(z.object({
    code: z.string(),
    name: z.string(),
  })).optional(),
  templateId: z.string().min(1, 'টেমপ্লেট নির্বাচন করুন'),
});

export default function CreateSingleAdmitCard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState(false);

  // Get URL params for pre-selected template
  const urlParams = new URLSearchParams(window.location.search);
  const selectedTemplateId = urlParams.get('template');

  // Fetch available templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/admit-cards/templates'],
    queryFn: async () => {
      const response = await fetch('/api/admit-cards/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      studentName: '',
      studentNameBn: '',
      rollNumber: '',
      className: '',
      section: '',
      examType: '',
      examDate: '',
      templateId: selectedTemplateId || '',
      subjects: [
        { code: '101', name: 'বাংলা' },
        { code: '102', name: 'ইংরেজি' },
        { code: '103', name: 'গণিত' },
        { code: '104', name: 'বিজ্ঞান' },
      ],
    }
  });

  // Create admit card mutation
  const createAdmitCard = useMutation({
    mutationFn: async (data: z.infer<typeof studentSchema>) => {
      const response = await fetch('/api/admit-cards/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create admit card');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'সফল!',
        description: 'এডমিট কার্ড সফলভাবে তৈরি হয়েছে',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admit-cards/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admit-cards/recent'] });
      setPreviewMode(true);
    },
    onError: (error: Error) => {
      toast({
        title: 'ত্রুটি',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: z.infer<typeof studentSchema>) => {
    createAdmitCard.mutate(data);
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-700">হোম</Link>
            <span>/</span>
            <Link href="/documents/admit-cards" className="hover:text-gray-700">এডমিট কার্ড</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">একক তৈরি</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">একক এডমিট কার্ড তৈরি</h1>
              <p className="text-gray-600 mt-1">একজন শিক্ষার্থীর জন্য এডমিট কার্ড তৈরি করুন</p>
            </div>
            
            <Link href="/documents/admit-cards">
              <Button variant="outline" className="flex items-center gap-2">
                <span className="material-icons text-sm">arrow_back</span>
                ড্যাশবোর্ডে ফিরুন
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>শিক্ষার্থীর তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="studentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>শিক্ষার্থীর নাম (ইংরেজি) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Mohammad Rahman" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="studentNameBn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>শিক্ষার্থীর নাম (বাংলা)</FormLabel>
                          <FormControl>
                            <Input placeholder="মোহাম্মদ রহমান" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rollNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>রোল নম্বর *</FormLabel>
                            <FormControl>
                              <Input placeholder="2023-567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>রেজিস্ট্রেশন নম্বর</FormLabel>
                            <FormControl>
                              <Input placeholder="2023-0042" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="className"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>শ্রেণী *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="6">ষষ্ঠ শ্রেণী</SelectItem>
                                <SelectItem value="7">সপ্তম শ্রেণী</SelectItem>
                                <SelectItem value="8">অষ্টম শ্রেণী</SelectItem>
                                <SelectItem value="9">নবম শ্রেণী</SelectItem>
                                <SelectItem value="10">দশম শ্রেণী</SelectItem>
                                <SelectItem value="11">একাদশ শ্রেণী</SelectItem>
                                <SelectItem value="12">দ্বাদশ শ্রেণী</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="section"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>শাখা</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="শাখা নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A">শাখা - ক</SelectItem>
                                <SelectItem value="B">শাখা - খ</SelectItem>
                                <SelectItem value="C">শাখা - গ</SelectItem>
                                <SelectItem value="D">শাখা - ঘ</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="examType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>পরীক্ষার ধরন *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="পরীক্ষার ধরন নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="half-yearly">অর্ধবার্ষিক পরীক্ষা</SelectItem>
                              <SelectItem value="annual">বার্ষিক পরীক্ষা</SelectItem>
                              <SelectItem value="test">টেস্ট পরীক্ষা</SelectItem>
                              <SelectItem value="board">বোর্ড পরীক্ষা</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
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
                      control={form.control}
                      name="templateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>টেমপ্লেট *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templates?.map((template: any) => (
                                <SelectItem key={template.id} value={template.id.toString()}>
                                  {template.nameBn || template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createAdmitCard.isPending}
                  >
                    {createAdmitCard.isPending ? (
                      <>
                        <span className="material-icons animate-spin mr-2">refresh</span>
                        তৈরি হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">description</span>
                        এডমিট কার্ড তৈরি করুন
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>প্রিভিউ</CardTitle>
            </CardHeader>
            <CardContent>
              {previewMode ? (
                <div className="text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <span className="material-icons text-green-600 text-4xl mb-2">check_circle</span>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">সফল!</h3>
                    <p className="text-green-700">এডমিট কার্ড সফলভাবে তৈরি হয়েছে</p>
                    <div className="mt-4 space-y-2">
                      <Button className="w-full">
                        <span className="material-icons mr-2">download</span>
                        PDF ডাউনলোড করুন
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setPreviewMode(false)}>
                        আরেকটি তৈরি করুন
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <span className="material-icons text-6xl text-gray-300 mb-4">preview</span>
                  <p>ফর্ম পূরণ করুন এবং এডমিট কার্ড তৈরি করুন</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}