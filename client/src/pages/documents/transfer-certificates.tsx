import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ResponsivePageLayout } from '@/components/layout/responsive-page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface StudentInfo {
  name: string;
  nameBn: string;
  fatherName: string;
  fatherNameBn: string;
  motherName: string;
  motherNameBn: string;
  dateOfBirth: string;
  rollNumber: string;
  registrationNumber: string;
  class: string;
  section: string;
  group: string;
  session: string;
  admissionDate: string;
  leavingDate: string;
  lastAttendance: string;
  reasonForLeaving: string;
  reasonForLeavingBn: string;
}

interface SchoolInfo {
  schoolName: string;
  schoolNameBn: string;
  address: string;
  addressBn: string;
  eiin: string;
  boardName: string;
  principalName: string;
  principalNameBn: string;
  schoolSeal: boolean;
}

export default function TransferCertificatesPage() {
  const { toast } = useToast();
  
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '',
    nameBn: '',
    fatherName: '',
    fatherNameBn: '',
    motherName: '',
    motherNameBn: '',
    dateOfBirth: '',
    rollNumber: '',
    registrationNumber: '',
    class: '',
    section: '',
    group: '',
    session: '',
    admissionDate: '',
    leavingDate: '',
    lastAttendance: '',
    reasonForLeaving: '',
    reasonForLeavingBn: ''
  });

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: '',
    schoolNameBn: '',
    address: '',
    addressBn: '',
    eiin: '',
    boardName: '',
    principalName: '',
    principalNameBn: '',
    schoolSeal: false
  });

  const [certificateNumber, setCertificateNumber] = useState('');

  const bangladeshiBoards = [
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, চট্টগ্রাম',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, রাজশাহী',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, যশোর',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, কুমিল্লা',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, বরিশাল',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, সিলেট',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, দিনাজপুর',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ময়মনসিংহ',
    'কারিগরি শিক্ষা বোর্ড',
    'মাদ্রাসা শিক্ষা বোর্ড'
  ];

  const classes = [
    'প্রাক-প্রাথমিক', 'প্রথম শ্রেণি', 'দ্বিতীয় শ্রেণি', 'তৃতীয় শ্রেণি', 'চতুর্থ শ্রেণি', 'পঞ্চম শ্রেণি',
    'ষষ্ঠ শ্রেণি', 'সপ্তম শ্রেণি', 'অষ্টম শ্রেণি', 'নবম শ্রেণি', 'দশম শ্রেণি',
    'একাদশ শ্রেণি', 'দ্বাদশ শ্রেণি'
  ];

  const groups = ['বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা', 'প্রযুক্তি', 'সাধারণ'];

  const reasonsForLeaving = [
    'পিতার বদলি / Transfer of Father',
    'পারিবারিক কারণ / Family Reasons',
    'অর্থনৈতিক কারণ / Financial Reasons',
    'ভর্তি সংক্রান্ত / Admission Related',
    'স্বাস্থ্যগত কারণ / Health Reasons',
    'ব্যক্তিগত কারণ / Personal Reasons',
    'অন্যান্য / Others'
  ];

  const generateCertificate = () => {
    if (!studentInfo.name || !studentInfo.nameBn || !schoolInfo.schoolName) {
      toast({
        title: "ত্রুটি",
        description: "শিক্ষার্থীর নাম ও স্কুলের নাম প্রয়োজন",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "সফল",
      description: "স্থানান্তর সনদপত্র তৈরি হয়েছে"
    });
  };

  return (
    <AppShell>
      <ResponsivePageLayout
        title="স্থানান্তর সনদপত্র"
        description="শিক্ষার্থীদের জন্য স্থানান্তর সনদপত্র তৈরি করুন"
      >
        <div className="space-y-6">
          {/* Certificate Number */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">assignment_return</span>
                সনদপত্র নম্বর
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="certificateNumber">সনদপত্র নম্বর</Label>
                <Input
                  id="certificateNumber"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  placeholder="যেমন: TC/2024/001"
                />
              </div>
            </CardContent>
          </Card>

          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle>প্রতিষ্ঠানের তথ্য</CardTitle>
              <CardDescription>স্কুল/কলেজের বিস্তারিত তথ্য</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">প্রতিষ্ঠানের নাম (ইংরেজি)</Label>
                  <Input
                    id="schoolName"
                    value={schoolInfo.schoolName}
                    onChange={(e) => setSchoolInfo({...schoolInfo, schoolName: e.target.value})}
                    placeholder="School Name in English"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolNameBn">প্রতিষ্ঠানের নাম (বাংলা)</Label>
                  <Input
                    id="schoolNameBn"
                    value={schoolInfo.schoolNameBn}
                    onChange={(e) => setSchoolInfo({...schoolInfo, schoolNameBn: e.target.value})}
                    placeholder="প্রতিষ্ঠানের নাম বাংলায়"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">ঠিকানা (ইংরেজি)</Label>
                  <Textarea
                    id="address"
                    value={schoolInfo.address}
                    onChange={(e) => setSchoolInfo({...schoolInfo, address: e.target.value})}
                    placeholder="School Address in English"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressBn">ঠিকানা (বাংলা)</Label>
                  <Textarea
                    id="addressBn"
                    value={schoolInfo.addressBn}
                    onChange={(e) => setSchoolInfo({...schoolInfo, addressBn: e.target.value})}
                    placeholder="প্রতিষ্ঠানের ঠিকানা বাংলায়"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eiin">EIIN নম্বর</Label>
                  <Input
                    id="eiin"
                    value={schoolInfo.eiin}
                    onChange={(e) => setSchoolInfo({...schoolInfo, eiin: e.target.value})}
                    placeholder="123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boardName">বোর্ড</Label>
                  <Select value={schoolInfo.boardName} onValueChange={(value) => setSchoolInfo({...schoolInfo, boardName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="বোর্ড নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {bangladeshiBoards.map((board) => (
                        <SelectItem key={board} value={board}>{board}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalName">প্রধান শিক্ষকের নাম (ইংরেজি)</Label>
                  <Input
                    id="principalName"
                    value={schoolInfo.principalName}
                    onChange={(e) => setSchoolInfo({...schoolInfo, principalName: e.target.value})}
                    placeholder="Principal's Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalNameBn">প্রধান শিক্ষকের নাম (বাংলা)</Label>
                  <Input
                    id="principalNameBn"
                    value={schoolInfo.principalNameBn}
                    onChange={(e) => setSchoolInfo({...schoolInfo, principalNameBn: e.target.value})}
                    placeholder="প্রধান শিক্ষকের নাম"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle>শিক্ষার্থীর তথ্য</CardTitle>
              <CardDescription>শিক্ষার্থীর সম্পূর্ণ তথ্য প্রদান করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">শিক্ষার্থীর নাম (ইংরেজি)</Label>
                  <Input
                    id="studentName"
                    value={studentInfo.name}
                    onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                    placeholder="Student Name in English"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentNameBn">শিক্ষার্থীর নাম (বাংলা)</Label>
                  <Input
                    id="studentNameBn"
                    value={studentInfo.nameBn}
                    onChange={(e) => setStudentInfo({...studentInfo, nameBn: e.target.value})}
                    placeholder="শিক্ষার্থীর নাম বাংলায়"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherName">পিতার নাম (ইংরেজি)</Label>
                  <Input
                    id="fatherName"
                    value={studentInfo.fatherName}
                    onChange={(e) => setStudentInfo({...studentInfo, fatherName: e.target.value})}
                    placeholder="Father's Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherNameBn">পিতার নাম (বাংলা)</Label>
                  <Input
                    id="fatherNameBn"
                    value={studentInfo.fatherNameBn}
                    onChange={(e) => setStudentInfo({...studentInfo, fatherNameBn: e.target.value})}
                    placeholder="পিতার নাম"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">মাতার নাম (ইংরেজি)</Label>
                  <Input
                    id="motherName"
                    value={studentInfo.motherName}
                    onChange={(e) => setStudentInfo({...studentInfo, motherName: e.target.value})}
                    placeholder="Mother's Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherNameBn">মাতার নাম (বাংলা)</Label>
                  <Input
                    id="motherNameBn"
                    value={studentInfo.motherNameBn}
                    onChange={(e) => setStudentInfo({...studentInfo, motherNameBn: e.target.value})}
                    placeholder="মাতার নাম"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">জন্ম তারিখ</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={studentInfo.dateOfBirth}
                    onChange={(e) => setStudentInfo({...studentInfo, dateOfBirth: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">রোল নম্বর</Label>
                  <Input
                    id="rollNumber"
                    value={studentInfo.rollNumber}
                    onChange={(e) => setStudentInfo({...studentInfo, rollNumber: e.target.value})}
                    placeholder="রোল নম্বর"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">নিবন্ধন নম্বর</Label>
                  <Input
                    id="registrationNumber"
                    value={studentInfo.registrationNumber}
                    onChange={(e) => setStudentInfo({...studentInfo, registrationNumber: e.target.value})}
                    placeholder="নিবন্ধন নম্বর"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">শ্রেণি</Label>
                  <Select value={studentInfo.class} onValueChange={(value) => setStudentInfo({...studentInfo, class: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">শাখা</Label>
                  <Input
                    id="section"
                    value={studentInfo.section}
                    onChange={(e) => setStudentInfo({...studentInfo, section: e.target.value})}
                    placeholder="যেমন: ক, খ, গ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group">বিভাগ</Label>
                  <Select value={studentInfo.group} onValueChange={(value) => setStudentInfo({...studentInfo, group: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session">শিক্ষাবর্ষ</Label>
                  <Input
                    id="session"
                    value={studentInfo.session}
                    onChange={(e) => setStudentInfo({...studentInfo, session: e.target.value})}
                    placeholder="যেমন: ২০২৪"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionDate">ভর্তির তারিখ</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={studentInfo.admissionDate}
                    onChange={(e) => setStudentInfo({...studentInfo, admissionDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leavingDate">প্রস্থানের তারিখ</Label>
                  <Input
                    id="leavingDate"
                    type="date"
                    value={studentInfo.leavingDate}
                    onChange={(e) => setStudentInfo({...studentInfo, leavingDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastAttendance">সর্বশেষ উপস্থিতির তারিখ</Label>
                  <Input
                    id="lastAttendance"
                    type="date"
                    value={studentInfo.lastAttendance}
                    onChange={(e) => setStudentInfo({...studentInfo, lastAttendance: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="reasonForLeaving">প্রস্থানের কারণ</Label>
                  <Select value={studentInfo.reasonForLeaving} onValueChange={(value) => setStudentInfo({...studentInfo, reasonForLeaving: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="প্রস্থানের কারণ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {reasonsForLeaving.map((reason) => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Preview */}
          <Card>
            <CardHeader>
              <CardTitle>সনদপত্র প্রিভিউ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-8 border-2 border-gray-200 rounded-lg">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold mb-2">স্থানান্তর সনদপত্র</h1>
                  <h2 className="text-xl mb-1">TRANSFER CERTIFICATE</h2>
                  <p className="text-sm">সনদপত্র নম্বর: {certificateNumber || '___________'}</p>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold">{schoolInfo.schoolNameBn || 'প্রতিষ্ঠানের নাম'}</h3>
                  <h4 className="text-md">{schoolInfo.schoolName || 'School Name'}</h4>
                  <p className="text-sm">{schoolInfo.addressBn || 'ঠিকানা'}</p>
                  <p className="text-sm">EIIN: {schoolInfo.eiin || '______'} | Board: {schoolInfo.boardName || '___________'}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <p>এতদ্বারা প্রত্যয়ন করা যাচ্ছে যে,</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>শিক্ষার্থীর নাম: <strong>{studentInfo.nameBn || '___________'}</strong></div>
                    <div>Student Name: <strong>{studentInfo.name || '___________'}</strong></div>
                    <div>পিতার নাম: <strong>{studentInfo.fatherNameBn || '___________'}</strong></div>
                    <div>Father's Name: <strong>{studentInfo.fatherName || '___________'}</strong></div>
                    <div>মাতার নাম: <strong>{studentInfo.motherNameBn || '___________'}</strong></div>
                    <div>Mother's Name: <strong>{studentInfo.motherName || '___________'}</strong></div>
                    <div>জন্ম তারিখ: <strong>{studentInfo.dateOfBirth || '___________'}</strong></div>
                    <div>রোল নম্বর: <strong>{studentInfo.rollNumber || '___________'}</strong></div>
                    <div>নিবন্ধন নম্বর: <strong>{studentInfo.registrationNumber || '___________'}</strong></div>
                    <div>শ্রেণি: <strong>{studentInfo.class || '___________'}</strong></div>
                    <div>শাখা: <strong>{studentInfo.section || '___________'}</strong></div>
                    <div>বিভাগ: <strong>{studentInfo.group || '___________'}</strong></div>
                    <div>শিক্ষাবর্ষ: <strong>{studentInfo.session || '___________'}</strong></div>
                    <div>ভর্তির তারিখ: <strong>{studentInfo.admissionDate || '___________'}</strong></div>
                    <div>প্রস্থানের তারিখ: <strong>{studentInfo.leavingDate || '___________'}</strong></div>
                    <div>সর্বশেষ উপস্থিতি: <strong>{studentInfo.lastAttendance || '___________'}</strong></div>
                  </div>

                  <p>প্রস্থানের কারণ: <strong>{studentInfo.reasonForLeaving || '___________'}</strong></p>

                  <p className="mt-4">
                    উক্ত শিক্ষার্থী আমাদের প্রতিষ্ঠানে অধ্যয়নকালে তার চরিত্র ও আচরণ সন্তোষজনক ছিল। 
                    তার ভবিষ্যৎ জীবনে সুখ ও সমৃদ্ধি কামনা করি।
                  </p>
                </div>

                <div className="flex justify-between items-end mt-12">
                  <div className="text-center">
                    <div className="border-t border-black w-32 mb-1"></div>
                    <p className="text-xs">তারিখ / Date</p>
                  </div>
                  <div className="text-center">
                    <div className="mb-8"></div>
                    <div className="border-t border-black w-40 mb-1"></div>
                    <p className="text-xs">প্রধান শিক্ষক / Principal</p>
                    <p className="text-xs font-medium">{schoolInfo.principalNameBn || schoolInfo.principalName || 'প্রধান শিক্ষকের নাম'}</p>
                    <p className="text-xs">{schoolInfo.schoolNameBn || 'প্রতিষ্ঠানের নাম'}</p>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <p className="text-xs text-gray-600">[প্রতিষ্ঠানের সিল / School Seal]</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">স্থানান্তর সনদপত্র তৈরি করুন</h3>
                  <p className="text-sm text-gray-600">
                    শিক্ষার্থী: {studentInfo.nameBn || 'নাম প্রয়োজন'} • সনদপত্র নং: {certificateNumber || 'নম্বর প্রয়োজন'}
                  </p>
                </div>
                <Button onClick={generateCertificate} size="lg">
                  <span className="material-icons mr-2">print</span>
                  সনদপত্র তৈরি করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsivePageLayout>
    </AppShell>
  );
}