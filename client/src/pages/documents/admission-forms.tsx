import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema for admission form information
const admissionFormSchema = z.object({
  studentName: z.string().min(2, { message: "Student name is required" }),
  studentNameInBangla: z.string().optional(),
  fatherName: z.string().min(2, { message: "Father's name is required" }),
  motherName: z.string().min(2, { message: "Mother's name is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  admissionClass: z.string().min(1, { message: "Admission class is required" }),
  previousSchool: z.string().optional(),
  address: z.string().min(5, { message: "Address is required" }),
  phoneNumber: z.string().min(10, { message: "Phone number is required" }),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  academicYear: z.string().min(1, { message: "Academic year is required" }),
  guardianName: z.string().min(2, { message: "Guardian name is required" }),
  guardianContact: z.string().min(10, { message: "Guardian contact is required" })
});

export default function AdmissionFormsPage() {
  const isMobile = useMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Admission form setup
  const admissionForm = useForm<z.infer<typeof admissionFormSchema>>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: {
      studentName: "Mohammad Rahman",
      studentNameInBangla: "মোহাম্মদ রহমান",
      fatherName: "Abdul Karim",
      motherName: "Fatima Begum",
      dateOfBirth: "2008-01-15",
      admissionClass: "ষষ্ঠ শ্রেণী",
      previousSchool: "ABC Primary School",
      address: "১২৩, ধানমন্ডি, ঢাকা-১২০৫",
      phoneNumber: "01712345678",
      bloodGroup: "B+",
      religion: "Islam",
      academicYear: "২০২৫",
      guardianName: "Abdul Karim",
      guardianContact: "01712345678"
    }
  });

  // Handle form submission
  const onAdmissionSubmit = (data: z.infer<typeof admissionFormSchema>) => {
    setIsLoading(true);
    
    console.log("Admission Data:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "ভর্তি ফরম তৈরি হয়েছে",
        description: "আপনার ভর্তি ফরম সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const formElement = document.getElementById('admission-form-preview');
    if (!formElement) return;

    const canvas = await html2canvas(formElement, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`admission-form-${admissionForm.getValues('studentName')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার ভর্তি ফরম পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    admissionForm.reset();
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section - Don Norman's Clear Mental Model */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">ভর্তি ফরম সিস্টেম</span>
            </nav>
            
            {/* Hero Header with Status Indicator */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-2xl p-8 border border-purple-100 dark:border-purple-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">school</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        ভর্তি ফরম সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        নতুন শিক্ষার্থীদের ভর্তির আবেদন ফরম তৈরি করুন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span>ভর্তি প্রক্রিয়া চালু</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>অনুমোদিত ফরম</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                    onClick={() => admissionForm.handleSubmit(onAdmissionSubmit)()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-icons mr-2 animate-spin">autorenew</span>
                        জেনারেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">school</span>
                        ভর্তি ফরম তৈরি করুন
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-6 py-3 rounded-xl font-medium border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    onClick={resetForm}
                  >
                    <span className="material-icons mr-2">refresh</span>
                    রিসেট
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Cards - Julie Zhuo's Information Hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-purple-600 dark:text-purple-400 text-xl">person_add</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">নতুন আবেদন</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ১৮৭
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">এই মাসে</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">check_circle</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অনুমোদিত</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ১৪৫
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">৭৭% গ্রহণযোগ্যতার হার</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-amber-600 dark:text-amber-400 text-xl">pending</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অপেক্ষমান</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৩৫
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">পর্যালোচনার জন্য</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">group</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আসন বাকি</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৮৫
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">সকল শ্রেণীতে</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!previewMode ? (
            <div className="flex flex-col gap-6">
              {/* Enhanced Admission Form Configuration - Dieter Rams' Minimalism */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-purple-600 dark:text-purple-400 text-xl">settings</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        ভর্তি ফরম কনফিগারেশন
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        নতুন শিক্ষার্থীর ভর্তির আবেদনের বিস্তারিত তথ্য প্রদান করুন
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Form {...admissionForm}>
                    <div className="space-y-6">
                      {/* Student Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="material-icons text-purple-500">person</span>
                          শিক্ষার্থীর তথ্য
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={admissionForm.control}
                            name="studentName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">শিক্ষার্থীর নাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Mohammad Rahman"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={admissionForm.control}
                            name="studentNameInBangla"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">শিক্ষার্থীর নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="মোহাম্মদ রহমান"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={admissionForm.control}
                            name="fatherName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">পিতার নাম</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Abdul Karim"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={admissionForm.control}
                            name="admissionClass"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">ভর্তির শ্রেণী</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                      <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ষষ্ঠ শ্রেণী">ষষ্ঠ শ্রেণী</SelectItem>
                                    <SelectItem value="সপ্তম শ্রেণী">সপ্তম শ্রেণী</SelectItem>
                                    <SelectItem value="অষ্টম শ্রেণী">অষ্টম শ্রেণী</SelectItem>
                                    <SelectItem value="নবম শ্রেণী">নবম শ্রেণী</SelectItem>
                                    <SelectItem value="দশম শ্রেণী">দশম শ্রেণী</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <Button 
                          type="button"
                          onClick={() => admissionForm.handleSubmit(onAdmissionSubmit)()}
                          disabled={isLoading}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                        >
                          {isLoading ? (
                            <>
                              <span className="material-icons mr-2 animate-spin">autorenew</span>
                              জেনারেট হচ্ছে...
                            </>
                          ) : (
                            <>
                              <span className="material-icons mr-2">school</span>
                              ভর্তি ফরম তৈরি করুন
                            </>
                          )}
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          className="px-6 py-3 rounded-xl font-medium border-gray-200 dark:border-gray-600"
                        >
                          <span className="material-icons mr-2">refresh</span>
                          রিসেট
                        </Button>
                      </div>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">preview</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          ভর্তি ফরম প্রিভিউ
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          আপনার তৈরি করা ভর্তি ফরম
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={generatePDF}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        <span className="material-icons mr-2">picture_as_pdf</span>
                        পিডিএফ
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setPreviewMode(false)}
                        className="px-4 py-2 rounded-lg font-medium"
                      >
                        <span className="material-icons mr-2">edit</span>
                        সম্পাদনা
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div id="admission-form-preview" className="p-8 bg-white">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">ভর্তির আবেদন ফরম</h1>
                      <p className="text-sm text-gray-600">
                        শিক্ষাবর্ষ: {admissionForm.getValues('academicYear')} | 
                        শ্রেণী: {admissionForm.getValues('admissionClass')}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold">শিক্ষার্থীর নাম: {admissionForm.getValues('studentName')}</p>
                          <p>পিতার নাম: {admissionForm.getValues('fatherName')}</p>
                          <p>জন্ম তারিখ: {admissionForm.getValues('dateOfBirth')}</p>
                        </div>
                        <div>
                          <p>ভর্তির শ্রেণী: {admissionForm.getValues('admissionClass')}</p>
                          <p>অভিভাবকের যোগাযোগ: {admissionForm.getValues('guardianContact')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}