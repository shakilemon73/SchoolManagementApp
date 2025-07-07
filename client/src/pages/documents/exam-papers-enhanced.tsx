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

// Enhanced exam paper schema
const examPaperSchema = z.object({
  examName: z.string().min(2, { message: "পরীক্ষার নাম আবশ্যক" }),
  subject: z.string().min(1, { message: "বিষয় নির্বাচন করুন" }),
  className: z.string().min(1, { message: "শ্রেণি নির্বাচন করুন" }),
  section: z.string().optional(),
  duration: z.string().min(1, { message: "সময়সীমা আবশ্যক" }),
  totalMarks: z.number().min(1, { message: "পূর্ণমান আবশ্যক" }),
  passingMarks: z.number().min(1, { message: "পাশের নম্বর আবশ্যক" }),
  examDate: z.string().min(1, { message: "পরীক্ষার তারিখ আবশ্যক" }),
  examTime: z.string().min(1, { message: "পরীক্ষার সময় আবশ্যক" }),
  schoolName: z.string().min(1, { message: "স্কুলের নাম আবশ্যক" }),
  schoolAddress: z.string().min(1, { message: "স্কুলের ঠিকানা আবশ্যক" }),
  instructions: z.array(z.string()).min(1, { message: "কমপক্ষে একটি নির্দেশনা আবশ্যক" }),
  questions: z.array(z.object({
    type: z.enum(['mcq', 'short', 'long', 'creative']),
    question: z.string().min(1, { message: "প্রশ্ন আবশ্যক" }),
    marks: z.number().min(1, { message: "নম্বর আবশ্যক" }),
    options: z.array(z.string()).optional(),
    answer: z.string().optional(),
    instructions: z.string().optional()
  })).min(1, { message: "কমপক্ষে একটি প্রশ্ন আবশ্যক" }),
  paperType: z.enum(['standard', 'creative', 'mcq', 'mixed']),
  language: z.enum(['bn', 'en', 'both']),
  examinerName: z.string().min(1, { message: "পরীক্ষকের নাম আবশ্যক" }),
  externalName: z.string().optional(),
  session: z.string().min(1, { message: "সেশন আবশ্যক" })
});

// Sample questions for different types
const sampleQuestions = [
  {
    type: 'mcq' as const,
    question: 'বাংলাদেশের জাতীয় ফুল কোনটি?',
    marks: 1,
    options: ['শাপলা', 'গোলাপ', 'চাঁপা', 'জুই'],
    answer: 'শাপলা'
  },
  {
    type: 'short' as const,
    question: 'ফটোসিনথেসিস কী? এর গুরুত্ব লিখ।',
    marks: 5,
    instructions: 'সংক্ষেপে উত্তর দিন'
  },
  {
    type: 'long' as const,
    question: 'মুক্তিযুদ্ধে নারীদের অবদান সম্পর্কে একটি রচনা লিখ।',
    marks: 10,
    instructions: 'বিস্তারিত আলোচনা করুন'
  },
  {
    type: 'creative' as const,
    question: 'একটি গাছের জীবনচক্র বর্ণনা কর এবং পরিবেশে এর ভূমিকা ব্যাখ্যা কর।',
    marks: 8,
    instructions: 'সৃজনশীল উত্তর প্রত্যাশিত'
  }
];

