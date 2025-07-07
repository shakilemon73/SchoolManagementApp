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
import { Input } from '@/components/ui/input';
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

// Define schema for student information
const studentSchema = z.object({
  name: z.string().min(2, { message: "Student name is required" }),
  nameInBangla: z.string().optional(),
  id: z.string().min(1, { message: "Student ID is required" }),
  className: z.string().min(1, { message: "Class is required" }),
  section: z.string().optional(),
  roll: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  studentPhoto: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  village: z.string().optional(),
  postOffice: z.string().optional(),
  thana: z.string().optional(),
  district: z.string().optional(),
  division: z.string().optional(),
  issuedDate: z.string().optional(),
  validUntil: z.string().optional(),
  schoolName: z.string().optional(),
  schoolCode: z.string().optional(),
  additionalInfo: z.string().optional(),
});

// Schema for ID card template settings
const templateSchema = z.object({
  layout: z.enum(['1', '2', '4', '8']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'modern', 'simple', 'detailed']),
  size: z.enum(['credit', 'portrait', 'landscape', 'custom']),
  includeQRCode: z.boolean(),
  includeBarcode: z.boolean(),
  includeLogo: z.boolean(),
  includeEmergencyInfo: z.boolean(),
  includeAddress: z.boolean(),
  includeParentInfo: z.boolean(),
  includeSignature: z.boolean(),
  includeBorder: z.boolean(),
  includeBirthDate: z.boolean(),
  includeBloodGroup: z.boolean(),
  includeTransportRoute: z.boolean(),
});

