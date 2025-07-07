import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Download, 
  Eye, 
  QrCode, 
  Send, 
  Upload, 
  FileText, 
  Calculator,
  CreditCard,
  Smartphone,
  Printer,
  Share2,
  CheckCircle,
  AlertCircle,
  Banknote,
  Receipt,
  Users,
  TrendingUp
} from 'lucide-react';

// Enhanced schema for Bangladesh context fee receipt
const feeReceiptSchema = z.object({
  receiptNo: z.string().min(1, { message: "রসিদ নম্বর প্রয়োজন" }),
  studentName: z.string().min(2, { message: "শিক্ষার্থীর নাম প্রয়োজন" }),
  studentNameBn: z.string().min(2, { message: "বাংলায় নাম প্রয়োজন" }),
  studentId: z.string().min(1, { message: "শিক্ষার্থী আইডি প্রয়োজন" }),
  className: z.string().min(1, { message: "শ্রেণী প্রয়োজন" }),
  section: z.string().min(1, { message: "শাখা প্রয়োজন" }),
  rollNumber: z.string().min(1, { message: "রোল নম্বর প্রয়োজন" }),
  paymentDate: z.string().min(1, { message: "পেমেন্ট তারিখ প্রয়োজন" }),
  paymentMethod: z.string().min(1, { message: "পেমেন্ট পদ্ধতি প্রয়োজন" }),
  transactionId: z.string().optional(),
  mobileNumber: z.string().optional(),
  feeType: z.string().min(1, { message: "ফি ধরন প্রয়োজন" }),
  academicYear: z.string().min(1, { message: "শিক্ষাবর্ষ প্রয়োজন" }),
  month: z.string().min(1, { message: "মাস প্রয়োজন" }),
  guardianName: z.string().min(2, { message: "অভিভাবকের নাম প্রয়োজন" }),
  guardianPhone: z.string().min(11, { message: "অভিভাবকের ফোন নম্বর প্রয়োজন" }),
  totalAmount: z.string().min(1, { message: "মোট পরিমাণ প্রয়োজন" }),
  paidAmount: z.string().min(1, { message: "প্রদত্ত পরিমাণ প্রয়োজন" }),
  dueAmount: z.string().optional(),
  notes: z.string().optional(),
  templateType: z.string().default("standard"),
  includeQR: z.boolean().default(true),
  sendSMS: z.boolean().default(false),
  feeItems: z.array(z.object({
    description: z.string(),
    descriptionBn: z.string(),
    amount: z.string(),
    category: z.string()
  })).min(1, { message: "কমপক্ষে একটি ফি আইটেম প্রয়োজন" })
});

// Bangladesh payment methods
const paymentMethods = [
  { value: "cash", label: "নগদ টাকা", labelEn: "Cash", icon: Banknote },
  { value: "bkash", label: "বিকাশ", labelEn: "bKash", icon: Smartphone },
  { value: "nagad", label: "নগদ", labelEn: "Nagad", icon: Smartphone },
  { value: "rocket", label: "রকেট", labelEn: "Rocket", icon: Smartphone },
  { value: "bank", label: "ব্যাংক ট্রান্সফার", labelEn: "Bank Transfer", icon: CreditCard },
  { value: "card", label: "ডেবিট/ক্রেডিট কার্ড", labelEn: "Debit/Credit Card", icon: CreditCard }
];

// Fee categories for Bangladesh context
const feeCategories = [
  { value: "tuition", label: "মাসিক বেতন", labelEn: "Monthly Tuition" },
  { value: "admission", label: "ভর্তি ফি", labelEn: "Admission Fee" },
  { value: "exam", label: "পরীক্ষার ফি", labelEn: "Examination Fee" },
  { value: "development", label: "উন্নয়ন ফি", labelEn: "Development Fee" },
  { value: "library", label: "লাইব্রেরি ফি", labelEn: "Library Fee" },
  { value: "sports", label: "খেলাধুলা ফি", labelEn: "Sports Fee" },
  { value: "lab", label: "ল্যাব ফি", labelEn: "Laboratory Fee" },
  { value: "transport", label: "পরিবহন ফি", labelEn: "Transport Fee" },
  { value: "hostel", label: "হোস্টেল ফি", labelEn: "Hostel Fee" },
  { value: "book", label: "বই ফি", labelEn: "Book Fee" },
  { value: "uniform", label: "ইউনিফর্ম ফি", labelEn: "Uniform Fee" },
  { value: "computer", label: "কম্পিউটার ফি", labelEn: "Computer Fee" }
];

