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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface MCQQuestion {
  id: string;
  question: string;
  questionBn: string;
  options: string[];
  optionsBn: string[];
  correctAnswer: number;
  explanation?: string;
  explanationBn?: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  topicBn: string;
}

interface ExamSettings {
  title: string;
  titleBn: string;
  subject: string;
  subjectBn: string;
  class: string;
  duration: number;
  totalMarks: number;
  instructions: string;
  instructionsBn: string;
  negativeMarking: boolean;
  negativeMarkingValue: number;
}

export default function MCQFormatsPage() {
  const { toast } = useToast();
  
  const [examSettings, setExamSettings] = useState<ExamSettings>({
    title: '',
    titleBn: '',
    subject: '',
    subjectBn: '',
    class: '',
    duration: 120,
    totalMarks: 100,
    instructions: '',
    instructionsBn: '',
    negativeMarking: false,
    negativeMarkingValue: 0.25
  });

  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<MCQQuestion>>({
    options: ['', '', '', ''],
    optionsBn: ['', '', '', ''],
    marks: 1,
    difficulty: 'medium',
    correctAnswer: 0
  });

  const [activeTab, setActiveTab] = useState<'settings' | 'questions' | 'preview'>('settings');

  const difficultyLevels = [
    { value: 'easy', label: 'সহজ', labelEn: 'Easy' },
    { value: 'medium', label: 'মাঝারি', labelEn: 'Medium' },
    { value: 'hard', label: 'কঠিন', labelEn: 'Hard' }
  ];

  const classes = [
    'ষষ্ঠ শ্রেণি', 'সপ্তম শ্রেণি', 'অষ্টম শ্রেণি', 'নবম শ্রেণি', 'দশম শ্রেণি',
    'একাদশ শ্রেণি', 'দ্বাদশ শ্রেণি'
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

    if (!currentQuestion.options?.every(opt => opt.trim()) || 
        !currentQuestion.optionsBn?.every(opt => opt.trim())) {
      toast({
        title: "ত্রুটি",
        description: "সকল বিকল্প উত্তর পূরণ করুন",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: MCQQuestion = {
      id: Date.now().toString(),
      question: currentQuestion.question!,
      questionBn: currentQuestion.questionBn!,
      options: currentQuestion.options!,
      optionsBn: currentQuestion.optionsBn!,
      correctAnswer: currentQuestion.correctAnswer!,
      explanation: currentQuestion.explanation,
      explanationBn: currentQuestion.explanationBn,
      marks: currentQuestion.marks || 1,
      difficulty: currentQuestion.difficulty || 'medium',
      topic: currentQuestion.topic || '',
      topicBn: currentQuestion.topicBn || ''
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      options: ['', '', '', ''],
      optionsBn: ['', '', '', ''],
      marks: 1,
      difficulty: 'medium',
      correctAnswer: 0
    });

    toast({
      title: "সফল",
      description: "প্রশ্ন যোগ করা হয়েছে"
    });
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const generateMCQPaper = () => {
    if (!examSettings.title || questions.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "পরীক্ষার তথ্য ও প্রশ্ন যোগ করুন",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "সফল",
      description: "MCQ প্রশ্নপত্র তৈরি হয়েছে"
    });
  };

  const MCQPreview = () => {
    return (
      <div className="bg-white p-8 border rounded-lg shadow-sm max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 border-b pb-4">
          <h1 className="text-xl font-bold mb-2">{examSettings.titleBn || 'পরীক্ষার নাম'}</h1>
          <h2 className="text-lg mb-1">{examSettings.title || 'Exam Title'}</h2>
          <div className="text-sm grid grid-cols-2 gap-4 mt-4">
            <div>বিষয়: <strong>{examSettings.subjectBn || 'বিষয়'}</strong></div>
            <div>Subject: <strong>{examSettings.subject || 'Subject'}</strong></div>
            <div>শ্রেণি: <strong>{examSettings.class || 'শ্রেণি'}</strong></div>
            <div>সময়: <strong>{examSettings.duration} মিনিট</strong></div>
            <div>পূর্ণমান: <strong>{examSettings.totalMarks} নম্বর</strong></div>
            <div>প্রশ্ন সংখ্যা: <strong>{questions.length} টি</strong></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">নির্দেশনা / Instructions:</h3>
          <div className="text-sm space-y-1">
            <p>• সঠিক উত্তরের জন্য প্রদত্ত চারটি বিকল্পের মধ্যে যেকোনো একটি নির্বাচন করুন।</p>
            <p>• প্রতিটি প্রশ্নের মান ১ নম্বর।</p>
            {examSettings.negativeMarking && (
              <p className="text-red-600">• ভুল উত্তরের জন্য {examSettings.negativeMarkingValue} নম্বর কাটা যাবে।</p>
            )}
            <p>• Choose the correct answer from the four given options.</p>
            <p>• Each question carries 1 mark.</p>
            {examSettings.negativeMarking && (
              <p className="text-red-600">• {examSettings.negativeMarkingValue} marks will be deducted for wrong answers.</p>
            )}
            {examSettings.instructionsBn && <p>• {examSettings.instructionsBn}</p>}
            {examSettings.instructions && <p>• {examSettings.instructions}</p>}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="border-l-4 border-l-primary pl-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">প্রশ্ন {index + 1}</Badge>
                  <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                    {difficultyLevels.find(d => d.value === question.difficulty)?.label}
                  </Badge>
                  <span className="text-sm text-gray-600">[{question.marks} নম্বর]</span>
                </div>
                {question.topic && (
                  <Badge variant="outline" className="text-xs">{question.topicBn || question.topic}</Badge>
                )}
              </div>
              
              <div className="mb-3">
                <p className="font-medium text-gray-900 mb-1">{question.questionBn}</p>
                <p className="text-sm text-gray-600">{question.question}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                {question.optionsBn.map((option, optIndex) => (
                  <div key={optIndex} className={`p-2 rounded border ${question.correctAnswer === optIndex ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-sm font-semibold">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <div className="flex-1">
                        <p className="text-sm">{option}</p>
                        <p className="text-xs text-gray-600">{question.options[optIndex]}</p>
                      </div>
                      {question.correctAnswer === optIndex && (
                        <span className="material-icons text-green-600 text-sm">check_circle</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {question.explanationBn && (
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <p className="font-medium text-blue-800 mb-1">ব্যাখ্যা:</p>
                  <p className="text-blue-700 mb-1">{question.explanationBn}</p>
                  {question.explanation && (
                    <p className="text-blue-600 text-xs">{question.explanation}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <ResponsivePageLayout
        title="MCQ প্রশ্ন ফরম্যাট"
        description="বহুনির্বাচনী প্রশ্নের ফরম্যাট তৈরি করুন"
      >
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">পরীক্ষার সেটিংস</TabsTrigger>
              <TabsTrigger value="questions">প্রশ্ন যোগ করুন ({questions.length})</TabsTrigger>
              <TabsTrigger value="preview">প্রিভিউ</TabsTrigger>
            </TabsList>

            {/* Exam Settings */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="material-icons">quiz</span>
                    পরীক্ষার তথ্য
                  </CardTitle>
                  <CardDescription>MCQ পরীক্ষার মূল তথ্য প্রদান করুন</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">পরীক্ষার নাম (ইংরেজি)</Label>
                      <Input
                        id="title"
                        value={examSettings.title}
                        onChange={(e) => setExamSettings({...examSettings, title: e.target.value})}
                        placeholder="e.g., Monthly Test - Mathematics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="titleBn">পরীক্ষার নাম (বাংলা)</Label>
                      <Input
                        id="titleBn"
                        value={examSettings.titleBn}
                        onChange={(e) => setExamSettings({...examSettings, titleBn: e.target.value})}
                        placeholder="যেমন: মাসিক পরীক্ষা - গণিত"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">বিষয় (ইংরেজি)</Label>
                      <Input
                        id="subject"
                        value={examSettings.subject}
                        onChange={(e) => setExamSettings({...examSettings, subject: e.target.value})}
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjectBn">বিষয় (বাংলা)</Label>
                      <Input
                        id="subjectBn"
                        value={examSettings.subjectBn}
                        onChange={(e) => setExamSettings({...examSettings, subjectBn: e.target.value})}
                        placeholder="যেমন: গণিত"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">শ্রেণি</Label>
                      <Select value={examSettings.class} onValueChange={(value) => setExamSettings({...examSettings, class: value})}>
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
                      <Label htmlFor="duration">সময়কাল (মিনিট)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={examSettings.duration}
                        onChange={(e) => setExamSettings({...examSettings, duration: parseInt(e.target.value)})}
                        min="30"
                        max="300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalMarks">পূর্ণমান</Label>
                      <Input
                        id="totalMarks"
                        type="number"
                        value={examSettings.totalMarks}
                        onChange={(e) => setExamSettings({...examSettings, totalMarks: parseInt(e.target.value)})}
                        min="10"
                        max="500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="negativeMarking"
                          checked={examSettings.negativeMarking}
                          onCheckedChange={(checked) => setExamSettings({...examSettings, negativeMarking: checked as boolean})}
                        />
                        <Label htmlFor="negativeMarking">নেগেটিভ মার্কিং</Label>
                      </div>
                      {examSettings.negativeMarking && (
                        <Input
                          type="number"
                          step="0.25"
                          value={examSettings.negativeMarkingValue}
                          onChange={(e) => setExamSettings({...examSettings, negativeMarkingValue: parseFloat(e.target.value)})}
                          placeholder="0.25"
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructionsBn">অতিরিক্ত নির্দেশনা (বাংলা)</Label>
                    <Textarea
                      id="instructionsBn"
                      value={examSettings.instructionsBn}
                      onChange={(e) => setExamSettings({...examSettings, instructionsBn: e.target.value})}
                      placeholder="অতিরিক্ত নির্দেশনা থাকলে লিখুন"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">অতিরিক্ত নির্দেশনা (ইংরেজি)</Label>
                    <Textarea
                      id="instructions"
                      value={examSettings.instructions}
                      onChange={(e) => setExamSettings({...examSettings, instructions: e.target.value})}
                      placeholder="Additional instructions if any"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Add Questions */}
            <TabsContent value="questions">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>নতুন MCQ প্রশ্ন যোগ করুন</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>কঠিনতার মাত্রা</Label>
                        <Select 
                          value={currentQuestion.difficulty} 
                          onValueChange={(value) => setCurrentQuestion({...currentQuestion, difficulty: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {difficultyLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
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
                          max="10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>বিষয়/টপিক (বাংলা)</Label>
                        <Input
                          value={currentQuestion.topicBn || ''}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, topicBn: e.target.value})}
                          placeholder="যেমন: বীজগণিত"
                        />
                      </div>
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

                    <div className="space-y-2">
                      <Label>প্রশ্ন (ইংরেজি)</Label>
                      <Textarea
                        value={currentQuestion.question || ''}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                        placeholder="Write the question in English"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>বিকল্প উত্তরসমূহ</Label>
                      {[0, 1, 2, 3].map((index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>বিকল্প {String.fromCharCode(65 + index)} (বাংলা)</Label>
                            <div className="flex gap-2">
                              <Input
                                value={currentQuestion.optionsBn?.[index] || ''}
                                onChange={(e) => {
                                  const options = [...(currentQuestion.optionsBn || ['', '', '', ''])];
                                  options[index] = e.target.value;
                                  setCurrentQuestion({...currentQuestion, optionsBn: options});
                                }}
                                placeholder={`বিকল্প ${String.fromCharCode(65 + index)}`}
                              />
                              <Button
                                variant={currentQuestion.correctAnswer === index ? "default" : "outline"}
                                size="icon"
                                onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: index})}
                                title="সঠিক উত্তর হিসেবে চিহ্নিত করুন"
                              >
                                <span className="material-icons text-sm">
                                  {currentQuestion.correctAnswer === index ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>বিকল্প {String.fromCharCode(65 + index)} (ইংরেজি)</Label>
                            <Input
                              value={currentQuestion.options?.[index] || ''}
                              onChange={(e) => {
                                const options = [...(currentQuestion.options || ['', '', '', ''])];
                                options[index] = e.target.value;
                                setCurrentQuestion({...currentQuestion, options});
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ব্যাখ্যা (বাংলা) - ঐচ্ছিক</Label>
                        <Textarea
                          value={currentQuestion.explanationBn || ''}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, explanationBn: e.target.value})}
                          placeholder="সঠিক উত্তরের ব্যাখ্যা"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ব্যাখ্যা (ইংরেজি) - ঐচ্ছিক</Label>
                        <Textarea
                          value={currentQuestion.explanation || ''}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                          placeholder="Explanation for the correct answer"
                          rows={2}
                        />
                      </div>
                    </div>

                    <Button onClick={addQuestion} className="w-full">
                      <span className="material-icons mr-2">add</span>
                      প্রশ্ন যোগ করুন
                    </Button>
                  </CardContent>
                </Card>

                {/* Questions List */}
                {questions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>যোগ করা প্রশ্নসমূহ ({questions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {questions.map((question, index) => (
                          <Card key={question.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">প্রশ্ন {index + 1}</Badge>
                                  <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                                    {difficultyLevels.find(d => d.value === question.difficulty)?.label}
                                  </Badge>
                                  <Badge variant="outline">{question.marks} নম্বর</Badge>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeQuestion(question.id)}
                                >
                                  <span className="material-icons text-red-500">delete</span>
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <p className="font-medium">{question.questionBn}</p>
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                  {question.optionsBn.map((option, i) => (
                                    <div key={i} className={`flex items-center gap-1 ${question.correctAnswer === i ? 'text-green-600 font-medium' : ''}`}>
                                      <span className="font-mono">{String.fromCharCode(65 + i)}.</span>
                                      <span>{option}</span>
                                      {question.correctAnswer === i && <span className="material-icons text-sm">check</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Preview */}
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>MCQ প্রশ্নপত্র প্রিভিউ</CardTitle>
                  <CardDescription>
                    {questions.length} টি প্রশ্ন • {examSettings.totalMarks} নম্বর • {examSettings.duration} মিনিট
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <span className="material-icons text-4xl mb-2">quiz</span>
                      <p>প্রিভিউ দেখতে প্রশ্ন যোগ করুন</p>
                    </div>
                  ) : (
                    <MCQPreview />
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
                  <h3 className="font-semibold">MCQ প্রশ্নপত্র তৈরি করুন</h3>
                  <p className="text-sm text-gray-600">
                    {questions.length} টি প্রশ্ন • {questions.reduce((sum, q) => sum + q.marks, 0)} নম্বর
                  </p>
                </div>
                <Button onClick={generateMCQPaper} size="lg" disabled={questions.length === 0}>
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