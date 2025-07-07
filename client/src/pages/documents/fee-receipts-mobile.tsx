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

// Define schema for fee item
const feeItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
});

// Define schema for fee receipt information
const feeReceiptSchema = z.object({
  studentName: z.string().min(2, { message: "Student name is required" }),
  studentNameBn: z.string().optional(),
  fatherName: z.string().min(2, { message: "Father's name is required" }),
  className: z.string().min(1, { message: "Class is required" }),
  section: z.string().optional(),
  rollNumber: z.string().min(1, { message: "Roll number is required" }),
  academicYear: z.string().min(1, { message: "Academic year is required" }),
  month: z.string().optional(),
  receiptDate: z.string().min(1, { message: "Receipt date is required" }),
  receiptNumber: z.string().min(1, { message: "Receipt number is required" }),
  paymentMethod: z.string().default("cash"),
  studentId: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  feeItems: z.array(feeItemSchema).min(1, { message: "At least one fee item is required" }),
  discount: z.string().optional(),
  previousDue: z.string().optional(),
  lateFee: z.string().optional(),
  paymentReference: z.string().optional(),
  remarks: z.string().optional(),
});

// Schema for receipt template settings
const templateSchema = z.object({
  layout: z.enum(['1', '2', '4', '9']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'detailed', 'simple', 'custom']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeQRCode: z.boolean(),
  includeWatermark: z.boolean(),
  includeStamp: z.boolean(),
  includeDuplicate: z.boolean(),
});

