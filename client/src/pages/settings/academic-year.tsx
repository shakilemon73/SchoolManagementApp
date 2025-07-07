import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function AcademicYearPage() {

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('current');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [admissionStartDate, setAdmissionStartDate] = useState<Date | undefined>();
  const [admissionEndDate, setAdmissionEndDate] = useState<Date | undefined>();
  
  const renderCurrentAcademicYearTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>"academicYear.currentTitle"</CardTitle>
        <CardDescription>"academicYear.currentDesc"</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
            <div>
              <h3 className="font-medium text-lg">2025</h3>
              <p className="text-sm text-muted-foreground">"academicYear.currentActive"</p>
            </div>
            <div className="flex items-center">
              <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mr-4">
                "academicYear.active"
              </div>
              <Button variant="outline" size="sm">
                "academicYear.viewDetails"
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-4">"academicYear.keyInformation"</h3>
              <dl className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-3 items-center">
                  <dt className="text-sm font-medium text-muted-foreground">"academicYear.startDate"</dt>
                  <dd className="col-span-2">{startDate ? startDate.toLocaleDateString() : '01/01/2025'}</dd>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <dt className="text-sm font-medium text-muted-foreground">"academicYear.endDate"</dt>
                  <dd className="col-span-2">{endDate ? endDate.toLocaleDateString() : '31/12/2025'}</dd>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <dt className="text-sm font-medium text-muted-foreground">"academicYear.totalStudents"</dt>
                  <dd className="col-span-2">1,250</dd>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <dt className="text-sm font-medium text-muted-foreground">"academicYear.totalTeachers"</dt>
                  <dd className="col-span-2">75</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">"academicYear.admissions"</h3>
              <dl className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-3 items-center">
                  <dt className="text-sm font-medium text-muted-foreground">"academicYear.admissionStart"</dt>
                  <dd className="col-span-2">{admissionStartDate ? admissionStartDate.toLocaleDateString() : '01/11/2024'}</dd>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <dt className="text-sm font-medium text-muted-foreground">"academicYear.admissionEnd"</dt>
                  <dd className="col-span-2">{admissionEndDate ? admissionEndDate.toLocaleDateString() : '31/12/2024'}</dd>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <dt className="text-sm font-medium text-muted-foreground">"academicYear.newAdmissions"</dt>
                  <dd className="col-span-2">350</dd>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <dt className="text-sm font-medium text-muted-foreground">"academicYear.status"</dt>
                  <dd className="col-span-2">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      "academicYear.active"
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-4">"academicYear.upcomingEvents"</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>"academicYear.eventName"</TableHead>
                    <TableHead>"academicYear.date"</TableHead>
                    <TableHead>"academicYear.duration"</TableHead>
                    <TableHead>"academicYear.status"</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">"academicYear.midtermExams"</TableCell>
                    <TableCell>15/06/2025</TableCell>
                    <TableCell>2 "academicYear.weeks"</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                        "academicYear.upcoming"
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">"academicYear.summerHoliday"</TableCell>
                    <TableCell>01/07/2025</TableCell>
                    <TableCell>1 "academicYear.month"</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                        "academicYear.upcoming"
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">"academicYear.finalExams"</TableCell>
                    <TableCell>15/11/2025</TableCell>
                    <TableCell>3 "academicYear.weeks"</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                        "academicYear.upcoming"
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <Button variant="outline">
          <span className="material-icons text-sm mr-1">event</span>
          "academicYear.manageEvents"
        </Button>
        <Button variant="outline">
          <span className="material-icons text-sm mr-1">schedule</span>
          "academicYear.manageSchedule"
        </Button>
        <Button>
          <span className="material-icons text-sm mr-1">edit</span>
          "academicYear.editAcademicYear"
        </Button>
      </CardFooter>
    </Card>
  );
  
  const renderCreateAcademicYearTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>"academicYear.createTitle"</CardTitle>
        <CardDescription>"academicYear.createDesc"</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="year-name">"academicYear.yearName"</Label>
              <Input id="year-name" placeholder="2026" />
            </div>
            <div className="space-y-2">
              <Label>"academicYear.isActive"</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="is-active" />
                <Label htmlFor="is-active" className="font-normal">
                  "academicYear.markAsActive"
                </Label>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start-date">"academicYear.startDate"</Label>
              <DatePicker date={startDate} setDate={setStartDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">"academicYear.endDate"</Label>
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-4">"academicYear.admissionPeriod"</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="admission-start">"academicYear.admissionStart"</Label>
                <DatePicker date={admissionStartDate} setDate={setAdmissionStartDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admission-end">"academicYear.admissionEnd"</Label>
                <DatePicker date={admissionEndDate} setDate={setAdmissionEndDate} />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-4">"academicYear.terms"</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">"academicYear.term" 1</h4>
                    <p className="text-sm text-muted-foreground">"academicYear.firstTerm"</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <span className="material-icons text-sm">edit</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-3 items-center">
                    <dt className="text-sm font-medium text-muted-foreground">"academicYear.startDate"</dt>
                    <dd className="col-span-2">01/01/2026</dd>
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <dt className="text-sm font-medium text-muted-foreground">"academicYear.endDate"</dt>
                    <dd className="col-span-2">30/04/2026</dd>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">"academicYear.term" 2</h4>
                    <p className="text-sm text-muted-foreground">"academicYear.secondTerm"</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <span className="material-icons text-sm">edit</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-3 items-center">
                    <dt className="text-sm font-medium text-muted-foreground">"academicYear.startDate"</dt>
                    <dd className="col-span-2">01/05/2026</dd>
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <dt className="text-sm font-medium text-muted-foreground">"academicYear.endDate"</dt>
                    <dd className="col-span-2">31/08/2026</dd>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">"academicYear.term" 3</h4>
                    <p className="text-sm text-muted-foreground">"academicYear.thirdTerm"</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <span className="material-icons text-sm">edit</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-3 items-center">
                    <dt className="text-sm font-medium text-muted-foreground">"academicYear.startDate"</dt>
                    <dd className="col-span-2">01/09/2026</dd>
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <dt className="text-sm font-medium text-muted-foreground">"academicYear.endDate"</dt>
                    <dd className="col-span-2">31/12/2026</dd>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <span className="material-icons text-sm mr-1">add</span>
                "academicYear.addTerm"
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          "academicYear.cancel"
        </Button>
        <Button
          onClick={() => {
            toast({
              title: "সফলভাবে সংরক্ষিত",
              description: "শিক্ষাবর্ষের তথ্য আপডেট করা হয়েছে"
            });
          }}
        >
          "academicYear.createAcademicYear"
        </Button>
      </CardFooter>
    </Card>
  );
  
  const renderPreviousAcademicYearsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>"academicYear.previousTitle"</CardTitle>
        <CardDescription>"academicYear.previousDesc"</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <span className="material-icons text-sm">search</span>
              </span>
              <Input 
                placeholder="academicYear.searchYears" 
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {[2024, 2023, 2022].map((year) => (
              <div 
                key={year}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{year}</h3>
                  <p className="text-sm text-muted-foreground">
                    "academicYear.students": {1000 + Math.floor(Math.random() * 500)} | "academicYear.teachers": {70 + Math.floor(Math.random() * 10)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                    "academicYear.archived"
                  </div>
                  <Button variant="outline" size="sm">
                    "academicYear.viewDetails"
                  </Button>
                  <Button variant="outline" size="sm">
                    <span className="material-icons text-sm">content_copy</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline">
              "academicYear.loadMore"
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <AppShell>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">"academicYear.title"</h1>
            <p className="text-muted-foreground">"academicYear.description"</p>
          </div>
          <Button
            onClick={() => {
              setActiveTab('create');
            }}
          >
            <span className="material-icons text-sm mr-1">add</span>
            "academicYear.newAcademicYear"
          </Button>
        </div>
        
        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="h-auto p-0 bg-transparent justify-start">
              <TabsTrigger
                value="current"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
              >
                "academicYear.current"
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
              >
                "academicYear.create"
              </TabsTrigger>
              <TabsTrigger
                value="previous"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
              >
                "academicYear.previous"
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="current" className="mt-0">
            {renderCurrentAcademicYearTab()}
          </TabsContent>
          
          <TabsContent value="create" className="mt-0">
            {renderCreateAcademicYearTab()}
          </TabsContent>
          
          <TabsContent value="previous" className="mt-0">
            {renderPreviousAcademicYearsTab()}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}