import React from 'react';
import { cn } from '@/lib/utils';

interface StudentData {
  studentName: string;
  studentNameBn: string;
  studentId: string;
  rollNumber: string;
  className: string;
  section: string;
  session: string;
  bloodGroup: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  guardianPhone: string;
  address: string;
  schoolName: string;
  schoolAddress: string;
  eiin: string;
  issueDate: string;
  expireDate: string;
  photo?: string;
  schoolLogo?: string;
}

interface TemplateProps {
  student: StudentData;
  side: 'front' | 'back';
  size: 'portrait' | 'landscape';
  className?: string;
}

// Credit Card Size: 85.60mm × 53.98mm (standard size)
const cardDimensions = {
  portrait: 'w-[340px] h-[216px]', // 85.6mm x 54mm scaled 4x
  landscape: 'w-[216px] h-[340px]' // 54mm x 85.6mm scaled 4x
};

export function CreditCardPortraitTemplate({ student, side, className }: Omit<TemplateProps, 'size'>) {
  const cardClass = cn(
    'relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg',
    cardDimensions.portrait,
    className
  );

  if (side === 'front') {
    return (
      <div className={cardClass}>
        {/* Header with School Info */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-2 text-center">
          <div className="flex items-center justify-between">
            {student.schoolLogo && (
              <img src={student.schoolLogo} alt="Logo" className="w-8 h-8 object-contain" />
            )}
            <div className="flex-1">
              <h1 className="text-xs font-bold leading-tight">{student.schoolName}</h1>
              <p className="text-[8px] opacity-90">{student.schoolAddress}</p>
              <p className="text-[8px] opacity-80">EIIN: {student.eiin}</p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-xs font-bold">ID</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-2 h-[calc(100%-48px)]">
          <div className="flex gap-2 h-full">
            {/* Photo Section */}
            <div className="w-16 h-20 bg-gray-100 border rounded overflow-hidden flex-shrink-0">
              {student.photo ? (
                <img src={student.photo} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-xs text-gray-400">Photo</span>
                </div>
              )}
            </div>

            {/* Student Info */}
            <div className="flex-1 text-[8px] space-y-1">
              <div>
                <span className="font-semibold">নাম: </span>
                <span>{student.studentNameBn}</span>
              </div>
              <div>
                <span className="font-semibold">Name: </span>
                <span>{student.studentName}</span>
              </div>
              <div>
                <span className="font-semibold">আইডি: </span>
                <span>{student.studentId}</span>
              </div>
              <div>
                <span className="font-semibold">রোল: </span>
                <span>{student.rollNumber}</span>
              </div>
              <div>
                <span className="font-semibold">শ্রেণি: </span>
                <span>{student.className} - {student.section}</span>
              </div>
              <div>
                <span className="font-semibold">সেশন: </span>
                <span>{student.session}</span>
              </div>
              <div>
                <span className="font-semibold">রক্তের গ্রুপ: </span>
                <span className="bg-red-100 px-1 rounded text-red-700">{student.bloodGroup}</span>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-1 left-2 right-2">
            <div className="flex justify-between items-center text-[7px] text-gray-600">
              <span>ইস্যু: {student.issueDate}</span>
              <span>মেয়াদ: {student.expireDate}</span>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 text-gray-200 text-lg font-bold opacity-10">
            {student.schoolName}
          </div>
        </div>
      </div>
    );
  }

  // Back Side
  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-2 text-center">
        <h2 className="text-xs font-bold">পরিচয়পত্র - ID CARD</h2>
      </div>

      {/* Content */}
      <div className="p-2 text-[8px] space-y-2">
        {/* Parent Info */}
        <div>
          <h3 className="font-semibold text-[9px] mb-1">অভিভাবকের তথ্য:</h3>
          <div>পিতা: {student.fatherName}</div>
          <div>মাতা: {student.motherName}</div>
          <div>ফোন: {student.guardianPhone}</div>
        </div>

        {/* Address */}
        <div>
          <h3 className="font-semibold text-[9px] mb-1">ঠিকানা:</h3>
          <div>{student.address}</div>
        </div>

        {/* Emergency Info */}
        <div className="bg-red-50 p-1 rounded">
          <h3 className="font-semibold text-red-700 text-[9px]">জরুরি তথ্য:</h3>
          <div>রক্তের গ্রুপ: <span className="font-bold text-red-600">{student.bloodGroup}</span></div>
          <div>জন্ম তারিখ: {student.dateOfBirth}</div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between mt-3">
          <div className="text-center">
            <div className="w-12 h-6 border-b border-gray-300 mb-1"></div>
            <span className="text-[7px]">শিক্ষার্থীর স্বাক্ষর</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-6 border-b border-gray-300 mb-1"></div>
            <span className="text-[7px]">অধ্যক্ষের স্বাক্ষর</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[7px] text-gray-500 mt-2">
          <p>এই কার্ডটি হারিয়ে গেলে অবিলম্বে স্কুল কর্তৃপক্ষকে জানান</p>
        </div>
      </div>
    </div>
  );
}