export default function FeeReceiptsPage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [feeItems, setFeeItems] = useState([
    { id: 1, description: "Tuition Fee", amount: "2000" },
    { id: 2, description: "Exam Fee", amount: "500" },
    { id: 3, description: "Library Fee", amount: "300" },
  ]);
  const [nextFeeItemId, setNextFeeItemId] = useState(4);
  
  // Calculate total amount
  const calculateTotal = (items: { description: string, amount: string }[], discount: string, previousDue: string, lateFee: string) => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const discountAmount = parseFloat(discount) || 0;
    const dueAmount = parseFloat(previousDue) || 0;
    const lateAmount = parseFloat(lateFee) || 0;
    
    return {
      subtotal,
      discountAmount,
      dueAmount,
      lateAmount,
      total: subtotal - discountAmount + dueAmount + lateAmount
    };
  };
  
  // Fee receipt form setup
  const feeReceiptForm = useForm<z.infer<typeof feeReceiptSchema>>({
    resolver: zodResolver(feeReceiptSchema),
    defaultValues: {
      studentName: "Mohammad Rahman",
      studentNameBn: "মোহাম্মদ রহমান",
      fatherName: "Abdul Karim",
      className: "10",
      section: "A",
      rollNumber: "15",
      academicYear: "2023",
      month: "May",
      receiptDate: "2023-05-10",
      receiptNumber: "RCP-2023-0015",
      paymentMethod: "cash",
      studentId: "STD-2023-0015",
      phoneNumber: "01712345678",
      address: "123, Green Road, Dhanmondi, Dhaka-1205",
      feeItems: feeItems.map(item => ({ description: item.description, amount: item.amount })),
      discount: "300",
      previousDue: "0",
      lateFee: "0",
      paymentReference: "",
      remarks: "",
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
      includeStamp: true,
      includeDuplicate: true
    }
  });

  // Handle form submission for generating fee receipt
  const onGenerateSubmit = (feeReceiptData: z.infer<typeof feeReceiptSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Fee Receipt Data:", feeReceiptData);
    console.log("Template Data:", templateData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "ফি রসিদ তৈরি হয়েছে",
        description: "আপনার ফি রসিদ সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Add a new fee item
  const addFeeItem = () => {
    const newItem = { id: nextFeeItemId, description: "", amount: "" };
    setFeeItems([...feeItems, newItem]);
    setNextFeeItemId(nextFeeItemId + 1);
    
    const currentItems = feeReceiptForm.getValues("feeItems") || [];
    feeReceiptForm.setValue("feeItems", [...currentItems, { description: "", amount: "" }]);
  };
  
  // Remove a fee item
  const removeFeeItem = (index: number) => {
    const updatedItems = [...feeItems];
    updatedItems.splice(index, 1);
    setFeeItems(updatedItems);
    
    const currentItems = feeReceiptForm.getValues("feeItems") || [];
    const updatedFormItems = [...currentItems];
    updatedFormItems.splice(index, 1);
    feeReceiptForm.setValue("feeItems", updatedFormItems);
  };
  
  // Update fee item in the form
  const updateFeeItem = (index: number, field: "description" | "amount", value: string) => {
    const currentItems = [...feeItems];
    currentItems[index] = { ...currentItems[index], [field]: value };
    setFeeItems(currentItems);
    
    const formItems = feeReceiptForm.getValues("feeItems") || [];
    const updatedFormItems = [...formItems];
    updatedFormItems[index] = { ...updatedFormItems[index], [field]: value };
    feeReceiptForm.setValue("feeItems", updatedFormItems);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const receiptElement = document.getElementById('fee-receipt-preview');
    if (!receiptElement) return;

    const canvas = await html2canvas(receiptElement, {
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

    pdf.save(`fee-receipt-${feeReceiptForm.getValues('receiptNumber')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার ফি রসিদ পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    feeReceiptForm.reset();
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
        title="ফি রসিদ"
        description="শিক্ষার্থীদের ফি রসিদ তৈরি করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(feeReceiptForm.getValues(), templateForm.getValues()),
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
                    ফি রসিদের জন্য শিক্ষার্থীর প্রয়োজনীয় তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...feeReceiptForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="প্রাথমিক তথ্য" 
                        icon="person"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={feeReceiptForm.control}
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
                            control={feeReceiptForm.control}
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
                            control={feeReceiptForm.control}
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
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={feeReceiptForm.control}
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
                              control={feeReceiptForm.control}
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
                              control={feeReceiptForm.control}
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
                              control={feeReceiptForm.control}
                              name="studentId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">শিক্ষার্থী আইডি</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="badge" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={feeReceiptForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">ফোন নম্বর</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="phone" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={feeReceiptForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">ঠিকানা</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="শিক্ষার্থীর ঠিকানা লিখুন"
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
                      
                      {/* Receipt Information */}
                      <FormSection 
                        title="রসিদ তথ্য" 
                        icon="receipt"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={feeReceiptForm.control}
                              name="receiptNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">রসিদ নং</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="receipt" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={feeReceiptForm.control}
                              name="receiptDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">তারিখ</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="calendar_today" type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={feeReceiptForm.control}
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
                            
                            <FormField
                              control={feeReceiptForm.control}
                              name="month"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">মাস</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="মাস নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="January">জানুয়ারি</SelectItem>
                                      <SelectItem value="February">ফেব্রুয়ারি</SelectItem>
                                      <SelectItem value="March">মার্চ</SelectItem>
                                      <SelectItem value="April">এপ্রিল</SelectItem>
                                      <SelectItem value="May">মে</SelectItem>
                                      <SelectItem value="June">জুন</SelectItem>
                                      <SelectItem value="July">জুলাই</SelectItem>
                                      <SelectItem value="August">আগস্ট</SelectItem>
                                      <SelectItem value="September">সেপ্টেম্বর</SelectItem>
                                      <SelectItem value="October">অক্টোবর</SelectItem>
                                      <SelectItem value="November">নভেম্বর</SelectItem>
                                      <SelectItem value="December">ডিসেম্বর</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={feeReceiptForm.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">পেমেন্ট পদ্ধতি</FormLabel>
                                <FormControl>
                                  <RadioGroup 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                    className="flex gap-4"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="cash" id="cash" />
                                      <label htmlFor="cash">নগদ</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="bank" id="bank" />
                                      <label htmlFor="bank">ব্যাংক</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="mobile" id="mobile" />
                                      <label htmlFor="mobile">মোবাইল ব্যাংকিং</label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {(feeReceiptForm.watch("paymentMethod") === "bank" || feeReceiptForm.watch("paymentMethod") === "mobile") && (
                            <FormField
                              control={feeReceiptForm.control}
                              name="paymentReference"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">পেমেন্ট রেফারেন্স</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="receipt_long" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    ব্যাংক/মোবাইল ট্রানজেকশন আইডি
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </FormSection>
                      
                      {/* Fee Items */}
                      <FormSection 
                        title="ফি আইটেম" 
                        icon="list_alt"
                        defaultOpen={true}
                      >
                        <div className="space-y-4">
                          {feeItems.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-[7fr,4fr,1fr] gap-2 items-start">
                              <FormItem>
                                <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                  {index === 0 && "বিবরণ"}
                                </FormLabel>
                                <FormControl>
                                  <MobileInput 
                                    leftIcon="description" 
                                    placeholder="ফি আইটেম" 
                                    value={item.description}
                                    onChange={(e) => updateFeeItem(index, "description", e.target.value)}
                                  />
                                </FormControl>
                              </FormItem>
                              
                              <FormItem>
                                <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                  {index === 0 && "পরিমাণ (৳)"}
                                </FormLabel>
                                <FormControl>
                                  <MobileInput 
                                    leftIcon="payments" 
                                    placeholder="পরিমাণ" 
                                    type="number"
                                    value={item.amount}
                                    onChange={(e) => updateFeeItem(index, "amount", e.target.value)}
                                  />
                                </FormControl>
                              </FormItem>
                              
                              <div className="flex items-end">
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-10 mt-6"
                                  onClick={() => removeFeeItem(index)}
                                  disabled={feeItems.length <= 1}
                                >
                                  <span className="material-icons text-destructive">delete</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full gap-2"
                            onClick={addFeeItem}
                          >
                            <span className="material-icons">add</span>
                            নতুন আইটেম যোগ করুন
                          </Button>
                          
                          <div className="pt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <FormField
                                control={feeReceiptForm.control}
                                name="discount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base">ডিসকাউন্ট</FormLabel>
                                    <FormControl>
                                      <MobileInput leftIcon="sell" type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={feeReceiptForm.control}
                                name="previousDue"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base">পূর্ববর্তী বকেয়া</FormLabel>
                                    <FormControl>
                                      <MobileInput leftIcon="history" type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={feeReceiptForm.control}
                              name="lateFee"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">বিলম্ব ফি</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="watch_later" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="bg-muted/30 p-3 rounded-lg mt-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-right font-medium">সাবটোটাল:</div>
                              <div className="font-bold">
                                ৳ {calculateTotal(
                                  feeReceiptForm.getValues("feeItems"),
                                  feeReceiptForm.getValues("discount"),
                                  feeReceiptForm.getValues("previousDue"),
                                  feeReceiptForm.getValues("lateFee")
                                ).subtotal.toLocaleString()}
                              </div>
                              
                              <div className="text-right font-medium">ডিসকাউন্ট:</div>
                              <div className="font-bold text-destructive">
                                - ৳ {calculateTotal(
                                  feeReceiptForm.getValues("feeItems"),
                                  feeReceiptForm.getValues("discount"),
                                  feeReceiptForm.getValues("previousDue"),
                                  feeReceiptForm.getValues("lateFee")
                                ).discountAmount.toLocaleString()}
                              </div>
                              
                              <div className="text-right font-medium">পূর্ববর্তী বকেয়া:</div>
                              <div className="font-bold">
                                + ৳ {calculateTotal(
                                  feeReceiptForm.getValues("feeItems"),
                                  feeReceiptForm.getValues("discount"),
                                  feeReceiptForm.getValues("previousDue"),
                                  feeReceiptForm.getValues("lateFee")
                                ).dueAmount.toLocaleString()}
                              </div>
                              
                              <div className="text-right font-medium">বিলম্ব ফি:</div>
                              <div className="font-bold">
                                + ৳ {calculateTotal(
                                  feeReceiptForm.getValues("feeItems"),
                                  feeReceiptForm.getValues("discount"),
                                  feeReceiptForm.getValues("previousDue"),
                                  feeReceiptForm.getValues("lateFee")
                                ).lateAmount.toLocaleString()}
                              </div>
                              
                              <div className="text-right font-medium text-primary">সর্বমোট:</div>
                              <div className="font-bold text-primary">
                                ৳ {calculateTotal(
                                  feeReceiptForm.getValues("feeItems"),
                                  feeReceiptForm.getValues("discount"),
                                  feeReceiptForm.getValues("previousDue"),
                                  feeReceiptForm.getValues("lateFee")
                                ).total.toLocaleString()}
                              </div>
                            </div>
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
                            control={feeReceiptForm.control}
                            name="remarks"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">মন্তব্য</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="যেকোনো অতিরিক্ত তথ্য এখানে লিখুন"
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
                    ফি রসিদ সেটিংস
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
                                  ফি রসিদে প্রতিষ্ঠানের লোগো দেখাবে
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
                                  ফি রসিদে অধ্যক্ষের স্বাক্ষর দেখাবে
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
                                  ফি রসিদে ভেরিফিকেশন QR কোড দেখাবে
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
                                  ফি রসিদে প্রতিষ্ঠানের ওয়াটারমার্ক দেখাবে
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
                                  ফি রসিদে প্রতিষ্ঠানের সীলমোহর দেখাবে
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
                          name="includeDuplicate"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">ডুপ্লিকেট কপি</FormLabel>
                                <FormDescription>
                                  অফিস কপি এবং গ্রাহক কপি উভয় অন্তর্ভুক্ত করবে
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
              <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-2xl relative" id="fee-receipt-preview">
                {templateForm.getValues("includeWatermark") && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <span className="material-icons text-9xl text-primary">school</span>
                  </div>
                )}
                
                <div className="text-center mb-4 relative">
                  {templateForm.getValues("includeLogo") && (
                    <div className="flex justify-center mb-2">
                      <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white">
                        <span className="material-icons text-3xl">school</span>
                      </div>
                    </div>
                  )}
                  <h1 className="text-xl font-bold text-primary">
                    ঢাকা পাবলিক স্কুল অ্যান্ড কলেজ
                  </h1>
                  <p className="text-sm text-gray-500">ঢাকা, বাংলাদেশ</p>
                  
                  <div className="mt-2 py-1 px-4 bg-primary/10 rounded-lg inline-block">
                    <h2 className="text-lg font-semibold text-primary">ফি রসিদ</h2>
                  </div>
                </div>
                
                <div className="border-t border-b py-3 mb-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">রসিদ নং:</p>
                      <p className="font-medium">{feeReceiptForm.getValues("receiptNumber")}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-gray-500">তারিখ:</p>
                      <p className="font-medium">{new Date(feeReceiptForm.getValues("receiptDate")).toLocaleDateString('bn-BD')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="grid grid-cols-[3fr,1fr] gap-2 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">শিক্ষার্থীর নাম:</p>
                      <p className="font-medium">{feeReceiptForm.getValues("studentName")}</p>
                      <p className="font-medium">{feeReceiptForm.getValues("studentNameBn")}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">শিক্ষার্থী আইডি:</p>
                      <p className="font-medium">{feeReceiptForm.getValues("studentId")}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">পিতার নাম:</p>
                      <p className="font-medium">{feeReceiptForm.getValues("fatherName")}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">ফোন নম্বর:</p>
                      <p className="font-medium">{feeReceiptForm.getValues("phoneNumber")}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                    <div>
                      <p className="text-gray-500">শ্রেণী:</p>
                      <p className="font-medium">{feeReceiptForm.getValues("className")}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">শাখা:</p>
                      <p className="font-medium">{feeReceiptForm.getValues("section")}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">রোল:</p>
                      <p className="font-medium">{feeReceiptForm.getValues("rollNumber")}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2 flex justify-between">
                    <span>শিক্ষাবর্ষ: {feeReceiptForm.getValues("academicYear")}</span>
                    <span>মাস: {feeReceiptForm.getValues("month")}</span>
                  </div>
                  
                  <table className="w-full text-sm mb-3">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-2 px-2">বিবরণ</th>
                        <th className="text-right py-2 px-2">পরিমাণ (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {feeReceiptForm.getValues("feeItems").map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-2">{item.description}</td>
                          <td className="py-2 px-2 text-right">৳ {parseFloat(item.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="space-y-1 text-sm border-t pt-2">
                    <div className="flex justify-between">
                      <span>সাবটোটাল:</span>
                      <span>৳ {calculateTotal(
                        feeReceiptForm.getValues("feeItems"),
                        feeReceiptForm.getValues("discount"),
                        feeReceiptForm.getValues("previousDue"),
                        feeReceiptForm.getValues("lateFee")
                      ).subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>ডিসকাউন্ট:</span>
                      <span className="text-destructive">- ৳ {calculateTotal(
                        feeReceiptForm.getValues("feeItems"),
                        feeReceiptForm.getValues("discount"),
                        feeReceiptForm.getValues("previousDue"),
                        feeReceiptForm.getValues("lateFee")
                      ).discountAmount.toLocaleString()}</span>
                    </div>
                    
                    {parseFloat(feeReceiptForm.getValues("previousDue") || "0") > 0 && (
                      <div className="flex justify-between">
                        <span>পূর্ববর্তী বকেয়া:</span>
                        <span>+ ৳ {calculateTotal(
                          feeReceiptForm.getValues("feeItems"),
                          feeReceiptForm.getValues("discount"),
                          feeReceiptForm.getValues("previousDue"),
                          feeReceiptForm.getValues("lateFee")
                        ).dueAmount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {parseFloat(feeReceiptForm.getValues("lateFee") || "0") > 0 && (
                      <div className="flex justify-between">
                        <span>বিলম্ব ফি:</span>
                        <span>+ ৳ {calculateTotal(
                          feeReceiptForm.getValues("feeItems"),
                          feeReceiptForm.getValues("discount"),
                          feeReceiptForm.getValues("previousDue"),
                          feeReceiptForm.getValues("lateFee")
                        ).lateAmount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold pt-1 border-t text-primary">
                      <span>সর্বমোট:</span>
                      <span>৳ {calculateTotal(
                        feeReceiptForm.getValues("feeItems"),
                        feeReceiptForm.getValues("discount"),
                        feeReceiptForm.getValues("previousDue"),
                        feeReceiptForm.getValues("lateFee")
                      ).total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-dashed mt-4 pt-2 text-sm">
                    <p><span className="font-medium">পেমেন্ট পদ্ধতি:</span> {
                      feeReceiptForm.getValues("paymentMethod") === "cash" ? "নগদ" :
                      feeReceiptForm.getValues("paymentMethod") === "bank" ? "ব্যাংক" : "মোবাইল ব্যাংকিং"
                    }</p>
                    
                    {feeReceiptForm.getValues("paymentReference") && (
                      <p><span className="font-medium">রেফারেন্স:</span> {feeReceiptForm.getValues("paymentReference")}</p>
                    )}
                    
                    {feeReceiptForm.getValues("remarks") && (
                      <p className="mt-2"><span className="font-medium">মন্তব্য:</span> {feeReceiptForm.getValues("remarks")}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="min-h-12">
                      {templateForm.getValues("includeStamp") && (
                        <div className="flex justify-center items-center min-h-16">
                          <div className="h-14 w-14 rounded-full border-2 border-primary/50 flex items-center justify-center opacity-50">
                            <span className="material-icons text-primary text-xs">paid</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <p className="text-sm">গ্রহণকারীর স্বাক্ষর</p>
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
                
                {templateForm.getValues("includeDuplicate") && (
                  <div className="mt-6 border-t border-dashed pt-3 text-center text-sm text-gray-500">
                    <p>-------------------------------- কাটার রেখা --------------------------------</p>
                    <p className="mt-1">অফিস কপি</p>
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
                একসাথে ফি রসিদ তৈরি করুন
              </CardTitle>
              <CardDescription>
                একই সাথে একাধিক শিক্ষার্থীর ফি রসিদ তৈরি করুন
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
                  <h3 className="text-base font-medium mb-3">ফি নির্বাচন করুন</h3>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tuition" defaultChecked />
                      <label htmlFor="tuition" className="text-sm font-medium">টিউশন ফি</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="admission" />
                      <label htmlFor="admission" className="text-sm font-medium">ভর্তি ফি</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="exam" defaultChecked />
                      <label htmlFor="exam" className="text-sm font-medium">পরীক্ষার ফি</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="library" defaultChecked />
                      <label htmlFor="library" className="text-sm font-medium">লাইব্রেরি ফি</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="lab" />
                      <label htmlFor="lab" className="text-sm font-medium">ল্যাব ফি</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-3">মাস এবং বছর নির্বাচন করুন</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">মাস</label>
                      <Select defaultValue="May">
                        <SelectTrigger className="mobile-select">
                          <SelectValue placeholder="মাস নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="January">জানুয়ারি</SelectItem>
                          <SelectItem value="February">ফেব্রুয়ারি</SelectItem>
                          <SelectItem value="March">মার্চ</SelectItem>
                          <SelectItem value="April">এপ্রিল</SelectItem>
                          <SelectItem value="May">মে</SelectItem>
                          <SelectItem value="June">জুন</SelectItem>
                          <SelectItem value="July">জুলাই</SelectItem>
                          <SelectItem value="August">আগস্ট</SelectItem>
                          <SelectItem value="September">সেপ্টেম্বর</SelectItem>
                          <SelectItem value="October">অক্টোবর</SelectItem>
                          <SelectItem value="November">নভেম্বর</SelectItem>
                          <SelectItem value="December">ডিসেম্বর</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">বছর</label>
                      <Select defaultValue="2023">
                        <SelectTrigger className="mobile-select">
                          <SelectValue placeholder="বছর নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2022">২০২২</SelectItem>
                          <SelectItem value="2023">২০২৩</SelectItem>
                          <SelectItem value="2024">২০২৪</SelectItem>
                          <SelectItem value="2025">২০২৫</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
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
                          সবগুলো ফি রসিদ একটি পিডিএফ ফাইলে রাখুন
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
                        স্ট্যান্ডার্ড ফি রসিদ
                      </label>
                      <p className="text-sm text-muted-foreground">
                        সাধারণ ফি রসিদ টেমপ্লেট
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
                        বিস্তারিত ফি রসিদ
                      </label>
                      <p className="text-sm text-muted-foreground">
                        অতিরিক্ত তথ্য সহ বিস্তারিত ফি রসিদ
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
                        সাধারণ ফি রসিদ
                      </label>
                      <p className="text-sm text-muted-foreground">
                        ন্যূনতম তথ্য সহ সহজ ফি রসিদ
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
                সাম্প্রতিক তৈরি করা ফি রসিদ
              </CardTitle>
              <CardDescription>
                আপনার সাম্প্রতিক তৈরি করা ফি রসিদ দেখুন
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
                      আপনি এখনও কোন ফি রসিদ তৈরি করেননি।
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