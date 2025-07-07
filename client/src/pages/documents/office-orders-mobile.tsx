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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
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

// Define schema for office order information
const officeOrderSchema = z.object({
  title: z.string().min(2, { message: "Office order title is required" }),
  titleInBangla: z.string().optional(),
  orderType: z.string().min(1, { message: "Order type is required" }),
  issueDate: z.string().min(1, { message: "Issue date is required" }),
  effectiveDate: z.string().min(1, { message: "Effective date is required" }),
  referenceNumber: z.string().min(1, { message: "Reference number is required" }),
  schoolName: z.string().min(1, { message: "School name is required" }),
  schoolNameInBangla: z.string().optional(),
  issuedBy: z.string().min(1, { message: "Issuer name is required" }),
  issuedByDesignation: z.string().min(1, { message: "Issuer designation is required" }),
  content: z.string().min(10, { message: "Order content is required" }),
  contentInBangla: z.string().optional(),
  recipients: z.array(z.string()).min(1, { message: "At least one recipient is required" }),
  attachments: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      size: z.string()
    })
  ).optional(),
  additionalInstructions: z.string().optional()
});

// Schema for office order template settings
const templateSchema = z.object({
  layout: z.enum(['portrait', 'landscape']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'formal', 'simple', 'modern']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeFooter: z.boolean(),
  includeWatermark: z.boolean(),
  includeQRCode: z.boolean(),
  includeLetterhead: z.boolean(),
  includeDistributionList: z.boolean()
});

