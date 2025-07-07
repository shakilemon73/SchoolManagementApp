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
import { Textarea } from '@/components/ui/textarea';
import { DocumentPageTemplate } from './DocumentPageTemplate';

const certificateSchema = z.object({
  certificateType: z.string().min(1, 'Certificate type is required'),
  studentName: z.string().min(1, 'Student name is required'),
  studentNameBn: z.string().min(1, 'বাংলা নাম আবশ্যক'),
  fatherName: z.string().min(1, 'Father name is required'),
  motherName: z.string().min(1, 'Mother name is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  className: z.string().min(1, 'Class is required'),
  session: z.string().min(1, 'Session is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  instituteName: z.string().min(1, 'Institute name is required'),
  instituteAddress: z.string().min(1, 'Institute address is required'),
  reasonForLeaving: z.string().optional(),
  characterRemarks: z.string().optional(),
  academicPerformance: z.string().optional(),
  issueDate: z.string().min(1, 'Issue date is required'),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

interface CertificatePreviewProps {
  data: CertificateFormData;
}

function CertificatePreview({ data }: CertificatePreviewProps) {
  const getCertificateTitle = () => {
    switch (data.certificateType) {
      case 'transfer': return 'Transfer Certificate / স্থানান্তর সনদ';
      case 'character': return 'Character Certificate / চরিত্র সনদ';
      case 'leaving': return 'Leaving Certificate / ত্যাগপত্র';
      case 'testimonial': return 'Testimonial / প্রশংসাপত্র';
      case 'attendance': return 'Attendance Certificate / উপস্থিতি সনদ';
      case 'merit': return 'Merit Certificate / মেধা সনদ';
      default: return 'Certificate / সনদ';
    }
  };

  const getBorderDesign = () => {
    return (
      <div className="absolute inset-4 border-4 border-double border-blue-600 rounded-lg">
        <div className="absolute inset-2 border-2 border-blue-400 rounded-lg"></div>
        <div className="absolute top-6 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
      </div>
    );
  };

  return (
    <div className="bg-white relative min-h-[800px] max-w-4xl mx-auto shadow-2xl">
      {getBorderDesign()}
      
      <div className="relative z-10 p-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">LOGO</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">{data.instituteName}</h1>
          <p className="text-lg text-gray-600 mb-6">{data.instituteAddress}</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 border-b-2 border-blue-600 inline-block pb-2">
            {getCertificateTitle()}
          </h2>
        </div>

        {/* Certificate Content */}
        <div className="space-y-6 text-justify leading-relaxed">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">
              Certificate No: ________ &nbsp;&nbsp;&nbsp;&nbsp; Date: {data.issueDate}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-base">
              This is to certify that <strong className="text-blue-800 text-lg">{data.studentName}</strong> 
              {data.studentNameBn && <span> (<strong>{data.studentNameBn}</strong>)</span>}, 
              son/daughter of <strong>{data.fatherName}</strong> and <strong>{data.motherName}</strong>, 
              was a bonafide student of this institution.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Roll Number:</strong> {data.rollNumber}</div>
                <div><strong>Class:</strong> {data.className}</div>
                <div><strong>Session:</strong> {data.session}</div>
                <div><strong>Date of Birth:</strong> {data.dateOfBirth}</div>
                <div><strong>Admission Date:</strong> {data.admissionDate}</div>
                <div><strong>Issue Date:</strong> {data.issueDate}</div>
              </div>
            </div>

            {data.certificateType === 'character' && (
              <p className="text-base">
                During his/her stay in this institution, his/her character and conduct were found to be 
                <strong className="text-green-700"> excellent</strong>. 
                {data.characterRemarks && <span> {data.characterRemarks}</span>}
              </p>
            )}

            {data.certificateType === 'transfer' && (
              <p className="text-base">
                He/She is now leaving this institution {data.reasonForLeaving && `due to ${data.reasonForLeaving}`}. 
                During his/her stay, he/she maintained good discipline and showed satisfactory academic progress.
              </p>
            )}

            {data.certificateType === 'leaving' && (
              <p className="text-base">
                This certificate is issued on his/her request for leaving the institution. 
                {data.reasonForLeaving && <span> Reason for leaving: {data.reasonForLeaving}.</span>}
                His/Her conduct and character were satisfactory throughout his/her academic career.
              </p>
            )}

            {data.certificateType === 'testimonial' && (
              <div className="space-y-3">
                <p className="text-base">
                  He/She was a regular and punctual student. His/Her academic performance was 
                  <strong className="text-blue-700"> {data.academicPerformance || 'satisfactory'}</strong>.
                </p>
                {data.characterRemarks && (
                  <p className="text-base italic bg-yellow-50 p-3 rounded">
                    "{data.characterRemarks}"
                  </p>
                )}
              </div>
            )}

            {data.certificateType === 'attendance' && (
              <p className="text-base">
                His/Her attendance record was <strong className="text-green-700">regular</strong> and 
                he/she actively participated in academic activities. This certificate is issued for 
                attendance verification purposes.
              </p>
            )}

            {data.certificateType === 'merit' && (
              <p className="text-base">
                This certificate is awarded in recognition of his/her 
                <strong className="text-gold-600"> outstanding academic performance</strong> and 
                exemplary conduct. He/She has consistently maintained high standards in studies and 
                extracurricular activities.
              </p>
            )}

            <p className="text-base">
              I wish him/her all success in his/her future endeavors.
            </p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 flex justify-between items-end">
          <div className="text-center">
            <div className="w-40 h-20 border-b-2 border-gray-400 mb-3"></div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Class Teacher</p>
              <p className="text-xs text-gray-600">শ্রেণি শিক্ষক</p>
              <p className="text-xs">Date: _______</p>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-2 border-gray-400 mb-4 flex items-center justify-center mx-auto">
              <span className="text-xs text-gray-500">SEAL</span>
            </div>
            <p className="text-xs text-gray-600">Official Seal</p>
          </div>

          <div className="text-center">
            <div className="w-40 h-20 border-b-2 border-gray-400 mb-3"></div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Principal</p>
              <p className="text-xs text-gray-600">প্রধান শিক্ষক</p>
              <p className="text-xs">Date: _______</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="border-t border-gray-300 pt-4">
            <p className="text-xs text-gray-500">
              This certificate is issued based on school records. Any alteration will make it invalid.
            </p>
            <p className="text-xs text-gray-500">
              এই সনদটি স্কুলের রেকর্ড অনুযায়ী প্রদান করা হয়েছে। কোন পরিবর্তন এটিকে অবৈধ করে দেবে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificateGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<CertificateFormData | null>(null);

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificateType: '',
      studentName: '',
      studentNameBn: '',
      fatherName: '',
      motherName: '',
      rollNumber: '',
      className: '',
      session: '',
      dateOfBirth: '',
      admissionDate: '',
      instituteName: '',
      instituteAddress: '',
      reasonForLeaving: '',
      characterRemarks: '',
      academicPerformance: '',
      issueDate: '',
    },
  });

  const onSubmit = (data: CertificateFormData) => {
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
        <FormField
          control={form.control}
          name="certificateType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificate Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select certificate type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="transfer">Transfer Certificate</SelectItem>
                  <SelectItem value="character">Character Certificate</SelectItem>
                  <SelectItem value="leaving">Leaving Certificate</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="attendance">Attendance Certificate</SelectItem>
                  <SelectItem value="merit">Merit Certificate</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter father's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="motherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mother's name" {...field} />
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
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="admissionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admission Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full">
          Next: Institute Details →
        </Button>
      </form>
    </Form>
  );

  const stepTwoForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
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
                  <Textarea placeholder="Enter institute address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(form.watch('certificateType') === 'transfer' || form.watch('certificateType') === 'leaving') && (
            <FormField
              control={form.control}
              name="reasonForLeaving"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Leaving (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter reason for leaving" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(form.watch('certificateType') === 'character' || form.watch('certificateType') === 'testimonial') && (
            <FormField
              control={form.control}
              name="characterRemarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Character Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter character remarks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {form.watch('certificateType') === 'testimonial' && (
            <FormField
              control={form.control}
              name="academicPerformance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Performance</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select performance level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="outstanding">Outstanding</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="very good">Very Good</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="satisfactory">Satisfactory</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
            ← Back
          </Button>
          <Button type="submit" className="flex-1">
            Generate Certificate →
          </Button>
        </div>
      </form>
    </Form>
  );

  const previewComponent = formData ? <CertificatePreview data={formData} /> : null;

  return (
    <DocumentPageTemplate
      documentType="Certificate"
      documentTypeBn="সনদ"
      documentTypeAr="شهادة"
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
            <li>• Choose the appropriate certificate type</li>
            <li>• Fill all student details accurately</li>
            <li>• Add specific remarks where applicable</li>
            <li>• Verify all dates before generating</li>
          </ul>
        </CardContent>
      </Card>
    </DocumentPageTemplate>
  );
}