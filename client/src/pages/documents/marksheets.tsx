import { useState, useRef, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { useMobile } from '@/hooks/use-mobile';
import { MobilePageLayout } from '@/components/layout/mobile-page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MobileTabs, MobileTabContent } from '@/components/ui/mobile-tabs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generatePDF } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { 
  Download, 
  Upload, 
  Calculator, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Award, 
  FileText, 
  Eye,
  Printer,
  Share2,
  CheckCircle,
  AlertCircle,
  Star,
  Target
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  nameBn: string;
  fullMarks: number;
  passMarks: number;
  obtainedMarks?: number;
  mcqMarks?: number;
  writtenMarks?: number;
  practicalMarks?: number;
  category: 'compulsory' | 'optional' | 'fourth_subject';
  type: 'theory' | 'practical' | 'combined';
}

interface Student {
  id: string;
  name: string;
  nameBn: string;
  roll: string;
  class: string;
  classBn: string;
  section: string;
  session: string;
  examType: string;
  subjects: Subject[];
  guardianName?: string;
  institution?: string;
  boardName?: string;
}

// Enhanced Bangladesh GPA calculation function following NCTB guidelines
function calculateGPA(percentage: number): { gpa: number; letterGrade: string; gradeBn: string } {
  if (percentage >= 80) return { gpa: 5.0, letterGrade: 'A+', gradeBn: 'এ প্লাস' };
  if (percentage >= 70) return { gpa: 4.0, letterGrade: 'A', gradeBn: 'এ' };
  if (percentage >= 60) return { gpa: 3.5, letterGrade: 'A-', gradeBn: 'এ মাইনাস' };
  if (percentage >= 50) return { gpa: 3.0, letterGrade: 'B', gradeBn: 'বি' };
  if (percentage >= 40) return { gpa: 2.0, letterGrade: 'C', gradeBn: 'সি' };
  if (percentage >= 33) return { gpa: 1.0, letterGrade: 'D', gradeBn: 'ডি' };
  return { gpa: 0.0, letterGrade: 'F', gradeBn: 'অকৃতকার্য' };
}

// Subject-wise GPA calculation
function calculateSubjectGPA(obtainedMarks: number, fullMarks: number): { gpa: number; letterGrade: string; gradeBn: string } {
  const percentage = (obtainedMarks / fullMarks) * 100;
  return calculateGPA(percentage);
}

// Overall GPA calculation (excluding 4th subject if below 2.0)
function calculateOverallGPA(subjects: Subject[]): { gpa: number; letterGrade: string; gradeBn: string } {
  let totalGradePoints = 0;
  let subjectCount = 0;
  
  subjects.forEach(subject => {
    if (subject.obtainedMarks !== undefined) {
      const subjectGPA = calculateSubjectGPA(subject.obtainedMarks, subject.fullMarks);
      
      // Include in calculation if not 4th subject or if 4th subject has GPA >= 2.0
      if (subject.category !== 'fourth_subject' || subjectGPA.gpa >= 2.0) {
        totalGradePoints += subjectGPA.gpa;
        subjectCount++;
      }
    }
  });
  
  const averageGPA = subjectCount > 0 ? totalGradePoints / subjectCount : 0;
  return calculateGPA((averageGPA / 5.0) * 100);
}

// Exam types for Bangladesh education system
const examTypes = [
  { value: 'half_yearly', label: 'অর্ধবার্ষিক পরীক্ষা', labelEn: 'Half Yearly Examination' },
  { value: 'annual', label: 'বার্ষিক পরীক্ষা', labelEn: 'Annual Examination' },
  { value: 'test', label: 'টেস্ট পরীক্ষা', labelEn: 'Test Examination' },
  { value: 'first_term', label: 'প্রথম সাময়িক', labelEn: 'First Terminal' },
  { value: 'second_term', label: 'দ্বিতীয় সাময়িক', labelEn: 'Second Terminal' },
  { value: 'third_term', label: 'তৃতীয় সাময়িক', labelEn: 'Third Terminal' },
  { value: 'final', label: 'চূড়ান্ত পরীক্ষা', labelEn: 'Final Examination' }
];

