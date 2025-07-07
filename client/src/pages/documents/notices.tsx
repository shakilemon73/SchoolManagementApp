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

// Define schema for notice information
const noticeSchema = z.object({
  title: z.string().min(2, { message: "Notice title is required" }),
  titleInBangla: z.string().optional(),
  noticeType: z.string().min(1, { message: "Notice type is required" }),
  issueDate: z.string().min(1, { message: "Issue date is required" }),
  referenceNumber: z.string().optional(),
  schoolName: z.string().min(1, { message: "School name is required" }),
  schoolNameInBangla: z.string().optional(),
  principalName: z.string().min(1, { message: "Principal name is required" }),
  content: z.string().min(10, { message: "Notice content is required" }),
  contentInBangla: z.string().optional(),
  targetAudience: z.string().min(1, { message: "Target audience is required" }),
  importantNote: z.string().optional()
});

export default function NoticesPage() {
  const isMobile = useMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Notice form setup
  const noticeForm = useForm<z.infer<typeof noticeSchema>>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: "Half-Yearly Examination Notice",
      titleInBangla: "অর্ধ-বার্ষিক পরীক্ষা সংক্রান্ত বিজ্ঞপ্তি",
      noticeType: "Academic",
      issueDate: new Date().toISOString().split('T')[0],
      referenceNumber: "DPS/NOTICE/2025/" + Math.random().toString(36).substr(2, 3).toUpperCase(),
      schoolName: "Dhaka Public School",
      schoolNameInBangla: "ঢাকা পাবলিক স্কুল",
      principalName: "Professor Mohammad Rahman",
      content: "This is to inform all students and parents that the half-yearly examination will be held from 15th June 2025 to 25th June 2025. All students are requested to prepare accordingly.",
      contentInBangla: "সকল শিক্ষার্থী এবং অভিভাবকদের জানানো যাচ্ছে যে, অর্ধ-বার্ষিক পরীক্ষা আগামী ১৫ জুন ২০২৫ থেকে ২৫ জুন ২০২৫ পর্যন্ত অনুষ্ঠিত হবে।",
      targetAudience: "All Students and Parents",
      importantNote: "All students must bring their admit cards to the examination hall."
    }
  });

  // Handle form submission
  const onNoticeSubmit = (data: z.infer<typeof noticeSchema>) => {
    setIsLoading(true);
    
    console.log("Notice Data:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "নোটিশ তৈরি হয়েছে",
        description: "আপনার নোটিশ সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const noticeElement = document.getElementById('notice-preview');
    if (!noticeElement) return;

    const canvas = await html2canvas(noticeElement, {
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
    pdf.save(`notice-${noticeForm.getValues('referenceNumber')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার নোটিশ পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    noticeForm.reset();
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section - Don Norman's Clear Mental Model */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">নোটিশ সিস্টেম</span>
            </nav>
            
            {/* Hero Header with Status Indicator */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-2xl p-8 border border-orange-100 dark:border-orange-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">campaign</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        নোটিশ সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        গুরুত্বপূর্ণ বিজ্ঞপ্তি ও ঘোষণা তৈরি করুন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span>বিজ্ঞপ্তি সিস্টেম সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>অনুমোদিত ফরম্যাট</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                    onClick={() => noticeForm.handleSubmit(onNoticeSubmit)()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-icons mr-2 animate-spin">autorenew</span>
                        জেনারেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">campaign</span>
                        নোটিশ তৈরি করুন
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-6 py-3 rounded-xl font-medium border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
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
                      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-orange-600 dark:text-orange-400 text-xl">campaign</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">এ মাসের নোটিশ</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ২৩
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">প্রকাশিত</p>
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
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">visibility</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট দর্শক</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ১,৮৯৫
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">এ মাসে</p>
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
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">star</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">গুরুত্বপূর্ণ</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৮
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">জরুরি নোটিশ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-purple-600 dark:text-purple-400 text-xl">category</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">নোটিশের ধরন</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৬
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">বিভিন্ন বিভাগ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!previewMode ? (
            <div className="flex flex-col gap-6">
              {/* Enhanced Notice Configuration - Dieter Rams' Minimalism */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-orange-600 dark:text-orange-400 text-xl">settings</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        নোটিশ কনফিগারেশন
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        গুরুত্বপূর্ণ বিজ্ঞপ্তির বিস্তারিত তথ্য প্রদান করুন
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Form {...noticeForm}>
                    <div className="space-y-6">
                      {/* Notice Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="material-icons text-orange-500">info</span>
                          নোটিশের তথ্য
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={noticeForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">শিরোনাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="Half-Yearly Examination Notice"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={noticeForm.control}
                            name="titleInBangla"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">শিরোনাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="অর্ধ-বার্ষিক পরীক্ষা সংক্রান্ত বিজ্ঞপ্তি"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={noticeForm.control}
                            name="noticeType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">নোটিশের ধরন</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                      <SelectValue placeholder="ধরন নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Academic">একাডেমিক</SelectItem>
                                    <SelectItem value="Administrative">প্রশাসনিক</SelectItem>
                                    <SelectItem value="Event">ইভেন্ট</SelectItem>
                                    <SelectItem value="Emergency">জরুরি</SelectItem>
                                    <SelectItem value="General">সাধারণ</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={noticeForm.control}
                            name="targetAudience"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">লক্ষ্য দর্শক</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                      <SelectValue placeholder="দর্শক নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="All Students">সকল শিক্ষার্থী</SelectItem>
                                    <SelectItem value="All Teachers">সকল শিক্ষক</SelectItem>
                                    <SelectItem value="All Staff">সকল কর্মচারী</SelectItem>
                                    <SelectItem value="All Students and Parents">সকল শিক্ষার্থী ও অভিভাবক</SelectItem>
                                    <SelectItem value="Class 6-8">৬ষ্ঠ-৮ম শ্রেণি</SelectItem>
                                    <SelectItem value="Class 9-10">৯ম-১০ম শ্রেণি</SelectItem>
                                    <SelectItem value="All">সকলের জন্য</SelectItem>
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
                          onClick={() => noticeForm.handleSubmit(onNoticeSubmit)()}
                          disabled={isLoading}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                        >
                          {isLoading ? (
                            <>
                              <span className="material-icons mr-2 animate-spin">autorenew</span>
                              জেনারেট হচ্ছে...
                            </>
                          ) : (
                            <>
                              <span className="material-icons mr-2">campaign</span>
                              নোটিশ তৈরি করুন
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
                          নোটিশ প্রিভিউ
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          আপনার তৈরি করা নোটিশ
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={generatePDF}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium"
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
                  <div id="notice-preview" className="p-8 bg-white">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">{noticeForm.getValues('schoolNameInBangla')}</h1>
                      <h2 className="text-xl mb-2">বিজ্ঞপ্তি</h2>
                      <p className="text-sm text-gray-600">
                        নং: {noticeForm.getValues('referenceNumber')} | 
                        তারিখ: {noticeForm.getValues('issueDate')}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{noticeForm.getValues('titleInBangla')}</h3>
                        <p className="text-sm text-gray-600 mb-4">বিষয়: {noticeForm.getValues('title')}</p>
                        <p className="mb-4">{noticeForm.getValues('contentInBangla')}</p>
                        <p className="mb-4">{noticeForm.getValues('content')}</p>
                        
                        {noticeForm.getValues('importantNote') && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <p className="text-sm font-semibold">গুরুত্বপূর্ণ:</p>
                            <p className="text-sm">{noticeForm.getValues('importantNote')}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-8 text-right">
                        <p className="font-semibold">{noticeForm.getValues('principalName')}</p>
                        <p>অধ্যক্ষ</p>
                        <p>{noticeForm.getValues('schoolNameInBangla')}</p>
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