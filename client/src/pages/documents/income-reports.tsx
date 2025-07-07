import { useState, useRef, useEffect } from 'react';
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

// Define schema for income report information
const incomeReportSchema = z.object({
  reportTitle: z.string().min(2, { message: "Report title is required" }),
  reportTitleInBangla: z.string().optional(),
  reportPeriod: z.string().min(1, { message: "Report period is required" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  schoolName: z.string().min(2, { message: "School name is required" }),
  schoolNameInBangla: z.string().optional(),
  schoolAddress: z.string().min(2, { message: "School address is required" }),
  principalName: z.string().min(2, { message: "Principal name is required" }),
  accountantName: z.string().min(2, { message: "Accountant name is required" }),
  notes: z.string().optional(),
  incomeItems: z.array(z.object({
    category: z.string(),
    description: z.string(),
    amount: z.string()
  })).optional()
});

// Define schema for template configuration
const templateSchema = z.object({
  layout: z.enum(['portrait', 'landscape']).default('portrait'),
  language: z.enum(['bengali', 'english', 'both']).default('both'),
  template: z.enum(['standard', 'detailed', 'summary']).default('standard'),
  includeLogo: z.boolean().default(true),
  includeSignature: z.boolean().default(true),
  includeFooter: z.boolean().default(true),
  includeWatermark: z.boolean().default(false),
  includeGraphs: z.boolean().default(true)
});

// Sample income items data
const initialIncomeItems = [
  { category: "ভর্তি ফি", description: "নতুন ছাত্র ভর্তি ফি", amount: "২৫,০০০" },
  { category: "মাসিক বেতন", description: "ছাত্রদের মাসিক বেতন", amount: "১৮,০০০" },
  { category: "পরীক্ষা ফি", description: "ত্রৈমাসিক পরীক্ষার ফি", amount: "৮,০০০" },
  { category: "বই বিক্রয়", description: "পাঠ্যবই ও খাতা বিক্রয়", amount: "১২,০০০" },
  { category: "অতিরিক্ত কার্যক্রম", description: "খেলাধুলা ও সাংস্কৃতিক কার্যক্রম", amount: "৫,০০০" }
];

export default function IncomeReportsPage() {
  const isMobile = useMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Report form setup
  const reportForm = useForm<z.infer<typeof incomeReportSchema>>({
    resolver: zodResolver(incomeReportSchema),
    defaultValues: {
      reportTitle: "Monthly Income Report",
      reportTitleInBangla: "মাসিক আয় রিপোর্ট",
      reportPeriod: "Monthly",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      schoolName: "Dhaka Public School",
      schoolNameInBangla: "ঢাকা পাবলিক স্কুল",
      schoolAddress: "Mirpur-10, Dhaka-1216",
      principalName: "Professor Mohammad Rahman",
      accountantName: "Md. Kamal Hossain",
      notes: "All figures are in Bangladeshi Taka (BDT)",
      incomeItems: initialIncomeItems
    }
  });

  // Template form setup
  const templateForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      layout: 'portrait',
      language: 'both',
      template: 'standard',
      includeLogo: true,
      includeSignature: true,
      includeFooter: true,
      includeWatermark: false,
      includeGraphs: true
    }
  });

  // Handle form submission for generating income report
  const onGenerateSubmit = (reportData: z.infer<typeof incomeReportSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Report Data:", reportData);
    console.log("Template Data:", templateData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "আয় রিপোর্ট তৈরি হয়েছে",
        description: "আপনার আয় রিপোর্ট সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const reportElement = document.getElementById('income-report-preview');
    if (!reportElement) return;

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Determine PDF dimensions based on layout
    const layout = templateForm.getValues('layout');
    const orientation = layout === 'landscape' ? 'landscape' : 'portrait';
    
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`income-report-${reportForm.getValues('reportPeriod')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার আয় রিপোর্ট পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    reportForm.reset();
    templateForm.reset();
  };
  
  // Calculate total income
  const calculateTotalIncome = () => {
    const incomeItems = reportForm.getValues('incomeItems') || [];
    let total = 0;
    
    // This is just a mock calculation - in real app we would parse the Bengali numerals properly
    incomeItems.forEach(item => {
      // For demo purposes, converting Bengali numerals to numbers
      const amount = item.amount.replace(/[০-৯]/g, m => String.fromCharCode(m.charCodeAt(0) - 2486));
      total += parseInt(amount.replace(/,/g, ''), 10) || 0;
    });
    
    return total.toLocaleString('bn-BD');
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section - Don Norman's Clear Mental Model */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">আয় রিপোর্ট সিস্টেম</span>
            </nav>
            
            {/* Hero Header with Status Indicator */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">account_balance</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        আয় রিপোর্ট সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        আর্থিক আয়ের বিস্তারিত প্রতিবেদন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                      <span>রিপোর্ট জেনারেটর সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>অডিট রেডি</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                    onClick={() => onGenerateSubmit(reportForm.getValues(), templateForm.getValues())}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-icons mr-2 animate-spin">autorenew</span>
                        জেনারেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">description</span>
                        রিপোর্ট তৈরি করুন
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-6 py-3 rounded-xl font-medium border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
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
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-indigo-600 dark:text-indigo-400 text-xl">trending_up</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট আয়</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৳ {calculateTotalIncome()}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">চলতি মাস</p>
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
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">description</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">রিপোর্ট তৈরি</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ১২৫
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">এ বছর</p>
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
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">assessment</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">গড় আয়</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৳ ৪৫,০০০
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">মাসিক</p>
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
                        <span className="material-icons text-purple-600 dark:text-purple-400 text-xl">account_balance_wallet</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আয়ের উৎস</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৮
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">বিভিন্ন খাত</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!previewMode ? (
            <div className="flex flex-col gap-6">
              {/* Enhanced Report Configuration - Dieter Rams' Minimalism */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-orange-600 dark:text-orange-400 text-xl">summarize</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        রিপোর্ট কনফিগারেশন
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        আয় রিপোর্টের বিস্তারিত তথ্য প্রদান করুন
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Form {...reportForm}>
                    <div className="space-y-6">
                      {/* Basic Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="material-icons text-orange-500">info</span>
                          মৌলিক তথ্য
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={reportForm.control}
                            name="reportTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">রিপোর্টের শিরোনাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Monthly Income Report"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={reportForm.control}
                            name="reportTitleInBangla"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">রিপোর্টের শিরোনাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="মাসিক আয় রিপোর্ট"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={reportForm.control}
                            name="reportPeriod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">রিপোর্ট সময়কাল</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                      <SelectValue placeholder="সময়কাল নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Daily">দৈনিক</SelectItem>
                                    <SelectItem value="Weekly">সাপ্তাহিক</SelectItem>
                                    <SelectItem value="Monthly">মাসিক</SelectItem>
                                    <SelectItem value="Quarterly">ত্রৈমাসিক</SelectItem>
                                    <SelectItem value="Yearly">বার্ষিক</SelectItem>
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
                          onClick={() => onGenerateSubmit(reportForm.getValues(), templateForm.getValues())}
                          disabled={isLoading}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                        >
                          {isLoading ? (
                            <>
                              <span className="material-icons mr-2 animate-spin">autorenew</span>
                              জেনারেট হচ্ছে...
                            </>
                          ) : (
                            <>
                              <span className="material-icons mr-2">description</span>
                              রিপোর্ট তৈরি করুন
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
                          রিপোর্ট প্রিভিউ
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          আপনার তৈরি করা আয় রিপোর্ট
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={generatePDF}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
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
                  <div id="income-report-preview" className="p-8 bg-white">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">{reportForm.getValues('reportTitle')}</h1>
                      <h2 className="text-xl mb-4">{reportForm.getValues('reportTitleInBangla')}</h2>
                      <p className="text-sm text-gray-600">
                        Period: {reportForm.getValues('reportPeriod')} | 
                        From: {reportForm.getValues('startDate')} to {reportForm.getValues('endDate')}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold">Total Income: ৳ {calculateTotalIncome()}</p>
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