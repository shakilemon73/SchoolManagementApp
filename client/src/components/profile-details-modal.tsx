import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Calendar, User, GraduationCap, Briefcase, Users, Edit, Droplets, Home } from "lucide-react";

interface ProfileDetailsModalProps {
  trigger: React.ReactNode;
  profile: {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    presentAddress?: string;
    permanentAddress?: string;
    village?: string;
    postOffice?: string;
    thana?: string;
    district?: string;
    division?: string;
    dateOfBirth?: string;
    gender?: string;
    photo?: string;
    bloodGroup?: string;
    
    // Student specific
    studentId?: string;
    class?: string;
    section?: string;
    rollNumber?: string;
    admissionDate?: string;
    fatherName?: string;
    motherName?: string;
    guardianName?: string;
    guardianPhone?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    
    // Teacher specific
    teacherId?: string;
    subject?: string;
    subjects?: string;
    qualification?: string;
    experience?: string;
    joiningDate?: string;
    designation?: string;
    salary?: string;
    
    // Staff specific
    staffId?: string;
    department?: string;
    position?: string;
    
    // Parent specific
    parentId?: string;
    occupation?: string;
    relationship?: string;
    
    // For any additional data
    [key: string]: any;
  };
  type: 'student' | 'teacher' | 'staff' | 'parent';
  language: 'en' | 'bn' | 'ar';
  onEdit?: () => void;
}

