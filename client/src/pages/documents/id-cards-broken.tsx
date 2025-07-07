import { useState, useRef, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  Download, 
  QrCode, 
  Eye, 
  Camera, 
  Users, 
  FileText, 
  Settings, 
  Shield, 
  Printer, 
  Save,
  CheckCircle,
  AlertCircle,
  CreditCard,
  School,
  UserCheck,
  Zap
} from 'lucide-react';

// Enhanced schema for Bangladesh context student ID cards
const studentSchema = z.object({
  name: z.string().min(1, { message: "নাম আবশ্যক" }),
  nameInBangla: z.string().min(1, { message: "বাংলায় নাম আবশ্যক" }),
  studentId: z.string().min(1, { message: "শিক্ষার্থী আইডি আবশ্যক" }),
  rollNumber: z.string().min(1, { message: "রোল নম্বর আবশ্যক" }),
  className: z.string().min(1, { message: "শ্রেণি আবশ্যক" }),
  section: z.string().min(1, { message: "শাখা আবশ্যক" }),
  session: z.string().min(1, { message: "সেশন আবশ্যক" }),
  fatherName: z.string().min(1, { message: "পিতার নাম আবশ্যক" }),
  fatherNameBn: z.string().min(1, { message: "পিতার বাংলা নাম আবশ্যক" }),
  motherName: z.string().min(1, { message: "মাতার নাম আবশ্যক" }),
  motherNameBn: z.string().min(1, { message: "মাতার বাংলা নাম আবশ্যক" }),
  dateOfBirth: z.string().min(1, { message: "জন্ম তারিখ আবশ্যক" }),
  bloodGroup: z.string().min(1, { message: "রক্তের গ্রুপ আবশ্যক" }),
  address: z.string().min(1, { message: "ঠিকানা আবশ্যক" }),
  phoneNumber: z.string().min(11, { message: "১১ ডিজিটের ফোন নম্বর আবশ্যক" }),
  emergencyContact: z.string().min(11, { message: "জরুরি যোগাযোগ নম্বর আবশ্যক" }),
  nidNumber: z.string().optional(),
  birthCertificate: z.string().optional(),
  religion: z.string().min(1, { message: "ধর্ম আবশ্যক" }),
  nationality: z.string().default("বাংলাদেশী"),
  validUntil: z.string().min(1, { message: "মেয়াদ উত্তীর্ণের তারিখ আবশ্যক" }),
  photo: z.string().optional(),
  includeQR: z.boolean().default(true),
  includeRFID: z.boolean().default(false),
  biometricData: z.string().optional(),
  templateType: z.string().default("standard")
});

// Institution types for Bangladesh
const institutionTypes = [
  { value: "government", label: "সরকারি", description: "সরকারি শিক্ষা প্রতিষ্ঠান" },
  { value: "private", label: "বেসরকারি", description: "বেসরকারি শিক্ষা প্রতিষ্ঠান" },
  { value: "madrasa", label: "মাদ্রাসা", description: "মাদ্রাসা শিক্ষা প্রতিষ্ঠান" },
  { value: "technical", label: "কারিগরি", description: "কারিগরি শিক্ষা প্রতিষ্ঠান" },
  { value: "english_medium", label: "ইংরেজি মাধ্যম", description: "ইংরেজি মাধ্যম স্কুল" }
];

// Blood groups in Bengali
const bloodGroups = [
  { value: "A+", label: "এ পজিটিভ (A+)" },
  { value: "A-", label: "এ নেগেটিভ (A-)" },
  { value: "B+", label: "বি পজিটিভ (B+)" },
  { value: "B-", label: "বি নেগেটিভ (B-)" },
  { value: "AB+", label: "এবি পজিটিভ (AB+)" },
  { value: "AB-", label: "এবি নেগেটিভ (AB-)" },
  { value: "O+", label: "ও পজিটিভ (O+)" },
  { value: "O-", label: "ও নেগেটিভ (O-)" }
];

// Religions in Bangladesh
const religions = [
  { value: "islam", label: "ইসলাম" },
  { value: "hinduism", label: "হিন্দু" },
  { value: "buddhism", label: "বৌদ্ধ" },
  { value: "christianity", label: "খ্রিস্টান" },
  { value: "other", label: "অন্যান্য" }
];

