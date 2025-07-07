import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentPageTemplate } from './DocumentPageTemplate';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  fullMarks: z.number().min(1, 'Full marks required'),
  obtainedMarks: z.number().min(0, 'Obtained marks required'),
  grade: z.string().min(1, 'Grade is required'),
});

const marksheetSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentNameBn: z.string().min(1, 'বাংলা নাম আবশ্যক'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  className: z.string().min(1, 'Class is required'),
  session: z.string().min(1, 'Session is required'),
  examName: z.string().min(1, 'Exam name is required'),
  subjects: z.array(subjectSchema).min(1, 'At least one subject is required'),
  instituteName: z.string().min(1, 'Institute name is required'),
  instituteAddress: z.string().min(1, 'Institute address is required'),
});

type MarksheetFormData = z.infer<typeof marksheetSchema>;

interface MarksheetPreviewProps {
  data: MarksheetFormData;
}

function MarksheetPreview({ data }: MarksheetPreviewProps) {
  const totalFullMarks = data.subjects.reduce((sum, subject) => sum + subject.fullMarks, 0);
  const totalObtainedMarks = data.subjects.reduce((sum, subject) => sum + subject.obtainedMarks, 0);
  const percentage = ((totalObtainedMarks / totalFullMarks) * 100).toFixed(2);
  
  const calculateGPA = () => {
    const gradePoints = data.subjects.map(subject => {
      switch (subject.grade) {
        case 'A+': return 5.0;
        case 'A': return 4.0;
        case 'A-': return 3.5;
        case 'B': return 3.0;
        case 'C': return 2.0;
        case 'D': return 1.0;
        default: return 0.0;
      }
    });
    const averageGPA = gradePoints.reduce((sum, gp) => sum + gp, 0) / gradePoints.length;
    return averageGPA.toFixed(2);
  };

  return (
    <div className="bg-white p-8 border-2 border-gray-300 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{data.instituteName}</h1>
        <p className="text-sm text-gray-600 mb-4">{data.instituteAddress}</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Academic Transcript / নম্বরপত্র</h2>
        <h3 className="text-lg font-semibold text-gray-700">{data.examName}</h3>
        <p className="text-sm text-gray-600">Session: {data.session}</p>
      </div>

      {/* Student Information */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Student Name:</Label>
            <p className="text-lg font-medium">{data.studentName}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">ছাত্র/ছাত্রীর নাম:</Label>
            <p className="text-lg font-medium">{data.studentNameBn}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Roll Number:</Label>
            <p className="text-lg font-bold text-blue-600">{data.rollNumber}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Class:</Label>
            <p className="text-lg font-medium">{data.className}</p>
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2 text-left">Subject / বিষয়</th>
              <th className="border border-gray-400 px-4 py-2 text-center">Full Marks / পূর্ণমান</th>
              <th className="border border-gray-400 px-4 py-2 text-center">Obtained Marks / প্রাপ্ত নম্বর</th>
              <th className="border border-gray-400 px-4 py-2 text-center">Grade / গ্রেড</th>
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((subject, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-400 px-4 py-2 font-medium">{subject.name}</td>
                <td className="border border-gray-400 px-4 py-2 text-center">{subject.fullMarks}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-semibold">
                  {subject.obtainedMarks}
                </td>
                <td className="border border-gray-400 px-4 py-2 text-center font-bold text-blue-600">
                  {subject.grade}
                </td>
              </tr>
            ))}
            <tr className="bg-yellow-50 font-bold">
              <td className="border border-gray-400 px-4 py-2">Total / মোট</td>
              <td className="border border-gray-400 px-4 py-2 text-center">{totalFullMarks}</td>
              <td className="border border-gray-400 px-4 py-2 text-center text-blue-600">
                {totalObtainedMarks}
              </td>
              <td className="border border-gray-400 px-4 py-2 text-center">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Result Summary */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Result Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Marks:</span>
              <span className="font-semibold">{totalObtainedMarks}/{totalFullMarks}</span>
            </div>
            <div className="flex justify-between">
              <span>Percentage:</span>
              <span className="font-semibold text-blue-600">{percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span>GPA:</span>
              <span className="font-semibold text-blue-600">{calculateGPA()}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">Grade Classification</h4>
          <div className="text-sm space-y-1">
            <div>A+ = 80-100% (GPA 5.0)</div>
            <div>A = 70-79% (GPA 4.0)</div>
            <div>A- = 60-69% (GPA 3.5)</div>
            <div>B = 50-59% (GPA 3.0)</div>
            <div>C = 40-49% (GPA 2.0)</div>
            <div>D = 33-39% (GPA 1.0)</div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between items-center pt-8 border-t-2 border-gray-300">
        <div className="text-center">
          <div className="w-40 h-16 border-b border-gray-400 mb-2"></div>
          <p className="text-sm text-gray-600">Class Teacher</p>
          <p className="text-xs text-gray-500">শ্রেণি শিক্ষক</p>
        </div>
        <div className="text-center">
          <div className="w-40 h-16 border-b border-gray-400 mb-2"></div>
          <p className="text-sm text-gray-600">Head Teacher</p>
          <p className="text-xs text-gray-500">প্রধান শিক্ষক</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs text-gray-500">
        <p>This is a computer-generated marksheet. No signature is required.</p>
        <p>এটি একটি কম্পিউটার-উৎপন্ন নম্বরপত্র। কোনো স্বাক্ষরের প্রয়োজন নেই।</p>
      </div>
    </div>
  );
}

export function MarksheetGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<MarksheetFormData | null>(null);
  const [subjects, setSubjects] = useState([
    { name: '', fullMarks: 100, obtainedMarks: 0, grade: '' }
  ]);

  const form = useForm<MarksheetFormData>({
    resolver: zodResolver(marksheetSchema),
    defaultValues: {
      studentName: '',
      studentNameBn: '',
      rollNumber: '',
      className: '',
      session: '',
      examName: '',
      subjects: subjects,
      instituteName: '',
      instituteAddress: '',
    },
  });

  const addSubject = () => {
    setSubjects([...subjects, { name: '', fullMarks: 100, obtainedMarks: 0, grade: '' }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      const newSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(newSubjects);
    }
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
  };

  const calculateGrade = (obtained: number, full: number) => {
    const percentage = (obtained / full) * 100;
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'A-';
    if (percentage >= 50) return 'B';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  };

  const onSubmit = (data: MarksheetFormData) => {
    const dataWithSubjects = { ...data, subjects };
    setFormData(dataWithSubjects);
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      setPreviewMode(true);
    }
  };

  const stepOneForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="studentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter student name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="studentNameBn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ছাত্র/ছাত্রীর নাম (বাংলা)</FormLabel>
                <FormControl>
                  <Input placeholder="বাংলায় নাম লিখুন" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rollNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Roll Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter roll number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="className"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Six">Class 6</SelectItem>
                    <SelectItem value="Seven">Class 7</SelectItem>
                    <SelectItem value="Eight">Class 8</SelectItem>
                    <SelectItem value="Nine">Class 9</SelectItem>
                    <SelectItem value="Ten">Class 10</SelectItem>
                    <SelectItem value="Eleven">Class 11</SelectItem>
                    <SelectItem value="Twelve">Class 12</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="examName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., First Terminal Exam" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="session"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2024-2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instituteName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institute Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter institute name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instituteAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institute Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter institute address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full">
          Next: Add Subjects →
        </Button>
      </form>
    </Form>
  );

  const stepTwoForm = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Add Subjects and Marks</h3>
        <Button type="button" onClick={addSubject} variant="outline" size="sm">
          + Add Subject
        </Button>
      </div>

      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <Label>Subject Name</Label>
                <Input
                  value={subject.name}
                  onChange={(e) => updateSubject(index, 'name', e.target.value)}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <Label>Full Marks</Label>
                <Input
                  type="number"
                  value={subject.fullMarks}
                  onChange={(e) => updateSubject(index, 'fullMarks', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Obtained Marks</Label>
                <Input
                  type="number"
                  value={subject.obtainedMarks}
                  onChange={(e) => {
                    const obtained = parseInt(e.target.value) || 0;
                    updateSubject(index, 'obtainedMarks', obtained);
                    updateSubject(index, 'grade', calculateGrade(obtained, subject.fullMarks));
                  }}
                />
              </div>
              <div>
                <Label>Grade</Label>
                <Input
                  value={subject.grade}
                  onChange={(e) => updateSubject(index, 'grade', e.target.value)}
                  placeholder="Auto-calculated"
                />
              </div>
              <div>
                {subjects.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSubject(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
          ← Back
        </Button>
        <Button 
          type="button" 
          onClick={() => onSubmit(form.getValues())} 
          className="flex-1"
          disabled={subjects.some(s => !s.name || !s.grade)}
        >
          Generate Marksheet →
        </Button>
      </div>
    </div>
  );

  const previewComponent = formData ? <MarksheetPreview data={formData} /> : null;

  return (
    <DocumentPageTemplate
      documentType="Marksheet"
      documentTypeBn="নম্বরপত্র"
      documentTypeAr="كشف درجات"
      stepOneForm={stepOneForm}
      stepTwoForm={stepTwoForm}
      previewComponent={previewComponent}
    >
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-gray-600">
            <li>• Fill student information carefully</li>
            <li>• Add all subjects with correct marks</li>
            <li>• Grades are auto-calculated based on percentage</li>
            <li>• Verify all information before generating</li>
          </ul>
        </CardContent>
      </Card>
    </DocumentPageTemplate>
  );
}