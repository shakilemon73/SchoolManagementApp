import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Download, Users } from 'lucide-react';

export default function BatchCreation() {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      toast({
        title: "ফাইল আপলোড সফল",
        description: `${file.name} ফাইল আপলোড করা হয়েছে।`
      });
    }
  };

  const processBatch = async () => {
    if (!csvFile) {
      toast({
        title: "ফাইল নির্বাচন করুন",
        description: "অনুগ্রহ করে CSV ফাইল আপলোড করুন।",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    // Process batch creation logic here
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "ব্যাচ প্রক্রিয়া সম্পন্ন",
        description: "সকল আইডি কার্ড সফলভাবে তৈরি করা হয়েছে।"
      });
    }, 3000);
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">হোম</Link>
          <span>/</span>
          <Link href="/id-card/dashboard" className="hover:text-gray-700">আইডি কার্ড</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">ব্যাচ তৈরি</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ব্যাচ আইডি কার্ড তৈরি</h1>
            <p className="text-gray-600 mt-1">একসাথে অনেক শিক্ষার্থীর আইডি কার্ড তৈরি করুন</p>
          </div>
          <Link href="/id-card/dashboard">
            <Button variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              ড্যাশবোর্ডে ফিরুন
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                CSV ফাইল আপলোড
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>CSV ফাইল নির্বাচন করুন</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('csv-upload')?.click()}
                    className="w-full"
                  >
                    <Upload size={16} className="mr-2" />
                    CSV ফাইল নির্বাচন করুন
                  </Button>
                </div>
                {csvFile && (
                  <p className="text-sm text-green-600 mt-2">
                    নির্বাচিত ফাইল: {csvFile.name}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">CSV ফরম্যাট গাইড</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>CSV ফাইলে নিম্নলিখিত কলাম থাকতে হবে:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>studentName (ইংরেজি নাম)</li>
                    <li>studentNameBn (বাংলা নাম)</li>
                    <li>studentId (শিক্ষার্থী আইডি)</li>
                    <li>rollNumber (রোল নম্বর)</li>
                    <li>className (শ্রেণি)</li>
                    <li>section (শাখা)</li>
                    <li>bloodGroup (রক্তের গ্রুপ)</li>
                    <li>fatherName (পিতার নাম)</li>
                    <li>motherName (মাতার নাম)</li>
                  </ul>
                </div>
              </div>

              <Button 
                onClick={processBatch}
                disabled={!csvFile || isProcessing}
                className="w-full"
              >
                <Users size={16} className="mr-2" />
                {isProcessing ? "প্রক্রিয়া চলছে..." : "ব্যাচ প্রক্রিয়া শুরু করুন"}
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>নির্দেশনা</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">ধাপ ১: CSV ফাইল প্রস্তুত করুন</h4>
                <p className="text-sm text-gray-600">
                  একটি CSV ফাইল তৈরি করুন যাতে সকল শিক্ষার্থীর তথ্য থাকবে। 
                  প্রয়োজনীয় কলামগুলো সঠিকভাবে রাখুন।
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">ধাপ ২: ফাইল আপলোড করুন</h4>
                <p className="text-sm text-gray-600">
                  তৈরি করা CSV ফাইলটি আপলোড করুন। ফাইল সাইজ সর্বোচ্চ ৫ MB হতে পারে।
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">ধাপ ৩: প্রক্রিয়া শুরু করুন</h4>
                <p className="text-sm text-gray-600">
                  "ব্যাচ প্রক্রিয়া শুরু করুন" বাটনে ক্লিক করুন। 
                  সকল আইডি কার্ড একসাথে তৈরি হবে।
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-1">গুরুত্বপূর্ণ</h4>
                <p className="text-sm text-yellow-700">
                  বড় ব্যাচ প্রক্রিয়া করতে কিছু সময় লাগতে পারে। 
                  প্রক্রিয়া চলাকালীন পেজ ছেড়ে যাবেন না।
                </p>
              </div>

              <Button variant="outline" className="w-full">
                <Download size={16} className="mr-2" />
                নমুনা CSV ডাউনলোড করুন
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}