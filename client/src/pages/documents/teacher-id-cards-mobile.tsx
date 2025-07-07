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

// Define schema for teacher information
const teacherSchema = z.object({
  name: z.string().min(2, { message: "Teacher name is required" }),
  nameInBangla: z.string().optional(),
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
  designation: z.string().min(1, { message: "Designation is required" }),
  department: z.string().optional(),
  joiningDate: z.string().optional(),
  bloodGroup: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  teacherPhoto: z.string().optional(),
  signature: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyContactPerson: z.string().optional(),
  qualifications: z.string().optional(),
  idValidUntil: z.string().optional(),
});

// Schema for ID card template settings
const templateSchema = z.object({
  layout: z.enum(['1', '2', '4', '9']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'modern', 'classic', 'simple']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeQRCode: z.boolean(),
  includeWatermark: z.boolean(),
  includePrincipalSignature: z.boolean(),
  includeEmergencyContact: z.boolean(),
  includeBloodGroup: z.boolean(),
  includeBackside: z.boolean()
});

export default function TeacherIdCardsMobilePage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  
  // Teacher form setup
  const teacherForm = useForm<z.infer<typeof teacherSchema>>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "Mohammad Ali Rahman",
      nameInBangla: "মোহাম্মদ আলী রহমান",
      employeeId: "T-2023-0042",
      designation: "Senior Teacher",
      department: "Science",
      joiningDate: "2015-05-10",
      bloodGroup: "B+",
      contactNumber: "01712345678",
      email: "rahman@school.edu",
      address: "House 42, Road 5, Mirpur-10, Dhaka-1216",
      emergencyContact: "01812345678",
      emergencyContactPerson: "Fatima Rahman (Wife)",
      qualifications: "MSc in Physics, B.Ed",
      idValidUntil: "2026-12-31"
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
      includePrincipalSignature: true,
      includeEmergencyContact: true,
      includeBloodGroup: true,
      includeBackside: true
    }
  });

  // Handle form submission for generating ID card
  const onGenerateSubmit = (teacherData: z.infer<typeof teacherSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Teacher Data:", teacherData);
    console.log("Template Data:", templateData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "আইডি কার্ড তৈরি হয়েছে",
        description: "শিক্ষকের আইডি কার্ড সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const idCardElement = document.getElementById('teacher-id-card-preview');
    if (!idCardElement) return;

    const canvas = await html2canvas(idCardElement, {
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

    pdf.save(`teacher-id-card-${teacherForm.getValues('employeeId')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "শিক্ষকের আইডি কার্ড পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    teacherForm.reset();
    templateForm.reset();
  };
  
  // Import teachers handler
  const handleImportTeachers = () => {
    toast({
      title: "আমদানি সফল",
      description: "ডাটাবেস থেকে ৫ জন শিক্ষক আমদানি করা হয়েছে",
    });
    
    setSelectedTeachers(["1", "2", "3", "4", "5"]);
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
        title="শিক্ষক আইডি কার্ড"
        description="শিক্ষকদের জন্য আইডি কার্ড তৈরি করুন"
        primaryAction={{
          icon: "badge",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(teacherForm.getValues(), templateForm.getValues()),
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
                    শিক্ষকের বিবরণ
                  </CardTitle>
                  <CardDescription className="text-base">
                    আইডি কার্ডের জন্য শিক্ষকের প্রয়োজনীয় তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...teacherForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="প্রাথমিক তথ্য" 
                        icon="person"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={teacherForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">শিক্ষকের নাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={teacherForm.control}
                            name="nameInBangla"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">শিক্ষকের নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={teacherForm.control}
                              name="employeeId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">আইডি নম্বর</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="badge" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={teacherForm.control}
                              name="bloodGroup"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">রক্তের গ্রুপ</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="রক্তের গ্রুপ নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="A+">A+</SelectItem>
                                      <SelectItem value="A-">A-</SelectItem>
                                      <SelectItem value="B+">B+</SelectItem>
                                      <SelectItem value="B-">B-</SelectItem>
                                      <SelectItem value="AB+">AB+</SelectItem>
                                      <SelectItem value="AB-">AB-</SelectItem>
                                      <SelectItem value="O+">O+</SelectItem>
                                      <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={teacherForm.control}
                              name="designation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">পদবী</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="পদবী নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Principal">অধ্যক্ষ</SelectItem>
                                      <SelectItem value="Vice Principal">উপাধ্যক্ষ</SelectItem>
                                      <SelectItem value="Assistant Headmaster">সহকারী প্রধান শিক্ষক</SelectItem>
                                      <SelectItem value="Senior Teacher">সিনিয়র শিক্ষক</SelectItem>
                                      <SelectItem value="Teacher">শিক্ষক</SelectItem>
                                      <SelectItem value="Assistant Teacher">সহকারী শিক্ষক</SelectItem>
                                      <SelectItem value="Junior Teacher">জুনিয়র শিক্ষক</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={teacherForm.control}
                              name="department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">বিভাগ</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Science">বিজ্ঞান</SelectItem>
                                      <SelectItem value="Arts">কলা</SelectItem>
                                      <SelectItem value="Commerce">বাণিজ্য</SelectItem>
                                      <SelectItem value="Mathematics">গণিত</SelectItem>
                                      <SelectItem value="Bangla">বাংলা</SelectItem>
                                      <SelectItem value="English">ইংরেজি</SelectItem>
                                      <SelectItem value="Social Science">সমাজ বিজ্ঞান</SelectItem>
                                      <SelectItem value="Islamic Studies">ইসলামিক স্টাডিজ</SelectItem>
                                      <SelectItem value="Physical Education">শারীরিক শিক্ষা</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={teacherForm.control}
                            name="joiningDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">যোগদানের তারিখ</FormLabel>
                                <FormControl>
                                  <MobileInput type="date" leftIcon="calendar_today" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Contact Information Section */}
                      <FormSection 
                        title="যোগাযোগের তথ্য" 
                        icon="contact_phone"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={teacherForm.control}
                            name="contactNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">মোবাইল নম্বর</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="phone" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={teacherForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">ইমেইল</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="email" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={teacherForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">ঠিকানা</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="home" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Emergency Contact */}
                      <FormSection 
                        title="জরুরী যোগাযোগ" 
                        icon="emergency"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={teacherForm.control}
                            name="emergencyContactPerson"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">যোগাযোগের ব্যক্তি</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={teacherForm.control}
                            name="emergencyContact"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">জরুরী যোগাযোগের নম্বর</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="phone_in_talk" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Additional Information */}
                      <FormSection 
                        title="অতিরিক্ত তথ্য" 
                        icon="info"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={teacherForm.control}
                            name="qualifications"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">শিক্ষাগত যোগ্যতা</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="school" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={teacherForm.control}
                            name="idValidUntil"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">আইডি কার্ডের মেয়াদ</FormLabel>
                                <FormControl>
                                  <MobileInput type="date" leftIcon="calendar_today" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="border rounded-md p-4 bg-muted/10">
                            <h3 className="font-medium">ছবি এবং স্বাক্ষর আপলোড করুন</h3>
                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                              <div className="flex-1">
                                <p className="text-sm mb-2">শিক্ষকের ছবি (পাসপোর্ট সাইজ)</p>
                                <div className="h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center border-primary/30 bg-primary/5">
                                  <span className="material-icons text-2xl text-primary/60 mb-1">add_a_photo</span>
                                  <p className="text-sm text-primary/60">ছবি আপলোড করুন</p>
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm mb-2">শিক্ষকের স্বাক্ষর</p>
                                <div className="h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center border-primary/30 bg-primary/5">
                                  <span className="material-icons text-2xl text-primary/60 mb-1">draw</span>
                                  <p className="text-sm text-primary/60">স্বাক্ষর আপলোড করুন</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </FormSection>
                    </div>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Template Settings */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-primary flex items-center">
                    <span className="material-icons mr-2">dashboard_customize</span>
                    আইডি কার্ড ফরম্যাট
                  </CardTitle>
                  <CardDescription className="text-base">
                    আইডি কার্ডের ডিজাইন কাস্টমাইজ করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...templateForm}>
                    <div className="space-y-1">
                      <FormSection 
                        title="আইডি কার্ড ফরম্যাট সেটিংস" 
                        icon="settings"
                        defaultOpen={true}
                      >
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
                                    <SelectItem value="1">১ টি কার্ড (A4)</SelectItem>
                                    <SelectItem value="2">২ টি কার্ড (A4)</SelectItem>
                                    <SelectItem value="4">৪ টি কার্ড (A4)</SelectItem>
                                    <SelectItem value="9">৯ টি কার্ড (A4)</SelectItem>
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
                          
                          <FormField
                            control={templateForm.control}
                            name="template"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">টেমপ্লেট</FormLabel>
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
                                    <SelectItem value="modern">মডার্ন</SelectItem>
                                    <SelectItem value="classic">ক্লাসিক</SelectItem>
                                    <SelectItem value="simple">সিম্পল</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="space-y-2">
                          <FormField
                            control={templateForm.control}
                            name="includeLogo"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">স্কুলের লোগো</FormLabel>
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
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">শিক্ষকের স্বাক্ষর</FormLabel>
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
                            name="includePrincipalSignature"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">অধ্যক্ষের স্বাক্ষর</FormLabel>
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
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">QR কোড</FormLabel>
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
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">ওয়াটারমার্ক</FormLabel>
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
                            name="includeEmergencyContact"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">জরুরী যোগাযোগের তথ্য</FormLabel>
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
                            name="includeBloodGroup"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">রক্তের গ্রুপ</FormLabel>
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
                            name="includeBackside"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">পিছনের পৃষ্ঠা</FormLabel>
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
                      </FormSection>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Preview mode
            <div className="flex flex-col gap-4">
              <Card className="border shadow-md mb-4">
                <CardHeader className="pb-0 pt-4">
                  <CardTitle className="text-lg text-center">
                    আইডি কার্ড প্রিভিউ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div id="teacher-id-card-preview" className="border p-4 bg-white rounded-lg overflow-hidden mx-auto" style={{ maxWidth: '320px' }}>
                    <div className="bg-gradient-to-b from-primary/80 to-primary rounded-lg overflow-hidden">
                      {/* Card Header */}
                      <div className="p-3 bg-primary text-white text-center">
                        <h2 className="text-base font-bold">ঢাকা পাবলিক স্কুল</h2>
                        <p className="text-xs">মিরপুর-১০, ঢাকা-১২১৬</p>
                      </div>
                      
                      {/* Teacher Info */}
                      <div className="flex bg-white p-3">
                        <div className="w-24 h-32 border border-gray-300 bg-gray-100 flex items-center justify-center mr-3">
                          <span className="material-icons text-3xl text-gray-400">person</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-base text-gray-800">{teacherForm.getValues('nameInBangla')}</h3>
                          <p className="text-xs text-gray-500">{teacherForm.getValues('name')}</p>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex">
                              <span className="text-xs font-semibold w-16">আইডি:</span>
                              <span className="text-xs">{teacherForm.getValues('employeeId')}</span>
                            </div>
                            <div className="flex">
                              <span className="text-xs font-semibold w-16">পদবী:</span>
                              <span className="text-xs">{teacherForm.getValues('designation')}</span>
                            </div>
                            <div className="flex">
                              <span className="text-xs font-semibold w-16">বিভাগ:</span>
                              <span className="text-xs">{teacherForm.getValues('department')}</span>
                            </div>
                            <div className="flex">
                              <span className="text-xs font-semibold w-16">যোগদান:</span>
                              <span className="text-xs">{teacherForm.getValues('joiningDate')}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs font-semibold w-16">রক্ত গ্রুপ:</span>
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm">{teacherForm.getValues('bloodGroup')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="bg-white px-3 pb-2">
                        <div className="flex items-center">
                          <span className="material-icons text-xs text-gray-500 mr-1">phone</span>
                          <span className="text-xs">{teacherForm.getValues('contactNumber')}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="material-icons text-xs text-gray-500 mr-1">email</span>
                          <span className="text-xs">{teacherForm.getValues('email')}</span>
                        </div>
                      </div>
                      
                      {/* Emergency Contact */}
                      {templateForm.getValues('includeEmergencyContact') && (
                        <div className="bg-gray-50 p-2 border-t">
                          <p className="text-xs font-semibold text-gray-600">জরুরী যোগাযোগ:</p>
                          <p className="text-xs">
                            {teacherForm.getValues('emergencyContactPerson')} - {teacherForm.getValues('emergencyContact')}
                          </p>
                        </div>
                      )}
                      
                      {/* Card Footer */}
                      <div className="p-2 bg-white border-t flex justify-between items-center">
                        <div className="text-xs">
                          <div>বৈধ: {teacherForm.getValues('idValidUntil')}</div>
                        </div>
                        
                        <div className="w-16 h-16 flex items-center justify-center">
                          {templateForm.getValues('includeQRCode') && (
                            <div className="border border-gray-300 w-14 h-14 flex items-center justify-center bg-white">
                              <span className="material-icons text-gray-400">qr_code_2</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Signatures */}
                      <div className="bg-white p-2 border-t flex items-center justify-between">
                        <div className="w-1/2 text-center border-r">
                          <div className="w-16 h-8 mx-auto border-b border-gray-400"></div>
                          <p className="text-xs mt-1">শিক্ষকের স্বাক্ষর</p>
                        </div>
                        <div className="w-1/2 text-center">
                          <div className="w-16 h-8 mx-auto border-b border-gray-400"></div>
                          <p className="text-xs mt-1">অধ্যক্ষের স্বাক্ষর</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-2 sticky bottom-0 bg-background p-4 border-t">
                <Button className="flex-1" onClick={generatePDF}>
                  <span className="material-icons text-sm mr-1">download</span>
                  PDF ডাউনলোড
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setPreviewMode(false)}>
                  <span className="material-icons text-sm mr-1">edit</span>
                  এডিট করুন
                </Button>
              </div>
            </div>
          )}
        </MobileTabContent>
        
        <MobileTabContent value="batch" activeTab={activeTab}>
          <div className="p-4">
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="text-base font-medium mb-2">একসাথে অনেকগুলো আইডি কার্ড তৈরি করুন</h3>
                <p className="text-sm text-muted-foreground mb-4">ডাটাবেস থেকে শিক্ষকদের আমদানি করে ব্যাচ আকারে আইডি কার্ড তৈরি করুন</p>
                <Button className="w-full" onClick={handleImportTeachers}>
                  <span className="material-icons text-sm mr-1">cloud_download</span>
                  শিক্ষকদের আমদানি করুন
                </Button>
              </CardContent>
            </Card>
            
            {selectedTeachers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-medium">নির্বাচিত শিক্ষক ({selectedTeachers.length})</h3>
                
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded border shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">মোহাম্মদ আলী রহমান</h4>
                      <p className="text-xs text-gray-500">আইডি: T-2023-0042 | বিভাগ: বিজ্ঞান</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <span className="material-icons text-sm">delete</span>
                    </Button>
                  </div>
                  
                  <div className="bg-white p-3 rounded border shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">শামীমা আক্তার</h4>
                      <p className="text-xs text-gray-500">আইডি: T-2022-0034 | বিভাগ: বাংলা</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <span className="material-icons text-sm">delete</span>
                    </Button>
                  </div>
                  
                  <div className="bg-white p-3 rounded border shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">আবদুল করিম</h4>
                      <p className="text-xs text-gray-500">আইডি: T-2021-0022 | বিভাগ: গণিত</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <span className="material-icons text-sm">delete</span>
                    </Button>
                  </div>
                  
                  <div className="bg-white p-3 rounded border shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">নাজমুল হাসান</h4>
                      <p className="text-xs text-gray-500">আইডি: T-2020-0015 | বিভাগ: ইংরেজি</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <span className="material-icons text-sm">delete</span>
                    </Button>
                  </div>
                  
                  <div className="bg-white p-3 rounded border shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">রাবেয়া সুলতানা</h4>
                      <p className="text-xs text-gray-500">আইডি: T-2023-0051 | বিভাগ: সমাজ বিজ্ঞান</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <span className="material-icons text-sm">delete</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    <span className="material-icons text-sm mr-1">badge</span>
                    সবগুলো জেনারেট করুন
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <span className="material-icons text-sm mr-1">clear_all</span>
                    সবগুলো বাতিল করুন
                  </Button>
                </div>
              </div>
            )}
          </div>
        </MobileTabContent>

        <MobileTabContent value="templates" activeTab={activeTab}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">সেভ করা টেমপ্লেট</h2>
            <div className="grid grid-cols-1 gap-3">
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-blue-600">badge</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">স্ট্যান্ডার্ড শিক্ষক আইডি কার্ড</h3>
                    <p className="text-sm text-gray-500">শেষ ব্যবহার: ০৪ মে, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-green-600">badge</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">মডার্ন শিক্ষক আইডি কার্ড</h3>
                    <p className="text-sm text-gray-500">শেষ ব্যবহার: ০২ মে, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Button variant="outline" className="w-full mt-2">
                <span className="material-icons text-sm mr-1">add</span>
                নতুন টেমপ্লেট তৈরি করুন
              </Button>
            </div>
          </div>
        </MobileTabContent>

        <MobileTabContent value="history" activeTab={activeTab}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">পূর্ববর্তী আইডি কার্ড</h2>
            <div className="grid grid-cols-1 gap-3">
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-blue-600">badge</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">মোহাম্মদ আলী রহমান - শিক্ষক আইডি কার্ড</h3>
                    <p className="text-sm text-gray-500">তৈরি করা হয়েছে: ১০ মে, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-amber-600">badge</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">শামীমা আক্তার - শিক্ষক আইডি কার্ড</h3>
                    <p className="text-sm text-gray-500">তৈরি করা হয়েছে: ০১ মে, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-green-600">badge</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">আবদুল করিম - শিক্ষক আইডি কার্ড</h3>
                    <p className="text-sm text-gray-500">তৈরি করা হয়েছে: ২০ এপ্রিল, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </MobileTabContent>
      </MobilePageLayout>
    </AppShell>
  );
}