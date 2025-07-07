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

// Define schema for office order information
const officeOrderSchema = z.object({
  orderNumber: z.string().min(1, { message: "Order number is required" }),
  orderDate: z.string().min(1, { message: "Order date is required" }),
  subject: z.string().min(5, { message: "Subject is required" }),
  subjectInBangla: z.string().optional(),
  orderType: z.string().min(1, { message: "Order type is required" }),
  content: z.string().min(10, { message: "Order content is required" }),
  contentInBangla: z.string().optional(),
  effectiveDate: z.string().min(1, { message: "Effective date is required" }),
  issuedBy: z.string().min(2, { message: "Issuer name is required" }),
  designation: z.string().min(2, { message: "Issuer designation is required" }),
  recipients: z.array(z.string()).min(1, { message: "At least one recipient required" }),
  schoolName: z.string().min(2, { message: "School name is required" }),
  schoolAddress: z.string().min(5, { message: "School address is required" })
});

// Sample recipients data
const initialRecipients = [
  "সকল শিক্ষক",
  "সকল কর্মচারী", 
  "অধ্যক্ষ",
  "উপাধ্যক্ষ",
  "হিসাব শাখা"
];

export default function OfficeOrdersPage() {
  const isMobile = useMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Office order form setup
  const orderForm = useForm<z.infer<typeof officeOrderSchema>>({
    resolver: zodResolver(officeOrderSchema),
    defaultValues: {
      orderNumber: "AO-2025-" + Math.random().toString(36).substr(2, 3).toUpperCase(),
      orderDate: new Date().toISOString().split('T')[0],
      subject: "Class Teacher Appointment for Academic Year 2025-2026",
      subjectInBangla: "শিক্ষাবর্ষ ২০২৫-২০২৬ এর জন্য শ্রেণি শিক্ষক নিয়োগ সংক্রান্ত",
      orderType: "Administrative",
      content: "This is to notify all concerned that the following appointments have been made effective from June 1st, 2025. All appointed personnel are requested to coordinate with their respective department heads.",
      contentInBangla: "সংশ্লিষ্ট সবাইকে জানানো যাচ্ছে যে নিম্নলিখিত নিয়োগগুলি ১ জুন, ২০২৫ থেকে কার্যকর হবে।",
      effectiveDate: "2025-06-01",
      issuedBy: "Professor Mohammad Rahman",
      designation: "Principal",
      recipients: initialRecipients,
      schoolName: "Dhaka Public School",
      schoolAddress: "Mirpur-10, Dhaka-1216"
    }
  });

  // Handle form submission
  const onOrderSubmit = (data: z.infer<typeof officeOrderSchema>) => {
    setIsLoading(true);
    
    console.log("Office Order Data:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "অফিস অর্ডার তৈরি হয়েছে",
        description: "আপনার অফিস অর্ডার সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const orderElement = document.getElementById('office-order-preview');
    if (!orderElement) return;

    const canvas = await html2canvas(orderElement, {
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
    pdf.save(`office-order-${orderForm.getValues('orderNumber')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার অফিস অর্ডার পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    orderForm.reset();
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section - Don Norman's Clear Mental Model */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">অফিস অর্ডার সিস্টেম</span>
            </nav>
            
            {/* Hero Header with Status Indicator */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">assignment</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        অফিস অর্ডার সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        প্রশাসনিক নির্দেশনা ও আদেশ তৈরি করুন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>অর্ডার সিস্টেম সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>অনুমোদিত ফরম্যাট</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                    onClick={() => orderForm.handleSubmit(onOrderSubmit)()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-icons mr-2 animate-spin">autorenew</span>
                        জেনারেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">assignment</span>
                        অর্ডার তৈরি করুন
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-6 py-3 rounded-xl font-medium border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">assignment</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">এ মাসের অর্ডার</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৪৭
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">জারি করা হয়েছে</p>
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
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">বাস্তবায়িত</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৪২
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">৮৯% বাস্তবায়ন হার</p>
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
                          ৫
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">বাস্তবায়নের জন্য</p>
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
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অর্ডারের ধরন</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৮
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
              {/* Enhanced Office Order Configuration - Dieter Rams' Minimalism */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">settings</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        অফিস অর্ডার কনফিগারেশন
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        প্রশাসনিক আদেশের বিস্তারিত তথ্য প্রদান করুন
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Form {...orderForm}>
                    <div className="space-y-6">
                      {/* Order Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="material-icons text-blue-500">info</span>
                          অর্ডারের তথ্য
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={orderForm.control}
                            name="orderNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">অর্ডার নম্বর</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="AO-2025-001"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={orderForm.control}
                            name="orderDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">অর্ডারের তারিখ</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    type="date"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={orderForm.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">বিষয় (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Class Teacher Appointment"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={orderForm.control}
                            name="orderType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">অর্ডারের ধরন</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                      <SelectValue placeholder="অর্ডারের ধরন নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Administrative">প্রশাসনিক</SelectItem>
                                    <SelectItem value="Academic">একাডেমিক</SelectItem>
                                    <SelectItem value="Financial">আর্থিক</SelectItem>
                                    <SelectItem value="General">সাধারণ</SelectItem>
                                    <SelectItem value="Disciplinary">শৃঙ্খলামূলক</SelectItem>
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
                          onClick={() => orderForm.handleSubmit(onOrderSubmit)()}
                          disabled={isLoading}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                        >
                          {isLoading ? (
                            <>
                              <span className="material-icons mr-2 animate-spin">autorenew</span>
                              জেনারেট হচ্ছে...
                            </>
                          ) : (
                            <>
                              <span className="material-icons mr-2">assignment</span>
                              অর্ডার তৈরি করুন
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
                          অফিস অর্ডার প্রিভিউ
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          আপনার তৈরি করা অফিস অর্ডার
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={generatePDF}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
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
                  <div id="office-order-preview" className="p-8 bg-white">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">অফিস অর্ডার</h1>
                      <p className="text-sm text-gray-600">
                        অর্ডার নং: {orderForm.getValues('orderNumber')} | 
                        তারিখ: {orderForm.getValues('orderDate')}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold">বিষয়: {orderForm.getValues('subject')}</p>
                        <p className="font-semibold">বিষয় (বাংলা): {orderForm.getValues('subjectInBangla')}</p>
                        <p>ধরন: {orderForm.getValues('orderType')}</p>
                        <p>কার্যকর তারিখ: {orderForm.getValues('effectiveDate')}</p>
                      </div>
                      
                      <div className="mt-6">
                        <p className="font-semibold">বিষয়বস্তু:</p>
                        <p className="mt-2">{orderForm.getValues('content')}</p>
                        <p className="mt-2">{orderForm.getValues('contentInBangla')}</p>
                      </div>
                      
                      <div className="mt-6 text-right">
                        <p className="font-semibold">{orderForm.getValues('issuedBy')}</p>
                        <p>{orderForm.getValues('designation')}</p>
                        <p>{orderForm.getValues('schoolName')}</p>
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