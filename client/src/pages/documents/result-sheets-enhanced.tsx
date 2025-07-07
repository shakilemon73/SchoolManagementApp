import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  FormSection, 
  FormStepper, 
  FieldGroup, 
  ActionPanel, 
  PreviewPanel 
} from '@/components/ui/enhanced-form-layout';
import { 
  SmartInput, 
  SmartSelect, 
  SmartTextarea 
} from '@/components/ui/enhanced-input-components';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Enhanced result sheet schema
const resultSheetSchema = z.object({
  examName: z.string().min(2, { message: "পরীক্ষার নাম আবশ্যক" }),
  examType: z.string().min(1, { message: "পরীক্ষার ধরন নির্বাচন করুন" }),
  examYear: z.string().min(1, { message: "পরীক্ষার বছর আবশ্যক" }),
  session: z.string().min(1, { message: "সেশন আবশ্যক" }),
  className: z.string().min(1, { message: "শ্রেণি নির্বাচন করুন" }),
  section: z.string().optional(),
  schoolName: z.string().min(1, { message: "স্কুলের নাম আবশ্যক" }),
  schoolAddress: z.string().min(1, { message: "স্কুলের ঠিকানা আবশ্যক" }),
  totalStudents: z.number().min(1, { message: "মোট শিক্ষার্থী সংখ্যা আবশ্যক" }),
  passedStudents: z.number().min(0, { message: "পাশ করা শিক্ষার্থী সংখ্যা আবশ্যক" }),
  failedStudents: z.number().min(0, { message: "অকৃতকার্য শিক্ষার্থী সংখ্যা আবশ্যক" }),
  passPercentage: z.number().min(0).max(100),
  averageMarks: z.number().min(0),
  highestMarks: z.number().min(0),
  lowestMarks: z.number().min(0),
  gradeDistribution: z.object({
    aPlus: z.number().min(0),
    a: z.number().min(0),
    aMinus: z.number().min(0),
    b: z.number().min(0),
    c: z.number().min(0),
    d: z.number().min(0),
    f: z.number().min(0)
  }),
  subjectWiseResults: z.array(z.object({
    subjectName: z.string().min(1),
    totalMarks: z.number().min(1),
    averageMarks: z.number().min(0),
    highestMarks: z.number().min(0),
    lowestMarks: z.number().min(0),
    passPercentage: z.number().min(0).max(100)
  })),
  remarks: z.string().optional(),
  preparedBy: z.string().min(1, { message: "প্রস্তুতকারকের নাম আবশ্যক" }),
  approvedBy: z.string().min(1, { message: "অনুমোদনকারীর নাম আবশ্যক" }),
  publishDate: z.string().min(1, { message: "প্রকাশের তারিখ আবশ্যক" })
});

// Sample subjects for Bangladeshi curriculum
const sampleSubjects = [
  { name: "বাংলা", totalMarks: 100 },
  { name: "ইংরেজি", totalMarks: 100 },
  { name: "গণিত", totalMarks: 100 },
  { name: "বিজ্ঞান", totalMarks: 100 },
  { name: "সামাজিক বিজ্ঞান", totalMarks: 100 },
  { name: "ধর্ম ও নৈতিক শিক্ষা", totalMarks: 100 }
];

