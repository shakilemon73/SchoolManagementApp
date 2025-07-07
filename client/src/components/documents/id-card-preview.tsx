import React from 'react';
import { cn } from '@/lib/utils';

// Types for student data and template options
export interface StudentData {
  name: string;
  nameInBangla?: string;
  id: string;
  className: string;
  section?: string;
  roll?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  religion?: string;
  nationality?: string;
  studentPhoto?: string;
  fatherName?: string;
  fatherNameInBangla?: string;
  motherName?: string;
  motherNameInBangla?: string;
  guardianName?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  emergencyContactRelation?: string;
  presentAddress?: string;
  permanentAddress?: string;
  village?: string;
  postOffice?: string;
  thana?: string;
  district?: string;
  division?: string;
  issuedDate?: string;
  validUntil?: string;
  schoolName?: string;
  schoolCode?: string;
  additionalInfo?: string;
}

export interface TemplateOptions {
  layout: '1' | '2' | '4' | '8';
  language: 'en' | 'bn' | 'both';
  template: 'standard' | 'modern' | 'simple' | 'detailed';
  size: 'credit' | 'portrait' | 'landscape' | 'custom';
  includeQRCode: boolean;
  includeBarcode: boolean;
  includeLogo: boolean;
  includeEmergencyInfo: boolean;
  includeAddress: boolean;
  includeParentInfo: boolean;
  includeSignature: boolean;
  includeBorder: boolean;
  includeBirthDate: boolean;
  includeBloodGroup: boolean;
  includeTransportRoute: boolean;
}

interface IdCardPreviewProps {
  student: StudentData;
  template: TemplateOptions;
  schoolLogo?: string;
}

// A utility to format dates in Bengali
const formatDateInBengali = (dateString?: string, language?: 'en' | 'bn' | 'both') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const day = date.getDate().toString();
  const month = (date.getMonth() + 1).toString();
  const year = date.getFullYear().toString();
  
  // Convert to Bengali digits
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  
  const toBengaliDigit = (num: string) => {
    return num.split('').map(digit => bengaliDigits[parseInt(digit)]).join('');
  };
  
  if (language === 'bn' || language === 'both') {
    return `${toBengaliDigit(day)}/${toBengaliDigit(month)}/${toBengaliDigit(year)}`;
  }
  
  return `${day}/${month}/${year}`;
};

