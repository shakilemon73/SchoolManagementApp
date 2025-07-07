import { useState, useRef } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const employeeSchema = z.object({
  employeeId: z.string().min(1, { message: "কর্মচারী আইডি আবশ্যক" }),
  name: z.string().min(1, { message: "নাম আবশ্যক" }),
  designation: z.string().min(1, { message: "পদবি আবশ্যক" }),
  department: z.string().min(1, { message: "বিভাগ আবশ্যক" }),
  payPeriod: z.string().min(1, { message: "বেতনের মেয়াদ আবশ্যক" }),
  basicSalary: z.string().min(1, { message: "মূল বেতন আবশ্যক" }),
});

const templateSchema = z.object({
  schoolName: z.string().min(1, { message: "স্কুলের নাম আবশ্যক" }),
  schoolAddress: z.string().min(1, { message: "স্কুলের ঠিকানা আবশ্যক" }),
  template: z.string().min(1, { message: "টেমপ্লেট আবশ্যক" }),
  paperSize: z.string().min(1, { message: "পেপার সাইজ আবশ্যক" }),
});

export default function PaysheetsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("জেনারেট");
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const paysheetRef = useRef<HTMLDivElement>(null);
  
  const employeeForm = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeId: "EMP001",
      name: "মোহাম্মদ আলী",
      designation: "সহকারী শিক্ষক",
      department: "গণিত বিভাগ",
      payPeriod: "জানুয়ারি ২০২৫",
      basicSalary: "২৫০০০",
    }
  });

  const templateForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      schoolName: "আদর্শ উচ্চ বিদ্যালয়",
      schoolAddress: "ঢাকা, বাংলাদেশ",
      template: "standard",
      paperSize: "a4"
    }
  });

  const handleEmployeeSubmit = employeeForm.handleSubmit((data) => {
    setCurrentStep(2);
  });

  const handleTemplateSubmit = templateForm.handleSubmit((data) => {
    setPreviewMode(true);
  });

  const generatePDF = async () => {
    if (!paysheetRef.current) return;

    try {
      const canvas = await html2canvas(paysheetRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`paysheet-${employeeForm.getValues('employeeId')}.pdf`);
      
      toast({
        title: "পে শিট ডাউনলোড হয়েছে",
        description: "পিডিএফ ফাইল সফলভাবে তৈরি হয়েছে।",
      });
    } catch (error) {
      toast({
        title: "ত্রুটি ঘটেছে",
        description: "আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  };

  const calculateTotalSalary = () => {
    const basic = parseInt(employeeForm.getValues('basicSalary') || '0');
    const allowances = basic * 0.2; // 20% allowances
    return basic + allowances;
  };

  return (
    <AppShell>
      <NavigationBar
        title={{
          en: "Pay Sheets",
          bn: "পে শিট",
          ar: "كشوف الرواتب"
        }}
      />
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">পে শিট</h1>
          <p className="text-gray-600">কর্মচারীদের বেতনের বিবরণী তৈরি করুন</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="জেনারেট">জেনারেট</TabsTrigger>
            <TabsTrigger value="টেমপ্লেট">টেমপ্লেট</TabsTrigger>
            <TabsTrigger value="সহায়তা">সহায়তা</TabsTrigger>
          </TabsList>
          
          <TabsContent value="জেনারেট" className="space-y-6">
            {previewMode ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => setPreviewMode(false)}>
                    ← ফিরে যান
                  </Button>
                  <Button onClick={generatePDF}>পিডিএফ ডাউনলোড</Button>
                </div>
                
                <div className="flex justify-center">
                  <div ref={paysheetRef} className="max-w-4xl w-full bg-white p-8 shadow-xl">
                    <div className="text-center mb-8 border-b pb-4">
                      <h1 className="text-2xl font-bold mb-2">{templateForm.getValues('schoolName')}</h1>
                      <p className="text-lg">{templateForm.getValues('schoolAddress')}</p>
                      <h2 className="text-xl font-semibold mt-4">বেতনের বিবরণী</h2>
                      <p>মাস: {employeeForm.getValues('payPeriod')}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="font-semibold mb-4 text-lg border-b pb-2">কর্মচারীর তথ্য</h3>
                        <div className="space-y-2">
                          <p><span className="font-medium">আইডি:</span> {employeeForm.getValues('employeeId')}</p>
                          <p><span className="font-medium">নাম:</span> {employeeForm.getValues('name')}</p>
                          <p><span className="font-medium">পদবি:</span> {employeeForm.getValues('designation')}</p>
                          <p><span className="font-medium">বিভাগ:</span> {employeeForm.getValues('department')}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-4 text-lg border-b pb-2">বেতনের বিবরণ</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>মূল বেতন:</span>
                            <span>৳{employeeForm.getValues('basicSalary')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ভাতা (২০%):</span>
                            <span>৳{(parseInt(employeeForm.getValues('basicSalary')) * 0.2).toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span>মোট বেতন:</span>
                            <span>৳{calculateTotalSalary()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-12 flex justify-between">
                      <div className="text-center">
                        <div className="border-t border-gray-300 pt-2 w-40">
                          <p className="text-sm">প্রস্তুতকারক</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-gray-300 pt-2 w-40">
                          <p className="text-sm">অনুমোদনকারী</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {currentStep === 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>পদক্ষেপ ১: কর্মচারীর তথ্য</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...employeeForm}>
                          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={employeeForm.control}
                                name="employeeId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>কর্মচারী আইডি *</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={employeeForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>নাম *</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <Button type="submit" className="w-full">
                              পরবর্তী ধাপে যান
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  )}
                  
                  {currentStep === 2 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>পদক্ষেপ ২: টেমপ্লেট সেটিংস</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...templateForm}>
                          <form onSubmit={handleTemplateSubmit} className="space-y-4">
                            <FormField
                              control={templateForm.control}
                              name="schoolName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>স্কুলের নাম *</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex gap-4">
                              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                                পূর্ববর্তী ধাপ
                              </Button>
                              <Button type="submit" className="flex-1">
                                প্রিভিউ দেখুন
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="টেমপ্লেট">
            <Card>
              <CardHeader>
                <CardTitle>টেমপ্লেট গ্যালারি</CardTitle>
              </CardHeader>
              <CardContent>
                <p>বিভিন্ন ধরনের পে শিট টেমপ্লেট</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="সহায়তা">
            <Card>
              <CardHeader>
                <CardTitle>ব্যবহার নির্দেশিকা</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold">কিভাবে ব্যবহার করবেন:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>কর্মচারীর তথ্য পূরণ করুন</li>
                    <li>টেমপ্লেট নির্বাচন করুন</li>
                    <li>প্রিভিউ দেখে পিডিএফ ডাউনলোড করুন</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}