export default function ResultSheetsEnhancedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentStep, setCurrentStep] = useState('exam-info');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialize subject-wise results with sample data
  const initializeSubjectResults = () => {
    return sampleSubjects.map(subject => ({
      subjectName: subject.name,
      totalMarks: subject.totalMarks,
      averageMarks: Math.floor(Math.random() * 30 + 60), // 60-90 average
      highestMarks: Math.floor(Math.random() * 10 + 90), // 90-100 highest
      lowestMarks: Math.floor(Math.random() * 20 + 25), // 25-45 lowest
      passPercentage: Math.floor(Math.random() * 20 + 80) // 80-100% pass rate
    }));
  };

  // Result sheet form setup
  const resultForm = useForm<z.infer<typeof resultSheetSchema>>({
    resolver: zodResolver(resultSheetSchema),
    defaultValues: {
      examName: "বার্ষিক পরীক্ষা ২০২৫",
      examType: "annual",
      examYear: "2025",
      session: "২০২৪-২০২৫",
      className: "9",
      section: "A",
      schoolName: "Dhaka Public School",
      schoolAddress: "Mirpur-10, Dhaka-1216",
      totalStudents: 45,
      passedStudents: 42,
      failedStudents: 3,
      passPercentage: 93.33,
      averageMarks: 78.5,
      highestMarks: 98,
      lowestMarks: 28,
      gradeDistribution: {
        aPlus: 18,
        a: 12,
        aMinus: 8,
        b: 4,
        c: 0,
        d: 0,
        f: 3
      },
      subjectWiseResults: initializeSubjectResults(),
      remarks: "সামগ্রিকভাবে চমৎকার ফলাফল অর্জিত হয়েছে। গণিত বিষয়ে আরও উন্নতির প্রয়োজন।",
      preparedBy: "মোঃ করিম উদ্দিন",
      approvedBy: "ড. ফাতেমা খাতুন",
      publishDate: new Date().toISOString().split('T')[0]
    }
  });

  // Form steps for progressive disclosure
  const formSteps = [
    {
      id: 'exam-info',
      title: 'Exam Information',
      titleBn: 'পরীক্ষার তথ্য',
      icon: 'quiz',
      isCompleted: false,
      isActive: currentStep === 'exam-info'
    },
    {
      id: 'statistics',
      title: 'Statistics',
      titleBn: 'পরিসংখ্যান',
      icon: 'analytics',
      isCompleted: false,
      isActive: currentStep === 'statistics'
    },
    {
      id: 'subject-analysis',
      title: 'Subject Analysis',
      titleBn: 'বিষয়ভিত্তিক বিশ্লেষণ',
      icon: 'bar_chart',
      isCompleted: false,
      isActive: currentStep === 'subject-analysis'
    },
    {
      id: 'preview',
      title: 'Preview & Generate',
      titleBn: 'প্রিভিউ ও তৈরি',
      icon: 'preview',
      isCompleted: false,
      isActive: currentStep === 'preview'
    }
  ];

  // Calculate form progress
  const getFormProgress = () => {
    const values = resultForm.getValues();
    const requiredFields = ['examName', 'className', 'schoolName', 'totalStudents'];
    const filledFields = requiredFields.filter(field => values[field as keyof typeof values]);
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  // Update statistics automatically
  const updateStatistics = () => {
    const total = resultForm.watch('totalStudents');
    const passed = resultForm.watch('passedStudents');
    const failed = total - passed;
    const passPercentage = total > 0 ? Math.round((passed / total) * 100 * 100) / 100 : 0;

    resultForm.setValue('failedStudents', failed);
    resultForm.setValue('passPercentage', passPercentage);
  };

  // Handle form submission
  const onResultSubmit = (data: z.infer<typeof resultSheetSchema>) => {
    setIsLoading(true);
    setValidationErrors([]);
    
    console.log("Result Sheet Data:", data);
    
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      setCurrentStep('preview');
      toast({
        title: "ফলাফল প্রতিবেদন তৈরি হয়েছে",
        description: "আপনার ফলাফল প্রতিবেদন সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const resultElement = document.getElementById('result-sheet-preview');
    if (!resultElement) return;

    setIsLoading(true);
    
    try {
      const canvas = await html2canvas(resultElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
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
      pdf.save(`result-sheet-${resultForm.getValues('className')}-${resultForm.getValues('examYear')}.pdf`);
      
      toast({
        title: "পিডিএফ তৈরি হয়েছে",
        description: "আপনার ফলাফল প্রতিবেদন পিডিএফ হিসেবে সেভ করা হয়েছে",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "দুঃখিত, একটি ত্রুটি হয়েছে",
        description: "PDF তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form function
  const resetForm = () => {
    setPreviewMode(false);
    setCurrentStep('exam-info');
    resultForm.reset();
    setValidationErrors([]);
    
    toast({
      title: "ফর্ম রিসেট হয়েছে",
      description: "সকল তথ্য পুনরায় প্রবেশ করুন",
    });
  };

  // Class options
  const classOptions = [
    { value: "6", label: "Class 6", labelBn: "ষষ্ঠ শ্রেণি" },
    { value: "7", label: "Class 7", labelBn: "সপ্তম শ্রেণি" },
    { value: "8", label: "Class 8", labelBn: "অষ্টম শ্রেণি" },
    { value: "9", label: "Class 9", labelBn: "নবম শ্রেণি" },
    { value: "10", label: "Class 10", labelBn: "দশম শ্রেণি" }
  ];

  // Exam type options
  const examTypeOptions = [
    { value: "annual", label: "Annual", labelBn: "বার্ষিক পরীক্ষা" },
    { value: "half_yearly", label: "Half Yearly", labelBn: "অর্ধবার্ষিক পরীক্ষা" },
    { value: "test", label: "Test", labelBn: "টেস্ট পরীক্ষা" },
    { value: "final", label: "Final", labelBn: "চূড়ান্ত পরীক্ষা" }
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <a href="/documents" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">ডকুমেন্ট</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">ফলাফল প্রতিবেদন</span>
            </nav>
            
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-2xl p-8 border border-orange-100 dark:border-orange-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">analytics</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        ফলাফল প্রতিবেদন সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        পরীক্ষার ফলাফলের বিস্তারিত বিশ্লেষণ ও প্রতিবেদন তৈরি করুন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>সিস্টেম সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <span className="material-icons text-sm">analytics</span>
                      <span>স্মার্ট বিশ্লেষণ</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {getFormProgress()}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">সম্পন্ন</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-orange-600 dark:text-orange-400 text-xl">analytics</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট প্রতিবেদন</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৩২৪</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">এই বছর</p>
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
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">trending_up</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">গড় পাশের হার</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৮৯%</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">সব শ্রেণি</p>
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
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">school</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট শিক্ষার্থী</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">১,৮৫৬</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">পরীক্ষায় অংশগ্রহণ</p>
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
                        <span className="material-icons text-purple-600 dark:text-purple-400 text-xl">workspace_premium</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">গড় জিপিএ</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৪.১২</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">সামগ্রিক</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Stepper */}
          <FormStepper 
            steps={formSteps} 
            onStepClick={setCurrentStep} 
          />

          {!previewMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Content */}
              <div className="lg:col-span-2 space-y-6">
                <Form {...resultForm}>
                  {/* Exam Information Section */}
                  <FormSection
                    title="Exam Information"
                    titleBn="পরীক্ষার তথ্য"
                    description="পরীক্ষার বিস্তারিত তথ্য ও প্রতিষ্ঠানের নাম"
                    icon="quiz"
                    isActive={currentStep === 'exam-info'}
                    isCompleted={currentStep !== 'exam-info' && getFormProgress() > 0}
                    progress={currentStep === 'exam-info' ? getFormProgress() : undefined}
                  >
                    <FieldGroup
                      title="পরীক্ষার বিবরণ"
                      description="পরীক্ষার নাম, ধরন ও সময়কাল"
                      required
                    >
                      <SmartInput
                        label="Exam Name"
                        labelBn="পরীক্ষার নাম"
                        placeholder="বার্ষিক পরীক্ষা ২০২৫"
                        required
                        icon="quiz"
                        value={resultForm.watch('examName')}
                        onChange={(value) => resultForm.setValue('examName', value)}
                        validation={resultForm.formState.errors.examName ? 'error' : 'none'}
                        errorText={resultForm.formState.errors.examName?.message}
                      />

                      <SmartSelect
                        label="Exam Type"
                        labelBn="পরীক্ষার ধরন"
                        placeholder="পরীক্ষার ধরন নির্বাচন করুন"
                        required
                        icon="category"
                        options={examTypeOptions}
                        value={resultForm.watch('examType')}
                        onChange={(value) => resultForm.setValue('examType', value)}
                        validation={resultForm.formState.errors.examType ? 'error' : 'none'}
                        errorText={resultForm.formState.errors.examType?.message}
                      />

                      <SmartInput
                        label="Exam Year"
                        labelBn="পরীক্ষার বছর"
                        placeholder="2025"
                        required
                        icon="event"
                        value={resultForm.watch('examYear')}
                        onChange={(value) => resultForm.setValue('examYear', value)}
                        validation={resultForm.formState.errors.examYear ? 'error' : 'none'}
                        errorText={resultForm.formState.errors.examYear?.message}
                      />

                      <SmartInput
                        label="Session"
                        labelBn="সেশন"
                        placeholder="২০২৪-২০২৫"
                        required
                        icon="calendar_month"
                        value={resultForm.watch('session')}
                        onChange={(value) => resultForm.setValue('session', value)}
                        validation={resultForm.formState.errors.session ? 'error' : 'none'}
                        errorText={resultForm.formState.errors.session?.message}
                      />
                    </FieldGroup>

                    <FieldGroup
                      title="শ্রেণি ও প্রতিষ্ঠান"
                      description="শ্রেণি এবং স্কুলের তথ্য"
                      required
                    >
                      <SmartSelect
                        label="Class"
                        labelBn="শ্রেণি"
                        placeholder="শ্রেণি নির্বাচন করুন"
                        required
                        icon="class"
                        options={classOptions}
                        value={resultForm.watch('className')}
                        onChange={(value) => resultForm.setValue('className', value)}
                        validation={resultForm.formState.errors.className ? 'error' : 'none'}
                        errorText={resultForm.formState.errors.className?.message}
                      />

                      <SmartInput
                        label="Section"
                        labelBn="শাখা"
                        placeholder="A"
                        icon="sort"
                        value={resultForm.watch('section')}
                        onChange={(value) => resultForm.setValue('section', value)}
                      />

                      <SmartInput
                        label="School Name"
                        labelBn="স্কুলের নাম"
                        placeholder="ঢাকা পাবলিক স্কুল"
                        required
                        icon="school"
                        value={resultForm.watch('schoolName')}
                        onChange={(value) => resultForm.setValue('schoolName', value)}
                        validation={resultForm.formState.errors.schoolName ? 'error' : 'none'}
                        errorText={resultForm.formState.errors.schoolName?.message}
                      />

                      <SmartInput
                        label="School Address"
                        labelBn="স্কুলের ঠিকানা"
                        placeholder="মিরপুর-১০, ঢাকা-১২১৬"
                        required
                        icon="location_on"
                        value={resultForm.watch('schoolAddress')}
                        onChange={(value) => resultForm.setValue('schoolAddress', value)}
                        validation={resultForm.formState.errors.schoolAddress ? 'error' : 'none'}
                        errorText={resultForm.formState.errors.schoolAddress?.message}
                      />
                    </FieldGroup>
                  </FormSection>

                  {/* Statistics Section */}
                  <FormSection
                    title="Statistics"
                    titleBn="পরিসংখ্যান"
                    description="পরীক্ষার ফলাফলের পরিসংখ্যান ও বিশ্লেষণ"
                    icon="analytics"
                    isActive={currentStep === 'statistics'}
                    isCompleted={false}
                  >
                    <FieldGroup
                      title="মূল পরিসংখ্যান"
                      description="শিক্ষার্থী সংখ্যা ও পাশের হার"
                      required
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartInput
                          label="Total Students"
                          labelBn="মোট শিক্ষার্থী"
                          placeholder="45"
                          type="number"
                          required
                          icon="groups"
                          value={resultForm.watch('totalStudents').toString()}
                          onChange={(value) => {
                            const total = parseInt(value) || 0;
                            resultForm.setValue('totalStudents', total);
                            updateStatistics();
                          }}
                          validation={resultForm.formState.errors.totalStudents ? 'error' : 'none'}
                          errorText={resultForm.formState.errors.totalStudents?.message}
                        />

                        <SmartInput
                          label="Passed Students"
                          labelBn="পাশ করা শিক্ষার্থী"
                          placeholder="42"
                          type="number"
                          required
                          icon="check_circle"
                          value={resultForm.watch('passedStudents').toString()}
                          onChange={(value) => {
                            const passed = parseInt(value) || 0;
                            resultForm.setValue('passedStudents', passed);
                            updateStatistics();
                          }}
                          validation={resultForm.formState.errors.passedStudents ? 'error' : 'none'}
                          errorText={resultForm.formState.errors.passedStudents?.message}
                        />

                        <SmartInput
                          label="Failed Students"
                          labelBn="অকৃতকার্য শিক্ষার্থী"
                          placeholder="3"
                          type="number"
                          icon="cancel"
                          value={resultForm.watch('failedStudents').toString()}
                          onChange={(value) => resultForm.setValue('failedStudents', parseInt(value) || 0)}
                        />

                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                          <label className="text-sm font-medium text-green-700 dark:text-green-300">পাশের হার</label>
                          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{resultForm.watch('passPercentage').toFixed(2)}%</p>
                        </div>
                      </div>
                    </FieldGroup>

                    <FieldGroup
                      title="নম্বর বিশ্লেষণ"
                      description="সর্বোচ্চ, সর্বনিম্ন ও গড় নম্বর"
                      required
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SmartInput
                          label="Average Marks"
                          labelBn="গড় নম্বর"
                          placeholder="78.5"
                          type="number"
                          icon="trending_up"
                          value={resultForm.watch('averageMarks').toString()}
                          onChange={(value) => resultForm.setValue('averageMarks', parseFloat(value) || 0)}
                        />

                        <SmartInput
                          label="Highest Marks"
                          labelBn="সর্বোচ্চ নম্বর"
                          placeholder="98"
                          type="number"
                          icon="star"
                          value={resultForm.watch('highestMarks').toString()}
                          onChange={(value) => resultForm.setValue('highestMarks', parseFloat(value) || 0)}
                        />

                        <SmartInput
                          label="Lowest Marks"
                          labelBn="সর্বনিম্ন নম্বর"
                          placeholder="28"
                          type="number"
                          icon="arrow_downward"
                          value={resultForm.watch('lowestMarks').toString()}
                          onChange={(value) => resultForm.setValue('lowestMarks', parseFloat(value) || 0)}
                        />
                      </div>
                    </FieldGroup>

                    <FieldGroup
                      title="গ্রেড বিতরণ"
                      description="গ্রেডভিত্তিক শিক্ষার্থী সংখ্যা"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">A+</label>
                          <Input
                            type="number"
                            min="0"
                            value={resultForm.watch('gradeDistribution.aPlus')}
                            onChange={(e) => resultForm.setValue('gradeDistribution.aPlus', parseInt(e.target.value) || 0)}
                            className="h-10 text-center border-2 focus:border-orange-500"
                          />
                        </div>
                        <div className="text-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">A</label>
                          <Input
                            type="number"
                            min="0"
                            value={resultForm.watch('gradeDistribution.a')}
                            onChange={(e) => resultForm.setValue('gradeDistribution.a', parseInt(e.target.value) || 0)}
                            className="h-10 text-center border-2 focus:border-orange-500"
                          />
                        </div>
                        <div className="text-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">A-</label>
                          <Input
                            type="number"
                            min="0"
                            value={resultForm.watch('gradeDistribution.aMinus')}
                            onChange={(e) => resultForm.setValue('gradeDistribution.aMinus', parseInt(e.target.value) || 0)}
                            className="h-10 text-center border-2 focus:border-orange-500"
                          />
                        </div>
                        <div className="text-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">B</label>
                          <Input
                            type="number"
                            min="0"
                            value={resultForm.watch('gradeDistribution.b')}
                            onChange={(e) => resultForm.setValue('gradeDistribution.b', parseInt(e.target.value) || 0)}
                            className="h-10 text-center border-2 focus:border-orange-500"
                          />
                        </div>
                        <div className="text-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">C</label>
                          <Input
                            type="number"
                            min="0"
                            value={resultForm.watch('gradeDistribution.c')}
                            onChange={(e) => resultForm.setValue('gradeDistribution.c', parseInt(e.target.value) || 0)}
                            className="h-10 text-center border-2 focus:border-orange-500"
                          />
                        </div>
                        <div className="text-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">D</label>
                          <Input
                            type="number"
                            min="0"
                            value={resultForm.watch('gradeDistribution.d')}
                            onChange={(e) => resultForm.setValue('gradeDistribution.d', parseInt(e.target.value) || 0)}
                            className="h-10 text-center border-2 focus:border-orange-500"
                          />
                        </div>
                        <div className="text-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">F</label>
                          <Input
                            type="number"
                            min="0"
                            value={resultForm.watch('gradeDistribution.f')}
                            onChange={(e) => resultForm.setValue('gradeDistribution.f', parseInt(e.target.value) || 0)}
                            className="h-10 text-center border-2 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </FieldGroup>
                  </FormSection>

                  {/* Subject Analysis Section */}
                  <FormSection
                    title="Subject Analysis"
                    titleBn="বিষয়ভিত্তিক বিশ্লেষণ"
                    description="প্রতিটি বিষয়ের ফলাফল বিশ্লেষণ"
                    icon="bar_chart"
                    isActive={currentStep === 'subject-analysis'}
                    isCompleted={false}
                  >
                    <FieldGroup
                      title="বিষয়ভিত্তিক ফলাফল"
                      description="প্রতিটি বিষয়ের বিস্তারিত পরিসংখ্যান"
                    >
                      <div className="space-y-4">
                        {resultForm.watch('subjectWiseResults').map((subject, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                            <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">{subject.subjectName}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">পূর্ণমান</label>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{subject.totalMarks}</p>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">গড় নম্বর</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={subject.totalMarks}
                                  value={subject.averageMarks}
                                  onChange={(e) => {
                                    const subjects = [...resultForm.watch('subjectWiseResults')];
                                    subjects[index] = { ...subjects[index], averageMarks: parseFloat(e.target.value) || 0 };
                                    resultForm.setValue('subjectWiseResults', subjects);
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">সর্বোচ্চ</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={subject.totalMarks}
                                  value={subject.highestMarks}
                                  onChange={(e) => {
                                    const subjects = [...resultForm.watch('subjectWiseResults')];
                                    subjects[index] = { ...subjects[index], highestMarks: parseFloat(e.target.value) || 0 };
                                    resultForm.setValue('subjectWiseResults', subjects);
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">সর্বনিম্ন</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={subject.totalMarks}
                                  value={subject.lowestMarks}
                                  onChange={(e) => {
                                    const subjects = [...resultForm.watch('subjectWiseResults')];
                                    subjects[index] = { ...subjects[index], lowestMarks: parseFloat(e.target.value) || 0 };
                                    resultForm.setValue('subjectWiseResults', subjects);
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">পাশের হার (%)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={subject.passPercentage}
                                  onChange={(e) => {
                                    const subjects = [...resultForm.watch('subjectWiseResults')];
                                    subjects[index] = { ...subjects[index], passPercentage: parseFloat(e.target.value) || 0 };
                                    resultForm.setValue('subjectWiseResults', subjects);
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </FieldGroup>

                    <FieldGroup
                      title="অতিরিক্ত তথ্য"
                      description="মন্তব্য ও অনুমোদনকারীর তথ্য"
                    >
                      <SmartTextarea
                        label="Remarks"
                        labelBn="মন্তব্য"
                        placeholder="সামগ্রিকভাবে চমৎকার ফলাফল অর্জিত হয়েছে..."
                        icon="comment"
                        rows={3}
                        value={resultForm.watch('remarks')}
                        onChange={(value) => resultForm.setValue('remarks', value)}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartInput
                          label="Prepared By"
                          labelBn="প্রস্তুতকারক"
                          placeholder="মোঃ করিম উদ্দিন"
                          required
                          icon="person"
                          value={resultForm.watch('preparedBy')}
                          onChange={(value) => resultForm.setValue('preparedBy', value)}
                          validation={resultForm.formState.errors.preparedBy ? 'error' : 'none'}
                          errorText={resultForm.formState.errors.preparedBy?.message}
                        />

                        <SmartInput
                          label="Approved By"
                          labelBn="অনুমোদনকারী"
                          placeholder="ড. ফাতেমা খাতুন"
                          required
                          icon="verified_user"
                          value={resultForm.watch('approvedBy')}
                          onChange={(value) => resultForm.setValue('approvedBy', value)}
                          validation={resultForm.formState.errors.approvedBy ? 'error' : 'none'}
                          errorText={resultForm.formState.errors.approvedBy?.message}
                        />
                      </div>

                      <SmartInput
                        label="Publish Date"
                        labelBn="প্রকাশের তারিখ"
                        type="date"
                        required
                        icon="calendar_today"
                        value={resultForm.watch('publishDate')}
                        onChange={(value) => resultForm.setValue('publishDate', value)}
                        validation={resultForm.formState.errors.publishDate ? 'error' : 'none'}
                        errorText={resultForm.formState.errors.publishDate?.message}
                      />
                    </FieldGroup>
                  </FormSection>
                </Form>
              </div>

              {/* Live Preview Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <PreviewPanel
                    title="লাইভ প্রিভিউ"
                    actions={[
                      {
                        label: 'প্রিভিউ',
                        onClick: () => setCurrentStep('preview'),
                        icon: 'visibility',
                        variant: 'secondary'
                      }
                    ]}
                  >
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <span className="material-icons text-4xl text-gray-400 mb-2">analytics</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ফলাফল প্রতিবেদন প্রিভিউ এখানে দেখানো হবে
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">পরীক্ষা:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {resultForm.watch('examName') || 'পরীক্ষার নাম নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">শ্রেণি:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {resultForm.watch('className') || 'শ্রেণি নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">পাশের হার:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {resultForm.watch('passPercentage').toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </PreviewPanel>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview Content */}
              <PreviewPanel
                title="ফলাফল প্রতিবেদন প্রিভিউ"
                actions={[
                  {
                    label: 'পিডিএফ ডাউনলোড',
                    onClick: generatePDF,
                    icon: 'download',
                    variant: 'primary'
                  },
                  {
                    label: 'সম্পাদনা',
                    onClick: () => setPreviewMode(false),
                    icon: 'edit',
                    variant: 'secondary'
                  }
                ]}
              >
                <div id="result-sheet-preview" className="bg-white p-8 rounded-lg border border-gray-200 max-w-5xl mx-auto">
                  <div className="text-center mb-8 border-b pb-6">
                    <h1 className="text-3xl font-bold mb-2">{resultForm.getValues('schoolName')}</h1>
                    <p className="text-lg text-gray-600 mb-2">{resultForm.getValues('schoolAddress')}</p>
                    <div className="text-2xl font-bold text-orange-600 border border-orange-200 rounded-lg py-3 px-6 mx-auto w-max bg-orange-50">
                      ফলাফল প্রতিবেদন (RESULT REPORT)
                    </div>
                    <p className="text-lg mt-2">{resultForm.getValues('examName')} - {resultForm.getValues('session')}</p>
                  </div>
                  
                  {/* Basic Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="text-center bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">মোট শিক্ষার্থী</p>
                      <p className="text-2xl font-bold text-blue-900">{resultForm.getValues('totalStudents')}</p>
                    </div>
                    <div className="text-center bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">পাশ</p>
                      <p className="text-2xl font-bold text-green-900">{resultForm.getValues('passedStudents')}</p>
                    </div>
                    <div className="text-center bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600">অকৃতকার্য</p>
                      <p className="text-2xl font-bold text-red-900">{resultForm.getValues('failedStudents')}</p>
                    </div>
                    <div className="text-center bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600">পাশের হার</p>
                      <p className="text-2xl font-bold text-purple-900">{resultForm.getValues('passPercentage').toFixed(2)}%</p>
                    </div>
                  </div>

                  {/* Grade Distribution */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">গ্রেড বিতরণ</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {Object.entries(resultForm.getValues('gradeDistribution')).map(([key, value], index) => {
                        const gradeLabels = ['A+', 'A', 'A-', 'B', 'C', 'D', 'F'];
                        const colors = ['bg-green-100 text-green-800', 'bg-blue-100 text-blue-800', 'bg-indigo-100 text-indigo-800', 
                                       'bg-yellow-100 text-yellow-800', 'bg-orange-100 text-orange-800', 'bg-red-100 text-red-800', 'bg-gray-100 text-gray-800'];
                        return (
                          <div key={key} className={`text-center p-3 rounded-lg ${colors[index]}`}>
                            <p className="font-bold text-lg">{gradeLabels[index]}</p>
                            <p className="text-xl font-bold">{value}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject-wise Results */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">বিষয়ভিত্তিক ফলাফল</h3>
                    <table className="w-full border border-collapse text-sm">
                      <thead>
                        <tr className="bg-orange-100">
                          <th className="border p-3 text-left">বিষয়</th>
                          <th className="border p-3 text-center">পূর্ণমান</th>
                          <th className="border p-3 text-center">গড় নম্বর</th>
                          <th className="border p-3 text-center">সর্বোচ্চ</th>
                          <th className="border p-3 text-center">সর্বনিম্ন</th>
                          <th className="border p-3 text-center">পাশের হার</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultForm.getValues('subjectWiseResults').map((subject, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border p-3 font-medium">{subject.subjectName}</td>
                            <td className="border p-3 text-center">{subject.totalMarks}</td>
                            <td className="border p-3 text-center font-semibold">{subject.averageMarks}</td>
                            <td className="border p-3 text-center text-green-600 font-bold">{subject.highestMarks}</td>
                            <td className="border p-3 text-center text-red-600 font-bold">{subject.lowestMarks}</td>
                            <td className="border p-3 text-center font-semibold">{subject.passPercentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Overall Performance */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-xl font-bold mb-4">সামগ্রিক পারফরম্যান্স</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">গড় নম্বর</p>
                        <p className="text-2xl font-bold text-blue-600">{resultForm.getValues('averageMarks')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">সর্বোচ্চ নম্বর</p>
                        <p className="text-2xl font-bold text-green-600">{resultForm.getValues('highestMarks')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">সর্বনিম্ন নম্বর</p>
                        <p className="text-2xl font-bold text-red-600">{resultForm.getValues('lowestMarks')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {resultForm.getValues('remarks') && (
                    <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold mb-2">মন্তব্য:</h4>
                      <p>{resultForm.getValues('remarks')}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-end mt-12 pt-8 border-t">
                    <div>
                      <p className="text-sm text-gray-600">প্রস্তুতকারক:</p>
                      <p className="font-semibold">{resultForm.getValues('preparedBy')}</p>
                      <p className="text-sm text-gray-600 mt-2">তারিখ: {new Date(resultForm.getValues('publishDate')).toLocaleDateString('bn-BD')}</p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-32 border-b-2 border-gray-300 mb-2"></div>
                      <p className="font-semibold">{resultForm.getValues('approvedBy')}</p>
                      <p className="text-sm text-gray-600">প্রধান শিক্ষক</p>
                    </div>
                  </div>
                </div>
              </PreviewPanel>
            </div>
          )}

          {/* Action Panel */}
          <ActionPanel
            primaryAction={{
              label: previewMode ? 'পিডিএফ তৈরি করুন' : 'প্রিভিউ দেখুন',
              onClick: previewMode ? generatePDF : () => {
                resultForm.handleSubmit(onResultSubmit)();
              },
              isLoading: isLoading,
              icon: previewMode ? 'download' : 'preview'
            }}
            secondaryAction={{
              label: previewMode ? 'সম্পাদনা করুন' : 'রিসেট করুন',
              onClick: previewMode ? () => setPreviewMode(false) : resetForm,
              icon: previewMode ? 'edit' : 'refresh'
            }}
            progress={getFormProgress()}
            validationErrors={validationErrors}
          />
        </div>
      </div>
    </AppShell>
  );
}