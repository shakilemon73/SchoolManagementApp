import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { MobilePageLayout } from '@/components/layout/mobile-page-layout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from '@/components/ui/card';
import { MobileTabs, MobileTabContent } from '@/components/ui/mobile-tabs';
import { MobileInput } from '@/components/ui/mobile-input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { BnText } from '@/components/ui/bn-text';
import { FormSection } from '@/components/ui/form-section';
import { 
  Form,
  FormControl,
  FormDescription,
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

export default function ExpenseSheetsPage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Initial example expense items
  const initialExpenseItems = [
    { category: "বেতন", description: "শিক্ষক এবং কর্মচারীদের মাসিক বেতন", amount: "২৮০,০০০", date: "২০২৫-০১-০৫", reference: "SAL-JAN", paymentMethod: "ব্যাংক ট্রান্সফার" },
    { category: "যানবাহন", description: "স্কুল বাসের জ্বালানি এবং রক্ষণাবেক্ষণ", amount: "৩৫,০০০", date: "২০২৫-০১-১০", reference: "TRN-25", paymentMethod: "ক্যাশ" },
    { category: "উপকরণ", description: "ক্লাসরুম শিক্ষা উপকরণ", amount: "২৫,০০০", date: "২০২৫-০১-১৫", reference: "SUP-25", paymentMethod: "ক্যাশ" },
    { category: "উপযোগিতা", description: "বিদ্যুৎ এবং পানি বিল", amount: "২০,০০০", date: "২০২৫-০১-২০", reference: "UTL-25", paymentMethod: "ক্যাশ" },
    { category: "মেরামত", description: "কম্পিউটার ল্যাব মেরামত", amount: "১৫,০০০", date: "২০২৫-০১-২৫", reference: "MNT-25", paymentMethod: "ক্যাশ" }
  ];

  // Expense form setup
  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      reportTitle: "Monthly Expense Sheet",
      reportTitleInBangla: "মাসিক ব্যয় শীট",
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
  
  // Calculate total expense
  const calculateTotalExpense = () => {
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

  // Define tabs for the mobile view
  const tabItems = [
    { id: "generate", label: "জেনারেট", icon: "add_to_photos" },
    { id: "templates", label: "টেমপ্লেট", icon: "dashboard_customize" },
    { id: "history", label: "হিস্ট্রি", icon: "history" },
  ];

  return (
    <AppShell>
      <MobilePageLayout
        title="ব্যয় শীট"
        description="স্কুলের ব্যয়ের বিস্তারিত শীট তৈরি করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(expenseForm.getValues(), templateForm.getValues()),
          isLoading: isLoading,
          loadingText: "জেনারেট হচ্ছে...",
        }}
        secondaryActions={[
          {
            icon: "refresh",
            label: "রিসেট",
            onClick: resetForm,
            variant: "outline",
          }
        ]}
      >
        <MobileTabs
          tabs={tabItems}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        
        <MobileTabContent value="generate" activeTab={activeTab}>
          {!previewMode ? (
            <div className="flex flex-col gap-4">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-primary flex items-center">
                    <span className="material-icons mr-2">description</span>
                    রিপোর্ট বিবরণ
                  </CardTitle>
                  <CardDescription className="text-base">
                    ব্যয় শীটের জন্য প্রয়োজনীয় তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...expenseForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="রিপোর্ট তথ্য" 
                        icon="description"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={expenseForm.control}
                            name="reportTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">রিপোর্টের শিরোনাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="title" {...field} />
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
                                <FormLabel className="text-base">রিপোর্টের শিরোনাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="title" {...field} />
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
                                <FormLabel className="text-base">রিপোর্ট সময়কাল</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="mobile-select">
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
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={expenseForm.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">শুরুর তারিখ</FormLabel>
                                  <FormControl>
                                    <MobileInput type="date" leftIcon="calendar_today" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={expenseForm.control}
                              name="endDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">শেষের তারিখ</FormLabel>
                                  <FormControl>
                                    <MobileInput type="date" leftIcon="calendar_today" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </FormSection>
                      
                      {/* School Information Section */}
                      <FormSection 
                        title="স্কুল তথ্য" 
                        icon="school"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={expenseForm.control}
                            name="schoolName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">স্কুলের নাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="apartment" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={expenseForm.control}
                            name="schoolNameInBangla"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">স্কুলের নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="apartment" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={expenseForm.control}
                            name="schoolAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">স্কুলের ঠিকানা</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="location_on" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Signature Information Section */}
                      <FormSection 
                        title="স্বাক্ষর তথ্য" 
                        icon="gesture"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={expenseForm.control}
                            name="principalName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">অধ্যক্ষের নাম</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={expenseForm.control}
                            name="accountantName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">হিসাব রক্ষকের নাম</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Expense Items Preview */}
                      <FormSection 
                        title="ব্যয় সমূহ" 
                        icon="payments"
                      >
                        <div className="border rounded-md p-3 bg-muted/10">
                          <h3 className="font-medium text-base">ব্যয়ের সারসংক্ষেপ</h3>
                          <p className="text-sm text-muted-foreground mb-4">নিম্নে উল্লেখিত ব্যয়ের উৎসসমূহ</p>
                          
                          <div className="space-y-2">
                            {(expenseForm.getValues('expenseItems') || []).map((item, index) => (
                              <div key={index} className="flex items-center justify-between bg-background p-2 rounded">
                                <div>
                                  <p className="font-medium">{item.category}</p>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">৳ {item.amount}</p>
                                  <p className="text-xs text-muted-foreground">{item.date}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 pt-2 border-t flex justify-between">
                            <p className="font-semibold">মোট ব্যয়:</p>
                            <p className="font-bold text-primary">৳ {calculateTotalExpense()}</p>
                          </div>
                          
                          <Button className="w-full mt-4" variant="outline" size="sm">
                            <span className="material-icons text-sm mr-1">edit</span>
                            ব্যয় এডিট করুন
                          </Button>
                        </div>
                      </FormSection>
                      
                      {/* Additional Notes */}
                      <FormField
                        control={expenseForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">অতিরিক্ত নোট</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="রিপোর্ট সম্পর্কে অতিরিক্ত তথ্য এখানে লিখুন" 
                                className="min-h-24 resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Template Settings */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-primary flex items-center">
                    <span className="material-icons mr-2">dashboard_customize</span>
                    রিপোর্ট ফরম্যাট
                  </CardTitle>
                  <CardDescription className="text-base">
                    ব্যয় শীটের ফরম্যাট কাস্টমাইজ করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...templateForm}>
                    <div className="space-y-1">
                      <FormSection 
                        title="রিপোর্ট ফরম্যাট সেটিংস" 
                        icon="settings"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={templateForm.control}
                            name="layout"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">পেজ ওরিয়েন্টেশন</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="অরিয়েন্টেশন নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="portrait">পোর্ট্রেট</SelectItem>
                                    <SelectItem value="landscape">ল্যান্ডস্কেপ</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={templateForm.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">ভাষা</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="ভাষা নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="en">ইংরেজি</SelectItem>
                                    <SelectItem value="bn">বাংলা</SelectItem>
                                    <SelectItem value="both">উভয়</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={templateForm.control}
                            name="template"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">টেমপ্লেট</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="standard">স্ট্যান্ডার্ড</SelectItem>
                                    <SelectItem value="detailed">বিস্তারিত</SelectItem>
                                    <SelectItem value="summary">সারসংক্ষেপ</SelectItem>
                                    <SelectItem value="graphical">গ্রাফিকাল</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="space-y-2">
                          <FormField
                            control={templateForm.control}
                            name="includeLogo"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">স্কুলের লোগো</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={templateForm.control}
                            name="includeSignature"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">স্বাক্ষর</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={templateForm.control}
                            name="includeFooter"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">ফুটার</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={templateForm.control}
                            name="includeWatermark"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">ওয়াটারমার্ক</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={templateForm.control}
                            name="includeGraphs"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">গ্রাফ/চার্ট</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={templateForm.control}
                            name="includeBudgetComparison"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">বাজেট তুলনা</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Preview mode
            <div className="flex flex-col gap-4">
              <Card className="border shadow-md mb-4">
                <CardHeader className="pb-0 pt-4">
                  <CardTitle className="text-lg text-center">
                    ব্যয় শীট প্রিভিউ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div id="expense-sheet-preview" className="border p-4 bg-white rounded">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-bold">{expenseForm.getValues('schoolNameInBangla')}</h2>
                      <p className="text-sm text-gray-600">{expenseForm.getValues('schoolAddress')}</p>
                      <div className="mt-2 flex items-center justify-center">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <div className="px-4 text-lg font-bold text-primary">
                          {expenseForm.getValues('reportTitleInBangla')}
                        </div>
                        <div className="h-px bg-gray-300 flex-1"></div>
                      </div>
                      <p className="text-sm mt-1">
                        সময়কাল: {expenseForm.getValues('startDate')} থেকে {expenseForm.getValues('endDate')}
                      </p>
                    </div>
                    
                    {/* Report content */}
                    <div className="mt-4">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-primary/10">
                            <th className="border p-2 text-left">ক্যাটেগরি</th>
                            <th className="border p-2 text-left">বিবরণ</th>
                            <th className="border p-2 text-right">পরিমাণ (৳)</th>
                            <th className="border p-2 text-center">তারিখ</th>
                            <th className="border p-2 text-center">পেমেন্ট পদ্ধতি</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(expenseForm.getValues('expenseItems') || []).map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="border p-2">{item.category}</td>
                              <td className="border p-2">{item.description}</td>
                              <td className="border p-2 text-right">{item.amount}</td>
                              <td className="border p-2 text-center">{item.date}</td>
                              <td className="border p-2 text-center">{item.paymentMethod}</td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-gray-100">
                            <td className="border p-2" colSpan={2}>সর্বমোট</td>
                            <td className="border p-2 text-right">{calculateTotalExpense()}</td>
                            <td className="border p-2" colSpan={2}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Notes */}
                    <div className="mt-4 p-2 bg-gray-50 text-sm border rounded-md">
                      <p><strong>নোট:</strong> {expenseForm.getValues('notes')}</p>
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-8 flex justify-between items-center">
                      <div className="text-center">
                        <div className="border-t border-gray-400 pt-1 w-32"></div>
                        <p className="text-sm">{expenseForm.getValues('accountantName')}</p>
                        <p className="text-xs text-gray-600">হিসাব রক্ষক</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="border-t border-gray-400 pt-1 w-32"></div>
                        <p className="text-sm">{expenseForm.getValues('principalName')}</p>
                        <p className="text-xs text-gray-600">অধ্যক্ষ</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-2 sticky bottom-0 bg-background p-4 border-t">
                <Button className="flex-1" onClick={generatePDF}>
                  <span className="material-icons text-sm mr-1">download</span>
                  PDF ডাউনলোড
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setPreviewMode(false)}>
                  <span className="material-icons text-sm mr-1">edit</span>
                  এডিট করুন
                </Button>
              </div>
            </div>
          )}
        </MobileTabContent>

        <MobileTabContent value="templates" activeTab={activeTab}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">সেভ করা টেমপ্লেট</h2>
            <div className="grid grid-cols-1 gap-3">
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-blue-600">receipt_long</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">স্ট্যান্ডার্ড মাসিক ব্যয় শীট</h3>
                    <p className="text-sm text-gray-500">শেষ ব্যবহার: ০৪ মে, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-green-600">bar_chart</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">বার্ষিক ব্যয় শীট (গ্রাফিক্স সহ)</h3>
                    <p className="text-sm text-gray-500">শেষ ব্যবহার: ০২ মে, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Button variant="outline" className="w-full mt-2">
                <span className="material-icons text-sm mr-1">add</span>
                নতুন টেমপ্লেট তৈরি করুন
              </Button>
            </div>
          </div>
        </MobileTabContent>

        <MobileTabContent value="history" activeTab={activeTab}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">পূর্ববর্তী রিপোর্ট</h2>
            <div className="grid grid-cols-1 gap-3">
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-purple-600">description</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">জানুয়ারি ২০২৫ - মাসিক ব্যয় শীট</h3>
                    <p className="text-sm text-gray-500">তৈরি করা হয়েছে: ০১ ফেব্রুয়ারি, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-amber-600">description</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">ডিসেম্বর ২০২৪ - মাসিক ব্যয় শীট</h3>
                    <p className="text-sm text-gray-500">তৈরি করা হয়েছে: ০২ জানুয়ারি, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-blue-600">description</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">নভেম্বর ২০২৪ - মাসিক ব্যয় শীট</h3>
                    <p className="text-sm text-gray-500">তৈরি করা হয়েছে: ০৩ ডিসেম্বর, ২০২৪</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </MobileTabContent>
      </MobilePageLayout>
    </AppShell>
  );
}