// Template types for different institutions
const templateTypes = [
  { value: 'standard', label: 'সাধারণ টেমপ্লেট', description: 'বেসিক স্কুল/কলেজের জন্য' },
  { value: 'government', label: 'সরকারি টেমপ্লেট', description: 'সরকারি শিক্ষা প্রতিষ্ঠানের জন্য' },
  { value: 'board', label: 'বোর্ড টেমপ্লেট', description: 'শিক্ষা বোর্ডের জন্য' },
  { value: 'madrasa', label: 'মাদ্রাসা টেমপ্লেট', description: 'মাদ্রাসা শিক্ষা প্রতিষ্ঠানের জন্য' },
  { value: 'technical', label: 'কারিগরি টেমপ্লেট', description: 'কারিগরি শিক্ষা প্রতিষ্ঠানের জন্য' }
];

// Enhanced sample data with full structure
const sampleSubjects: Subject[] = [
  { 
    id: '1', 
    name: 'Bangla', 
    nameBn: 'বাংলা', 
    fullMarks: 100, 
    passMarks: 33, 
    obtainedMarks: 75,
    mcqMarks: 25,
    writtenMarks: 50,
    category: 'compulsory',
    type: 'combined'
  },
  { 
    id: '2', 
    name: 'English', 
    nameBn: 'ইংরেজি', 
    fullMarks: 100, 
    passMarks: 33, 
    obtainedMarks: 82,
    mcqMarks: 30,
    writtenMarks: 52,
    category: 'compulsory',
    type: 'combined'
  },
  { 
    id: '3', 
    name: 'Mathematics', 
    nameBn: 'গণিত', 
    fullMarks: 100, 
    passMarks: 33, 
    obtainedMarks: 90,
    mcqMarks: 35,
    writtenMarks: 55,
    category: 'compulsory',
    type: 'theory'
  },
  { 
    id: '4', 
    name: 'Science', 
    nameBn: 'বিজ্ঞান', 
    fullMarks: 100, 
    passMarks: 33, 
    obtainedMarks: 85,
    mcqMarks: 30,
    writtenMarks: 45,
    practicalMarks: 10,
    category: 'compulsory',
    type: 'combined'
  },
  { 
    id: '5', 
    name: 'Social Science', 
    nameBn: 'সামাজিক বিজ্ঞান', 
    fullMarks: 100, 
    passMarks: 33, 
    obtainedMarks: 78,
    mcqMarks: 28,
    writtenMarks: 50,
    category: 'compulsory',
    type: 'theory'
  },
  { 
    id: '6', 
    name: 'Religion & Moral Education', 
    nameBn: 'ধর্ম ও নৈতিক শিক্ষা', 
    fullMarks: 100, 
    passMarks: 33, 
    obtainedMarks: 95,
    mcqMarks: 35,
    writtenMarks: 60,
    category: 'compulsory',
    type: 'theory'
  },
  { 
    id: '7', 
    name: 'ICT', 
    nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', 
    fullMarks: 50, 
    passMarks: 17, 
    obtainedMarks: 45,
    mcqMarks: 15,
    practicalMarks: 30,
    category: 'fourth_subject',
    type: 'practical'
  },
];

const sampleStudents: Student[] = [
  {
    id: '1',
    name: 'Abdullah Al Mamun',
    nameBn: 'আবদুল্লাহ আল মামুন',
    roll: '01',
    class: 'Class VI',
    classBn: 'ষষ্ঠ শ্রেণী',
    section: 'A',
    session: '2024',
    examType: 'annual',
    subjects: sampleSubjects,
    guardianName: 'Md. Abdul Karim',
    institution: 'Dhaka Residential Model College',
    boardName: 'Dhaka Education Board'
  }
];

const bengaliMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

function convertToBengaliNumber(num: number): string {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(n => bengaliNumerals[parseInt(n)]).join('');
}

