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

// Define schema for testimonial information
const testimonialSchema = z.object({
  studentName: z.string().min(2, { message: "Student name is required" }),
  studentNameBn: z.string().optional(),
  fatherName: z.string().min(2, { message: "Father's name is required" }),
  motherName: z.string().min(2, { message: "Mother's name is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  academicYear: z.string().min(1, { message: "Academic year is required" }),
  enrollmentYear: z.string().min(1, { message: "Enrollment year is required" }),
  className: z.string().min(1, { message: "Class is required" }),
  section: z.string().optional(),
  rollNumber: z.string().min(1, { message: "Roll number is required" }),
  registrationNumber: z.string().optional(),
  passedExam: z.string().min(1, { message: "Passed exam is required" }),
  characterRating: z.string().optional(),
  achievements: z.string().optional(),
  extracurricular: z.string().optional(),
  attendance: z.string().optional(),
  conductBehavior: z.string().optional(),
  issueDate: z.string().min(1, { message: "Issue date is required" }),
  remarks: z.string().optional(),
  studentPhoto: z.string().optional(),
});

// Schema for testimonial template settings
const templateSchema = z.object({
  layout: z.enum(['1', '2', '4', '9']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'detailed', 'simple', 'custom']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeQRCode: z.boolean(),
  includeWatermark: z.boolean(),
  includeStamp: z.boolean(),
});

export default function TestimonialsPage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  // Testimonial form setup
  const testimonialForm = useForm<z.infer<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      studentName: "Mohammad Rahman",
      studentNameBn: "মোহাম্মদ রহমান",
      fatherName: "Abdul Karim",
      motherName: "Fatima Begum",
      dateOfBirth: "2005-05-15",
      academicYear: "2023",
      enrollmentYear: "2018",
      className: "10",
      section: "A",
      rollNumber: "15",
      registrationNumber: "2018-0042",
      passedExam: "SSC",
      characterRating: "Excellent",
      achievements: "First in class, Science Fair Winner",
      extracurricular: "Cricket Team Captain, Debate Club Secretary",
      attendance: "92%",
      conductBehavior: "Very Good",
      issueDate: "2023-04-10",
      remarks: "A bright student with leadership qualities",
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
      includeStamp: true
    }
  });

  // Handle form submission for generating testimonial
  const onGenerateSubmit = (testimonialData: z.infer<typeof testimonialSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Testimonial Data:", testimonialData);
    console.log("Template Data:", templateData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
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

    const canvas = await html2canvas(testimonialElement, {
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

    pdf.save(`testimonial-${testimonialForm.getValues('studentName').replace(/\s+/g, '-')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার প্রশংসাপত্র পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    testimonialForm.reset();
    templateForm.reset();
  };
  
  // Import students handler
  const handleImportStudents = () => {
    toast({
      title: "আমদানি সফল",
      description: "ডাটাবেস থেকে ৫ জন শিক্ষার্থী আমদানি করা হয়েছে",
    });
    
    setSelectedStudents(["1", "2", "3", "4", "5"]);
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
        title="প্রশংসাপত্র"
        description="শিক্ষার্থীদের প্রশংসাপত্র তৈরি করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(testimonialForm.getValues(), templateForm.getValues()),
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
                    শিক্ষার্থীর বিবরণ
                  </CardTitle>
                  <CardDescription className="text-base">
                    প্রশংসাপত্রের জন্য শিক্ষার্থীর প্রয়োজনীয় তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...testimonialForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="প্রাথমিক তথ্য" 
                        icon="person"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={testimonialForm.control}
                            name="studentName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">শিক্ষার্থীর নাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={testimonialForm.control}
                            name="studentNameBn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">শিক্ষার্থীর নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={testimonialForm.control}
                            name="fatherName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">পিতার নাম</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={testimonialForm.control}
                            name="motherName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">মাতার নাম</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={testimonialForm.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">জন্ম তারিখ</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="cake" type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Academic Information */}
                      <FormSection 
                        title="শিক্ষাগত তথ্য" 
                        icon="school"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={testimonialForm.control}
                              name="enrollmentYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">ভর্তির বছর</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="event" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={testimonialForm.control}
                              name="academicYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">শিক্ষাবর্ষ</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="event" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={testimonialForm.control}
                              name="className"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">শ্রেণী</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="6">Class 6</SelectItem>
                                      <SelectItem value="7">Class 7</SelectItem>
                                      <SelectItem value="8">Class 8</SelectItem>
                                      <SelectItem value="9">Class 9</SelectItem>
                                      <SelectItem value="10">Class 10</SelectItem>
                                      <SelectItem value="11">Class 11</SelectItem>
                                      <SelectItem value="12">Class 12</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={testimonialForm.control}
                              name="section"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">শাখা</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="শাখা নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="A">Section A</SelectItem>
                                      <SelectItem value="B">Section B</SelectItem>
                                      <SelectItem value="C">Section C</SelectItem>
                                      <SelectItem value="D">Section D</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={testimonialForm.control}
                              name="rollNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">রোল নম্বর</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="tag" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={testimonialForm.control}
                              name="registrationNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">রেজিস্ট্রেশন নম্বর</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="app_registration" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={testimonialForm.control}
                            name="passedExam"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">উত্তীর্ণ পরীক্ষা</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="JSC">JSC</SelectItem>
                                    <SelectItem value="SSC">SSC</SelectItem>
                                    <SelectItem value="HSC">HSC</SelectItem>
                                    <SelectItem value="Annual">Annual Exam</SelectItem>
                                    <SelectItem value="Half-yearly">Half-yearly Exam</SelectItem>
                                    <SelectItem value="Final">Final Exam</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Character and Achievements Section */}
                      <FormSection 
                        title="চরিত্র ও অর্জন" 
                        icon="emoji_events"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={testimonialForm.control}
                            name="characterRating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">চারিত্রিক মূল্যায়ন</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="মূল্যায়ন নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Excellent">উৎকৃষ্ট (Excellent)</SelectItem>
                                    <SelectItem value="Very Good">অতি ভাল (Very Good)</SelectItem>
                                    <SelectItem value="Good">ভাল (Good)</SelectItem>
                                    <SelectItem value="Satisfactory">সন্তোষজনক (Satisfactory)</SelectItem>
                                    <SelectItem value="Average">গড় (Average)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={testimonialForm.control}
                            name="achievements"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">অর্জনসমূহ</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="শিক্ষার্থীর বিশেষ অর্জন সম্পর্কে লিখুন"
                                    className="min-h-20"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={testimonialForm.control}
                            name="extracurricular"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">সহশিক্ষা কার্যক্রম</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="শিক্ষার্থীর সহশিক্ষা কার্যক্রমে অংশগ্রহণ সম্পর্কে লিখুন"
                                    className="min-h-20"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={testimonialForm.control}
                              name="attendance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">উপস্থিতির হার</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="percent" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={testimonialForm.control}
                              name="conductBehavior"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">আচরণ</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="আচরণ নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Excellent">উৎকৃষ্ট</SelectItem>
                                      <SelectItem value="Very Good">অতি ভাল</SelectItem>
                                      <SelectItem value="Good">ভাল</SelectItem>
                                      <SelectItem value="Satisfactory">সন্তোষজনক</SelectItem>
                                      <SelectItem value="Average">গড়</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </FormSection>
                      
                      {/* Additional Information */}
                      <FormSection 
                        title="অতিরিক্ত তথ্য" 
                        icon="info"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={testimonialForm.control}
                            name="issueDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">প্রদানের তারিখ</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="calendar_today" type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={testimonialForm.control}
                            name="remarks"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">মন্তব্য</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="শিক্ষার্থী সম্পর্কে যেকোনো অতিরিক্ত মন্তব্য"
                                    className="min-h-20"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                    প্রশংসাপত্র সেটিংস
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
                                  প্রশংসাপত্রে প্রতিষ্ঠানের লোগো দেখাবে
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
                                  প্রশংসাপত্রে অধ্যক্ষের স্বাক্ষর দেখাবে
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
                                  প্রশংসাপত্রে ভেরিফিকেশন QR কোড দেখাবে
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
                                  প্রশংসাপত্রে প্রতিষ্ঠানের ওয়াটারমার্ক দেখাবে
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
                          name="includeStamp"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">সীল</FormLabel>
                                <FormDescription>
                                  প্রশংসাপত্রে প্রতিষ্ঠানের সীলমোহর দেখাবে
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
              <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-2xl relative" id="testimonial-preview">
                {templateForm.getValues("includeWatermark") && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <span className="material-icons text-9xl text-primary">school</span>
                  </div>
                )}
                
                <div className="text-center mb-6 relative">
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
                    <h2 className="text-xl font-semibold text-primary">প্রশংসাপত্র</h2>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-right text-sm text-gray-500 mb-2">
                    প্রশংসাপত্র নং: {new Date().getFullYear()}-{testimonialForm.getValues("rollNumber").padStart(3, '0')}
                  </p>
                  <p className="text-right text-sm text-gray-500">
                    তারিখ: {new Date(testimonialForm.getValues("issueDate")).toLocaleDateString('bn-BD')}
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-justify leading-relaxed">
                      এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, <span className="font-semibold">{testimonialForm.getValues("studentNameBn")}</span>, 
                      পিতা: <span className="font-semibold">{testimonialForm.getValues("fatherName")}</span>, 
                      মাতা: <span className="font-semibold">{testimonialForm.getValues("motherName")}</span>, 
                      জন্ম তারিখ: <span className="font-semibold">{new Date(testimonialForm.getValues("dateOfBirth")).toLocaleDateString('bn-BD')}</span>, 
                      আমাদের প্রতিষ্ঠানের <span className="font-semibold">{testimonialForm.getValues("className")} {testimonialForm.getValues("section")}</span> শ্রেণীর (রোল: <span className="font-semibold">{testimonialForm.getValues("rollNumber")}</span>, রেজি: <span className="font-semibold">{testimonialForm.getValues("registrationNumber")}</span>) একজন নিয়মিত ছাত্র/ছাত্রী ছিল।
                    </p>
                    
                    <p className="text-justify leading-relaxed">
                      সে {testimonialForm.getValues("enrollmentYear")} সালে আমাদের প্রতিষ্ঠানে ভর্তি হয় এবং {testimonialForm.getValues("academicYear")} শিক্ষাবর্ষে <span className="font-semibold">{testimonialForm.getValues("passedExam")}</span> পরীক্ষায় উত্তীর্ণ হয়েছে।
                    </p>
                    
                    <p className="text-justify leading-relaxed">
                      প্রতিষ্ঠানে অধ্যয়নকালে সে সর্বদা <span className="font-semibold">{
                        testimonialForm.getValues("characterRating") === "Excellent" ? "উৎকৃষ্ট" :
                        testimonialForm.getValues("characterRating") === "Very Good" ? "অতি ভাল" :
                        testimonialForm.getValues("characterRating") === "Good" ? "ভাল" :
                        testimonialForm.getValues("characterRating") === "Satisfactory" ? "সন্তোষজনক" : "গড়"
                      }</span> আচরণ প্রদর্শন করেছে। এছাড়া প্রতিষ্ঠানে তার উপস্থিতির হার <span className="font-semibold">{testimonialForm.getValues("attendance")}</span>।
                    </p>
                  </div>

                  {testimonialForm.getValues("achievements") && (
                    <div>
                      <h3 className="font-semibold text-primary mb-1">অর্জনসমূহ:</h3>
                      <p className="text-justify leading-relaxed">
                        {testimonialForm.getValues("achievements")}
                      </p>
                    </div>
                  )}
                  
                  {testimonialForm.getValues("extracurricular") && (
                    <div>
                      <h3 className="font-semibold text-primary mb-1">সহশিক্ষা কার্যক্রম:</h3>
                      <p className="text-justify leading-relaxed">
                        {testimonialForm.getValues("extracurricular")}
                      </p>
                    </div>
                  )}
                  
                  {testimonialForm.getValues("remarks") && (
                    <div>
                      <h3 className="font-semibold text-primary mb-1">মন্তব্য:</h3>
                      <p className="text-justify leading-relaxed">
                        {testimonialForm.getValues("remarks")}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-justify leading-relaxed">
                    আমরা তার সার্বিক মঙ্গল ও উজ্জ্বল ভবিষ্যৎ কামনা করি।
                  </p>
                </div>
                
                <div className="mt-12 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="min-h-12">
                      {templateForm.getValues("includeStamp") && (
                        <div className="flex justify-center items-center min-h-20">
                          <div className="h-16 w-16 rounded-full border-2 border-primary/50 flex items-center justify-center opacity-50">
                            <span className="material-icons text-primary text-xs">school</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <p className="text-sm">প্রধান শিক্ষক/শিক্ষিকা</p>
                      <p className="text-xs text-gray-500">ঢাকা পাবলিক স্কুল অ্যান্ড কলেজ</p>
                    </div>
                  </div>
                  
                  {templateForm.getValues("includeSignature") && (
                    <div className="text-center">
                      <div className="min-h-12 flex items-end justify-center mb-1">
                        <div className="border-b border-gray-900 w-24">
                          <div className="text-xs italic text-gray-500 -mb-2">signature</div>
                        </div>
                      </div>
                      <div className="border-t border-gray-300 pt-2">
                        <p className="text-sm">অধ্যক্ষ</p>
                        <p className="text-xs text-gray-500">ঢাকা পাবলিক স্কুল অ্যান্ড কলেজ</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {templateForm.getValues("includeQRCode") && (
                  <div className="absolute bottom-4 right-4 h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                    <span className="material-icons text-gray-400">qr_code_2</span>
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
                একসাথে প্রশংসাপত্র তৈরি করুন
              </CardTitle>
              <CardDescription>
                একই সাথে একাধিক শিক্ষার্থীর প্রশংসাপত্র তৈরি করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <h3 className="text-base font-medium">শিক্ষার্থী নির্বাচন করুন</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs h-8 px-2 gap-1"
                      onClick={handleImportStudents}
                    >
                      <span className="material-icons text-sm">download</span>
                      আমদানি করুন
                    </Button>
                  </div>
                  
                  {selectedStudents.length === 0 ? (
                    <div className="border rounded-lg p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <span className="material-icons text-4xl text-muted-foreground">person_search</span>
                      </div>
                      <p className="text-muted-foreground">
                        কোন শিক্ষার্থী নির্বাচন করা হয়নি। ডাটাবেস থেকে আমদানি করুন বা নতুন তৈরি করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg divide-y">
                      {selectedStudents.map((id) => (
                        <div key={id} className="flex items-center p-3 justify-between">
                          <div className="flex items-center gap-3">
                            <span className="material-icons text-muted-foreground">person</span>
                            <div>
                              <p className="font-medium">শিক্ষার্থী #{id}</p>
                              <p className="text-sm text-muted-foreground">Class {Math.floor(Math.random() * 6) + 6}</p>
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
                  <h3 className="text-base font-medium mb-3">ব্যাচ প্রোসেসিং অপশন</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">একই টেমপ্লেট ব্যবহার করুন</FormLabel>
                        <FormDescription>
                          সব শিক্ষার্থীর জন্য একই ফরম্যাট ব্যবহার করুন
                        </FormDescription>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">একটি ফাইলে সংরক্ষণ করুন</FormLabel>
                        <FormDescription>
                          সবগুলো প্রশংসাপত্র একটি পিডিএফ ফাইলে রাখুন
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
                        স্ট্যান্ডার্ড প্রশংসাপত্র
                      </label>
                      <p className="text-sm text-muted-foreground">
                        সাধারণ প্রশংসাপত্র টেমপ্লেট
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
                        বিস্তারিত প্রশংসাপত্র
                      </label>
                      <p className="text-sm text-muted-foreground">
                        অতিরিক্ত তথ্য সহ বিস্তারিত প্রশংসাপত্র
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
                        সাধারণ প্রশংসাপত্র
                      </label>
                      <p className="text-sm text-muted-foreground">
                        ন্যূনতম তথ্য সহ সহজ প্রশংসাপত্র
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
                সাম্প্রতিক তৈরি করা প্রশংসাপত্র
              </CardTitle>
              <CardDescription>
                আপনার সাম্প্রতিক তৈরি করা প্রশংসাপত্র দেখুন
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
                      আপনি এখনও কোন প্রশংসাপত্র তৈরি করেননি।
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