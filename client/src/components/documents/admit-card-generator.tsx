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

const admitCardSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentNameBn: z.string().min(1, 'বাংলা নাম আবশ্যক'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  className: z.string().min(1, 'Class is required'),
  examName: z.string().min(1, 'Exam name is required'),
  examDate: z.string().min(1, 'Exam date is required'),
  examTime: z.string().min(1, 'Exam time is required'),
  examCenter: z.string().min(1, 'Exam center is required'),
  session: z.string().min(1, 'Session is required'),
  studentPhoto: z.string().optional(),
  signature: z.string().optional(),
});

type AdmitCardFormData = z.infer<typeof admitCardSchema>;

interface AdmitCardPreviewProps {
  data: AdmitCardFormData;
}

function AdmitCardPreview({ data }: AdmitCardPreviewProps) {
  return (
    <div className="bg-white p-8 border-2 border-gray-300 rounded-lg shadow-lg max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">প্রবেশপত্র / ADMIT CARD</h1>
        <h2 className="text-lg font-semibold text-gray-700">{data.examName}</h2>
        <p className="text-sm text-gray-600">Session: {data.session}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Student Photo */}
        <div className="col-span-1">
          <div className="w-full h-32 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-gray-50">
            {data.studentPhoto ? (
              <img src={data.studentPhoto} alt="Student" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-gray-500 text-sm">Student Photo</span>
            )}
          </div>
        </div>

        {/* Student Details */}
        <div className="col-span-2 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Student Name:</Label>
              <p className="text-lg font-medium">{data.studentName}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">ছাত্র/ছাত্রীর নাম:</Label>
              <p className="text-lg font-medium">{data.studentNameBn}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
      </div>

      {/* Exam Details */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Examination Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Exam Date:</Label>
            <p className="text-base font-medium">{data.examDate}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Exam Time:</Label>
            <p className="text-base font-medium">{data.examTime}</p>
          </div>
          <div className="col-span-2">
            <Label className="text-sm font-semibold text-gray-700">Exam Center:</Label>
            <p className="text-base font-medium">{data.examCenter}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <h4 className="font-semibold text-gray-800 mb-2">Instructions / নির্দেশনা:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• This admit card must be brought to the examination hall</li>
          <li>• পরীক্ষার হলে এই প্রবেশপত্র আনা বাধ্যতামূলক</li>
          <li>• Students must carry a valid photo ID</li>
          <li>• Mobile phones are strictly prohibited in the exam hall</li>
        </ul>
      </div>

      {/* Signature Section */}
      <div className="mt-6 flex justify-between items-end">
        <div className="text-center">
          <div className="w-32 h-16 border-b border-gray-400 mb-2">
            {data.signature && (
              <img src={data.signature} alt="Signature" className="w-full h-full object-contain" />
            )}
          </div>
          <p className="text-sm text-gray-600">Student Signature</p>
        </div>
        <div className="text-center">
          <div className="w-32 h-16 border-b border-gray-400 mb-2"></div>
          <p className="text-sm text-gray-600">Principal's Signature</p>
        </div>
      </div>
    </div>
  );
}

export function AdmitCardGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<AdmitCardFormData | null>(null);

  const form = useForm<AdmitCardFormData>({
    resolver: zodResolver(admitCardSchema),
    defaultValues: {
      studentName: '',
      studentNameBn: '',
      rollNumber: '',
      className: '',
      examName: '',
      examDate: '',
      examTime: '',
      examCenter: '',
      session: '',
      studentPhoto: '',
      signature: '',
    },
  });

  const onSubmit = (data: AdmitCardFormData) => {
    setFormData(data);
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
        </div>
        
        <Button type="submit" className="w-full">
          Next Step →
        </Button>
      </form>
    </Form>
  );

  const stepTwoForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="examDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="examTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Time</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 10:00 AM - 1:00 PM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="examCenter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Center</FormLabel>
                <FormControl>
                  <Input placeholder="Enter exam center name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="studentPhoto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student Photo URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Paste image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="signature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student Signature URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Paste signature image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
            ← Back
          </Button>
          <Button type="submit" className="flex-1">
            Generate Preview →
          </Button>
        </div>
      </form>
    </Form>
  );

  const previewComponent = formData ? <AdmitCardPreview data={formData} /> : null;

  return (
    <DocumentPageTemplate
      documentType="Admit Card"
      documentTypeBn="প্রবেশপত্র"
      documentTypeAr="بطاقة دخول"
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
            <li>• Fill all required student information</li>
            <li>• Double-check roll number and exam details</li>
            <li>• Add student photo for better identification</li>
            <li>• Verify exam date and time before printing</li>
          </ul>
        </CardContent>
      </Card>
    </DocumentPageTemplate>
  );
}