export function CreditCardLandscapeTemplate({ student, side, className }: Omit<TemplateProps, 'size'>) {
  const cardClass = cn(
    'relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg',
    cardDimensions.landscape,
    className
  );

  if (side === 'front') {
    return (
      <div className={cardClass}>
        {/* Header */}
        <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white p-2 text-center">
          {student.schoolLogo && (
            <img src={student.schoolLogo} alt="Logo" className="w-8 h-8 mx-auto mb-1 object-contain" />
          )}
          <h1 className="text-[10px] font-bold leading-tight">{student.schoolName}</h1>
          <p className="text-[7px] opacity-90">{student.schoolAddress}</p>
        </div>

        {/* Main Content */}
        <div className="p-2 flex flex-col items-center text-center space-y-2">
          {/* Photo */}
          <div className="w-16 h-20 bg-gray-100 border rounded overflow-hidden">
            {student.photo ? (
              <img src={student.photo} alt="Student" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-xs text-gray-400">Photo</span>
              </div>
            )}
          </div>

          {/* Student Info */}
          <div className="text-[8px] space-y-1">
            <div className="font-semibold">{student.studentNameBn}</div>
            <div className="text-gray-600">{student.studentName}</div>
            <div>আইডি: <span className="font-semibold">{student.studentId}</span></div>
            <div>রোল: <span className="font-semibold">{student.rollNumber}</span></div>
            <div>শ্রেণি: <span className="font-semibold">{student.className} - {student.section}</span></div>
            <div>রক্তের গ্রুপ: <span className="bg-red-100 px-1 rounded text-red-700 font-semibold">{student.bloodGroup}</span></div>
          </div>

          {/* Bottom */}
          <div className="text-[7px] text-gray-500 mt-auto">
            <div>সেশন: {student.session}</div>
            <div>মেয়াদ: {student.expireDate}</div>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 text-gray-200 text-sm font-bold opacity-10">
            {student.eiin}
          </div>
        </div>
      </div>
    );
  }

  // Back Side
  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white p-2 text-center">
        <h2 className="text-[10px] font-bold">পরিচয়পত্র</h2>
        <div className="text-[7px]">EIIN: {student.eiin}</div>
      </div>

      {/* Content */}
      <div className="p-2 text-[8px] space-y-2">
        {/* Parent Info */}
        <div>
          <h3 className="font-semibold text-[9px] mb-1 text-blue-700">অভিভাবকের তথ্য:</h3>
          <div>পিতা: {student.fatherName}</div>
          <div>মাতা: {student.motherName}</div>
          <div>ফোন: {student.guardianPhone}</div>
        </div>

        {/* Emergency */}
        <div className="bg-yellow-50 p-1 rounded border-l-2 border-yellow-400">
          <h3 className="font-semibold text-[9px] text-yellow-700">জরুরি যোগাযোগ:</h3>
          <div>ফোন: {student.guardianPhone}</div>
          <div>রক্তের গ্রুপ: <span className="font-bold text-red-600">{student.bloodGroup}</span></div>
        </div>

        {/* Address */}
        <div>
          <h3 className="font-semibold text-[9px] mb-1">ঠিকানা:</h3>
          <div className="text-[7px]">{student.address}</div>
        </div>

        {/* Signatures */}
        <div className="space-y-2 mt-3">
          <div className="text-center">
            <div className="w-16 h-4 border-b border-gray-300 mb-1 mx-auto"></div>
            <span className="text-[7px]">শিক্ষার্থীর স্বাক্ষর</span>
          </div>
          <div className="text-center">
            <div className="w-16 h-4 border-b border-gray-300 mb-1 mx-auto"></div>
            <span className="text-[7px]">অধ্যক্ষের স্বাক্ষর</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[6px] text-gray-500 mt-2">
          <p>হারিয়ে গেলে স্কুলে ফেরত দিন</p>
        </div>
      </div>
    </div>
  );
}

export function IdCardPreview({ student, template, side = 'front' }: {
  student: StudentData;
  template: 'portrait' | 'landscape';
  side?: 'front' | 'back';
}) {
  if (template === 'portrait') {
    return <CreditCardPortraitTemplate student={student} side={side} />;
  }
  
  return <CreditCardLandscapeTemplate student={student} side={side} />;
}