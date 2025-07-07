import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ResponsivePageLayout } from '@/components/layout/responsive-page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  type: 'mcq' | 'short' | 'long' | 'fill-blank' | 'true-false';
  question: string;
  questionBn: string;
  marks: number;
  options?: string[];
  optionsBn?: string[];
  correctAnswer?: string;
}

export default function ExamPapersPage() {
  const { toast } = useToast();
  const [examData, setExamData] = useState({
    title: '',
    titleBn: '',
    subject: '',
    subjectBn: '',
    class: '',
    duration: '',
    totalMarks: '',
    date: '',
    instructions: '',
    instructionsBn: '',
    boardName: '',
    schoolName: '',
    schoolNameBn: ''
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: 'mcq',
    marks: 1
  });

  const bangladeshiBoards = [
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, চট্টগ্রাম',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, কুমিল্লা',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, যশোর',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, বরিশাল',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, সিলেট',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, রাজশাহী',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, দিনাজপুর',
    'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ময়মনসিংহ',
    'কারিগরি শিক্ষা বোর্ড',
    'মাদ্রাসা শিক্ষা বোর্ড'
  ];

  const questionTypes = [
    { value: 'mcq', label: 'বহুনির্বাচনী (MCQ)', labelEn: 'Multiple Choice' },
    { value: 'short', label: 'সংক্ষিপ্ত প্রশ্ন', labelEn: 'Short Answer' },
    { value: 'long', label: 'রচনামূলক', labelEn: 'Long Answer' },
    { value: 'fill-blank', label: 'শূন্যস্থান পূরণ', labelEn: 'Fill in the Blanks' },
    { value: 'true-false', label: 'সত্য/মিথ্যা', labelEn: 'True/False' }
  ];

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.questionBn) {
      toast({
        title: "ত্রুটি",
        description: "প্রশ্ন ইংরেজি ও বাংলা উভয় ভাষায় লিখুন",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      type: currentQuestion.type as Question['type'],
      question: currentQuestion.question!,
      questionBn: currentQuestion.questionBn!,
      marks: currentQuestion.marks || 1,
      options: currentQuestion.options || [],
      optionsBn: currentQuestion.optionsBn || [],
      correctAnswer: currentQuestion.correctAnswer
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({ type: 'mcq', marks: 1 });
    
    toast({
      title: "সফল",
      description: "প্রশ্ন যোগ করা হয়েছে"
    });
  };

  const generatePaper = () => {
    if (!examData.title || questions.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "পরীক্ষার শিরোনাম ও প্রশ্ন যোগ করুন",
        variant: "destructive"
      });
      return;
    }

    // This would typically generate a PDF or formatted document
    toast({
      title: "সফল",
      description: "প্রশ্নপত্র তৈরি হয়েছে"
    });
  };

  return (
    <AppShell>
      <ResponsivePageLayout
        title="পরীক্ষার প্রশ্নপত্র"
        description="পেশাদার পরীক্ষার প্রশ্নপত্র তৈরি করুন"
      >
        <div className="space-y-6">
          {/* Exam Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">assignment</span>
                পরীক্ষার তথ্য
              </CardTitle>
              <CardDescription>পরীক্ষার মূল তথ্য প্রদান করুন</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">পরীক্ষার নাম (ইংরেজি)</Label>
                  <Input
                    id="title"
                    value={examData.title}
                    onChange={(e) => setExamData({...examData, title: e.target.value})}
                    placeholder="e.g., Mid-term Examination 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleBn">পরীক্ষার নাম (বাংলা)</Label>
                  <Input
                    id="titleBn"
                    value={examData.titleBn}
                    onChange={(e) => setExamData({...examData, titleBn: e.target.value})}
                    placeholder="যেমন: অর্ধবার্ষিক পরীক্ষা ২০২৪"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">বিষয় (ইংরেজি)</Label>
                  <Input
                    id="subject"
                    value={examData.subject}
                    onChange={(e) => setExamData({...examData, subject: e.target.value})}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjectBn">বিষয় (বাংলা)</Label>
                  <Input
                    id="subjectBn"
                    value={examData.subjectBn}
                    onChange={(e) => setExamData({...examData, subjectBn: e.target.value})}
                    placeholder="যেমন: গণিত"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">শ্রেণি</Label>
                  <Select value={examData.class} onValueChange={(value) => setExamData({...examData, class: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">প্রথম শ্রেণি</SelectItem>
                      <SelectItem value="2">দ্বিতীয় শ্রেণি</SelectItem>
                      <SelectItem value="3">তৃতীয় শ্রেণি</SelectItem>
                      <SelectItem value="4">চতুর্থ শ্রেণি</SelectItem>
                      <SelectItem value="5">পঞ্চম শ্রেণি</SelectItem>
                      <SelectItem value="6">ষষ্ঠ শ্রেণি</SelectItem>
                      <SelectItem value="7">সপ্তম শ্রেণি</SelectItem>
                      <SelectItem value="8">অষ্টম শ্রেণি</SelectItem>
                      <SelectItem value="9">নবম শ্রেণি</SelectItem>
                      <SelectItem value="10">দশম শ্রেণি</SelectItem>
                      <SelectItem value="11">একাদশ শ্রেণি</SelectItem>
                      <SelectItem value="12">দ্বাদশ শ্রেণি</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">সময়কাল (মিনিট)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={examData.duration}
                    onChange={(e) => setExamData({...examData, duration: e.target.value})}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">পূর্ণমান</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={examData.totalMarks}
                    onChange={(e) => setExamData({...examData, totalMarks: e.target.value})}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">পরীক্ষার তারিখ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={examData.date}
                    onChange={(e) => setExamData({...examData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="boardName">বোর্ড/প্রতিষ্ঠান</Label>
                  <Select value={examData.boardName} onValueChange={(value) => setExamData({...examData, boardName: value})}>
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

          {/* Questions Section */}
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">প্রশ্ন যোগ করুন</TabsTrigger>
              <TabsTrigger value="preview">প্রশ্ন তালিকা ({questions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle>নতুন প্রশ্ন যোগ করুন</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>প্রশ্নের ধরন</Label>
                      <Select 
                        value={currentQuestion.type} 
                        onValueChange={(value) => setCurrentQuestion({...currentQuestion, type: value as Question['type']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>নম্বর</Label>
                      <Input
                        type="number"
                        value={currentQuestion.marks}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, marks: parseInt(e.target.value)})}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>প্রশ্ন (ইংরেজি)</Label>
                    <Textarea
                      value={currentQuestion.question || ''}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      placeholder="Enter the question in English"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>প্রশ্ন (বাংলা)</Label>
                    <Textarea
                      value={currentQuestion.questionBn || ''}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, questionBn: e.target.value})}
                      placeholder="প্রশ্নটি বাংলায় লিখুন"
                      rows={3}
                    />
                  </div>

                  {currentQuestion.type === 'mcq' && (
                    <div className="space-y-4">
                      <Label>বিকল্প উত্তর</Label>
                      {[0, 1, 2, 3].map((index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + index)} (English)`}
                            value={currentQuestion.options?.[index] || ''}
                            onChange={(e) => {
                              const options = [...(currentQuestion.options || ['', '', '', ''])];
                              options[index] = e.target.value;
                              setCurrentQuestion({...currentQuestion, options});
                            }}
                          />
                          <Input
                            placeholder={`বিকল্প ${String.fromCharCode(65 + index)} (বাংলা)`}
                            value={currentQuestion.optionsBn?.[index] || ''}
                            onChange={(e) => {
                              const optionsBn = [...(currentQuestion.optionsBn || ['', '', '', ''])];
                              optionsBn[index] = e.target.value;
                              setCurrentQuestion({...currentQuestion, optionsBn});
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={addQuestion} className="w-full">
                    <span className="material-icons mr-2">add</span>
                    প্রশ্ন যোগ করুন
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>প্রশ্ন তালিকা</CardTitle>
                  <CardDescription>যোগ করা প্রশ্নসমূহ</CardDescription>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <span className="material-icons text-4xl mb-2">quiz</span>
                      <p>এখনো কোন প্রশ্ন যোগ করা হয়নি</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <Card key={question.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">প্রশ্ন {index + 1}</Badge>
                                <Badge>{questionTypes.find(t => t.value === question.type)?.label}</Badge>
                                <Badge variant="outline">{question.marks} নম্বর</Badge>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setQuestions(questions.filter(q => q.id !== question.id))}
                              >
                                <span className="material-icons text-red-500">delete</span>
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <p className="font-medium">{question.questionBn}</p>
                              <p className="text-sm text-gray-600">{question.question}</p>
                              {question.type === 'mcq' && question.optionsBn && (
                                <div className="grid grid-cols-2 gap-1 mt-2 text-sm">
                                  {question.optionsBn.map((option, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                      <span className="font-mono">{String.fromCharCode(65 + i)}.</span>
                                      <span>{option}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Generate Button */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">প্রশ্নপত্র তৈরি করুন</h3>
                  <p className="text-sm text-gray-600">
                    মোট {questions.length} টি প্রশ্ন • {questions.reduce((sum, q) => sum + q.marks, 0)} নম্বর
                  </p>
                </div>
                <Button onClick={generatePaper} size="lg" disabled={questions.length === 0}>
                  <span className="material-icons mr-2">print</span>
                  প্রশ্নপত্র তৈরি করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsivePageLayout>
    </AppShell>
  );
}