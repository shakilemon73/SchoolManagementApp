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

// Define schema for pay sheet information
const paySheetSchema = z.object({
  employeeName: z.string().min(2, { message: "Employee name is required" }),
  employeeNameBn: z.string().optional(),
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  monthYear: z.string().min(1, { message: "Month and year are required" }),
  basicSalary: z.number().min(0, { message: "Basic salary must be positive" }),
  houseRent: z.number().min(0).optional(),
  medicalAllowance: z.number().min(0).optional(),
  transportAllowance: z.number().min(0).optional(),
  performanceBonus: z.number().min(0).optional(),
  overtimeAmount: z.number().min(0).optional(),
  incomeTax: z.number().min(0).optional(),
  providentFund: z.number().min(0).optional(),
  loanRepayment: z.number().min(0).optional(),
  absentDeduction: z.number().min(0).optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  paymentMethod: z.string().min(1, { message: "Payment method is required" })
});

export default function PaySheetsPage() {
  const isMobile = useMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Pay sheet form setup
  const paySheetForm = useForm<z.infer<typeof paySheetSchema>>({
    resolver: zodResolver(paySheetSchema),
    defaultValues: {
      employeeName: "Mohammad Rahman",
      employeeNameBn: "মোহাম্মদ রহমান",
      employeeId: "EMP-001",
      position: "Senior Teacher",
      department: "Mathematics",
      monthYear: new Date().toISOString().slice(0, 7),
      basicSalary: 45000,
      houseRent: 22500,
      medicalAllowance: 2000,
      transportAllowance: 1500,
      performanceBonus: 3000,
      overtimeAmount: 0,
      incomeTax: 4500,
      providentFund: 2250,
      loanRepayment: 0,
      absentDeduction: 0,
      accountNumber: "1234567890",
      bankName: "Dhaka Bank Limited",
      paymentMethod: "bank_transfer"
    }
  });

  // Calculate totals
  const calculateTotals = () => {
    const values = paySheetForm.getValues();
    const grossSalary = (values.basicSalary || 0) + 
                       (values.houseRent || 0) + 
                       (values.medicalAllowance || 0) + 
                       (values.transportAllowance || 0) + 
                       (values.performanceBonus || 0) + 
                       (values.overtimeAmount || 0);
    
    const totalDeductions = (values.incomeTax || 0) + 
                           (values.providentFund || 0) + 
                           (values.loanRepayment || 0) + 
                           (values.absentDeduction || 0);
    
    const netSalary = grossSalary - totalDeductions;
    
    return { grossSalary, totalDeductions, netSalary };
  };

  // Handle form submission
  const onPaySheetSubmit = (data: z.infer<typeof paySheetSchema>) => {
    setIsLoading(true);
    
    console.log("Pay Sheet Data:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "বেতন শীট তৈরি হয়েছে",
        description: "আপনার বেতন শীট সফলভাবে তৈরি হয়েছে",
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
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`pay-sheet-${paySheetForm.getValues('employeeId')}-${paySheetForm.getValues('monthYear')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার বেতন শীট পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    paySheetForm.reset();
  };

  const { grossSalary, totalDeductions, netSalary } = calculateTotals();

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section - Don Norman's Clear Mental Model */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">বেতন শীট সিস্টেম</span>
            </nav>
            
            {/* Hero Header with Status Indicator */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl p-8 border border-green-100 dark:border-green-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">payments</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        বেতন শীট সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        কর্মচারীদের বেতন ও ভাতা হিসাব করুন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>বেতন সিস্টেম সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>অনুমোদিত ফরম্যাট</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                    onClick={() => paySheetForm.handleSubmit(onPaySheetSubmit)()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-icons mr-2 animate-spin">autorenew</span>
                        জেনারেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">payments</span>
                        বেতন শীট তৈরি করুন
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-6 py-3 rounded-xl font-medium border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
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
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">payments</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">এ মাসের বেতন</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৩৫
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">কর্মচারী</p>
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
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">account_balance_wallet</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বেতন</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ১৫.৬ লক্ষ
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
                      <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-amber-600 dark:text-amber-400 text-xl">trending_up</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">বোনাস</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ১.২ লক্ষ
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">পারফরমেন্স বোনাস</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-red-600 dark:text-red-400 text-xl">remove_circle</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">কর্তন</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ২.৮ লক্ষ
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">কর ও ফান্ড</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!previewMode ? (
            <div className="flex flex-col gap-6">
              {/* Enhanced Pay Sheet Configuration - Dieter Rams' Minimalism */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-green-600 dark:text-green-400 text-xl">settings</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        বেতন শীট কনফিগারেশন
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        কর্মচারীর বেতন ও ভাতার বিস্তারিত তথ্য প্রদান করুন
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Form {...paySheetForm}>
                    <div className="space-y-6">
                      {/* Employee Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="material-icons text-green-500">person</span>
                          কর্মচারীর তথ্য
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={paySheetForm.control}
                            name="employeeName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">নাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="Mohammad Rahman"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={paySheetForm.control}
                            name="employeeNameBn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="মোহাম্মদ রহমান"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={paySheetForm.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">পদবি</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                      <SelectValue placeholder="পদবি নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Senior Teacher">সিনিয়র শিক্ষক</SelectItem>
                                    <SelectItem value="Assistant Teacher">সহকারী শিক্ষক</SelectItem>
                                    <SelectItem value="Junior Teacher">জুনিয়র শিক্ষক</SelectItem>
                                    <SelectItem value="Principal">অধ্যক্ষ</SelectItem>
                                    <SelectItem value="Vice Principal">উপাধ্যক্ষ</SelectItem>
                                    <SelectItem value="Administrative Officer">প্রশাসনিক কর্মকর্তা</SelectItem>
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
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">বিভাগ</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Mathematics">গণিত</SelectItem>
                                    <SelectItem value="Physics">পদার্থবিজ্ঞান</SelectItem>
                                    <SelectItem value="Chemistry">রসায়ন</SelectItem>
                                    <SelectItem value="Biology">জীববিজ্ঞান</SelectItem>
                                    <SelectItem value="English">ইংরেজি</SelectItem>
                                    <SelectItem value="Bangla">বাংলা</SelectItem>
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
                      
                      {/* Salary Summary Card */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <span className="material-icons text-green-600">calculate</span>
                          বেতন সারসংক্ষেপ
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">মোট আয়</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">৳ {grossSalary.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">মোট কর্তন</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">৳ {totalDeductions.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">নিট বেতন</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">৳ {netSalary.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <Button 
                          type="button"
                          onClick={() => paySheetForm.handleSubmit(onPaySheetSubmit)()}
                          disabled={isLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                        >
                          {isLoading ? (
                            <>
                              <span className="material-icons mr-2 animate-spin">autorenew</span>
                              জেনারেট হচ্ছে...
                            </>
                          ) : (
                            <>
                              <span className="material-icons mr-2">payments</span>
                              বেতন শীট তৈরি করুন
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
                          বেতন শীট প্রিভিউ
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          আপনার তৈরি করা বেতন শীট
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={generatePDF}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
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
                  <div id="pay-sheet-preview" className="p-8 bg-white">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">ঢাকা পাবলিক স্কুল</h1>
                      <h2 className="text-xl mb-2">বেতন শীট</h2>
                      <p className="text-sm text-gray-600">
                        মাস: {paySheetForm.getValues('monthYear')} | 
                        কর্মচারী আইডি: {paySheetForm.getValues('employeeId')}
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p><strong>নাম:</strong> {paySheetForm.getValues('employeeNameBn')}</p>
                          <p><strong>পদবি:</strong> {paySheetForm.getValues('position')}</p>
                          <p><strong>বিভাগ:</strong> {paySheetForm.getValues('department')}</p>
                        </div>
                        <div>
                          <p><strong>কর্মচারী আইডি:</strong> {paySheetForm.getValues('employeeId')}</p>
                          <p><strong>ব্যাংক:</strong> {paySheetForm.getValues('bankName')}</p>
                          <p><strong>একাউন্ট:</strong> {paySheetForm.getValues('accountNumber')}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-green-600">আয় সমূহ</h3>
                          <table className="w-full">
                            <tbody>
                              <tr className="border-b">
                                <td className="py-2">মূল বেতন</td>
                                <td className="py-2 text-right">৳ {paySheetForm.getValues('basicSalary').toLocaleString()}</td>
                              </tr>
                              {(paySheetForm.getValues('houseRent') || 0) > 0 && (
                                <tr className="border-b">
                                  <td className="py-2">বাড়ি ভাড়া</td>
                                  <td className="py-2 text-right">৳ {(paySheetForm.getValues('houseRent') || 0).toLocaleString()}</td>
                                </tr>
                              )}
                              {(paySheetForm.getValues('medicalAllowance') || 0) > 0 && (
                                <tr className="border-b">
                                  <td className="py-2">চিকিৎসা ভাতা</td>
                                  <td className="py-2 text-right">৳ {(paySheetForm.getValues('medicalAllowance') || 0).toLocaleString()}</td>
                                </tr>
                              )}
                              {(paySheetForm.getValues('transportAllowance') || 0) > 0 && (
                                <tr className="border-b">
                                  <td className="py-2">যাতায়াত ভাতা</td>
                                  <td className="py-2 text-right">৳ {(paySheetForm.getValues('transportAllowance') || 0).toLocaleString()}</td>
                                </tr>
                              )}
                              <tr className="border-t-2 font-bold">
                                <td className="py-2">মোট আয়</td>
                                <td className="py-2 text-right">৳ {grossSalary.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-red-600">কর্তন সমূহ</h3>
                          <table className="w-full">
                            <tbody>
                              {(paySheetForm.getValues('incomeTax') || 0) > 0 && (
                                <tr className="border-b">
                                  <td className="py-2">আয়কর</td>
                                  <td className="py-2 text-right">৳ {(paySheetForm.getValues('incomeTax') || 0).toLocaleString()}</td>
                                </tr>
                              )}
                              {(paySheetForm.getValues('providentFund') || 0) > 0 && (
                                <tr className="border-b">
                                  <td className="py-2">প্রভিডেন্ট ফান্ড</td>
                                  <td className="py-2 text-right">৳ {(paySheetForm.getValues('providentFund') || 0).toLocaleString()}</td>
                                </tr>
                              )}
                              {(paySheetForm.getValues('loanRepayment') || 0) > 0 && (
                                <tr className="border-b">
                                  <td className="py-2">ঋণ পরিশোধ</td>
                                  <td className="py-2 text-right">৳ {(paySheetForm.getValues('loanRepayment') || 0).toLocaleString()}</td>
                                </tr>
                              )}
                              <tr className="border-t-2 font-bold">
                                <td className="py-2">মোট কর্তন</td>
                                <td className="py-2 text-right">৳ {totalDeductions.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">নিট প্রদেয় বেতন:</span>
                          <span className="text-2xl font-bold text-blue-600">৳ {netSalary.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-8 text-right">
                        <p className="text-sm text-gray-600">প্রস্তুতকারী</p>
                        <p className="font-semibold">হিসাব বিভাগ</p>
                        <p>তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
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