// Generate QR code URL for student information
const generateQRCodeUrl = (studentId: string) => {
  // In a real app, this would generate a QR code that links to the student's full profile
  // For now, we'll create a simple QR code with the student ID
  return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=STUDENT_ID:${studentId}`;
};

const IdCardPreview: React.FC<IdCardPreviewProps> = ({ 
  student, 
  template,
  schoolLogo = '/placeholder-school-logo.png' 
}) => {
  const { language, size, template: templateStyle } = template;
  const showBoth = language === 'both';
  const showBengali = language === 'bn' || showBoth;
  const showEnglish = language === 'en' || showBoth;
  
  // Determine card dimensions based on size
  const getCardStyle = () => {
    switch(size) {
      case 'credit':
        return { width: '85.6mm', height: '53.98mm' };
      case 'portrait':
        return { width: '85mm', height: '110mm' };
      case 'landscape':
        return { width: '110mm', height: '85mm' };
      case 'custom':
      default:
        return { width: '90mm', height: '60mm' };
    }
  };
  
  // Choose template style
  const getTemplateClass = () => {
    switch(templateStyle) {
      case 'modern':
        return 'id-card-modern';
      case 'simple':
        return 'id-card-simple';
      case 'detailed':
        return 'id-card-detailed';
      case 'standard':
      default:
        return 'id-card-standard';
    }
  };
  
  return (
    <div 
      id="id-card-preview"
      className={cn(
        "id-card-container relative bg-white text-gray-900 overflow-hidden", 
        getTemplateClass(),
        template.includeBorder ? "border-2 border-gray-800" : ""
      )}
      style={getCardStyle()}
    >
      {/* Card Header with School Logo and Name */}
      <div className="id-card-header flex items-center justify-between p-2 bg-primary/10 border-b">
        {template.includeLogo && (
          <div className="school-logo w-12 h-12">
            <img 
              src={schoolLogo} 
              alt={student.schoolName || "School Logo"} 
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        <div className="school-info text-center flex-1">
          {showEnglish && (
            <h3 className="text-sm font-bold text-primary">
              {student.schoolName || "Dhaka Public School"}
            </h3>
          )}
          {showBengali && (
            <h3 className="text-sm font-bold text-primary">
              {student.schoolName ? "ঢাকা পাবলিক স্কুল" : "ঢাকা পাবলিক স্কুল"}
            </h3>
          )}
          {showEnglish && (
            <p className="text-xs">{student.schoolCode || "School Code: DPS-123"}</p>
          )}
        </div>
        
        {/* ID Card Label */}
        <div className="id-card-label bg-primary text-white text-xs px-2 py-1 rounded absolute top-0 right-0">
          {showBengali && <span className="block">পরিচয় পত্র</span>}
          {showEnglish && <span className="block">ID CARD</span>}
        </div>
      </div>
      
      {/* Student Information Section */}
      <div className="id-card-body p-2 flex gap-2">
        {/* Photo Section */}
        <div className="photo-section">
          <div className="student-photo bg-gray-200 w-20 h-24 border flex items-center justify-center overflow-hidden">
            {student.studentPhoto ? (
              <img 
                src={student.studentPhoto} 
                alt={student.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-icons text-gray-400 text-3xl">person</span>
            )}
          </div>
          
          {/* Blood Group */}
          {template.includeBloodGroup && student.bloodGroup && (
            <div className="blood-group mt-1 bg-red-600 text-white text-center py-1 text-xs font-bold rounded">
              {student.bloodGroup}
            </div>
          )}
          
          {/* QR Code */}
          {template.includeQRCode && (
            <div className="qr-code mt-1">
              <img 
                src={generateQRCodeUrl(student.id)} 
                alt="QR Code" 
                className="w-16 h-16"
              />
            </div>
          )}
        </div>
        
        {/* Student Details */}
        <div className="student-details flex-1">
          {/* Student Name */}
          <div className="mb-1">
            {showBengali && student.nameInBangla && (
              <h2 className="text-sm font-bold">{student.nameInBangla}</h2>
            )}
            {showEnglish && (
              <h2 className="text-sm font-semibold">{student.name}</h2>
            )}
          </div>
          
          {/* Student ID */}
          <div className="flex flex-col text-xs">
            <div className="grid grid-cols-2 gap-x-1 mb-1">
              <span className="text-gray-600">
                {showBengali && <span>আইডি</span>}
                {showEnglish && showBengali && <span>: </span>}
                {showEnglish && <span>ID</span>}
              </span>
              <span className="font-medium">{student.id}</span>
            </div>
            
            {/* Class, Section and Roll */}
            <div className="grid grid-cols-2 gap-x-1 mb-1">
              <span className="text-gray-600">
                {showBengali && <span>শ্রেণী</span>}
                {showEnglish && showBengali && <span>: </span>}
                {showEnglish && <span>Class</span>}
              </span>
              <span className="font-medium">
                {student.className}
                {student.section && ` - ${student.section}`}
                {student.roll && ` (${student.roll})`}
              </span>
            </div>
            
            {/* Birth Date */}
            {template.includeBirthDate && student.dateOfBirth && (
              <div className="grid grid-cols-2 gap-x-1 mb-1">
                <span className="text-gray-600">
                  {showBengali && <span>জন্ম তারিখ</span>}
                  {showEnglish && showBengali && <span>: </span>}
                  {showEnglish && <span>DOB</span>}
                </span>
                <span className="font-medium">
                  {showBengali ? formatDateInBengali(student.dateOfBirth, language) : student.dateOfBirth}
                </span>
              </div>
            )}
            
            {/* Parent Information */}
            {template.includeParentInfo && (
              <>
                {student.fatherName && (
                  <div className="grid grid-cols-2 gap-x-1 mb-1">
                    <span className="text-gray-600">
                      {showBengali && <span>পিতা</span>}
                      {showEnglish && showBengali && <span>: </span>}
                      {showEnglish && <span>Father</span>}
                    </span>
                    <span className="font-medium">
                      {showBengali && student.fatherNameInBangla ? student.fatherNameInBangla : student.fatherName}
                    </span>
                  </div>
                )}
                
                {student.motherName && (
                  <div className="grid grid-cols-2 gap-x-1 mb-1">
                    <span className="text-gray-600">
                      {showBengali && <span>মাতা</span>}
                      {showEnglish && showBengali && <span>: </span>}
                      {showEnglish && <span>Mother</span>}
                    </span>
                    <span className="font-medium">
                      {showBengali && student.motherNameInBangla ? student.motherNameInBangla : student.motherName}
                    </span>
                  </div>
                )}
              </>
            )}
            
            {/* Emergency Contact */}
            {template.includeEmergencyInfo && student.emergencyContact && (
              <div className="grid grid-cols-2 gap-x-1 mb-1">
                <span className="text-gray-600">
                  {showBengali && <span>জরুরী যোগাযোগ</span>}
                  {showEnglish && showBengali && <span>: </span>}
                  {showEnglish && <span>Emergency</span>}
                </span>
                <span className="font-medium">
                  {student.emergencyContact}
                  {student.emergencyContactRelation && ` (${student.emergencyContactRelation})`}
                </span>
              </div>
            )}
            
            {/* Present Address - Condensed for ID card */}
            {template.includeAddress && student.presentAddress && (
              <div className="grid grid-cols-2 gap-x-1 mb-1">
                <span className="text-gray-600">
                  {showBengali && <span>ঠিকানা</span>}
                  {showEnglish && showBengali && <span>: </span>}
                  {showEnglish && <span>Address</span>}
                </span>
                <span className="font-medium text-xs leading-tight">
                  {student.presentAddress}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Card Footer with Validity */}
      <div className="id-card-footer p-1 mt-1 text-xs border-t flex justify-between items-center">
        <div className="validity-dates">
          {student.issuedDate && (
            <div className="text-[0.6rem]">
              {showBengali && <span>ইস্যু: </span>}
              {showEnglish && <span>Issued: </span>}
              <span>
                {showBengali ? formatDateInBengali(student.issuedDate, language) : student.issuedDate}
              </span>
            </div>
          )}
          
          {student.validUntil && (
            <div className="text-[0.6rem]">
              {showBengali && <span>মেয়াদ: </span>}
              {showEnglish && <span>Valid until: </span>}
              <span>
                {showBengali ? formatDateInBengali(student.validUntil, language) : student.validUntil}
              </span>
            </div>
          )}
        </div>
        
        {/* Signature of Authority */}
        {template.includeSignature && (
          <div className="signature text-center">
            <div className="border-t border-gray-400 w-16 mt-2 mx-auto"></div>
            <div className="text-[0.6rem] mt-1">
              {showBengali && <span>প্রধান শিক্ষক</span>}
              {showEnglish && <span>Principal</span>}
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions on back side (shown as a note on preview) */}
      <div className="back-instructions absolute bottom-0 right-0 text-[0.5rem] bg-yellow-50 p-1 opacity-70">
        <div>{showBengali && "এই কার্ডটি প্রতিষ্ঠানের সম্পত্তি, হারিয়ে গেলে স্কুল অফিসে জমা দিন"}</div>
        <div>{showEnglish && "This card is property of the institution, if found please return to school office"}</div>
      </div>
    </div>
  );
};

export default IdCardPreview;