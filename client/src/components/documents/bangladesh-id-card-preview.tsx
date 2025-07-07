import React from 'react';
import { BangladeshIDTemplate } from './bangladesh-id-templates';

interface IdCardPreviewProps {
  student: {
    name: string;
    nameInBangla?: string;
    id: string;
    className?: string;
    section?: string;
    roll?: string;
    bloodGroup?: string;
    dateOfBirth?: string;
    fatherName?: string;
    fatherNameInBangla?: string;
    motherName?: string;
    motherNameInBangla?: string;
    guardianName?: string;
    guardianPhone?: string;
    emergencyContact?: string;
    emergencyContactRelation?: string;
    thana?: string;
    district?: string;
    village?: string;
    postOffice?: string;
    issuedDate?: string;
    validUntil?: string;
    schoolName?: string;
    schoolCode?: string;
    additionalInfo?: string;
    studentPhoto?: string;
  };
  template: BangladeshIDTemplate;
  showQRCode?: boolean;
  showBloodGroup?: boolean;
  showEmergencyInfo?: boolean;
  showAddress?: boolean;
  showParentInfo?: boolean;
  showSignature?: boolean;
  language?: Language | 'both';
}

const BangladeshIdCardPreview: React.FC<IdCardPreviewProps> = ({
  student,
  template,
  showQRCode = true,
  showBloodGroup = true,
  showEmergencyInfo = true,
  showAddress = true,
  showParentInfo = true,
  showSignature = true,
  language = 'both',
}) => {
  
  // Function to format date to display in the card
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  // Generate QR Code content
  const qrCodeContent = `ID:${student.id}\nName:${student.name}\nClass:${student.className}\nRoll:${student.roll}`;
  
  // Determine if we should use portrait or landscape layout
  const isPortrait = template.layout === 'portrait';
  
  // Determine card dimensions (for display purposes)
  const cardWidth = isPortrait ? 320 : 500;
  const cardHeight = isPortrait ? 500 : 300;
  
  return (
    <div 
      style={{ 
        width: cardWidth, 
        height: cardHeight,
        backgroundColor: template.colors.background,
        color: template.colors.text,
        fontFamily: 'SolaimanLipi, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px'
      }}
    >
      {/* Card Header/Banner with School Name */}
      <div 
        style={{ 
          backgroundColor: template.colors.primary,
          color: 'white',
          padding: '8px 12px',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* School Logo */}
        <div 
          style={{ 
            position: 'absolute', 
            left: '10px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span className="material-icons" style={{ color: template.colors.primary }}>school</span>
        </div>
        
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
            {language === 'both' || language === 'bn' ? (
              <span>{student.schoolName || 'স্কুলের নাম'}</span>
            ) : (
              <span>{student.schoolName || 'School Name'}</span>
            )}
          </h2>
          {language === 'both' || language === 'en' ? (
            <div style={{ fontSize: '10px', marginTop: '2px' }}>
              EIIN: {student.schoolCode || '123456'}
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Card Type Label */}
      <div
        style={{
          backgroundColor: template.colors.secondary,
          color: 'white',
          padding: '4px 8px',
          fontSize: '11px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        {language === 'both' || language === 'bn' ? 'শিক্ষার্থী পরিচয়পত্র' : 'STUDENT IDENTITY CARD'}
      </div>
      
      {/* Main Content */}
      <div style={{ display: 'flex', padding: '15px 12px', height: 'calc(100% - 110px)' }}>
        {/* Photo and Quick Info Column */}
        <div style={{ width: '35%', paddingRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Student Photo */}
          <div
            style={{
              width: '95px',
              height: '120px',
              border: `2px solid ${template.colors.primary}`,
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}
          >
            {student.studentPhoto ? (
              <img 
                src={student.studentPhoto} 
                alt={student.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <span className="material-icons" style={{ fontSize: '48px', color: '#ccc' }}>person</span>
            )}
          </div>
          
          {/* QR Code if enabled */}
          {showQRCode && (
            <div 
              style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: 'white', 
                border: '1px solid #ddd',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Simulated QR Code */}
              <div style={{ 
                width: '90%', 
                height: '90%',
                background: `repeating-linear-gradient(
                  90deg,
                  #000,
                  #000 2px,
                  #fff 2px,
                  #fff 4px
                ), 
                repeating-linear-gradient(
                  180deg,
                  #000,
                  #000 2px,
                  #fff 2px,
                  #fff 4px
                )`
              }}></div>
            </div>
          )}
          
          {/* Blood Group if enabled */}
          {showBloodGroup && student.bloodGroup && (
            <div 
              style={{ 
                backgroundColor: '#f44336',
                color: 'white',
                borderRadius: '4px',
                padding: '2px 10px',
                fontWeight: 'bold',
                fontSize: '15px',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <span className="material-icons" style={{ fontSize: '15px' }}>bloodtype</span>
              {student.bloodGroup}
            </div>
          )}
        </div>
        
        {/* Student Details Column */}
        <div style={{ width: '65%', fontFamily: 'SolaimanLipi, Arial, sans-serif' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              {/* Student Name */}
              <tr>
                <td style={{ borderBottom: '1px dashed #ddd', paddingBottom: '4px', fontWeight: 'bold', color: template.colors.primary }}>
                  {language === 'both' || language === 'bn' ? 'নামঃ' : 'Name:'}
                </td>
                <td style={{ borderBottom: '1px dashed #ddd', paddingBottom: '4px', fontWeight: 'bold' }}>
                  {language === 'both' || language === 'bn' ? student.nameInBangla : student.name}
                </td>
              </tr>
              
              {/* Student ID */}
              <tr>
                <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                  {language === 'both' || language === 'bn' ? 'আইডিঃ' : 'ID:'}
                </td>
                <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                  {student.id}
                </td>
              </tr>
              
              {/* Class, Section, Roll */}
              <tr>
                <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                  {language === 'both' || language === 'bn' ? 'শ্রেণীঃ' : 'Class:'}
                </td>
                <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                  {student.className}{student.section ? ` (${student.section})` : ''} 
                  {student.roll ? `, ${language === 'both' || language === 'bn' ? 'রোলঃ' : 'Roll:'} ${student.roll}` : ''}
                </td>
              </tr>
              
              {/* Date of Birth */}
              {student.dateOfBirth && (
                <tr>
                  <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                    {language === 'both' || language === 'bn' ? 'জন্ম তারিখঃ' : 'DOB:'}
                  </td>
                  <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                    {language === 'both' || language === 'bn' ? formatDate(student.dateOfBirth) : new Date(student.dateOfBirth).toLocaleDateString()}
                  </td>
                </tr>
              )}
              
              {/* Parent Information - conditionally shown */}
              {showParentInfo && (
                <>
                  {student.fatherNameInBangla && (
                    <tr>
                      <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                        {language === 'both' || language === 'bn' ? 'পিতাঃ' : 'Father:'}
                      </td>
                      <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                        {language === 'both' || language === 'bn' ? student.fatherNameInBangla : student.fatherName}
                      </td>
                    </tr>
                  )}
                  
                  {student.motherNameInBangla && (
                    <tr>
                      <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                        {language === 'both' || language === 'bn' ? 'মাতাঃ' : 'Mother:'}
                      </td>
                      <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                        {language === 'both' || language === 'bn' ? student.motherNameInBangla : student.motherName}
                      </td>
                    </tr>
                  )}
                </>
              )}
              
              {/* Address - conditionally shown */}
              {showAddress && student.thana && student.district && (
                <tr>
                  <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                    {language === 'both' || language === 'bn' ? 'ঠিকানাঃ' : 'Address:'}
                  </td>
                  <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                    {language === 'both' || language === 'bn' 
                      ? `${student.village ? student.village + ', ' : ''}${student.thana}, ${student.district}`
                      : `${student.village ? student.village + ', ' : ''}${student.thana}, ${student.district}`
                    }
                  </td>
                </tr>
              )}
              
              {/* Emergency Contact - conditionally shown */}
              {showEmergencyInfo && student.emergencyContact && (
                <tr>
                  <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                    {language === 'both' || language === 'bn' ? 'জরুরী যোগাযোগঃ' : 'Emergency:'}
                  </td>
                  <td style={{ borderBottom: '1px dashed #ddd', paddingTop: '4px', paddingBottom: '4px' }}>
                    {student.emergencyContact}
                    {student.emergencyContactRelation && ` (${student.emergencyContactRelation})`}
                  </td>
                </tr>
              )}
              
              {/* Validity */}
              {student.issuedDate && student.validUntil && (
                <tr>
                  <td style={{ paddingTop: '4px' }}>
                    {language === 'both' || language === 'bn' ? 'বৈধতাঃ' : 'Valid:'}
                  </td>
                  <td style={{ paddingTop: '4px' }}>
                    {language === 'both' || language === 'bn' 
                      ? `${formatDate(student.issuedDate)} - ${formatDate(student.validUntil)}`
                      : `${new Date(student.issuedDate).toLocaleDateString()} - ${new Date(student.validUntil).toLocaleDateString()}`
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Card Footer */}
      <div 
        style={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '8px',
          borderTop: `1px solid ${template.colors.primary}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/* Student Signature */}
          {showSignature && (
            <div 
              style={{ 
                borderTop: '1px solid #333', 
                width: '80px', 
                padding: '2px 0', 
                fontSize: '9px',
                textAlign: 'center' 
              }}
            >
              {language === 'both' || language === 'bn' ? 'শিক্ষার্থীর স্বাক্ষর' : 'Student Signature'}
            </div>
          )}
          
          {/* If not showing signature, add an empty div for spacing */}
          {!showSignature && <div style={{ width: '80px' }}></div>}
          
          {/* Logo or Institution Mark */}
          <div
            style={{
              fontSize: '9px',
              width: '100px',
              textAlign: 'center',
              color: template.colors.primary,
              fontWeight: 'bold'
            }}
          >
            <div>
              {language === 'both' || language === 'bn' ? 'অফিসিয়াল সিল' : 'OFFICIAL SEAL'}
            </div>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `1px solid ${template.colors.primary}`,
                margin: '0 auto',
                marginTop: '2px'
              }}
            ></div>
          </div>
          
          {/* Principal Signature */}
          {showSignature && (
            <div 
              style={{ 
                borderTop: '1px solid #333', 
                width: '80px', 
                padding: '2px 0', 
                fontSize: '9px',
                textAlign: 'center' 
              }}
            >
              {language === 'both' || language === 'bn' ? 'প্রধান শিক্ষকের স্বাক্ষর' : 'Principal Signature'}
            </div>
          )}
          
          {/* If not showing signature, add an empty div for spacing */}
          {!showSignature && <div style={{ width: '80px' }}></div>}
        </div>
      </div>
    </div>
  );
};

export default BangladeshIdCardPreview;