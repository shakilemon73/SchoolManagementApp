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

// Define schema for student information
const studentSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  nameInBangla: z.string().optional(),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  fatherName: z.string().min(2, { message: "Father's name is required" }),
  fatherOccupation: z.string().optional(),
  motherName: z.string().min(2, { message: "Mother's name is required" }),
  motherOccupation: z.string().optional(),
  address: z.string().min(5, { message: "Address is required" }),
  mobileNumber: z.string().min(10, { message: "Valid mobile number is required" }),
  email: z.string().email().optional(),
  religion: z.string().optional(),
  previousSchool: z.string().optional(),
  previousClass: z.string().optional(),
  applyingForClass: z.string().min(1, { message: "Applying class is required" }),
  academicYear: z.string().min(1, { message: "Academic year is required" }),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianContact: z.string().optional(),
  bloodGroup: z.string().optional(),
  studentPhoto: z.string().optional(),
});

// Schema for form template settings
const templateSchema = z.object({
  layout: z.enum(['1', '2', '4', '9']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'detailed', 'simple', 'custom']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeQRCode: z.boolean(),
  includeWatermark: z.boolean(),
  includeTermsAndConditions: z.boolean(),
});

export default function AdmissionFormsPage() {
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
      dateOfBirth: "2006-05-15",
      gender: "male",
      fatherName: "Abdul Karim",
      fatherOccupation: "Business",
      motherName: "Fatima Begum",
      motherOccupation: "Housewife",
      address: "123, Green Road, Dhanmondi, Dhaka-1205",
      mobileNumber: "01712345678",
      email: "mohammad@example.com",
      religion: "Islam",
      previousSchool: "ABC School",
      previousClass: "9",
      applyingForClass: "10",
      academicYear: "2023",
      guardianName: "Abdul Karim",
      guardianRelation: "Father",
      guardianContact: "01712345678",
      bloodGroup: "A+",
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
      includeTermsAndConditions: true
    }
  });

  // Handle form submission for generating admission form
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
        title: "ভর্তি ফরম তৈরি হয়েছে",
        description: "আপনার ভর্তি ফরম সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const formElement = document.getElementById('admission-form-preview');
    if (!formElement) return;

    const canvas = await html2canvas(formElement, {
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

    pdf.save(`admission-form-${studentForm.getValues('name').replace(/\s+/g, '-')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার ভর্তি ফরম পিডিএফ হিসেবে সেভ করা হয়েছে",
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
      title: "আমদানি সফল",
      description: "ডাটাবেস থেকে ৫ জন আবেদনকারী আমদানি করা হয়েছে",
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
        title="ভর্তি ফরম"
        description="নতুন শিক্ষার্থীর ভর্তি ফরম তৈরি করুন"
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
                    আবেদনকারীর বিবরণ
                  </CardTitle>
                  <CardDescription className="text-base">
                    ভর্তি ফরমের জন্য শিক্ষার্থীর প্রয়োজনীয় তথ্য প্রদান করুন
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
                                <FormLabel className="text-base">আবেদনকারীর নাম (ইংরেজি)</FormLabel>
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
                                <FormLabel className="text-base">আবেদনকারীর নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={studentForm.control}
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
                            
                            <FormField
                              control={studentForm.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">লিঙ্গ</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="male">পুরুষ</SelectItem>
                                      <SelectItem value="female">মহিলা</SelectItem>
                                      <SelectItem value="other">অন্যান্য</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={studentForm.control}
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
                      </FormSection>
                      
                      {/* Parents Information */}
                      <FormSection 
                        title="অভিভাবকের তথ্য" 
                        icon="family_restroom"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={studentForm.control}
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
                            control={studentForm.control}
                            name="fatherOccupation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">পিতার পেশা</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="work" {...field} />
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
                                <FormLabel className="text-base">মাতার নাম</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={studentForm.control}
                            name="motherOccupation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">মাতার পেশা</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="work" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Contact Information */}
                      <FormSection 
                        title="যোগাযোগের তথ্য" 
                        icon="contact_phone"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={studentForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">ঠিকানা</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="বাসার ঠিকানা লিখুন" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={studentForm.control}
                            name="mobileNumber"
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
                            control={studentForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">ইমেইল (ঐচ্ছিক)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Academic Information */}
                      <FormSection 
                        title="একাডেমিক তথ্য" 
                        icon="school"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={studentForm.control}
                            name="previousSchool"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">আগের বিদ্যালয়ের নাম (যদি থাকে)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="account_balance" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={studentForm.control}
                            name="previousClass"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">আগের শ্রেণী</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="class" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={studentForm.control}
                              name="applyingForClass"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">আবেদনকৃত শ্রেণী</FormLabel>
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
                              name="academicYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">শিক্ষাবর্ষ</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="শিক্ষাবর্ষ নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="2023">2023</SelectItem>
                                      <SelectItem value="2024">2024</SelectItem>
                                      <SelectItem value="2025">2025</SelectItem>
                                    </SelectContent>
                                  </Select>
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
              
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-primary flex items-center">
                    <span className="material-icons mr-2">tune</span>
                    ভর্তি ফরম সেটিংস
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
                                  ফরমে প্রতিষ্ঠানের লোগো দেখাবে
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
                                  ফরমে অধ্যক্ষের স্বাক্ষর দেখাবে
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
                                  ফরমে ভেরিফিকেশন QR কোড দেখাবে
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
                                  ফরমে প্রতিষ্ঠানের ওয়াটারমার্ক দেখাবে
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
                          name="includeTermsAndConditions"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">শর্তাবলী</FormLabel>
                                <FormDescription>
                                  ফরমে ভর্তির নিয়ম ও শর্তাবলী দেখাবে
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
              <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-2xl" id="admission-form-preview">
                <div className="text-center mb-6">
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
                    <h2 className="text-xl font-semibold text-primary">ভর্তি ফরম</h2>
                    <p className="text-sm">শিক্ষাবর্ষ: {studentForm.getValues("academicYear")}</p>
                  </div>
                </div>
                
                <div className="border-t border-b py-4 mb-4">
                  <div className="grid grid-cols-[3fr,1fr] gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">শিক্ষার্থীর নাম:</p>
                        <p className="font-medium">{studentForm.getValues("name")}</p>
                        <p className="font-medium">{studentForm.getValues("nameInBangla")}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">জন্ম তারিখ:</p>
                          <p className="font-medium">{studentForm.getValues("dateOfBirth")}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">লিঙ্গ:</p>
                          <p className="font-medium">
                            {studentForm.getValues("gender") === "male" ? "পুরুষ" : 
                             studentForm.getValues("gender") === "female" ? "মহিলা" : "অন্যান্য"}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">রক্তের গ্রুপ:</p>
                        <p className="font-medium">{studentForm.getValues("bloodGroup")}</p>
                      </div>
                    </div>
                    
                    <div className="border border-dashed border-gray-300 rounded flex items-center justify-center">
                      <div className="text-center p-2">
                        <span className="material-icons text-3xl text-gray-400">photo_camera</span>
                        <p className="text-xs text-gray-500">ছবি</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-primary mb-2">পিতা-মাতার তথ্য</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">পিতার নাম:</p>
                        <p className="font-medium">{studentForm.getValues("fatherName")}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">পেশা:</p>
                        <p className="font-medium">{studentForm.getValues("fatherOccupation")}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">মাতার নাম:</p>
                        <p className="font-medium">{studentForm.getValues("motherName")}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">পেশা:</p>
                        <p className="font-medium">{studentForm.getValues("motherOccupation")}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-primary mb-2">যোগাযোগ</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">ঠিকানা:</p>
                        <p className="font-medium">{studentForm.getValues("address")}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">মোবাইল:</p>
                          <p className="font-medium">{studentForm.getValues("mobileNumber")}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">ইমেইল:</p>
                          <p className="font-medium">{studentForm.getValues("email") || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-primary mb-2">শিক্ষাগত তথ্য</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">আবেদনকৃত শ্রেণী:</p>
                        <p className="font-medium">
                          {studentForm.getValues("applyingForClass")}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">শিক্ষাবর্ষ:</p>
                        <p className="font-medium">{studentForm.getValues("academicYear")}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">আগের বিদ্যালয়:</p>
                        <p className="font-medium">{studentForm.getValues("previousSchool") || "N/A"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">আগের শ্রেণী:</p>
                        <p className="font-medium">{studentForm.getValues("previousClass") || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {templateForm.getValues("includeTermsAndConditions") && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-medium text-primary mb-2">শর্তাবলী</h3>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      <li>ভর্তির সময় সকল মূল নথি জমা দিতে হবে</li>
                      <li>সকল তথ্য সঠিক ও সত্য হতে হবে</li>
                      <li>ভুল তথ্য প্রদান করলে ভর্তি বাতিল বলে গণ্য হবে</li>
                      <li>প্রতিষ্ঠানের সকল নিয়ম মেনে চলতে হবে</li>
                    </ul>
                  </div>
                )}
                
                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="border-t border-gray-300 pt-2">
                      <p className="text-sm">আবেদনকারীর স্বাক্ষর</p>
                    </div>
                  </div>
                  
                  {templateForm.getValues("includeSignature") && (
                    <div className="text-center">
                      <div className="border-t border-gray-300 pt-2">
                        <p className="text-sm">অধ্যক্ষের স্বাক্ষর</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {templateForm.getValues("includeQRCode") && (
                  <div className="absolute bottom-4 right-4 h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                    <span className="material-icons text-gray-400">qr_code_2</span>
                  </div>
                )}
                
                {templateForm.getValues("includeWatermark") && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <span className="material-icons text-9xl text-primary">school</span>
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
                একসাথে ভর্তি ফরম তৈরি করুন
              </CardTitle>
              <CardDescription>
                একই সাথে একাধিক শিক্ষার্থীর ভর্তি ফরম তৈরি করুন
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
                          সবগুলো ফরম একটি পিডিএফ ফাইলে রাখুন
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
                        স্ট্যান্ডার্ড ফরম
                      </label>
                      <p className="text-sm text-muted-foreground">
                        সাধারণ ভর্তি ফরম টেমপ্লেট
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
                        বিস্তারিত ফরম
                      </label>
                      <p className="text-sm text-muted-foreground">
                        অতিরিক্ত ফিল্ড সহ বিস্তারিত ভর্তি ফরম
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
                        সাধারণ ফরম
                      </label>
                      <p className="text-sm text-muted-foreground">
                        ন্যূনতম তথ্য সহ সহজ ভর্তি ফরম
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
                সাম্প্রতিক তৈরি করা ভর্তি ফরম
              </CardTitle>
              <CardDescription>
                আপনার সাম্প্রতিক তৈরি করা ভর্তি ফরম দেখুন
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
                      আপনি এখনও কোন ভর্তি ফরম তৈরি করেননি।
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