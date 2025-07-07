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

// Enhanced testimonial schema with proper validation
const testimonialSchema = z.object({
  studentName: z.string().min(2, { message: "শিক্ষার্থীর নাম আবশ্যক" }),
  studentNameBn: z.string().optional(),
  fatherName: z.string().min(2, { message: "পিতার নাম আবশ্যক" }),
  motherName: z.string().min(2, { message: "মাতার নাম আবশ্যক" }),
  dateOfBirth: z.string().min(1, { message: "জন্ম তারিখ আবশ্যক" }),
  academicYear: z.string().min(1, { message: "শিক্ষাবর্ষ নির্বাচন করুন" }),
  enrollmentYear: z.string().min(1, { message: "ভর্তির বছর আবশ্যক" }),
  className: z.string().min(1, { message: "শ্রেণি নির্বাচন করুন" }),
  section: z.string().optional(),
  rollNumber: z.string().min(1, { message: "রোল নম্বর আবশ্যক" }),
  registrationNumber: z.string().optional(),
  passedExam: z.string().min(1, { message: "উত্তীর্ণ পরীক্ষা নির্বাচন করুন" }),
  characterRating: z.string().min(1, { message: "চরিত্র মূল্যায়ন আবশ্যক" }),
  achievements: z.string().optional(),
  conductBehavior: z.string().optional(),
  issueDate: z.string().min(1, { message: "প্রদানের তারিখ আবশ্যক" }),
  remarks: z.string().optional(),
  schoolName: z.string().min(1, { message: "প্রতিষ্ঠানের নাম আবশ্যক" }),
  schoolAddress: z.string().min(1, { message: "প্রতিষ্ঠানের ঠিকানা আবশ্যক" }),
  principalName: z.string().min(1, { message: "প্রধান শিক্ষকের নাম আবশ্যক" })
});

