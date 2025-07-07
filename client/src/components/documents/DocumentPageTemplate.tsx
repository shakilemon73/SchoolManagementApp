import { useState, useRef, ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DocumentPageTemplateProps {
  documentType: string;
  documentTypeBn: string;
  documentTypeAr: string;
  children: ReactNode;
  stepOneForm: ReactNode;
  stepTwoForm: ReactNode;
  previewComponent: ReactNode;
  onGeneratePDF?: () => void;
  onPrint?: () => void;
}

export function DocumentPageTemplate({
  documentType,
  documentTypeBn,
  documentTypeAr,
  children,
  stepOneForm,
  stepTwoForm,
  previewComponent,
  onGeneratePDF,
  onPrint
}: DocumentPageTemplateProps) {
  const { toast } = useToast();
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState<string>("জেনারেট");
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const goBack = () => {
    if (previewMode) {
      setPreviewMode(false);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setPreviewMode(false);
  };

  const generatePDF = async () => {
    if (onGeneratePDF) {
      onGeneratePDF();
      return;
    }

    if (!documentRef.current) return;

    toast({
      title: "পিডিএফ তৈরি হচ্ছে",
      description: "অনুগ্রহ করে অপেক্ষা করুন...",
    });

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${documentType.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast({
        title: "পিডিএফ তৈরি হয়েছে",
        description: `আপনার ${documentTypeBn} পিডিএফ ডাউনলোড হয়েছে।`,
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast({
        title: "পিডিএফ তৈরি ব্যর্থ হয়েছে",
        description: "আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  };

  const printDocument = async () => {
    if (onPrint) {
      onPrint();
      return;
    }

    if (!documentRef.current) return;
    
    try {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) {
        toast({
          title: "প্রিন্ট সমস্যা",
          description: "প্রিন্ট উইন্ডো খুলতে সমস্যা হয়েছে, পপ-আপ ব্লকার বন্ধ করুন।",
          variant: "destructive",
        });
        return;
      }
      
      const html = `
        <html>
          <head>
            <title>${documentTypeBn} প্রিন্ট</title>
            <style>
              body { margin: 0; padding: 0; }
              .document-container { width: 100%; height: 100%; }
            </style>
          </head>
          <body>
            <div class="document-container">
              ${documentRef.current.outerHTML}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      console.error("Print failed:", error);
      toast({
        title: "প্রিন্ট ব্যর্থ হয়েছে",
        description: "আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  };

  if (isMobile) {
    return (
      <AppShell>
        <NavigationBar
          title={{
            en: documentType,
            bn: documentTypeBn,
            ar: documentTypeAr
          }}
        />
        <div className="space-y-4 p-4">
          {previewMode ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={goBack}>
                  ← ফিরে যান
                </Button>
                <div className="flex gap-2">
                  <Button onClick={printDocument} variant="outline" size="sm">
                    প্রিন্ট
                  </Button>
                  <Button onClick={generatePDF} size="sm">
                    পিডিএফ
                  </Button>
                </div>
              </div>
              <div ref={documentRef}>
                {previewComponent}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>পদক্ষেপ ১: তথ্য প্রবেশ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stepOneForm}
                  </CardContent>
                </Card>
              )}
              
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>পদক্ষেপ ২: টেমপ্লেট সেটিংস</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stepTwoForm}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <NavigationBar
        title={{
          en: documentType,
          bn: documentTypeBn,
          ar: documentTypeAr
        }}
      />
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{documentTypeBn}</h1>
          <p className="text-gray-600">পেশাদার {documentTypeBn} তৈরি করুন</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="জেনারেট">জেনারেট</TabsTrigger>
            <TabsTrigger value="টেমপ্লেট">টেমপ্লেট</TabsTrigger>
            <TabsTrigger value="সহায়তা">সহায়তা</TabsTrigger>
          </TabsList>
          
          <TabsContent value="জেনারেট" className="space-y-6">
            {previewMode ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={goBack}>
                    ← ফিরে যান
                  </Button>
                  <div className="flex gap-4">
                    <Button onClick={resetForm} variant="outline">
                      নতুন করে শুরু
                    </Button>
                    <Button onClick={printDocument} variant="outline">
                      প্রিন্ট করুন
                    </Button>
                    <Button onClick={generatePDF}>
                      পিডিএফ ডাউনলোড
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div ref={documentRef} className="max-w-4xl">
                    {previewComponent}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {currentStep === 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>পদক্ষেপ ১: তথ্য প্রবেশ করুন</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {stepOneForm}
                      </CardContent>
                    </Card>
                  )}
                  
                  {currentStep === 2 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>পদক্ষেপ ২: টেমপ্লেট সেটিংস</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {stepTwoForm}
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>অগ্রগতি</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                          <span>তথ্য প্রবেশ</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                          <span>টেমপ্লেট নির্বাচন</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${previewMode ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-3 h-3 rounded-full ${previewMode ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                          <span>প্রিভিউ ও ডাউনলোড</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {children}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="টেমপ্লেট" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>টেমপ্লেট গ্যালারি</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">বিভিন্ন পেশাদার টেমপ্লেট থেকে বেছে নিন</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="সহায়তা" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>সহায়তা ও নির্দেশনা</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">কিভাবে ব্যবহার করবেন:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      <li>প্রয়োজনীয় তথ্য পূরণ করুন</li>
                      <li>পছন্দের টেমপ্লেট নির্বাচন করুন</li>
                      <li>প্রিভিউ দেখুন এবং প্রয়োজনে সম্পাদনা করুন</li>
                      <li>পিডিএফ ডাউনলোড বা প্রিন্ট করুন</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

// Export helper functions for step management
export function useDocumentSteps() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

  const nextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setPreviewMode(true);
    }
  };

  const goBack = () => {
    if (previewMode) {
      setPreviewMode(false);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(1);
    setPreviewMode(false);
  };

  return {
    currentStep,
    previewMode,
    nextStep,
    goBack,
    reset
  };
}