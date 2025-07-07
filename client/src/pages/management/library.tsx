import { useState } from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { BookOpen } from 'lucide-react';
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

const bookSchema = z.object({
  title: z.string().min(2, { message: 'বইয়ের নাম অন্তত ২ অক্ষরের হতে হবে' }),
  author: z.string().min(2, { message: 'লেখকের নাম অন্তত ২ অক্ষরের হতে হবে' }),
  isbn: z.string().optional(),
  category: z.string().min(1, { message: 'ক্যাটাগরি নির্বাচন করুন' }),
  publisher: z.string().optional(),
  publicationYear: z.string().optional(),
  copies: z.string().min(1, { message: 'কপি সংখ্যা দিন' }),
  shelf: z.string().min(1, { message: 'শেলফ নম্বর দিন' })
});

type BookFormValues = z.infer<typeof bookSchema>;

// Mock data
const mockBooks = [
  { id: 1, title: 'বাংলাদেশের ইতিহাস', author: 'সিরাজুল ইসলাম', category: 'ইতিহাস', copies: '৫', available: '৩', shelf: 'A-12' },
  { id: 2, title: 'বাংলা ব্যাকরণ', author: 'সুনীল গঙ্গোপাধ্যায়', category: 'ভাষা', copies: '১০', available: '৭', shelf: 'B-05' },
  { id: 3, title: 'গণিতের মজা', author: 'মুহম্মদ জাফর ইকবাল', category: 'বিজ্ঞান', copies: '৮', available: '৪', shelf: 'C-23' },
  { id: 4, title: 'কম্পিউটার প্রোগ্রামিং', author: 'তামিম শাহরিয়ার সুবিন', category: 'প্রযুক্তি', copies: '৬', available: '২', shelf: 'D-17' },
];

// Active book issues
const mockIssues = [
  { id: 1, book: 'বাংলাদেশের ইতিহাস', student: 'করিম আহমেদ', class: 'নবম', issueDate: '১০/০৫/২০২৫', dueDate: '২৫/০৫/২০২৫' },
  { id: 2, title: 'বাংলা ব্যাকরণ', student: 'ফাতেমা খাতুন', class: 'অষ্টম', issueDate: '০৫/০৫/২০২৫', dueDate: '২০/০৫/২০২৫' },
  { id: 3, title: 'গণিতের মজা', student: 'রাকিব হাসান', class: 'সপ্তম', issueDate: '১২/০৫/২০২৫', dueDate: '২৭/০৫/২০২৫' },
];