export default function IdCardsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  // Student form setup
  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "Mohammad Rahman",
      nameInBangla: "মোহাম্মদ রহমান",
      id: "STD-2023-1001",
      className: "10",
      section: "A",
      roll: "45",
      bloodGroup: "A+",
      religion: "Islam",
      nationality: "Bangladeshi",
      fatherName: "Abdul Karim",
      motherName: "Fatima Begum",
      guardianName: "Abdul Karim",
      guardianPhone: "+880-1712-345678",
      emergencyContact: "+880-1812-345678",
      emergencyContactRelation: "Uncle",
      presentAddress: "House #45, Road #7, Block A, Mirpur-10",
      permanentAddress: "Village: Char Patila, Post Office: Uttar Bedkashi",
      village: "Char Patila",
      postOffice: "Uttar Bedkashi",
      thana: "Koira",
      district: "Khulna",
      division: "Khulna",
      dateOfBirth: "2004-05-15",
      issuedDate: "2023-01-15",
      validUntil: "2023-12-31",
      schoolName: "Dhaka Public School",
      schoolCode: "DPS-123",
      additionalInfo: ""
    }
  });

  // Template form setup
  const templateForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      layout: '1',
      language: 'both',
      template: 'standard',
      size: 'credit',
      includeQRCode: true,
      includeBarcode: false,
      includeLogo: true,
      includeEmergencyInfo: true,
      includeAddress: true,
      includeParentInfo: true,
      includeSignature: true,
      includeBorder: true,
      includeBirthDate: true,
      includeBloodGroup: true,
      includeTransportRoute: false
    }
  });

  // Handle form submission for generating ID card
  const onGenerateSubmit = (studentData: z.infer<typeof studentSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Student Data:", studentData);
    console.log("Template Data:", templateData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "ID card generated",
        description: "Your ID card has been generated successfully",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const idCardElement = document.getElementById('id-card-preview');
    if (!idCardElement) return;

    const canvas = await html2canvas(idCardElement, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Determine PDF dimensions based on ID card size
    const size = templateForm.getValues('size');
    let pdfWidth, pdfHeight, orientation;
    
    if (size === 'credit') {
      pdfWidth = 85.6; // Width in mm
      pdfHeight = 53.98; // Height in mm
      orientation = 'landscape';
    } else if (size === 'portrait') {
      pdfWidth = 85; // Width in mm
      pdfHeight = 110; // Height in mm
      orientation = 'portrait';
    } else if (size === 'landscape') {
      pdfWidth = 110; // Width in mm
      pdfHeight = 85; // Height in mm
      orientation = 'landscape';
    } else {
      // Custom size defaults to A4
      pdfWidth = 210; // Width in mm (A4)
      pdfHeight = 297; // Height in mm (A4)
      orientation = 'portrait';
    }
    
    const pdf = new jsPDF({
      orientation: orientation as any,
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });
    
    // Calculate dimensions based on layout
    const layout = templateForm.getValues('layout');
    
    if (layout === '1') {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    } else if (layout === '2') {
      const imgWidth = pdfWidth / 2;
      const imgHeight = pdfHeight;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.addImage(imgData, 'PNG', imgWidth, 0, imgWidth, imgHeight);
    } else if (layout === '4') {
      const imgWidth = pdfWidth / 2;
      const imgHeight = pdfHeight / 2;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.addImage(imgData, 'PNG', imgWidth, 0, imgWidth, imgHeight);
      pdf.addImage(imgData, 'PNG', 0, imgHeight, imgWidth, imgHeight);
      pdf.addImage(imgData, 'PNG', imgWidth, imgHeight, imgWidth, imgHeight);
    } else if (layout === '8') {
      const imgWidth = pdfWidth / 2;
      const imgHeight = pdfHeight / 4;
      
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
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

    pdf.save(`id-card-${studentForm.getValues('id')}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Your ID card has been saved as a PDF",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    studentForm.reset();
    templateForm.reset();
  };
  
  // Import students handler
  const handleImportStudents = () => {
    toast({
      title: "Import successful",
      description: "5 students imported from the database",
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
        title="আইডি কার্ড"
        description="শিক্ষার্থী এবং শিক্ষকদের আইডি কার্ড তৈরি করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(studentForm.getValues(), templateForm.getValues()),
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
                    আইডি কার্ডের জন্য শিক্ষার্থীর প্রয়োজনীয় তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...studentForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="প্রাথমিক তথ্য" 
                        icon="person"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={studentForm.control}
                            name="name"
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
                            control={studentForm.control}
                            name="nameInBangla"
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
                            control={studentForm.control}
                            name="id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">শিক্ষার্থীর আইডি</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="badge" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={studentForm.control}
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
                              control={studentForm.control}
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
                              control={studentForm.control}
                              name="roll"
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
                              control={studentForm.control}
                              name="dateOfBirth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">জন্ম তারিখ</FormLabel>
                                  <FormControl>
                                    <MobileInput 
                                      type="date" 
                                      leftIcon="calendar_today" 
                                      className="mobile-input" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </FormSection>
                      
                      {/* Parent Information Section */}
                      <FormSection 
                        title={<BnText>পিতা-মাতার তথ্য</BnText>}
                        icon="family_restroom"
                        defaultOpen={false}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={studentForm.control}
                            name="fatherName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">
                                  <BnText>fatherName</BnText>
                                </FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="man" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={studentForm.control}
                            name="motherName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">
                                  <BnText>motherName</BnText>
                                </FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="woman" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={studentForm.control}
                            name="guardianName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">
                                  <BnText>guardianName</BnText>
                                </FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="supervisor_account" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={studentForm.control}
                            name="guardianPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">
                                  <BnText>guardianPhone</BnText>
                                </FormLabel>
                                <FormControl>
                                  <MobileInput 
                                    leftIcon="call" 
                                    placeholder="+880" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Emergency Contact Section */}
                      <FormSection 
                        title={<BnText>জরুরী যোগাযোগ</BnText>}
                        icon="emergency"
                        defaultOpen={false}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={studentForm.control}
                            name="emergencyContact"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">
                                  <BnText>emergencyPhone</BnText>
                                </FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="call" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={studentForm.control}
                            name="emergencyContactRelation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">
                                  <BnText>emergencyRelation</BnText>
                                </FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="people" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Address Section */}
                      <FormSection 
                        title={<BnText>ঠিকানার তথ্য</BnText>}
                        icon="home"
                        defaultOpen={false}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={studentForm.control}
                            name="presentAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">
                                  <BnText>presentAddress</BnText>
                                </FormLabel>
                                <FormControl>
                                  <Textarea 
                                    className="min-h-24 text-base" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={studentForm.control}
                            name="permanentAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">
                                  <BnText>permanentAddress</BnText>
                                </FormLabel>
                                <FormControl>
                                  <Textarea 
                                    className="min-h-24 text-base" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField
                              control={studentForm.control}
                              name="village"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">
                                    <BnText>village</BnText>
                                  </FormLabel>
                                  <FormControl>
                                    <MobileInput {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={studentForm.control}
                              name="postOffice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">
                                    <BnText>postOffice</BnText>
                                  </FormLabel>
                                  <FormControl>
                                    <MobileInput {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField
                              control={studentForm.control}
                              name="thana"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">
                                    <BnText>thana</BnText>
                                  </FormLabel>
                                  <FormControl>
                                    <MobileInput {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={studentForm.control}
                              name="district"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">
                                    <BnText>district</BnText>
                                  </FormLabel>
                                  <FormControl>
                                    <MobileInput {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </FormSection>
                      
                      {/* ID Card Validity Section */}
                      <FormSection 
                        title={<BnText>validityInformation</BnText>}
                        icon="school"
                        defaultOpen={false}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField
                              control={studentForm.control}
                              name="issuedDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">
                                    <BnText>issuedDate</BnText>
                                  </FormLabel>
                                  <FormControl>
                                    <MobileInput 
                                      type="date" 
                                      leftIcon="event_available" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={studentForm.control}
                              name="validUntil"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">
                                    <BnText>validUntil</BnText>
                                  </FormLabel>
                                  <FormControl>
                                    <MobileInput 
                                      type="date" 
                                      leftIcon="event_busy" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField
                              control={studentForm.control}
                              name="schoolName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">
                                    <BnText>schoolName</BnText>
                                  </FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="school" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={studentForm.control}
                              name="schoolCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">
                                    <BnText>schoolCode</BnText>
                                  </FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="qr_code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </FormSection>
                    </div>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Template Options Card */}
              <Card className="border-none shadow-sm mt-5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-primary flex items-center">
                    <span className="material-icons mr-2">dashboard_customize</span>
                    <BnText>templateOptions</BnText>
                  </CardTitle>
                  <CardDescription className="text-base">
                    <BnText>templateOptionsDescription</BnText>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...templateForm}>
                    <div className="space-y-1">
                      <FormSection 
                        title={<BnText>layoutOptions</BnText>}
                        icon="dashboard"
                        defaultOpen={true}
                      >
                        <FormField
                          control={templateForm.control}
                          name="layout"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-wrap gap-6 justify-between"
                                >
                                  <div className="w-[48%] border rounded-lg overflow-hidden bg-background hover:bg-muted/50 transition-colors">
                                    <FormItem className="flex flex-col items-center p-3 m-0 h-full cursor-pointer">
                                      <FormControl>
                                        <RadioGroupItem value="1" className="sr-only" />
                                      </FormControl>
                                      <div className="w-full aspect-video bg-primary/20 flex items-center justify-center mb-2 rounded">
                                        <span className="material-icons text-primary text-2xl">crop_portrait</span>
                                      </div>
                                      <FormLabel className="font-normal text-center">
                                        <BnText>onePerPage</BnText>
                                      </FormLabel>
                                    </FormItem>
                                  </div>
                                  
                                  <div className="w-[48%] border rounded-lg overflow-hidden bg-background hover:bg-muted/50 transition-colors">
                                    <FormItem className="flex flex-col items-center p-3 m-0 h-full cursor-pointer">
                                      <FormControl>
                                        <RadioGroupItem value="2" className="sr-only" />
                                      </FormControl>
                                      <div className="w-full aspect-video bg-primary/20 flex items-center justify-center mb-2 rounded">
                                        <span className="material-icons text-primary text-2xl">dashboard</span>
                                      </div>
                                      <FormLabel className="font-normal text-center">
                                        <BnText>twoPerPage</BnText>
                                      </FormLabel>
                                    </FormItem>
                                  </div>
                                  
                                  <div className="w-[48%] border rounded-lg overflow-hidden bg-background hover:bg-muted/50 transition-colors">
                                    <FormItem className="flex flex-col items-center p-3 m-0 h-full cursor-pointer">
                                      <FormControl>
                                        <RadioGroupItem value="4" className="sr-only" />
                                      </FormControl>
                                      <div className="w-full aspect-video bg-primary/20 flex items-center justify-center mb-2 rounded">
                                        <span className="material-icons text-primary text-2xl">grid_view</span>
                                      </div>
                                      <FormLabel className="font-normal text-center">
                                        <BnText>fourPerPage</BnText>
                                      </FormLabel>
                                    </FormItem>
                                  </div>
                                  
                                  <div className="w-[48%] border rounded-lg overflow-hidden bg-background hover:bg-muted/50 transition-colors">
                                    <FormItem className="flex flex-col items-center p-3 m-0 h-full cursor-pointer">
                                      <FormControl>
                                        <RadioGroupItem value="8" className="sr-only" />
                                      </FormControl>
                                      <div className="w-full aspect-video bg-primary/20 flex items-center justify-center mb-2 rounded">
                                        <span className="material-icons text-primary text-2xl">apps</span>
                                      </div>
                                      <FormLabel className="font-normal text-center">
                                        <BnText>eightPerPage</BnText>
                                      </FormLabel>
                                    </FormItem>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </FormSection>
                      
                      <FormSection 
                        title={<BnText>cardSize</BnText>}
                        icon="crop"
                        defaultOpen={false}
                      >
                        <FormField
                          control={templateForm.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="mobile-select">
                                    <SelectValue placeholder="Select card size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="credit">Credit Card Size</SelectItem>
                                  <SelectItem value="portrait">Portrait ID</SelectItem>
                                  <SelectItem value="landscape">Landscape ID</SelectItem>
                                  <SelectItem value="custom">Custom Size</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </FormSection>
                      
                      <FormSection 
                        title={<BnText>displayOptions</BnText>}
                        icon="settings_display"
                        defaultOpen={false}
                      >
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={templateForm.control}
                              name="includeQRCode"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">QR কোড</FormLabel>
                                    <FormDescription className="text-xs">
                                      আইডি কার্ডে QR কোড অন্তর্ভুক্ত করুন
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
                              name="includeBarcode"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">বারকোড</FormLabel>
                                    <FormDescription className="text-xs">
                                      আইডি কার্ডে বারকোড অন্তর্ভুক্ত করুন
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
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={templateForm.control}
                              name="includeLogo"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">লোগো</FormLabel>
                                    <FormDescription className="text-xs">
                                      আইডি কার্ডে স্কুলের লোগো অন্তর্ভুক্ত করুন
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
                              name="includeEmergencyInfo"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">জরুরী তথ্য</FormLabel>
                                    <FormDescription className="text-xs">
                                      জরুরী যোগাযোগের তথ্য অন্তর্ভুক্ত করুন
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
                      </FormSection>
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
                  className="flex items-center gap-2"
                  onClick={() => setPreviewMode(false)}
                >
                  <span className="material-icons text-sm">arrow_back</span>
                  ফিরে যান
                </Button>
                
                <Button 
                  className="flex items-center gap-2"
                  onClick={generatePDF}
                >
                  <span className="material-icons text-sm">download</span>
                  PDF ডাউনলোড
                </Button>
              </div>
              
              <div className="border rounded-lg p-3 bg-white shadow-sm">
                <div id="id-card-preview" className="aspect-[1.58/1] w-full relative bg-white overflow-hidden rounded">
                  {/* ID Card Preview Content */}
                  <div className="absolute inset-0 flex flex-col">
                    {/* Header */}
                    <div className="bg-primary text-white py-2 px-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden mr-3">
                          <span className="material-icons text-primary text-2xl">school</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{studentForm.getValues('schoolName')}</h3>
                          <p className="text-xs">EIIN: {studentForm.getValues('schoolCode')}</p>
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <p>ID: {studentForm.getValues('id')}</p>
                        <p>Valid until: {studentForm.getValues('validUntil')}</p>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex p-3">
                      {/* Left - Photo */}
                      <div className="w-1/3 flex flex-col items-center">
                        <div className="w-full aspect-[3/4] bg-gray-200 mb-2 flex items-center justify-center">
                          <span className="material-icons text-gray-400 text-4xl">person</span>
                        </div>
                        <div className="w-full text-center mt-1">
                          <p className="text-sm font-medium">Blood Group</p>
                          <p className="text-lg font-bold text-red-600">{studentForm.getValues('bloodGroup')}</p>
                        </div>
                      </div>
                      
                      {/* Right - Details */}
                      <div className="w-2/3 pl-3">
                        <h2 className="text-xl font-bold mb-1">{studentForm.getValues('name')}</h2>
                        <h2 className="text-lg font-semibold mb-2">{studentForm.getValues('nameInBangla')}</h2>
                        
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Class:</span> {studentForm.getValues('className')}{studentForm.getValues('section') ? `-${studentForm.getValues('section')}` : ''}
                          </p>
                          <p>
                            <span className="font-medium">Roll:</span> {studentForm.getValues('roll')}
                          </p>
                          <p>
                            <span className="font-medium">Date of Birth:</span> {studentForm.getValues('dateOfBirth')}
                          </p>
                          
                          <div className="pt-1">
                            <p>
                              <span className="font-medium">Father:</span> {studentForm.getValues('fatherName')}
                            </p>
                            <p>
                              <span className="font-medium">Mother:</span> {studentForm.getValues('motherName')}
                            </p>
                          </div>
                          
                          <div className="pt-1">
                            <p className="font-medium">Contact: {studentForm.getValues('guardianPhone')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-primary/90 text-white py-1 px-3 flex justify-between items-center text-xs">
                      <p>Address: {studentForm.getValues('presentAddress').substring(0, 30)}...</p>
                      <div className="text-right">
                        <p>Issued: {studentForm.getValues('issuedDate')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <div className="bg-muted/30 rounded-lg p-3 max-w-md">
                    <h3 className="font-medium mb-2">প্রিন্টিং নির্দেশনা:</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>সঠিক আকারে প্রিন্ট করতে PDF ডাউনলোড করুন</li>
                      <li>উচ্চ মানের কাগজে প্রিন্ট করুন (৩০০ GSM বা উচ্চতর)</li>
                      <li>প্রিন্টার সেটিংসে "Fit to page" অপশন বন্ধ রাখুন</li>
                      <li>ID কার্ডটি লেমিনেট করার আগে সকল তথ্য যাচাই করুন</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </MobileTabContent>
        
        <MobileTabContent value="batch" activeTab={activeTab}>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-primary flex items-center">
                <span className="material-icons mr-2">groups</span>
                শিক্ষার্থী নির্বাচন করুন
              </CardTitle>
              <CardDescription>
                একাধিক শিক্ষার্থীর জন্য ID কার্ড তৈরি করতে তাদের তালিকা তৈরি করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleImportStudents}
                  >
                    <span className="material-icons text-sm">file_download</span>
                    ডাটাবেস থেকে আমদানি
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <span className="material-icons text-sm">upload_file</span>
                    এক্সেল থেকে আমদানি
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 bg-muted/20">
                  <p className="text-center text-muted-foreground">
                    {selectedStudents.length > 0 
                      ? `${selectedStudents.length} জন শিক্ষার্থী নির্বাচিত হয়েছে`
                      : 'কোন শিক্ষার্থী নির্বাচিত হয়নি'
                    }
                  </p>
                </div>
                
                {selectedStudents.length > 0 && (
                  <div className="mt-6">
                    <Button 
                      className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                    >
                      <span className="material-icons">description</span>
                      সকল ID কার্ড জেনারেট করুন
                    </Button>
                  </div>
                )}
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
                বিভিন্ন টেমপ্লেট থেকে আপনার পছন্দের টেমপ্লেট নির্বাচন করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['standard', 'modern', 'simple', 'detailed'].map((template) => (
                  <div 
                    key={template}
                    className={`border rounded-lg overflow-hidden hover:border-primary/50 cursor-pointer transition-all ${
                      templateForm.getValues('template') === template ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => templateForm.setValue('template', template as any)}
                  >
                    <div className="aspect-video bg-muted/30 flex items-center justify-center">
                      <span className="material-icons text-primary/60 text-5xl">
                        {template === 'standard' && 'badge'}
                        {template === 'modern' && 'credit_card'}
                        {template === 'simple' && 'contact_page'}
                        {template === 'detailed' && 'assignment_ind'}
                      </span>
                    </div>
                    <div className="p-3 bg-background">
                      <h3 className="font-medium capitalize">{template}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template === 'standard' && 'প্রমিত ID কার্ড লেআউট'}
                        {template === 'modern' && 'আধুনিক ডিজাইন সহ ID কার্ড'}
                        {template === 'simple' && 'সাধারণ এবং সহজ ডিজাইন'}
                        {template === 'detailed' && 'বিস্তারিত তথ্য সহ ID কার্ড'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button 
                  className="w-full flex items-center justify-center gap-2 py-5"
                  onClick={() => {
                    toast({
                      title: "টেমপ্লেট সেভ করা হয়েছে",
                      description: "আপনার নির্বাচিত টেমপ্লেট সেভ করা হয়েছে",
                    });
                  }}
                >
                  <span className="material-icons">save</span>
                  টেমপ্লেট সেভ করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </MobileTabContent>
        
        <MobileTabContent value="history" activeTab={activeTab}>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-primary flex items-center">
                <span className="material-icons mr-2">history</span>
                ID কার্ড হিস্ট্রি
              </CardTitle>
              <CardDescription>
                পূর্বে তৈরিকৃত ID কার্ডসমূহ দেখুন এবং ব্যবহার করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border overflow-hidden">
                  <div className="p-4 border-b bg-muted/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">শ্রেণী ১০-এর ID কার্ড</h3>
                        <p className="text-sm text-muted-foreground">১৫ জুন, ২০২৩ • ৪৫ শিক্ষার্থী</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <span className="material-icons">more_vert</span>
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 flex gap-2">
                    <Button variant="outline" size="sm" className="h-9">
                      <span className="material-icons text-sm mr-1">visibility</span>
                      দেখুন
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <span className="material-icons text-sm mr-1">file_download</span>
                      ডাউনলোড
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <span className="material-icons text-sm mr-1">edit</span>
                      এডিট
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-lg border overflow-hidden">
                  <div className="p-4 border-b bg-muted/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">শিক্ষক ID কার্ড</h3>
                        <p className="text-sm text-muted-foreground">২৫ মে, ২০২৩ • ১২ শিক্ষক</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <span className="material-icons">more_vert</span>
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 flex gap-2">
                    <Button variant="outline" size="sm" className="h-9">
                      <span className="material-icons text-sm mr-1">visibility</span>
                      দেখুন
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <span className="material-icons text-sm mr-1">file_download</span>
                      ডাউনলোড
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <span className="material-icons text-sm mr-1">edit</span>
                      এডিট
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-lg border overflow-hidden">
                  <div className="p-4 border-b bg-muted/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">নবম শ্রেণী ID কার্ড</h3>
                        <p className="text-sm text-muted-foreground">১০ মে, ২০২৩ • ৩৮ শিক্ষার্থী</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <span className="material-icons">more_vert</span>
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 flex gap-2">
                    <Button variant="outline" size="sm" className="h-9">
                      <span className="material-icons text-sm mr-1">visibility</span>
                      দেখুন
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <span className="material-icons text-sm mr-1">file_download</span>
                      ডাউনলোড
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <span className="material-icons text-sm mr-1">edit</span>
                      এডিট
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MobileTabContent>
      </MobilePageLayout>
    </AppShell>
  );
}