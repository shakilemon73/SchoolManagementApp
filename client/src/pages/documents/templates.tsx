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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const templateSchema = {
  documentTypes: [
    { id: 'admit-card', name: 'Admit Card', nameBn: 'প্রবেশপত্র' },
    { id: 'id-card', name: 'ID Card', nameBn: 'পরিচয় পত্র' },
    { id: 'fee-receipt', name: 'Fee Receipt', nameBn: 'ফি রসিদ' },
    { id: 'marksheet', name: 'Marksheet', nameBn: 'মার্কশীট' },
    { id: 'testimonial', name: 'Testimonial', nameBn: 'প্রশংসাপত্র' },
    { id: 'result-sheet', name: 'Result Sheet', nameBn: 'ফলাফল শীট' },
    { id: 'pay-sheet', name: 'Pay Sheet', nameBn: 'পে-শীট' },
    { id: 'class-routine', name: 'Class Routine', nameBn: 'ক্লাস রুটিন' },
    { id: 'teacher-routine', name: 'Teacher Routine', nameBn: 'শিক্ষক রুটিন' },
    { id: 'admission-form', name: 'Admission Form', nameBn: 'ভর্তি ফরম' }
  ],
  templateStyles: [
    { id: 'modern-blue', name: 'Modern Blue', nameBn: 'আধুনিক নীল' },
    { id: 'classic-green', name: 'Classic Green', nameBn: 'ক্লাসিক সবুজ' },
    { id: 'professional', name: 'Professional', nameBn: 'প্রফেশনাল' },
    { id: 'traditional', name: 'Traditional', nameBn: 'ঐতিহ্যবাহী' },
    { id: 'minimalist', name: 'Minimalist', nameBn: 'মিনিমালিস্ট' },
    { id: 'colorful', name: 'Colorful', nameBn: 'রঙিন' },
    { id: 'custom', name: 'Custom', nameBn: 'কাস্টম' }
  ]
};

