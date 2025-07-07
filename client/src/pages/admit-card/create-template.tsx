import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Eye, 
  ArrowLeft,
  Palette,
  Settings,
  FileText
} from 'lucide-react';

const templateSchema = z.object({
  name: z.string().min(1, 'টেমপ্লেটের নাম প্রয়োজন'),
  description: z.string().optional(),
  examType: z.string().min(1, 'পরীক্ষার ধরন নির্বাচন করুন'),
  boardType: z.string().min(1, 'বোর্ডের ধরন নির্বাচন করুন'),
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
      showPhoto: z.boolean(),
      showBarcode: z.boolean(),
    }),
  }),
});

export default function CreateTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      examType: '',
      boardType: '',
      templateType: 'portrait_single',
      design: {
        layout: 'modern',
        colors: {
          primary: '#1E40AF',
          secondary: '#F59E0B',
          accent: '#10B981',
        },
        fonts: {
          bengali: 'SolaimanLipi',
          english: 'Times New Roman',
        },
        elements: {
          showLogo: true,
          showWatermark: true,
          showQR: true,
          showSignatures: true,
          showPhoto: true,
          showBarcode: false,
        },
      },
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (data: z.infer<typeof templateSchema>) => {
      const response = await fetch('/api/admit-cards/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create template');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'সফল!',
        description: 'টেমপ্লেট সফলভাবে তৈরি হয়েছে',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admit-cards/templates'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'ত্রুটি',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: z.infer<typeof templateSchema>) => {
    createTemplate.mutate(data);
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">হোম</Link>
            <span>/</span>
            <Link href="/admit-card" className="hover:text-gray-700">এডমিট কার্ড</Link>
            <span>/</span>
            <Link href="/admit-card/templates" className="hover:text-gray-700">টেমপ্লেট</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">নতুন টেমপ্লেট</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">নতুন টেমপ্লেট তৈরি</h1>
              <p className="text-gray-600 mt-1">কাস্টম এডমিট কার্ড টেমপ্লেট ডিজাইন করুন</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'সম্পাদনা মোড' : 'প্রিভিউ'}
              </Button>
              
              <Link href="/admit-card/templates">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ফিরে যান
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      মৌলিক তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>টেমপ্লেটের নাম *</FormLabel>
                          <FormControl>
                            <Input placeholder="যেমন: JSC ঢাকা বোর্ড ২০২৫" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>বিবরণ</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="টেমপ্লেটের বিস্তারিত বিবরণ লিখুন"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="examType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>পরীক্ষার ধরন *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="JSC">জেএসসি (JSC)</SelectItem>
                                <SelectItem value="SSC">এসএসসি (SSC)</SelectItem>
                                <SelectItem value="HSC">এইচএসসি (HSC)</SelectItem>
                                <SelectItem value="Dakhil">দাখিল</SelectItem>
                                <SelectItem value="Alim">আলিম</SelectItem>
                                <SelectItem value="Technical">কারিগরি</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="boardType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>বোর্ডের ধরন *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">সাধারণ শিক্ষা বোর্ড</SelectItem>
                                <SelectItem value="madrasha">মাদ্রাসা শিক্ষা বোর্ড</SelectItem>
                                <SelectItem value="technical">কারিগরি শিক্ষা বোর্ড</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
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
                              <SelectItem value="portrait_single">একক পোর্ট্রেট</SelectItem>
                              <SelectItem value="landscape_dual">দ্বৈত ল্যান্ডস্কেপ</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Design Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      ডিজাইন সেটিংস
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="design.colors.primary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>প্রাথমিক রং</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input type="color" {...field} className="w-12 h-10" />
                                <Input {...field} placeholder="#1E40AF" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="design.colors.secondary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>দ্বিতীয় রং</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input type="color" {...field} className="w-12 h-10" />
                                <Input {...field} placeholder="#F59E0B" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="design.colors.accent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>অ্যাক্সেন্ট রং</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input type="color" {...field} className="w-12 h-10" />
                                <Input {...field} placeholder="#10B981" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="design.fonts.bengali"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>বাংলা ফন্ট</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SolaimanLipi">সোলায়মান লিপি</SelectItem>
                                <SelectItem value="Kalpurush">কালপুরুষ</SelectItem>
                                <SelectItem value="AdorshoLipi">আদর্শ লিপি</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="design.fonts.english"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ইংরেজি ফন্ট</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Calibri">Calibri</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Elements Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      উপাদান সেটিংস
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="design.elements.showLogo"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>প্রতিষ্ঠানের লোগো</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="design.elements.showPhoto"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>শিক্ষার্থীর ছবি</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="design.elements.showQR"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>QR কোড</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="design.elements.showBarcode"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>বারকোড</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="design.elements.showWatermark"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>ওয়াটারমার্ক</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="design.elements.showSignatures"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>স্বাক্ষর ক্ষেত্র</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createTemplate.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createTemplate.isPending ? 'সংরক্ষণ হচ্ছে...' : 'টেমপ্লেট সংরক্ষণ করুন'}
                </Button>
              </form>
            </Form>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle>প্রিভিউ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-4 min-h-96 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <FileText className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="text-gray-600">টেমপ্লেট প্রিভিউ</p>
                    <p className="text-sm text-gray-500">
                      এখানে আপনার টেমপ্লেটের প্রিভিউ দেখানো হবে
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}