import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { MobilePageLayout } from '@/components/layout/mobile-page-layout';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
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

// Define schema for subject
const subjectSchema = z.object({
  name: z.string().min(1, { message: "Subject name is required" }),
  code: z.string().optional(),
  fullMarks: z.string().min(1, { message: "Full marks is required" }),
  passingMarks: z.string().min(1, { message: "Passing marks is required" }),
  obtainedMarks: z.string().min(1, { message: "Obtained marks is required" }),
  grade: z.string().optional(),
});

// Define schema for student marksheet information
const marksheetSchema = z.object({
  studentName: z.string().min(2, { message: "Student name is required" }),
  studentNameBn: z.string().optional(),
  fatherName: z.string().min(2, { message: "Father's name is required" }),
  motherName: z.string().min(2, { message: "Mother's name is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  className: z.string().min(1, { message: "Class is required" }),
  section: z.string().optional(),
  rollNumber: z.string().min(1, { message: "Roll number is required" }),
  registrationNumber: z.string().optional(),
  examName: z.string().min(1, { message: "Exam name is required" }),
  examYear: z.string().min(1, { message: "Exam year is required" }),
  institution: z.string().min(1, { message: "Institution name is required" }),
  subjects: z.array(subjectSchema).min(1, { message: "At least one subject is required" }),
  totalMarks: z.string().min(1, { message: "Total marks is required" }),
  obtainedTotalMarks: z.string().min(1, { message: "Obtained total marks is required" }),
  percentage: z.string().min(1, { message: "Percentage is required" }),
  grade: z.string().min(1, { message: "Grade is required" }),
  rank: z.string().optional(),
  issueDate: z.string().min(1, { message: "Issue date is required" }),
  remarks: z.string().optional(),
  studentPhoto: z.string().optional(),
});

// Schema for marksheet template settings
const templateSchema = z.object({
  layout: z.enum(['1', '2', '4', '9']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'detailed', 'simple', 'custom']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeQRCode: z.boolean(),
  includeWatermark: z.boolean(),
  includeStamp: z.boolean(),
  includeGradeChart: z.boolean(),
});

export default function MarksheetsPage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [subjects, setSubjects] = useState([
    { id: 1, name: "Bangla", code: "101", fullMarks: "100", passingMarks: "33", obtainedMarks: "78", grade: "A" },
    { id: 2, name: "English", code: "102", fullMarks: "100", passingMarks: "33", obtainedMarks: "82", grade: "A+" },
    { id: 3, name: "Mathematics", code: "103", fullMarks: "100", passingMarks: "33", obtainedMarks: "90", grade: "A+" },
    { id: 4, name: "Science", code: "104", fullMarks: "100", passingMarks: "33", obtainedMarks: "76", grade: "A" },
    { id: 5, name: "Social Science", code: "105", fullMarks: "100", passingMarks: "33", obtainedMarks: "85", grade: "A+" },
  ]);
  const [nextSubjectId, setNextSubjectId] = useState(6);
  
  // Calculate total marks and percentage
  const calculateResults = (subjectsList: any[]) => {
    const totalFullMarks = subjectsList.reduce((sum, subject) => sum + (parseFloat(subject.fullMarks) || 0), 0);
    const totalObtainedMarks = subjectsList.reduce((sum, subject) => sum + (parseFloat(subject.obtainedMarks) || 0), 0);
    const percentage = totalFullMarks > 0 ? (totalObtainedMarks / totalFullMarks * 100).toFixed(2) : "0";
    
    // Calculate grade based on percentage
    let grade = "F";
    if (parseFloat(percentage) >= 80) grade = "A+";
    else if (parseFloat(percentage) >= 70) grade = "A";
    else if (parseFloat(percentage) >= 60) grade = "A-";
    else if (parseFloat(percentage) >= 50) grade = "B";
    else if (parseFloat(percentage) >= 40) grade = "C";
    else if (parseFloat(percentage) >= 33) grade = "D";
    
    return {
      totalFullMarks,
      totalObtainedMarks,
      percentage,
      grade
    };
  };
  
  // Marksheet form setup
  const marksheetForm = useForm<z.infer<typeof marksheetSchema>>({
    resolver: zodResolver(marksheetSchema),
    defaultValues: {
      studentName: "Mohammad Rahman",
      studentNameBn: "মোহাম্মদ রহমান",
      fatherName: "Abdul Karim",
      motherName: "Fatima Begum",
      dateOfBirth: "2005-05-15",
      className: "10",
      section: "A",
      rollNumber: "15",
      registrationNumber: "2023-0042",
      examName: "Annual Examination",
      examYear: "2023",
      institution: "Dhaka Public School and College",
      subjects: subjects.map(subject => ({
        name: subject.name,
        code: subject.code,
        fullMarks: subject.fullMarks,
        passingMarks: subject.passingMarks,
        obtainedMarks: subject.obtainedMarks,
        grade: subject.grade
      })),
      totalMarks: "500",
      obtainedTotalMarks: "411",
      percentage: "82.20",
      grade: "A+",
      rank: "5",
      issueDate: "2023-12-20",
      remarks: "Excellent performance. Keep it up!",
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
      includeGradeChart: true
    }
  });

  // Handle batch processing for multiple students
  const handleBatchProcess = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "কোন শিক্ষার্থী নির্বাচিত নেই",
        description: "ব্যাচ প্রসেস শুরু করার আগে অন্তত একজন শিক্ষার্থী নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }
    
    setIsBatchLoading(true);
    setBatchError(null);
    
    // In a real application, this would be an API call to process batch
    // Simulating API call with timeout
    setTimeout(() => {
      try {
        // Simulating successful response
        setIsBatchLoading(false);
        
        toast({
          title: "ব্যাচ প্রসেস সম্পন্ন",
          description: `${selectedStudents.length} জন শিক্ষার্থীর মার্কশীট সফলভাবে তৈরি করা হয়েছে`,
        });
      } catch (error) {
        setIsBatchLoading(false);
        setBatchError("ব্যাচ প্রসেস করতে সমস্যা হয়েছে");
        
        toast({
          title: "ব্যাচ প্রসেস ব্যর্থ",
          description: "শিক্ষার্থীদের মার্কশীট তৈরি করতে সমস্যা হয়েছে",
          variant: "destructive",
        });
      }
    }, 2000);
  };
  
  // Handle form submission for generating marksheet
  const onGenerateSubmit = (marksheetData: z.infer<typeof marksheetSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Marksheet Data:", marksheetData);
    console.log("Template Data:", templateData);
    
    // Calculate and update the results
    const results = calculateResults(marksheetData.subjects);
    marksheetForm.setValue("totalMarks", results.totalFullMarks.toString());
    marksheetForm.setValue("obtainedTotalMarks", results.totalObtainedMarks.toString());
    marksheetForm.setValue("percentage", results.percentage);
    marksheetForm.setValue("grade", results.grade);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "মার্কশীট তৈরি হয়েছে",
        description: "আপনার মার্কশীট সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Add a new subject
  const addSubject = () => {
    const newSubject = { 
      id: nextSubjectId, 
      name: "", 
      code: "", 
      fullMarks: "100", 
      passingMarks: "33", 
      obtainedMarks: "", 
      grade: "" 
    };
    setSubjects([...subjects, newSubject]);
    setNextSubjectId(nextSubjectId + 1);
    
    const currentSubjects = marksheetForm.getValues("subjects") || [];
    marksheetForm.setValue("subjects", [...currentSubjects, { 
      name: "", 
      code: "", 
      fullMarks: "100", 
      passingMarks: "33", 
      obtainedMarks: "", 
      grade: "" 
    }]);
  };
  
  // Remove a subject
  const removeSubject = (index: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects.splice(index, 1);
    setSubjects(updatedSubjects);
    
    const currentSubjects = marksheetForm.getValues("subjects") || [];
    const updatedFormSubjects = [...currentSubjects];
    updatedFormSubjects.splice(index, 1);
    marksheetForm.setValue("subjects", updatedFormSubjects);
    
    // Update the results after removing a subject
    const results = calculateResults(updatedFormSubjects);
    marksheetForm.setValue("totalMarks", results.totalFullMarks.toString());
    marksheetForm.setValue("obtainedTotalMarks", results.totalObtainedMarks.toString());
    marksheetForm.setValue("percentage", results.percentage);
    marksheetForm.setValue("grade", results.grade);
  };
  
  // Update subject in the form
  const updateSubject = (index: number, field: keyof (typeof subjects)[0], value: string) => {
    const currentSubjects = [...subjects];
    currentSubjects[index] = { ...currentSubjects[index], [field]: value };
    setSubjects(currentSubjects);
    
    const formSubjects = marksheetForm.getValues("subjects") || [];
    const updatedFormSubjects = [...formSubjects];
    updatedFormSubjects[index] = { ...updatedFormSubjects[index], [field]: value };
    marksheetForm.setValue("subjects", updatedFormSubjects);
    
    // If marking is changed, update the grade for the subject
    if (field === "obtainedMarks" && currentSubjects[index].fullMarks) {
      const percentage = (parseFloat(value) / parseFloat(currentSubjects[index].fullMarks)) * 100;
      let grade = "F";
      if (percentage >= 80) grade = "A+";
      else if (percentage >= 70) grade = "A";
      else if (percentage >= 60) grade = "A-";
      else if (percentage >= 50) grade = "B";
      else if (percentage >= 40) grade = "C";
      else if (percentage >= 33) grade = "D";
      
      currentSubjects[index].grade = grade;
      updatedFormSubjects[index].grade = grade;
      setSubjects(currentSubjects);
      marksheetForm.setValue("subjects", updatedFormSubjects);
    }
    
    // Update the results after changing a subject
    const results = calculateResults(updatedFormSubjects);
    marksheetForm.setValue("totalMarks", results.totalFullMarks.toString());
    marksheetForm.setValue("obtainedTotalMarks", results.totalObtainedMarks.toString());
    marksheetForm.setValue("percentage", results.percentage);
    marksheetForm.setValue("grade", results.grade);
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const marksheetElement = document.getElementById('marksheet-preview');
    if (!marksheetElement) return;

    const canvas = await html2canvas(marksheetElement, {
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

    pdf.save(`marksheet-${marksheetForm.getValues('studentName').replace(/\s+/g, '-')}-${marksheetForm.getValues('examYear')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার মার্কশীট পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    marksheetForm.reset();
    templateForm.reset();
  };
  
  // Import students handler
  const handleImportStudents = () => {
    setIsBatchLoading(true);
    setBatchError(null);
    
    // In a real application, this would be an API call to fetch students
    // Simulating API call with timeout
    setTimeout(() => {
      try {
        // Simulating successful response
        setSelectedStudents(["1", "2", "3", "4", "5"]);
        setIsBatchLoading(false);
        
        toast({
          title: "আমদানি সফল",
          description: "ডাটাবেস থেকে ৫ জন শিক্ষার্থী আমদানি করা হয়েছে",
        });
      } catch (error) {
        setIsBatchLoading(false);
        setBatchError("শিক্ষার্থী ডাটা আমদানি করতে সমস্যা হয়েছে");
        
        toast({
          title: "আমদানি ব্যর্থ",
          description: "ডাটাবেস থেকে শিক্ষার্থী আমদানি করতে সমস্যা হয়েছে",
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

  // Grade chart for reference
  const gradeChart = [
    { grade: "A+", percentage: "80-100", points: "5.00" },
    { grade: "A", percentage: "70-79", points: "4.00" },
    { grade: "A-", percentage: "60-69", points: "3.50" },
    { grade: "B", percentage: "50-59", points: "3.00" },
    { grade: "C", percentage: "40-49", points: "2.00" },
    { grade: "D", percentage: "33-39", points: "1.00" },
    { grade: "F", percentage: "0-32", points: "0.00" },
  ];

  return (
    <AppShell>
      <MobilePageLayout
        title="মার্কশীট"
        description="শিক্ষার্থীদের মার্কশীট তৈরি করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(marksheetForm.getValues(), templateForm.getValues()),
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
                    মার্কশীটের জন্য শিক্ষার্থীর প্রয়োজনীয় তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...marksheetForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="প্রাথমিক তথ্য" 
                        icon="person"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={marksheetForm.control}
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
                            control={marksheetForm.control}
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
                            control={marksheetForm.control}
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
                            control={marksheetForm.control}
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
                            control={marksheetForm.control}
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
                              control={marksheetForm.control}
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
                              control={marksheetForm.control}
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
                              control={marksheetForm.control}
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
                              control={marksheetForm.control}
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
                        </div>
                      </FormSection>
                      
                      {/* Examination Information */}
                      <FormSection 
                        title="পরীক্ষার তথ্য" 
                        icon="assignment"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={marksheetForm.control}
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
                              control={marksheetForm.control}
                              name="examName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">পরীক্ষার নাম</FormLabel>
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
                                      <SelectItem value="Annual Examination">বার্ষিক পরীক্ষা</SelectItem>
                                      <SelectItem value="Half-Yearly Examination">অর্ধ-বার্ষিক পরীক্ষা</SelectItem>
                                      <SelectItem value="Model Test">মডেল টেস্ট</SelectItem>
                                      <SelectItem value="Final Examination">চূড়ান্ত পরীক্ষা</SelectItem>
                                      <SelectItem value="JSC">জেএসসি</SelectItem>
                                      <SelectItem value="SSC">এসএসসি</SelectItem>
                                      <SelectItem value="HSC">এইচএসসি</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={marksheetForm.control}
                              name="examYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">পরীক্ষার বছর</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="event" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={marksheetForm.control}
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
                        </div>
                      </FormSection>
                      
                      {/* Subject Marks */}
                      <FormSection 
                        title="বিষয়ভিত্তিক নম্বর" 
                        icon="menu_book"
                        defaultOpen={true}
                      >
                        <div className="space-y-4">
                          {subjects.map((subject, index) => (
                            <div key={subject.id} className="border rounded-lg p-3">
                              <div className="grid grid-cols-1 gap-3">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium text-base">বিষয় #{index + 1}</h4>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 text-destructive"
                                    onClick={() => removeSubject(index)}
                                    disabled={subjects.length <= 1}
                                  >
                                    <span className="material-icons">delete</span>
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                      {index === 0 && "বিষয়ের নাম"}
                                    </FormLabel>
                                    <MobileInput 
                                      leftIcon="book" 
                                      placeholder="বিষয়ের নাম" 
                                      value={subject.name}
                                      onChange={(e) => updateSubject(index, "name", e.target.value)}
                                    />
                                  </div>
                                  
                                  <div>
                                    <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                      {index === 0 && "বিষয় কোড"}
                                    </FormLabel>
                                    <MobileInput 
                                      leftIcon="code" 
                                      placeholder="বিষয় কোড" 
                                      value={subject.code}
                                      onChange={(e) => updateSubject(index, "code", e.target.value)}
                                    />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                      {index === 0 && "পূর্ণ নম্বর"}
                                    </FormLabel>
                                    <MobileInput 
                                      leftIcon="grade" 
                                      placeholder="পূর্ণ নম্বর" 
                                      type="number"
                                      value={subject.fullMarks}
                                      onChange={(e) => updateSubject(index, "fullMarks", e.target.value)}
                                    />
                                  </div>
                                  
                                  <div>
                                    <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                      {index === 0 && "পাশ নম্বর"}
                                    </FormLabel>
                                    <MobileInput 
                                      leftIcon="done_all" 
                                      placeholder="পাশ নম্বর" 
                                      type="number"
                                      value={subject.passingMarks}
                                      onChange={(e) => updateSubject(index, "passingMarks", e.target.value)}
                                    />
                                  </div>
                                  
                                  <div>
                                    <FormLabel className={index === 0 ? "text-base" : "sr-only"}>
                                      {index === 0 && "প্রাপ্ত নম্বর"}
                                    </FormLabel>
                                    <MobileInput 
                                      leftIcon="emoji_events" 
                                      placeholder="প্রাপ্ত নম্বর" 
                                      type="number"
                                      value={subject.obtainedMarks}
                                      onChange={(e) => updateSubject(index, "obtainedMarks", e.target.value)}
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between bg-muted/30 p-2 rounded">
                                  <span className="text-sm">গ্রেড:</span>
                                  <span className="font-medium">{subject.grade || "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full gap-2"
                            onClick={addSubject}
                          >
                            <span className="material-icons">add</span>
                            নতুন বিষয় যোগ করুন
                          </Button>
                          
                          <div className="bg-muted/30 p-3 rounded-lg mt-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-right font-medium">মোট পূর্ণ নম্বর:</div>
                              <div className="font-bold">
                                {parseFloat(marksheetForm.getValues("totalMarks")).toLocaleString()}
                              </div>
                              
                              <div className="text-right font-medium">মোট প্রাপ্ত নম্বর:</div>
                              <div className="font-bold">
                                {parseFloat(marksheetForm.getValues("obtainedTotalMarks")).toLocaleString()}
                              </div>
                              
                              <div className="text-right font-medium">শতকরা:</div>
                              <div className="font-bold">
                                {marksheetForm.getValues("percentage")}%
                              </div>
                              
                              <div className="text-right font-medium text-primary">চূড়ান্ত গ্রেড:</div>
                              <div className="font-bold text-primary">
                                {marksheetForm.getValues("grade")}
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
                            control={marksheetForm.control}
                            name="rank"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">র‍্যাংক/পজিশন</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="leaderboard" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={marksheetForm.control}
                            name="remarks"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">মন্তব্য</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="শিক্ষার্থীর সম্পর্কে যেকোনো অতিরিক্ত মন্তব্য"
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
                    মার্কশীট সেটিংস
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
                                  মার্কশীটে প্রতিষ্ঠানের লোগো দেখাবে
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
                                  মার্কশীটে অধ্যক্ষের স্বাক্ষর দেখাবে
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
                                  মার্কশীটে ভেরিফিকেশন QR কোড দেখাবে
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
                                  মার্কশীটে প্রতিষ্ঠানের ওয়াটারমার্ক দেখাবে
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
                                  মার্কশীটে প্রতিষ্ঠানের সীলমোহর দেখাবে
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
                          name="includeGradeChart"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">গ্রেড চার্ট</FormLabel>
                                <FormDescription>
                                  মার্কশীটে গ্রেড চার্ট অন্তর্ভুক্ত করবে
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
              <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-2xl relative" id="marksheet-preview">
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
                    {marksheetForm.getValues("institution")}
                  </h1>
                  <p className="text-sm text-gray-500">ঢাকা, বাংলাদেশ</p>
                  
                  <div className="mt-2 py-1 px-4 bg-primary/10 rounded-lg inline-block">
                    <h2 className="text-lg font-semibold text-primary">মার্কশীট</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <p className="text-sm text-gray-500">পরীক্ষার নাম:</p>
                      <p className="font-medium">{marksheetForm.getValues("examName")}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">পরীক্ষার বছর:</p>
                      <p className="font-medium">{marksheetForm.getValues("examYear")}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-b py-3">
                    <div className="grid grid-cols-[3fr,1fr] gap-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">শিক্ষার্থীর নাম:</p>
                          <p className="font-medium">{marksheetForm.getValues("studentName")}</p>
                          <p className="font-medium">{marksheetForm.getValues("studentNameBn")}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">পিতার নাম:</p>
                            <p className="font-medium">{marksheetForm.getValues("fatherName")}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">মাতার নাম:</p>
                            <p className="font-medium">{marksheetForm.getValues("motherName")}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">জন্ম তারিখ:</p>
                          <p className="font-medium">{new Date(marksheetForm.getValues("dateOfBirth")).toLocaleDateString('bn-BD')}</p>
                        </div>
                      </div>
                      
                      {marksheetForm.getValues("studentPhoto") ? (
                        <img 
                          src={marksheetForm.getValues("studentPhoto")} 
                          alt="Student" 
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
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                    <div>
                      <p className="text-gray-500">শ্রেণী:</p>
                      <p className="font-medium">{marksheetForm.getValues("className")}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">শাখা:</p>
                      <p className="font-medium">{marksheetForm.getValues("section")}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">রোল:</p>
                      <p className="font-medium">{marksheetForm.getValues("rollNumber")}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-hidden rounded border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-2 text-left">বিষয়</th>
                          <th className="py-2 px-2 text-center">পূর্ণ নম্বর</th>
                          <th className="py-2 px-2 text-center">পাশ নম্বর</th>
                          <th className="py-2 px-2 text-center">প্রাপ্ত নম্বর</th>
                          <th className="py-2 px-2 text-center">গ্রেড</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {marksheetForm.getValues("subjects").map((subject, index) => (
                          <tr key={index} className={parseFloat(subject.obtainedMarks) < parseFloat(subject.passingMarks) ? "bg-red-50" : ""}>
                            <td className="py-2 px-2">
                              {subject.name}
                              {subject.code && <span className="text-xs text-gray-500 ml-1">({subject.code})</span>}
                            </td>
                            <td className="py-2 px-2 text-center">{subject.fullMarks}</td>
                            <td className="py-2 px-2 text-center">{subject.passingMarks}</td>
                            <td className="py-2 px-2 text-center">{subject.obtainedMarks}</td>
                            <td className="py-2 px-2 text-center font-medium">{subject.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                        <tr>
                          <td className="py-2 px-2">মোট</td>
                          <td className="py-2 px-2 text-center">{marksheetForm.getValues("totalMarks")}</td>
                          <td className="py-2 px-2 text-center">-</td>
                          <td className="py-2 px-2 text-center">{marksheetForm.getValues("obtainedTotalMarks")}</td>
                          <td className="py-2 px-2 text-center">{marksheetForm.getValues("grade")}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="mb-1 font-medium">শতকরা:</p>
                      <p className="text-lg font-bold text-primary">{marksheetForm.getValues("percentage")}%</p>
                    </div>
                    
                    <div>
                      <p className="mb-1 font-medium">চূড়ান্ত গ্রেড:</p>
                      <p className="text-lg font-bold text-primary">{marksheetForm.getValues("grade")}</p>
                    </div>
                    
                    {marksheetForm.getValues("rank") && (
                      <div>
                        <p className="mb-1 font-medium">র‍্যাংক/পজিশন:</p>
                        <p className="text-lg font-bold">{marksheetForm.getValues("rank")}</p>
                      </div>
                    )}
                  </div>
                  
                  {marksheetForm.getValues("remarks") && (
                    <div className="border-t pt-2">
                      <p className="text-sm text-gray-500">মন্তব্য:</p>
                      <p className="font-medium">{marksheetForm.getValues("remarks")}</p>
                    </div>
                  )}
                  
                  {templateForm.getValues("includeGradeChart") && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-sm font-medium mb-1">গ্রেডিং সিস্টেম:</p>
                      <div className="overflow-hidden rounded border border-gray-200 text-xs">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="py-1 px-2 text-center">গ্রেড</th>
                              <th className="py-1 px-2 text-center">শতকরা (%)</th>
                              <th className="py-1 px-2 text-center">পয়েন্ট</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {gradeChart.map((grade, i) => (
                              <tr key={i}>
                                <td className="py-1 px-2 text-center">{grade.grade}</td>
                                <td className="py-1 px-2 text-center">{grade.percentage}</td>
                                <td className="py-1 px-2 text-center">{grade.points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="min-h-12">
                      {templateForm.getValues("includeStamp") && (
                        <div className="flex justify-center items-center min-h-16">
                          <div className="h-14 w-14 rounded-full border-2 border-primary/50 flex items-center justify-center opacity-50">
                            <span className="material-icons text-primary text-xs">verified</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <p className="text-sm">পরীক্ষা নিয়ন্ত্রক</p>
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
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-center text-xs text-gray-500">
                  <p>প্রদানের তারিখ: {new Date(marksheetForm.getValues("issueDate")).toLocaleDateString('bn-BD')}</p>
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
                একসাথে মার্কশীট তৈরি করুন
              </CardTitle>
              <CardDescription>
                একই সাথে একাধিক শিক্ষার্থীর মার্কশীট তৈরি করুন
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
                      disabled={isBatchLoading}
                    >
                      {isBatchLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          লোড হচ্ছে...
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-sm">download</span>
                          আমদানি করুন
                        </>
                      )}
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
                  <h3 className="text-base font-medium mb-3">পরীক্ষা নির্বাচন করুন</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">পরীক্ষার নাম</label>
                      <Select defaultValue="Annual Examination">
                        <SelectTrigger className="mobile-select">
                          <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Annual Examination">বার্ষিক পরীক্ষা</SelectItem>
                          <SelectItem value="Half-Yearly Examination">অর্ধ-বার্ষিক পরীক্ষা</SelectItem>
                          <SelectItem value="Model Test">মডেল টেস্ট</SelectItem>
                          <SelectItem value="Final Examination">চূড়ান্ত পরীক্ষা</SelectItem>
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
                          সবগুলো মার্কশীট একটি পিডিএফ ফাইলে রাখুন
                        </FormDescription>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  {batchError && (
                    <div className="mb-3 px-3 py-2 text-sm rounded-md bg-destructive/10 text-destructive">
                      <span className="material-icons text-sm mr-1 align-text-top">error</span>
                      {batchError}
                    </div>
                  )}
                  <Button 
                    className="w-full gap-2" 
                    onClick={handleBatchProcess}
                    disabled={isBatchLoading || selectedStudents.length === 0}
                  >
                    {isBatchLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
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
                        স্ট্যান্ডার্ড মার্কশীট
                      </label>
                      <p className="text-sm text-muted-foreground">
                        সাধারণ মার্কশীট টেমপ্লেট
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
                        বিস্তারিত মার্কশীট
                      </label>
                      <p className="text-sm text-muted-foreground">
                        অতিরিক্ত তথ্য সহ বিস্তারিত মার্কশীট
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
                        সাধারণ মার্কশীট
                      </label>
                      <p className="text-sm text-muted-foreground">
                        ন্যূনতম তথ্য সহ সহজ মার্কশীট
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
                সাম্প্রতিক তৈরি করা মার্কশীট
              </CardTitle>
              <CardDescription>
                আপনার সাম্প্রতিক তৈরি করা মার্কশীট দেখুন
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
                      আপনি এখনও কোন মার্কশীট তৈরি করেননি।
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