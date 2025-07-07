import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DownloadIcon, PrinterIcon, PlusIcon, SettingsIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';
import { generatePDF } from '@/lib/utils';
import html2canvas from 'html2canvas';

interface Subject {
  id: string;
  name: string;
  fullMarks: number;
  passMarks: number;
  obtainedMarks?: number;
}

interface Student {
  id: string;
  name: string;
  roll: string;
  class: string;
  section: string;
  subjects: Subject[];
}

// Bangladesh GPA calculation function
function calculateGPA(percentage: number): { gpa: number; letterGrade: string } {
  if (percentage >= 80) return { gpa: 5.0, letterGrade: 'A+' };
  if (percentage >= 70) return { gpa: 4.0, letterGrade: 'A' };
  if (percentage >= 60) return { gpa: 3.5, letterGrade: 'A-' };
  if (percentage >= 50) return { gpa: 3.0, letterGrade: 'B' };
  if (percentage >= 40) return { gpa: 2.0, letterGrade: 'C' };
  if (percentage >= 33) return { gpa: 1.0, letterGrade: 'D' };
  return { gpa: 0.0, letterGrade: 'F' };
}

// Sample data for demonstration
const sampleSubjects: Subject[] = [
  { id: '1', name: 'Bengali', fullMarks: 100, passMarks: 33, obtainedMarks: 75 },
  { id: '2', name: 'English', fullMarks: 100, passMarks: 33, obtainedMarks: 82 },
  { id: '3', name: 'Mathematics', fullMarks: 100, passMarks: 33, obtainedMarks: 90 },
  { id: '4', name: 'Science', fullMarks: 100, passMarks: 33, obtainedMarks: 85 },
  { id: '5', name: 'Social Science', fullMarks: 100, passMarks: 33, obtainedMarks: 78 },
  { id: '6', name: 'Religion', fullMarks: 100, passMarks: 33, obtainedMarks: 95 },
  { id: '7', name: 'ICT', fullMarks: 50, passMarks: 17, obtainedMarks: 45 },
];

const sampleStudents: Student[] = [
  {
    id: '1',
    name: 'Abdullah Al Mamun',
    roll: '01',
    class: 'Six',
    section: 'A',
    subjects: sampleSubjects,
  }
];

