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

// Define schema for student result
const studentResultSchema = z.object({
  roll: z.string().min(1, { message: "Roll number is required" }),
  name: z.string().min(2, { message: "Student name is required" }),
  marks: z.string().min(1, { message: "Marks are required" }),
  grade: z.string().optional(),
  position: z.string().optional(),
});

// Define schema for result sheet information
const resultSheetSchema = z.object({
  className: z.string().min(1, { message: "Class is required" }),
  section: z.string().optional(),
  examName: z.string().min(1, { message: "Exam name is required" }),
  examYear: z.string().min(1, { message: "Exam year is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  subjectCode: z.string().optional(),
  teacherName: z.string().min(1, { message: "Teacher name is required" }),
  department: z.string().optional(),
  totalStudents: z.string().min(1, { message: "Total students is required" }),
  passStudents: z.string().min(1, { message: "Number of passing students is required" }),
  failStudents: z.string().min(1, { message: "Number of failing students is required" }),
  passPercentage: z.string().min(1, { message: "Pass percentage is required" }),
  highestMarks: z.string().min(1, { message: "Highest marks is required" }),
  lowestMarks: z.string().min(1, { message: "Lowest marks is required" }),
  averageMarks: z.string().min(1, { message: "Average marks is required" }),
  fullMarks: z.string().min(1, { message: "Full marks is required" }),
  passingMarks: z.string().min(1, { message: "Passing marks is required" }),
  students: z.array(studentResultSchema).min(1, { message: "At least one student is required" }),
  publicationDate: z.string().min(1, { message: "Publication date is required" }),
  remarks: z.string().optional(),
});

// Schema for template settings
const templateSchema = z.object({
  layout: z.enum(['1', '2', '4', '9']),
  language: z.enum(['en', 'bn', 'both']),
  template: z.enum(['standard', 'detailed', 'simple', 'custom']),
  includeLogo: z.boolean(),
  includeSignature: z.boolean(),
  includeQRCode: z.boolean(),
  includeWatermark: z.boolean(),
  includeStatistics: z.boolean(),
  includeGradeChart: z.boolean(),
});

export default function ResultSheetsPage() {
  const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [students, setStudents] = useState([
    { id: 1, roll: "01", name: "Mohammad Rahman", marks: "85", grade: "A+", position: "1" },
    { id: 2, roll: "02", name: "Abdullah Khan", marks: "78", grade: "A", position: "3" },
    { id: 3, roll: "03", name: "Fatima Begum", marks: "82", grade: "A+", position: "2" },
    { id: 4, roll: "04", name: "Nusrat Jahan", marks: "65", grade: "A-", position: "5" },
    { id: 5, roll: "05", name: "Kamal Hossain", marks: "72", grade: "A", position: "4" },
    { id: 6, roll: "06", name: "Rabeya Khatun", marks: "58", grade: "B", position: "7" },
    { id: 7, roll: "07", name: "Arif Islam", marks: "45", grade: "C", position: "8" },
    { id: 8, roll: "08", name: "Sharmin Akter", marks: "62", grade: "B", position: "6" },
    { id: 9, roll: "09", name: "Rahim Miah", marks: "30", grade: "F", position: "10" },
    { id: 10, roll: "10", name: "Nasrin Sultana", marks: "40", grade: "D", position: "9" },
  ]);
  const [nextStudentId, setNextStudentId] = useState(11);
  
  // Calculate statistics
  const calculateStatistics = (studentsList: { roll: string, name: string, marks: string, grade?: string, position?: string }[]) => {
    const fullMarks = 100;
    const passingMarks = 33;
    
    const allMarks = studentsList.map(student => parseFloat(student.marks) || 0);
    const passCount = allMarks.filter(mark => mark >= passingMarks).length;
    const failCount = studentsList.length - passCount;
    const passPercentage = (passCount / studentsList.length * 100).toFixed(2);
    const highestMark = Math.max(...allMarks);
    const lowestMark = Math.min(...allMarks);
    const averageMark = (allMarks.reduce((sum, mark) => sum + mark, 0) / studentsList.length).toFixed(2);
    
    return {
      totalStudents: studentsList.length.toString(),
      passStudents: passCount.toString(),
      failStudents: failCount.toString(),
      passPercentage,
      highestMarks: highestMark.toString(),
      lowestMarks: lowestMark.toString(),
      averageMarks: averageMark,
      fullMarks: fullMarks.toString(),
      passingMarks: passingMarks.toString(),
    };
  };
  
  // Calculate grade for a student
  const calculateGrade = (marks: string) => {
    const mark = parseFloat(marks) || 0;
    if (mark >= 80) return "A+";
    else if (mark >= 70) return "A";
    else if (mark >= 60) return "A-";
    else if (mark >= 50) return "B";
    else if (mark >= 40) return "C";
    else if (mark >= 33) return "D";
    else return "F";
  };
  
  // Sort students by marks (descending)
  const sortStudentsByMarks = (studentsList: typeof students) => {
    return [...studentsList].sort((a, b) => (parseFloat(b.marks) || 0) - (parseFloat(a.marks) || 0));
  };
  
  // Update student positions based on marks
  const updateStudentPositions = (studentsList: typeof students) => {
    const sortedStudents = sortStudentsByMarks(studentsList);
    let currentPosition = 1;
    let currentMarks = parseFloat(sortedStudents[0]?.marks || "0");
    
    const studentsWithPositions = sortedStudents.map((student, index) => {
      const studentMarks = parseFloat(student.marks || "0");
      
      // If current student's marks are different from previous, update the position
      if (studentMarks < currentMarks) {
        currentPosition = index + 1;
        currentMarks = studentMarks;
      }
      
      return {
        ...student,
        position: currentPosition.toString()
      };
    });
    
    // Sort back by roll number
    return studentsWithPositions.sort((a, b) => parseInt(a.roll) - parseInt(b.roll));
  };
  
  // Result sheet form setup
  const resultSheetForm = useForm<z.infer<typeof resultSheetSchema>>({
    resolver: zodResolver(resultSheetSchema),
    defaultValues: {
      className: "10",
      section: "A",
      examName: "Annual Examination",
      examYear: "2023",
      subject: "Mathematics",
      subjectCode: "MATH-101",
      teacherName: "Abdul Karim",
      department: "Mathematics",
      totalStudents: "10",
      passStudents: "9",
      failStudents: "1",
      passPercentage: "90.00",
      highestMarks: "85",
      lowestMarks: "30",
      averageMarks: "61.70",
      fullMarks: "100",
      passingMarks: "33",
      students: students.map(student => ({
        roll: student.roll,
        name: student.name,
        marks: student.marks,
        grade: student.grade,
        position: student.position
      })),
      publicationDate: "2023-12-25",
      remarks: "Overall good performance. Most students performed well in the examination.",
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
      includeStatistics: true,
      includeGradeChart: true
    }
  });

  // Handle form submission for generating result sheet
  const onGenerateSubmit = (resultSheetData: z.infer<typeof resultSheetSchema>, templateData: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    
    // In a real app, we would process this data through an API
    console.log("Result Sheet Data:", resultSheetData);
    console.log("Template Data:", templateData);
    
    // Calculate and update the statistics
    const statistics = calculateStatistics(resultSheetData.students);
    resultSheetForm.setValue("totalStudents", statistics.totalStudents);
    resultSheetForm.setValue("passStudents", statistics.passStudents);
    resultSheetForm.setValue("failStudents", statistics.failStudents);
    resultSheetForm.setValue("passPercentage", statistics.passPercentage);
    resultSheetForm.setValue("highestMarks", statistics.highestMarks);
    resultSheetForm.setValue("lowestMarks", statistics.lowestMarks);
    resultSheetForm.setValue("averageMarks", statistics.averageMarks);
    
    // Update grades and positions
    const studentsWithUpdatedGrades = resultSheetData.students.map(student => ({
      ...student,
      grade: calculateGrade(student.marks)
    }));
    
    const studentsWithPositions = updateStudentPositions(
      studentsWithUpdatedGrades.map((student, index) => ({
        id: index + 1,
        roll: student.roll,
        name: student.name,
        marks: student.marks,
        grade: student.grade,
        position: student.position
      }))
    );
    
    setStudents(studentsWithPositions);
    resultSheetForm.setValue("students", studentsWithPositions.map(student => ({
      roll: student.roll,
      name: student.name,
      marks: student.marks,
      grade: student.grade,
      position: student.position
    })));
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPreviewMode(true);
      toast({
        title: "ফলাফল শীট তৈরি হয়েছে",
        description: "আপনার ফলাফল শীট সফলভাবে তৈরি হয়েছে",
      });
    }, 1500);
  };
  
  // Add a new student
  const addStudent = () => {
    const newStudent = { 
      id: nextStudentId, 
      roll: nextStudentId.toString().padStart(2, '0'), 
      name: "", 
      marks: "", 
      grade: "", 
      position: ""
    };
    setStudents([...students, newStudent]);
    setNextStudentId(nextStudentId + 1);
    
    const currentStudents = resultSheetForm.getValues("students") || [];
    resultSheetForm.setValue("students", [...currentStudents, { 
      roll: newStudent.roll, 
      name: "", 
      marks: "", 
      grade: "", 
      position: ""
    }]);
  };
  
  // Remove a student
  const removeStudent = (index: number) => {
    const updatedStudents = [...students];
    updatedStudents.splice(index, 1);
    setStudents(updatedStudents);
    
    const currentStudents = resultSheetForm.getValues("students") || [];
    const updatedFormStudents = [...currentStudents];
    updatedFormStudents.splice(index, 1);
    resultSheetForm.setValue("students", updatedFormStudents);
    
    // Recalculate statistics
    const statistics = calculateStatistics(updatedFormStudents);
    resultSheetForm.setValue("totalStudents", statistics.totalStudents);
    resultSheetForm.setValue("passStudents", statistics.passStudents);
    resultSheetForm.setValue("failStudents", statistics.failStudents);
    resultSheetForm.setValue("passPercentage", statistics.passPercentage);
    resultSheetForm.setValue("highestMarks", statistics.highestMarks);
    resultSheetForm.setValue("lowestMarks", statistics.lowestMarks);
    resultSheetForm.setValue("averageMarks", statistics.averageMarks);
  };
  
  // Update student in the form
  const updateStudent = (index: number, field: keyof (typeof students)[0], value: string) => {
    const currentStudents = [...students];
    currentStudents[index] = { ...currentStudents[index], [field]: value };
    setStudents(currentStudents);
    
    const formStudents = resultSheetForm.getValues("students") || [];
    const updatedFormStudents = [...formStudents];
    updatedFormStudents[index] = { ...updatedFormStudents[index], [field]: value };
    
    // If marks are changed, update the grade
    if (field === "marks") {
      const grade = calculateGrade(value);
      currentStudents[index].grade = grade;
      updatedFormStudents[index].grade = grade;
      
      // Update positions based on new marks
      const studentsWithPositions = updateStudentPositions(currentStudents);
      setStudents(studentsWithPositions);
      
      resultSheetForm.setValue("students", studentsWithPositions.map(student => ({
        roll: student.roll,
        name: student.name,
        marks: student.marks,
        grade: student.grade,
        position: student.position
      })));
      
      // Recalculate statistics
      const statistics = calculateStatistics(updatedFormStudents);
      resultSheetForm.setValue("totalStudents", statistics.totalStudents);
      resultSheetForm.setValue("passStudents", statistics.passStudents);
      resultSheetForm.setValue("failStudents", statistics.failStudents);
      resultSheetForm.setValue("passPercentage", statistics.passPercentage);
      resultSheetForm.setValue("highestMarks", statistics.highestMarks);
      resultSheetForm.setValue("lowestMarks", statistics.lowestMarks);
      resultSheetForm.setValue("averageMarks", statistics.averageMarks);
    } else {
      resultSheetForm.setValue("students", updatedFormStudents);
    }
  };
  
  // Generate PDF function
  const generatePDF = async () => {
    const resultSheetElement = document.getElementById('result-sheet-preview');
    if (!resultSheetElement) return;

    const canvas = await html2canvas(resultSheetElement, {
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

    pdf.save(`result-sheet-${resultSheetForm.getValues('className')}-${resultSheetForm.getValues('subject')}-${resultSheetForm.getValues('examYear')}.pdf`);
    
    toast({
      title: "পিডিএফ তৈরি হয়েছে",
      description: "আপনার ফলাফল শীট পিডিএফ হিসেবে সেভ করা হয়েছে",
    });
  };
  
  // Reset form and preview
  const resetForm = () => {
    setPreviewMode(false);
    resultSheetForm.reset();
    templateForm.reset();
  };
  
  // Import classes handler
  const handleImportClasses = () => {
    toast({
      title: "আমদানি সফল",
      description: "ডাটাবেস থেকে ৫ টি ক্লাস আমদানি করা হয়েছে",
    });
    
    setSelectedClasses(["1", "2", "3", "4", "5"]);
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
        title="ফলাফল শীট"
        description="বিষয়ভিত্তিক পরীক্ষার ফলাফল শীট তৈরি করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: () => onGenerateSubmit(resultSheetForm.getValues(), templateForm.getValues()),
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
                    পরীক্ষার তথ্য
                  </CardTitle>
                  <CardDescription className="text-base">
                    ফলাফল শীটের জন্য প্রয়োজনীয় তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...resultSheetForm}>
                    <div className="space-y-1">
                      {/* Basic Information Section */}
                      <FormSection 
                        title="প্রাথমিক তথ্য" 
                        icon="info"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={resultSheetForm.control}
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
                              control={resultSheetForm.control}
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
                              control={resultSheetForm.control}
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
                                      <SelectItem value="Class Test">ক্লাস টেস্ট</SelectItem>
                                      <SelectItem value="Weekly Test">সাপ্তাহিক টেস্ট</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={resultSheetForm.control}
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
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={resultSheetForm.control}
                              name="subject"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">বিষয়</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="book" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={resultSheetForm.control}
                              name="subjectCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">বিষয় কোড</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={resultSheetForm.control}
                              name="teacherName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">শিক্ষকের নাম</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="person" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={resultSheetForm.control}
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
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={resultSheetForm.control}
                              name="fullMarks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">পূর্ণ নম্বর</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="grade" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={resultSheetForm.control}
                              name="passingMarks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">পাশ নম্বর</FormLabel>
                                  <FormControl>
                                    <MobileInput leftIcon="done_all" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={resultSheetForm.control}
                            name="publicationDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">প্রকাশের তারিখ</FormLabel>
                                <FormControl>
                                  <MobileInput leftIcon="calendar_today" type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormSection>
                      
                      {/* Student Results Section */}
                      <FormSection 
                        title="শিক্ষার্থীদের ফলাফল" 
                        icon="people"
                        defaultOpen={true}
                      >
                        <div className="space-y-4">
                          <div className="overflow-x-auto -mx-4 px-4">
                            <table className="w-full border-collapse min-w-[600px]">
                              <thead>
                                <tr className="bg-muted/50">
                                  <th className="p-2 text-left">রোল</th>
                                  <th className="p-2 text-left">নাম</th>
                                  <th className="p-2 text-right">প্রাপ্ত নম্বর</th>
                                  <th className="p-2 text-center">গ্রেড</th>
                                  <th className="p-2 text-center">পজিশন</th>
                                  <th className="p-2 text-center">অপশন</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {students.map((student, index) => (
                                  <tr key={student.id} className={(parseFloat(student.marks) < parseFloat(resultSheetForm.getValues("passingMarks"))) ? "bg-red-50" : ""}>
                                    <td className="p-2">
                                      <MobileInput 
                                        value={student.roll}
                                        onChange={(e) => updateStudent(index, "roll", e.target.value)}
                                      />
                                    </td>
                                    <td className="p-2">
                                      <MobileInput 
                                        value={student.name}
                                        onChange={(e) => updateStudent(index, "name", e.target.value)}
                                      />
                                    </td>
                                    <td className="p-2">
                                      <MobileInput 
                                        type="number"
                                        value={student.marks}
                                        onChange={(e) => updateStudent(index, "marks", e.target.value)}
                                        className="text-right"
                                      />
                                    </td>
                                    <td className="p-2 text-center font-medium">
                                      {student.grade}
                                    </td>
                                    <td className="p-2 text-center">
                                      {student.position}
                                    </td>
                                    <td className="p-2 text-center">
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 text-destructive"
                                        onClick={() => removeStudent(index)}
                                        disabled={students.length <= 1}
                                      >
                                        <span className="material-icons">delete</span>
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full gap-2"
                            onClick={addStudent}
                          >
                            <span className="material-icons">add</span>
                            নতুন শিক্ষার্থী যোগ করুন
                          </Button>
                          
                          <div className="bg-muted/30 p-3 rounded-lg mt-4">
                            <h3 className="font-medium text-base mb-2">পরিসংখ্যান</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>মোট শিক্ষার্থী:</span>
                                <span className="font-medium">{resultSheetForm.getValues("totalStudents")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>উত্তীর্ণ:</span>
                                <span className="font-medium">{resultSheetForm.getValues("passStudents")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>অনুত্তীর্ণ:</span>
                                <span className="font-medium">{resultSheetForm.getValues("failStudents")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>শতকরা পাস:</span>
                                <span className="font-medium">{resultSheetForm.getValues("passPercentage")}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>সর্বোচ্চ নম্বর:</span>
                                <span className="font-medium">{resultSheetForm.getValues("highestMarks")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>সর্বনিম্ন নম্বর:</span>
                                <span className="font-medium">{resultSheetForm.getValues("lowestMarks")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>গড় নম্বর:</span>
                                <span className="font-medium">{resultSheetForm.getValues("averageMarks")}</span>
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
                            control={resultSheetForm.control}
                            name="remarks"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">মন্তব্য</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="পরীক্ষার ফলাফল সম্পর্কে যেকোনো অতিরিক্ত মন্তব্য"
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
                    ফলাফল শীট সেটিংস
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
                                  ফলাফল শীটে প্রতিষ্ঠানের লোগো দেখাবে
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
                                  ফলাফল শীটে অধ্যক্ষের স্বাক্ষর দেখাবে
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
                                  ফলাফল শীটে ভেরিফিকেশন QR কোড দেখাবে
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
                                  ফলাফল শীটে প্রতিষ্ঠানের ওয়াটারমার্ক দেখাবে
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
                          name="includeStatistics"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">পরিসংখ্যান</FormLabel>
                                <FormDescription>
                                  ফলাফল শীটে পরিসংখ্যানগত তথ্য দেখাবে
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
                                  ফলাফল শীটে গ্রেড চার্ট অন্তর্ভুক্ত করবে
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
              <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-2xl relative" id="result-sheet-preview">
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
                    <h2 className="text-lg font-semibold text-primary">ফলাফল শীট</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p><span className="text-gray-500">শ্রেণী:</span> {resultSheetForm.getValues("className")} {resultSheetForm.getValues("section") && `(${resultSheetForm.getValues("section")})`}</p>
                      <p><span className="text-gray-500">বিষয়:</span> {resultSheetForm.getValues("subject")} {resultSheetForm.getValues("subjectCode") && `(${resultSheetForm.getValues("subjectCode")})`}</p>
                      <p><span className="text-gray-500">শিক্ষক:</span> {resultSheetForm.getValues("teacherName")}</p>
                    </div>
                    
                    <div className="text-right">
                      <p><span className="text-gray-500">পরীক্ষা:</span> {resultSheetForm.getValues("examName")}</p>
                      <p><span className="text-gray-500">বছর:</span> {resultSheetForm.getValues("examYear")}</p>
                      <p><span className="text-gray-500">প্রকাশের তারিখ:</span> {new Date(resultSheetForm.getValues("publicationDate")).toLocaleDateString('bn-BD')}</p>
                    </div>
                  </div>
                  
                  {templateForm.getValues("includeStatistics") && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm mb-3">
                      <h3 className="font-medium mb-1">পরিসংখ্যান:</h3>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <p><span className="text-gray-500">পূর্ণ নম্বর:</span> {resultSheetForm.getValues("fullMarks")}</p>
                        <p><span className="text-gray-500">পাশ নম্বর:</span> {resultSheetForm.getValues("passingMarks")}</p>
                        <p><span className="text-gray-500">মোট শিক্ষার্থী:</span> {resultSheetForm.getValues("totalStudents")}</p>
                        <p><span className="text-gray-500">উত্তীর্ণ:</span> {resultSheetForm.getValues("passStudents")}</p>
                        <p><span className="text-gray-500">অনুত্তীর্ণ:</span> {resultSheetForm.getValues("failStudents")}</p>
                        <p><span className="text-gray-500">শতকরা পাস:</span> {resultSheetForm.getValues("passPercentage")}%</p>
                        <p><span className="text-gray-500">সর্বোচ্চ নম্বর:</span> {resultSheetForm.getValues("highestMarks")}</p>
                        <p><span className="text-gray-500">সর্বনিম্ন নম্বর:</span> {resultSheetForm.getValues("lowestMarks")}</p>
                        <p><span className="text-gray-500">গড় নম্বর:</span> {resultSheetForm.getValues("averageMarks")}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="overflow-hidden rounded border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-2 text-center">রোল</th>
                          <th className="py-2 px-2 text-left">নাম</th>
                          <th className="py-2 px-2 text-right">প্রাপ্ত নম্বর</th>
                          <th className="py-2 px-2 text-center">গ্রেড</th>
                          <th className="py-2 px-2 text-center">পজিশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {sortStudentsByMarks(students).map((student, index) => (
                          <tr key={student.id} className={(parseFloat(student.marks) < parseFloat(resultSheetForm.getValues("passingMarks"))) ? "bg-red-50" : ""}>
                            <td className="py-2 px-2 text-center">{student.roll}</td>
                            <td className="py-2 px-2">{student.name}</td>
                            <td className="py-2 px-2 text-right">{student.marks}</td>
                            <td className="py-2 px-2 text-center font-medium">{student.grade}</td>
                            <td className="py-2 px-2 text-center">{student.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {resultSheetForm.getValues("remarks") && (
                    <div className="border-t pt-2">
                      <p className="text-sm text-gray-500">মন্তব্য:</p>
                      <p className="font-medium">{resultSheetForm.getValues("remarks")}</p>
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
                
                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="min-h-12 flex items-end justify-center mb-1">
                      <div className="border-b border-gray-900 w-24">
                        <div className="text-xs italic text-gray-500 -mb-2">signature</div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm">{resultSheetForm.getValues("teacherName")}</p>
                      <p className="text-xs text-gray-500">বিষয় শিক্ষক</p>
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
                        <p className="text-xs text-gray-500">ঢাকা পাবলিক স্কুল অ্যান্ড কলেজ</p>
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
                <span className="material-icons mr-2">school</span>
                একসাথে ফলাফল শীট তৈরি করুন
              </CardTitle>
              <CardDescription>
                একই সাথে একাধিক ক্লাসের ফলাফল শীট তৈরি করুন
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
                    >
                      <span className="material-icons text-sm">download</span>
                      আমদানি করুন
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
                  <h3 className="text-base font-medium mb-3">পরীক্ষা এবং বিষয় নির্বাচন করুন</h3>
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
                      <label className="text-sm text-gray-500 mb-1 block">বিষয়</label>
                      <Select defaultValue="Mathematics">
                        <SelectTrigger className="mobile-select">
                          <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">গণিত</SelectItem>
                          <SelectItem value="Bangla">বাংলা</SelectItem>
                          <SelectItem value="English">ইংরেজি</SelectItem>
                          <SelectItem value="Science">বিজ্ঞান</SelectItem>
                          <SelectItem value="Social Science">সমাজ বিজ্ঞান</SelectItem>
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
                          সবগুলো ফলাফল শীট একটি পিডিএফ ফাইলে রাখুন
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
                        স্ট্যান্ডার্ড ফলাফল শীট
                      </label>
                      <p className="text-sm text-muted-foreground">
                        সাধারণ ফলাফল শীট টেমপ্লেট
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
                        বিস্তারিত ফলাফল শীট
                      </label>
                      <p className="text-sm text-muted-foreground">
                        অতিরিক্ত তথ্য সহ বিস্তারিত ফলাফল শীট
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
                        সাধারণ ফলাফল শীট
                      </label>
                      <p className="text-sm text-muted-foreground">
                        ন্যূনতম তথ্য সহ সহজ ফলাফল শীট
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
                সাম্প্রতিক তৈরি করা ফলাফল শীট
              </CardTitle>
              <CardDescription>
                আপনার সাম্প্রতিক তৈরি করা ফলাফল শীট দেখুন
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
                      আপনি এখনও কোন ফলাফল শীট তৈরি করেননি।
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