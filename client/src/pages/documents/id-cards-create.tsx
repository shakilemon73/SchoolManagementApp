import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Download, Upload, Eye, ArrowLeft, CreditCard, RotateCcw, Calendar } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { IdCardPreview } from '@/components/documents/id-card-templates';

const idCardSchema = z.object({
  // Student Information
  studentName: z.string().min(1, "শিক্ষার্থীর নাম আবশ্যক"),
  studentNameBn: z.string().min(1, "বাংলায় নাম আবশ্যক"), 
  studentId: z.string().min(1, "শিক্ষার্থী আইডি আবশ্যক"),
  rollNumber: z.string().min(1, "রোল নম্বর আবশ্যক"),
  className: z.string().min(1, "শ্রেণি নির্বাচন করুন"),
  section: z.string().min(1, "শাখা নির্বাচন করুন"),
  session: z.string().min(1, "সেশন আবশ্যক"),
  bloodGroup: z.string().min(1, "রক্তের গ্রুপ নির্বাচন করুন"),
  dateOfBirth: z.string().min(1, "জন্ম তারিখ আবশ্যক"),
  
  // Parent Information
  fatherName: z.string().min(1, "পিতার নাম আবশ্যক"),
  motherName: z.string().min(1, "মাতার নাম আবশ্যক"),
  guardianPhone: z.string().min(1, "অভিভাবকের ফোন নম্বর আবশ্যক"),
  
  // Address
  address: z.string().min(1, "ঠিকানা আবশ্যক"),
  
  // School Information  
  schoolName: z.string().min(1, "স্কুলের নাম আবশ্যক"),
  schoolAddress: z.string().min(1, "স্কুলের ঠিকানা আবশ্যক"),
  eiin: z.string().min(1, "EIIN নম্বর আবশ্যক"),
  
  // Card Validity
  issueDate: z.string().min(1, "ইস্যুর তারিখ আবশ্যক"),
  expireDate: z.string().min(1, "মেয়াদ উত্তীর্ণের তারিখ আবশ্যক"),
  
  // Template Settings
  template: z.enum(["portrait", "landscape"]).default("portrait"),
});

type IdCardFormData = z.infer<typeof idCardSchema>;