export default function ResultSheetsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [examType, setExamType] = useState('mid_term');
  const [student, setStudent] = useState<Student>(sampleStudents[0]);
  const [showRanking, setShowRanking] = useState(true);
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);
  const [showInstitutionRules, setShowInstitutionRules] = useState(true);
  const [institutionRules, setInstitutionRules] = useState(
    '1. Regular attendance is mandatory for all students.\n' +
    '2. Students must achieve at least 33% marks to pass in each subject.\n' +
    '3. Students failing in multiple subjects will need to take special exams.\n' +
    '4. Promotion to the next class requires passing all subjects.'
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

  // Handle print/download
  const handlePrint = async () => {
    const resultSheetElement = document.getElementById('result-sheet');
    if (resultSheetElement) {
      try {
        const canvas = await html2canvas(resultSheetElement);
        const pdf = generatePDF(canvas, 'A4');
        pdf.save(`result_${student.name}_${examType}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
      }
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            "resultSheets.title"
          </h1>
          <p className="text-gray-600 mt-1">
            "resultSheets.subtitle"
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <span className="material-icons text-gray-500 text-sm">refresh</span>
            "common.reset"
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            onClick={handlePrint}
            disabled={false}
          >
            <span className="material-icons text-sm">description</span>
            "common.generate"
          </Button>
        </div>
      </div>
      
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
                  <CardTitle>"common.settings"</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>"resultSheets.examDate"</Label>
                    <DatePicker date={date} setDate={setDate} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>"resultSheets.examType"</Label>
                    <Select value={examType} onValueChange={setExamType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_term">"resultSheets.firstTerm"</SelectItem>
                        <SelectItem value="mid_term">"resultSheets.midTerm"</SelectItem>
                        <SelectItem value="final">"resultSheets.final"</SelectItem>
                        <SelectItem value="model_test">"resultSheets.modelTest"</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>"resultSheets.student"</Label>
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
                      id="ranking"
                      checked={showRanking}
                      onCheckedChange={setShowRanking}
                    />
                    <Label htmlFor="ranking">"resultSheets.showRanking"</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="compare"
                      checked={compareWithPrevious}
                      onCheckedChange={setCompareWithPrevious}
                    />
                    <Label htmlFor="compare">"resultSheets.compareWithPrevious"</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="rules"
                      checked={showInstitutionRules}
                      onCheckedChange={setShowInstitutionRules}
                    />
                    <Label htmlFor="rules">"resultSheets.showInstitutionRules"</Label>
                  </div>
                  
                  {showInstitutionRules && (
                    <div className="space-y-2">
                      <Label>"resultSheets.institutionRules"</Label>
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
                  <CardTitle>"resultSheets.subjects"</CardTitle>
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
                  <div id="result-sheet" className="bg-white p-8 border rounded-lg shadow">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold mb-1">Ideal High School</h2>
                      <p className="text-sm mb-1">Dhaka, Bangladesh</p>
                      <div className="text-lg font-semibold border-t border-b py-2 px-6 mx-auto w-max">
                        Student Result Sheet
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p><span className="font-medium">Student Name:</span> {student.name}</p>
                        <p><span className="font-medium">Class:</span> {student.class}</p>
                        <p><span className="font-medium">Section:</span> {student.section}</p>
                        <p><span className="font-medium">Roll No:</span> {student.roll}</p>
                      </div>
                      <div className="text-right">
                        <p><span className="font-medium">Examination:</span> {
                          examType === 'mid_term' ? 'Mid-Term Examination' :
                          examType === 'final' ? 'Final Examination' :
                          examType === 'first_term' ? 'First Term Examination' : 'Model Test'
                        }</p>
                        <p>
                          <span className="font-medium">Date:</span> {date?.toLocaleDateString()}
                        </p>
                        <p><span className="font-medium">Session:</span> {new Date().getFullYear()}</p>
                      </div>
                    </div>
                    
                    <table className="w-full border border-collapse mb-6">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">Subject</th>
                          <th className="border p-2 text-center">Full Marks</th>
                          <th className="border p-2 text-center">Pass Marks</th>
                          <th className="border p-2 text-center">Obtained Marks</th>
                          <th className="border p-2 text-center">Letter Grade</th>
                          <th className="border p-2 text-center">GPA</th>
                          {compareWithPrevious && (
                            <th className="border p-2 text-center">Previous</th>
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
                              <td className="border p-2 text-center">{subject.fullMarks}</td>
                              <td className="border p-2 text-center">{subject.passMarks}</td>
                              <td className={`border p-2 text-center ${hasFailed ? 'text-red-600 font-bold' : ''}`}>
                                {subject.obtainedMarks || 0}
                              </td>
                              <td className={`border p-2 text-center ${hasFailed ? 'text-red-600 font-bold' : ''}`}>
                                {subjectGrade.letterGrade}
                              </td>
                              <td className={`border p-2 text-center ${hasFailed ? 'text-red-600 font-bold' : ''}`}>
                                {subjectGrade.gpa.toFixed(2)}
                              </td>
                              {compareWithPrevious && (
                                <td className="border p-2 text-center">
                                  {Math.floor((subject.obtainedMarks || 0) * 0.9)}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 font-semibold">
                          <td className="border p-2">Total</td>
                          <td className="border p-2 text-center">{totalFullMarks}</td>
                          <td className="border p-2 text-center">-</td>
                          <td className="border p-2 text-center">{totalObtained}</td>
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
                        <div><span className="font-medium">Total Marks:</span> {totalObtained} / {totalFullMarks}</div>
                        <div><span className="font-medium">Percentage:</span> {percentage.toFixed(2)}%</div>
                        <div><span className="font-medium">GPA:</span> {finalGPA.toFixed(2)}</div>
                        <div><span className="font-medium">Grade:</span> {finalLetterGrade}</div>
                        {showRanking && (
                          <div><span className="font-medium">Rank:</span> 1</div>
                        )}
                      </div>
                      
                      <div className="p-3 border bg-gray-50 rounded">
                        <p className="font-medium mb-1">Remarks:</p>
                        <p>{failedSubjects.length > 0 
                          ? `Failed in ${failedSubjects.length} subject(s). Need to work harder.` 
                          : 'Excellent performance! Keep up the good work.'
                        }</p>
                      </div>
                    </div>
                    
                    {showInstitutionRules && (
                      <div className="mb-6">
                        <p className="font-medium mb-2">Institution Rules:</p>
                        <div className="p-3 border bg-gray-50 rounded text-sm whitespace-pre-line">
                          {institutionRules}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4 mt-12">
                      <div className="text-center">
                        <div className="border-t border-black pt-1">
                          Class Teacher
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-black pt-1">
                          Examination Controller
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-black pt-1">
                          Principal
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
                <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">"resultSheets.templateSettings"</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  "resultSheets.templateDescription"
                </p>
                <Button>
                  "resultSheets.createTemplate"
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <RefreshCwIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">"common.history"</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  "resultSheets.historyDescription"
                </p>
                <Button>
                  "common.viewAll"
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="batch">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">"common.batchProcess"</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  "resultSheets.batchDescription"
                </p>
                <Button>
                  "resultSheets.generateBatch"
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}