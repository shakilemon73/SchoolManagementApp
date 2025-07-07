import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Student {
  id: string;
  name: string;
  nameBn: string;
  rollNumber: string;
  className: string;
  section: string;
  selected?: boolean;
}

export default function BatchCreation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [examType, setExamType] = useState('');
  const [examDate, setExamDate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Mock students data - in real app this would come from database
  const [availableStudents] = useState<Student[]>([
    { id: '1', name: 'Mohammad Rahman', nameBn: 'মোহাম্মদ রহমান', rollNumber: '001', className: '10', section: 'A' },
    { id: '2', name: 'Fatima Khatun', nameBn: 'ফাতিমা খাতুন', rollNumber: '002', className: '10', section: 'A' },
    { id: '3', name: 'Abdul Karim', nameBn: 'আব্দুল করিম', rollNumber: '003', className: '10', section: 'A' },
    { id: '4', name: 'Rashida Begum', nameBn: 'রশিদা বেগম', rollNumber: '004', className: '10', section: 'B' },
    { id: '5', name: 'Aminul Islam', nameBn: 'আমিনুল ইসলাম', rollNumber: '005', className: '10', section: 'B' },
  ]);

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['/api/admit-cards/templates'],
    queryFn: async () => {
      const response = await fetch('/api/admit-cards/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Batch creation mutation
  const batchCreate = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admit-cards/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create batch admit cards');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'সফল!',
        description: `${data.summary?.successful || 0} টি এডমিট কার্ড সফলভাবে তৈরি হয়েছে`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admit-cards/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admit-cards/recent'] });
      setSelectedStudents([]);
    },
    onError: (error: Error) => {
      toast({
        title: 'ত্রুটি',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleStudentToggle = (student: Student) => {
    setSelectedStudents(prev => {
      const exists = prev.find(s => s.id === student.id);
      if (exists) {
        return prev.filter(s => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === availableStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents([...availableStudents]);
    }
  };

  const handleBatchGenerate = () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'ত্রুটি',
        description: 'অন্তত একজন শিক্ষার্থী নির্বাচন করুন',
        variant: 'destructive',
      });
      return;
    }

    if (!examType || !selectedTemplate) {
      toast({
        title: 'ত্রুটি',
        description: 'পরীক্ষার ধরন এবং টেমপ্লেট নির্বাচন করুন',
        variant: 'destructive',
      });
      return;
    }

    const batchData = {
      students: selectedStudents.map(student => ({
        studentName: student.name,
        studentNameBn: student.nameBn,
        rollNumber: student.rollNumber,
        className: student.className,
        section: student.section,
        subjects: [
          { code: '101', name: 'বাংলা' },
          { code: '102', name: 'ইংরেজি' },
          { code: '103', name: 'গণিত' },
          { code: '104', name: 'বিজ্ঞান' },
        ],
      })),
      templateId: selectedTemplate,
      examType,
      examDate,
      schoolData: {
        name: 'ঢাকা পাবলিক স্কুল',
        address: 'ঢাকা, বাংলাদেশ',
      },
    };

    batchCreate.mutate(batchData);
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-700">হোম</Link>
            <span>/</span>
            <Link href="/documents/admit-cards" className="hover:text-gray-700">এডমিট কার্ড</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">ব্যাচ তৈরি</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ব্যাচ এডমিট কার্ড তৈরি</h1>
              <p className="text-gray-600 mt-1">একাধিক শিক্ষার্থীর জন্য একসাথে এডমিট কার্ড তৈরি করুন</p>
            </div>
            
            <Link href="/documents/admit-cards">
              <Button variant="outline" className="flex items-center gap-2">
                <span className="material-icons text-sm">arrow_back</span>
                ড্যাশবোর্ডে ফিরুন
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>শিক্ষার্থী নির্বাচন</CardTitle>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedStudents.length === availableStudents.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm">
                      সবাই নির্বাচন ({selectedStudents.length}/{availableStudents.length})
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStudents.find(s => s.id === student.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleStudentToggle(student)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={!!selectedStudents.find(s => s.id === student.id)}
                          onChange={() => {}} // Controlled by parent click
                        />
                        <div>
                          <div className="font-medium">{student.nameBn}</div>
                          <div className="text-sm text-gray-500">{student.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">রোল: {student.rollNumber}</div>
                        <div className="text-sm text-gray-500">
                          {student.className} - {student.section}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>পরীক্ষার তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="exam-type">পরীক্ষার ধরন *</Label>
                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger>
                      <SelectValue placeholder="পরীক্ষার ধরন নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="half-yearly">অর্ধবার্ষিক পরীক্ষা</SelectItem>
                      <SelectItem value="annual">বার্ষিক পরীক্ষা</SelectItem>
                      <SelectItem value="test">টেস্ট পরীক্ষা</SelectItem>
                      <SelectItem value="board">বোর্ড পরীক্ষা</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="exam-date">পরীক্ষার তারিখ</Label>
                  <Input
                    id="exam-date"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="template">টেমপ্লেট *</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template: any) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.nameBn || template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Selected Students Summary */}
            {selectedStudents.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="material-icons">group</span>
                    নির্বাচিত শিক্ষার্থী
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {selectedStudents.slice(0, 3).map((student) => (
                      <div key={student.id} className="flex items-center justify-between text-sm">
                        <span>{student.nameBn}</span>
                        <Badge variant="outline">{student.rollNumber}</Badge>
                      </div>
                    ))}
                    {selectedStudents.length > 3 && (
                      <div className="text-sm text-gray-500 text-center">
                        আরও {selectedStudents.length - 3} জন...
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleBatchGenerate}
                    className="w-full"
                    disabled={batchCreate.isPending || selectedStudents.length === 0}
                  >
                    {batchCreate.isPending ? (
                      <>
                        <span className="material-icons animate-spin mr-2">refresh</span>
                        তৈরি হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">description</span>
                        {selectedStudents.length} টি এডমিট কার্ড তৈরি করুন
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}