export default function OfficeOrdersMobilePage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Initial recipients
  const initialRecipients = [
    "সকল শিক্ষক",
    "সকল কর্মচারী",
    "অধ্যক্ষ",
    "প্রধান শিক্ষক",
    "উপাধ্যক্ষ",
    "হিসাব শাখা"
  ];

  // Office order form setup
  const orderForm = useForm<z.infer<typeof officeOrderSchema>>({
    resolver: zodResolver(officeOrderSchema),
    defaultValues: {
      title: "Appointment of Class Teachers for the Academic Year 2025-2026",
      titleInBangla: "শিক্ষাবর্ষ ২০২৫-২০২৬ এর জন্য শ্রেণি শিক্ষক নিয়োগ সংক্রান্ত আদেশ",
      orderType: "Administrative",
      issueDate: "2025-05-10",
      effectiveDate: "2025-06-01",
      referenceNumber: "DPS/ORD/2025/42",
      schoolName: "Dhaka Public School",
      schoolNameInBangla: "ঢাকা পাবলিক স্কুল",
      issuedBy: "Professor Mohammad Rahman",
      issuedByDesignation: "Principal",
      content: "This is to notify all concerned that the following teachers have been appointed as Class Teachers for the Academic Year 2025-2026. This appointment will be effective from 1st June 2025 and will remain valid till the end of the academic year. All appointed teachers are requested to coordinate with their respective department heads for further instructions.",
      contentInBangla: "সংশ্লিষ্ট সবাইকে জানানো যাচ্ছে যে, শিক্ষাবর্ষ ২০২৫-২০২৬ এর জন্য নিম্নলিখিত শিক্ষকদের শ্রেণি শিক্ষক হিসেবে নিয়োগ দেওয়া হয়েছে। এই নিয়োগ ১লা জুন ২০২৫ থেকে কার্যকর হবে এবং শিক্ষাবর্ষের শেষ পর্যন্ত বলবৎ থাকবে। সকল নিযুক্ত শিক্ষকদের সংশ্লিষ্ট বিভাগীয় প্রধানের সাথে আরও নির্দেশনার জন্য যোগাযোগ করার অনুরোধ করা হচ্ছে।",
      recipients: initialRecipients,
      attachments: [
        { name: "class_teacher_list_2025_26.pdf", type: "PDF", size: "215 KB" }
      ],
      additionalInstructions: "All class teachers must attend the orientation program scheduled on 28th May 2025."
    }
  });

  // Template form setup
  const templateForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      layout: 'portrait',
      language: 'both',
      template: 'formal',
      includeLogo: true,
      includeSignature: true,
      includeFooter: true,
      includeWatermark: false,
      includeQRCode: true,
      includeLetterhead: true,
      includeDistributionList: true
    }
  });

  // Handle form submission
  const onGenerateSubmit = (orderData: z.infer<typeof officeOrderSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Order Data:", orderData);
    console.log("Template Data:", templateData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "অফিস অর্ডার তৈরি হয়েছে",
        description: "আপনার অফিস অর্ডার সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const orderElement = document.getElementById('office-order-preview');
    if (!orderElement) return;

    const canvas = await html2canvas(orderElement, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Determine PDF dimensions based on layout
    const layout = templateForm.getValues('layout');
    const orientation = layout === 'landscape' ? 'landscape' : 'portrait';
    
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`office-order-${orderForm.getValues('referenceNumber')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার অফিস অর্ডার পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    orderForm.reset();
    templateForm.reset();
  };
  
  // Share order
  const shareOrder = () => {
    toast({
      title: "অফিস অর্ডার শেয়ার করা হয়েছে",
      description: "অফিস অর্ডারটি সফলভাবে শেয়ার করা হয়েছে",
    });
  };

  // Define tabs for the mobile view
  const tabItems = [
    { id: "generate", label: "জেনারেট", icon: "add_to_photos" },
    { id: "templates", label: "টেমপ্লেট", icon: "dashboard_customize" },
    { id: "history", label: "হিস্ট্রি", icon: "history" },
  ];

  return (
    <AppShell>
      <MobilePageLayout
        title="অফিস অর্ডার"
        description="বিদ্যালয়ের অফিস অর্ডার তৈরি করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(orderForm.getValues(), templateForm.getValues()),
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
                    <span className="material-icons mr-2">gavel</span>
                    অর্ডার বিবরণ
                  </CardTitle>
                  <CardDescription className="text-base">
                    অফিস অর্ডারের প্রয়োজনীয় তথ্য পূরণ করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...orderForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="মৌলিক তথ্য" 
                        icon="gavel"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={orderForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">শিরোনাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={orderForm.control}
                            name="titleInBangla"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">শিরোনাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={orderForm.control}
                              name="orderType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">অর্ডারের ধরন</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="ধরন নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Administrative">প্রশাসনিক</SelectItem>
                                      <SelectItem value="Academic">একাডেমিক</SelectItem>
                                      <SelectItem value="Financial">আর্থিক</SelectItem>
                                      <SelectItem value="HR">এইচআর</SelectItem>
                                      <SelectItem value="Disciplinary">শৃঙ্খলামূলক</SelectItem>
                                      <SelectItem value="Other">অন্যান্য</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={orderForm.control}
                              name="referenceNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">রেফারেন্স নম্বর</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="tag" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={orderForm.control}
                              name="issueDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">ইস্যুর তারিখ</FormLabel>
                                  <FormControl>
                                    <MobileInput type="date" leftIcon="calendar_today" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={orderForm.control}
                              name="effectiveDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">কার্যকর তারিখ</FormLabel>
                                  <FormControl>
                                    <MobileInput type="date" leftIcon="calendar_today" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </FormSection>
                      
                      {/* School Information Section */}
                      <FormSection 
                        title="প্রতিষ্ঠান তথ্য" 
                        icon="school"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={orderForm.control}
                            name="schoolName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">প্রতিষ্ঠানের নাম (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="apartment" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={orderForm.control}
                            name="schoolNameInBangla"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">প্রতিষ্ঠানের নাম (বাংলা)</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="apartment" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={orderForm.control}
                              name="issuedBy"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">ইস্যুকারী</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="person" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={orderForm.control}
                              name="issuedByDesignation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">ইস্যুকারীর পদবী</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="badge" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </FormSection>
                      
                      {/* Order Content Section */}
                      <FormSection 
                        title="অর্ডারের বিবরণ" 
                        icon="text_snippet"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={orderForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">বিবরণ (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Office order content in English" 
                                    className="min-h-32 resize-none"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={orderForm.control}
                            name="contentInBangla"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">বিবরণ (বাংলা)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="বাংলায় অফিস অর্ডারের বিবরণ লিখুন" 
                                    className="min-h-32 resize-none"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={orderForm.control}
                            name="additionalInstructions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">অতিরিক্ত নির্দেশনা</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="অতিরিক্ত নির্দেশনা লিখুন" 
                                    className="min-h-20 resize-none"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Recipients Section */}
                      <FormSection 
                        title="বিতরণ তালিকা" 
                        icon="people"
                      >
                        <div className="border rounded-md p-3 bg-muted/10">
                          <h3 className="font-medium text-base">প্রাপক সমূহ</h3>
                          
                          <div className="mt-2 space-y-2">
                            {orderForm.getValues('recipients').map((recipient, index) => (
                              <div key={index} className="flex items-center justify-between bg-background p-2 rounded">
                                <div className="flex items-center">
                                  <span className="material-icons text-gray-500 mr-2">person</span>
                                  <p>{recipient}</p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <span className="material-icons text-gray-500">close</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button className="w-full mt-4" variant="outline" size="sm">
                            <span className="material-icons text-sm mr-1">add</span>
                            প্রাপক যোগ করুন
                          </Button>
                        </div>
                      </FormSection>
                      
                      {/* Attachments Section */}
                      <FormSection 
                        title="সংযুক্তি" 
                        icon="attachment"
                      >
                        <div className="border rounded-md p-3 bg-muted/10">
                          <h3 className="font-medium text-base">সংযুক্ত ফাইলসমূহ</h3>
                          
                          {orderForm.getValues('attachments') && orderForm.getValues('attachments')!.length > 0 ? (
                            <div className="mt-2 space-y-2">
                              {orderForm.getValues('attachments')!.map((attachment, index) => (
                                <div key={index} className="flex items-center justify-between bg-background p-2 rounded">
                                  <div className="flex items-center">
                                    <span className="material-icons text-blue-500 mr-2">description</span>
                                    <div>
                                      <p className="font-medium">{attachment.name}</p>
                                      <p className="text-xs text-muted-foreground">{attachment.size}</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <span className="material-icons text-gray-500">close</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-2">কোন ফাইল সংযুক্ত করা হয়নি</p>
                          )}
                          
                          <Button className="w-full mt-4" variant="outline" size="sm">
                            <span className="material-icons text-sm mr-1">add</span>
                            ফাইল সংযুক্ত করুন
                          </Button>
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
                    অর্ডার ফরম্যাট
                  </CardTitle>
                  <CardDescription className="text-base">
                    অফিস অর্ডারের ফরম্যাট কাস্টমাইজ করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...templateForm}>
                    <div className="space-y-1">
                      <FormSection 
                        title="ফরম্যাট সেটিংস" 
                        icon="settings"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={templateForm.control}
                            name="layout"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">পেজ ওরিয়েন্টেশন</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="অরিয়েন্টেশন নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="portrait">পোর্ট্রেট</SelectItem>
                                    <SelectItem value="landscape">ল্যান্ডস্কেপ</SelectItem>
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
                                    <SelectItem value="formal">ফরমাল</SelectItem>
                                    <SelectItem value="simple">সিম্পল</SelectItem>
                                    <SelectItem value="modern">মডার্ন</SelectItem>
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
                                <FormLabel className="cursor-pointer">স্বাক্ষর</FormLabel>
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
                            name="includeFooter"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">ফুটার</FormLabel>
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
                            name="includeLetterhead"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">লেটারহেড</FormLabel>
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
                            name="includeDistributionList"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel className="cursor-pointer">বিতরণ তালিকা</FormLabel>
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
                    অফিস অর্ডার প্রিভিউ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div id="office-order-preview" className="border p-4 bg-white rounded">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-bold">{orderForm.getValues('schoolNameInBangla')}</h2>
                      <p className="text-sm text-gray-600 mb-1">অফিস অর্ডার</p>
                      <p className="text-xs text-gray-500">নং: {orderForm.getValues('referenceNumber')}</p>
                      <p className="text-xs text-gray-500">তারিখ: {orderForm.getValues('issueDate')}</p>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-center mb-4">{orderForm.getValues('titleInBangla')}</h3>
                      
                      <div className="mt-4 text-justify">
                        <p className="whitespace-pre-line">{orderForm.getValues('contentInBangla')}</p>
                      </div>
                      
                      {orderForm.getValues('additionalInstructions') && (
                        <div className="mt-4 p-2 bg-gray-50 border rounded">
                          <p className="text-sm font-medium">অতিরিক্ত নির্দেশনা:</p>
                          <p className="text-sm">{orderForm.getValues('additionalInstructions')}</p>
                        </div>
                      )}
                      
                      {orderForm.getValues('attachments') && orderForm.getValues('attachments')!.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium">সংযুক্তি:</p>
                          <ul className="text-sm list-disc ml-5">
                            {orderForm.getValues('attachments')!.map((attachment, index) => (
                              <li key={index}>{attachment.name} ({attachment.size})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-8 text-right">
                        <p className="text-sm font-medium">{orderForm.getValues('issuedBy')}</p>
                        <p className="text-xs text-gray-600">{orderForm.getValues('issuedByDesignation')}</p>
                        <p className="text-xs text-gray-600">{orderForm.getValues('schoolNameInBangla')}</p>
                      </div>
                      
                      {templateForm.getValues('includeDistributionList') && (
                        <div className="mt-6 pt-2 border-t">
                          <p className="text-sm font-medium">বিতরণ:</p>
                          <ol className="text-xs text-gray-600 list-decimal ml-5 mt-1">
                            {orderForm.getValues('recipients').map((recipient, index) => (
                              <li key={index}>{recipient}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-2 sticky bottom-0 bg-background p-4 border-t">
                <Button className="flex-1" onClick={generatePDF}>
                  <span className="material-icons text-sm mr-1">download</span>
                  PDF ডাউনলোড
                </Button>
                <Button className="flex-1" variant="outline" onClick={shareOrder}>
                  <span className="material-icons text-sm mr-1">share</span>
                  শেয়ার করুন
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setPreviewMode(false)}>
                  <span className="material-icons text-sm mr-1">edit</span>
                  এডিট করুন
                </Button>
              </div>
            </div>
          )}
        </MobileTabContent>
        
        <MobileTabContent value="templates" activeTab={activeTab}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">সেভ করা টেমপ্লেট</h2>
            <div className="grid grid-cols-1 gap-3">
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-blue-600">gavel</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">স্ট্যান্ডার্ড অফিস অর্ডার</h3>
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
                    <span className="material-icons text-green-600">gavel</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">নিয়োগ অর্ডার টেমপ্লেট</h3>
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
            <h2 className="text-lg font-bold mb-4">পূর্ববর্তী অর্ডারসমূহ</h2>
            <div className="grid grid-cols-1 gap-3">
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-blue-600">gavel</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">শিক্ষাবর্ষ ২০২৫-২০২৬ এর জন্য শ্রেণি শিক্ষক নিয়োগ</h3>
                    <p className="text-sm text-gray-500">ইস্যু: ১০ মে, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-amber-600">gavel</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">নতুন পরীক্ষা কমিটি গঠন</h3>
                    <p className="text-sm text-gray-500">ইস্যু: ০১ মে, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-green-600">gavel</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">শিক্ষকদের বেতন বৃদ্ধি সংক্রান্ত অর্ডার</h3>
                    <p className="text-sm text-gray-500">ইস্যু: ১৫ এপ্রিল, ২০২৫</p>
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