// Template types for different institutions
const templateTypes = [
  { value: "standard", label: "সাধারণ টেমপ্লেট", description: "বেসিক স্কুল/কলেজের জন্য" },
  { value: "government", label: "সরকারি টেমপ্লেট", description: "সরকারি শিক্ষা প্রতিষ্ঠানের জন্য" },
  { value: "private", label: "বেসরকারি টেমপ্লেট", description: "বেসরকারি শিক্ষা প্রতিষ্ঠানের জন্য" },
  { value: "madrasa", label: "মাদ্রাসা টেমপ্লেট", description: "মাদ্রাসা শিক্ষা প্রতিষ্ঠানের জন্য" },
  { value: "technical", label: "কারিগরি টেমপ্লেট", description: "কারিগরি শিক্ষা প্রতিষ্ঠানের জন্য" }
];

// Sample fee items data for Bangladesh context
const initialFeeItems = [
  { description: "Monthly Tuition", descriptionBn: "মাসিক বেতন", amount: "৩,৫০০", category: "tuition" },
  { description: "Examination Fee", descriptionBn: "পরীক্ষার ফি", amount: "১,০০০", category: "exam" },
  { description: "Development Fee", descriptionBn: "উন্নয়ন ফি", amount: "৫০০", category: "development" },
  { description: "Library Fee", descriptionBn: "লাইব্রেরি ফি", amount: "২০০", category: "library" }
];

// Months in Bengali
const bengaliMonths = [
  { value: "01", label: "জানুয়ারি", labelEn: "January" },
  { value: "02", label: "ফেব্রুয়ারি", labelEn: "February" },
  { value: "03", label: "মার্চ", labelEn: "March" },
  { value: "04", label: "এপ্রিল", labelEn: "April" },
  { value: "05", label: "মে", labelEn: "May" },
  { value: "06", label: "জুন", labelEn: "June" },
  { value: "07", label: "জুলাই", labelEn: "July" },
  { value: "08", label: "আগস্ট", labelEn: "August" },
  { value: "09", label: "সেপ্টেম্বর", labelEn: "September" },
  { value: "10", label: "অক্টোবর", labelEn: "October" },
  { value: "11", label: "নভেম্বর", labelEn: "November" },
  { value: "12", label: "ডিসেম্বর", labelEn: "December" }
];

