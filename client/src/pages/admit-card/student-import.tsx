import { useState, useRef } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Users, 
  CheckCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface ImportResult {
  id: string;
  fileName: string;
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  status: 'processing' | 'completed' | 'failed';
  errorLog?: string[];
  createdAt: string;
}

interface StudentData {
  name: string;
  nameInBangla?: string;
  rollNumber: string;
  class: string;
  section: string;
  dateOfBirth?: string;
  gender?: string;
  fatherName?: string;
  motherName?: string;
  guardianPhone?: string;
  presentAddress?: string;
}

export default function StudentImport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<StudentData[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch import history
  const { data: importHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/students/import-history'],
    queryFn: async () => {
      const response = await fetch('/api/students/import-history');
      if (!response.ok) throw new Error('Failed to fetch import history');
      return response.json();
    }
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/students/import-excel', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'ফাইল আপলোড সফল!',
        description: `${data.totalRecords} টি রেকর্ড প্রক্রিয়া করা হচ্ছে`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students/import-history'] });
      setSelectedFile(null);
      setShowPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'আপলোড ত্রুটি',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // File preview function
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast({
        title: 'ভুল ফাইল ফরম্যাট',
        description: 'অনুগ্রহ করে Excel (.xlsx, .xls) বা CSV ফাইল নির্বাচন করুন',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    // Read file for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Basic CSV parsing for preview
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(1, 6); // First 5 data rows
        const preview = lines.map(line => {
          const cols = line.split(',');
          return {
            name: cols[0]?.trim() || '',
            nameInBangla: cols[1]?.trim() || '',
            rollNumber: cols[2]?.trim() || '',
            class: cols[3]?.trim() || '',
            section: cols[4]?.trim() || '',
            dateOfBirth: cols[5]?.trim() || '',
            gender: cols[6]?.trim() || '',
            fatherName: cols[7]?.trim() || '',
            motherName: cols[8]?.trim() || '',
            guardianPhone: cols[9]?.trim() || '',
            presentAddress: cols[10]?.trim() || '',
          };
        }).filter(row => row.name); // Filter out empty rows
        
        setPreviewData(preview);
        setShowPreview(true);
      } catch (error) {
        console.error('Preview error:', error);
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      setShowPreview(true); // For Excel files, show basic info
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Name,Name in Bangla,Roll Number,Class,Section,Date of Birth,Gender,Father Name,Mother Name,Guardian Phone,Present Address
Mohammad Rahman,মোহাম্মদ রহমান,001,10,A,01/01/2008,Male,Abdul Rahman,Fatima Khatun,01711123456,Dhaka
Fatima Khatun,ফাতিমা খাতুন,002,10,A,15/03/2008,Female,Mohammad Ali,Rashida Begum,01712345678,Chittagong
Abdul Karim,আব্দুল করিম,003,10,B,22/07/2008,Male,Karim Uddin,Amina Khatun,01713456789,Sylhet`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">শিক্ষার্থী ডেটা ইমপোর্ট</h1>
            <p className="text-muted-foreground">Excel/CSV ফাইল থেকে শিক্ষার্থীদের তথ্য আপলোড করুন</p>
          </div>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            টেমপ্লেট ডাউনলোড
          </Button>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              ফাইল আপলোড
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <FileSpreadsheet className="w-4 h-4" />
              <AlertDescription>
                সমর্থিত ফরম্যাট: Excel (.xlsx, .xls) এবং CSV ফাইল। সর্বোচ্চ ফাইল সাইজ: 10MB
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="space-y-4">
                  <FileText className="w-12 h-12 mx-auto text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                      অন্য ফাইল নির্বাচন
                    </Button>
                    <Button 
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">ফাইল নির্বাচন করুন</p>
                    <p className="text-muted-foreground">অথবা এখানে ড্র্যাগ করে ছেড়ে দিন</p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    ফাইল ব্রাউজ করুন
                  </Button>
                </div>
              )}
            </div>

            {/* Preview Section */}
            {showPreview && previewData.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">ডেটা প্রিভিউ (প্রথম ৫টি রেকর্ড)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">নাম</th>
                        <th className="border border-gray-300 p-2 text-left">বাংলায় নাম</th>
                        <th className="border border-gray-300 p-2 text-left">রোল</th>
                        <th className="border border-gray-300 p-2 text-left">শ্রেণী</th>
                        <th className="border border-gray-300 p-2 text-left">বিভাগ</th>
                        <th className="border border-gray-300 p-2 text-left">ফোন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{row.name}</td>
                          <td className="border border-gray-300 p-2">{row.nameInBangla}</td>
                          <td className="border border-gray-300 p-2">{row.rollNumber}</td>
                          <td className="border border-gray-300 p-2">{row.class}</td>
                          <td className="border border-gray-300 p-2">{row.section}</td>
                          <td className="border border-gray-300 p-2">{row.guardianPhone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              ইমপোর্ট ইতিহাস
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="text-center py-4">লোড হচ্ছে...</div>
            ) : importHistory?.length > 0 ? (
              <div className="space-y-4">
                {importHistory.map((item: ImportResult) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.fileName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          item.status === 'completed' ? 'default' : 
                          item.status === 'failed' ? 'destructive' : 'secondary'
                        }
                      >
                        {item.status === 'completed' ? 'সম্পন্ন' : 
                         item.status === 'failed' ? 'ব্যর্থ' : 'প্রক্রিয়াধীন'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>মোট: {item.totalRecords}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>সফল: {item.successfulImports}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>ব্যর্থ: {item.failedImports}</span>
                      </div>
                    </div>

                    {item.status === 'processing' && (
                      <Progress value={((item.successfulImports + item.failedImports) / item.totalRecords) * 100} />
                    )}

                    {item.errorLog && item.errorLog.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          <details>
                            <summary className="cursor-pointer">ত্রুটির বিস্তারিত দেখুন</summary>
                            <ul className="mt-2 space-y-1">
                              {item.errorLog.slice(0, 5).map((error, index) => (
                                <li key={index} className="text-xs">• {error}</li>
                              ))}
                              {item.errorLog.length > 5 && (
                                <li className="text-xs">... আরও {item.errorLog.length - 5}টি ত্রুটি</li>
                              )}
                            </ul>
                          </details>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                কোনো ইমপোর্ট ইতিহাস নেই
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}