import { useState, useRef } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Download, Users } from 'lucide-react';

// Schema for student ID card data
const studentSchema = z.object({
  name: z.string().min(1, { message: "নাম আবশ্যক" }),
  nameInBangla: z.string().min(1, { message: "বাংলায় নাম আবশ্যক" }),
  studentId: z.string().min(1, { message: "শিক্ষার্থী আইডি আবশ্যক" }),
  rollNumber: z.string().min(1, { message: "রোল নম্বর আবশ্যক" }),
  className: z.string().min(1, { message: "শ্রেণি আবশ্যক" }),
  section: z.string().min(1, { message: "শাখা আবশ্যক" }),
  session: z.string().min(1, { message: "সেশন আবশ্যক" }),
});

export default function IdCardsPage() {
  const { toast } = useToast();
  const isMobile = useMobile();
  const [studentPhoto, setStudentPhoto] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      nameInBangla: "",
      studentId: "",
      rollNumber: "",
      className: "",
      section: "",
      session: "২০২৪-২৫",
    }
  });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "ভুল ফাইল টাইপ",
        description: "শুধুমাত্র ছবি ফাইল আপলোড করুন (JPG, PNG, WebP)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "ফাইল খুব বড়",
        description: "ছবির সাইজ ৫ MB এর কম হতে হবে।",
        variant: "destructive"
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setStudentPhoto(result);
        setUploadingPhoto(false);
        toast({
          title: "ছবি আপলোড সফল",
          description: "শিক্ষার্থীর ছবি সফলভাবে আপলোড করা হয়েছে।"
        });
      };
      reader.onerror = () => {
        setUploadingPhoto(false);
        toast({
          title: "আপলোড ব্যর্থ",
          description: "ছবি পড়তে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।",
          variant: "destructive"
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadingPhoto(false);
      toast({
        title: "আপলোড ব্যর্থ",
        description: "ছবি আপলোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "আইডি কার্ড তৈরি সফল",
        description: "আইডি কার্ড সফলভাবে তৈরি করা হয়েছে।"
      });
    } catch (error) {
      toast({
        title: "পিডিএফ তৈরি ব্যর্থ",
        description: "পিডিএফ তৈরি করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof studentSchema>) => {
    if (!studentPhoto) {
      toast({
        title: "ছবি প্রয়োজন",
        description: "অনুগ্রহ করে শিক্ষার্থীর ছবি আপলোড করুন।",
        variant: "destructive"
      });
      return;
    }
    await generatePDF();
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            আইডি কার্ড জেনারেটর
          </h1>
          <p className="text-gray-600">
            শিক্ষার্থীদের জন্য পেশাদার আইডি কার্ড তৈরি করুন
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                শিক্ষার্থীর তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={studentForm.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">নাম (ইংরেজি)</Label>
                    <Input
                      {...studentForm.register("name")}
                      placeholder="Student Name"
                    />
                    {studentForm.formState.errors.name && (
                      <p className="text-sm text-red-500 mt-1">
                        {studentForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nameInBangla">নাম (বাংলা)</Label>
                    <Input
                      {...studentForm.register("nameInBangla")}
                      placeholder="শিক্ষার্থীর নাম"
                    />
                    {studentForm.formState.errors.nameInBangla && (
                      <p className="text-sm text-red-500 mt-1">
                        {studentForm.formState.errors.nameInBangla.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="studentId">শিক্ষার্থী আইডি</Label>
                    <Input
                      {...studentForm.register("studentId")}
                      placeholder="ID-2024-001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rollNumber">রোল নম্বর</Label>
                    <Input
                      {...studentForm.register("rollNumber")}
                      placeholder="001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="className">শ্রেণি</Label>
                    <Input
                      {...studentForm.register("className")}
                      placeholder="দশম"
                    />
                  </div>

                  <div>
                    <Label htmlFor="section">শাখা</Label>
                    <Input
                      {...studentForm.register("section")}
                      placeholder="ক"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                  <Label>শিক্ষার্থীর ছবি</Label>
                  <div className="flex items-center gap-4">
                    {studentPhoto ? (
                      <div className="relative">
                        <img
                          src={studentPhoto}
                          alt="Student"
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setStudentPhoto("")}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                        disabled={uploadingPhoto}
                      />
                      <Label
                        htmlFor="photo-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {uploadingPhoto ? (
                          <>আপলোড হচ্ছে...</>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            ছবি আপলোড
                          </>
                        )}
                      </Label>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    "আইডি কার্ড তৈরি হচ্ছে..."
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      আইডি কার্ড তৈরি করুন
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>প্রিভিউ</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={idCardRef} className="bg-white p-6 rounded-lg border shadow-lg">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold text-blue-600">স্কুলের নাম</h2>
                  <p className="text-sm text-gray-600">শিক্ষার্থী পরিচয়পত্র</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-200 rounded flex items-center justify-center">
                    {studentPhoto ? (
                      <img src={studentPhoto} alt="Student" className="w-full h-full object-cover rounded" />
                    ) : (
                      <span className="text-xs text-gray-500">ছবি</span>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p><strong>নাম:</strong> {studentForm.watch("nameInBangla") || "---"}</p>
                    <p><strong>আইডি:</strong> {studentForm.watch("studentId") || "---"}</p>
                    <p><strong>রোল:</strong> {studentForm.watch("rollNumber") || "---"}</p>
                    <p><strong>শ্রেণি:</strong> {studentForm.watch("className") || "---"} ({studentForm.watch("section") || "---"})</p>
                    <p><strong>সেশন:</strong> {studentForm.watch("session")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}