export default function LibraryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publicationYear: '',
      copies: '1',
      shelf: ''
    },
  });

  function onSubmit(data: BookFormValues) {
    // In a real app, you would send this data to your API
    console.log(data);
    
    toast({
      title: "বই যোগ করা হয়েছে",
      description: `"${data.title}" লাইব্রেরিতে যোগ করা হয়েছে।`,
    });
    
    setIsDialogOpen(false);
    form.reset();
  }

  return (
    <ModulePageLayout 
      title="লাইব্রেরি ব্যবস্থাপনা" 
      description="বই এবং লাইব্রেরির সকল তথ্য দেখুন ও পরিচালনা করুন।"
      icon={<BookOpen className="h-6 w-6" />}
      onAddNew={() => setIsDialogOpen(true)}
      addNewLabel="নতুন বই যোগ করুন"
    >
      <Tabs defaultValue="books" className="w-full">
        <div className="px-4 py-2 border-b">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="books">সকল বই</TabsTrigger>
            <TabsTrigger value="issues">ইস্যুকৃত বই</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="relative">
              <Input
                placeholder="বই বা লেখকের নাম দিয়ে খুঁজুন..."
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
            
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ক্যাটাগরি" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                <SelectItem value="history">ইতিহাস</SelectItem>
                <SelectItem value="science">বিজ্ঞান</SelectItem>
                <SelectItem value="literature">সাহিত্য</SelectItem>
                <SelectItem value="technology">প্রযুক্তি</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={() => setIsIssueDialogOpen(true)}
            >
              নতুন ইস্যু
            </Button>
          </div>
        </div>
        
        <TabsContent value="books" className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>বইয়ের নাম</TableHead>
                <TableHead>লেখক</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>মোট কপি</TableHead>
                <TableHead>উপলব্ধ</TableHead>
                <TableHead>শেলফ</TableHead>
                <TableHead className="text-right">কার্যক্রম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.category}</TableCell>
                  <TableCell>{book.copies}</TableCell>
                  <TableCell>{book.available}</TableCell>
                  <TableCell>{book.shelf}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">দেখুন</Button>
                    <Button variant="ghost" size="sm">সম্পাদনা</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="issues" className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>বইয়ের নাম</TableHead>
                <TableHead>শিক্ষার্থী</TableHead>
                <TableHead>শ্রেণি</TableHead>
                <TableHead>ইস্যু তারিখ</TableHead>
                <TableHead>ফেরতের তারিখ</TableHead>
                <TableHead className="text-right">কার্যক্রম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.book}</TableCell>
                  <TableCell>{issue.student}</TableCell>
                  <TableCell>{issue.class}</TableCell>
                  <TableCell>{issue.issueDate}</TableCell>
                  <TableCell>{issue.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">ফেরত নিন</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
      
      {/* Add Book Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>নতুন বই যোগ করুন</DialogTitle>
            <DialogDescription>
              বইয়ের সকল তথ্য সঠিকভাবে পূরণ করুন। তারকা (*) চিহ্নিত ঘর পূরণ করা বাধ্যতামূলক।
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>বইয়ের নাম *</FormLabel>
                      <FormControl>
                        <Input placeholder="বইয়ের পূর্ণ নাম লিখুন" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>লেখক *</FormLabel>
                      <FormControl>
                        <Input placeholder="লেখকের নাম" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN</FormLabel>
                      <FormControl>
                        <Input placeholder="ISBN নম্বর" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ক্যাটাগরি *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ইতিহাস">ইতিহাস</SelectItem>
                          <SelectItem value="বিজ্ঞান">বিজ্ঞান</SelectItem>
                          <SelectItem value="সাহিত্য">সাহিত্য</SelectItem>
                          <SelectItem value="ভাষা">ভাষা</SelectItem>
                          <SelectItem value="প্রযুক্তি">প্রযুক্তি</SelectItem>
                          <SelectItem value="গণিত">গণিত</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>প্রকাশক</FormLabel>
                      <FormControl>
                        <Input placeholder="প্রকাশকের নাম" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publicationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>প্রকাশনার বছর</FormLabel>
                      <FormControl>
                        <Input placeholder="প্রকাশনার বছর" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="copies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>কপি সংখ্যা *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="shelf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>শেলফ নম্বর *</FormLabel>
                      <FormControl>
                        <Input placeholder="উদাহরণ: A-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit">যোগ করুন</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Issue Book Dialog */}
      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>নতুন বই ইস্যু করুন</DialogTitle>
            <DialogDescription>
              বই ইস্যুর জন্য শিক্ষার্থী এবং বই নির্বাচন করুন।
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>শিক্ষার্থী *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="শিক্ষার্থী নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">করিম আহমেদ - নবম (২৫)</SelectItem>
                  <SelectItem value="2">ফাতেমা খাতুন - অষ্টম (১২)</SelectItem>
                  <SelectItem value="3">রাকিব হাসান - সপ্তম (০৮)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>বই *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="বই নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">বাংলাদেশের ইতিহাস - সিরাজুল ইসলাম</SelectItem>
                  <SelectItem value="2">বাংলা ব্যাকরণ - সুনীল গঙ্গোপাধ্যায়</SelectItem>
                  <SelectItem value="3">গণিতের মজা - মুহম্মদ জাফর ইকবাল</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ইস্যুর তারিখ *</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              
              <div className="space-y-2">
                <Label>ফেরতের তারিখ *</Label>
                <Input type="date" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>মন্তব্য</Label>
              <Input placeholder="প্রয়োজনীয় মন্তব্য লিখুন" />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={() => {
                toast({
                  title: "বই ইস্যু করা হয়েছে",
                  description: "বইটি সফলভাবে ইস্যু করা হয়েছে।",
                });
                setIsIssueDialogOpen(false);
              }}>
                ইস্যু করুন
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm font-medium">{children}</div>
);