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

// Define schema for expense report information
const expenseSchema = z.object({
  reportTitle: z.string().min(2, { message: "Report title is required" }),
  reportTitleInBangla: z.string().optional(),
  reportPeriod: z.string().min(1, { message: "Report period is required" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  schoolName: z.string().min(1, { message: "School name is required" }),
  schoolNameInBangla: z.string().optional(),
  schoolAddress: z.string().optional(),
  principalName: z.string().optional(),
  accountantName: z.string().optional(),
  notes: z.string().optional(),
  expenseItems: z.array(
    z.object({
      category: z.string(),
      description: z.string(),
      amount: z.string(),
      date: z.string(),
      reference: z.string().optional(),
      paymentMethod: z.string().optional()
    })
  ).optional(),
});

// Schema for template settings
const templateSchema = z.object({
  layout: z.enum(['portrait', 'landscape']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'detailed', 'summary', 'graphical']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeFooter: z.boolean(),
  includeWatermark: z.boolean(),
  includeGraphs: z.boolean(),
  includeBudgetComparison: z.boolean()
});

// Sample expense items data
const initialExpenseItems = [
  { category: "বেতন", description: "শিক্ষক এবং কর্মচারীদের মাসিক বেতন", amount: "২৮০,০০০", date: "২০২৫-০১-০৫", reference: "SAL-JAN", paymentMethod: "ব্যাংক ট্রান্সফার" },
  { category: "যানবাহন", description: "স্কুল বাসের জ্বালানি এবং রক্ষণাবেক্ষণ", amount: "৩৫,০০০", date: "২০২৫-০১-১০", reference: "TRN-25", paymentMethod: "ক্যাশ" },
  { category: "উপকরণ", description: "ক্লাসরুম শিক্ষা উপকরণ", amount: "২৫,০০০", date: "২০২৫-০১-১৫", reference: "SUP-25", paymentMethod: "ক্যাশ" },
  { category: "উপযোগিতা", description: "বিদ্যুৎ এবং পানি বিল", amount: "২০,০০০", date: "২০২৫-০১-২০", reference: "UTL-25", paymentMethod: "ক্যাশ" },
  { category: "মেরামত", description: "কম্পিউটার ল্যাব মেরামত", amount: "১৫,০০০", date: "২০২৫-০১-২৫", reference: "MNT-25", paymentMethod: "ক্যাশ" }
];

export default function ExpenseSheetsPage() {
  const isMobile = useMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Expense form setup
  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      reportTitle: "Monthly Expense Report",
      reportTitleInBangla: "মাসিক ব্যয় রিপোর্ট",
      reportPeriod: "Monthly",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      schoolName: "Dhaka Public School",
      schoolNameInBangla: "ঢাকা পাবলিক স্কুল",
      schoolAddress: "Mirpur-10, Dhaka-1216",
      principalName: "Professor Mohammad Rahman",
      accountantName: "Md. Kamal Hossain",
      notes: "All figures are in Bangladeshi Taka (BDT)",
      expenseItems: initialExpenseItems
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
      includeGraphs: true,
      includeBudgetComparison: true
    }
  });

  // Handle form submission
  const onGenerateSubmit = (reportData: z.infer<typeof expenseSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Report Data:", reportData);
    console.log("Template Data:", templateData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "ব্যয় শীট তৈরি হয়েছে",
        description: "আপনার ব্যয় শীট সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const reportElement = document.getElementById('expense-sheet-preview');
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
    pdf.save(`expense-sheet-${expenseForm.getValues('reportPeriod')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার ব্যয় শীট পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    expenseForm.reset();
    templateForm.reset();
  };
  
  // Calculate total expenses
  const calculateTotalExpenses = () => {
    const expenseItems = expenseForm.getValues('expenseItems') || [];
    let total = 0;
    
    // This is just a mock calculation - in real app we would parse the Bengali numerals properly
    expenseItems.forEach(item => {
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
              <a href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">ব্যয় শীট সিস্টেম</span>
            </nav>
            
            {/* Hero Header with Status Indicator */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-2xl p-8 border border-red-100 dark:border-red-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">receipt_long</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        ব্যয় শীট সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        আর্থিক ব্যয়ের বিস্তারিত প্রতিবেদন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span>ব্যয় ট্র্যাকার সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>অডিট রেডি</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                    onClick={() => onGenerateSubmit(expenseForm.getValues(), templateForm.getValues())}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-icons mr-2 animate-spin">autorenew</span>
                        জেনারেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">receipt_long</span>
                        ব্যয় শীট তৈরি করুন
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-6 py-3 rounded-xl font-medium border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-red-600 dark:text-red-400 text-xl">trending_down</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট ব্যয়</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৳ {calculateTotalExpenses()}
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
                      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-orange-600 dark:text-orange-400 text-xl">receipt_long</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ব্যয় এন্ট্রি</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৮৯
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
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">category</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ব্যয়ের খাত</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ১২
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">বিভিন্ন বিভাগ</p>
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
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">savings</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সাশ্রয়</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৳ ২৫,০০০
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">বাজেট থেকে</p>
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
                    <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-red-600 dark:text-red-400 text-xl">settings</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        ব্যয় শীট কনফিগারেশন
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        ব্যয় শীটের বিস্তারিত তথ্য প্রদান করুন
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Form {...expenseForm}>
                    <div className="space-y-6">
                      {/* Basic Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="material-icons text-red-500">info</span>
                          মৌলিক তথ্য
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={expenseForm.control}
                            name="reportTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">শীটের শিরোনাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="Monthly Expense Report"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={expenseForm.control}
                            name="reportTitleInBangla"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">শীটের শিরোনাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="মাসিক ব্যয় শীট"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={expenseForm.control}
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
                          onClick={() => onGenerateSubmit(expenseForm.getValues(), templateForm.getValues())}
                          disabled={isLoading}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                        >
                          {isLoading ? (
                            <>
                              <span className="material-icons mr-2 animate-spin">autorenew</span>
                              জেনারেট হচ্ছে...
                            </>
                          ) : (
                            <>
                              <span className="material-icons mr-2">receipt_long</span>
                              ব্যয় শীট তৈরি করুন
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
                          ব্যয় শীট প্রিভিউ
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          আপনার তৈরি করা ব্যয় শীট
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
                  <div id="expense-sheet-preview" className="p-8 bg-white">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">{expenseForm.getValues('reportTitle')}</h1>
                      <h2 className="text-xl mb-4">{expenseForm.getValues('reportTitleInBangla')}</h2>
                      <p className="text-sm text-gray-600">
                        Period: {expenseForm.getValues('reportPeriod')} | 
                        From: {expenseForm.getValues('startDate')} to {expenseForm.getValues('endDate')}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-red-600">Total Expenses: ৳ {calculateTotalExpenses()}</p>
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