export default function ExamPapersEnhancedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentStep, setCurrentStep] = useState('exam-info');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  // Exam paper form setup
  const examForm = useForm<z.infer<typeof examPaperSchema>>({
    resolver: zodResolver(examPaperSchema),
    defaultValues: {
      examName: "বার্ষিক পরীক্ষা ২০২৫",
      subject: "বাংলা",
      className: "9",
      section: "A",
      duration: "৩ ঘণ্টা",
      totalMarks: 100,
      passingMarks: 33,
      examDate: "2025-03-15",
      examTime: "সকাল ১০:০০ - দুপুর ১:০০",
      schoolName: "Dhaka Public School",
      schoolAddress: "Mirpur-10, Dhaka-1216",
      instructions: [
        "সকল প্রশ্নের উত্তর দিতে হবে",
        "প্রতিটি প্রশ্নের নম্বর উল্লেখ করতে হবে",
        "স্পষ্ট ও সুন্দর হাতের লেখায় উত্তর লিখতে হবে",
        "অতিরিক্ত কাগজ প্রয়োজনে নিবেন"
      ],
      questions: sampleQuestions,
      paperType: "mixed",
      language: "bn",
      examinerName: "প্রফেসর ড. আব্দুর রহমান",
      externalName: "ড. ফাতেমা খাতুন",
      session: "২০২৪-২০২৫"
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
      id: 'paper-setup',
      title: 'Paper Setup',
      titleBn: 'প্রশ্নপত্র সেটআপ',
      icon: 'settings',
      isCompleted: false,
      isActive: currentStep === 'paper-setup'
    },
    {
      id: 'questions',
      title: 'Questions',
      titleBn: 'প্রশ্নসমূহ',
      icon: 'help',
      isCompleted: false,
      isActive: currentStep === 'questions'
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
    const values = examForm.getValues();
    const requiredFields = ['examName', 'subject', 'className', 'duration', 'totalMarks'];
    const filledFields = requiredFields.filter(field => values[field as keyof typeof values]);
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  // Add new question
  const addQuestion = (type: 'mcq' | 'short' | 'long' | 'creative') => {
    const questions = examForm.getValues('questions');
    const newQuestion = {
      type,
      question: '',
      marks: type === 'mcq' ? 1 : type === 'short' ? 5 : 10,
      options: type === 'mcq' ? ['', '', '', ''] : undefined,
      answer: '',
      instructions: ''
    };
    examForm.setValue('questions', [...questions, newQuestion]);
  };

  // Remove question
  const removeQuestion = (index: number) => {
    const questions = examForm.getValues('questions');
    questions.splice(index, 1);
    examForm.setValue('questions', [...questions]);
  };

  // Update question
  const updateQuestion = (index: number, field: string, value: any) => {
    const questions = examForm.getValues('questions');
    questions[index] = { ...questions[index], [field]: value };
    examForm.setValue('questions', [...questions]);
  };

  // Handle form submission
  const onExamSubmit = (data: z.infer<typeof examPaperSchema>) => {
    setIsLoading(true);
    setValidationErrors([]);
    
    console.log("Exam Paper Data:", data);
    
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      setCurrentStep('preview');
      toast({
        title: "প্রশ্নপত্র তৈরি হয়েছে",
        description: "আপনার প্রশ্নপত্র সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const examElement = document.getElementById('exam-paper-preview');
    if (!examElement) return;

    setIsLoading(true);
    
    try {
      const canvas = await html2canvas(examElement, {
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
      pdf.save(`exam-paper-${examForm.getValues('subject')}-${examForm.getValues('className')}.pdf`);
      
      toast({
        title: "পিডিএফ তৈরি হয়েছে",
        description: "আপনার প্রশ্নপত্র পিডিএফ হিসেবে সেভ করা হয়েছে",
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
    examForm.reset();
    setValidationErrors([]);
    
    toast({
      title: "ফর্ম রিসেট হয়েছে",
      description: "সকল তথ্য পুনরায় প্রবেশ করুন",
    });
  };

  // Subject options
  const subjectOptions = [
    { value: "বাংলা", label: "Bangla", labelBn: "বাংলা" },
    { value: "ইংরেজি", label: "English", labelBn: "ইংরেজি" },
    { value: "গণিত", label: "Mathematics", labelBn: "গণিত" },
    { value: "বিজ্ঞান", label: "Science", labelBn: "বিজ্ঞান" },
    { value: "সামাজিক বিজ্ঞান", label: "Social Science", labelBn: "সামাজিক বিজ্ঞান" },
    { value: "ধর্ম ও নৈতিক শিক্ষা", label: "Religion & Ethics", labelBn: "ধর্ম ও নৈতিক শিক্ষা" }
  ];

  // Class options
  const classOptions = [
    { value: "6", label: "Class 6", labelBn: "ষষ্ঠ শ্রেণি" },
    { value: "7", label: "Class 7", labelBn: "সপ্তম শ্রেণি" },
    { value: "8", label: "Class 8", labelBn: "অষ্টম শ্রেণি" },
    { value: "9", label: "Class 9", labelBn: "নবম শ্রেণি" },
    { value: "10", label: "Class 10", labelBn: "দশম শ্রেণি" }
  ];

  // Paper type options
  const paperTypeOptions = [
    { value: "standard", label: "Standard", labelBn: "প্রচলিত" },
    { value: "creative", label: "Creative", labelBn: "সৃজনশীল" },
    { value: "mcq", label: "MCQ", labelBn: "বহুনির্বাচনী" },
    { value: "mixed", label: "Mixed", labelBn: "মিশ্র" }
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <a href="/documents" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">ডকুমেন্ট</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">প্রশ্নপত্র</span>
            </nav>
            
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">quiz</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        প্রশ্নপত্র তৈরি সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        পেশাদার ও মানসম্পন্ন পরীক্ষার প্রশ্নপত্র তৈরি করুন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>সিস্টেম সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <span className="material-icons text-sm">auto_awesome</span>
                      <span>স্মার্ট এডিটর</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
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
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-indigo-600 dark:text-indigo-400 text-xl">quiz</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট প্রশ্নপত্র</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৪৮৬</div>
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
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">auto_awesome</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সৃজনশীল প্রশ্ন</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">১৮৬</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">তৈরি করা হয়েছে</p>
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
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">checklist</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">MCQ প্রশ্ন</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৮৬৪</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">প্রশ্ন ব্যাংকে</p>
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
                        <span className="material-icons text-purple-600 dark:text-purple-400 text-xl">school</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">বিষয়</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">১৮</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">কভার করা</p>
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
                <Form {...examForm}>
                  {/* Exam Information Section */}
                  <FormSection
                    title="Exam Information"
                    titleBn="পরীক্ষার তথ্য"
                    description="পরীক্ষার মৌলিক তথ্য ও সময়সূচী"
                    icon="quiz"
                    isActive={currentStep === 'exam-info'}
                    isCompleted={currentStep !== 'exam-info' && getFormProgress() > 0}
                    progress={currentStep === 'exam-info' ? getFormProgress() : undefined}
                  >
                    <FieldGroup
                      title="পরীক্ষার বিবরণ"
                      description="পরীক্ষার নাম, বিষয় ও শ্রেণি"
                      required
                    >
                      <SmartInput
                        label="Exam Name"
                        labelBn="পরীক্ষার নাম"
                        placeholder="বার্ষিক পরীক্ষা ২০২৫"
                        required
                        icon="quiz"
                        value={examForm.watch('examName')}
                        onChange={(value) => examForm.setValue('examName', value)}
                        validation={examForm.formState.errors.examName ? 'error' : 'none'}
                        errorText={examForm.formState.errors.examName?.message}
                      />

                      <SmartSelect
                        label="Subject"
                        labelBn="বিষয়"
                        placeholder="বিষয় নির্বাচন করুন"
                        required
                        icon="menu_book"
                        options={subjectOptions}
                        value={examForm.watch('subject')}
                        onChange={(value) => examForm.setValue('subject', value)}
                        validation={examForm.formState.errors.subject ? 'error' : 'none'}
                        errorText={examForm.formState.errors.subject?.message}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartSelect
                          label="Class"
                          labelBn="শ্রেণি"
                          placeholder="শ্রেণি নির্বাচন করুন"
                          required
                          icon="class"
                          options={classOptions}
                          value={examForm.watch('className')}
                          onChange={(value) => examForm.setValue('className', value)}
                          validation={examForm.formState.errors.className ? 'error' : 'none'}
                          errorText={examForm.formState.errors.className?.message}
                        />

                        <SmartInput
                          label="Section"
                          labelBn="শাখা"
                          placeholder="A"
                          icon="sort"
                          value={examForm.watch('section')}
                          onChange={(value) => examForm.setValue('section', value)}
                        />
                      </div>

                      <SmartInput
                        label="Session"
                        labelBn="সেশন"
                        placeholder="২০২৪-২০২৫"
                        required
                        icon="calendar_month"
                        value={examForm.watch('session')}
                        onChange={(value) => examForm.setValue('session', value)}
                        validation={examForm.formState.errors.session ? 'error' : 'none'}
                        errorText={examForm.formState.errors.session?.message}
                      />
                    </FieldGroup>

                    <FieldGroup
                      title="সময় ও নম্বর"
                      description="পরীক্ষার সময়সীমা ও নম্বর বিতরণ"
                      required
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartInput
                          label="Duration"
                          labelBn="সময়সীমা"
                          placeholder="৩ ঘণ্টা"
                          required
                          icon="schedule"
                          value={examForm.watch('duration')}
                          onChange={(value) => examForm.setValue('duration', value)}
                          validation={examForm.formState.errors.duration ? 'error' : 'none'}
                          errorText={examForm.formState.errors.duration?.message}
                        />

                        <SmartInput
                          label="Exam Time"
                          labelBn="পরীক্ষার সময়"
                          placeholder="সকাল ১০:০০ - দুপুর ১:০০"
                          required
                          icon="access_time"
                          value={examForm.watch('examTime')}
                          onChange={(value) => examForm.setValue('examTime', value)}
                          validation={examForm.formState.errors.examTime ? 'error' : 'none'}
                          errorText={examForm.formState.errors.examTime?.message}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SmartInput
                          label="Total Marks"
                          labelBn="পূর্ণমান"
                          placeholder="100"
                          type="number"
                          required
                          icon="star"
                          value={examForm.watch('totalMarks').toString()}
                          onChange={(value) => examForm.setValue('totalMarks', parseInt(value) || 0)}
                          validation={examForm.formState.errors.totalMarks ? 'error' : 'none'}
                          errorText={examForm.formState.errors.totalMarks?.message}
                        />

                        <SmartInput
                          label="Passing Marks"
                          labelBn="পাশের নম্বর"
                          placeholder="33"
                          type="number"
                          required
                          icon="check"
                          value={examForm.watch('passingMarks').toString()}
                          onChange={(value) => examForm.setValue('passingMarks', parseInt(value) || 0)}
                          validation={examForm.formState.errors.passingMarks ? 'error' : 'none'}
                          errorText={examForm.formState.errors.passingMarks?.message}
                        />

                        <SmartInput
                          label="Exam Date"
                          labelBn="পরীক্ষার তারিখ"
                          type="date"
                          required
                          icon="calendar_today"
                          value={examForm.watch('examDate')}
                          onChange={(value) => examForm.setValue('examDate', value)}
                          validation={examForm.formState.errors.examDate ? 'error' : 'none'}
                          errorText={examForm.formState.errors.examDate?.message}
                        />
                      </div>
                    </FieldGroup>

                    <FieldGroup
                      title="প্রতিষ্ঠানের তথ্য"
                      description="স্কুল ও পরীক্ষকের তথ্য"
                      required
                    >
                      <SmartInput
                        label="School Name"
                        labelBn="স্কুলের নাম"
                        placeholder="ঢাকা পাবলিক স্কুল"
                        required
                        icon="school"
                        value={examForm.watch('schoolName')}
                        onChange={(value) => examForm.setValue('schoolName', value)}
                        validation={examForm.formState.errors.schoolName ? 'error' : 'none'}
                        errorText={examForm.formState.errors.schoolName?.message}
                      />

                      <SmartInput
                        label="School Address"
                        labelBn="স্কুলের ঠিকানা"
                        placeholder="মিরপুর-১০, ঢাকা-১২১৬"
                        required
                        icon="location_on"
                        value={examForm.watch('schoolAddress')}
                        onChange={(value) => examForm.setValue('schoolAddress', value)}
                        validation={examForm.formState.errors.schoolAddress ? 'error' : 'none'}
                        errorText={examForm.formState.errors.schoolAddress?.message}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartInput
                          label="Examiner Name"
                          labelBn="পরীক্ষকের নাম"
                          placeholder="প্রফেসর ড. আব্দুর রহমান"
                          required
                          icon="person"
                          value={examForm.watch('examinerName')}
                          onChange={(value) => examForm.setValue('examinerName', value)}
                          validation={examForm.formState.errors.examinerName ? 'error' : 'none'}
                          errorText={examForm.formState.errors.examinerName?.message}
                        />

                        <SmartInput
                          label="External Examiner"
                          labelBn="বহিঃস্থ পরীক্ষক"
                          placeholder="ড. ফাতেমা খাতুন"
                          icon="person_pin"
                          value={examForm.watch('externalName')}
                          onChange={(value) => examForm.setValue('externalName', value)}
                        />
                      </div>
                    </FieldGroup>
                  </FormSection>

                  {/* Paper Setup Section */}
                  <FormSection
                    title="Paper Setup"
                    titleBn="প্রশ্নপত্র সেটআপ"
                    description="প্রশ্নপত্রের ধরন ও নির্দেশনা"
                    icon="settings"
                    isActive={currentStep === 'paper-setup'}
                    isCompleted={false}
                  >
                    <FieldGroup
                      title="প্রশ্নপত্রের ধরন"
                      description="প্রশ্নপত্রের ফরম্যাট ও ভাষা"
                    >
                      <SmartSelect
                        label="Paper Type"
                        labelBn="প্রশ্নপত্রের ধরন"
                        placeholder="প্রশ্নপত্রের ধরন নির্বাচন করুন"
                        required
                        icon="category"
                        options={paperTypeOptions}
                        value={examForm.watch('paperType')}
                        onChange={(value) => examForm.setValue('paperType', value as any)}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ভাষা</label>
                          <Select 
                            value={examForm.watch('language')} 
                            onValueChange={(value) => examForm.setValue('language', value as any)}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="ভাষা নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bn">বাংলা</SelectItem>
                              <SelectItem value="en">ইংরেজি</SelectItem>
                              <SelectItem value="both">দ্বিভাষিক</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </FieldGroup>

                    <FieldGroup
                      title="পরীক্ষার নির্দেশনা"
                      description="শিক্ষার্থীদের জন্য নির্দেশাবলী"
                    >
                      <div className="space-y-3">
                        {examForm.watch('instructions').map((instruction, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={instruction}
                              onChange={(e) => {
                                const instructions = [...examForm.watch('instructions')];
                                instructions[index] = e.target.value;
                                examForm.setValue('instructions', instructions);
                              }}
                              placeholder="নির্দেশনা লিখুন..."
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const instructions = examForm.watch('instructions');
                                instructions.splice(index, 1);
                                examForm.setValue('instructions', [...instructions]);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <span className="material-icons text-sm">delete</span>
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const instructions = examForm.watch('instructions');
                            examForm.setValue('instructions', [...instructions, '']);
                          }}
                          className="w-full border-dashed"
                        >
                          <span className="material-icons text-sm mr-2">add</span>
                          নতুন নির্দেশনা যোগ করুন
                        </Button>
                      </div>
                    </FieldGroup>
                  </FormSection>

                  {/* Questions Section */}
                  <FormSection
                    title="Questions"
                    titleBn="প্রশ্নসমূহ"
                    description="প্রশ্নপত্রের প্রশ্ন তৈরি ও সম্পাদনা"
                    icon="help"
                    isActive={currentStep === 'questions'}
                    isCompleted={false}
                  >
                    <FieldGroup
                      title="প্রশ্ন তৈরি"
                      description="বিভিন্ন ধরনের প্রশ্ন যোগ করুন"
                    >
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('mcq')}>
                          <span className="material-icons text-sm mr-1">radio_button_checked</span>
                          MCQ যোগ করুন
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('short')}>
                          <span className="material-icons text-sm mr-1">short_text</span>
                          সংক্ষিপ্ত প্রশ্ন
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('long')}>
                          <span className="material-icons text-sm mr-1">article</span>
                          বিস্তারিত প্রশ্ন
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('creative')}>
                          <span className="material-icons text-sm mr-1">auto_awesome</span>
                          সৃজনশীল প্রশ্ন
                        </Button>
                      </div>

                      <div className="space-y-6">
                        {examForm.watch('questions').map((question, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">
                                প্রশ্ন {index + 1} ({question.type === 'mcq' ? 'বহুনির্বাচনী' : 
                                                     question.type === 'short' ? 'সংক্ষিপ্ত' : 
                                                     question.type === 'long' ? 'বিস্তারিত' : 'সৃজনশীল'})
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {question.marks} নম্বর
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeQuestion(index)}
                                  className="text-red-600"
                                >
                                  <span className="material-icons text-sm">delete</span>
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <SmartTextarea
                                label="Question"
                                labelBn="প্রশ্ন"
                                placeholder="এখানে প্রশ্ন লিখুন..."
                                rows={3}
                                value={question.question}
                                onChange={(value) => updateQuestion(index, 'question', value)}
                              />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <SmartInput
                                  label="Marks"
                                  labelBn="নম্বর"
                                  type="number"
                                  placeholder="5"
                                  value={question.marks.toString()}
                                  onChange={(value) => updateQuestion(index, 'marks', parseInt(value) || 0)}
                                />

                                {question.type !== 'mcq' && (
                                  <SmartInput
                                    label="Instructions"
                                    labelBn="নির্দেশনা"
                                    placeholder="বিশেষ নির্দেশনা (যদি থাকে)"
                                    value={question.instructions || ''}
                                    onChange={(value) => updateQuestion(index, 'instructions', value)}
                                  />
                                )}
                              </div>

                              {question.type === 'mcq' && (
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">অপশনসমূহ</label>
                                  {question.options?.map((option, optionIndex) => (
                                    <Input
                                      key={optionIndex}
                                      value={option}
                                      onChange={(e) => {
                                        const options = [...(question.options || [])];
                                        options[optionIndex] = e.target.value;
                                        updateQuestion(index, 'options', options);
                                      }}
                                      placeholder={`অপশন ${optionIndex + 1}`}
                                      className="ml-4"
                                    />
                                  ))}
                                  
                                  <SmartInput
                                    label="Correct Answer"
                                    labelBn="সঠিক উত্তর"
                                    placeholder="সঠিক উত্তর লিখুন"
                                    value={question.answer || ''}
                                    onChange={(value) => updateQuestion(index, 'answer', value)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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
                        <span className="material-icons text-4xl text-gray-400 mb-2">quiz</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          প্রশ্নপত্র প্রিভিউ এখানে দেখানো হবে
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">পরীক্ষা:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {examForm.watch('examName') || 'পরীক্ষার নাম নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">বিষয়:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {examForm.watch('subject') || 'বিষয় নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">প্রশ্ন সংখ্যা:</span>
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {examForm.watch('questions').length}টি
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
                title="প্রশ্নপত্র প্রিভিউ"
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
                <div id="exam-paper-preview" className="bg-white p-8 rounded-lg border border-gray-200 max-w-4xl mx-auto">
                  <div className="text-center mb-8 border-b pb-6">
                    <h1 className="text-3xl font-bold mb-2">{examForm.getValues('schoolName')}</h1>
                    <p className="text-lg text-gray-600 mb-2">{examForm.getValues('schoolAddress')}</p>
                    <div className="text-2xl font-bold text-indigo-600 border border-indigo-200 rounded-lg py-3 px-6 mx-auto w-max bg-indigo-50">
                      {examForm.getValues('examName')}
                    </div>
                    <p className="text-lg mt-2">{examForm.getValues('subject')} - শ্রেণি: {examForm.getValues('className')}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">সময়</p>
                      <p className="font-semibold">{examForm.getValues('duration')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">পূর্ণমান</p>
                      <p className="font-semibold">{examForm.getValues('totalMarks')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">পাশের নম্বর</p>
                      <p className="font-semibold">{examForm.getValues('passingMarks')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">তারিখ</p>
                      <p className="font-semibold">{new Date(examForm.getValues('examDate')).toLocaleDateString('bn-BD')}</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3">নির্দেশনা:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {examForm.getValues('instructions').map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    {examForm.getValues('questions').map((question, index) => (
                      <div key={index} className="border-l-4 border-indigo-500 pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">
                            {index + 1}. {question.question}
                          </h4>
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                            [{question.marks} নম্বর]
                          </span>
                        </div>
                        
                        {question.instructions && (
                          <p className="text-sm text-gray-600 italic mb-2">[{question.instructions}]</p>
                        )}
                        
                        {question.type === 'mcq' && question.options && (
                          <div className="ml-4 space-y-1">
                            {question.options.map((option, optionIndex) => (
                              <p key={optionIndex} className="text-sm">
                                {String.fromCharCode(97 + optionIndex)}) {option}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {question.type !== 'mcq' && (
                          <div className="mt-3 p-4 bg-gray-50 rounded min-h-[100px] border-2 border-dashed border-gray-300">
                            <p className="text-sm text-gray-500 text-center">উত্তর লেখার স্থান</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-end mt-12 pt-8 border-t">
                    <div>
                      <p className="text-sm text-gray-600">পরীক্ষকের স্বাক্ষর:</p>
                      <div className="h-16 w-32 border-b border-gray-300 mt-2"></div>
                      <p className="text-sm mt-1">{examForm.getValues('examinerName')}</p>
                    </div>
                    {examForm.getValues('externalName') && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">বহিঃস্থ পরীক্ষক:</p>
                        <div className="h-16 w-32 border-b border-gray-300 mt-2"></div>
                        <p className="text-sm mt-1">{examForm.getValues('externalName')}</p>
                      </div>
                    )}
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
                examForm.handleSubmit(onExamSubmit)();
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