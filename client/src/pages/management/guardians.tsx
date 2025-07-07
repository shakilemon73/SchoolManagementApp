import { useState } from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';

const guardianSchema = z.object({
  name: z.string().min(2, { message: 'নাম অন্তত ২ অক্ষরের হতে হবে' }),
  relation: z.string().min(1, { message: 'সম্পর্ক নির্বাচন করুন' }),
  phone: z.string().min(11, { message: 'ফোন নম্বর সঠিক নয়' }),
  email: z.string().email({ message: 'সঠিক ইমেইল দিন' }).optional().or(z.literal('')),
  occupation: z.string().optional(),
  address: z.string().min(5, { message: 'ঠিকানা অন্তত ৫ অক্ষরের হতে হবে' }),
  studentId: z.string().min(1, { message: 'শিক্ষার্থী নির্বাচন করুন' })
});

type GuardianFormValues = z.infer<typeof guardianSchema>;

// Mock data
const mockGuardians = [
  { id: 1, name: 'কামাল হোসেন', relation: 'পিতা', phone: '01712345678', student: 'সিফাত হোসেন', studentClass: 'নবম', studentRoll: '২৩' },
  { id: 2, name: 'নাজমা বেগম', relation: 'মাতা', phone: '01812345678', student: 'রিফাত হোসেন', studentClass: 'অষ্টম', studentRoll: '১৫' },
  { id: 3, name: 'আবদুল্লাহ', relation: 'পিতা', phone: '01912345678', student: 'আবিদা খাতুন', studentClass: 'সপ্তম', studentRoll: '০৭' },
  { id: 4, name: 'রাবেয়া খাতুন', relation: 'মাতা', phone: '01612345678', student: 'শাহিন আলম', studentClass: 'অষ্টম', studentRoll: '০৫' },
];

// Mock students for dropdown
const mockStudents = [
  { id: '1', name: 'সিফাত হোসেন', class: 'নবম', roll: '২৩' },
  { id: '2', name: 'রিফাত হোসেন', class: 'অষ্টম', roll: '১৫' },
  { id: '3', name: 'আবিদা খাতুন', class: 'সপ্তম', roll: '০৭' },
  { id: '4', name: 'শাহিন আলম', class: 'অষ্টম', roll: '০৫' },
];

export default function GuardiansPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      name: '',
      relation: '',
      phone: '',
      email: '',
      occupation: '',
      address: '',
      studentId: ''
    },
  });

  function onSubmit(data: GuardianFormValues) {
    // In a real app, you would send this data to your API
    console.log(data);
    
    toast({
      title: "অভিভাবক যোগ করা হয়েছে",
      description: `${data.name} কে অভিভাবক হিসেবে যোগ করা হয়েছে।`,
    });
    
    setIsDialogOpen(false);
    form.reset();
  }

  return (
    <ModulePageLayout 
      title="অভিভাবক ব্যবস্থাপনা" 
      description="শিক্ষার্থীদের অভিভাবকের তথ্য দেখুন এবং পরিচালনা করুন।"
      icon={<Users className="h-6 w-6" />}
      onAddNew={() => setIsDialogOpen(true)}
      addNewLabel="নতুন অভিভাবক যোগ করুন"
    >
      <div className="p-4 border-b">
        <div className="relative">
          <Input
            placeholder="অভিভাবকের নাম, ফোন বা শিক্ষার্থীর নাম দিয়ে খুঁজুন..."
            className="max-w-sm pl-9"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>অভিভাবকের নাম</TableHead>
            <TableHead>সম্পর্ক</TableHead>
            <TableHead>ফোন</TableHead>
            <TableHead>শিক্ষার্থীর নাম</TableHead>
            <TableHead>শ্রেণি</TableHead>
            <TableHead>রোল</TableHead>
            <TableHead className="text-right">কার্যক্রম</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockGuardians.map((guardian) => (
            <TableRow key={guardian.id}>
              <TableCell className="font-medium">{guardian.name}</TableCell>
              <TableCell>{guardian.relation}</TableCell>
              <TableCell>{guardian.phone}</TableCell>
              <TableCell>{guardian.student}</TableCell>
              <TableCell>{guardian.studentClass}</TableCell>
              <TableCell>{guardian.studentRoll}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">দেখুন</Button>
                <Button variant="ghost" size="sm">সম্পাদনা</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>নতুন অভিভাবক যোগ করুন</DialogTitle>
            <DialogDescription>
              অভিভাবকের তথ্য এবং সংশ্লিষ্ট শিক্ষার্থীর তথ্য পূরণ করুন। সকল তারকা (*) চিহ্নিত ঘর পূরণ করা বাধ্যতামূলক।
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>অভিভাবকের নাম *</FormLabel>
                      <FormControl>
                        <Input placeholder="অভিভাবকের পূর্ণ নাম" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>সম্পর্ক *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="সম্পর্ক নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="পিতা">পিতা</SelectItem>
                          <SelectItem value="মাতা">মাতা</SelectItem>
                          <SelectItem value="ভাই">ভাই</SelectItem>
                          <SelectItem value="বোন">বোন</SelectItem>
                          <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ফোন নম্বর *</FormLabel>
                      <FormControl>
                        <Input placeholder="01XXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ইমেইল</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@mail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>পেশা</FormLabel>
                      <FormControl>
                        <Input placeholder="অভিভাবকের পেশা" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>শিক্ষার্থী *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="শিক্ষার্থী নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockStudents.map(student => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} - {student.class} ({student.roll})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ঠিকানা *</FormLabel>
                    <FormControl>
                      <Input placeholder="অভিভাবকের বর্তমান ঠিকানা" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit">সংরক্ষণ করুন</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  );
}