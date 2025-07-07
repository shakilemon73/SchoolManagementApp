import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Upload, X, Camera, FileText } from 'lucide-react';

interface BanglaAdmitCardData {
  // Header Information
  boardName: string;
  boardNameBn: string;
  examType: string;
  examTypeBn: string;
  examYear: string;
  cardType: string;
  cardTypeBn: string;
  
  // Student Information
  studentName: string;
  studentNameBn: string;
  fatherName: string;
  fatherNameBn: string;
  motherName: string;
  motherNameBn: string;
  rollNumber: string;
  registrationNumber: string;
  
  // Institutional Information
  instituteName: string;
  instituteNameBn: string;
  instituteCode: string;
  centerName: string;
  centerNameBn: string;
  centerCode: string;
  
  // Subject and Academic Information
  groupName: string;
  groupNameBn: string;
  sessionYear: string;
  
  // Examination Details
  examDate: string;
  examTime: string;
  reportingTime: string;
  
  // Special Instructions
  instructions: string;
  instructionsBn: string;
  
  // Signature and Authority
  authorityName: string;
  authorityNameBn: string;
  designation: string;
  designationBn: string;
  
  // Additional Fields
  photoUrl?: string;
  signatureUrl?: string;
  serialNumber?: string;
  
  // Subject Information
  subjects: string[];
  subjectsBn: string[];
  
  // File uploads
  photoFile?: File;
  signatureFile?: File;
}

