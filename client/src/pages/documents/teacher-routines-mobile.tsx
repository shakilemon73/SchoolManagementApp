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

// Define schema for period
const periodSchema = z.object({
  day: z.string().min(1, { message: "Day is required" }),
  period: z.string().min(1, { message: "Period number is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  className: z.string().min(1, { message: "Class is required" }),
  section: z.string().optional(),
  room: z.string().optional(),
});

// Define schema for teacher routine information
const routineSchema = z.object({
  teacherName: z.string().min(2, { message: "Teacher name is required" }),
  teacherNameBn: z.string().optional(),
  designation: z.string().min(1, { message: "Designation is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  employeeId: z.string().optional(),
  academicYear: z.string().min(1, { message: "Academic year is required" }),
  semester: z.string().optional(),
  institution: z.string().min(1, { message: "Institution name is required" }),
  totalPeriods: z.string().min(1, { message: "Total periods is required" }),
  effectiveFrom: z.string().min(1, { message: "Effective date is required" }),
  periods: z.array(periodSchema).min(1, { message: "At least one period is required" }),
  remarks: z.string().optional(),
  teacherPhoto: z.string().optional(),
});

// Schema for template settings
const templateSchema = z.object({
  layout: z.enum(['1', '2', '4', '9']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'detailed', 'simple', 'compact', 'custom']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeQRCode: z.boolean(),
  includeWatermark: z.boolean(),
  showWeekends: z.boolean(),
  colorCoded: z.boolean(),
});

// Days of the week for the routine
const daysOfWeek = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday"
];

// Period times
const periodTimes = [
  "8:00 AM - 8:45 AM",
  "8:50 AM - 9:35 AM",
  "9:40 AM - 10:25 AM",
  "10:40 AM - 11:25 AM",
  "11:30 AM - 12:15 PM",
  "12:20 PM - 1:05 PM",
  "1:10 PM - 1:55 PM",
  "2:00 PM - 2:45 PM"
];

// Subjects
const subjects = [
  "Bangla",
  "English",
  "Mathematics",
  "Science",
  "Social Science",
  "Religion",
  "ICT",
  "Agriculture",
  "Physical Education",
  "Arts & Crafts"
];

// Classes
const classes = [
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12"
];

// Sections
const sections = [
  "A",
  "B",
  "C",
  "D"
];

export default function TeacherRoutinesPage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [periods, setPeriods] = useState([
    { id: 1, day: "Saturday", period: "1", time: "8:00 AM - 8:45 AM", subject: "Mathematics", className: "10", section: "A", room: "Room 101" },
    { id: 2, day: "Saturday", period: "3", time: "9:40 AM - 10:25 AM", subject: "Mathematics", className: "9", section: "B", room: "Room 203" },
    { id: 3, day: "Saturday", period: "6", time: "12:20 PM - 1:05 PM", subject: "Mathematics", className: "8", section: "A", room: "Room 102" },
    { id: 4, day: "Sunday", period: "2", time: "8:50 AM - 9:35 AM", subject: "Mathematics", className: "10", section: "B", room: "Room 204" },
    { id: 5, day: "Sunday", period: "4", time: "10:40 AM - 11:25 AM", subject: "Mathematics", className: "7", section: "A", room: "Room 105" },
    { id: 6, day: "Monday", period: "1", time: "8:00 AM - 8:45 AM", subject: "Mathematics", className: "10", section: "A", room: "Room 101" },
    { id: 7, day: "Monday", period: "5", time: "11:30 AM - 12:15 PM", subject: "Mathematics", className: "9", section: "A", room: "Room 201" },
    { id: 8, day: "Tuesday", period: "3", time: "9:40 AM - 10:25 AM", subject: "Mathematics", className: "8", section: "B", room: "Room 104" },
    { id: 9, day: "Wednesday", period: "2", time: "8:50 AM - 9:35 AM", subject: "Mathematics", className: "7", section: "B", room: "Room 106" },
    { id: 10, day: "Thursday", period: "4", time: "10:40 AM - 11:25 AM", subject: "Mathematics", className: "10", section: "A", room: "Room 101" },
  ]);
  const [nextPeriodId, setNextPeriodId] = useState(11);
  
  // Teacher routine form setup
  const routineForm = useForm<z.infer<typeof routineSchema>>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      teacherName: "Abdul Karim",
      teacherNameBn: "আব্দুল করিম",
      designation: "Senior Teacher",
      department: "Mathematics",
      employeeId: "EMP-2023-0015",
      academicYear: "2023",
      semester: "1st Semester",
      institution: "Dhaka Public School and College",
      totalPeriods: "10",
      effectiveFrom: "2023-01-15",
      periods: periods.map(period => ({
        day: period.day,
        period: period.period,
        time: period.time,
        subject: period.subject,
        className: period.className,
        section: period.section,
        room: period.room
      })),
      remarks: "This routine is subject to change based on institutional requirements.",
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
      showWeekends: true,
      colorCoded: true
    }
  });

  // Handle form submission for generating teacher routine
  const onGenerateSubmit = (routineData: z.infer<typeof routineSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Routine Data:", routineData);
    console.log("Template Data:", templateData);
    
    // Update the total periods
    routineForm.setValue("totalPeriods", routineData.periods.length.toString());
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "শিক্ষক রুটিন তৈরি হয়েছে",
        description: "আপনার শিক্ষক রুটিন সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Add a new period
  const addPeriod = () => {
    const newPeriod = { 
      id: nextPeriodId, 
      day: "Saturday", 
      period: "1", 
      time: "8:00 AM - 8:45 AM", 
      subject: "Mathematics", 
      className: "10", 
      section: "A", 
      room: "Room 101" 
    };
    setPeriods([...periods, newPeriod]);
    setNextPeriodId(nextPeriodId + 1);
    
    const currentPeriods = routineForm.getValues("periods") || [];
    routineForm.setValue("periods", [...currentPeriods, { 
      day: newPeriod.day,
      period: newPeriod.period,
      time: newPeriod.time,
      subject: newPeriod.subject,
      className: newPeriod.className,
      section: newPeriod.section,
      room: newPeriod.room
    }]);
    
    // Update the total periods count
    routineForm.setValue("totalPeriods", (currentPeriods.length + 1).toString());
  };
  
  // Remove a period
  const removePeriod = (index: number) => {
    const updatedPeriods = [...periods];
    updatedPeriods.splice(index, 1);
    setPeriods(updatedPeriods);
    
    const currentPeriods = routineForm.getValues("periods") || [];
    const updatedFormPeriods = [...currentPeriods];
    updatedFormPeriods.splice(index, 1);
    routineForm.setValue("periods", updatedFormPeriods);
    
    // Update the total periods count
    routineForm.setValue("totalPeriods", updatedFormPeriods.length.toString());
  };
  
  // Update period in the form
  const updatePeriod = (index: number, field: keyof (typeof periods)[0], value: string) => {
    const currentPeriods = [...periods];
    currentPeriods[index] = { ...currentPeriods[index], [field]: value };
    setPeriods(currentPeriods);
    
    const formPeriods = routineForm.getValues("periods") || [];
    const updatedFormPeriods = [...formPeriods];
    updatedFormPeriods[index] = { ...updatedFormPeriods[index], [field]: value };
    routineForm.setValue("periods", updatedFormPeriods);
    
    // Special handling for period number change - update the time accordingly
    if (field === "period") {
      const periodIndex = parseInt(value) - 1;
      if (periodIndex >= 0 && periodIndex < periodTimes.length) {
        const newTime = periodTimes[periodIndex];
        currentPeriods[index].time = newTime;
        updatedFormPeriods[index].time = newTime;
        setPeriods(currentPeriods);
        routineForm.setValue("periods", updatedFormPeriods);
      }
    }
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const routineElement = document.getElementById('teacher-routine-preview');
    if (!routineElement) return;

    const canvas = await html2canvas(routineElement, {
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

    pdf.save(`teacher-routine-${routineForm.getValues('teacherName').replace(/\s+/g, '-')}-${routineForm.getValues('academicYear')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার শিক্ষক রুটিন পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    routineForm.reset();
    templateForm.reset();
  };
  
  // Import teachers handler
  const handleImportTeachers = () => {
    setIsBatchLoading(true);
    setBatchError(null);
    
    // In a real application, this would be an API call to fetch teachers
    // Simulating API call with timeout
    setTimeout(() => {
      try {
        // Simulating successful response
        setSelectedTeachers(["1", "2", "3", "4", "5"]);
        setIsBatchLoading(false);
        
        toast({
          title: "আমদানি সফল",
          description: "ডাটাবেস থেকে ৫ জন শিক্ষক আমদানি করা হয়েছে",
        });
      } catch (error) {
        setIsBatchLoading(false);
        setBatchError("শিক্ষক ডাটা আমদানি করতে সমস্যা হয়েছে");
        
        toast({
          title: "আমদানি ব্যর্থ",
          description: "ডাটাবেস থেকে শিক্ষক আমদানি করতে সমস্যা হয়েছে",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  // Define tabs for the mobile view
  const tabItems = [
    { id: "generate", label: "জেনারেট", icon: "add_to_photos" },
    { id: "batch", label: "ব্যাচ", icon: "groups" },
    { id: "templates", label: "টেমপ্লেট", icon: "dashboard_customize" },
    { id: "history", label: "হিস্ট্রি", icon: "history" },
  ];

  // Create a grouped periods by day for easier rendering in the preview
  const groupPeriodsByDay = (periodsList: typeof periods) => {
    const grouped: Record<string, typeof periods> = {};
    
    daysOfWeek.forEach(day => {
      grouped[day] = periodsList.filter(period => period.day === day);
    });
    
    return grouped;
  };
  
  // Sort periods by period number
  const sortPeriodsByNumber = (periodsList: typeof periods) => {
    return [...periodsList].sort((a, b) => parseInt(a.period) - parseInt(b.period));
  };

  return (
    <AppShell>
      <MobilePageLayout
        title="শিক্ষক পিরিয়ড রুটিন"
        description="শিক্ষকদের পিরিয়ড রুটিন তৈরি করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(routineForm.getValues(), templateForm.getValues()),
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
                    রুটিনের জন্য শিক্ষকের প্রয়োজনীয় তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...routineForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="প্রাথমিক তথ্য" 
                        icon="person"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={routineForm.control}
                            name="teacherName"
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
                            control={routineForm.control}
                            name="teacherNameBn"
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
                              control={routineForm.control}
                              name="designation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">পদবি</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="work" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={routineForm.control}
                              name="department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">বিভাগ</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="business" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={routineForm.control}
                            name="employeeId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">কর্মচারী আইডি</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="badge" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={routineForm.control}
                            name="institution"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">প্রতিষ্ঠানের নাম</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="account_balance" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Schedule Information */}
                      <FormSection 
                        title="সময়সূচী তথ্য" 
                        icon="schedule"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={routineForm.control}
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
                              control={routineForm.control}
                              name="semester"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">সেমিস্টার/টার্ম</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="সেমিস্টার নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1st Semester">১ম সেমিস্টার</SelectItem>
                                      <SelectItem value="2nd Semester">২য় সেমিস্টার</SelectItem>
                                      <SelectItem value="Annual">বার্ষিক</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={routineForm.control}
                              name="totalPeriods"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">মোট পিরিয়ড</FormLabel>
                                  <FormControl>
                                    <MobileInput 
                                      leftIcon="view_timeline" 
                                      type="number" 
                                      readOnly 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={routineForm.control}
                              name="effectiveFrom"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">কার্যকর তারিখ</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="calendar_today" type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </FormSection>
                      
                      {/* Periods Section */}
                      <FormSection 
                        title="পিরিয়ড বিবরণ" 
                        icon="schedule"
                        defaultOpen={true}
                      >
                        <div className="space-y-4">
                          {periods.map((period, index) => (
                            <div key={period.id} className="border rounded-lg p-3">
                              <div className="grid grid-cols-1 gap-3">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium text-base">পিরিয়ড #{index + 1}</h4>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 text-destructive"
                                    onClick={() => removePeriod(index)}
                                    disabled={periods.length <= 1}
                                  >
                                    <span className="material-icons">delete</span>
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                      {index === 0 && "দিন"}
                                    </FormLabel>
                                    <Select 
                                      value={period.day}
                                      onValueChange={(value) => updatePeriod(index, "day", value)}
                                    >
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="দিন নির্বাচন করুন" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {daysOfWeek.map(day => (
                                          <SelectItem key={day} value={day}>{day}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                      {index === 0 && "পিরিয়ড নং"}
                                    </FormLabel>
                                    <Select 
                                      value={period.period}
                                      onValueChange={(value) => updatePeriod(index, "period", value)}
                                    >
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="পিরিয়ড নির্বাচন করুন" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[...Array(8)].map((_, i) => (
                                          <SelectItem key={i+1} value={(i+1).toString()}>
                                            পিরিয়ড {i+1}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div>
                                  <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                    {index === 0 && "সময়"}
                                  </FormLabel>
                                  <Select 
                                    value={period.time}
                                    onValueChange={(value) => updatePeriod(index, "time", value)}
                                  >
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="সময় নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {periodTimes.map(time => (
                                        <SelectItem key={time} value={time}>{time}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                    {index === 0 && "বিষয়"}
                                  </FormLabel>
                                  <Select 
                                    value={period.subject}
                                    onValueChange={(value) => updatePeriod(index, "subject", value)}
                                  >
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {subjects.map(subject => (
                                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                      {index === 0 && "শ্রেণী"}
                                    </FormLabel>
                                    <Select 
                                      value={period.className}
                                      onValueChange={(value) => updatePeriod(index, "className", value)}
                                    >
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {classes.map(cls => (
                                          <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                      {index === 0 && "শাখা"}
                                    </FormLabel>
                                    <Select 
                                      value={period.section}
                                      onValueChange={(value) => updatePeriod(index, "section", value)}
                                    >
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="শাখা নির্বাচন করুন" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {sections.map(section => (
                                          <SelectItem key={section} value={section}>Section {section}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div>
                                  <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                    {index === 0 && "রুম নম্বর"}
                                  </FormLabel>
                                  <MobileInput 
                                    leftIcon="meeting_room" 
                                    placeholder="রুম নম্বর" 
                                    value={period.room}
                                    onChange={(e) => updatePeriod(index, "room", e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full gap-2"
                            onClick={addPeriod}
                          >
                            <span className="material-icons">add</span>
                            নতুন পিরিয়ড যোগ করুন
                          </Button>
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
                            control={routineForm.control}
                            name="remarks"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">মন্তব্য</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="রুটিন সম্পর্কে যেকোনো অতিরিক্ত মন্তব্য"
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
                    রুটিন সেটিংস
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
                                <SelectItem value="compact">কম্প্যাক্ট</SelectItem>
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
                                  রুটিনে প্রতিষ্ঠানের লোগো দেখাবে
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
                                  রুটিনে অধ্যক্ষের স্বাক্ষর দেখাবে
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
                                  রুটিনে ভেরিফিকেশন QR কোড দেখাবে
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
                                  রুটিনে প্রতিষ্ঠানের ওয়াটারমার্ক দেখাবে
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
                          name="showWeekends"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">সাপ্তাহিক ছুটির দিন দেখান</FormLabel>
                                <FormDescription>
                                  সাপ্তাহিক ছুটির দিনও রুটিনে দেখাবে
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
                          name="colorCoded"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">কালার কোডিং</FormLabel>
                                <FormDescription>
                                  বিভিন্ন বিষয়ের জন্য আলাদা রং ব্যবহার করবে
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
              <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-2xl relative" id="teacher-routine-preview">
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
                    {routineForm.getValues("institution")}
                  </h1>
                  <p className="text-sm text-gray-500">ঢাকা, বাংলাদেশ</p>
                  
                  <div className="mt-2 py-1 px-4 bg-primary/10 rounded-lg inline-block">
                    <h2 className="text-lg font-semibold text-primary">শিক্ষক পিরিয়ড রুটিন</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-[3fr,1fr] gap-4">
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        <p className="text-gray-500">শিক্ষকের নাম:</p>
                        <p className="font-medium">{routineForm.getValues("teacherName")}</p>
                      </div>
                      
                      {routineForm.getValues("teacherNameBn") && (
                        <p className="font-medium">{routineForm.getValues("teacherNameBn")}</p>
                      )}
                      
                      <div className="flex gap-1">
                        <p className="text-gray-500">পদবি:</p>
                        <p className="font-medium">{routineForm.getValues("designation")}</p>
                      </div>
                      
                      <div className="flex gap-1">
                        <p className="text-gray-500">বিভাগ:</p>
                        <p className="font-medium">{routineForm.getValues("department")}</p>
                      </div>
                      
                      {routineForm.getValues("employeeId") && (
                        <div className="flex gap-1">
                          <p className="text-gray-500">আইডি:</p>
                          <p className="font-medium">{routineForm.getValues("employeeId")}</p>
                        </div>
                      )}
                    </div>
                    
                    {routineForm.getValues("teacherPhoto") ? (
                      <img 
                        src={routineForm.getValues("teacherPhoto")} 
                        alt="Teacher" 
                        className="h-24 w-24 object-cover border rounded"
                      />
                    ) : (
                      <div className="border border-dashed border-gray-300 rounded flex items-center justify-center h-24 w-24">
                        <div className="text-center p-2">
                          <span className="material-icons text-3xl text-gray-400">photo_camera</span>
                          <p className="text-xs text-gray-500">ছবি</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                      <div>
                        <p className="text-gray-500">শিক্ষাবর্ষ:</p>
                        <p className="font-medium">{routineForm.getValues("academicYear")}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">সেমিস্টার:</p>
                        <p className="font-medium">{routineForm.getValues("semester")}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">মোট পিরিয়ড:</p>
                        <p className="font-medium">{routineForm.getValues("totalPeriods")}</p>
                      </div>
                      
                      <div className="col-span-3">
                        <p className="text-gray-500">কার্যকর তারিখ:</p>
                        <p className="font-medium">{new Date(routineForm.getValues("effectiveFrom")).toLocaleDateString('bn-BD')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Display routine by day */}
                    {Object.entries(groupPeriodsByDay(periods)).map(([day, dayPeriods]) => {
                      // Skip empty days or weekend based on setting
                      if (dayPeriods.length === 0 || (!templateForm.getValues("showWeekends") && day === "Friday")) {
                        return null;
                      }
                      
                      // Generate background color for the day header
                      const dayColor = day === "Friday" ? "bg-red-50" : "bg-gray-100";
                      
                      return (
                        <div key={day} className="rounded-lg border overflow-hidden">
                          <div className={`py-2 px-3 ${dayColor}`}>
                            <h3 className="font-medium">{day}</h3>
                          </div>
                          
                          {dayPeriods.length > 0 ? (
                            <div className="divide-y">
                              {sortPeriodsByNumber(dayPeriods).map(period => {
                                // Generate a color based on subject if color coding is enabled
                                const subjectIndex = subjects.indexOf(period.subject);
                                const colors = [
                                  "bg-blue-50", "bg-green-50", "bg-yellow-50", 
                                  "bg-purple-50", "bg-pink-50", "bg-indigo-50", 
                                  "bg-orange-50", "bg-teal-50", "bg-red-50", "bg-gray-50"
                                ];
                                const colorClass = templateForm.getValues("colorCoded") 
                                  ? colors[subjectIndex % colors.length] 
                                  : "";
                                
                                return (
                                  <div key={period.id} className={`p-3 ${colorClass}`}>
                                    <div className="grid grid-cols-[1fr,auto] gap-2">
                                      <div>
                                        <p className="font-medium">{period.subject}</p>
                                        <p className="text-sm">
                                          Class {period.className} {period.section && `(${period.section})`}
                                          {period.room && ` - ${period.room}`}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium">Period {period.period}</p>
                                        <p className="text-sm text-gray-500">{period.time}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-500 italic">
                              কোন পিরিয়ড নেই
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {routineForm.getValues("remarks") && (
                    <div className="border-t pt-2">
                      <p className="text-sm text-gray-500">মন্তব্য:</p>
                      <p className="font-medium">{routineForm.getValues("remarks")}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="min-h-12 flex items-end justify-center mb-1">
                      <div className="border-b border-gray-900 w-24">
                        <div className="text-xs italic text-gray-500 -mb-2">signature</div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm">{routineForm.getValues("teacherName")}</p>
                      <p className="text-xs text-gray-500">{routineForm.getValues("designation")}</p>
                    </div>
                  </div>
                  
                  {templateForm.getValues("includeSignature") && (
                    <div className="text-center">
                      <div className="min-h-12 flex items-end justify-center mb-1">
                        <div className="border-b border-gray-900 w-24">
                          <div className="text-xs italic text-gray-500 -mb-2">signature</div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm">অধ্যক্ষ</p>
                        <p className="text-xs text-gray-500">{routineForm.getValues("institution")}</p>
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
                একসাথে শিক্ষক রুটিন তৈরি করুন
              </CardTitle>
              <CardDescription>
                একই সাথে একাধিক শিক্ষকের রুটিন তৈরি করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <h3 className="text-base font-medium">শিক্ষক নির্বাচন করুন</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs h-8 px-2 gap-1"
                      onClick={handleImportTeachers}
                      disabled={isBatchLoading}
                    >
                      {isBatchLoading ? (
                        <>
                          <span className="animate-spin material-icons text-sm">sync</span>
                          আমদানি হচ্ছে...
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-sm">download</span>
                          আমদানি করুন
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {batchError && (
                    <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm flex items-center gap-2 mt-2">
                      <span className="material-icons text-sm">error</span>
                      {batchError}
                    </div>
                  )}
                  
                  {selectedTeachers.length === 0 ? (
                    <div className="border rounded-lg p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <span className="material-icons text-4xl text-muted-foreground">person_search</span>
                      </div>
                      <p className="text-muted-foreground">
                        কোন শিক্ষক নির্বাচন করা হয়নি। ডাটাবেস থেকে আমদানি করুন বা নতুন তৈরি করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg divide-y">
                      {selectedTeachers.map((id) => (
                        <div key={id} className="flex items-center p-3 justify-between">
                          <div className="flex items-center gap-3">
                            <span className="material-icons text-muted-foreground">person</span>
                            <div>
                              <p className="font-medium">শিক্ষক #{id}</p>
                              <p className="text-sm text-muted-foreground">Math Department</p>
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
                  <h3 className="text-base font-medium mb-3">শিক্ষাবর্ষ এবং সেমিস্টার নির্বাচন করুন</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">শিক্ষাবর্ষ</label>
                      <MobileInput leftIcon="event" defaultValue="2023" />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">সেমিস্টার</label>
                      <Select defaultValue="1st Semester">
                        <SelectTrigger className="mobile-select">
                          <SelectValue placeholder="সেমিস্টার নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Semester">১ম সেমিস্টার</SelectItem>
                          <SelectItem value="2nd Semester">২য় সেমিস্টার</SelectItem>
                          <SelectItem value="Annual">বার্ষিক</SelectItem>
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
                          সব শিক্ষকের জন্য একই ফরম্যাট ব্যবহার করুন
                        </FormDescription>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">একটি ফাইলে সংরক্ষণ করুন</FormLabel>
                        <FormDescription>
                          সবগুলো শিক্ষক রুটিন একটি পিডিএফ ফাইলে রাখুন
                        </FormDescription>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    className="w-full gap-2"
                    disabled={isBatchLoading || selectedTeachers.length === 0}
                    onClick={() => {
                      setIsBatchLoading(true);
                      // Simulate batch processing
                      setTimeout(() => {
                        setIsBatchLoading(false);
                        toast({
                          title: "ব্যাচ প্রসেস সম্পন্ন",
                          description: `${selectedTeachers.length}টি শিক্ষক রুটিন সফলভাবে তৈরি করা হয়েছে`,
                        });
                      }, 2000);
                    }}
                  >
                    {isBatchLoading ? (
                      <>
                        <span className="animate-spin material-icons">sync</span>
                        প্রসেস হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span className="material-icons">dynamic_feed</span>
                        ব্যাচ প্রসেস শুরু করুন
                      </>
                    )}
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
                        স্ট্যান্ডার্ড রুটিন
                      </label>
                      <p className="text-sm text-muted-foreground">
                        সাধারণ রুটিন টেমপ্লেট
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
                        বিস্তারিত রুটিন
                      </label>
                      <p className="text-sm text-muted-foreground">
                        অতিরিক্ত তথ্য সহ বিস্তারিত রুটিন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="compact" id="compact" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="compact"
                        className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        কম্প্যাক্ট রুটিন
                      </label>
                      <p className="text-sm text-muted-foreground">
                        টেবিল ফরম্যাট সহ সংক্ষিপ্ত রুটিন
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
                সাম্প্রতিক তৈরি করা রুটিন
              </CardTitle>
              <CardDescription>
                আপনার সাম্প্রতিক তৈরি করা শিক্ষক রুটিন দেখুন
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
                      আপনি এখনও কোন শিক্ষক রুটিন তৈরি করেননি।
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