export default function TemplatesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('admit-card');
  
  const renderCreateTemplateTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>"templates.createTemplate"</CardTitle>
        <CardDescription>"templates.createTemplateDescription"</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="document-type">"templates.documentType"</Label>
              <Select 
                defaultValue={selectedDocumentType}
                onValueChange={(value) => setSelectedDocumentType(value)}
              >
                <SelectTrigger id="document-type">
                  <SelectValue placeholder="templates.selectDocumentType" />
                </SelectTrigger>
                <SelectContent>
                  {templateSchema.documentTypes.map((docType) => (
                    <SelectItem key={docType.id} value={docType.id}>
                      {language === 'bn' ? docType.nameBn : docType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-name">"templates.templateName"</Label>
              <Input id="template-name" placeholder="templates.enterTemplateName" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>"templates.templateStyle"</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {templateSchema.templateStyles.map((style) => (
                <div 
                  key={style.id}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors",
                    selectedTemplate === style.id ? "border-primary bg-primary/5" : "border-border"
                  )}
                  onClick={() => setSelectedTemplate(style.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{language === 'bn' ? style.nameBn : style.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {style.id === 'custom' 
                          ? "কন্টেন্ট" 
                          : "কন্টেন্ট"
                        }
                      </p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full",
                      selectedTemplate === style.id
                        ? "bg-primary border-2 border-background"
                        : "border border-muted-foreground" 
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>"templates.templateElements"</Label>
              <Button variant="outline" size="sm">
                <span className="material-icons text-sm mr-1">add</span>
                "templates.addElement"
              </Button>
            </div>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>"templates.element"</TableHead>
                    <TableHead>"templates.position"</TableHead>
                    <TableHead>"templates.size"</TableHead>
                    <TableHead className="text-right">"templates.actions"</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">"templates.logo"</div>
                      <div className="text-sm text-muted-foreground">"templates.imageElement"</div>
                    </TableCell>
                    <TableCell>Top Left</TableCell>
                    <TableCell>100x100px</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="material-icons text-muted-foreground text-sm">edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="material-icons text-red-500 text-sm">delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">"templates.title"</div>
                      <div className="text-sm text-muted-foreground">"templates.textElement"</div>
                    </TableCell>
                    <TableCell>Top Center</TableCell>
                    <TableCell>24pt</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="material-icons text-muted-foreground text-sm">edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="material-icons text-red-500 text-sm">delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">"templates.studentInfo"</div>
                      <div className="text-sm text-muted-foreground">"templates.detailsSection"</div>
                    </TableCell>
                    <TableCell>Middle</TableCell>
                    <TableCell>14pt</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="material-icons text-muted-foreground text-sm">edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="material-icons text-red-500 text-sm">delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-2/3 space-y-2">
              <Label>"templates.paperSize"</Label>
              <RadioGroup defaultValue="a4" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="a4" id="a4" />
                  <Label htmlFor="a4" className="font-normal">A4</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="a5" id="a5" />
                  <Label htmlFor="a5" className="font-normal">A5</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="letter" id="letter" />
                  <Label htmlFor="letter" className="font-normal">Letter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom-size" />
                  <Label htmlFor="custom-size" className="font-normal">"templates.custom"</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="w-full md:w-1/3 space-y-2">
              <Label>"templates.orientation"</Label>
              <RadioGroup defaultValue="portrait" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait" className="font-normal">"templates.portrait"</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape" className="font-normal">"templates.landscape"</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          "templates.preview"
        </Button>
        <Button
          onClick={() => {
            toast({
              title: "কন্টেন্ট",
              description: "কন্টেন্ট"
            });
          }}
        >
          "templates.saveTemplate"
        </Button>
      </CardFooter>
    </Card>
  );
  
  const renderManageTemplatesTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>"templates.manageTemplates"</CardTitle>
        <CardDescription>"templates.manageTemplatesDescription"</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <span className="material-icons text-sm">search</span>
                </span>
                <Input 
                  placeholder="templates.searchTemplates" 
                  className="pl-10"
                />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="templates.documentType" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">"templates.allDocuments"</SelectItem>
                {templateSchema.documentTypes.map((docType) => (
                  <SelectItem key={docType.id} value={docType.id}>
                    {language === 'bn' ? docType.nameBn : docType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>"templates.templateName"</TableHead>
                  <TableHead>"templates.documentType"</TableHead>
                  <TableHead>"templates.style"</TableHead>
                  <TableHead>"templates.lastModified"</TableHead>
                  <TableHead className="text-right">"templates.actions"</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {`$"templates.template" ${i} - ${language === 'bn' ? 'ডিজাইন' : 'Design'} ${i}`}
                    </TableCell>
                    <TableCell>
                      {language === 'bn' 
                        ? templateSchema.documentTypes[i-1].nameBn 
                        : templateSchema.documentTypes[i-1].name
                      }
                    </TableCell>
                    <TableCell>
                      {language === 'bn' 
                        ? templateSchema.templateStyles[i-1].nameBn 
                        : templateSchema.templateStyles[i-1].name
                      }
                    </TableCell>
                    <TableCell>{`${new Date().toLocaleDateString()}`}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="material-icons text-muted-foreground text-sm">content_copy</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="material-icons text-muted-foreground text-sm">edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="material-icons text-red-500 text-sm">delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderImportExportTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>"templates.importExport"</CardTitle>
        <CardDescription>"templates.importExportDescription"</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="border rounded-lg p-6 bg-muted/30">
            <h3 className="text-lg font-medium mb-4">"templates.importTemplates"</h3>
            <p className="text-muted-foreground mb-4">
              "templates.importTemplatesDescription"
            </p>
            <div className="flex items-center gap-4">
              <Input type="file" className="w-full max-w-sm" />
              <Button>
                <span className="material-icons text-sm mr-1">upload</span>
                "templates.import"
              </Button>
            </div>
          </div>
          
          <div className="border rounded-lg p-6 bg-muted/30">
            <h3 className="text-lg font-medium mb-4">"templates.exportTemplates"</h3>
            <p className="text-muted-foreground mb-4">
              "templates.exportTemplatesDescription"
            </p>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">"templates.selectTemplatestoExport"</Label>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Checkbox id={`template-${i}`} />
                      <Label htmlFor={`template-${i}`} className="font-normal">
                        {`$"templates.template" ${i} - ${language === 'bn' ? templateSchema.documentTypes[i-1].nameBn : templateSchema.documentTypes[i-1].name}`}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Select defaultValue="json">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="templates.exportFormat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="zip">ZIP</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <span className="material-icons text-sm mr-1">download</span>
                  "templates.export"
                </Button>
              </div>
            </div>
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
            <h1 className="text-2xl font-semibold tracking-tight">"templates.title"</h1>
            <p className="text-muted-foreground">"templates.description"</p>
          </div>
          <Button
            onClick={() => {
              setActiveTab('create');
              toast({
                title: "কন্টেন্ট",
                description: "কন্টেন্ট"
              });
            }}
          >
            <span className="material-icons text-sm mr-1">add</span>
            "templates.newTemplate"
          </Button>
        </div>
        
        <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="h-auto p-0 bg-transparent justify-start">
              <TabsTrigger
                value="create"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
              >
                "templates.create"
              </TabsTrigger>
              <TabsTrigger
                value="manage"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
              >
                "templates.manage"
              </TabsTrigger>
              <TabsTrigger
                value="import-export"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
              >
                "templates.importExport"
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="create" className="mt-0">
            {renderCreateTemplateTab()}
          </TabsContent>
          
          <TabsContent value="manage" className="mt-0">
            {renderManageTemplatesTab()}
          </TabsContent>
          
          <TabsContent value="import-export" className="mt-0">
            {renderImportExportTab()}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}