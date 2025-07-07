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

// Enhanced schema with better validation
const teacherRoutineSchema = z.object({
  teacherName: z.string().min(2, { message: "শিক্ষকের নাম আবশ্যক" }),
  teacherNameBn: z.string().optional(),
  teacherId: z.string().min(1, { message: "শিক্ষক আইডি আবশ্যক" }),
  designation: z.string().min(1, { message: "পদবী নির্বাচন করুন" }),
  department: z.string().min(1, { message: "বিভাগ নির্বাচন করুন" }),
  subject: z.string().min(1, { message: "বিষয় নির্বাচন করুন" }),
  academicYear: z.string().min(1, { message: "শিক্ষাবর্ষ নির্বাচন করুন" }),
  semester: z.string().min(1, { message: "সেমিস্টার নির্বাচন করুন" }),
  totalPeriods: z.number().min(1, { message: "মোট পিরিয়ড সংখ্যা আবশ্যক" }),
  effectiveFrom: z.string().min(1, { message: "কার্যকর তারিখ আবশ্যক" }),
  schoolName: z.string().min(1, { message: "স্কুলের নাম আবশ্যক" }),
  schoolAddress: z.string().min(1, { message: "স্কুলের ঠিকানা আবশ্যক" })
});

// Sample routine data for demonstration
const sampleRoutine = [
  { day: "শনিবার", periods: ["৯ম-A (১ম)", "১০ম-B (২য়)", "বিরতি", "৮ম-A (৪র্থ)", "৯ম-B (৫ম)", "১০ম-A (৬ষ্ঠ)"] },
  { day: "রবিবার", periods: ["১০ম-A (১ম)", "৮ম-B (২য়)", "বিরতি", "৯ম-A (৪র্থ)", "১০ম-B (৫ম)", "৮ম-A (৬ষ্ঠ)"] },
  { day: "সোমবার", periods: ["৮ম-B (১ম)", "৯ম-A (২য়)", "বিরতি", "১০ম-A (৪র্থ)", "৮ম-B (৫ম)", "৯ম-B (৬ষ্ঠ)"] },
  { day: "মঙ্গলবার", periods: ["৯ম-B (১ম)", "৮ম-A (২য়)", "বিরতি", "১০ম-B (৪র্থ)", "১০ম-A (৫ম)", "৯ম-B (৬ষ্ঠ)"] },
  { day: "বুধবার", periods: ["৯ম-B (১ম)", "১০ম-A (২য়)", "বিরতি", "৮ম-B (৪র্থ)", "৯ম-A (৫ম)", "১০ম-B (৬ষ্ঠ)"] },
  { day: "বৃহস্পতিবার", periods: ["৮ম-A (১ম)", "৯ম-B (২য়)", "বিরতি", "১০ম-B (৪র্থ)", "৮ম-A (৫ম)", "৯ম-A (০ষ্ঠ)"] }
];

const timeSlots = ["৮:০০-৮:৪৫", "৮:৪৫-৯:৩০", "৯:৩০-১০:১৫", "বিরতি", "১০:৩০-১১:১৫", "১১:১৫-১২:০০", "১২:০০-১২:৪৫"];

export default function TeacherRoutinesEnhancedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentStep, setCurrentStep] = useState('teacher-info');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  // Teacher routine form setup with enhanced validation
  const routineForm = useForm<z.infer<typeof teacherRoutineSchema>>({
    resolver: zodResolver(teacherRoutineSchema),
    defaultValues: {
      teacherName: "Abdul Karim",
      teacherNameBn: "আব্দুল করিম",
      teacherId: "T-001",
      designation: "Senior Teacher",
      department: "Mathematics",
      subject: "Mathematics",
      academicYear: "2025",
      semester: "1st Semester",
      totalPeriods: 25,
      effectiveFrom: new Date().toISOString().split('T')[0],
      schoolName: "Dhaka Public School",
      schoolAddress: "Mirpur-10, Dhaka-1216"
    }
  });

  // Form steps for progressive disclosure - Don Norman's Mental Model
  const formSteps = [
    {
      id: 'teacher-info',
      title: 'Teacher Information',
      titleBn: 'শিক্ষকের তথ্য',
      icon: 'person',
      isCompleted: false,
      isActive: currentStep === 'teacher-info'
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
      id: 'routine-config',
      title: 'Routine Configuration',
      titleBn: 'রুটিন কনফিগারেশন',
      icon: 'schedule',
      isCompleted: false,
      isActive: currentStep === 'routine-config'
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

  // Calculate form progress - Luke Wroblewski's Progress Indication
  const getFormProgress = () => {
    const values = routineForm.getValues();
    const requiredFields = ['teacherName', 'teacherId', 'designation', 'department', 'subject'];
    const filledFields = requiredFields.filter(field => values[field as keyof typeof values]);
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  // Handle form submission with validation
  const onRoutineSubmit = (data: z.infer<typeof teacherRoutineSchema>) => {
    setIsLoading(true);
    setValidationErrors([]);
    
    console.log("Teacher Routine Data:", data);
    
    // Simulate validation and processing
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      setCurrentStep('preview');
      toast({
        title: "শিক্ষক রুটিন তৈরি হয়েছে",
        description: "আপনার শিক্ষক রুটিন সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function with enhanced formatting
  const generatePDF = async () => {
    const routineElement = document.getElementById('teacher-routine-preview');
    if (!routineElement) return;

    setIsLoading(true);
    
    try {
      const canvas = await html2canvas(routineElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`teacher-routine-${routineForm.getValues('teacherId')}-${routineForm.getValues('academicYear')}.pdf`);
      
      toast({
        title: "পিডিএফ তৈরি হয়েছে",
        description: "আপনার শিক্ষক রুটিন পিডিএফ হিসেবে সেভ করা হয়েছে",
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
    setCurrentStep('teacher-info');
    routineForm.reset();
    setValidationErrors([]);
    
    toast({
      title: "ফর্ম রিসেট হয়েছে",
      description: "সকল তথ্য পুনরায় প্রবেশ করুন",
    });
  };

  // Designation options with proper Bengali translation
  const designationOptions = [
    { value: "Head Teacher", label: "Head Teacher", labelBn: "প্রধান শিক্ষক" },
    { value: "Assistant Head Teacher", label: "Assistant Head Teacher", labelBn: "সহকারী প্রধান শিক্ষক" },
    { value: "Senior Teacher", label: "Senior Teacher", labelBn: "সিনিয়র শিক্ষক" },
    { value: "Assistant Teacher", label: "Assistant Teacher", labelBn: "সহকারী শিক্ষক" },
    { value: "Junior Teacher", label: "Junior Teacher", labelBn: "জুনিয়র শিক্ষক" }
  ];

  // Department options
  const departmentOptions = [
    { value: "Mathematics", label: "Mathematics", labelBn: "গণিত" },
    { value: "Physics", label: "Physics", labelBn: "পদার্থবিজ্ঞান" },
    { value: "Chemistry", label: "Chemistry", labelBn: "রসায়ন" },
    { value: "Biology", label: "Biology", labelBn: "জীববিজ্ঞান" },
    { value: "Bangla", label: "Bangla", labelBn: "বাংলা" },
    { value: "English", label: "English", labelBn: "ইংরেজি" },
    { value: "Social Science", label: "Social Science", labelBn: "সামাজিক বিজ্ঞান" },
    { value: "ICT", label: "ICT", labelBn: "তথ্য ও যোগাযোগ প্রযুক্তি" }
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section - Don Norman's Clear Mental Model */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <a href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">হোম</a>
              <span className="material-icons text-xs">chevron_right</span>
              <a href="/documents" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">ডকুমেন্ট</a>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">শিক্ষক রুটিন</span>
            </nav>
            
            {/* Hero Header with Status Indicator */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-2xl p-8 border border-purple-100 dark:border-purple-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">schedule</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        শিক্ষক রুটিন সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        পেশাদার শিক্ষক ক্লাস সময়সূচী তৈরি করুন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>সিস্টেম সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>স্মার্ট ফরম্যাট</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <span className="material-icons text-sm">print</span>
                      <span>প্রিন্ট রেডি</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {getFormProgress()}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">সম্পন্ন</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Cards - Visual Hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-purple-600 dark:text-purple-400 text-xl">schedule</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট শিক্ষক</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৪৮</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">রুটিন বরাদ্দ</p>
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
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">access_time</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সাপ্তাহিক পিরিয়ড</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">৩৬০</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">মোট ক্লাস</p>
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
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">class</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">বিষয়</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">১৮</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">বিভিন্ন বিষয়</p>
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
                        <span className="material-icons text-amber-600 dark:text-amber-400 text-xl">meeting_room</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">শ্রেণিকক্ষ</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">২৪</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">ব্যবহারে</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Stepper - Steve Krug's Clear Navigation */}
          <FormStepper 
            steps={formSteps} 
            onStepClick={setCurrentStep} 
          />

          {!previewMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Content - Progressive Disclosure */}
              <div className="lg:col-span-2 space-y-6">
                <Form {...routineForm}>
                  {/* Teacher Information Section */}
                  <FormSection
                    title="Teacher Information"
                    titleBn="শিক্ষকের তথ্য"
                    description="শিক্ষকের মৌলিক পরিচয় ও যোগাযোগের তথ্য"
                    icon="person"
                    isActive={currentStep === 'teacher-info'}
                    isCompleted={currentStep !== 'teacher-info' && getFormProgress() > 0}
                    progress={currentStep === 'teacher-info' ? getFormProgress() : undefined}
                  >
                    <FieldGroup
                      title="ব্যক্তিগত তথ্য"
                      description="শিক্ষকের নাম ও পরিচয়"
                      required
                    >
                      <SmartInput
                        label="Teacher Name (English)"
                        labelBn="শিক্ষকের নাম (ইংরেজি)"
                        placeholder="Abdul Karim"
                        placeholderBn="আব্দুল করিম"
                        required
                        icon="person"
                        value={routineForm.watch('teacherName')}
                        onChange={(value) => routineForm.setValue('teacherName', value)}
                        validation={routineForm.formState.errors.teacherName ? 'error' : 'none'}
                        errorText={routineForm.formState.errors.teacherName?.message}
                      />

                      <SmartInput
                        label="Teacher Name (Bengali)"
                        labelBn="শিক্ষকের নাম (বাংলা)"
                        placeholder="আব্দুল করিম"
                        icon="translate"
                        value={routineForm.watch('teacherNameBn')}
                        onChange={(value) => routineForm.setValue('teacherNameBn', value)}
                      />

                      <SmartInput
                        label="Teacher ID"
                        labelBn="শিক্ষক আইডি"
                        placeholder="T-001"
                        required
                        icon="fingerprint"
                        value={routineForm.watch('teacherId')}
                        onChange={(value) => routineForm.setValue('teacherId', value)}
                        validation={routineForm.formState.errors.teacherId ? 'error' : 'none'}
                        errorText={routineForm.formState.errors.teacherId?.message}
                      />

                      <SmartSelect
                        label="Designation"
                        labelBn="পদবী"
                        placeholder="পদবী নির্বাচন করুন"
                        required
                        icon="work"
                        options={designationOptions}
                        value={routineForm.watch('designation')}
                        onChange={(value) => routineForm.setValue('designation', value)}
                        validation={routineForm.formState.errors.designation ? 'error' : 'none'}
                        errorText={routineForm.formState.errors.designation?.message}
                      />
                    </FieldGroup>
                  </FormSection>

                  {/* Academic Information Section */}
                  <FormSection
                    title="Academic Information"
                    titleBn="একাডেমিক তথ্য"
                    description="বিভাগ, বিষয় ও একাডেমিক সেশনের তথ্য"
                    icon="school"
                    isActive={currentStep === 'academic-info'}
                    isCompleted={false}
                  >
                    <FieldGroup
                      title="বিভাগীয় তথ্য"
                      description="শিক্ষকের বিভাগ ও বিষয়"
                      required
                    >
                      <SmartSelect
                        label="Department"
                        labelBn="বিভাগ"
                        placeholder="বিভাগ নির্বাচন করুন"
                        required
                        icon="domain"
                        options={departmentOptions}
                        value={routineForm.watch('department')}
                        onChange={(value) => routineForm.setValue('department', value)}
                        validation={routineForm.formState.errors.department ? 'error' : 'none'}
                        errorText={routineForm.formState.errors.department?.message}
                      />

                      <SmartInput
                        label="Subject"
                        labelBn="বিষয়"
                        placeholder="গণিত"
                        required
                        icon="menu_book"
                        value={routineForm.watch('subject')}
                        onChange={(value) => routineForm.setValue('subject', value)}
                        validation={routineForm.formState.errors.subject ? 'error' : 'none'}
                        errorText={routineForm.formState.errors.subject?.message}
                      />

                      <SmartInput
                        label="Academic Year"
                        labelBn="শিক্ষাবর্ষ"
                        placeholder="২০২৫"
                        required
                        icon="event"
                        value={routineForm.watch('academicYear')}
                        onChange={(value) => routineForm.setValue('academicYear', value)}
                        validation={routineForm.formState.errors.academicYear ? 'error' : 'none'}
                        errorText={routineForm.formState.errors.academicYear?.message}
                      />

                      <SmartInput
                        label="Semester"
                        labelBn="সেমিস্টার"
                        placeholder="১ম সেমিস্টার"
                        required
                        icon="calendar_month"
                        value={routineForm.watch('semester')}
                        onChange={(value) => routineForm.setValue('semester', value)}
                        validation={routineForm.formState.errors.semester ? 'error' : 'none'}
                        errorText={routineForm.formState.errors.semester?.message}
                      />
                    </FieldGroup>
                  </FormSection>

                  {/* Routine Configuration Section */}
                  <FormSection
                    title="Routine Configuration"
                    titleBn="রুটিন কনফিগারেশন"
                    description="ক্লাসের সময়সূচী ও স্কুলের তথ্য"
                    icon="schedule"
                    isActive={currentStep === 'routine-config'}
                    isCompleted={false}
                  >
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
                        value={routineForm.watch('schoolName')}
                        onChange={(value) => routineForm.setValue('schoolName', value)}
                        validation={routineForm.formState.errors.schoolName ? 'error' : 'none'}
                        errorText={routineForm.formState.errors.schoolName?.message}
                      />

                      <SmartInput
                        label="School Address"
                        labelBn="স্কুলের ঠিকানা"
                        placeholder="মিরপুর-১০, ঢাকা-১২১৬"
                        required
                        icon="location_on"
                        value={routineForm.watch('schoolAddress')}
                        onChange={(value) => routineForm.setValue('schoolAddress', value)}
                        validation={routineForm.formState.errors.schoolAddress ? 'error' : 'none'}
                        errorText={routineForm.formState.errors.schoolAddress?.message}
                      />

                      <SmartInput
                        label="Total Periods"
                        labelBn="সাপ্তাহিক মোট পিরিয়ড"
                        placeholder="25"
                        type="number"
                        icon="format_list_numbered"
                        value={routineForm.watch('totalPeriods').toString()}
                        onChange={(value) => routineForm.setValue('totalPeriods', parseInt(value) || 0)}
                      />

                      <SmartInput
                        label="Effective From"
                        labelBn="কার্যকর তারিখ"
                        type="date"
                        required
                        icon="calendar_today"
                        value={routineForm.watch('effectiveFrom')}
                        onChange={(value) => routineForm.setValue('effectiveFrom', value)}
                        validation={routineForm.formState.errors.effectiveFrom ? 'error' : 'none'}
                        errorText={routineForm.formState.errors.effectiveFrom?.message}
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
                        <span className="material-icons text-4xl text-gray-400 mb-2">schedule</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          রুটিন প্রিভিউ এখানে দেখানো হবে
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">শিক্ষক:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {routineForm.watch('teacherNameBn') || routineForm.watch('teacherName') || 'নাম নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">বিষয়:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {routineForm.watch('subject') || 'বিষয় নেই'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">বিভাগ:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {routineForm.watch('department') || 'বিভাগ নেই'}
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
                title="শিক্ষক রুটিন প্রিভিউ"
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
                <div id="teacher-routine-preview" className="bg-white p-8 rounded-lg border border-gray-200">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">{routineForm.getValues('schoolName')}</h2>
                    <p className="text-gray-600 mb-2">{routineForm.getValues('schoolAddress')}</p>
                    <div className="text-lg font-semibold border-t border-b py-2 px-6 mx-auto w-max">
                      শিক্ষক ক্লাস রুটিন - {routineForm.getValues('academicYear')}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <p><span className="font-medium">শিক্ষকের নাম:</span> {routineForm.getValues('teacherNameBn') || routineForm.getValues('teacherName')}</p>
                      <p><span className="font-medium">শিক্ষক আইডি:</span> {routineForm.getValues('teacherId')}</p>
                      <p><span className="font-medium">পদবী:</span> {routineForm.getValues('designation')}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">বিভাগ:</span> {routineForm.getValues('department')}</p>
                      <p><span className="font-medium">বিষয়:</span> {routineForm.getValues('subject')}</p>
                      <p><span className="font-medium">সেমিস্টার:</span> {routineForm.getValues('semester')}</p>
                    </div>
                  </div>
                  
                  {/* Enhanced Routine Table */}
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-3 text-left font-semibold">সময়</th>
                        {['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার'].map(day => (
                          <th key={day} className="border p-3 text-center font-semibold">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((time, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="border p-3 font-medium bg-gray-100">{time}</td>
                          {sampleRoutine.map((dayData, dayIndex) => (
                            <td key={dayIndex} className="border p-3 text-center">
                              {dayData.periods[index] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-6 text-xs text-gray-500 text-center">
                    তৈরি তারিখ: {new Date().toLocaleDateString('bn-BD')} | 
                    কার্যকর: {routineForm.getValues('effectiveFrom')} থেকে
                  </div>
                </div>
              </PreviewPanel>
            </div>
          )}

          {/* Action Panel - Always Visible */}
          <ActionPanel
            primaryAction={{
              label: previewMode ? 'পিডিএফ তৈরি করুন' : 'প্রিভিউ দেখুন',
              onClick: previewMode ? generatePDF : () => {
                routineForm.handleSubmit(onRoutineSubmit)();
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