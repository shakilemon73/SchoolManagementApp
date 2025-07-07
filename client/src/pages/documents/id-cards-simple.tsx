import { useState } from 'react';
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
import { Download, Upload, Eye, User, School, CreditCard, RotateCcw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { IdCardPreview } from '@/components/documents/id-card-templates';
import { apiRequest } from '@/lib/queryClient';

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
  issueDate: z.string().min(1, "ইস্যু তারিখ আবশ্যক"),
  expireDate: z.string().min(1, "মেয়াদ উত্তীর্ণের তারিখ আবশ্যক"),
  
  // Template Settings
  template: z.string().default("portrait"),
  orientation: z.string().default("portrait"), // portrait or landscape
  primaryColor: z.string().default("#1e40af"),
  secondaryColor: z.string().default("#3b82f6"),
});

type IdCardFormData = z.infer<typeof idCardSchema>;

export default function IdCardsSimplePage() {
  const { toast } = useToast();
  const [studentPhoto, setStudentPhoto] = useState<string>("");
  const [schoolLogo, setSchoolLogo] = useState<string>("");
  const [principalSignature, setPrincipalSignature] = useState<string>("");
  const [studentSignature, setStudentSignature] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showBack, setShowBack] = useState(false);

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
      schoolName: "",
      schoolAddress: "",
      eiin: "",
      issueDate: new Date().toISOString().split('T')[0],
      expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      template: "portrait",
      orientation: "portrait",
      primaryColor: "#1e40af",
      secondaryColor: "#3b82f6",
    }
  });

  // Generate ID Card API call
  const generateIdCard = useMutation({
    mutationFn: async (data: IdCardFormData & { photo?: string }) => {
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'logo' | 'principal' | 'student') => {
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

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        switch(type) {
          case 'photo':
            setStudentPhoto(result);
            break;
          case 'logo':
            setSchoolLogo(result);
            break;
          case 'principal':
            setPrincipalSignature(result);
            break;
          case 'student':
            setStudentSignature(result);
            break;
        }
        
        setUploadingPhoto(false);
        toast({
          title: "ছবি আপলোড সফল",
          description: `${type === 'photo' ? 'শিক্ষার্থীর ছবি' : type === 'logo' ? 'স্কুল লোগো' : type === 'principal' ? 'প্রধান শিক্ষকের স্বাক্ষর' : 'শিক্ষার্থীর স্বাক্ষর'} সফলভাবে আপলোড করা হয়েছে।`
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadingPhoto(false);
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
      schoolLogo: schoolLogo,
      principalSignature: principalSignature,
      studentSignature: studentSignature
    });
  };

  const IdCardPreview = ({ data }: { data: IdCardFormData }) => (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden border">
      {/* Header */}
      <div 
        className="p-4 text-white text-center"
        style={{ backgroundColor: data.primaryColor }}
      >
        <School className="mx-auto mb-2" size={24} />
        <h3 className="font-bold text-sm">{data.schoolName}</h3>
        <p className="text-xs opacity-90">{data.schoolAddress}</p>
        <p className="text-xs opacity-90">EIIN: {data.eiin}</p>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex gap-4 mb-4">
          {/* Photo */}
          <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
            {studentPhoto ? (
              <img 
                src={studentPhoto} 
                alt="Student" 
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <User size={20} className="text-gray-400" />
            )}
          </div>

          {/* Student Info */}
          <div className="flex-1 text-xs space-y-1">
            <div>
              <span className="font-semibold">নামঃ </span>
              <span>{data.studentNameBn}</span>
            </div>
            <div>
              <span className="font-semibold">Name: </span>
              <span>{data.studentName}</span>
            </div>
            <div>
              <span className="font-semibold">আইডিঃ </span>
              <span>{data.studentId}</span>
            </div>
            <div>
              <span className="font-semibold">রোলঃ </span>
              <span>{data.rollNumber}</span>
            </div>
            <div>
              <span className="font-semibold">শ্রেণিঃ </span>
              <span>{data.className} - {data.section}</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-xs space-y-1 border-t pt-2">
          <div>
            <span className="font-semibold">পিতাঃ </span>
            <span>{data.fatherName}</span>
          </div>
          <div>
            <span className="font-semibold">মাতাঃ </span>
            <span>{data.motherName}</span>
          </div>
          <div>
            <span className="font-semibold">রক্তের গ্রুপঃ </span>
            <span className="bg-red-100 px-1 rounded">{data.bloodGroup}</span>
          </div>
          <div>
            <span className="font-semibold">ফোনঃ </span>
            <span>{data.guardianPhone}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-3 pt-2 border-t">
          <p className="text-xs text-gray-600">সেশনঃ {data.session}</p>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">আইডি কার্ড জেনারেটর</h1>
          <p className="text-gray-600">সহজভাবে শিক্ষার্থীদের আইডি কার্ড তৈরি করুন</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  শিক্ষার্থীর তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Student Photo Upload */}
                    <div className="space-y-2">
                      <Label>শিক্ষার্থীর ছবি</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-24 bg-gray-100 rounded flex items-center justify-center">
                          {studentPhoto ? (
                            <img 
                              src={studentPhoto} 
                              alt="Student" 
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <User size={24} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'photo')}
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
                        </div>
                      </div>
                    </div>

                    {/* Student Information */}
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
                    </div>

                    {/* Parent Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">অভিভাবকের তথ্য</h3>
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
                    </div>

                    {/* Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ঠিকানা *</FormLabel>
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

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2"
                      >
                        <Eye size={16} />
                        {showPreview ? "পূর্বরূপ লুকান" : "পূর্বরূপ দেখুন"}
                      </Button>

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
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={20} />
                  পূর্বরূপ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showPreview || form.formState.isSubmitSuccessful ? (
                  <IdCardPreview data={form.getValues()} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye size={48} className="mx-auto mb-4 opacity-50" />
                    <p>পূর্বরূপ দেখতে ফর্ম পূরণ করুন</p>
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