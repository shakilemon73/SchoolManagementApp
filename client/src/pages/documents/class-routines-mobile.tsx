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

// Define schema for class period
const classPeriodSchema = z.object({
  day: z.string().min(1, { message: "Day is required" }),
  period: z.string().min(1, { message: "Period number is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  teacher: z.string().min(1, { message: "Teacher is required" }),
  room: z.string().optional(),
});

// Define schema for class routine information
const routineSchema = z.object({
  className: z.string().min(1, { message: "Class is required" }),
  section: z.string().min(1, { message: "Section is required" }),
  academicYear: z.string().min(1, { message: "Academic year is required" }),
  semester: z.string().optional(),
  institution: z.string().min(1, { message: "Institution name is required" }),
  totalStudents: z.string().min(1, { message: "Total students is required" }),
  totalPeriods: z.string().min(1, { message: "Total periods is required" }),
  effectiveFrom: z.string().min(1, { message: "Effective date is required" }),
  classTeacher: z.string().min(1, { message: "Class teacher is required" }),
  periods: z.array(classPeriodSchema).min(1, { message: "At least one period is required" }),
  remarks: z.string().optional(),
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
  tableView: z.boolean(),
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

// Teachers
const teachers = [
  "Abdul Karim (Mathematics)",
  "Fatima Begum (Bangla)",
  "Mohammad Ali (English)",
  "Nusrat Jahan (Science)",
  "Kamal Hossain (Social Science)",
  "Ayesha Khatun (Religion)",
  "Jahid Hasan (ICT)",
  "Arif Islam (Agriculture)",
  "Tahmina Akter (Physical Education)",
  "Sharmin Rahman (Arts & Crafts)"
];

// Class Rooms
const rooms = [
  "Room 101",
  "Room 102",
  "Room 103",
  "Room 104",
  "Room 105",
  "Room 201",
  "Room 202",
  "Room 203",
  "Room 204",
  "Room 205",
  "Science Lab",
  "Computer Lab",
  "Library"
];

export default function ClassRoutinesPage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [periods, setPeriods] = useState([
    { id: 1, day: "Saturday", period: "1", time: "8:00 AM - 8:45 AM", subject: "Mathematics", teacher: "Abdul Karim (Mathematics)", room: "Room 101" },
    { id: 2, day: "Saturday", period: "2", time: "8:50 AM - 9:35 AM", subject: "English", teacher: "Mohammad Ali (English)", room: "Room 101" },
    { id: 3, day: "Saturday", period: "3", time: "9:40 AM - 10:25 AM", subject: "Bangla", teacher: "Fatima Begum (Bangla)", room: "Room 101" },
    { id: 4, day: "Saturday", period: "4", time: "10:40 AM - 11:25 AM", subject: "Science", teacher: "Nusrat Jahan (Science)", room: "Science Lab" },
    { id: 5, day: "Saturday", period: "5", time: "11:30 AM - 12:15 PM", subject: "Social Science", teacher: "Kamal Hossain (Social Science)", room: "Room 101" },
    { id: 6, day: "Sunday", period: "1", time: "8:00 AM - 8:45 AM", subject: "Science", teacher: "Nusrat Jahan (Science)", room: "Science Lab" },
    { id: 7, day: "Sunday", period: "2", time: "8:50 AM - 9:35 AM", subject: "Mathematics", teacher: "Abdul Karim (Mathematics)", room: "Room 101" },
    { id: 8, day: "Sunday", period: "3", time: "9:40 AM - 10:25 AM", subject: "English", teacher: "Mohammad Ali (English)", room: "Room 101" },
    { id: 9, day: "Sunday", period: "4", time: "10:40 AM - 11:25 AM", subject: "ICT", teacher: "Jahid Hasan (ICT)", room: "Computer Lab" },
    { id: 10, day: "Sunday", period: "5", time: "11:30 AM - 12:15 PM", subject: "Bangla", teacher: "Fatima Begum (Bangla)", room: "Room 101" },
    { id: 11, day: "Monday", period: "1", time: "8:00 AM - 8:45 AM", subject: "Social Science", teacher: "Kamal Hossain (Social Science)", room: "Room 101" },
    { id: 12, day: "Monday", period: "2", time: "8:50 AM - 9:35 AM", subject: "Religion", teacher: "Ayesha Khatun (Religion)", room: "Room 101" },
    { id: 13, day: "Monday", period: "3", time: "9:40 AM - 10:25 AM", subject: "Mathematics", teacher: "Abdul Karim (Mathematics)", room: "Room 101" },
    { id: 14, day: "Monday", period: "4", time: "10:40 AM - 11:25 AM", subject: "Arts & Crafts", teacher: "Sharmin Rahman (Arts & Crafts)", room: "Room 101" },
    { id: 15, day: "Monday", period: "5", time: "11:30 AM - 12:15 PM", subject: "Science", teacher: "Nusrat Jahan (Science)", room: "Science Lab" },
    { id: 16, day: "Tuesday", period: "1", time: "8:00 AM - 8:45 AM", subject: "English", teacher: "Mohammad Ali (English)", room: "Room 101" },
    { id: 17, day: "Tuesday", period: "2", time: "8:50 AM - 9:35 AM", subject: "Bangla", teacher: "Fatima Begum (Bangla)", room: "Room 101" },
    { id: 18, day: "Tuesday", period: "3", time: "9:40 AM - 10:25 AM", subject: "Mathematics", teacher: "Abdul Karim (Mathematics)", room: "Room 101" },
    { id: 19, day: "Tuesday", period: "4", time: "10:40 AM - 11:25 AM", subject: "Physical Education", teacher: "Tahmina Akter (Physical Education)", room: "Play Ground" },
    { id: 20, day: "Wednesday", period: "1", time: "8:00 AM - 8:45 AM", subject: "Mathematics", teacher: "Abdul Karim (Mathematics)", room: "Room 101" },
    { id: 21, day: "Wednesday", period: "2", time: "8:50 AM - 9:35 AM", subject: "Science", teacher: "Nusrat Jahan (Science)", room: "Science Lab" },
    { id: 22, day: "Wednesday", period: "3", time: "9:40 AM - 10:25 AM", subject: "English", teacher: "Mohammad Ali (English)", room: "Room 101" },
    { id: 23, day: "Wednesday", period: "4", time: "10:40 AM - 11:25 AM", subject: "Agriculture", teacher: "Arif Islam (Agriculture)", room: "Room 101" },
    { id: 24, day: "Thursday", period: "1", time: "8:00 AM - 8:45 AM", subject: "Bangla", teacher: "Fatima Begum (Bangla)", room: "Room 101" },
    { id: 25, day: "Thursday", period: "2", time: "8:50 AM - 9:35 AM", subject: "Mathematics", teacher: "Abdul Karim (Mathematics)", room: "Room 101" },
    { id: 26, day: "Thursday", period: "3", time: "9:40 AM - 10:25 AM", subject: "Religion", teacher: "Ayesha Khatun (Religion)", room: "Room 101" },
    { id: 27, day: "Thursday", period: "4", time: "10:40 AM - 11:25 AM", subject: "ICT", teacher: "Jahid Hasan (ICT)", room: "Computer Lab" },
  ]);
  const [nextPeriodId, setNextPeriodId] = useState(28);
  
  // Class routine form setup
  const routineForm = useForm<z.infer<typeof routineSchema>>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      className: "10",
      section: "A",
      academicYear: "2023",
      semester: "1st Semester",
      institution: "Dhaka Public School and College",
      totalStudents: "45",
      totalPeriods: periods.length.toString(),
      effectiveFrom: "2023-01-15",
      classTeacher: "Abdul Karim (Mathematics)",
      periods: periods.map(period => ({
        day: period.day,
        period: period.period,
        time: period.time,
        subject: period.subject,
        teacher: period.teacher,
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
      colorCoded: true,
      tableView: true
    }
  });

  // Handle form submission for generating class routine
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
        title: "ক্লাস রুটিন তৈরি হয়েছে",
        description: "আপনার ক্লাস রুটিন সফলভাবে তৈরি হয়েছে",
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
      teacher: "Abdul Karim (Mathematics)", 
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
      teacher: newPeriod.teacher,
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
    const routineElement = document.getElementById('class-routine-preview');
    if (!routineElement) return;

    const canvas = await html2canvas(routineElement, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Determine PDF dimensions based on A4
    const pdf = new jsPDF({
      orientation: 'landscape', // Class routines typically work better in landscape
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

    pdf.save(`class-routine-${routineForm.getValues('className')}-${routineForm.getValues('section')}-${routineForm.getValues('academicYear')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার ক্লাস রুটিন পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    routineForm.reset();
    templateForm.reset();
  };
  
  // Import classes handler
  const handleImportClasses = () => {
    setIsBatchLoading(true);
    setBatchError(null);
    
    // In a real application, this would be an API call to fetch classes
    // Simulating API call with timeout
    setTimeout(() => {
      try {
        // Simulating successful response
        setSelectedClasses(["1", "2", "3", "4", "5"]);
        setIsBatchLoading(false);
        
        toast({
          title: "আমদানি সফল",
          description: "ডাটাবেস থেকে ৫ টি ক্লাস আমদানি করা হয়েছে",
        });
      } catch (error) {
        setIsBatchLoading(false);
        setBatchError("ক্লাস ডাটা আমদানি করতে সমস্যা হয়েছে");
        
        toast({
          title: "আমদানি ব্যর্থ",
          description: "ডাটাবেস থেকে ক্লাস আমদানি করতে সমস্যা হয়েছে",
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
  
  // Create a table format routine for easier viewing
  const createTableRoutine = (periodsList: typeof periods) => {
    // Get unique period numbers
    const periodNumbers = [...new Set(periodsList.map(p => p.period))].sort((a, b) => parseInt(a) - parseInt(b));
    
    // Create a mapping of day -> period -> class data
    const tableData: Record<string, Record<string, typeof periods[0]>> = {};
    
    daysOfWeek.forEach(day => {
      tableData[day] = {};
      const dayPeriods = periodsList.filter(p => p.day === day);
      dayPeriods.forEach(period => {
        tableData[day][period.period] = period;
      });
    });
    
    return { periodNumbers, tableData };
  };

  return (
    <AppShell>
      <MobilePageLayout
        title="ক্লাস রুটিন"
        description="শ্রেণীর রুটিন তৈরি করুন"
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
                    <span className="material-icons mr-2">school</span>
                    ক্লাসের বিবরণ
                  </CardTitle>
                  <CardDescription className="text-base">
                    রুটিনের জন্য ক্লাসের প্রয়োজনীয় তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...routineForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="প্রাথমিক তথ্য" 
                        icon="school"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={routineForm.control}
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
                              control={routineForm.control}
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
                              name="totalStudents"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">মোট শিক্ষার্থী</FormLabel>
                                  <FormControl>
                                    <MobileInput 
                                      leftIcon="people" 
                                      type="number"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
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
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={routineForm.control}
                              name="classTeacher"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">শ্রেণী শিক্ষক</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="mobile-select">
                                        <SelectValue placeholder="শিক্ষক নির্বাচন করুন" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {teachers.map(teacher => (
                                        <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                                
                                <div>
                                  <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                    {index === 0 && "শিক্ষক"}
                                  </FormLabel>
                                  <Select 
                                    value={period.teacher}
                                    onValueChange={(value) => updatePeriod(index, "teacher", value)}
                                  >
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="শিক্ষক নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {teachers.map(teacher => (
                                        <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                    {index === 0 && "রুম নম্বর"}
                                  </FormLabel>
                                  <Select 
                                    value={period.room}
                                    onValueChange={(value) => updatePeriod(index, "room", value)}
                                  >
                                    <SelectTrigger className="mobile-select">
                                      <SelectValue placeholder="রুম নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {rooms.map(room => (
                                        <SelectItem key={room} value={room}>{room}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                        
                        <FormField
                          control={templateForm.control}
                          name="tableView"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">টেবিল ভিউ</FormLabel>
                                <FormDescription>
                                  সাময়িক ভিত্তিক টেবিল ফরম্যাটে দেখাবে
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
              <div className="bg-white rounded-lg shadow-md p-6 mx-auto w-full relative" id="class-routine-preview">
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
                    <h2 className="text-lg font-semibold text-primary">ক্লাস রুটিন</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div>
                        <p className="text-gray-500">শ্রেণী:</p>
                        <p className="font-medium">Class {routineForm.getValues("className")}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">শাখা:</p>
                        <p className="font-medium">Section {routineForm.getValues("section")}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">শিক্ষাবর্ষ:</p>
                        <p className="font-medium">{routineForm.getValues("academicYear")}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">সেমিস্টার:</p>
                        <p className="font-medium">{routineForm.getValues("semester")}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">শ্রেণী শিক্ষক:</p>
                        <p className="font-medium">{routineForm.getValues("classTeacher")}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">মোট শিক্ষার্থী:</p>
                        <p className="font-medium">{routineForm.getValues("totalStudents")}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <p className="text-gray-500">কার্যকর তারিখ:</p>
                        <p className="font-medium">{new Date(routineForm.getValues("effectiveFrom")).toLocaleDateString('bn-BD')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Table View */}
                  {templateForm.getValues("tableView") ? (
                    <div className="overflow-x-auto -mx-4 px-4">
                      <div className="min-w-[600px]">
                        {(() => {
                          const { periodNumbers, tableData } = createTableRoutine(periods);
                          return (
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="p-2 text-left">দিন / পিরিয়ড</th>
                                    {periodNumbers.map(period => (
                                      <th key={period} className="p-2 text-center whitespace-nowrap">
                                        <div>{period} নং পিরিয়ড</div>
                                        <div className="text-xs text-gray-500">
                                          {periodTimes[parseInt(period) - 1]}
                                        </div>
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {daysOfWeek.map(day => {
                                    if (!templateForm.getValues("showWeekends") && day === "Friday") {
                                      return null;
                                    }
                                    
                                    const dayColor = day === "Friday" ? "bg-red-50" : "";
                                    
                                    return (
                                      <tr key={day} className={dayColor}>
                                        <td className="p-2 font-medium">
                                          {day}
                                        </td>
                                        {periodNumbers.map(periodNumber => {
                                          const periodData = tableData[day][periodNumber];
                                          
                                          // Generate a color based on subject if color coding is enabled
                                          const subjectIndex = periodData ? subjects.indexOf(periodData.subject) : -1;
                                          const colors = [
                                            "bg-blue-50", "bg-green-50", "bg-yellow-50", 
                                            "bg-purple-50", "bg-pink-50", "bg-indigo-50", 
                                            "bg-orange-50", "bg-teal-50", "bg-red-50", "bg-gray-50"
                                          ];
                                          const colorClass = (templateForm.getValues("colorCoded") && subjectIndex !== -1)
                                            ? colors[subjectIndex % colors.length] 
                                            : "";
                                          
                                          return (
                                            <td key={periodNumber} className={`p-2 text-center border-l ${colorClass}`}>
                                              {periodData ? (
                                                <div className="text-xs">
                                                  <div className="font-medium">{periodData.subject}</div>
                                                  <div>{periodData.teacher.split('(')[0].trim()}</div>
                                                  <div className="text-gray-500">{periodData.room}</div>
                                                </div>
                                              ) : (
                                                <div className="text-xs text-gray-400">-</div>
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
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
                                      <div className="grid grid-cols-[auto,1fr] gap-4">
                                        <div className="text-center">
                                          <p className="font-medium">পিরিয়ড {period.period}</p>
                                          <p className="text-xs text-gray-500">{period.time}</p>
                                        </div>
                                        <div>
                                          <p className="font-medium">{period.subject}</p>
                                          <p className="text-sm">{period.teacher}</p>
                                          {period.room && <p className="text-xs text-gray-500">{period.room}</p>}
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
                  )}
                  
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
                      <p className="text-sm">{routineForm.getValues("classTeacher")}</p>
                      <p className="text-xs text-gray-500">শ্রেণী শিক্ষক</p>
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
                একসাথে ক্লাস রুটিন তৈরি করুন
              </CardTitle>
              <CardDescription>
                একই সাথে একাধিক ক্লাসের রুটিন তৈরি করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <h3 className="text-base font-medium">ক্লাস নির্বাচন করুন</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs h-8 px-2 gap-1"
                      onClick={handleImportClasses}
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
                  
                  {selectedClasses.length === 0 ? (
                    <div className="border rounded-lg p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <span className="material-icons text-4xl text-muted-foreground">school</span>
                      </div>
                      <p className="text-muted-foreground">
                        কোন ক্লাস নির্বাচন করা হয়নি। ডাটাবেস থেকে আমদানি করুন বা নতুন তৈরি করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg divide-y">
                      {selectedClasses.map((id) => (
                        <div key={id} className="flex items-center p-3 justify-between">
                          <div className="flex items-center gap-3">
                            <span className="material-icons text-muted-foreground">school</span>
                            <div>
                              <p className="font-medium">ক্লাস #{id}</p>
                              <p className="text-sm text-muted-foreground">শিক্ষার্থী: {Math.floor(Math.random() * 20) + 30}</p>
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
                          সব ক্লাসের জন্য একই ফরম্যাট ব্যবহার করুন
                        </FormDescription>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">একটি ফাইলে সংরক্ষণ করুন</FormLabel>
                        <FormDescription>
                          সবগুলো ক্লাস রুটিন একটি পিডিএফ ফাইলে রাখুন
                        </FormDescription>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                {batchError && (
                  <div className="rounded-lg bg-destructive/15 p-3 text-destructive">
                    <div className="flex items-center">
                      <span className="material-icons mr-2">error</span>
                      <p>{batchError}</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => {
                      setIsBatchLoading(true);
                      setBatchError(null);
                      
                      // Simulate batch processing
                      setTimeout(() => {
                        if (selectedClasses.length === 0) {
                          setBatchError("দয়া করে কমপক্ষে একটি ক্লাস নির্বাচন করুন");
                          setIsBatchLoading(false);
                          return;
                        }
                        
                        toast({
                          title: "ব্যাচ প্রসেসিং সম্পন্ন",
                          description: `${selectedClasses.length}টি ক্লাসের রুটিন তৈরি করা হয়েছে`,
                        });
                        
                        setIsBatchLoading(false);
                      }, 1500);
                    }}
                    disabled={selectedClasses.length === 0 || isBatchLoading}
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
                আপনার সাম্প্রতিক তৈরি করা ক্লাস রুটিন দেখুন
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
                      আপনি এখনও কোন ক্লাস রুটিন তৈরি করেননি।
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