const BanglaAdmitCardTemplate = ({ data }: { data: BanglaAdmitCardData }) => {
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white p-8 mx-auto border-2 border-gray-300 shadow-2xl relative overflow-hidden" style={{ fontFamily: 'SutonnyMJ, Arial, sans-serif' }}>
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 opacity-30"></div>
      
      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-red-600"></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-green-600"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-green-600"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-red-600"></div>
      
      {/* Background Pattern */}
      <div className="relative">
        {/* Elegant Watermark */}
        <div className="absolute inset-0 opacity-8 flex items-center justify-center">
          <div className="text-6xl font-bold text-gray-200 transform rotate-45 tracking-wider">
            {data.boardNameBn}
          </div>
        </div>
        
        {/* Premium Header Section */}
        <div className="text-center mb-8 relative z-10">
          {/* Bangladesh Flag Colors Strip */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-2 bg-red-600"></div>
            <div className="w-4 h-2 bg-green-600"></div>
            <div className="w-24 h-2 bg-red-600"></div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 rounded-lg shadow-lg border-2 border-gold-400 relative">
            {/* Golden Border Effect */}
            <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg transform translate-x-1 translate-y-1 -z-10 opacity-30"></div>
            
            <h1 className="text-3xl font-bold mb-3 text-shadow-lg tracking-wide">{data.boardNameBn}</h1>
            <h2 className="text-xl font-semibold mb-2 text-blue-100">{data.examTypeBn}</h2>
            <h3 className="text-lg mb-3 font-medium text-blue-200">{data.examYear}</h3>
            
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-8 inline-block font-bold text-xl rounded-full shadow-lg border-2 border-white transform hover:scale-105 transition-transform">
              {data.cardTypeBn}
            </div>
          </div>
        </div>

        {/* Premium Serial and Roll Number Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-400 p-4 rounded-lg shadow-md">
            <span className="font-bold text-gray-700">ক্রমিক নং: </span>
            <span className="ml-2 border-b-2 border-dotted border-blue-500 px-6 py-1 bg-white font-semibold text-lg">{data.serialNumber || '___'}</span>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-400 p-4 rounded-lg shadow-md">
            <span className="font-bold text-blue-800">রোল নং: </span>
            <span className="ml-2 border-b-2 border-dotted border-red-500 px-8 py-1 bg-white text-2xl font-bold text-red-700">{data.rollNumber}</span>
          </div>
        </div>

        {/* Premium Main Content Section */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Left Column - Student Information */}
          <div className="col-span-8 bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="space-y-5">
              {/* Student Name - Featured */}
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center">
                  <span className="w-36 font-bold text-blue-800 text-sm">পরীক্ষার্থীর নাম:</span>
                  <span className="flex-1 border-b-2 border-dotted border-blue-400 px-3 py-2 font-bold text-xl text-gray-900 bg-blue-50">
                    {data.studentNameBn}
                  </span>
                </div>
              </div>

              {/* Father's Name */}
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                <span className="w-36 font-semibold text-gray-700 text-sm">পিতার নাম:</span>
                <span className="flex-1 border-b border-dotted border-gray-400 px-3 py-1 text-gray-800 bg-gray-50">
                  {data.fatherNameBn}
                </span>
              </div>

              {/* Mother's Name */}
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                <span className="w-36 font-semibold text-gray-700 text-sm">মাতার নাম:</span>
                <span className="flex-1 border-b border-dotted border-gray-400 px-3 py-1 text-gray-800 bg-gray-50">
                  {data.motherNameBn}
                </span>
              </div>

              {/* Registration Number */}
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm border-l-4 border-green-500">
                <span className="w-36 font-semibold text-green-700 text-sm">রেজিস্ট্রেশন নং:</span>
                <span className="flex-1 border-b border-dotted border-green-400 px-3 py-1 font-bold text-gray-900 bg-green-50">
                  {data.registrationNumber}
                </span>
              </div>

              {/* Group */}
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                <span className="w-36 font-semibold text-gray-700 text-sm">শাখা/বিভাগ:</span>
                <span className="flex-1 border-b border-dotted border-gray-400 px-3 py-1 text-gray-800 bg-gray-50 font-medium">
                  {data.groupNameBn}
                </span>
              </div>

              {/* Session */}
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                <span className="w-36 font-semibold text-gray-700 text-sm">শিক্ষাবর্ষ:</span>
                <span className="flex-1 border-b border-dotted border-gray-400 px-3 py-1 text-gray-800 bg-gray-50">
                  {data.sessionYear}
                </span>
              </div>

              {/* Institute Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-3 text-sm">প্রতিষ্ঠানের তথ্য</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-32 font-semibold text-purple-700 text-sm">প্রতিষ্ঠানের নাম:</span>
                    <span className="flex-1 border-b border-dotted border-purple-300 px-2 py-1 text-gray-800 bg-white rounded text-sm">
                      {data.instituteNameBn}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 font-semibold text-purple-700 text-sm">প্রতিষ্ঠান কোড:</span>
                    <span className="flex-1 border-b border-dotted border-purple-300 px-2 py-1 font-bold text-gray-900 bg-white rounded text-sm">
                      {data.instituteCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Information */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-bold text-orange-800 mb-3 text-sm">পরীক্ষা কেন্দ্রের তথ্য</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-32 font-semibold text-orange-700 text-sm">কেন্দ্রের নাম:</span>
                    <span className="flex-1 border-b border-dotted border-orange-300 px-2 py-1 text-gray-800 bg-white rounded text-sm">
                      {data.centerNameBn}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 font-semibold text-orange-700 text-sm">কেন্দ্র কোড:</span>
                    <span className="flex-1 border-b border-dotted border-orange-300 px-2 py-1 font-bold text-gray-900 bg-white rounded text-sm">
                      {data.centerCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Subjects Display */}
              {data.subjectsBn && data.subjectsBn.length > 0 && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                  <h4 className="font-bold text-teal-800 mb-3 text-sm">পরীক্ষার বিষয়সমূহ</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {data.subjectsBn.map((subject, index) => (
                      <div key={index} className="flex items-center bg-white p-2 rounded shadow-sm">
                        <span className="w-6 text-center font-bold text-teal-700 text-xs">{index + 1}.</span>
                        <span className="flex-1 text-gray-800 text-sm">{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Premium Photo and Signature */}
          <div className="col-span-4 space-y-6">
            {/* Premium Photo Frame */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-xl shadow-lg border border-gray-300">
                <div className="border-4 border-yellow-400 bg-white h-40 w-32 mx-auto flex items-center justify-center relative overflow-hidden shadow-inner">
                  {/* Decorative corners */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-yellow-600"></div>
                  <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-yellow-600"></div>
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-yellow-600"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-yellow-600"></div>
                  
                  {data.photoUrl ? (
                    <img src={data.photoUrl} alt="Student Photo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-2xl mb-1">📷</div>
                      <span className="text-xs font-medium">ছবি</span>
                    </div>
                  )}
                </div>
                <div className="text-center mt-3">
                  <div className="text-xs font-bold text-gray-700 bg-gradient-to-r from-yellow-100 to-yellow-200 px-3 py-1 rounded-full shadow-sm border border-yellow-300">পরীক্ষার্থীর ছবি</div>
                </div>
              </div>
            </div>

            {/* Premium Signature Frame */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-lg border border-blue-200">
                <div className="border-3 border-blue-400 bg-white h-20 w-32 mx-auto flex items-center justify-center relative overflow-hidden shadow-inner">
                  {data.signatureUrl ? (
                    <img src={data.signatureUrl} alt="Student Signature" className="h-full w-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-lg mb-1">✍️</div>
                      <span className="text-xs font-medium">স্বাক্ষর</span>
                    </div>
                  )}
                </div>
                <div className="text-center mt-3">
                  <div className="text-xs font-bold text-blue-700 bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1 rounded-full shadow-sm border border-blue-300">পরীক্ষার্থীর স্বাক্ষর</div>
                </div>
              </div>
            </div>

            {/* Premium QR Code Section */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-lg border border-green-200">
                <div className="border-2 border-green-400 bg-white h-20 w-20 mx-auto flex items-center justify-center shadow-inner">
                  <div className="text-center text-gray-400">
                    <div className="text-sm mb-1">⬜</div>
                    <span className="text-xs font-medium">QR</span>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <div className="text-xs font-bold text-green-700 bg-gradient-to-r from-green-100 to-green-200 px-3 py-1 rounded-full shadow-sm border border-green-300">যাচাই কোড</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Schedule */}
        <div className="border-2 border-gray-800 p-4 mb-6">
          <h4 className="font-bold text-center mb-3 text-lg">পরীক্ষার তারিখ ও সময়</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="font-semibold">পরীক্ষার তারিখ:</span>
              <div className="border-b border-dotted border-gray-600 mt-1 py-1 font-bold">
                {data.examDate}
              </div>
            </div>
            <div>
              <span className="font-semibold">পরীক্ষার সময়:</span>
              <div className="border-b border-dotted border-gray-600 mt-1 py-1 font-bold">
                {data.examTime}
              </div>
            </div>
            <div>
              <span className="font-semibold">উপস্থিতির সময়:</span>
              <div className="border-b border-dotted border-gray-600 mt-1 py-1 font-bold">
                {data.reportingTime}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="border border-gray-600 p-4 mb-6">
          <h4 className="font-bold mb-2">নির্দেশনা:</h4>
          <div className="text-sm space-y-1">
            <p>১. পরীক্ষার দিন অবশ্যই এই প্রবেশপত্র সাথে আনতে হবে।</p>
            <p>২. নির্ধারিত সময়ের ৩০ মিনিট পূর্বে পরীক্ষা কেন্দ্রে উপস্থিত হতে হবে।</p>
            <p>৩. পরীক্ষার হলে মোবাইল ফোন ও অন্যান্য ইলেকট্রনিক যন্ত্র নিয়ে যাওয়া নিষেধ।</p>
            <p>৪. পরীক্ষার সময় কোনো প্রকার অসদুপায় অবলম্বন করা যাবে না।</p>
            {data.instructionsBn && (
              <p>৫. {data.instructionsBn}</p>
            )}
          </div>
        </div>

        {/* Footer with Authority Signature */}
        <div className="flex justify-between items-end">
          <div className="text-left">
            <p className="text-sm">প্রকাশের তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-600 pt-2 w-48">
              <p className="font-semibold">{data.authorityNameBn}</p>
              <p className="text-sm">{data.designationBn}</p>
              <p className="text-sm">{data.boardNameBn}</p>
            </div>
          </div>
        </div>

        {/* Bottom Border Design */}
        <div className="mt-6 border-t-2 border-gray-800 pt-2">
          <div className="flex justify-center">
            <div className="w-16 h-1 bg-red-600"></div>
            <div className="w-4 h-1 bg-green-600 mx-1"></div>
            <div className="w-16 h-1 bg-red-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BanglaTemplateGenerator() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<BanglaAdmitCardData>({
    boardName: 'Board of Intermediate and Secondary Education',
    boardNameBn: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড',
    examType: 'Higher Secondary Certificate Examination',
    examTypeBn: 'উচ্চ মাধ্যমিক সার্টিফিকেট পরীক্ষা',
    examYear: '২০২৪',
    cardType: 'Admit Card',
    cardTypeBn: 'প্রবেশপত্র',
    studentName: '',
    studentNameBn: '',
    fatherName: '',
    fatherNameBn: '',
    motherName: '',
    motherNameBn: '',
    rollNumber: '',
    registrationNumber: '',
    instituteName: '',
    instituteNameBn: '',
    instituteCode: '',
    centerName: '',
    centerNameBn: '',
    centerCode: '',
    groupName: '',
    groupNameBn: '',
    sessionYear: '২০২২-২৪',
    examDate: '',
    examTime: '',
    reportingTime: '',
    instructions: '',
    instructionsBn: '',
    authorityName: '',
    authorityNameBn: '',
    designation: '',
    designationBn: '',
    subjects: [],
    subjectsBn: []
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Available subjects for HSC
  const availableSubjects = [
    { english: 'Physics', bangla: 'পদার্থবিজ্ঞান' },
    { english: 'Chemistry', bangla: 'রসায়ন' },
    { english: 'Biology', bangla: 'জীববিজ্ঞান' },
    { english: 'Mathematics', bangla: 'গণিত' },
    { english: 'Higher Mathematics', bangla: 'উচ্চতর গণিত' },
    { english: 'Bangla', bangla: 'বাংলা' },
    { english: 'English', bangla: 'ইংরেজি' },
    { english: 'ICT', bangla: 'তথ্য ও যোগাযোগ প্রযুক্তি' },
    { english: 'Economics', bangla: 'অর্থনীতি' },
    { english: 'Civics', bangla: 'পৌরনীতি ও সুশাসন' },
    { english: 'Geography', bangla: 'ভূগোল' },
    { english: 'History', bangla: 'ইতিহাস' },
    { english: 'Islamic History', bangla: 'ইসলামের ইতিহাস' },
    { english: 'Psychology', bangla: 'মনোবিজ্ঞান' },
    { english: 'Logic', bangla: 'যুক্তিবিদ্যা' },
    { english: 'Accounting', bangla: 'হিসাববিজ্ঞান' },
    { english: 'Business Studies', bangla: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা' },
    { english: 'Finance', bangla: 'ফিন্যান্স, ব্যাংকিং ও বীমা' },
    { english: 'Production Management', bangla: 'উৎপাদন ব্যবস্থাপনা ও বিপণন' }
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          photoUrl: e.target?.result as string,
          photoFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          signatureUrl: e.target?.result as string,
          signatureFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubjectToggle = (subject: { english: string; bangla: string }, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          subjects: [...prev.subjects, subject.english],
          subjectsBn: [...prev.subjectsBn, subject.bangla]
        };
      } else {
        return {
          ...prev,
          subjects: prev.subjects.filter(s => s !== subject.english),
          subjectsBn: prev.subjectsBn.filter(s => s !== subject.bangla)
        };
      }
    });
  };

  const generateAdmitCard = useMutation({
    mutationFn: async (data: BanglaAdmitCardData) => {
      return apiRequest('/api/admit-cards/generate-single', {
        method: 'POST',
        body: JSON.stringify({
          studentName: data.studentName,
          studentNameBn: data.studentNameBn,
          rollNumber: data.rollNumber,
          registrationNumber: data.registrationNumber,
          className: data.groupName,
          section: '',
          examType: data.examType,
          examDate: data.examDate,
          customData: data
        })
      });
    },
    onSuccess: () => {
      toast({
        title: 'সফল',
        description: 'বাংলা প্রবেশপত্র সফলভাবে তৈরি হয়েছে'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admit-cards'] });
    },
    onError: () => {
      toast({
        title: 'ত্রুটি',
        description: 'প্রবেশপত্র তৈরি করতে সমস্যা হয়েছে',
        variant: 'destructive'
      });
    }
  });

  const handleInputChange = (field: keyof BanglaAdmitCardData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateAdmitCard.mutate(formData);
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">বাংলা প্রবেশপত্র জেনারেটর</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">কাস্টমাইজযোগ্য বাংলা প্রবেশপত্র তৈরি করুন</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>প্রবেশপত্রের তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Board Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">বোর্ড তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="boardNameBn">বোর্ডের নাম (বাংলা)</Label>
                      <Input
                        id="boardNameBn"
                        value={formData.boardNameBn}
                        onChange={(e) => handleInputChange('boardNameBn', e.target.value)}
                        placeholder="মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড"
                      />
                    </div>
                    <div>
                      <Label htmlFor="examTypeBn">পরীক্ষার ধরন (বাংলা)</Label>
                      <Input
                        id="examTypeBn"
                        value={formData.examTypeBn}
                        onChange={(e) => handleInputChange('examTypeBn', e.target.value)}
                        placeholder="উচ্চ মাধ্যমিক সার্টিফিকেট পরীক্ষা"
                      />
                    </div>
                    <div>
                      <Label htmlFor="examYear">পরীক্ষার বছর</Label>
                      <Input
                        id="examYear"
                        value={formData.examYear}
                        onChange={(e) => handleInputChange('examYear', e.target.value)}
                        placeholder="২০২৪"
                      />
                    </div>
                  </div>
                </div>

                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">শিক্ষার্থীর তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentNameBn">শিক্ষার্থীর নাম (বাংলা) *</Label>
                      <Input
                        id="studentNameBn"
                        value={formData.studentNameBn}
                        onChange={(e) => handleInputChange('studentNameBn', e.target.value)}
                        placeholder="মোহাম্মদ রহিম উদ্দিন"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rollNumber">রোল নম্বর *</Label>
                      <Input
                        id="rollNumber"
                        value={formData.rollNumber}
                        onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                        placeholder="১২৩৪৫৬"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="fatherNameBn">পিতার নাম (বাংলা)</Label>
                      <Input
                        id="fatherNameBn"
                        value={formData.fatherNameBn}
                        onChange={(e) => handleInputChange('fatherNameBn', e.target.value)}
                        placeholder="মোহাম্মদ করিম উদ্দিন"
                      />
                    </div>
                    <div>
                      <Label htmlFor="motherNameBn">মাতার নাম (বাংলা)</Label>
                      <Input
                        id="motherNameBn"
                        value={formData.motherNameBn}
                        onChange={(e) => handleInputChange('motherNameBn', e.target.value)}
                        placeholder="ফাতেমা খাতুন"
                      />
                    </div>
                    <div>
                      <Label htmlFor="registrationNumber">রেজিস্ট্রেশন নম্বর</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                        placeholder="১১০৭২৩৪৫৬৭"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo and Signature Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">ছবি ও স্বাক্ষর</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo Upload */}
                    <div className="space-y-3">
                      <Label>শিক্ষার্থীর ছবি</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {formData.photoUrl ? (
                          <div className="relative">
                            <img 
                              src={formData.photoUrl} 
                              alt="Student Photo" 
                              className="w-24 h-32 object-cover mx-auto border border-gray-400"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => setFormData(prev => ({ ...prev, photoUrl: '', photoFile: undefined }))}
                            >
                              <X className="w-4 h-4 mr-1" />
                              মুছে ফেলুন
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">ছবি আপলোড করুন</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => photoInputRef.current?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              ছবি নির্বাচন করুন
                            </Button>
                          </div>
                        )}
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </div>
                      <p className="text-xs text-gray-500">সর্বোচ্চ আকার: ২ এমবি। ফরম্যাট: JPG, PNG</p>
                    </div>

                    {/* Signature Upload */}
                    <div className="space-y-3">
                      <Label>শিক্ষার্থীর স্বাক্ষর</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {formData.signatureUrl ? (
                          <div className="relative">
                            <img 
                              src={formData.signatureUrl} 
                              alt="Student Signature" 
                              className="w-32 h-16 object-contain mx-auto border border-gray-400"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => setFormData(prev => ({ ...prev, signatureUrl: '', signatureFile: undefined }))}
                            >
                              <X className="w-4 h-4 mr-1" />
                              মুছে ফেলুন
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">স্বাক্ষর আপলোড করুন</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => signatureInputRef.current?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              স্বাক্ষর নির্বাচন করুন
                            </Button>
                          </div>
                        )}
                        <input
                          ref={signatureInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSignatureUpload}
                        />
                      </div>
                      <p className="text-xs text-gray-500">সর্বোচ্চ আকার: ১ এমবি। স্বচ্ছ পটভূমি পছন্দনীয়</p>
                    </div>
                    <div>
                      <Label htmlFor="groupNameBn">শাখা/বিভাগ (বাংলা)</Label>
                      <Select value={formData.groupNameBn} onValueChange={(value) => handleInputChange('groupNameBn', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="শাখা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="বিজ্ঞান">বিজ্ঞান</SelectItem>
                          <SelectItem value="মানবিক">মানবিক</SelectItem>
                          <SelectItem value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Institution Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">প্রতিষ্ঠানের তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instituteNameBn">প্রতিষ্ঠানের নাম (বাংলা)</Label>
                      <Input
                        id="instituteNameBn"
                        value={formData.instituteNameBn}
                        onChange={(e) => handleInputChange('instituteNameBn', e.target.value)}
                        placeholder="ঢাকা সরকারি কলেজ"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instituteCode">প্রতিষ্ঠান কোড</Label>
                      <Input
                        id="instituteCode"
                        value={formData.instituteCode}
                        onChange={(e) => handleInputChange('instituteCode', e.target.value)}
                        placeholder="১০১২৩৪"
                      />
                    </div>
                    <div>
                      <Label htmlFor="centerNameBn">কেন্দ্রের নাম (বাংলা)</Label>
                      <Input
                        id="centerNameBn"
                        value={formData.centerNameBn}
                        onChange={(e) => handleInputChange('centerNameBn', e.target.value)}
                        placeholder="ঢাকা সরকারি কলেজ"
                      />
                    </div>
                    <div>
                      <Label htmlFor="centerCode">কেন্দ্র কোড</Label>
                      <Input
                        id="centerCode"
                        value={formData.centerCode}
                        onChange={(e) => handleInputChange('centerCode', e.target.value)}
                        placeholder="১০১"
                      />
                    </div>
                  </div>
                </div>

                {/* Exam Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">পরীক্ষার বিবরণ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="examDate">পরীক্ষার তারিখ</Label>
                      <Input
                        id="examDate"
                        value={formData.examDate}
                        onChange={(e) => handleInputChange('examDate', e.target.value)}
                        placeholder="১৫ মে ২০২৪"
                      />
                    </div>
                    <div>
                      <Label htmlFor="examTime">পরীক্ষার সময়</Label>
                      <Input
                        id="examTime"
                        value={formData.examTime}
                        onChange={(e) => handleInputChange('examTime', e.target.value)}
                        placeholder="সকাল ১০:০০ - দুপুর ১:০০"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportingTime">উপস্থিতির সময়</Label>
                      <Input
                        id="reportingTime"
                        value={formData.reportingTime}
                        onChange={(e) => handleInputChange('reportingTime', e.target.value)}
                        placeholder="সকাল ৯:৩০"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">বিষয় নির্বাচন</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableSubjects.map((subject, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={`subject-${index}`}
                          checked={formData.subjects.includes(subject.english)}
                          onCheckedChange={(checked) => handleSubjectToggle(subject, checked as boolean)}
                        />
                        <Label 
                          htmlFor={`subject-${index}`} 
                          className="flex-1 text-sm cursor-pointer"
                        >
                          <div className="font-medium">{subject.bangla}</div>
                          <div className="text-xs text-gray-500">{subject.english}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.subjects.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">নির্বাচিত বিষয়সমূহ:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.subjectsBn.map((subject, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Instructions */}
                <div>
                  <Label htmlFor="instructionsBn">অতিরিক্ত নির্দেশনা (বাংলা)</Label>
                  <Textarea
                    id="instructionsBn"
                    value={formData.instructionsBn}
                    onChange={(e) => handleInputChange('instructionsBn', e.target.value)}
                    placeholder="অতিরিক্ত কোনো নির্দেশনা থাকলে লিখুন..."
                    rows={3}
                  />
                </div>

                {/* Authority Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">কর্তৃপক্ষের তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="authorityNameBn">কর্তৃপক্ষের নাম (বাংলা)</Label>
                      <Input
                        id="authorityNameBn"
                        value={formData.authorityNameBn}
                        onChange={(e) => handleInputChange('authorityNameBn', e.target.value)}
                        placeholder="অধ্যাপক ডা. মোহাম্মদ আব্দুল মান্নান"
                      />
                    </div>
                    <div>
                      <Label htmlFor="designationBn">পদবি (বাংলা)</Label>
                      <Input
                        id="designationBn"
                        value={formData.designationBn}
                        onChange={(e) => handleInputChange('designationBn', e.target.value)}
                        placeholder="চেয়ারম্যান"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={generateAdmitCard.isPending}
                >
                  {generateAdmitCard.isPending ? 'তৈরি হচ্ছে...' : 'প্রবেশপত্র তৈরি করুন'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>প্রিভিউ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="transform scale-50 origin-top-left w-[200%] h-[200%] overflow-hidden">
                <BanglaAdmitCardTemplate data={formData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}