export default function MarksheetsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [examType, setExamType] = useState('mid_term');
  const [student, setStudent] = useState<Student>(sampleStudents[0]);
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);
  const [showInstitutionRules, setShowInstitutionRules] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [institutionRules, setInstitutionRules] = useState(
    '১. শিক্ষার্থীকে নিয়মিত স্কুলে উপস্থিত থাকতে হবে।\n' +
    '২. পরীক্ষায় নূন্যতম ৩৩% নম্বর পেতে হবে পাশ করার জন্য।\n' +
    '৩. একাধিক বিষয়ে অকৃতকার্য হলে শিক্ষার্থীকে বিশেষ পরীক্ষা দিতে হবে।\n' +
    '৪. পরবর্তী শ্রেণীতে উত্তীর্ণ হতে সকল বিষয়ে পাশ করতে হবে।'
  );

  // Calculate total marks, GPA, and percentage
  const totalObtained = student.subjects.reduce((sum, subject) => sum + (subject.obtainedMarks || 0), 0);
  const totalFullMarks = student.subjects.reduce((sum, subject) => sum + subject.fullMarks, 0);
  const percentage = (totalObtained / totalFullMarks) * 100;
  const { gpa, letterGrade } = calculateGPA(percentage);

  // Check if student has failed in any subject
  const failedSubjects = student.subjects.filter(subject => 
    (subject.obtainedMarks || 0) < subject.passMarks
  );
  
  const finalGPA = failedSubjects.length > 0 ? 0 : gpa;
  const finalLetterGrade = failedSubjects.length > 0 ? 'F' : letterGrade;

  // Tab items
  const tabItems = [
    { id: "generate", label: "কন্টেন্ট" },
    { id: "batch", label: "কন্টেন্ট" },
    { id: "templates", label: "কন্টেন্ট" },
    { id: "history", label: "কন্টেন্ট" }
  ];

  // Handle print/download
  const handlePrint = async () => {
    setIsLoading(true);
    const marksheetElement = document.getElementById('marksheet');
    
    if (marksheetElement) {
      try {
        const canvas = await html2canvas(marksheetElement);
        const pdf = generatePDF(canvas, 'A4');
        pdf.save(`marksheet_${student.name}_${examType}.pdf`);
        
        toast({
          title: "মার্কশীট তৈরি হয়েছে",
          description: "মার্কশীট PDF ফাইল হিসেবে সেভ করা হয়েছে",
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: "দুঃখিত, একটি ত্রুটি হয়েছে",
          description: "PDF তৈরি করতে সমস্যা হয়েছে",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      toast({
        title: "মার্কশীট তৈরি করা যায়নি",
        description: "মার্কশীট এলিমেন্ট খুঁজে পাওয়া যায়নি",
        variant: "destructive",
      });
    }
  };
  
  // Reset form function
  const resetForm = () => {
    setDate(new Date());
    setExamType('mid_term');
    setCompareWithPrevious(false);
    setShowInstitutionRules(true);
    
    toast({
      title: "ফর্ম রিসেট হয়েছে",
      description: "সকল ইনপুট ফিল্ড রিসেট করা হয়েছে",
    });
  };

  return (
    <AppShell>
      <MobilePageLayout
        title="মার্কশীট"
        description="শিক্ষার্থীদের পরীক্ষার মার্কশীট তৈরি করুন"
        primaryAction={{
          icon: "description",
          label: "জেনারেট করুন",
          onClick: handlePrint,
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
      </MobilePageLayout>
      
      <Tabs defaultValue="generate">
        <div className="border-b border-gray-200 mb-6">
          <TabsList className="h-auto p-0 bg-transparent justify-start">
            <TabsTrigger
              value="generate"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
            >
              "common.generate"
            </TabsTrigger>
            <TabsTrigger
              value="batch"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
            >
              "common.batchProcess"
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
            >
              "common.templates"
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
            >
              "common.history"
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="generate">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>সেটিংস</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>পরীক্ষার তারিখ</Label>
                    <DatePicker date={date} setDate={setDate} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>পরীক্ষার ধরন</Label>
                    <Select value={examType} onValueChange={setExamType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_term">প্রথম সাময়িক পরীক্ষা</SelectItem>
                        <SelectItem value="mid_term">অর্ধবার্ষিক পরীক্ষা</SelectItem>
                        <SelectItem value="final">বার্ষিক পরীক্ষা</SelectItem>
                        <SelectItem value="model_test">মডেল টেস্ট</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>শিক্ষার্থী</Label>
                    <Select value={student.id}>
                      <SelectTrigger>
                        <SelectValue>{student.name}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {sampleStudents.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="compare"
                      checked={compareWithPrevious}
                      onCheckedChange={setCompareWithPrevious}
                    />
                    <Label htmlFor="compare">পূর্ববর্তী ফলাফল দেখান</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="rules"
                      checked={showInstitutionRules}
                      onCheckedChange={setShowInstitutionRules}
                    />
                    <Label htmlFor="rules">প্রতিষ্ঠানের নিয়মাবলী দেখান</Label>
                  </div>
                  
                  {showInstitutionRules && (
                    <div className="space-y-2">
                      <Label>প্রতিষ্ঠানের নিয়মাবলী</Label>
                      <Textarea 
                        value={institutionRules} 
                        onChange={(e) => setInstitutionRules(e.target.value)}
                        rows={5}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>বিষয়সমূহ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {student.subjects.map((subject, index) => (
                      <div key={subject.id} className="flex items-center gap-2">
                        <div className="flex-1">{subject.name}</div>
                        <Input
                          className="w-20"
                          value={subject.obtainedMarks}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            const newSubjects = [...student.subjects];
                            newSubjects[index] = {
                              ...subject,
                              obtainedMarks: Math.min(newValue, subject.fullMarks)
                            };
                            setStudent({ ...student, subjects: newSubjects });
                          }}
                        />
                        <div className="w-12 text-center">/</div>
                        <div className="w-12 text-center">{subject.fullMarks}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="p-4">
                <CardContent className="p-0">
                  <div id="marksheet" className="bg-white p-8 border rounded-lg shadow">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold mb-1">আদর্শ উচ্চ বিদ্যালয়</h2>
                      <p className="text-sm mb-1">ঢাকা, বাংলাদেশ</p>
                      <div className="text-lg font-semibold border-t border-b py-2 px-6 mx-auto w-max">
                        শিক্ষার্থীর ফলাফল শীট
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p><span className="font-medium">শিক্ষার্থীর নাম:</span> {student.name}</p>
                        <p><span className="font-medium">শ্রেণী:</span> {student.class}</p>
                        <p><span className="font-medium">শাখা:</span> {student.section}</p>
                        <p><span className="font-medium">রোল নম্বর:</span> {student.roll}</p>
                      </div>
                      <div className="text-right">
                        <p><span className="font-medium">পরীক্ষা:</span> {
                          examType === 'mid_term' ? 'অর্ধবার্ষিক পরীক্ষা' :
                          examType === 'final' ? 'বার্ষিক পরীক্ষা' :
                          examType === 'first_term' ? 'প্রথম সাময়িক পরীক্ষা' : 'মডেল টেস্ট'
                        }</p>
                        <p>
                          <span className="font-medium">তারিখ:</span> {
                            date ? `${convertToBengaliNumber(date.getDate())} ${bengaliMonths[date.getMonth()]}, ${convertToBengaliNumber(date.getFullYear())}` : ''
                          }
                        </p>
                        <p><span className="font-medium">সেশন:</span> {convertToBengaliNumber(new Date().getFullYear())}</p>
                      </div>
                    </div>
                    
                    <table className="w-full border border-collapse mb-6">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">বিষয়</th>
                          <th className="border p-2 text-center">পূর্ণ মার্ক</th>
                          <th className="border p-2 text-center">পাশ মার্ক</th>
                          <th className="border p-2 text-center">প্রাপ্ত মার্ক</th>
                          <th className="border p-2 text-center">লেটার গ্রেড</th>
                          <th className="border p-2 text-center">জিপিএ</th>
                          {compareWithPrevious && (
                            <th className="border p-2 text-center">পূর্ববর্তী</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {student.subjects.map(subject => {
                          const subjectPercentage = ((subject.obtainedMarks || 0) / subject.fullMarks) * 100;
                          const subjectGrade = calculateGPA(subjectPercentage);
                          const hasFailed = (subject.obtainedMarks || 0) < subject.passMarks;
                          
                          return (
                            <tr key={subject.id}>
                              <td className="border p-2">{subject.name}</td>
                              <td className="border p-2 text-center">{convertToBengaliNumber(subject.fullMarks)}</td>
                              <td className="border p-2 text-center">{convertToBengaliNumber(subject.passMarks)}</td>
                              <td className={`border p-2 text-center ${hasFailed ? 'text-red-600 font-bold' : ''}`}>
                                {convertToBengaliNumber(subject.obtainedMarks || 0)}
                              </td>
                              <td className={`border p-2 text-center ${hasFailed ? 'text-red-600 font-bold' : ''}`}>
                                {subjectGrade.letterGrade}
                              </td>
                              <td className={`border p-2 text-center ${hasFailed ? 'text-red-600 font-bold' : ''}`}>
                                {subjectGrade.gpa.toFixed(2)}
                              </td>
                              {compareWithPrevious && (
                                <td className="border p-2 text-center">
                                  {convertToBengaliNumber(Math.floor((subject.obtainedMarks || 0) * 0.9))}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 font-semibold">
                          <td className="border p-2">মোট</td>
                          <td className="border p-2 text-center">{convertToBengaliNumber(totalFullMarks)}</td>
                          <td className="border p-2 text-center">-</td>
                          <td className="border p-2 text-center">{convertToBengaliNumber(totalObtained)}</td>
                          <td className="border p-2 text-center">{finalLetterGrade}</td>
                          <td className="border p-2 text-center">{finalGPA.toFixed(2)}</td>
                          {compareWithPrevious && (
                            <td className="border p-2 text-center">-</td>
                          )}
                        </tr>
                      </tfoot>
                    </table>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <div><span className="font-medium">মোট নম্বর:</span> {convertToBengaliNumber(totalObtained)} / {convertToBengaliNumber(totalFullMarks)}</div>
                        <div><span className="font-medium">শতকরা:</span> {convertToBengaliNumber(Math.round(percentage))}%</div>
                        <div><span className="font-medium">জিপিএ:</span> {finalGPA.toFixed(2)}</div>
                        <div><span className="font-medium">গ্রেড:</span> {finalLetterGrade}</div>
                        <div><span className="font-medium">অবস্থান:</span> {convertToBengaliNumber(1)}</div>
                      </div>
                      
                      <div className="p-3 border bg-gray-50 rounded">
                        <p className="font-medium mb-1">মন্তব্য:</p>
                        <p>{failedSubjects.length > 0 
                          ? `${failedSubjects.length}টি বিষয়ে অকৃতকার্য। অতিরিক্ত পরিশ্রম করতে হবে।` 
                          : 'অভিনন্দন! তুমি সকল বিষয়ে কৃতকার্য হয়েছো। এভাবেই চালিয়ে যাও।'
                        }</p>
                      </div>
                    </div>
                    
                    {showInstitutionRules && (
                      <div className="mb-6">
                        <p className="font-medium mb-2">প্রতিষ্ঠানের নিয়মাবলী:</p>
                        <div className="p-3 border bg-gray-50 rounded text-sm whitespace-pre-line">
                          {institutionRules}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4 mt-12">
                      <div className="text-center">
                        <div className="border-t border-black pt-1">
                          শ্রেণী শিক্ষক
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-black pt-1">
                          পরীক্ষা নিয়ন্ত্রক
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-black pt-1">
                          প্রধান শিক্ষক
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <span className="material-icons text-5xl text-gray-400 mb-4">settings</span>
                <h3 className="text-lg font-medium mb-2">টেমপ্লেট সেটিংস</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  বিভিন্ন ধরনের টেমপ্লেট তৈরি করুন এবং আপনার প্রয়োজন অনুযায়ী কাস্টমাইজ করুন। আপনি বিভিন্ন স্কুল, কলেজ বা মাদ্রাসার জন্য আলাদা টেমপ্লেট ব্যবহার করতে পারেন।
                </p>
                <Button>
                  নতুন টেমপ্লেট তৈরি করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <span className="material-icons text-5xl text-gray-400 mb-4">refresh</span>
                <h3 className="text-lg font-medium mb-2">ইতিহাস</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  আপনার তৈরি করা সকল মার্কশীট এখানে দেখতে পারবেন। পূর্বের তৈরি করা মার্কশীট দেখুন, ডাউনলোড করুন বা সম্পাদনা করুন।
                </p>
                <Button>
                  সব দেখুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="batch">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <span className="material-icons text-4xl text-gray-400 mb-4">search</span>
                <h3 className="text-lg font-medium mb-2">ব্যাচ প্রসেস</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  একই সাথে অনেকগুলো শিক্ষার্থীর মার্কশীট তৈরি করুন। একটি ক্লাস বা সেকশনের সব শিক্ষার্থীর মার্কশীট একসাথে জেনারেট করুন।
                </p>
                <Button>
                  ব্যাচ তৈরি করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