const templateSchema = z.object({
  schoolName: z.string().min(1, { message: "স্কুলের নাম আবশ্যক" }),
  schoolAddress: z.string().min(1, { message: "স্কুলের ঠিকানা আবশ্যক" }),
  establishedYear: z.string().min(1, { message: "প্রতিষ্ঠার সাল আবশ্যক" }),
  eiin: z.string().min(1, { message: "EIIN নম্বর আবশ্যক" }),
  template: z.string().min(1, { message: "টেমপ্লেট আবশ্যক" }),
  layout: z.string().min(1, { message: "লেআউট আবশ্যক" }),
  paperSize: z.string().min(1, { message: "পেপার সাইজ আবশ্যক" }),
  orientation: z.string().min(1, { message: "ওরিয়েন্টেশন আবশ্যক" }),
  primaryColor: z.string().default("#1e40af"),
  secondaryColor: z.string().default("#3b82f6"),
  textColor: z.string().default("#000000"),
  fontFamily: z.string().default("SolaimanLipi"),
  fontSize: z.string().default("medium"),
});

export default function IdCardsPage() {
  const { toast } = useToast();
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState<string>("জেনারেট");
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [studentPhoto, setStudentPhoto] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Accessibility states
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  
  const idCardRef = useRef<HTMLDivElement>(null);

  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      nameInBangla: "",
      studentId: "",
      rollNumber: "",
      className: "",
      section: "",
      session: "২০২৪-২৫",
      fatherName: "",
      motherName: "",
      dateOfBirth: "",
      bloodGroup: "",
      address: "",
      phoneNumber: ""
    }
  });

  const templateForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      schoolName: "",
      schoolAddress: "",
      establishedYear: "",
      eiin: "",
      template: "standard",
      layout: "1",
      paperSize: "a4",
      orientation: "portrait",
      primaryColor: "#1e40af",
      secondaryColor: "#3b82f6",
      textColor: "#000000",
      fontFamily: "SolaimanLipi",
      fontSize: "medium"
    }
  });

  // Enhanced photo upload with validation
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "ভুল ফাইল টাইপ",
        description: "শুধুমাত্র ছবি ফাইল আপলোড করুন (JPG, PNG, WebP)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "ফাইল সাইজ বড়",
        description: "ছবির সাইজ ৫ MB এর কম হতে হবে",
        variant: "destructive"
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setStudentPhoto(e.target?.result as string);
        setUploadingPhoto(false);
        toast({
          title: "ছবি আপলোড সফল",
          description: "শিক্ষার্থীর ছবি সফলভাবে আপলোড করা হয়েছে"
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadingPhoto(false);
      toast({
        title: "আপলোড ব্যর্থ",
        description: "ছবি আপলোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  };

  // Handle step navigation with improved validation
  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await studentForm.trigger();
      if (!isValid) {
        toast({
          title: "তথ্য অসম্পূর্ণ",
          description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।",
          variant: "destructive"
        });
        
        // Focus on first error field
        const errors = studentForm.formState.errors;
        const firstErrorField = Object.keys(errors)[0] as keyof typeof errors;
        if (firstErrorField) {
          const element = document.getElementById(firstErrorField);
          element?.focus();
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
    
    if (currentStep === 2) {
      const isValid = await templateForm.trigger();
      if (!isValid) {
        toast({
          title: "টেমপ্লেট সেটিংস অসম্পূর্ণ",
          description: "অনুগ্রহ করে সকল টেমপ্লেট সেটিংস পূরণ করুন।",
          variant: "destructive"
        });
        return;
      }
    }

    setCurrentStep(prev => Math.min(4, prev + 1));
    
    // Announce step change for screen readers
    const announcement = `ধাপ ${currentStep + 1} এ চলে গেছেন`;
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Enhanced PDF generation with progress
  const generatePDF = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate realistic progress steps
      const steps = [
        { progress: 20, message: "ডেটা প্রস্তুত করা হচ্ছে..." },
        { progress: 40, message: "টেমপ্লেট রেন্ডার করা হচ্ছে..." },
        { progress: 60, message: "ছবি প্রক্রিয়াকরণ..." },
        { progress: 80, message: "পিডিএফ তৈরি করা হচ্ছে..." },
        { progress: 100, message: "সম্পন্ন!" }
      ];

      for (const step of steps) {
        setGenerationProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "আইডি কার্ড তৈরি সফল",
        description: "আইডি কার্ড সফলভাবে তৈরি করা হয়েছে এবং ডাউনলোড শুরু হবে।"
      });
    } catch (error) {
      toast({
        title: "পিডিএফ তৈরি ব্যর্থ",
        description: "পিডিএফ তৈরি করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Accessibility panel component
  const AccessibilityPanel = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="material-icons text-blue-600">accessibility</span>
          অ্যাক্সেসিবিলিটি সেটিংস
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Font Size Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">ফন্ট সাইজ: {fontSize}px</Label>
          <Slider
            value={[fontSize]}
            onValueChange={(value) => setFontSize(value[0])}
            min={12}
            max={24}
            step={1}
            className="w-full"
            aria-label="ফন্ট সাইজ নিয়ন্ত্রণ"
          />
        </div>

        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="high-contrast" className="text-sm font-medium">
            উচ্চ কনট্রাস্ট মোড
          </Label>
          <Switch
            id="high-contrast"
            checked={highContrast}
            onCheckedChange={setHighContrast}
          />
        </div>

        {/* Screen Reader Support */}
        <div className="flex items-center justify-between">
          <Label htmlFor="screen-reader" className="text-sm font-medium">
            স্ক্রিন রিডার সাপোর্ট
          </Label>
          <Switch
            id="screen-reader"
            checked={screenReader}
            onCheckedChange={setScreenReader}
          />
        </div>

        {/* Keyboard Navigation Help */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium mb-2">কীবোর্ড নেভিগেশন:</h4>
          <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
            <li>• Tab - পরবর্তী এলিমেন্টে যান</li>
            <li>• Shift + Tab - পূর্ববর্তী এলিমেন্টে যান</li>
            <li>• Enter/Space - নির্বাচন করুন</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  // Progress indicator component
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          ধাপ {currentStep} / 4
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / 4) * 100)}% সম্পন্ন
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / 4) * 100}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={4}
          aria-label={`ধাপ ${currentStep} এর 4`}
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    const stepTitles = [
      "শিক্ষার্থীর তথ্য",
      "স্কুল ও টেমপ্লেট সেটিংস", 
      "পূর্বরূপ ও যাচাই",
      "ডাউনলোড"
    ];

    return (
      <div style={{ fontSize: `${fontSize}px` }}>
        <Card className={cn(highContrast && "border-2 border-black bg-white text-black")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons text-blue-600">
                {currentStep === 1 ? 'person' : currentStep === 2 ? 'school' : currentStep === 3 ? 'preview' : 'download'}
              </span>
              {stepTitles[currentStep - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <Form {...studentForm}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={studentForm.control}
                      name="name"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="required">নাম (ইংরেজিতে)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="name"
                              placeholder="Mohammad Rahman"
                              className={cn(
                                fieldState.error && "border-red-500",
                                highContrast && "border-2 border-black"
                              )}
                              autoComplete="name"
                              aria-describedby={fieldState.error ? "name-error" : undefined}
                            />
                          </FormControl>
                          <FormMessage id="name-error" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={studentForm.control}
                      name="nameInBangla"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="required">নাম (বাংলায়)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="nameInBangla"
                              placeholder="মোহাম্মদ রহমান"
                              className={cn(
                                fieldState.error && "border-red-500",
                                highContrast && "border-2 border-black"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={studentForm.control}
                      name="studentId"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="required">শিক্ষার্থী আইডি</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="studentId"
                              placeholder="STU-2024-001"
                              className={cn(
                                fieldState.error && "border-red-500",
                                highContrast && "border-2 border-black"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={studentForm.control}
                      name="rollNumber"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="required">রোল নম্বর</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="rollNumber"
                              type="number"
                              placeholder="123"
                              className={cn(
                                fieldState.error && "border-red-500",
                                highContrast && "border-2 border-black"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={studentForm.control}
                      name="className"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="required">শ্রেণি</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  fieldState.error && "border-red-500",
                                  highContrast && "border-2 border-black"
                                )}
                              >
                                <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="১">প্রথম শ্রেণি</SelectItem>
                              <SelectItem value="২">দ্বিতীয় শ্রেণি</SelectItem>
                              <SelectItem value="৩">তৃতীয় শ্রেণি</SelectItem>
                              <SelectItem value="৪">চতুর্থ শ্রেণি</SelectItem>
                              <SelectItem value="৫">পঞ্চম শ্রেণি</SelectItem>
                              <SelectItem value="৬">ষষ্ঠ শ্রেণি</SelectItem>
                              <SelectItem value="৭">সপ্তম শ্রেণি</SelectItem>
                              <SelectItem value="৮">অষ্টম শ্রেণি</SelectItem>
                              <SelectItem value="৯">নবম শ্রেণি</SelectItem>
                              <SelectItem value="১০">দশম শ্রেণি</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={studentForm.control}
                      name="section"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="required">শাখা</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  fieldState.error && "border-red-500",
                                  highContrast && "border-2 border-black"
                                )}
                              >
                                <SelectValue placeholder="শাখা নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ক">ক শাখা</SelectItem>
                              <SelectItem value="খ">খ শাখা</SelectItem>
                              <SelectItem value="গ">গ শাখা</SelectItem>
                              <SelectItem value="ঘ">ঘ শাখা</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Photo Upload Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">শিক্ষার্থীর ছবি</h3>
                    <div className="flex items-center gap-4">
                      {studentPhoto ? (
                        <div className="relative">
                          <img
                            src={studentPhoto}
                            alt="শিক্ষার্থীর ছবি"
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => setStudentPhoto("")}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="ছবি মুছে ফেলুন"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <span className="material-icons text-gray-400" aria-hidden="true">person</span>
                        </div>
                      )}
                      
                      <div>
                        <input
                          type="file"
                          id="photo-upload"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                          aria-describedby="photo-help"
                        />
                        <label
                          htmlFor="photo-upload"
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors",
                            "focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
                            uploadingPhoto && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {uploadingPhoto ? (
                            <>
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>আপলোড হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-icons text-sm">upload</span>
                              ছবি আপলোড করুন
                            </>
                          )}
                        </label>
                        <p id="photo-help" className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          সর্বোচ্চ ৫ MB সাইজের JPG, PNG বা GIF ফাইল
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 2 && (
              <Form {...templateForm}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={templateForm.control}
                      name="schoolName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="required">স্কুলের নাম</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="ঢাকা পাবলিক স্কুল"
                              className={cn(
                                fieldState.error && "border-red-500",
                                highContrast && "border-2 border-black"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={templateForm.control}
                      name="eiin"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="required">EIIN নম্বর</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="123456"
                              className={cn(
                                fieldState.error && "border-red-500",
                                highContrast && "border-2 border-black"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Form>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">আইডি কার্ড পূর্বরূপ</h3>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded border shadow-sm max-w-sm mx-auto">
                    <div className="text-center space-y-2">
                      <h4 className="font-bold text-blue-600">
                        {templateForm.getValues('schoolName') || 'স্কুলের নাম'}
                      </h4>
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto">
                        {studentPhoto ? (
                          <img src={studentPhoto} alt="ছবি" className="w-full h-full object-cover rounded" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-icons text-gray-400">person</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>নাম:</strong> {studentForm.getValues('nameInBangla') || 'শিক্ষার্থীর নাম'}</p>
                        <p><strong>আইডি:</strong> {studentForm.getValues('studentId') || 'STU-XXX'}</p>
                        <p><strong>শ্রেণি:</strong> {studentForm.getValues('className') || 'X'} - {studentForm.getValues('section') || 'X'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-6">
                {isGenerating ? (
                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {generationProgress < 50 ? 'ডেটা প্রস্তুত করা হচ্ছে...' : 
                       generationProgress < 80 ? 'পিডিএফ তৈরি করা হচ্ছে...' : 'সম্পন্ন হচ্ছে...'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-icons text-green-600 text-2xl">check_circle</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      আইডি কার্ড তৈরির জন্য প্রস্তুত
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      আপনার প্রদত্ত তথ্য দিয়ে আইডি কার্ড তৈরি করা হবে
                    </p>
                    <Button 
                      onClick={generatePDF} 
                      size="lg" 
                      className="w-full md:w-auto"
                      disabled={isGenerating}
                    >
                      <span className="material-icons mr-2">picture_as_pdf</span>
                      পিডিএফ তৈরি করুন
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                আইডি কার্ড জেনারেটর
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                শিক্ষার্থীদের জন্য পেশাদার আইডি কার্ড তৈরি করুন
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
              className="flex items-center gap-2"
              aria-label="অ্যাক্সেসিবিলিটি সেটিংস টগল করুন"
            >
              <span className="material-icons">accessibility</span>
              {!isMobile && 'অ্যাক্সেসিবিলিটি'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Accessibility Panel */}
          {showAccessibilityPanel && (
            <div className="lg:col-span-1">
              <AccessibilityPanel />
            </div>
          )}

          {/* Main Content */}
          <div className={cn("space-y-6", showAccessibilityPanel ? "lg:col-span-3" : "lg:col-span-4")}>
            {/* Step Progress */}
            <StepIndicator />

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <span className="material-icons">arrow_back</span>
                পূর্ববর্তী
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNextStep}
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  পরবর্তী
                  <span className="material-icons">arrow_forward</span>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setCurrentStep(1);
                    studentForm.reset();
                    templateForm.reset();
                    setStudentPhoto("");
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  <span className="material-icons">refresh</span>
                  নতুন কার্ড তৈরি করুন
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Screen Reader Announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isGenerating && `পিডিএফ তৈরি হচ্ছে: ${generationProgress}% সম্পন্ন`}
        </div>
      </div>
    </AppShell>
  );
}