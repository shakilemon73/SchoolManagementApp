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

// Enhanced marksheet schema
const marksheetSchema = z.object({
  studentName: z.string().min(2, { message: "শিক্ষার্থীর নাম আবশ্যক" }),
  studentNameBn: z.string().optional(),
  fatherName: z.string().min(2, { message: "পিতার নাম আবশ্যক" }),
  motherName: z.string().min(2, { message: "মাতার নাম আবশ্যক" }),
  className: z.string().min(1, { message: "শ্রেণি নির্বাচন করুন" }),
  section: z.string().optional(),
  rollNumber: z.string().min(1, { message: "রোল নম্বর আবশ্যক" }),
  registrationNumber: z.string().optional(),
  examName: z.string().min(1, { message: "পরীক্ষার নাম আবশ্যক" }),
  examYear: z.string().min(1, { message: "পরীক্ষার বছর আবশ্যক" }),
  session: z.string().min(1, { message: "সেশন আবশ্যক" }),
  schoolName: z.string().min(1, { message: "স্কুলের নাম আবশ্যক" }),
  schoolAddress: z.string().min(1, { message: "স্কুলের ঠিকানা আবশ্যক" }),
  subjects: z.array(z.object({
    name: z.string().min(1, { message: "বিষয়ের নাম আবশ্যক" }),
    fullMarks: z.number().min(1, { message: "পূর্ণমান আবশ্যক" }),
    passMarks: z.number().min(1, { message: "পাশের নম্বর আবশ্যক" }),
    obtainedMarks: z.number().min(0, { message: "প্রাপ্ত নম্বর আবশ্যক" }),
    grade: z.string().optional(),
    gpa: z.number().optional()
  })).min(1, { message: "কমপক্ষে একটি বিষয় আবশ্যক" }),
  totalMarks: z.number().min(0),
  obtainedTotal: z.number().min(0),
  percentage: z.number().min(0).max(100),
  overallGrade: z.string().optional(),
  gpa: z.number().optional(),
  position: z.string().optional(),
  remarks: z.string().optional()
});

// Default subjects for Bangladeshi curriculum
const defaultSubjects = [
  { name: "বাংলা", fullMarks: 100, passMarks: 33 },
  { name: "ইংরেজি", fullMarks: 100, passMarks: 33 },
  { name: "গণিত", fullMarks: 100, passMarks: 33 },
  { name: "বিজ্ঞান", fullMarks: 100, passMarks: 33 },
  { name: "সামাজিক বিজ্ঞান", fullMarks: 100, passMarks: 33 },
  { name: "ধর্ম ও নৈতিক শিক্ষা", fullMarks: 100, passMarks: 33 }
];