export default function IdCardCreatePage() {
  const { toast } = useToast();
  const [studentPhoto, setStudentPhoto] = useState<string>("");
  const [schoolLogo, setSchoolLogo] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'front' | 'back'>('front');

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const defaultExpireDate = nextYear.toISOString().split('T')[0];

  const form = useForm<IdCardFormData>({
    resolver: zodResolver(idCardSchema),
    defaultValues: {
      studentName: "",
      studentNameBn: "",
      studentId: "",
      rollNumber: "",
      className: "",
      section: "",
      session: "২০২৪-২৫",
      bloodGroup: "",
      dateOfBirth: "",
      fatherName: "",
      motherName: "",
      guardianPhone: "",
      address: "",
      schoolName: "ঢাকা পাবলিক স্কুল",
      schoolAddress: "ধানমন্ডি, ঢাকা-১২০৫",
      eiin: "123456",
      issueDate: today,
      expireDate: defaultExpireDate,
      template: "portrait",
    }
  });

  // Generate ID Card API call
  const generateIdCard = useMutation({
    mutationFn: async (data: IdCardFormData & { photo?: string; schoolLogo?: string }) => {
      const response = await fetch('/api/id-cards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate ID card');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "আইডি কার্ড তৈরি সফল",
        description: "আইডি কার্ড সফলভাবে তৈরি করা হয়েছে।"
      });
      
      // Download the PDF
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "আইডি কার্ড তৈরি ব্যর্থ",
        description: error.message || "আইডি কার্ড তৈরি করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    }
  });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'logo') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "ফাইল খুব বড়",
        description: "ছবির সাইজ ২ MB এর কম হতে হবে।",
        variant: "destructive"
      });
      return;
    }

    if (type === 'photo') {
      setUploadingPhoto(true);
    } else {
      setUploadingLogo(true);
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'photo') {
          setStudentPhoto(result);
          setUploadingPhoto(false);
        } else {
          setSchoolLogo(result);
          setUploadingLogo(false);
        }
        toast({
          title: "ছবি আপলোড সফল",
          description: `${type === 'photo' ? 'শিক্ষার্থীর ছবি' : 'স্কুল লোগো'} সফলভাবে আপলোড করা হয়েছে।`
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      if (type === 'photo') {
        setUploadingPhoto(false);
      } else {
        setUploadingLogo(false);
      }
      toast({
        title: "আপলোড ব্যর্থ",
        description: "ছবি আপলোড করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    }
  };

  const onSubmit = (data: IdCardFormData) => {
    generateIdCard.mutate({
      ...data,
      photo: studentPhoto,
      schoolLogo: schoolLogo
    });
  };

  const currentFormData = form.getValues();

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">হোম</Link>
          <span>/</span>
          <Link href="/documents/id-cards" className="hover:text-gray-700">আইডি কার্ড</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">নতুন তৈরি করুন</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">আইডি কার্ড তৈরি করুন</h1>
            <p className="text-gray-600 mt-1">ক্রেডিট কার্ড সাইজের প্রফেশনাল আইডি কার্ড তৈরি করুন</p>
          </div>
          <Link href="/documents/id-cards">
            <Button variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              ফিরে যান
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Template Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard size={20} />
                      টেমপ্লেট নির্বাচন
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>কার্ডের ওরিয়েন্টেশন</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="portrait">পোর্ট্রেট (দীর্ঘ)</SelectItem>
                              <SelectItem value="landscape">ল্যান্ডস্কেপ (প্রশস্ত)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Photo Uploads */}
                <Card>
                  <CardHeader>
                    <CardTitle>ছবি আপলোড</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Student Photo */}
                      <div className="space-y-2">
                        <Label>শিক্ষার্থীর ছবি *</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-24 bg-gray-100 border rounded overflow-hidden">
                            {studentPhoto ? (
                              <img 
                                src={studentPhoto} 
                                alt="Student" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-xs text-gray-400">ছবি</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(e, 'photo')}
                              className="hidden"
                              id="photo-upload"
                            />
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById('photo-upload')?.click()}
                              disabled={uploadingPhoto}
                            >
                              <Upload size={16} className="mr-2" />
                              {uploadingPhoto ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
                            </Button>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG (২MB পর্যন্ত)</p>
                          </div>
                        </div>
                      </div>

                      {/* School Logo */}
                      <div className="space-y-2">
                        <Label>স্কুল লোগো</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-gray-100 border rounded overflow-hidden">
                            {schoolLogo ? (
                              <img 
                                src={schoolLogo} 
                                alt="School Logo" 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-xs text-gray-400">লোগো</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(e, 'logo')}
                              className="hidden"
                              id="logo-upload"
                            />
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById('logo-upload')?.click()}
                              disabled={uploadingLogo}
                            >
                              <Upload size={16} className="mr-2" />
                              {uploadingLogo ? "আপলোড হচ্ছে..." : "লোগো আপলোড"}
                            </Button>
                            <p className="text-xs text-gray-500 mt-1">PNG (স্বচ্ছ ব্যাকগ্রাউন্ড)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Student Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>শিক্ষার্থীর তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="studentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>নাম (ইংরেজিতে) *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Mohammad Rahman" />
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
                            <FormLabel>নাম (বাংলায়) *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="মোহাম্মদ রহমান" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>শিক্ষার্থী আইডি *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="STU-2024-001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rollNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>রোল নম্বর *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="০১" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="className"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>শ্রেণি *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="প্রথম">প্রথম</SelectItem>
                                <SelectItem value="দ্বিতীয়">দ্বিতীয়</SelectItem>
                                <SelectItem value="তৃতীয়">তৃতীয়</SelectItem>
                                <SelectItem value="চতুর্থ">চতুর্থ</SelectItem>
                                <SelectItem value="পঞ্চম">পঞ্চম</SelectItem>
                                <SelectItem value="ষষ্ঠ">ষষ্ঠ</SelectItem>
                                <SelectItem value="সপ্তম">সপ্তম</SelectItem>
                                <SelectItem value="অষ্টম">অষ্টম</SelectItem>
                                <SelectItem value="নবম">নবম</SelectItem>
                                <SelectItem value="দশম">দশম</SelectItem>
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
                            <FormLabel>শাখা *</FormLabel>
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
                        control={form.control}
                        name="bloodGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>রক্তের গ্রুপ *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="রক্তের গ্রুপ নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>জন্ম তারিখ *</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="session"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>সেশন *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="২০২৪-২৫" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Parent Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>অভিভাবকের তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>পিতার নাম *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="আব্দুর রহমান" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>মাতার নাম *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="রোকেয়া বেগম" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guardianPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>অভিভাবকের ফোন *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="০১৭১২৩৪৫৬৭৮" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>ঠিকানা</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>সম্পূর্ণ ঠিকানা *</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="গ্রাম/মহল্লা, থানা, জেলা"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* School Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>স্কুলের তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="schoolName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>স্কুলের নাম *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ঢাকা পাবলিক স্কুল" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="eiin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>EIIN নম্বর *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123456" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="schoolAddress"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>স্কুলের ঠিকানা *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ধানমন্ডি, ঢাকা-১২০৫" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Card Validity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar size={20} />
                      কার্ডের মেয়াদ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="issueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ইস্যুর তারিখ *</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="expireDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>মেয়াদ উত্তীর্ণের তারিখ *</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={generateIdCard.isPending}
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    {generateIdCard.isPending ? "তৈরি হচ্ছে..." : "আইডি কার্ড তৈরি করুন"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye size={20} />
                      পূর্বরূপ
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={selectedSide === 'front' ? 'default' : 'outline'}
                        onClick={() => setSelectedSide('front')}
                      >
                        সামনে
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedSide === 'back' ? 'default' : 'outline'}
                        onClick={() => setSelectedSide('back')}
                      >
                        পেছনে
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <IdCardPreview 
                      student={{
                        ...currentFormData,
                        photo: studentPhoto,
                        schoolLogo: schoolLogo
                      }}
                      template={currentFormData.template}
                      side={selectedSide}
                    />
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">ক্রেডিট কার্ড সাইজ</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>• দৈর্ঘ্য: ৮৫.৬ মিমি</div>
                      <div>• প্রস্থ: ৫৪ মিমি</div>
                      <div>• আন্তর্জাতিক মানের আইডি কার্ড</div>
                      <div>• পকেটে বহনযোগ্য</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}