export default function TestimonialsEnhancedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentStep, setCurrentStep] = useState('student-info');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  // Testimonial form setup with enhanced validation
  const testimonialForm = useForm<z.infer<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      studentName: "Mohammad Rahman",
      studentNameBn: "মোহাম্মদ রহমান",
      fatherName: "Abdul Karim",
      motherName: "Fatima Begum",
      dateOfBirth: "2005-05-15",
      academicYear: "2025",
      enrollmentYear: "2020",
      className: "10",
      section: "A",
      rollNumber: "15",
      registrationNumber: "20250015",
      passedExam: "SSC",
      characterRating: "উত্তম",
      achievements: "বিতর্ক প্রতিযোগিতায় প্রথম স্থান",
      conductBehavior: "ভদ্র ও নিয়মানুবর্তী",
      issueDate: new Date().toISOString().split('T')[0],
      remarks: "",
      schoolName: "Dhaka Public School",
      schoolAddress: "Mirpur-10, Dhaka-1216",
      principalName: "Dr. Abdul Mannan"
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
      id: 'academic-info',
      title: 'Academic Information',
      titleBn: 'একাডেমিক তথ্য',
      icon: 'school',
      isCompleted: false,
      isActive: currentStep === 'academic-info'
    },
    {
      id: 'character-assessment',
      title: 'Character Assessment',
      titleBn: 'চরিত্র মূল্যায়ন',
      icon: 'stars',
      isCompleted: false,
      isActive: currentStep === 'character-assessment'
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
    const values = testimonialForm.getValues();
    const requiredFields = ['studentName', 'fatherName', 'motherName', 'className', 'rollNumber', 'passedExam'];
    const filledFields = requiredFields.filter(field => values[field as keyof typeof values]);
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  // Handle form submission
  const onTestimonialSubmit = (data: z.infer<typeof testimonialSchema>) => {
    setIsLoading(true);
    setValidationErrors([]);
    
    console.log("Testimonial Data:", data);
    
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      setCurrentStep('preview');
      toast({
        title: "প্রশংসাপত্র তৈরি হয়েছে",
        description: "আপনার প্রশংসাপত্র সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const testimonialElement = document.getElementById('testimonial-preview');
    if (!testimonialElement) return;

    setIsLoading(true);
    
    try {
      const canvas = await html2canvas(testimonialElement, {
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
      pdf.save(`testimonial-${testimonialForm.getValues('rollNumber')}-${testimonialForm.getValues('academicYear')}.pdf`);
      
      toast({
        title: "পিডিএফ তৈরি হয়েছে",
        description: "আপনার প্রশংসাপত্র পিডিএফ হিসেবে সেভ করা হয়েছে",
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
    testimonialForm.reset();
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
    { value: "10", label: "Class 10", labelBn: "দশম শ্রেণি" },
    { value: "11", label: "Class 11", labelBn: "একাদশ শ্রেণি" },
    { value: "12", label: "Class 12", labelBn: "দ্বাদশ শ্রেণি" }
  ];

  // Exam options
  const examOptions = [
    { value: "JSC", label: "JSC", labelBn: "জুনিয়র স্কুল সার্টিফিকেট" },
    { value: "SSC", label: "SSC", labelBn: "মাধ্যমিক স্কুল সার্টিফিকেট" },
    { value: "HSC", label: "HSC", labelBn: "উচ্চ মাধ্যমিক সার্টিফিকেট" }
  ];

  // Character rating options
  const characterOptions = [
    { value: "অসাধারণ", label: "Excellent", labelBn: "অসাধারণ" },
    { value: "উত্তম", label: "Very Good", labelBn: "উত্তম" },
    { value: "ভালো", label: "Good", labelBn: "ভালো" },
    { value: "সন্তোষজনক", label: "Satisfactory", labelBn: "সন্তোষজনক" }
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <a href="/documents" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">ডকুমেন্ট</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">প্রশংসাপত্র</span>
            </nav>
            
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-2xl p-8 border border-emerald-100 dark:border-emerald-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">workspace_premium</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        প্রশংসাপত্র সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        শিক্ষার্থীদের জন্য পেশাদার প্রশংসাপত্র তৈরি করুন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>সিস্টেম সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>অফিসিয়াল ফরম্যাট</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
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
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-emerald-600 dark:text-emerald-400 text-xl">workspace_premium</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট প্রশংসাপত্র</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">১,২৪৮</div>
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
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">today</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আজ প্রদান</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">১৮</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">নতুন প্রশংসাপত্র</p>
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
                        <span className="material-icons text-yellow-600 dark:text-yellow-400 text-xl">pending</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অপেক্ষমাণ</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৭</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">অনুমোদনের জন্য</p>
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
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">verified</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অনুমোদিত</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">১,২৪১</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">সম্পূর্ণ</p>
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
                <Form {...testimonialForm}>
                  {/* Student Information Section */}
                  <FormSection
                    title="Student Information"
                    titleBn="শিক্ষার্থীর তথ্য"
                    description="শিক্ষার্থীর ব্যক্তিগত ও পারিবারিক তথ্য"
                    icon="person"
                    isActive={currentStep === 'student-info'}
                    isCompleted={currentStep !== 'student-info' && getFormProgress() > 0}
                    progress={currentStep === 'student-info' ? getFormProgress() : undefined}
                  >
                    <FieldGroup
                      title="ব্যক্তিগত তথ্য"
                      description="শিক্ষার্থীর নাম ও জন্ম তথ্য"
                      required
                    >
                      <SmartInput
                        label="Student Name (English)"
                        labelBn="শিক্ষার্থীর নাম (ইংরেজি)"
                        placeholder="Mohammad Rahman"
                        required
                        icon="person"
                        value={testimonialForm.watch('studentName')}
                        onChange={(value) => testimonialForm.setValue('studentName', value)}
                        validation={testimonialForm.formState.errors.studentName ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.studentName?.message}
                      />

                      <SmartInput
                        label="Student Name (Bengali)"
                        labelBn="শিক্ষার্থীর নাম (বাংলা)"
                        placeholder="মোহাম্মদ রহমান"
                        icon="translate"
                        value={testimonialForm.watch('studentNameBn')}
                        onChange={(value) => testimonialForm.setValue('studentNameBn', value)}
                      />

                      <SmartInput
                        label="Date of Birth"
                        labelBn="জন্ম তারিখ"
                        type="date"
                        required
                        icon="cake"
                        value={testimonialForm.watch('dateOfBirth')}
                        onChange={(value) => testimonialForm.setValue('dateOfBirth', value)}
                        validation={testimonialForm.formState.errors.dateOfBirth ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.dateOfBirth?.message}
                      />
                    </FieldGroup>

                    <FieldGroup
                      title="পারিবারিক তথ্য"
                      description="পিতা-মাতার নাম"
                      required
                    >
                      <SmartInput
                        label="Father's Name"
                        labelBn="পিতার নাম"
                        placeholder="Abdul Karim"
                        required
                        icon="man"
                        value={testimonialForm.watch('fatherName')}
                        onChange={(value) => testimonialForm.setValue('fatherName', value)}
                        validation={testimonialForm.formState.errors.fatherName ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.fatherName?.message}
                      />

                      <SmartInput
                        label="Mother's Name"
                        labelBn="মাতার নাম"
                        placeholder="Fatima Begum"
                        required
                        icon="woman"
                        value={testimonialForm.watch('motherName')}
                        onChange={(value) => testimonialForm.setValue('motherName', value)}
                        validation={testimonialForm.formState.errors.motherName ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.motherName?.message}
                      />
                    </FieldGroup>
                  </FormSection>

                  {/* Academic Information Section */}
                  <FormSection
                    title="Academic Information"
                    titleBn="একাডেমিক তথ্য"
                    description="শ্রেণি, রোল ও পরীক্ষার তথ্য"
                    icon="school"
                    isActive={currentStep === 'academic-info'}
                    isCompleted={false}
                  >
                    <FieldGroup
                      title="শ্রেণি তথ্য"
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
                        value={testimonialForm.watch('className')}
                        onChange={(value) => testimonialForm.setValue('className', value)}
                        validation={testimonialForm.formState.errors.className ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.className?.message}
                      />

                      <SmartInput
                        label="Section"
                        labelBn="শাখা"
                        placeholder="A"
                        icon="sort"
                        value={testimonialForm.watch('section')}
                        onChange={(value) => testimonialForm.setValue('section', value)}
                      />

                      <SmartInput
                        label="Roll Number"
                        labelBn="রোল নম্বর"
                        placeholder="15"
                        required
                        icon="tag"
                        value={testimonialForm.watch('rollNumber')}
                        onChange={(value) => testimonialForm.setValue('rollNumber', value)}
                        validation={testimonialForm.formState.errors.rollNumber ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.rollNumber?.message}
                      />

                      <SmartInput
                        label="Registration Number"
                        labelBn="রেজিস্ট্রেশন নম্বর"
                        placeholder="20250015"
                        icon="confirmation_number"
                        value={testimonialForm.watch('registrationNumber')}
                        onChange={(value) => testimonialForm.setValue('registrationNumber', value)}
                      />
                    </FieldGroup>

                    <FieldGroup
                      title="পরীক্ষার তথ্য"
                      description="উত্তীর্ণ পরীক্ষা ও শিক্ষাবর্ষ"
                      required
                    >
                      <SmartSelect
                        label="Passed Exam"
                        labelBn="উত্তীর্ণ পরীক্ষা"
                        placeholder="পরীক্ষা নির্বাচন করুন"
                        required
                        icon="assignment_turned_in"
                        options={examOptions}
                        value={testimonialForm.watch('passedExam')}
                        onChange={(value) => testimonialForm.setValue('passedExam', value)}
                        validation={testimonialForm.formState.errors.passedExam ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.passedExam?.message}
                      />

                      <SmartInput
                        label="Academic Year"
                        labelBn="শিক্ষাবর্ষ"
                        placeholder="২০২৫"
                        required
                        icon="event"
                        value={testimonialForm.watch('academicYear')}
                        onChange={(value) => testimonialForm.setValue('academicYear', value)}
                        validation={testimonialForm.formState.errors.academicYear ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.academicYear?.message}
                      />

                      <SmartInput
                        label="Enrollment Year"
                        labelBn="ভর্তির বছর"
                        placeholder="২০২০"
                        required
                        icon="calendar_month"
                        value={testimonialForm.watch('enrollmentYear')}
                        onChange={(value) => testimonialForm.setValue('enrollmentYear', value)}
                        validation={testimonialForm.formState.errors.enrollmentYear ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.enrollmentYear?.message}
                      />
                    </FieldGroup>
                  </FormSection>

                  {/* Character Assessment Section */}
                  <FormSection
                    title="Character Assessment"
                    titleBn="চরিত্র মূল্যায়ন"
                    description="শিক্ষার্থীর চরিত্র ও কার্যক্রমের মূল্যায়ন"
                    icon="stars"
                    isActive={currentStep === 'character-assessment'}
                    isCompleted={false}
                  >
                    <FieldGroup
                      title="চরিত্র মূল্যায়ন"
                      description="শিক্ষার্থীর আচরণ ও চরিত্র"
                      required
                    >
                      <SmartSelect
                        label="Character Rating"
                        labelBn="চরিত্র মূল্যায়ন"
                        placeholder="মূল্যায়ন নির্বাচন করুন"
                        required
                        icon="star"
                        options={characterOptions}
                        value={testimonialForm.watch('characterRating')}
                        onChange={(value) => testimonialForm.setValue('characterRating', value)}
                        validation={testimonialForm.formState.errors.characterRating ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.characterRating?.message}
                      />

                      <SmartTextarea
                        label="Achievements"
                        labelBn="অর্জন ও পুরস্কার"
                        placeholder="বিতর্ক প্রতিযোগিতায় প্রথম স্থান, সাংস্কৃতিক অনুষ্ঠানে অংশগ্রহণ..."
                        icon="emoji_events"
                        rows={3}
                        value={testimonialForm.watch('achievements')}
                        onChange={(value) => testimonialForm.setValue('achievements', value)}
                      />

                      <SmartTextarea
                        label="Conduct & Behavior"
                        labelBn="আচরণ ও ব্যবহার"
                        placeholder="ভদ্র, নিয়মানুবর্তী, সহপাঠীদের সাথে বন্ধুত্বপূর্ণ..."
                        icon="psychology"
                        rows={3}
                        value={testimonialForm.watch('conductBehavior')}
                        onChange={(value) => testimonialForm.setValue('conductBehavior', value)}
                      />

                      <SmartTextarea
                        label="Remarks"
                        labelBn="মন্তব্য"
                        placeholder="অতিরিক্ত মন্তব্য (যদি থাকে)..."
                        icon="comment"
                        rows={2}
                        value={testimonialForm.watch('remarks')}
                        onChange={(value) => testimonialForm.setValue('remarks', value)}
                      />
                    </FieldGroup>

                    <FieldGroup
                      title="প্রতিষ্ঠানের তথ্য"
                      description="স্কুল ও প্রধান শিক্ষকের তথ্য"
                      required
                    >
                      <SmartInput
                        label="School Name"
                        labelBn="প্রতিষ্ঠানের নাম"
                        placeholder="ঢাকা পাবলিক স্কুল"
                        required
                        icon="school"
                        value={testimonialForm.watch('schoolName')}
                        onChange={(value) => testimonialForm.setValue('schoolName', value)}
                        validation={testimonialForm.formState.errors.schoolName ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.schoolName?.message}
                      />

                      <SmartInput
                        label="School Address"
                        labelBn="প্রতিষ্ঠানের ঠিকানা"
                        placeholder="মিরপুর-১০, ঢাকা-১২১৬"
                        required
                        icon="location_on"
                        value={testimonialForm.watch('schoolAddress')}
                        onChange={(value) => testimonialForm.setValue('schoolAddress', value)}
                        validation={testimonialForm.formState.errors.schoolAddress ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.schoolAddress?.message}
                      />

                      <SmartInput
                        label="Principal Name"
                        labelBn="প্রধান শিক্ষকের নাম"
                        placeholder="ড. আব্দুল মান্নান"
                        required
                        icon="person_pin"
                        value={testimonialForm.watch('principalName')}
                        onChange={(value) => testimonialForm.setValue('principalName', value)}
                        validation={testimonialForm.formState.errors.principalName ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.principalName?.message}
                      />

                      <SmartInput
                        label="Issue Date"
                        labelBn="প্রদানের তারিখ"
                        type="date"
                        required
                        icon="calendar_today"
                        value={testimonialForm.watch('issueDate')}
                        onChange={(value) => testimonialForm.setValue('issueDate', value)}
                        validation={testimonialForm.formState.errors.issueDate ? 'error' : 'none'}
                        errorText={testimonialForm.formState.errors.issueDate?.message}
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
                        <span className="material-icons text-4xl text-gray-400 mb-2">workspace_premium</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          প্রশংসাপত্র প্রিভিউ এখানে দেখানো হবে
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">শিক্ষার্থী:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {testimonialForm.watch('studentNameBn') || testimonialForm.watch('studentName') || 'নাম নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">শ্রেণি:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {testimonialForm.watch('className') || 'শ্রেণি নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">পরীক্ষা:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {testimonialForm.watch('passedExam') || 'পরীক্ষা নেই'}
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
                title="প্রশংসাপত্র প্রিভিউ"
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
                <div id="testimonial-preview" className="bg-white p-8 rounded-lg border border-gray-200 max-w-4xl mx-auto">
                  <div className="text-center mb-8 border-b pb-6">
                    <h1 className="text-3xl font-bold mb-2">{testimonialForm.getValues('schoolName')}</h1>
                    <p className="text-lg text-gray-600 mb-2">{testimonialForm.getValues('schoolAddress')}</p>
                    <div className="text-2xl font-bold text-emerald-600 border border-emerald-200 rounded-lg py-3 px-6 mx-auto w-max bg-emerald-50">
                      প্রশংসাপত্র (TESTIMONIAL)
                    </div>
                  </div>
                  
                  <div className="space-y-6 text-lg">
                    <p className="text-center">
                      এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, <strong>{testimonialForm.getValues('studentNameBn') || testimonialForm.getValues('studentName')}</strong> 
                      (ইংরেজি: {testimonialForm.getValues('studentName')}) 
                      পিতা: <strong>{testimonialForm.getValues('fatherName')}</strong>, 
                      মাতা: <strong>{testimonialForm.getValues('motherName')}</strong> 
                      আমাদের প্রতিষ্ঠানের একজন নিয়মিত শিক্ষার্থী ছিল।
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                      <div className="space-y-2">
                        <p><strong>শ্রেণি:</strong> {testimonialForm.getValues('className')} {testimonialForm.getValues('section') ? `(${testimonialForm.getValues('section')})` : ''}</p>
                        <p><strong>রোল নম্বর:</strong> {testimonialForm.getValues('rollNumber')}</p>
                        <p><strong>রেজিস্ট্রেশন:</strong> {testimonialForm.getValues('registrationNumber')}</p>
                        <p><strong>জন্ম তারিখ:</strong> {new Date(testimonialForm.getValues('dateOfBirth')).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>শিক্ষাবর্ষ:</strong> {testimonialForm.getValues('academicYear')}</p>
                        <p><strong>ভর্তির বছর:</strong> {testimonialForm.getValues('enrollmentYear')}</p>
                        <p><strong>উত্তীর্ণ পরীক্ষা:</strong> {testimonialForm.getValues('passedExam')}</p>
                        <p><strong>চরিত্র:</strong> {testimonialForm.getValues('characterRating')}</p>
                      </div>
                    </div>
                    
                    {testimonialForm.getValues('achievements') && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">অর্জন ও পুরস্কার:</h4>
                        <p>{testimonialForm.getValues('achievements')}</p>
                      </div>
                    )}
                    
                    {testimonialForm.getValues('conductBehavior') && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">আচরণ ও ব্যবহার:</h4>
                        <p>{testimonialForm.getValues('conductBehavior')}</p>
                      </div>
                    )}
                    
                    <p className="text-center">
                      আমি তার উজ্জ্বল ভবিষ্যৎ ও সর্বাঙ্গীণ মঙ্গল কামনা করি।
                    </p>
                    
                    {testimonialForm.getValues('remarks') && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">মন্তব্য:</h4>
                        <p>{testimonialForm.getValues('remarks')}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end mt-12 pt-8 border-t">
                    <div>
                      <p className="text-sm text-gray-600">প্রদানের তারিখ:</p>
                      <p className="font-semibold">{new Date(testimonialForm.getValues('issueDate')).toLocaleDateString('bn-BD')}</p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-32 border-b-2 border-gray-300 mb-2"></div>
                      <p className="font-semibold">{testimonialForm.getValues('principalName')}</p>
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
                testimonialForm.handleSubmit(onTestimonialSubmit)();
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