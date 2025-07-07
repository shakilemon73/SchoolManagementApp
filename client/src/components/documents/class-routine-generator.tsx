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

const periodSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  teacher: z.string().min(1, 'Teacher is required'),
  room: z.string().optional(),
});

const classRoutineSchema = z.object({
  className: z.string().min(1, 'Class name is required'),
  section: z.string().min(1, 'Section is required'),
  session: z.string().min(1, 'Session is required'),
  instituteName: z.string().min(1, 'Institute name is required'),
  instituteAddress: z.string().min(1, 'Institute address is required'),
  classTeacher: z.string().min(1, 'Class teacher is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
});

type ClassRoutineFormData = z.infer<typeof classRoutineSchema>;

interface ClassRoutinePreviewProps {
  data: ClassRoutineFormData;
  schedule: { [key: string]: { [key: string]: typeof periodSchema._type } };
}

function ClassRoutinePreview({ data, schedule }: ClassRoutinePreviewProps) {
  const timeSlots = [
    '08:00-08:45', '08:45-09:30', '09:30-10:15', '10:15-10:30', 
    '10:30-11:15', '11:15-12:00', '12:00-12:45', '12:45-01:30', '01:30-02:15'
  ];
  
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  return (
    <div className="bg-white p-8 border-2 border-gray-300 rounded-lg shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{data.instituteName}</h1>
        <p className="text-sm text-gray-600 mb-4">{data.instituteAddress}</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Class Routine / ক্লাস রুটিন</h2>
        <div className="flex justify-center gap-8 text-sm">
          <div><strong>Class:</strong> {data.className}</div>
          <div><strong>Section:</strong> {data.section}</div>
          <div><strong>Session:</strong> {data.session}</div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Effective from: {data.effectiveDate}</p>
      </div>

      {/* Class Information */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-blue-800">Class Teacher:</Label>
            <p className="text-base font-medium">{data.classTeacher}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-blue-800">Total Classes:</Label>
            <p className="text-base font-medium">{data.className} - {data.section}</p>
          </div>
        </div>
      </div>

      {/* Routine Table */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse border-2 border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-3 py-2 text-center font-bold text-sm">
                Day / দিন
              </th>
              {timeSlots.map((time, index) => (
                <th key={index} className="border border-gray-400 px-2 py-2 text-center text-xs font-semibold">
                  {index === 3 ? (
                    <div className="bg-yellow-100 p-1 rounded">
                      <div>Break</div>
                      <div className="text-xs">বিরতি</div>
                    </div>
                  ) : (
                    <div>
                      <div>{time}</div>
                      <div className="text-xs">Period {index > 3 ? index : index + 1}</div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="hover:bg-gray-50">
                <td className="border border-gray-400 px-3 py-3 font-semibold text-center bg-gray-100">
                  <div>{day}</div>
                  <div className="text-xs text-gray-600">
                    {day === 'Saturday' && 'শনিবার'}
                    {day === 'Sunday' && 'রবিবার'}
                    {day === 'Monday' && 'সোমবার'}
                    {day === 'Tuesday' && 'মঙ্গলবার'}
                    {day === 'Wednesday' && 'বুধবার'}
                    {day === 'Thursday' && 'বৃহস্পতিবার'}
                  </div>
                </td>
                {timeSlots.map((time, index) => (
                  <td key={`${day}-${time}`} className="border border-gray-400 px-2 py-3 text-center text-xs">
                    {index === 3 ? (
                      <div className="bg-yellow-100 p-2 rounded text-yellow-800 font-semibold">
                        BREAK
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {schedule[day] && schedule[day][time] ? (
                          <>
                            <div className="font-semibold text-blue-800">
                              {schedule[day][time].subject}
                            </div>
                            <div className="text-gray-600">
                              {schedule[day][time].teacher}
                            </div>
                            {schedule[day][time].room && (
                              <div className="text-gray-500 text-xs">
                                Room: {schedule[day][time].room}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-400">Free</div>
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
        <h4 className="font-semibold text-green-800 mb-2">Instructions / নির্দেশনা:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Students must attend all classes as per routine</li>
          <li>• ছাত্র-ছাত্রীরা রুটিন অনুযায়ী সকল ক্লাসে উপস্থিত থাকতে হবে</li>
          <li>• Any changes will be notified separately</li>
          <li>• কোন পরিবর্তন হলে আলাদাভাবে জানানো হবে</li>
          <li>• Contact class teacher for any queries</li>
        </ul>
      </div>

      {/* Footer with Signatures */}
      <div className="flex justify-between items-center pt-6 border-t-2 border-gray-300">
        <div className="text-center">
          <div className="w-40 h-16 border-b border-gray-400 mb-2"></div>
          <p className="text-sm text-gray-600">Class Teacher</p>
          <p className="text-xs text-gray-500">শ্রেণি শিক্ষক</p>
        </div>
        <div className="text-center">
          <div className="w-40 h-16 border-b border-gray-400 mb-2"></div>
          <p className="text-sm text-gray-600">Academic Coordinator</p>
          <p className="text-xs text-gray-500">একাডেমিক সমন্বয়কারী</p>
        </div>
        <div className="text-center">
          <div className="w-40 h-16 border-b border-gray-400 mb-2"></div>
          <p className="text-sm text-gray-600">Principal</p>
          <p className="text-xs text-gray-500">প্রধান শিক্ষক</p>
        </div>
      </div>

      {/* Generated Info */}
      <div className="text-center mt-6 text-xs text-gray-500">
        <p>Generated on: {new Date().toLocaleDateString()} | This is a computer-generated routine</p>
        <p>তৈরির তারিখ: {new Date().toLocaleDateString()} | এটি একটি কম্পিউটার-উৎপন্ন রুটিন</p>
      </div>
    </div>
  );
}

export function ClassRoutineGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<ClassRoutineFormData | null>(null);
  const [schedule, setSchedule] = useState<{ [key: string]: { [key: string]: typeof periodSchema._type } }>({});

  const form = useForm<ClassRoutineFormData>({
    resolver: zodResolver(classRoutineSchema),
    defaultValues: {
      className: '',
      section: '',
      session: '',
      instituteName: '',
      instituteAddress: '',
      classTeacher: '',
      effectiveDate: '',
    },
  });

  const timeSlots = [
    '08:00-08:45', '08:45-09:30', '09:30-10:15', '10:15-10:30', 
    '10:30-11:15', '11:15-12:00', '12:00-12:45', '12:45-01:30', '01:30-02:15'
  ];
  
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  
  const subjects = [
    'Mathematics', 'English', 'Bangla', 'Science', 'Social Studies', 
    'Religious Studies', 'Physical Education', 'Computer Science', 
    'Art & Craft', 'Music', 'Physics', 'Chemistry', 'Biology'
  ];

  const updateSchedule = (day: string, time: string, field: string, value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: {
          ...prev[day]?.[time],
          [field]: value
        }
      }
    }));
  };

  const onSubmit = (data: ClassRoutineFormData) => {
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
            name="section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
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

          <FormField
            control={form.control}
            name="session"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Session</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2024-2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classTeacher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Teacher</FormLabel>
                <FormControl>
                  <Input placeholder="Enter class teacher name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effective Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
          Next: Create Schedule →
        </Button>
      </form>
    </Form>
  );

  const stepTwoForm = (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Create Class Schedule</h3>
        <p className="text-sm text-gray-600">Fill in subjects and teachers for each time slot</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2">Day</th>
              {timeSlots.map((time, index) => (
                <th key={index} className="border border-gray-300 px-2 py-2 text-xs">
                  {index === 3 ? 'Break' : time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">
                  {day}
                </td>
                {timeSlots.map((time, index) => (
                  <td key={`${day}-${time}`} className="border border-gray-300 px-1 py-1">
                    {index === 3 ? (
                      <div className="text-center text-xs text-gray-500 p-2">Break</div>
                    ) : (
                      <div className="space-y-1">
                        <Select
                          onValueChange={(value) => updateSchedule(day, time, 'subject', value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Teacher"
                          className="h-8 text-xs"
                          onChange={(e) => updateSchedule(day, time, 'teacher', e.target.value)}
                        />
                        <Input
                          placeholder="Room"
                          className="h-8 text-xs"
                          onChange={(e) => updateSchedule(day, time, 'room', e.target.value)}
                        />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
          ← Back
        </Button>
        <Button 
          type="button" 
          onClick={() => onSubmit(form.getValues())} 
          className="flex-1"
        >
          Generate Routine →
        </Button>
      </div>
    </div>
  );

  const previewComponent = formData ? <ClassRoutinePreview data={formData} schedule={schedule} /> : null;

  return (
    <DocumentPageTemplate
      documentType="Class Routine"
      documentTypeBn="ক্লাস রুটিন"
      documentTypeAr="جدول الحصص"
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
            <li>• Fill class information first</li>
            <li>• Add subjects for each time slot</li>
            <li>• Include teacher names and room numbers</li>
            <li>• Break time is automatically set</li>
          </ul>
        </CardContent>
      </Card>
    </DocumentPageTemplate>
  );
}