export function ProfileDetailsModal({ trigger, profile, type, language, onEdit }: ProfileDetailsModalProps) {
  const getInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeText = () => {
    const texts = {
      student: { en: 'Student', bn: 'শিক্ষার্থী', ar: 'طالب' },
      teacher: { en: 'Teacher', bn: 'শিক্ষক', ar: 'معلم' },
      staff: { en: 'Staff', bn: 'স্টাফ', ar: 'موظف' },
      parent: { en: 'Parent', bn: 'অভিভাবক', ar: 'ولي أمر' }
    };
    return texts[type][language];
  };

  const getFieldLabels = () => {
    const labels = {
      en: {
        personalInfo: 'Personal Information',
        contactInfo: 'Contact Information',
        academicInfo: 'Academic Information',
        professionalInfo: 'Professional Information',
        familyInfo: 'Family Information',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        dateOfBirth: 'Date of Birth',
        gender: 'Gender',
        class: 'Class',
        section: 'Section',
        rollNumber: 'Roll Number',
        admissionDate: 'Admission Date',
        subject: 'Subject',
        qualification: 'Qualification',
        experience: 'Experience',
        joiningDate: 'Joining Date',
        department: 'Department',
        position: 'Position',
        fatherName: 'Father Name',
        motherName: 'Mother Name',
        occupation: 'Occupation',
        relationship: 'Relationship'
      },
      bn: {
        personalInfo: 'ব্যক্তিগত তথ্য',
        contactInfo: 'যোগাযোগের তথ্য',
        academicInfo: 'একাডেমিক তথ্য',
        professionalInfo: 'পেশাগত তথ্য',
        familyInfo: 'পারিবারিক তথ্য',
        email: 'ইমেইল',
        phone: 'ফোন',
        address: 'ঠিকানা',
        dateOfBirth: 'জন্ম তারিখ',
        gender: 'লিঙ্গ',
        class: 'শ্রেণি',
        section: 'শাখা',
        rollNumber: 'রোল নম্বর',
        admissionDate: 'ভর্তির তারিখ',
        subject: 'বিষয়',
        qualification: 'যোগ্যতা',
        experience: 'অভিজ্ঞতা',
        joiningDate: 'যোগদানের তারিখ',
        department: 'বিভাগ',
        position: 'পদবি',
        fatherName: 'পিতার নাম',
        motherName: 'মাতার নাম',
        occupation: 'পেশা',
        relationship: 'সম্পর্ক'
      },
      ar: {
        personalInfo: 'المعلومات الشخصية',
        contactInfo: 'معلومات الاتصال',
        academicInfo: 'المعلومات الأكاديمية',
        professionalInfo: 'المعلومات المهنية',
        familyInfo: 'معلومات العائلة',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        address: 'العنوان',
        dateOfBirth: 'تاريخ الميلاد',
        gender: 'الجنس',
        class: 'الصف',
        section: 'القسم',
        rollNumber: 'رقم القيد',
        admissionDate: 'تاريخ القبول',
        subject: 'المادة',
        qualification: 'المؤهل',
        experience: 'الخبرة',
        joiningDate: 'تاريخ الانضمام',
        department: 'القسم',
        position: 'المنصب',
        fatherName: 'اسم الأب',
        motherName: 'اسم الأم',
        occupation: 'المهنة',
        relationship: 'العلاقة'
      }
    };
    return labels[language];
  };

  const labels = getFieldLabels();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {getTypeText()} Profile
            </DialogTitle>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                {language === 'bn' ? 'সম্পাদনা' : language === 'ar' ? 'تحرير' : 'Edit'}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src={profile.photo} alt={profile.name} />
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {profile.name || 'Name not provided'}
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {getTypeText()}
                </Badge>
                {type === 'student' && profile.studentId && (
                  <Badge variant="outline" className="text-xs">
                    ID: {profile.studentId}
                  </Badge>
                )}
                {type === 'teacher' && profile.teacherId && (
                  <Badge variant="outline" className="text-xs">
                    ID: {profile.teacherId}
                  </Badge>
                )}
                {type === 'staff' && profile.staffId && (
                  <Badge variant="outline" className="text-xs">
                    ID: {profile.staffId}
                  </Badge>
                )}
                {type === 'parent' && profile.parentId && (
                  <Badge variant="outline" className="text-xs">
                    ID: {profile.parentId}
                  </Badge>
                )}
                {profile.bloodGroup && (
                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {profile.bloodGroup}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                {profile.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                {labels.personalInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {profile.dateOfBirth && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{labels.dateOfBirth}:</span>
                    <span className="text-sm font-medium">{formatDate(profile.dateOfBirth)}</span>
                  </div>
                )}
                {profile.gender && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{labels.gender}:</span>
                    <span className="text-sm font-medium">{profile.gender}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {labels.contactInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{labels.email}:</span>
                  <span className="text-sm font-medium">{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{labels.phone}:</span>
                  <span className="text-sm font-medium">{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{labels.address}:</span>
                  <span className="text-sm font-medium">{profile.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Information */}
          {(profile.presentAddress || profile.permanentAddress || profile.village || profile.district) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 'ঠিকানার তথ্য' : language === 'ar' ? 'معلومات العنوان' : 'Address Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.presentAddress && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'বর্তমান ঠিকানা:' : language === 'ar' ? 'العنوان الحالي:' : 'Present Address:'}
                      </span>
                      <p className="text-sm font-medium">{profile.presentAddress}</p>
                    </div>
                  </div>
                )}
                {profile.permanentAddress && (
                  <div className="flex items-start space-x-2">
                    <Home className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'স্থায়ী ঠিকানা:' : language === 'ar' ? 'العنوان الدائم:' : 'Permanent Address:'}
                      </span>
                      <p className="text-sm font-medium">{profile.permanentAddress}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {profile.village && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'গ্রাম:' : language === 'ar' ? 'القرية:' : 'Village:'}
                      </span>
                      <p className="text-sm font-medium">{profile.village}</p>
                    </div>
                  )}
                  {profile.postOffice && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'পোস্ট অফিস:' : language === 'ar' ? 'مكتب البريد:' : 'Post Office:'}
                      </span>
                      <p className="text-sm font-medium">{profile.postOffice}</p>
                    </div>
                  )}
                  {profile.thana && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'থানা:' : language === 'ar' ? 'الثانة:' : 'Thana:'}
                      </span>
                      <p className="text-sm font-medium">{profile.thana}</p>
                    </div>
                  )}
                  {profile.district && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'জেলা:' : language === 'ar' ? 'المنطقة:' : 'District:'}
                      </span>
                      <p className="text-sm font-medium">{profile.district}</p>
                    </div>
                  )}
                  {profile.division && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'বিভাগ:' : language === 'ar' ? 'القسم:' : 'Division:'}
                      </span>
                      <p className="text-sm font-medium">{profile.division}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact Information */}
          {(profile.emergencyContactName || profile.emergencyContactPhone || profile.guardianName) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 'জরুরি যোগাযোগ' : language === 'ar' ? 'جهة الاتصال الطارئة' : 'Emergency Contact'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.emergencyContactName && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'bn' ? 'জরুরি যোগাযোগের নাম:' : language === 'ar' ? 'اسم جهة الاتصال الطارئة:' : 'Emergency Contact Name:'}
                    </span>
                    <span className="text-sm font-medium">{profile.emergencyContactName}</span>
                  </div>
                )}
                {profile.emergencyContactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'bn' ? 'জরুরি ফোন:' : language === 'ar' ? 'هاتف الطوارئ:' : 'Emergency Phone:'}
                    </span>
                    <span className="text-sm font-medium">{profile.emergencyContactPhone}</span>
                  </div>
                )}
                {profile.guardianName && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'bn' ? 'অভিভাবক:' : language === 'ar' ? 'الوصي:' : 'Guardian:'}
                    </span>
                    <span className="text-sm font-medium">{profile.guardianName}</span>
                  </div>
                )}
                {profile.guardianPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'bn' ? 'অভিভাবকের ফোন:' : language === 'ar' ? 'هاتف الوصي:' : 'Guardian Phone:'}
                    </span>
                    <span className="text-sm font-medium">{profile.guardianPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Type-specific Information */}
          {type === 'student' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {labels.academicInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {profile.class && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.class}:</span>
                      <span className="text-sm font-medium">{profile.class}</span>
                    </div>
                  )}
                  {profile.section && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.section}:</span>
                      <span className="text-sm font-medium">{profile.section}</span>
                    </div>
                  )}
                  {profile.rollNumber && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.rollNumber}:</span>
                      <span className="text-sm font-medium">{profile.rollNumber}</span>
                    </div>
                  )}
                  {profile.admissionDate && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.admissionDate}:</span>
                      <span className="text-sm font-medium">{formatDate(profile.admissionDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {type === 'teacher' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {labels.professionalInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {profile.subject && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.subject}:</span>
                      <span className="text-sm font-medium">{profile.subject}</span>
                    </div>
                  )}
                  {profile.qualification && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.qualification}:</span>
                      <span className="text-sm font-medium">{profile.qualification}</span>
                    </div>
                  )}
                  {profile.experience && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.experience}:</span>
                      <span className="text-sm font-medium">{profile.experience}</span>
                    </div>
                  )}
                  {profile.joiningDate && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.joiningDate}:</span>
                      <span className="text-sm font-medium">{formatDate(profile.joiningDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {type === 'staff' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {labels.professionalInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {profile.department && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.department}:</span>
                      <span className="text-sm font-medium">{profile.department}</span>
                    </div>
                  )}
                  {profile.position && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.position}:</span>
                      <span className="text-sm font-medium">{profile.position}</span>
                    </div>
                  )}
                  {profile.joiningDate && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.joiningDate}:</span>
                      <span className="text-sm font-medium">{formatDate(profile.joiningDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {type === 'parent' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {labels.familyInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {profile.fatherName && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.fatherName}:</span>
                      <span className="text-sm font-medium">{profile.fatherName}</span>
                    </div>
                  )}
                  {profile.motherName && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.motherName}:</span>
                      <span className="text-sm font-medium">{profile.motherName}</span>
                    </div>
                  )}
                  {profile.occupation && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.occupation}:</span>
                      <span className="text-sm font-medium">{profile.occupation}</span>
                    </div>
                  )}
                  {profile.relationship && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.relationship}:</span>
                      <span className="text-sm font-medium">{profile.relationship}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}