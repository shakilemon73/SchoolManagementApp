import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDesignSystem } from '@/hooks/use-design-system';
import { cn } from '@/lib/utils';
import { GraduationCap, User, Lock, BookOpen } from 'lucide-react';

// Teacher login schema
const teacherLoginSchema = z.object({
  teacherId: z.string().min(1, 'শিক্ষক আইডি আবশ্যক'),
  password: z.string().min(4, 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে'),
});

type TeacherLoginData = z.infer<typeof teacherLoginSchema>;

// Teacher context for authentication
const TeacherAuthContext = {
  isAuthenticated: false,
  teacher: null,
  login: (teacherData: any) => {
    localStorage.setItem('teacherAuth', JSON.stringify(teacherData));
    TeacherAuthContext.isAuthenticated = true;
    TeacherAuthContext.teacher = teacherData;
  },
  logout: () => {
    localStorage.removeItem('teacherAuth');
    TeacherAuthContext.isAuthenticated = false;
    TeacherAuthContext.teacher = null;
  },
  init: () => {
    const stored = localStorage.getItem('teacherAuth');
    if (stored) {
      const teacherData = JSON.parse(stored);
      TeacherAuthContext.isAuthenticated = true;
      TeacherAuthContext.teacher = teacherData;
      return teacherData;
    }
    return null;
  }
};

import { UXCard, UXButton, UXHeading } from '@/components/ux-system';

interface TeacherAuthProps {
  onAuthenticated: (teacher: any) => void;
}

export default function TeacherAuth({ onAuthenticated }: TeacherAuthProps) {
  const { toast } = useToast();
  
  // Initialize UX design system
  useDesignSystem();

  const form = useForm<TeacherLoginData>({
    resolver: zodResolver(teacherLoginSchema),
    defaultValues: {
      teacherId: '',
      password: '',
    },
  });

  // Teacher login mutation
  const loginMutation = useMutation({
    mutationFn: async (loginData: TeacherLoginData) => {
      // Simulate teacher authentication with mock data
      // In real implementation, this would call your teacher authentication API
      const mockTeacher = {
        id: 'T001',
        teacherId: loginData.teacherId,
        name: 'আব্দুল করিম',
        nameInBangla: 'আব্দুল করিম',
        designation: 'সহকারী শিক্ষক',
        department: 'বাংলা',
        subject: 'বাংলা',
        phone: '01712345678',
        email: 'teacher@school.edu.bd',
        classes: ['ষষ্ঠ ক', 'সপ্তম খ', 'অষ্টম গ'],
        joiningDate: '2020-01-15',
        isActive: true
      };
      
      // Mock authentication check
      if (loginData.teacherId === 'demo' || loginData.teacherId.startsWith('T')) {
        return mockTeacher;
      } else {
        throw new Error('Invalid credentials');
      }
    },
    onSuccess: (teacher) => {
      TeacherAuthContext.login(teacher);
      toast({
        title: "সফল হয়েছে!",
        description: `স্বাগতম ${teacher.name}`,
      });
      onAuthenticated(teacher);
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি!",
        description: "শিক্ষক আইডি বা পাসওয়ার্ড ভুল",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TeacherLoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            শিক্ষক পোর্টাল
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            আপনার অ্যাকাউন্টে লগইন করুন
          </p>
        </div>

        {/* Login Form */}
        <UXCard interactive>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              শিক্ষক লগইন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-800 block">শিক্ষক আইডি</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            placeholder="T001 বা demo"
                            className="w-full px-4 py-3 pl-10 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 min-h-[44px] focus:outline-none"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-800 block">পাসওয়ার্ড</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            type="password"
                            placeholder="পাসওয়ার্ড লিখুন"
                            className="w-full px-4 py-3 pl-10 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 min-h-[44px] focus:outline-none"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <UXButton 
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      লগইন হচ্ছে...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      লগইন করুন
                    </>
                  )}
                </UXButton>
              </form>
            </Form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                ডেমো অ্যাকাউন্ট:
              </h4>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>শিক্ষক আইডি:</strong> demo</p>
                <p><strong>পাসওয়ার্ড:</strong> 1234</p>
              </div>
            </div>
          </CardContent>
        </UXCard>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            সমস্যা হলে প্রশাসনের সাথে যোগাযোগ করুন
          </p>
        </div>
      </div>
    </div>
  );
}

export { TeacherAuthContext };