export default function FeeReceiptsPage() {
  const isMobile = useMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [csvData, setCsvData] = useState<any[]>([]);
  const { toast } = useToast();

  // Fee receipt form setup with enhanced Bangladesh context
  const feeReceiptForm = useForm<z.infer<typeof feeReceiptSchema>>({
    resolver: zodResolver(feeReceiptSchema),
    defaultValues: {
      receiptNo: "FR" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      studentName: "Abdul Karim",
      studentNameBn: "আব্দুল করিম",
      studentId: "2025001",
      className: "Class X",
      section: "A",
      rollNumber: "15",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "bkash",
      transactionId: "",
      mobileNumber: "",
      feeType: "tuition",
      academicYear: "২০২৫",
      month: new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : `${new Date().getMonth() + 1}`,
      guardianName: "Mohammad Rahman",
      guardianPhone: "01712345678",
      totalAmount: "৫,২০০",
      paidAmount: "৫,২০০",
      dueAmount: "০",
      notes: "সকল ফি পরিশোধিত",
      templateType: "standard",
      includeQR: true,
      sendSMS: false,
      feeItems: initialFeeItems
    }
  });

  // Handle form submission
  const onReceiptSubmit = (data: z.infer<typeof feeReceiptSchema>) => {
    setIsLoading(true);
    
    console.log("Receipt Data:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "ফি রসিদ তৈরি হয়েছে",
        description: "আপনার ফি রসিদ সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const receiptElement = document.getElementById('receipt-preview');
    if (!receiptElement) return;

    const canvas = await html2canvas(receiptElement, {
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
    pdf.save(`fee-receipt-${feeReceiptForm.getValues('receiptNo')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার ফি রসিদ পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    feeReceiptForm.reset();
  };
  
  // Calculate total amount
  const calculateTotalAmount = () => {
    const feeItems = feeReceiptForm.getValues('feeItems') || [];
    let total = 0;
    
    feeItems.forEach(item => {
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
              <a href="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">ফি রসিদ সিস্টেম</span>
            </nav>
            
            {/* Hero Header with Status Indicator */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 rounded-2xl p-8 border border-green-100 dark:border-green-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">receipt</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        ফি রসিদ সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        শিক্ষার্থীদের ফি পেমেন্ট রসিদ তৈরি করুন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>পেমেন্ট সিস্টেম সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>নিরাপদ লেনদেন</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                    onClick={() => feeReceiptForm.handleSubmit(onReceiptSubmit)()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-icons mr-2 animate-spin">autorenew</span>
                        জেনারেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">receipt</span>
                        রসিদ তৈরি করুন
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
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আজকের সংগ্রহ</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৳ ১,২৫,০০০
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">৪৫টি রসিদ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-teal-600 dark:text-teal-400 text-xl">receipt_long</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট রসিদ</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৮৯৫
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
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">account_balance_wallet</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অনলাইন পেমেন্ট</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৬৮%
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">মোট পেমেন্টের</p>
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
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">বকেয়া ফি</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ৳ ৮৫,০০০
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">২৮ জন শিক্ষার্থী</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!previewMode ? (
            <div className="flex flex-col gap-6">
              {/* Enhanced Receipt Configuration - Dieter Rams' Minimalism */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-green-600 dark:text-green-400 text-xl">settings</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        ফি রসিদ কনফিগারেশন
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        শিক্ষার্থীর ফি পেমেন্ট রসিদের বিস্তারিত তথ্য প্রদান করুন
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Form {...feeReceiptForm}>
                    <div className="space-y-6">
                      {/* Student Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="material-icons text-green-500">person</span>
                          শিক্ষার্থীর তথ্য
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={feeReceiptForm.control}
                            name="studentName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">শিক্ষার্থীর নাম</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="শিক্ষার্থীর পূর্ণ নাম"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={feeReceiptForm.control}
                            name="studentId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">শিক্ষার্থী আইডি</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="2025001"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={feeReceiptForm.control}
                            name="className"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">শ্রেণী</FormLabel>
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
                          
                          <FormField
                            control={feeReceiptForm.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">মোট পরিমাণ</FormLabel>
                                <FormControl>
                                  <input 
                                    {...field}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="৫,০০০"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <Button 
                          type="button"
                          onClick={() => feeReceiptForm.handleSubmit(onReceiptSubmit)()}
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
                              <span className="material-icons mr-2">receipt</span>
                              রসিদ তৈরি করুন
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
                          ফি রসিদ প্রিভিউ
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          আপনার তৈরি করা ফি রসিদ
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
                  <div id="receipt-preview" className="p-8 bg-white">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">ফি পেমেন্ট রসিদ</h1>
                      <p className="text-sm text-gray-600">
                        রসিদ নং: {feeReceiptForm.getValues('receiptNo')} | 
                        তারিখ: {feeReceiptForm.getValues('paymentDate')}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold">শিক্ষার্থীর নাম: {feeReceiptForm.getValues('studentName')}</p>
                          <p>আইডি: {feeReceiptForm.getValues('studentId')}</p>
                          <p>শ্রেণী: {feeReceiptForm.getValues('className')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">মোট পরিমাণ: ৳ {feeReceiptForm.getValues('amount')}</p>
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