import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ResponsivePageLayout } from '@/components/layout/responsive-page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface OMRConfig {
  examTitle: string;
  examTitleBn: string;
  subject: string;
  subjectBn: string;
  totalQuestions: number;
  optionsPerQuestion: number;
  rollNumberDigits: number;
  includeStudentInfo: boolean;
  includeInstructions: boolean;
  paperSize: 'A4' | 'A3' | 'Letter';
  layout: 'single' | 'double';
  bubbleSize: 'small' | 'medium' | 'large';
  boardName: string;
  examDate: string;
  examCode: string;
}

export default function OMRSheetsPage() {
  const { toast } = useToast();
  
  const [config, setConfig] = useState<OMRConfig>({
    examTitle: '',
    examTitleBn: '',
    subject: '',
    subjectBn: '',
    totalQuestions: 50,
    optionsPerQuestion: 4,
    rollNumberDigits: 6,
    includeStudentInfo: true,
    includeInstructions: true,
    paperSize: 'A4',
    layout: 'single',
    bubbleSize: 'medium',
    boardName: '',
    examDate: '',
    examCode: ''
  });

  const [previewMode, setPreviewMode] = useState<'config' | 'preview'>('config');

  const bangladeshiBoards = [
    'বাংলাদেশ শিক্ষা বোর্ড',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, চট্টগ্রাম',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, রাজশাহী',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, সিলেট',
    'কারিগরি শিক্ষা বোর্ড',
    'মাদ্রাসা শিক্ষা বোর্ড'
  ];

  const generateOMR = () => {
    if (!config.examTitle || !config.totalQuestions) {
      toast({
        title: "ত্রুটি",
        description: "পরীক্ষার নাম এবং প্রশ্ন সংখ্যা প্রয়োজন",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "সফল",
      description: "ওএমআর শিট তৈরি হয়েছে"
    });
  };

  const OMRPreview = () => {
    const questions = Array.from({ length: Math.min(config.totalQuestions, 20) }, (_, i) => i + 1);
    const options = Array.from({ length: config.optionsPerQuestion }, (_, i) => String.fromCharCode(65 + i));

    return (
      <div className="bg-white p-8 border rounded-lg shadow-sm max-w-2xl mx-auto" style={{ minHeight: '800px' }}>
        {/* Header */}
        <div className="text-center mb-6 border-b pb-4">
          <h1 className="text-xl font-bold mb-1">{config.examTitleBn || 'পরীক্ষার নাম'}</h1>
          <h2 className="text-lg mb-2">{config.examTitle || 'Exam Title'}</h2>
          <div className="text-sm space-y-1">
            <p><strong>বিষয়:</strong> {config.subjectBn || 'বিষয়'} ({config.subject || 'Subject'})</p>
            <p><strong>বোর্ড:</strong> {config.boardName || 'শিক্ষা বোর্ড'}</p>
            <p><strong>তারিখ:</strong> {config.examDate || '___________'}</p>
            <p><strong>পরীক্ষা কোড:</strong> {config.examCode || '___________'}</p>
          </div>
        </div>

        {/* Student Information Section */}
        {config.includeStudentInfo && (
          <div className="mb-6 border rounded p-4">
            <h3 className="font-semibold mb-3">শিক্ষার্থীর তথ্য / Student Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block mb-1">নাম / Name:</label>
                <div className="border-b border-dotted w-full h-6"></div>
              </div>
              <div>
                <label className="block mb-1">রোল নম্বর / Roll Number:</label>
                <div className="border-b border-dotted w-full h-6"></div>
              </div>
              <div>
                <label className="block mb-1">শ্রেণি / Class:</label>
                <div className="border-b border-dotted w-full h-6"></div>
              </div>
              <div>
                <label className="block mb-1">শাখা / Section:</label>
                <div className="border-b border-dotted w-full h-6"></div>
              </div>
            </div>
            
            {/* Roll Number Bubbles */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">রোল নম্বর পূরণ করুন / Fill Roll Number:</h4>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: config.rollNumberDigits }, (_, digitIndex) => (
                  <div key={digitIndex} className="text-center">
                    <div className="text-xs mb-1">অঙ্ক {digitIndex + 1}</div>
                    <div className="space-y-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <div key={num} className="flex items-center justify-center">
                          <span className="text-xs mr-1">{num}</span>
                          <div className={`w-3 h-3 border border-black rounded-full ${config.bubbleSize === 'small' ? 'w-2 h-2' : config.bubbleSize === 'large' ? 'w-4 h-4' : 'w-3 h-3'}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {config.includeInstructions && (
          <div className="mb-6 bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">নির্দেশনা / Instructions:</h3>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>শুধুমাত্র কালো বল পয়েন্ট কলম ব্যবহার করুন / Use only black ball point pen</li>
              <li>বৃত্তটি সম্পূর্ণভাবে ভরাট করুন / Fill the circle completely</li>
              <li>ভুল উত্তর মুছবেন না / Do not erase wrong answers</li>
              <li>একাধিক উত্তর দিবেন না / Do not mark multiple answers</li>
              <li>ওএমআর শিট ভাঁজ করবেন না / Do not fold the OMR sheet</li>
            </ul>
          </div>
        )}

        {/* Answer Sections */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center">উত্তরপত্র / Answer Sheet</h3>
          
          {config.layout === 'single' ? (
            // Single column layout
            <div className="grid grid-cols-5 gap-4">
              {questions.map(questionNum => (
                <div key={questionNum} className="text-center">
                  <div className="text-sm font-medium mb-1">{questionNum}</div>
                  <div className="space-y-1">
                    {options.map(option => (
                      <div key={option} className="flex items-center justify-center gap-1">
                        <span className="text-xs">{option}</span>
                        <div className={`border border-black rounded-full ${config.bubbleSize === 'small' ? 'w-2 h-2' : config.bubbleSize === 'large' ? 'w-4 h-4' : 'w-3 h-3'}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Double column layout
            <div className="grid grid-cols-2 gap-8">
              <div className="grid grid-cols-5 gap-2">
                {questions.slice(0, Math.ceil(questions.length / 2)).map(questionNum => (
                  <div key={questionNum} className="text-center">
                    <div className="text-sm font-medium mb-1">{questionNum}</div>
                    <div className="space-y-1">
                      {options.map(option => (
                        <div key={option} className="flex items-center justify-center gap-1">
                          <span className="text-xs">{option}</span>
                          <div className={`border border-black rounded-full ${config.bubbleSize === 'small' ? 'w-2 h-2' : config.bubbleSize === 'large' ? 'w-4 h-4' : 'w-3 h-3'}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {questions.slice(Math.ceil(questions.length / 2)).map(questionNum => (
                  <div key={questionNum} className="text-center">
                    <div className="text-sm font-medium mb-1">{questionNum}</div>
                    <div className="space-y-1">
                      {options.map(option => (
                        <div key={option} className="flex items-center justify-center gap-1">
                          <span className="text-xs">{option}</span>
                          <div className={`border border-black rounded-full ${config.bubbleSize === 'small' ? 'w-2 h-2' : config.bubbleSize === 'large' ? 'w-4 h-4' : 'w-3 h-3'}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-600">
          <p>স্বাক্ষর / Signature: _________________ &nbsp;&nbsp;&nbsp; তারিখ / Date: _________________</p>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <ResponsivePageLayout
        title="ওএমআর শিট তৈরি করুন"
        description="পেশাদার ওএমআর উত্তরপত্র ডিজাইন ও তৈরি করুন"
      >
        <div className="space-y-6">
          {/* Mode Toggle */}
          <Card>
            <CardContent className="p-4">
              <RadioGroup 
                value={previewMode} 
                onValueChange={(value) => setPreviewMode(value as 'config' | 'preview')}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="config" id="config" />
                  <Label htmlFor="config">কনফিগারেশন</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="preview" id="preview" />
                  <Label htmlFor="preview">প্রিভিউ</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {previewMode === 'config' ? (
            <>
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="material-icons">ballot</span>
                    মূল তথ্য
                  </CardTitle>
                  <CardDescription>ওএমআর শিটের মূল তথ্য প্রদান করুন</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="examTitle">পরীক্ষার নাম (ইংরেজি)</Label>
                      <Input
                        id="examTitle"
                        value={config.examTitle}
                        onChange={(e) => setConfig({...config, examTitle: e.target.value})}
                        placeholder="e.g., Final Examination 2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="examTitleBn">পরীক্ষার নাম (বাংলা)</Label>
                      <Input
                        id="examTitleBn"
                        value={config.examTitleBn}
                        onChange={(e) => setConfig({...config, examTitleBn: e.target.value})}
                        placeholder="যেমন: বার্ষিক পরীক্ষা ২০২৪"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">বিষয় (ইংরেজি)</Label>
                      <Input
                        id="subject"
                        value={config.subject}
                        onChange={(e) => setConfig({...config, subject: e.target.value})}
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjectBn">বিষয় (বাংলা)</Label>
                      <Input
                        id="subjectBn"
                        value={config.subjectBn}
                        onChange={(e) => setConfig({...config, subjectBn: e.target.value})}
                        placeholder="যেমন: গণিত"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="examDate">পরীক্ষার তারিখ</Label>
                      <Input
                        id="examDate"
                        type="date"
                        value={config.examDate}
                        onChange={(e) => setConfig({...config, examDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="examCode">পরীক্ষা কোড</Label>
                      <Input
                        id="examCode"
                        value={config.examCode}
                        onChange={(e) => setConfig({...config, examCode: e.target.value})}
                        placeholder="যেমন: MATH-2024-01"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="boardName">বোর্ড/প্রতিষ্ঠান</Label>
                      <Select value={config.boardName} onValueChange={(value) => setConfig({...config, boardName: value})}>
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
                  </div>
                </CardContent>
              </Card>

              {/* OMR Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>ওএমআর কনফিগারেশন</CardTitle>
                  <CardDescription>ওএমআর শিটের লেআউট ও ডিজাইন সেটিংস</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalQuestions">মোট প্রশ্ন সংখ্যা</Label>
                      <Input
                        id="totalQuestions"
                        type="number"
                        value={config.totalQuestions}
                        onChange={(e) => setConfig({...config, totalQuestions: parseInt(e.target.value)})}
                        min="1"
                        max="200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="optionsPerQuestion">প্রতি প্রশ্নের বিকল্প</Label>
                      <Select 
                        value={config.optionsPerQuestion.toString()} 
                        onValueChange={(value) => setConfig({...config, optionsPerQuestion: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">৩টি (A, B, C)</SelectItem>
                          <SelectItem value="4">৪টি (A, B, C, D)</SelectItem>
                          <SelectItem value="5">৫টি (A, B, C, D, E)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumberDigits">রোল নম্বর ডিজিট</Label>
                      <Select 
                        value={config.rollNumberDigits.toString()} 
                        onValueChange={(value) => setConfig({...config, rollNumberDigits: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">৪ ডিজিট</SelectItem>
                          <SelectItem value="5">৫ ডিজিট</SelectItem>
                          <SelectItem value="6">৬ ডিজিট</SelectItem>
                          <SelectItem value="7">৭ ডিজিট</SelectItem>
                          <SelectItem value="8">৮ ডিজিট</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>পেপার সাইজ</Label>
                      <Select value={config.paperSize} onValueChange={(value) => setConfig({...config, paperSize: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4 (২১০ × ২৯৭ মি.মি.)</SelectItem>
                          <SelectItem value="A3">A3 (২৯৭ × ৪২০ মি.মি.)</SelectItem>
                          <SelectItem value="Letter">Letter (২১৬ × ২৭৯ মি.মি.)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>লেআউট</Label>
                      <Select value={config.layout} onValueChange={(value) => setConfig({...config, layout: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">একক কলাম</SelectItem>
                          <SelectItem value="double">দ্বৈত কলাম</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>বুদবুদের আকার</Label>
                      <Select value={config.bubbleSize} onValueChange={(value) => setConfig({...config, bubbleSize: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">ছোট</SelectItem>
                          <SelectItem value="medium">মাঝারি</SelectItem>
                          <SelectItem value="large">বড়</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeStudentInfo"
                        checked={config.includeStudentInfo}
                        onCheckedChange={(checked) => setConfig({...config, includeStudentInfo: checked as boolean})}
                      />
                      <Label htmlFor="includeStudentInfo">শিক্ষার্থীর তথ্য অংশ যুক্ত করুন</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeInstructions"
                        checked={config.includeInstructions}
                        onCheckedChange={(checked) => setConfig({...config, includeInstructions: checked as boolean})}
                      />
                      <Label htmlFor="includeInstructions">নির্দেশনা অংশ যুক্ত করুন</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // Preview Mode
            <Card>
              <CardHeader>
                <CardTitle>ওএমআর শিট প্রিভিউ</CardTitle>
                <CardDescription>
                  মোট {config.totalQuestions} প্রশ্ন • {config.optionsPerQuestion} বিকল্প • {config.paperSize} সাইজ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OMRPreview />
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">ওএমআর শিট তৈরি করুন</h3>
                  <p className="text-sm text-gray-600">
                    {config.totalQuestions} প্রশ্ন • {config.optionsPerQuestion} বিকল্প • {config.paperSize} পেপার
                  </p>
                </div>
                <Button onClick={generateOMR} size="lg">
                  <span className="material-icons mr-2">print</span>
                  ওএমআর শিট তৈরি করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsivePageLayout>
    </AppShell>
  );
}