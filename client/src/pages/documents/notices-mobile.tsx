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

// Define schema for notice information
const noticeSchema = z.object({
  title: z.string().min(2, { message: "Notice title is required" }),
  titleInBangla: z.string().optional(),
  noticeType: z.string().min(1, { message: "Notice type is required" }),
  issueDate: z.string().min(1, { message: "Issue date is required" }),
  referenceNumber: z.string().optional(),
  schoolName: z.string().min(1, { message: "School name is required" }),
  schoolNameInBangla: z.string().optional(),
  principalName: z.string().min(1, { message: "Principal name is required" }),
  content: z.string().min(10, { message: "Notice content is required" }),
  contentInBangla: z.string().optional(),
  targetAudience: z.string().min(1, { message: "Target audience is required" }),
  attachments: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      size: z.string()
    })
  ).optional(),
  importantNote: z.string().optional()
});

// Schema for notice template settings
const templateSchema = z.object({
  layout: z.enum(['portrait', 'landscape']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'formal', 'simple', 'modern']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeFooter: z.boolean(),
  includeWatermark: z.boolean(),
  includeQRCode: z.boolean(),
  includeLetterhead: z.boolean()
});

export default function NoticesMobilePage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Notice form setup
  const noticeForm = useForm<z.infer<typeof noticeSchema>>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: "Regarding Half-Yearly Examination",
      titleInBangla: "অর্ধ-বার্ষিক পরীক্ষা সংক্রান্ত বিজ্ঞপ্তি",
      noticeType: "Academic",
      issueDate: "2025-05-10",
      referenceNumber: "DPS/NOTICE/2025/42",
      schoolName: "Dhaka Public School",
      schoolNameInBangla: "ঢাকা পাবলিক স্কুল",
      principalName: "Professor Mohammad Rahman",
      content: "This is to inform all students and parents that the half-yearly examination will be held from 15th June 2025 to 25th June 2025. All students are requested to prepare for the examination. The routine will be published on 1st June 2025.",
      contentInBangla: "সকল শিক্ষার্থী এবং অভিভাবকদের জানানো যাচ্ছে যে, অর্ধ-বার্ষিক পরীক্ষা আগামী ১৫ জুন ২০২৫ থেকে ২৫ জুন ২০২৫ পর্যন্ত অনুষ্ঠিত হবে। সকল শিক্ষার্থীকে পরীক্ষার প্রস্তুতি নেওয়ার অনুরোধ করা হচ্ছে। পরীক্ষার রুটিন ১ জুন ২০২৫ তারিখে প্রকাশ করা হবে।",
      targetAudience: "All Students and Parents",
      attachments: [
        { name: "exam_guidelines.pdf", type: "PDF", size: "245 KB" }
      ],
      importantNote: "Students must bring their ID cards to the examination hall."
    }
  });

  // Template form setup
  const templateForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      layout: 'portrait',
      language: 'both',
      template: 'standard',
      includeLogo: true,
      includeSignature: true,
      includeFooter: true,
      includeWatermark: false,
      includeQRCode: true,
      includeLetterhead: true
    }
  });

  // Handle form submission for generating notice
  const onGenerateSubmit = (noticeData: z.infer<typeof noticeSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Notice Data:", noticeData);
    console.log("Template Data:", templateData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "নোটিশ তৈরি হয়েছে",
        description: "আপনার নোটিশ সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const noticeElement = document.getElementById('notice-preview');
    if (!noticeElement) return;

    const canvas = await html2canvas(noticeElement, {
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
    pdf.save(`notice-${noticeForm.getValues('referenceNumber')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার নোটিশ পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    noticeForm.reset();
    templateForm.reset();
  };
  
  // Share notice
  const shareNotice = () => {
    toast({
      title: "নোটিশ শেয়ার করা হয়েছে",
      description: "নোটিশটি সফলভাবে শেয়ার করা হয়েছে",
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
        title="নোটিশ"
        description="বিদ্যালয়ের নোটিশ তৈরি ও প্রকাশ করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(noticeForm.getValues(), templateForm.getValues()),
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
                    <span className="material-icons mr-2">description</span>
                    নোটিশ বিবরণ
                  </CardTitle>
                  <CardDescription className="text-base">
                    নোটিশের প্রয়োজনীয় তথ্য পূরণ করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...noticeForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="মৌলিক তথ্য" 
                        icon="article"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={noticeForm.control}
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
                            control={noticeForm.control}
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
                              control={noticeForm.control}
                              name="noticeType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">নোটিশের ধরন</FormLabel>
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
                                      <SelectItem value="Academic">একাডেমিক</SelectItem>
                                      <SelectItem value="Administrative">প্রশাসনিক</SelectItem>
                                      <SelectItem value="Event">ইভেন্ট</SelectItem>
                                      <SelectItem value="Exam">পরীক্ষা</SelectItem>
                                      <SelectItem value="Holiday">ছুটি</SelectItem>
                                      <SelectItem value="Other">অন্যান্য</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={noticeForm.control}
                              name="issueDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">প্রকাশের তারিখ</FormLabel>
                                  <FormControl>
                                    <MobileInput type="date" leftIcon="calendar_today" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={noticeForm.control}
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
                      </FormSection>
                      
                      {/* School Information Section */}
                      <FormSection 
                        title="প্রতিষ্ঠান তথ্য" 
                        icon="school"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={noticeForm.control}
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
                            control={noticeForm.control}
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
                          
                          <FormField
                            control={noticeForm.control}
                            name="principalName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">অধ্যক্ষের নাম</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Notice Content Section */}
                      <FormSection 
                        title="নোটিশের বিবরণ" 
                        icon="text_snippet"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={noticeForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">বিবরণ (ইংরেজি)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Notice content in English" 
                                    className="min-h-32 resize-none"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={noticeForm.control}
                            name="contentInBangla"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">বিবরণ (বাংলা)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="বাংলায় নোটিশের বিবরণ লিখুন" 
                                    className="min-h-32 resize-none"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={noticeForm.control}
                            name="targetAudience"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">যাদের জন্য প্রযোজ্য</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="প্রাপক নির্বাচন করুন" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="All Students">সকল শিক্ষার্থী</SelectItem>
                                    <SelectItem value="All Teachers">সকল শিক্ষক</SelectItem>
                                    <SelectItem value="All Staff">সকল কর্মচারী</SelectItem>
                                    <SelectItem value="All Students and Parents">সকল শিক্ষার্থী ও অভিভাবক</SelectItem>
                                    <SelectItem value="Class 6-8">৬ষ্ঠ-৮ম শ্রেণি</SelectItem>
                                    <SelectItem value="Class 9-10">৯ম-১০ম শ্রেণি</SelectItem>
                                    <SelectItem value="All">সকলের জন্য</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Attachments Section */}
                      <FormSection 
                        title="সংযুক্তি" 
                        icon="attachment"
                      >
                        <div className="border rounded-md p-3 bg-muted/10">
                          <h3 className="font-medium text-base">সংযুক্ত ফাইলসমূহ</h3>
                          
                          {noticeForm.getValues('attachments') && noticeForm.getValues('attachments')!.length > 0 ? (
                            <div className="mt-2 space-y-2">
                              {noticeForm.getValues('attachments')!.map((attachment, index) => (
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
                      
                      {/* Important Note */}
                      <FormField
                        control={noticeForm.control}
                        name="importantNote"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">গুরুত্বপূর্ণ নোট</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="কোন গুরুত্বপূর্ণ তথ্য থাকলে এখানে লিখুন" 
                                className="min-h-20 resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Template Settings */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-primary flex items-center">
                    <span className="material-icons mr-2">dashboard_customize</span>
                    নোটিশ ফরম্যাট
                  </CardTitle>
                  <CardDescription className="text-base">
                    নোটিশের ফরম্যাট কাস্টমাইজ করুন
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
                    নোটিশ প্রিভিউ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div id="notice-preview" className="border p-4 bg-white rounded">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-bold">{noticeForm.getValues('schoolNameInBangla')}</h2>
                      <p className="text-sm text-gray-600 mb-1">বিজ্ঞপ্তি</p>
                      <p className="text-xs text-gray-500">নং: {noticeForm.getValues('referenceNumber')}</p>
                      <p className="text-xs text-gray-500">তারিখ: {noticeForm.getValues('issueDate')}</p>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-center mb-4">{noticeForm.getValues('titleInBangla')}</h3>
                      
                      <div className="mt-2 text-justify">
                        <p className="whitespace-pre-line">{noticeForm.getValues('contentInBangla')}</p>
                      </div>
                      
                      {noticeForm.getValues('importantNote') && (
                        <div className="mt-4 p-2 bg-gray-50 border rounded">
                          <p className="text-sm font-medium">বিশেষ দ্রষ্টব্য:</p>
                          <p className="text-sm">{noticeForm.getValues('importantNote')}</p>
                        </div>
                      )}
                      
                      {noticeForm.getValues('attachments') && noticeForm.getValues('attachments')!.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium">সংযুক্তি:</p>
                          <ul className="text-sm list-disc ml-5">
                            {noticeForm.getValues('attachments')!.map((attachment, index) => (
                              <li key={index}>{attachment.name} ({attachment.size})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-6 text-right">
                        <p className="text-sm font-medium">{noticeForm.getValues('principalName')}</p>
                        <p className="text-xs text-gray-600">অধ্যক্ষ</p>
                        <p className="text-xs text-gray-600">{noticeForm.getValues('schoolNameInBangla')}</p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t text-xs text-gray-500 text-center">
                        <p>বিতরণ: {noticeForm.getValues('targetAudience')}</p>
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
                <Button className="flex-1" variant="outline" onClick={shareNotice}>
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
                    <span className="material-icons text-blue-600">description</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">স্ট্যান্ডার্ড নোটিশ টেমপ্লেট</h3>
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
                    <span className="material-icons text-green-600">description</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">পরীক্ষা নোটিশ টেমপ্লেট</h3>
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
            <h2 className="text-lg font-bold mb-4">পূর্ববর্তী নোটিশ</h2>
            <div className="grid grid-cols-1 gap-3">
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-blue-600">description</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">অর্ধ-বার্ষিক পরীক্ষা সংক্রান্ত বিজ্ঞপ্তি</h3>
                    <p className="text-sm text-gray-500">প্রকাশিত: ১০ মে, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-amber-600">description</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">গ্রীষ্মকালীন ছুটি সংক্রান্ত নোটিশ</h3>
                    <p className="text-sm text-gray-500">প্রকাশিত: ০১ মে, ২০২৫</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="material-icons text-gray-500">more_vert</span>
                  </Button>
                </div>
              </Card>
              
              <Card className="shadow-sm">
                <div className="flex p-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="material-icons text-green-600">description</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">টিউশন ফি প্রদান সংক্রান্ত বিজ্ঞপ্তি</h3>
                    <p className="text-sm text-gray-500">প্রকাশিত: ২০ এপ্রিল, ২০২৫</p>
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