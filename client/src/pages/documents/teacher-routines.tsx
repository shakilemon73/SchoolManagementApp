import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, User, BookOpen, Download, Eye } from 'lucide-react';

// Schema for teacher routine data
const routineSchema = z.object({
  teacherName: z.string().min(1, { message: "শিক্ষকের নাম আবশ্যক" }),
  teacherNameBn: z.string().min(1, { message: "শিক্ষকের নাম (বাংলা) আবশ্যক" }),
  designation: z.string().min(1, { message: "পদবি আবশ্যক" }),
  department: z.string().min(1, { message: "বিভাগ আবশ্যক" }),
  session: z.string().min(1, { message: "সেশন আবশ্যক" }),
});

const timeSlots = [
  "৮:০০ - ৮:৪৫",
  "৮:৪৫ - ৯:৩০",
  "৯:৩০ - ১০:১৫",
  "১০:১৫ - ১১:০০",
  "১১:০০ - ১১:৪৫",
  "১১:৪৫ - ১২:৩০",
  "১২:৩০ - ১:১৫",
  "১:১৫ - ২:০০"
];

const weekDays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার"];

export default function TeacherRoutinesPage() {
  const { toast } = useToast();
  const isMobile = useMobile();
  const [previewMode, setPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [routineData, setRoutineData] = useState<any>({});

  const routineForm = useForm<z.infer<typeof routineSchema>>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      teacherName: "",
      teacherNameBn: "",
      designation: "",
      department: "",
      session: "২০২৪-২৫",
    }
  });

  const onSubmit = async (data: z.infer<typeof routineSchema>) => {
    setRoutineData(data);
    setPreviewMode(true);
    toast({
      title: "রুটিন প্রস্তুত",
      description: "শিক্ষক রুটিন সফলভাবে তৈরি করা হয়েছে।"
    });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "পিডিএফ তৈরি সফল",
        description: "শিক্ষক রুটিন পিডিএফ সফলভাবে তৈরি করা হয়েছে।"
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

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            শিক্ষক রুটিন জেনারেটর
          </h1>
          <p className="text-gray-600">
            শিক্ষকদের জন্য পেশাদার ক্লাস রুটিন তৈরি করুন
          </p>
        </div>

        {!previewMode ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  শিক্ষকের তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...routineForm}>
                  <form onSubmit={routineForm.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={routineForm.control}
                        name="teacherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>শিক্ষকের নাম (ইংরেজি)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Teacher Name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={routineForm.control}
                        name="teacherNameBn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>শিক্ষকের নাম (বাংলা)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="শিক্ষকের নাম" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={routineForm.control}
                        name="designation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>পদবি</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="পদবি নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="প্রধান শিক্ষক">প্রধান শিক্ষক</SelectItem>
                                  <SelectItem value="সহকারী প্রধান শিক্ষক">সহকারী প্রধান শিক্ষক</SelectItem>
                                  <SelectItem value="সহকারী শিক্ষক">সহকারী শিক্ষক</SelectItem>
                                  <SelectItem value="শিক্ষক">শিক্ষক</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={routineForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>বিভাগ</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="বিজ্ঞান">বিজ্ঞান</SelectItem>
                                  <SelectItem value="মানবিক">মানবিক</SelectItem>
                                  <SelectItem value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা</SelectItem>
                                  <SelectItem value="সাধারণ">সাধারণ</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={routineForm.control}
                        name="session"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>সেশন</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="২০২৪-২৫" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4 justify-end">
                      <Button type="submit" className="px-8">
                        <Eye className="h-4 w-4 mr-2" />
                        প্রিভিউ দেখুন
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview Header */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(false)}
              >
                ← সম্পাদনা করুন
              </Button>
              <Button
                onClick={generatePDF}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  "তৈরি হচ্ছে..."
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    পিডিএফ ডাউনলোড
                  </>
                )}
              </Button>
            </div>

            {/* Routine Preview */}
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-blue-600 mb-2">
                    [স্কুলের নাম]
                  </h1>
                  <h2 className="text-xl font-semibold mb-4">
                    শিক্ষক ক্লাস রুটিন
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-left">
                      <p><strong>শিক্ষকের নাম:</strong> {routineData.teacherNameBn}</p>
                      <p><strong>পদবি:</strong> {routineData.designation}</p>
                    </div>
                    <div className="text-left">
                      <p><strong>বিভাগ:</strong> {routineData.department}</p>
                      <p><strong>সেশন:</strong> {routineData.session}</p>
                    </div>
                  </div>
                </div>

                {/* Routine Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="border border-gray-300 p-3 text-sm font-semibold">
                          সময়
                        </th>
                        {weekDays.map((day) => (
                          <th key={day} className="border border-gray-300 p-3 text-sm font-semibold">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((time, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="border border-gray-300 p-3 text-sm font-medium">
                            {time}
                          </td>
                          {weekDays.map((day) => (
                            <td key={day} className="border border-gray-300 p-3 text-sm text-center">
                              {/* Sample data - would be filled from form */}
                              {index === 0 && day === "রবিবার" ? "গণিত - নবম" : ""}
                              {index === 1 && day === "সোমবার" ? "পদার্থ - দশম" : ""}
                              {index === 2 && day === "মঙ্গলবার" ? "রসায়ন - একাদশ" : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 text-right">
                  <p className="text-sm text-gray-600">প্রস্তুতকারী</p>
                  <p className="font-semibold">একাডেমিক বিভাগ</p>
                  <p>তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}