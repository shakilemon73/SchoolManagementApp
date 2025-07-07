import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FeeReceiptsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  
  // Sample students
  const students = [
    { id: "STD001", name: "আব্দুল্লাহ আল মামুন", className: "৯ম শ্রেণী", section: "A", roll: "১" },
    { id: "STD002", name: "ফারিয়া ইসলাম", className: "৯ম শ্রেণী", section: "A", roll: "২" },
    { id: "STD003", name: "রাফিদ হাসান", className: "৯ম শ্রেণী", section: "B", roll: "৩" },
    { id: "STD004", name: "জারিন তাসনিম", className: "১০ম শ্রেণী", section: "A", roll: "১" },
    { id: "STD005", name: "তানভীর আহমেদ", className: "১০ম শ্রেণী", section: "B", roll: "২" }
  ];
  
  // Fee types
  const feeTypes = [
    { id: 1, name: "মাসিক বেতন" },
    { id: 2, name: "পরীক্ষা ফি" },
    { id: 3, name: "ভর্তি ফি" },
    { id: 4, name: "বার্ষিক ফি" },
    { id: 5, name: "অন্যান্য ফি" }
  ];
  
  // Recent receipts
  const recentReceipts = [
    { id: "REC-2025-1234", date: "2025-05-15", studentName: "আব্দুল্লাহ আল মামুন", className: "৯ম শ্রেণী", amount: 2000, method: "নগদ" },
    { id: "REC-2025-1235", date: "2025-05-15", studentName: "ফারিয়া ইসলাম", className: "৯ম শ্রেণী", amount: 2000, method: "মোবাইল" },
    { id: "REC-2025-1236", date: "2025-05-14", studentName: "রাফিদ হাসান", className: "৯ম শ্রেণী", amount: 2000, method: "নগদ" },
    { id: "REC-2025-1237", date: "2025-05-14", studentName: "জারিন তাসনিম", className: "১০ম শ্রেণী", amount: 2200, method: "ব্যাংক" },
    { id: "REC-2025-1238", date: "2025-05-13", studentName: "তানভীর আহমেদ", className: "১০ম শ্রেণী", amount: 2200, method: "নগদ" }
  ];
  
  // Fee items
  const feeItems = [
    { id: 1, name: "টিউশন ফি", amount: 1500 },
    { id: 2, name: "পরীক্ষা ফি", amount: 300 },
    { id: 3, name: "লাইব্রেরি ফি", amount: 200 }
  ];
  
  // Receipt generation
  const generateReceipt = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "রসিদ তৈরি হয়েছে",
        description: "ফি রসিদ সফলভাবে তৈরি করা হয়েছে",
      });
    }, 1500);
  };
  
  // Batch receipt generation
  const generateBatchReceipts = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "ব্যাচ রসিদ তৈরি হয়েছে",
        description: "ব্যাচ ফি রসিদ সফলভাবে তৈরি করা হয়েছে",
      });
    }, 1500);
  };

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            ফি রসিদ
          </h1>
          <p className="text-gray-600 mt-1">
            শিক্ষার্থীদের ফি এবং অন্যান্য পেমেন্ট সংগ্রহ করুন ও প্রিন্ট করুন
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <span className="material-icons text-gray-500 text-sm">refresh</span>
            রিসেট
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            onClick={generateReceipt}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="material-icons animate-spin text-sm">refresh</span>
                প্রসেসিং...
              </>
            ) : (
              <>
                <span className="material-icons text-sm">receipt</span>
                রসিদ তৈরি করুন
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="generate">
            <span className="material-icons mr-2 text-sm">receipt</span>
            <span>রসিদ তৈরি করুন</span>
          </TabsTrigger>
          <TabsTrigger value="batch">
            <span className="material-icons mr-2 text-sm">receipt_long</span>
            <span>ব্যাচ প্রসেসিং</span>
          </TabsTrigger>
          <TabsTrigger value="history">
            <span className="material-icons mr-2 text-sm">history</span>
            <span>ইতিহাস</span>
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="generate" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>নতুন ফি রসিদ</CardTitle>
              <CardDescription>
                শিক্ষার্থীর ফি পেমেন্ট রসিদ তৈরি করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="student-id">শিক্ষার্থী আইডি</Label>
                    <Select defaultValue="STD001">
                      <SelectTrigger id="student-id">
                        <SelectValue placeholder="শিক্ষার্থী নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(student => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} - {student.className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="receipt-no">রসিদ নম্বর</Label>
                    <Input 
                      id="receipt-no" 
                      defaultValue={`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`} 
                      readOnly 
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">অটো-জেনারেটেড</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="receipt-date">তারিখ</Label>
                    <Input id="receipt-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ফি আইটেম</TableHead>
                        <TableHead className="text-right">পরিমাণ (৳)</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input value={item.name} placeholder="ফি আইটেমের নাম" />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.amount}
                              className="text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                            >
                              <span className="material-icons text-red-500">delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <span className="material-icons text-gray-500 text-sm">add_circle</span>
                            আরও আইটেম যোগ করুন
                          </Button>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow className="font-bold">
                        <TableCell>মোট</TableCell>
                        <TableCell className="text-right">৳{feeItems.reduce((sum, item) => sum + item.amount, 0)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="payment-method">পেমেন্ট মেথড</Label>
                    <Select defaultValue="cash">
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="পেমেন্ট মেথড নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">নগদ</SelectItem>
                        <SelectItem value="bank">ব্যাংক ট্রান্সফার</SelectItem>
                        <SelectItem value="mobile">মোবাইল ব্যাংকিং</SelectItem>
                        <SelectItem value="check">চেক</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="transaction-id">ট্রানজেকশন আইডি</Label>
                    <Input id="transaction-id" placeholder="ট্রানজেকশন আইডি লিখুন" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">নোট (ঐচ্ছিক)</Label>
                  <Textarea 
                    rows={3} 
                    id="notes"
                    placeholder="অতিরিক্ত নোট বা মন্তব্য লিখুন"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="batch" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>ব্যাচ ফি রসিদ</CardTitle>
              <CardDescription>
                একই সাথে একাধিক শিক্ষার্থীর জন্য ফি রসিদ তৈরি করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="class-name">শ্রেণী</Label>
                    <Select defaultValue="9">
                      <SelectTrigger id="class-name">
                        <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সকল শ্রেণী</SelectItem>
                        <SelectItem value="6">৬ষ্ঠ শ্রেণী</SelectItem>
                        <SelectItem value="7">৭ম শ্রেণী</SelectItem>
                        <SelectItem value="8">৮ম শ্রেণী</SelectItem>
                        <SelectItem value="9">৯ম শ্রেণী</SelectItem>
                        <SelectItem value="10">১০ম শ্রেণী</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="section">শাখা</Label>
                    <Select defaultValue="A">
                      <SelectTrigger id="section">
                        <SelectValue placeholder="শাখা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সকল শাখা</SelectItem>
                        <SelectItem value="A">A শাখা</SelectItem>
                        <SelectItem value="B">B শাখা</SelectItem>
                        <SelectItem value="C">C শাখা</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="fee-type">ফি টাইপ</Label>
                    <Select defaultValue="1">
                      <SelectTrigger id="fee-type">
                        <SelectValue placeholder="ফি টাইপ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {feeTypes.map(type => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="month">মাস</Label>
                    <Input id="month" type="month" defaultValue={new Date().toISOString().split('T')[0].substring(0, 7)} />
                  </div>
                  
                  <div>
                    <Label htmlFor="due-date">শেষ তারিখ</Label>
                    <Input id="due-date" type="date" defaultValue={new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0]} />
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <Label className="mb-3 block">প্রিন্টিং অপশন</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="printOption" id="all" checked />
                      <label htmlFor="all">সব একসাথে প্রিন্ট করুন</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="printOption" id="individual" />
                      <label htmlFor="individual">পৃথক পৃথক প্রিন্ট করুন</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="printOption" id="combined" />
                      <label htmlFor="combined">শুধু তালিকা প্রিন্ট করুন</label>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <input type="checkbox" id="select-all" checked />
                        </TableHead>
                        <TableHead>আইডি</TableHead>
                        <TableHead>নাম</TableHead>
                        <TableHead>শ্রেণী</TableHead>
                        <TableHead>শাখা</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students
                        .filter(student => student.className === "৯ম শ্রেণী" && student.section === "A")
                        .map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <input type="checkbox" id={`select-${student.id}`} checked />
                          </TableCell>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.className}</TableCell>
                          <TableCell>{student.section}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              বকেয়া
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <span className="material-icons text-gray-500 text-sm">refresh</span>
                    রিসেট
                  </Button>
                  
                  <Button 
                    className="flex items-center gap-2"
                    onClick={generateBatchReceipts}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-icons animate-spin text-sm">refresh</span>
                        প্রসেসিং...
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-sm">receipt_long</span>
                        রসিদ তৈরি করুন
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>রসিদ ইতিহাস</CardTitle>
              <CardDescription>
                সকল ফি রসিদের ইতিহাস দেখুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <Label htmlFor="history-class">শ্রেণী</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="history-class">
                      <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সকল শ্রেণী</SelectItem>
                      <SelectItem value="6">৬ষ্ঠ শ্রেণী</SelectItem>
                      <SelectItem value="7">৭ম শ্রেণী</SelectItem>
                      <SelectItem value="8">৮ম শ্রেণী</SelectItem>
                      <SelectItem value="9">৯ম শ্রেণী</SelectItem>
                      <SelectItem value="10">১০ম শ্রেণী</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="history-date-range">তারিখ</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="history-date-range">
                      <SelectValue placeholder="তারিখ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব তারিখ</SelectItem>
                      <SelectItem value="today">আজ</SelectItem>
                      <SelectItem value="week">এই সপ্তাহ</SelectItem>
                      <SelectItem value="month">এই মাস</SelectItem>
                      <SelectItem value="custom">কাস্টম রেঞ্জ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="history-payment-method">পেমেন্ট মেথড</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="history-payment-method">
                      <SelectValue placeholder="পেমেন্ট মেথড নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব মেথড</SelectItem>
                      <SelectItem value="cash">নগদ</SelectItem>
                      <SelectItem value="bank">ব্যাংক ট্রান্সফার</SelectItem>
                      <SelectItem value="mobile">মোবাইল ব্যাংকিং</SelectItem>
                      <SelectItem value="check">চেক</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="search-receipt">সার্চ</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <span className="material-icons text-sm">search</span>
                    </span>
                    <Input 
                      id="search-receipt" 
                      placeholder="রসিদ নম্বর, নাম, বা আইডি" 
                      className="pl-10" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>রসিদ নং</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>শিক্ষার্থী</TableHead>
                      <TableHead>শ্রেণী</TableHead>
                      <TableHead>পরিমাণ</TableHead>
                      <TableHead>পেমেন্ট মেথড</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead className="text-right">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReceipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">{receipt.id}</TableCell>
                        <TableCell>{receipt.date}</TableCell>
                        <TableCell>{receipt.studentName}</TableCell>
                        <TableCell>{receipt.className}</TableCell>
                        <TableCell>৳{receipt.amount}</TableCell>
                        <TableCell>{receipt.method}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            পরিশোধিত
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <span className="material-icons">visibility</span>
                            </Button>
                            <Button variant="ghost" size="icon">
                              <span className="material-icons">print</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  দেখানো হচ্ছে 1-5 (মোট 5)
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>
                    <span className="material-icons text-sm">chevron_left</span>
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <span className="material-icons text-sm">chevron_right</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}