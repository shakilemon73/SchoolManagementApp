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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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

// Define schema for pay sheet information
const paySheetSchema = z.object({
  teacherName: z.string().min(2, { message: "Teacher name is required" }),
  teacherNameBn: z.string().optional(),
  teacherId: z.string().min(1, { message: "Teacher ID is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  department: z.string().optional(),
  monthYear: z.string().min(1, { message: "Month and year are required" }),
  basicSalary: z.string().min(1, { message: "Basic salary is required" }),
  houseRent: z.string().optional(),
  medicalAllowance: z.string().optional(),
  transportAllowance: z.string().optional(),
  performanceBonus: z.string().optional(),
  overtimeAmount: z.string().optional(),
  otherAllowances: z.string().optional(),
  incomeTax: z.string().optional(),
  providentFund: z.string().optional(),
  loanRepayment: z.string().optional(),
  absentDeduction: z.string().optional(),
  otherDeductions: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  paymentMethod: z.string().default("cash"),
});

// Schema for pay sheet template settings
const templateSchema = z.object({
  layout: z.enum(['1', '2', '4', '9']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'detailed', 'simple', 'custom']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeQRCode: z.boolean(),
  includeWatermark: z.boolean(),
  includePaySlip: z.boolean(),
});

export default function PaySheetsPage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  
  // Calculate total earnings and deductions
  const calculateTotal = (values: z.infer<typeof paySheetSchema>) => {
    const earnings = [
      parseFloat(values.basicSalary) || 0,
      parseFloat(values.houseRent) || 0,
      parseFloat(values.medicalAllowance) || 0,
      parseFloat(values.transportAllowance) || 0,
      parseFloat(values.performanceBonus) || 0,
      parseFloat(values.overtimeAmount) || 0,
      parseFloat(values.otherAllowances) || 0,
    ];
    
    const deductions = [
      parseFloat(values.incomeTax) || 0,
      parseFloat(values.providentFund) || 0,
      parseFloat(values.loanRepayment) || 0,
      parseFloat(values.absentDeduction) || 0,
      parseFloat(values.otherDeductions) || 0,
    ];
    
    const totalEarnings = earnings.reduce((sum, amount) => sum + amount, 0);
    const totalDeductions = deductions.reduce((sum, amount) => sum + amount, 0);
    const netSalary = totalEarnings - totalDeductions;
    
    return {
      totalEarnings,
      totalDeductions,
      netSalary
    };
  };
  
  // Pay sheet form setup
  const paySheetForm = useForm<z.infer<typeof paySheetSchema>>({
    resolver: zodResolver(paySheetSchema),
    defaultValues: {
      teacherName: "Mohammad Abdul Haque",
      teacherNameBn: "মোহাম্মদ আব্দুল হক",
      teacherId: "T-001",
      position: "Assistant Teacher",
      department: "Mathematics",
      monthYear: "2023-05",
      basicSalary: "25000",
      houseRent: "10000",
      medicalAllowance: "2000",
      transportAllowance: "1500",
      performanceBonus: "3000",
      overtimeAmount: "0",
      otherAllowances: "1000",
      incomeTax: "2500",
      providentFund: "1250",
      loanRepayment: "0",
      absentDeduction: "0",
      otherDeductions: "500",
      accountNumber: "12345678901234",
      bankName: "Bangladesh Bank",
      paymentMethod: "bank",
    }
  });

  // Template form setup
  const templateForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      layout: '1',
      language: 'both',
      template: 'standard',
      includeLogo: true,
      includeSignature: true,
      includeQRCode: true,
      includeWatermark: true,
      includePaySlip: true
    }
  });

  // Handle form submission for generating pay sheet
  const onGenerateSubmit = (paySheetData: z.infer<typeof paySheetSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Pay Sheet Data:", paySheetData);
    console.log("Template Data:", templateData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "পে-শীট তৈরি হয়েছে",
        description: "আপনার পে-শীট সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const paySheetElement = document.getElementById('pay-sheet-preview');
    if (!paySheetElement) return;

    const canvas = await html2canvas(paySheetElement, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Determine PDF dimensions based on A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions based on layout
    const layout = templateForm.getValues('layout');
    
    if (layout === '1') {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    } else if (layout === '2') {
      const imgWidth = pdfWidth;
      const imgHeight = pdfHeight / 2;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.addImage(imgData, 'PNG', 0, imgHeight, imgWidth, imgHeight);
    } else if (layout === '4') {
      const imgWidth = pdfWidth / 2;
      const imgHeight = pdfHeight / 2;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.addImage(imgData, 'PNG', imgWidth, 0, imgWidth, imgHeight);
      pdf.addImage(imgData, 'PNG', 0, imgHeight, imgWidth, imgHeight);
      pdf.addImage(imgData, 'PNG', imgWidth, imgHeight, imgWidth, imgHeight);
    } else if (layout === '9') {
      const imgWidth = pdfWidth / 3;
      const imgHeight = pdfHeight / 3;
      
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          pdf.addImage(
            imgData, 
            'PNG', 
            col * imgWidth, 
            row * imgHeight, 
            imgWidth, 
            imgHeight
          );
        }
      }
    }

    pdf.save(`pay-sheet-${paySheetForm.getValues('teacherId')}-${paySheetForm.getValues('monthYear')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার পে-শীট পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    paySheetForm.reset();
    templateForm.reset();
  };
  
  // Import teachers handler
  const handleImportTeachers = () => {
    toast({
      title: "আমদানি সফল",
      description: "ডাটাবেস থেকে ৫ জন শিক্ষক আমদানি করা হয়েছে",
    });
    
    setSelectedTeachers(["1", "2", "3", "4", "5"]);
  };

  // Define tabs for the mobile view
  const tabItems = [
    { id: "generate", label: "জেনারেট", icon: "add_to_photos" },
    { id: "batch", label: "ব্যাচ", icon: "groups" },
    { id: "templates", label: "টেমপ্লেট", icon: "dashboard_customize" },
    { id: "history", label: "হিস্ট্রি", icon: "history" },
  ];

  return (
    <AppShell>
      <MobilePageLayout
        title="পে-শীট"
        description="শিক্ষক ও কর্মচারীদের বেতন শীট তৈরি করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(paySheetForm.getValues(), templateForm.getValues()),
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
                    <span className="material-icons mr-2">person</span>
                    শিক্ষকের বিবরণ
                  </CardTitle>
                  <CardDescription className="text-base">
                    পে-শীটের জন্য শিক্ষক/কর্মচারীর প্রয়োজনীয় তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...paySheetForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="প্রাথমিক তথ্য" 
                        icon="person"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={paySheetForm.control}
                            name="teacherName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">শিক্ষকের নাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={paySheetForm.control}
                            name="teacherNameBn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">শিক্ষকের নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={paySheetForm.control}
                              name="teacherId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">শিক্ষকের আইডি</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="badge" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paySheetForm.control}
                              name="monthYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">মাস ও বছর</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="calendar_month" type="month" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={paySheetForm.control}
                              name="position"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">পদবি</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="পদবি নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Principal">অধ্যক্ষ</SelectItem>
                                      <SelectItem value="Vice Principal">উপাধ্যক্ষ</SelectItem>
                                      <SelectItem value="Senior Teacher">সিনিয়র শিক্ষক</SelectItem>
                                      <SelectItem value="Assistant Teacher">সহকারী শিক্ষক</SelectItem>
                                      <SelectItem value="Junior Teacher">জুনিয়র শিক্ষক</SelectItem>
                                      <SelectItem value="Office Assistant">অফিস সহকারী</SelectItem>
                                      <SelectItem value="Accountant">হিসাবরক্ষক</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paySheetForm.control}
                              name="department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">বিভাগ</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Mathematics">গণিত</SelectItem>
                                      <SelectItem value="Science">বিজ্ঞান</SelectItem>
                                      <SelectItem value="Bangla">বাংলা</SelectItem>
                                      <SelectItem value="English">ইংরেজি</SelectItem>
                                      <SelectItem value="Social Science">সমাজ বিজ্ঞান</SelectItem>
                                      <SelectItem value="Islamic Studies">ইসলামিক স্টাডিজ</SelectItem>
                                      <SelectItem value="Administration">প্রশাসন</SelectItem>
                                      <SelectItem value="Accounts">হিসাব বিভাগ</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </FormSection>
                      
                      {/* Earnings Section */}
                      <FormSection 
                        title="আয় সমূহ" 
                        icon="payments"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={paySheetForm.control}
                            name="basicSalary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">মূল বেতন</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="payments" type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={paySheetForm.control}
                              name="houseRent"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">বাড়ি ভাড়া</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="home" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paySheetForm.control}
                              name="medicalAllowance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">চিকিৎসা ভাতা</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="medication" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={paySheetForm.control}
                              name="transportAllowance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">যাতায়াত ভাতা</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="directions_bus" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paySheetForm.control}
                              name="performanceBonus"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">পারফরম্যান্স বোনাস</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="emoji_events" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={paySheetForm.control}
                              name="overtimeAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">ওভারটাইম</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="schedule" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paySheetForm.control}
                              name="otherAllowances"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">অন্যান্য ভাতা</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="add_card" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </FormSection>
                      
                      {/* Deductions Section */}
                      <FormSection 
                        title="কর্তন সমূহ" 
                        icon="money_off"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={paySheetForm.control}
                              name="incomeTax"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">আয়কর</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="receipt_long" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paySheetForm.control}
                              name="providentFund"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">প্রভিডেন্ট ফান্ড</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="savings" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={paySheetForm.control}
                              name="loanRepayment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">ঋণ পরিশোধ</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="account_balance" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paySheetForm.control}
                              name="absentDeduction"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">অনুপস্থিতি কর্তন</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="event_busy" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={paySheetForm.control}
                            name="otherDeductions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">অন্যান্য কর্তন</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="remove_circle_outline" type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Payment Information */}
                      <FormSection 
                        title="পেমেন্ট তথ্য" 
                        icon="account_balance_wallet"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={paySheetForm.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">পেমেন্ট পদ্ধতি</FormLabel>
                                <FormControl>
                                  <RadioGroup 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                    className="flex gap-4"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="cash" id="cash" />
                                      <label htmlFor="cash">নগদ</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="bank" id="bank" />
                                      <label htmlFor="bank">ব্যাংক</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="mobile" id="mobile" />
                                      <label htmlFor="mobile">মোবাইল ব্যাংকিং</label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {paySheetForm.watch("paymentMethod") === "bank" && (
                            <>
                              <FormField
                                control={paySheetForm.control}
                                name="bankName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base">ব্যাংকের নাম</FormLabel>
                                    <FormControl>
                                      <MobileInput leftIcon="account_balance" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={paySheetForm.control}
                                name="accountNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base">অ্যাকাউন্ট নম্বর</FormLabel>
                                    <FormControl>
                                      <MobileInput leftIcon="credit_card" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                        </div>
                      </FormSection>
                    </div>
                  </Form>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-primary flex items-center">
                    <span className="material-icons mr-2">tune</span>
                    পে-শীট সেটিংস
                  </CardTitle>
                  <CardDescription className="text-base">
                    ডকুমেন্টের ফরম্যাট এবং লেআউট বিকল্পসমূহ
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...templateForm}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={templateForm.control}
                          name="layout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">লেআউট</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="mobile-select">
                                    <SelectValue placeholder="লেআউট নির্বাচন করুন" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">একক (১টি)</SelectItem>
                                  <SelectItem value="2">দ্বিগুণ (২টি)</SelectItem>
                                  <SelectItem value="4">চতুর্গুণ (৪টি)</SelectItem>
                                  <SelectItem value="9">নয়গুণ (৯টি)</SelectItem>
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
                      </div>
                      
                      <FormField
                        control={templateForm.control}
                        name="template"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">টেমপ্লেট স্টাইল</FormLabel>
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
                                <SelectItem value="simple">সাধারণ</SelectItem>
                                <SelectItem value="custom">কাস্টম</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-2">
                        <FormField
                          control={templateForm.control}
                          name="includeLogo"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">প্রতিষ্ঠানের লোগো</FormLabel>
                                <FormDescription>
                                  পে-শীটে প্রতিষ্ঠানের লোগো দেখাবে
                                </FormDescription>
                              </div>
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
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">অধ্যক্ষের স্বাক্ষর</FormLabel>
                                <FormDescription>
                                  পে-শীটে অধ্যক্ষের স্বাক্ষর দেখাবে
                                </FormDescription>
                              </div>
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
                          name="includeQRCode"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">QR কোড</FormLabel>
                                <FormDescription>
                                  পে-শীটে ভেরিফিকেশন QR কোড দেখাবে
                                </FormDescription>
                              </div>
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
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">ওয়াটারমার্ক</FormLabel>
                                <FormDescription>
                                  পে-শীটে প্রতিষ্ঠানের ওয়াটারমার্ক দেখাবে
                                </FormDescription>
                              </div>
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
                          name="includePaySlip"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">পে-স্লিপ অংশ</FormLabel>
                                <FormDescription>
                                  পে-শীটে বিচ্ছিন্ন করার যোগ্য পে-স্লিপ অংশ যোগ করবে
                                </FormDescription>
                              </div>
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
                    </div>
                  </Form>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between mb-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-2"
                  onClick={() => setPreviewMode(false)}
                >
                  <span className="material-icons">edit</span>
                  এডিট করুন
                </Button>
                <Button 
                  variant="default" 
                  size="lg"
                  className="gap-2"
                  onClick={generatePDF}
                >
                  <span className="material-icons">picture_as_pdf</span>
                  পিডিএফ ডাউনলোড
                </Button>
              </div>
              
              {/* Preview Section */}
              <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-2xl" id="pay-sheet-preview">
                <div className="text-center mb-6">
                  {templateForm.getValues("includeLogo") && (
                    <div className="flex justify-center mb-4">
                      <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-white">
                        <span className="material-icons text-4xl">school</span>
                      </div>
                    </div>
                  )}
                  <h1 className="text-2xl font-bold text-primary">
                    ঢাকা পাবলিক স্কুল অ্যান্ড কলেজ
                  </h1>
                  <p className="text-gray-500">ঢাকা, বাংলাদেশ</p>
                  
                  <div className="mt-4 py-2 px-4 bg-primary/10 rounded-lg inline-block">
                    <h2 className="text-xl font-semibold text-primary">বেতন শীট</h2>
                    <p className="text-sm">
                      {new Date(paySheetForm.getValues("monthYear")).toLocaleDateString('bn-BD', {year: 'numeric', month: 'long'})}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-b py-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">শিক্ষকের নাম:</p>
                      <p className="font-medium">{paySheetForm.getValues("teacherName")}</p>
                      <p className="font-medium">{paySheetForm.getValues("teacherNameBn")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">আইডি:</p>
                      <p className="font-medium">{paySheetForm.getValues("teacherId")}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-gray-500">পদবি:</p>
                      <p className="font-medium">{paySheetForm.getValues("position")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">বিভাগ:</p>
                      <p className="font-medium">{paySheetForm.getValues("department")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-3">আয় সমূহ</h3>
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">মূল বেতন</td>
                            <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("basicSalary")).toLocaleString()}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">বাড়ি ভাড়া</td>
                            <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("houseRent") || "0").toLocaleString()}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">চিকিৎসা ভাতা</td>
                            <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("medicalAllowance") || "0").toLocaleString()}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">যাতায়াত ভাতা</td>
                            <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("transportAllowance") || "0").toLocaleString()}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">পারফরম্যান্স বোনাস</td>
                            <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("performanceBonus") || "0").toLocaleString()}</td>
                          </tr>
                          {(parseFloat(paySheetForm.getValues("overtimeAmount") || "0") > 0) && (
                            <tr className="border-b">
                              <td className="py-2">ওভারটাইম</td>
                              <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("overtimeAmount")).toLocaleString()}</td>
                            </tr>
                          )}
                          {(parseFloat(paySheetForm.getValues("otherAllowances") || "0") > 0) && (
                            <tr className="border-b">
                              <td className="py-2">অন্যান্য ভাতা</td>
                              <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("otherAllowances")).toLocaleString()}</td>
                            </tr>
                          )}
                          <tr className="border-b font-bold">
                            <td className="py-2">মোট আয়</td>
                            <td className="py-2 text-right">৳ {calculateTotal(paySheetForm.getValues()).totalEarnings.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-3">কর্তন সমূহ</h3>
                      <table className="w-full">
                        <tbody>
                          {(parseFloat(paySheetForm.getValues("incomeTax") || "0") > 0) && (
                            <tr className="border-b">
                              <td className="py-2">আয়কর</td>
                              <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("incomeTax")).toLocaleString()}</td>
                            </tr>
                          )}
                          {(parseFloat(paySheetForm.getValues("providentFund") || "0") > 0) && (
                            <tr className="border-b">
                              <td className="py-2">প্রভিডেন্ট ফান্ড</td>
                              <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("providentFund")).toLocaleString()}</td>
                            </tr>
                          )}
                          {(parseFloat(paySheetForm.getValues("loanRepayment") || "0") > 0) && (
                            <tr className="border-b">
                              <td className="py-2">ঋণ পরিশোধ</td>
                              <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("loanRepayment")).toLocaleString()}</td>
                            </tr>
                          )}
                          {(parseFloat(paySheetForm.getValues("absentDeduction") || "0") > 0) && (
                            <tr className="border-b">
                              <td className="py-2">অনুপস্থিতি কর্তন</td>
                              <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("absentDeduction")).toLocaleString()}</td>
                            </tr>
                          )}
                          {(parseFloat(paySheetForm.getValues("otherDeductions") || "0") > 0) && (
                            <tr className="border-b">
                              <td className="py-2">অন্যান্য কর্তন</td>
                              <td className="py-2 text-right">৳ {parseFloat(paySheetForm.getValues("otherDeductions")).toLocaleString()}</td>
                            </tr>
                          )}
                          <tr className="border-b font-bold">
                            <td className="py-2">মোট কর্তন</td>
                            <td className="py-2 text-right">৳ {calculateTotal(paySheetForm.getValues()).totalDeductions.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center py-2 font-bold text-lg">
                      <span>নিট প্রদেয় বেতন:</span>
                      <span className="text-primary">৳ {calculateTotal(paySheetForm.getValues()).netSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-sm text-gray-500">
                      <span>পেমেন্ট পদ্ধতি:</span>
                      <span>
                        {paySheetForm.getValues("paymentMethod") === "cash" ? "নগদ" : 
                         paySheetForm.getValues("paymentMethod") === "bank" ? "ব্যাংক" : "মোবাইল ব্যাংকিং"}
                      </span>
                    </div>
                    
                    {paySheetForm.getValues("paymentMethod") === "bank" && (
                      <div className="text-sm text-gray-500 mt-1">
                        <p>ব্যাংক: {paySheetForm.getValues("bankName")}</p>
                        <p>অ্যাকাউন্ট নম্বর: {paySheetForm.getValues("accountNumber")}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {templateForm.getValues("includePaySlip") && (
                  <div className="mt-8 border-t border-dashed pt-4">
                    <div className="text-center text-sm text-gray-500 mb-2">
                      ----------------------------- কাটার রেখা -----------------------------
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium">বেতন প্রাপ্তি রসিদ</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {new Date(paySheetForm.getValues("monthYear")).toLocaleDateString('bn-BD', {year: 'numeric', month: 'long'})}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>নাম: {paySheetForm.getValues("teacherName")}</span>
                      <span>আইডি: {paySheetForm.getValues("teacherId")}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span>পদবি: {paySheetForm.getValues("position")}</span>
                      <span>বিভাগ: {paySheetForm.getValues("department")}</span>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span>মোট বেতন:</span>
                      <span>৳ {calculateTotal(paySheetForm.getValues()).netSalary.toLocaleString()}</span>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="border-t border-gray-300 pt-2">
                          <p className="text-sm">প্রাপকের স্বাক্ষর</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-gray-300 pt-2">
                          <p className="text-sm">প্রদানকারীর স্বাক্ষর</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {templateForm.getValues("includeQRCode") && (
                  <div className="absolute bottom-4 right-4 h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                    <span className="material-icons text-gray-400">qr_code_2</span>
                  </div>
                )}
                
                {templateForm.getValues("includeWatermark") && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <span className="material-icons text-9xl text-primary">school</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </MobileTabContent>
        
        <MobileTabContent value="batch" activeTab={activeTab}>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-primary flex items-center">
                <span className="material-icons mr-2">groups</span>
                একসাথে পে-শীট তৈরি করুন
              </CardTitle>
              <CardDescription>
                একই সাথে একাধিক শিক্ষকের বেতন শীট তৈরি করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <h3 className="text-base font-medium">শিক্ষক নির্বাচন করুন</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs h-8 px-2 gap-1"
                      onClick={handleImportTeachers}
                    >
                      <span className="material-icons text-sm">download</span>
                      আমদানি করুন
                    </Button>
                  </div>
                  
                  {selectedTeachers.length === 0 ? (
                    <div className="border rounded-lg p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <span className="material-icons text-4xl text-muted-foreground">person_search</span>
                      </div>
                      <p className="text-muted-foreground">
                        কোন শিক্ষক নির্বাচন করা হয়নি। ডাটাবেস থেকে আমদানি করুন বা নতুন তৈরি করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg divide-y">
                      {selectedTeachers.map((id) => (
                        <div key={id} className="flex items-center p-3 justify-between">
                          <div className="flex items-center gap-3">
                            <span className="material-icons text-muted-foreground">person</span>
                            <div>
                              <p className="font-medium">শিক্ষক #{id}</p>
                              <p className="text-sm text-muted-foreground">
                                {["Principal", "Vice Principal", "Senior Teacher", "Assistant Teacher", "Junior Teacher"][Math.floor(Math.random() * 5)]}
                              </p>
                            </div>
                          </div>
                          <Checkbox />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium mb-3">মাস নির্বাচন করুন</h3>
                  <MobileInput 
                    leftIcon="calendar_month" 
                    type="month" 
                    defaultValue="2023-05"
                  />
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-3">ব্যাচ প্রোসেসিং অপশন</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">একই টেমপ্লেট ব্যবহার করুন</FormLabel>
                        <FormDescription>
                          সব শিক্ষকের জন্য একই ফরম্যাট ব্যবহার করুন
                        </FormDescription>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">একটি ফাইলে সংরক্ষণ করুন</FormLabel>
                        <FormDescription>
                          সবগুলো পে-শীট একটি পিডিএফ ফাইলে রাখুন
                        </FormDescription>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button className="w-full gap-2">
                    <span className="material-icons">dynamic_feed</span>
                    ব্যাচ প্রসেস শুরু করুন
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </MobileTabContent>
        
        <MobileTabContent value="templates" activeTab={activeTab}>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-primary flex items-center">
                <span className="material-icons mr-2">dashboard_customize</span>
                টেমপ্লেট নির্বাচন
              </CardTitle>
              <CardDescription>
                পূর্বনির্ধারিত টেমপ্লেট থেকে বেছে নিন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RadioGroup defaultValue="standard" className="gap-3">
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="standard" id="standard" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="standard"
                        className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        স্ট্যান্ডার্ড পে-শীট
                      </label>
                      <p className="text-sm text-muted-foreground">
                        সাধারণ বেতন শীট টেমপ্লেট
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="detailed" id="detailed" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="detailed"
                        className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        বিস্তারিত পে-শীট
                      </label>
                      <p className="text-sm text-muted-foreground">
                        অতিরিক্ত বিভাজন এবং তথ্য সহ বিস্তারিত বেতন শীট
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="simple" id="simple" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="simple"
                        className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        সাধারণ পে-শীট
                      </label>
                      <p className="text-sm text-muted-foreground">
                        ন্যূনতম তথ্য সহ সহজ বেতন শীট
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium mb-3">কালার স্কিম</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border rounded-lg p-3 flex flex-col items-center space-y-2 cursor-pointer hover:bg-accent">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">নীল</span>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex flex-col items-center space-y-2 cursor-pointer hover:bg-accent">
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                      <span className="text-sm">সবুজ</span>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex flex-col items-center space-y-2 cursor-pointer hover:bg-accent">
                      <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                      <span className="text-sm">লাল</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-3">ফন্ট স্টাইল</h3>
                  <Select defaultValue="kalpurush">
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="ফন্ট নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kalpurush">কালপুরুষ</SelectItem>
                      <SelectItem value="solaiman">সোলায়মান লিপি</SelectItem>
                      <SelectItem value="nikosh">নিকোশ</SelectItem>
                      <SelectItem value="arial">Arial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </MobileTabContent>
        
        <MobileTabContent value="history" activeTab={activeTab}>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-primary flex items-center">
                <span className="material-icons mr-2">history</span>
                সাম্প্রতিক তৈরি করা পে-শীট
              </CardTitle>
              <CardDescription>
                আপনার সাম্প্রতিক তৈরি করা বেতন শীট দেখুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Empty state */}
                {true && (
                  <div className="border rounded-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <span className="material-icons text-4xl text-muted-foreground">history</span>
                    </div>
                    <p className="text-muted-foreground">
                      আপনি এখনও কোন বেতন শীট তৈরি করেননি।
                    </p>
                  </div>
                )}
                
                {/* Items will be shown here when history is available */}
              </div>
            </CardContent>
          </Card>
        </MobileTabContent>
      </MobilePageLayout>
    </AppShell>
  );
}