export default function MarksheetsEnhancedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentStep, setCurrentStep] = useState('student-info');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialize subjects with sample marks
  const initializeSubjects = () => {
    return defaultSubjects.map(subject => ({
      ...subject,
      obtainedMarks: Math.floor(Math.random() * (100 - subject.passMarks) + subject.passMarks),
      grade: "A",
      gpa: 4.5
    }));
  };

  // Marksheet form setup
  const marksheetForm = useForm<z.infer<typeof marksheetSchema>>({
    resolver: zodResolver(marksheetSchema),
    defaultValues: {
      studentName: "Aisha Rahman",
      studentNameBn: "আয়েশা রহমান",
      fatherName: "Mohammad Ali",
      motherName: "Rashida Begum",
      className: "9",
      section: "A",
      rollNumber: "08",
      registrationNumber: "20250008",
      examName: "বার্ষিক পরীক্ষা",
      examYear: "2025",
      session: "২০২৪-২০২৫",
      schoolName: "Dhaka Public School",
      schoolAddress: "Mirpur-10, Dhaka-1216",
      subjects: initializeSubjects(),
      totalMarks: 600,
      obtainedTotal: 480,
      percentage: 80,
      overallGrade: "A+",
      gpa: 4.8,
      position: "৩য়",
      remarks: "চমৎকার ফলাফল"
    }
  });

  // Form steps for progressive disclosure
  const formSteps = [
    {
      id: 'student-info',
      title: 'Student Information',
      titleBn: 'শিক্ষার্থীর তথ্য',
      icon: 'person',
      isCompleted: false,
      isActive: currentStep === 'student-info'
    },
    {
      id: 'exam-info',
      title: 'Exam Information',
      titleBn: 'পরীক্ষার তথ্য',
      icon: 'quiz',
      isCompleted: false,
      isActive: currentStep === 'exam-info'
    },
    {
      id: 'marks-entry',
      title: 'Marks Entry',
      titleBn: 'নম্বর প্রবেশ',
      icon: 'edit',
      isCompleted: false,
      isActive: currentStep === 'marks-entry'
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
    const values = marksheetForm.getValues();
    const requiredFields = ['studentName', 'className', 'rollNumber', 'examName'];
    const filledFields = requiredFields.filter(field => values[field as keyof typeof values]);
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  // Calculate grade from marks
  const calculateGrade = (obtainedMarks: number, fullMarks: number) => {
    const percentage = (obtainedMarks / fullMarks) * 100;
    if (percentage >= 80) return "A+";
    if (percentage >= 70) return "A";
    if (percentage >= 60) return "A-";
    if (percentage >= 50) return "B";
    if (percentage >= 40) return "C";
    if (percentage >= 33) return "D";
    return "F";
  };

  // Calculate GPA from grade
  const calculateGPA = (grade: string) => {
    const gradeMap: { [key: string]: number } = {
      "A+": 5.0, "A": 4.0, "A-": 3.5, "B": 3.0, "C": 2.0, "D": 1.0, "F": 0.0
    };
    return gradeMap[grade] || 0.0;
  };

  // Update subject marks and recalculate totals
  const updateSubjectMarks = (index: number, obtainedMarks: number) => {
    const subjects = marksheetForm.getValues('subjects');
    const subject = subjects[index];
    const grade = calculateGrade(obtainedMarks, subject.fullMarks);
    const gpa = calculateGPA(grade);

    subjects[index] = { ...subject, obtainedMarks, grade, gpa };
    
    const obtainedTotal = subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
    const totalMarks = subjects.reduce((sum, s) => sum + s.fullMarks, 0);
    const percentage = Math.round((obtainedTotal / totalMarks) * 100);
    const overallGrade = calculateGrade(obtainedTotal, totalMarks);
    const overallGPA = subjects.reduce((sum, s) => sum + (s.gpa || 0), 0) / subjects.length;

    marksheetForm.setValue('subjects', subjects);
    marksheetForm.setValue('obtainedTotal', obtainedTotal);
    marksheetForm.setValue('totalMarks', totalMarks);
    marksheetForm.setValue('percentage', percentage);
    marksheetForm.setValue('overallGrade', overallGrade);
    marksheetForm.setValue('gpa', Math.round(overallGPA * 100) / 100);
  };

  // Handle form submission
  const onMarksheetSubmit = (data: z.infer<typeof marksheetSchema>) => {
    setIsLoading(true);
    setValidationErrors([]);
    
    console.log("Marksheet Data:", data);
    
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      setCurrentStep('preview');
      toast({
        title: "মার্কশিট তৈরি হয়েছে",
        description: "আপনার মার্কশিট সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const marksheetElement = document.getElementById('marksheet-preview');
    if (!marksheetElement) return;

    setIsLoading(true);
    
    try {
      const canvas = await html2canvas(marksheetElement, {
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
      pdf.save(`marksheet-${marksheetForm.getValues('rollNumber')}-${marksheetForm.getValues('examYear')}.pdf`);
      
      toast({
        title: "পিডিএফ তৈরি হয়েছে",
        description: "আপনার মার্কশিট পিডিএফ হিসেবে সেভ করা হয়েছে",
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
    setCurrentStep('student-info');
    marksheetForm.reset();
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

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <a href="/documents" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">ডকুমেন্ট</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">মার্কশিট</span>
            </nav>
            
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">assessment</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        মার্কশিট সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        শিক্ষার্থীদের জন্য পেশাদার মার্কশিট তৈরি করুন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>সিস্টেম সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>গ্রেড ক্যালকুলেটর</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
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
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">assessment</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট মার্কশিট</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৮৫৬</div>
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
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">পাশের হার</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৯২%</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">বার্ষিক পরীক্ষা</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-yellow-600 dark:text-yellow-400 text-xl">star</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">গড় জিপিএ</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৪.২</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">সামগ্রিক</p>
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
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">A+ গ্রেড</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">২৪৮</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">শিক্ষার্থী</p>
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
                <Form {...marksheetForm}>
                  {/* Student Information Section */}
                  <FormSection
                    title="Student Information"
                    titleBn="শিক্ষার্থীর তথ্য"
                    description="শিক্ষার্থীর ব্যক্তিগত ও একাডেমিক তথ্য"
                    icon="person"
                    isActive={currentStep === 'student-info'}
                    isCompleted={currentStep !== 'student-info' && getFormProgress() > 0}
                    progress={currentStep === 'student-info' ? getFormProgress() : undefined}
                  >
                    <FieldGroup
                      title="ব্যক্তিগত তথ্য"
                      description="শিক্ষার্থীর নাম ও পারিবারিক তথ্য"
                      required
                    >
                      <SmartInput
                        label="Student Name (English)"
                        labelBn="শিক্ষার্থীর নাম (ইংরেজি)"
                        placeholder="Aisha Rahman"
                        required
                        icon="person"
                        value={marksheetForm.watch('studentName')}
                        onChange={(value) => marksheetForm.setValue('studentName', value)}
                        validation={marksheetForm.formState.errors.studentName ? 'error' : 'none'}
                        errorText={marksheetForm.formState.errors.studentName?.message}
                      />

                      <SmartInput
                        label="Student Name (Bengali)"
                        labelBn="শিক্ষার্থীর নাম (বাংলা)"
                        placeholder="আয়েশা রহমান"
                        icon="translate"
                        value={marksheetForm.watch('studentNameBn')}
                        onChange={(value) => marksheetForm.setValue('studentNameBn', value)}
                      />

                      <SmartInput
                        label="Father's Name"
                        labelBn="পিতার নাম"
                        placeholder="Mohammad Ali"
                        required
                        icon="man"
                        value={marksheetForm.watch('fatherName')}
                        onChange={(value) => marksheetForm.setValue('fatherName', value)}
                        validation={marksheetForm.formState.errors.fatherName ? 'error' : 'none'}
                        errorText={marksheetForm.formState.errors.fatherName?.message}
                      />

                      <SmartInput
                        label="Mother's Name"
                        labelBn="মাতার নাম"
                        placeholder="Rashida Begum"
                        required
                        icon="woman"
                        value={marksheetForm.watch('motherName')}
                        onChange={(value) => marksheetForm.setValue('motherName', value)}
                        validation={marksheetForm.formState.errors.motherName ? 'error' : 'none'}
                        errorText={marksheetForm.formState.errors.motherName?.message}
                      />
                    </FieldGroup>

                    <FieldGroup
                      title="একাডেমিক তথ্য"
                      description="শ্রেণি ও রোল নম্বর"
                      required
                    >
                      <SmartSelect
                        label="Class"
                        labelBn="শ্রেণি"
                        placeholder="শ্রেণি নির্বাচন করুন"
                        required
                        icon="class"
                        options={classOptions}
                        value={marksheetForm.watch('className')}
                        onChange={(value) => marksheetForm.setValue('className', value)}
                        validation={marksheetForm.formState.errors.className ? 'error' : 'none'}
                        errorText={marksheetForm.formState.errors.className?.message}
                      />

                      <SmartInput
                        label="Section"
                        labelBn="শাখা"
                        placeholder="A"
                        icon="sort"
                        value={marksheetForm.watch('section')}
                        onChange={(value) => marksheetForm.setValue('section', value)}
                      />

                      <SmartInput
                        label="Roll Number"
                        labelBn="রোল নম্বর"
                        placeholder="08"
                        required
                        icon="tag"
                        value={marksheetForm.watch('rollNumber')}
                        onChange={(value) => marksheetForm.setValue('rollNumber', value)}
                        validation={marksheetForm.formState.errors.rollNumber ? 'error' : 'none'}
                        errorText={marksheetForm.formState.errors.rollNumber?.message}
                      />

                      <SmartInput
                        label="Registration Number"
                        labelBn="রেজিস্ট্রেশন নম্বর"
                        placeholder="20250008"
                        icon="confirmation_number"
                        value={marksheetForm.watch('registrationNumber')}
                        onChange={(value) => marksheetForm.setValue('registrationNumber', value)}
                      />
                    </FieldGroup>
                  </FormSection>

                  {/* Exam Information Section */}
                  <FormSection
                    title="Exam Information"
                    titleBn="পরীক্ষার তথ্য"
                    description="পরীক্ষার নাম, বছর ও সেশন"
                    icon="quiz"
                    isActive={currentStep === 'exam-info'}
                    isCompleted={false}
                  >
                    <FieldGroup
                      title="পরীক্ষার বিবরণ"
                      description="পরীক্ষা সংক্রান্ত তথ্য"
                      required
                    >
                      <SmartInput
                        label="Exam Name"
                        labelBn="পরীক্ষার নাম"
                        placeholder="বার্ষিক পরীক্ষা"
                        required
                        icon="quiz"
                        value={marksheetForm.watch('examName')}
                        onChange={(value) => marksheetForm.setValue('examName', value)}
                        validation={marksheetForm.formState.errors.examName ? 'error' : 'none'}
                        errorText={marksheetForm.formState.errors.examName?.message}
                      />

                      <SmartInput
                        label="Exam Year"
                        labelBn="পরীক্ষার বছর"
                        placeholder="2025"
                        required
                        icon="event"
                        value={marksheetForm.watch('examYear')}
                        onChange={(value) => marksheetForm.setValue('examYear', value)}
                        validation={marksheetForm.formState.errors.examYear ? 'error' : 'none'}
                        errorText={marksheetForm.formState.errors.examYear?.message}
                      />

                      <SmartInput
                        label="Session"
                        labelBn="সেশন"
                        placeholder="২০২৪-২০২৫"
                        required
                        icon="calendar_month"
                        value={marksheetForm.watch('session')}
                        onChange={(value) => marksheetForm.setValue('session', value)}
                        validation={marksheetForm.formState.errors.session ? 'error' : 'none'}
                        errorText={marksheetForm.formState.errors.session?.message}
                      />
                    </FieldGroup>

                    <FieldGroup
                      title="প্রতিষ্ঠানের তথ্য"
                      description="স্কুলের নাম ও ঠিকানা"
                      required
                    >
                      <SmartInput
                        label="School Name"
                        labelBn="স্কুলের নাম"
                        placeholder="ঢাকা পাবলিক স্কুল"
                        required
                        icon="school"
                        value={marksheetForm.watch('schoolName')}
                        onChange={(value) => marksheetForm.setValue('schoolName', value)}
                        validation={marksheetForm.formState.errors.schoolName ? 'error' : 'none'}
                        errorText={marksheetForm.formState.errors.schoolName?.message}
                      />

                      <SmartInput
                        label="School Address"
                        labelBn="স্কুলের ঠিকানা"
                        placeholder="মিরপুর-১০, ঢাকা-১২১৬"
                        required
                        icon="location_on"
                        value={marksheetForm.watch('schoolAddress')}
                        onChange={(value) => marksheetForm.setValue('schoolAddress', value)}
                        validation={marksheetForm.formState.errors.schoolAddress ? 'error' : 'none'}
                        errorText={marksheetForm.formState.errors.schoolAddress?.message}
                      />
                    </FieldGroup>
                  </FormSection>

                  {/* Marks Entry Section */}
                  <FormSection
                    title="Marks Entry"
                    titleBn="নম্বর প্রবেশ"
                    description="বিষয়ভিত্তিক নম্বর প্রবেশ করুন"
                    icon="edit"
                    isActive={currentStep === 'marks-entry'}
                    isCompleted={false}
                  >
                    <FieldGroup
                      title="বিষয়ভিত্তিক নম্বর"
                      description="প্রতিটি বিষয়ের প্রাপ্ত নম্বর প্রবেশ করুন"
                      required
                    >
                      <div className="space-y-4">
                        {marksheetForm.watch('subjects').map((subject, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">বিষয়</label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{subject.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পূর্ণমান</label>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{subject.fullMarks}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">প্রাপ্ত নম্বর</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={subject.fullMarks}
                                  value={subject.obtainedMarks}
                                  onChange={(e) => updateSubjectMarks(index, parseInt(e.target.value) || 0)}
                                  className="h-10 border-2 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">গ্রেড</label>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{subject.grade}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">জিপিএ</label>
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{subject.gpa?.toFixed(1)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700 mt-6">
                        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">সামগ্রিক ফলাফল</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-blue-600 dark:text-blue-400">মোট নম্বর</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{marksheetForm.watch('totalMarks')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-600 dark:text-blue-400">প্রাপ্ত নম্বর</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{marksheetForm.watch('obtainedTotal')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-600 dark:text-blue-400">শতকরা</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{marksheetForm.watch('percentage')}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-600 dark:text-blue-400">গ্রেড</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{marksheetForm.watch('overallGrade')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-600 dark:text-blue-400">জিপিএ</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{marksheetForm.watch('gpa')?.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartInput
                          label="Position/Rank"
                          labelBn="অবস্থান/পদবী"
                          placeholder="৩য়"
                          icon="emoji_events"
                          value={marksheetForm.watch('position')}
                          onChange={(value) => marksheetForm.setValue('position', value)}
                        />

                        <SmartTextarea
                          label="Remarks"
                          labelBn="মন্তব্য"
                          placeholder="চমৎকার ফলাফল"
                          icon="comment"
                          rows={2}
                          value={marksheetForm.watch('remarks')}
                          onChange={(value) => marksheetForm.setValue('remarks', value)}
                        />
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
                        <span className="material-icons text-4xl text-gray-400 mb-2">assessment</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          মার্কশিট প্রিভিউ এখানে দেখানো হবে
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">শিক্ষার্থী:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {marksheetForm.watch('studentNameBn') || marksheetForm.watch('studentName') || 'নাম নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">শ্রেণি:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {marksheetForm.watch('className') || 'শ্রেণি নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">জিপিএ:</span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            {marksheetForm.watch('gpa')?.toFixed(2) || '০.০০'}
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
                title="মার্কশিট প্রিভিউ"
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
                <div id="marksheet-preview" className="bg-white p-8 rounded-lg border border-gray-200 max-w-4xl mx-auto">
                  <div className="text-center mb-8 border-b pb-6">
                    <h1 className="text-3xl font-bold mb-2">{marksheetForm.getValues('schoolName')}</h1>
                    <p className="text-lg text-gray-600 mb-2">{marksheetForm.getValues('schoolAddress')}</p>
                    <div className="text-2xl font-bold text-blue-600 border border-blue-200 rounded-lg py-3 px-6 mx-auto w-max bg-blue-50">
                      মার্কশিট (MARKSHEET)
                    </div>
                    <p className="text-lg mt-2">{marksheetForm.getValues('examName')} - {marksheetForm.getValues('examYear')}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6 bg-gray-50 p-6 rounded-lg">
                    <div className="space-y-2">
                      <p><strong>শিক্ষার্থীর নাম:</strong> {marksheetForm.getValues('studentNameBn') || marksheetForm.getValues('studentName')}</p>
                      <p><strong>পিতার নাম:</strong> {marksheetForm.getValues('fatherName')}</p>
                      <p><strong>মাতার নাম:</strong> {marksheetForm.getValues('motherName')}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>শ্রেণি:</strong> {marksheetForm.getValues('className')} {marksheetForm.getValues('section') ? `(${marksheetForm.getValues('section')})` : ''}</p>
                      <p><strong>রোল নম্বর:</strong> {marksheetForm.getValues('rollNumber')}</p>
                      <p><strong>সেশন:</strong> {marksheetForm.getValues('session')}</p>
                    </div>
                  </div>
                  
                  {/* Marks Table */}
                  <table className="w-full border border-collapse text-sm mb-6">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border p-3 text-left">বিষয়</th>
                        <th className="border p-3 text-center">পূর্ণমান</th>
                        <th className="border p-3 text-center">প্রাপ্ত নম্বর</th>
                        <th className="border p-3 text-center">গ্রেড</th>
                        <th className="border p-3 text-center">জিপিএ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marksheetForm.getValues('subjects').map((subject, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="border p-3 font-medium">{subject.name}</td>
                          <td className="border p-3 text-center">{subject.fullMarks}</td>
                          <td className="border p-3 text-center font-semibold">{subject.obtainedMarks}</td>
                          <td className="border p-3 text-center font-bold text-green-600">{subject.grade}</td>
                          <td className="border p-3 text-center font-bold text-purple-600">{subject.gpa?.toFixed(1)}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-bold">
                        <td className="border p-3">মোট</td>
                        <td className="border p-3 text-center">{marksheetForm.getValues('totalMarks')}</td>
                        <td className="border p-3 text-center">{marksheetForm.getValues('obtainedTotal')}</td>
                        <td className="border p-3 text-center text-green-600">{marksheetForm.getValues('overallGrade')}</td>
                        <td className="border p-3 text-center text-purple-600">{marksheetForm.getValues('gpa')?.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="grid grid-cols-3 gap-6 mb-6 text-center">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">শতকরা হার</p>
                      <p className="text-2xl font-bold text-blue-900">{marksheetForm.getValues('percentage')}%</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">সামগ্রিক গ্রেড</p>
                      <p className="text-2xl font-bold text-green-900">{marksheetForm.getValues('overallGrade')}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600">জিপিএ</p>
                      <p className="text-2xl font-bold text-purple-900">{marksheetForm.getValues('gpa')?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {marksheetForm.getValues('position') && (
                    <div className="text-center mb-4">
                      <p className="text-lg"><strong>মেধা তালিকায় অবস্থান:</strong> {marksheetForm.getValues('position')}</p>
                    </div>
                  )}
                  
                  {marksheetForm.getValues('remarks') && (
                    <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold mb-2">মন্তব্য:</h4>
                      <p>{marksheetForm.getValues('remarks')}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-end mt-12 pt-8 border-t">
                    <div>
                      <p className="text-sm text-gray-600">প্রকাশের তারিখ:</p>
                      <p className="font-semibold">{new Date().toLocaleDateString('bn-BD')}</p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-32 border-b-2 border-gray-300 mb-2"></div>
                      <p className="font-semibold">প্রধান শিক্ষক</p>
                      <p className="text-sm text-gray-600">{marksheetForm.getValues('schoolName')}</p>
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
                marksheetForm.handleSubmit(onMarksheetSubmit)();
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