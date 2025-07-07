import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DatePicker } from '@/components/ui/date-picker';

export default function TestimonialsPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const [previewMode, setPreviewMode] = useState(false);
  
  const renderFeatureList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto my-6">
      <div className="border rounded-md p-4 bg-white shadow-sm">
        <h4 className="font-medium mb-2">"testimonials.conduct"</h4>
        <p className="text-sm text-gray-500">"testimonials.conductDescription"</p>
      </div>
      <div className="border rounded-md p-4 bg-white shadow-sm">
        <h4 className="font-medium mb-2">"testimonials.activities"</h4>
        <p className="text-sm text-gray-500">"testimonials.activitiesDescription"</p>
      </div>
      <div className="border rounded-md p-4 bg-white shadow-sm">
        <h4 className="font-medium mb-2">"testimonials.academicInformation"</h4>
        <p className="text-sm text-gray-500">"common.comingSoon"</p>
      </div>
      <div className="border rounded-md p-4 bg-white shadow-sm">
        <h4 className="font-medium mb-2">"testimonials.templateOptions"</h4>
        <p className="text-sm text-gray-500">"testimonials.templateOptionsDescription"</p>
      </div>
    </div>
  );
  
  const renderStudentDetailsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="studentName">"testimonials.studentName"</Label>
          <Input id="studentName" placeholder="John Doe" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="studentNameBn">"testimonials.studentNameBn"</Label>
          <Input id="studentNameBn" placeholder="জন ডো" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="studentId">"testimonials.studentId"</Label>
          <Input id="studentId" placeholder="STD-123456" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="class">"testimonials.class"</Label>
          <Select>
            <SelectTrigger id="class">
              <SelectValue placeholder="classRoutines.selectClass" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class10">"classRoutines.class10"</SelectItem>
              <SelectItem value="class9">"classRoutines.class9"</SelectItem>
              <SelectItem value="class8">"classRoutines.class8"</SelectItem>
              <SelectItem value="class7">"classRoutines.class7"</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="section">"testimonials.section"</Label>
          <Select>
            <SelectTrigger id="section">
              <SelectValue placeholder="classRoutines.selectSection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">"classRoutines.sectionA"</SelectItem>
              <SelectItem value="B">"classRoutines.sectionB"</SelectItem>
              <SelectItem value="C">"classRoutines.sectionC"</SelectItem>
              <SelectItem value="science">"classRoutines.scienceGroup"</SelectItem>
              <SelectItem value="arts">"classRoutines.artsGroup"</SelectItem>
              <SelectItem value="commerce">"classRoutines.commerceGroup"</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="rollNumber">"testimonials.rollNumber"</Label>
          <Input id="rollNumber" placeholder="123" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="admissionDate">"testimonials.admissionDate"</Label>
          <DatePicker />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="graduationDate">"testimonials.graduationDate"</Label>
          <DatePicker />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">"testimonials.dateOfBirth"</Label>
          <DatePicker />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="studentPhoto">"testimonials.studentPhoto"</Label>
          <Input id="studentPhoto" type="file" />
        </div>
      </div>
    </div>
  );
  
  const renderAcademicInformationSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="schoolName">"testimonials.schoolName"</Label>
          <Input id="schoolName" placeholder="ABC School and College" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="schoolCode">"testimonials.schoolCode"</Label>
          <Input id="schoolCode" placeholder="123456" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="boardExam">"testimonials.boardExam"</Label>
          <Select>
            <SelectTrigger id="boardExam">
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SSC">SSC</SelectItem>
              <SelectItem value="JSC">JSC</SelectItem>
              <SelectItem value="HSC">HSC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="examYear">"testimonials.examYear"</Label>
          <Select>
            <SelectTrigger id="examYear">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gpa">"testimonials.gpa"</Label>
          <Input id="gpa" placeholder="5.00" />
        </div>
      </div>
    </div>
  );
  
  const renderConductAndCharacterSection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="conduct">"testimonials.conduct"</Label>
        <Select>
          <SelectTrigger id="conduct">
            <SelectValue placeholder="Select conduct rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excellent">"testimonials.excellentConduct"</SelectItem>
            <SelectItem value="good">"testimonials.goodConduct"</SelectItem>
            <SelectItem value="satisfactory">"testimonials.satisfactoryConduct"</SelectItem>
            <SelectItem value="average">"testimonials.averageConduct"</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="character">"testimonials.character"</Label>
        <Select>
          <SelectTrigger id="character">
            <SelectValue placeholder="Select character rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excellent">"testimonials.excellentConduct"</SelectItem>
            <SelectItem value="good">"testimonials.goodConduct"</SelectItem>
            <SelectItem value="satisfactory">"testimonials.satisfactoryConduct"</SelectItem>
            <SelectItem value="average">"testimonials.averageConduct"</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="conductDescription">"testimonials.conductDescription"</Label>
        <Textarea 
          id="conductDescription" 
          placeholder="Describe the student's conduct and character" 
          className="min-h-[100px]" 
        />
      </div>
    </div>
  );
  
  const renderActivitiesSection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="sports">"testimonials.sports"</Label>
        <Textarea 
          id="sports" 
          placeholder="Sports activities the student participated in" 
          className="min-h-[80px]" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="culturalActivities">"testimonials.culturalActivities"</Label>
        <Textarea 
          id="culturalActivities" 
          placeholder="Cultural activities the student participated in" 
          className="min-h-[80px]" 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="debates">"testimonials.debates"</Label>
          <Textarea 
            id="debates" 
            placeholder="Debate participation" 
            className="min-h-[80px]" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clubs">"testimonials.clubs"</Label>
          <Textarea 
            id="clubs" 
            placeholder="Club memberships" 
            className="min-h-[80px]" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="otherActivities">"testimonials.otherActivities"</Label>
        <Textarea 
          id="otherActivities" 
          placeholder="Other activities" 
          className="min-h-[80px]" 
        />
      </div>
    </div>
  );
  
  const renderTemplateOptionsSection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="templateStyle">"testimonials.templateStyle"</Label>
        <Select>
          <SelectTrigger id="templateStyle">
            <SelectValue placeholder="testimonials.selectTemplate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">"testimonials.standardTemplate"</SelectItem>
            <SelectItem value="detailed">"testimonials.detailedTemplate"</SelectItem>
            <SelectItem value="modern">"testimonials.modernTemplate"</SelectItem>
            <SelectItem value="traditional">"testimonials.traditionalTemplate"</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>"testimonials.languageOptions"</Label>
        <Select>
          <SelectTrigger id="language">
            <SelectValue placeholder="testimonials.selectLanguage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">"testimonials.englishOnly"</SelectItem>
            <SelectItem value="bn">"testimonials.bengaliOnly"</SelectItem>
            <SelectItem value="bilingual">"testimonials.bilingual"</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium">"testimonials.signatureOptions"</h4>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="includePrincipalSignature" defaultChecked />
            <label
              htmlFor="includePrincipalSignature"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              "testimonials.includePrincipalSignature"
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="includeHeadmasterSignature" />
            <label
              htmlFor="includeHeadmasterSignature"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              "testimonials.includeHeadmasterSignature"
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="includeInstitutionSeal" defaultChecked />
            <label
              htmlFor="includeInstitutionSeal"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              "testimonials.includeInstitutionSeal"
            </label>
          </div>
        </div>
        
        <div className="pt-2">
          <Label htmlFor="signatureDate">"testimonials.signatureDate"</Label>
          <DatePicker />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium">"testimonials.contentOptions"</h4>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="includePhoto" defaultChecked />
            <label
              htmlFor="includePhoto"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              "testimonials.includePhoto"
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="includeActivities" defaultChecked />
            <label
              htmlFor="includeActivities"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              "testimonials.includeActivities"
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="includeGradeDetails" defaultChecked />
            <label
              htmlFor="includeGradeDetails"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              "testimonials.includeGradeDetails"
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="includeDistinctionAwards" />
            <label
              htmlFor="includeDistinctionAwards"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              "testimonials.includeDistinctionAwards"
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="includeFutureRecommendation" defaultChecked />
            <label
              htmlFor="includeFutureRecommendation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              "testimonials.includeFutureRecommendation"
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderTestimonialGenerateTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>"testimonials.studentDetails"</CardTitle>
          <CardDescription>"testimonials.studentDetailsDescription"</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="student-details">
            <AccordionItem value="student-details">
              <AccordionTrigger>"testimonials.studentDetails"</AccordionTrigger>
              <AccordionContent>
                {renderStudentDetailsSection()}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="academic-information">
              <AccordionTrigger>"testimonials.academicInformation"</AccordionTrigger>
              <AccordionContent>
                {renderAcademicInformationSection()}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="conduct-information">
              <AccordionTrigger>"testimonials.conductInformation"</AccordionTrigger>
              <AccordionContent>
                {renderConductAndCharacterSection()}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="activities">
              <AccordionTrigger>"testimonials.activities"</AccordionTrigger>
              <AccordionContent>
                {renderActivitiesSection()}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="template-options">
              <AccordionTrigger>"testimonials.templateOptions"</AccordionTrigger>
              <AccordionContent>
                {renderTemplateOptionsSection()}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setPreviewMode(true)} disabled={previewMode}>
            "testimonials.preview"
          </Button>
          <Button disabled={previewMode}>
            "testimonials.generateTestimonial"
          </Button>
        </CardFooter>
      </Card>
      
      {previewMode && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>"testimonials.previewTitle"</CardTitle>
              <CardDescription>"testimonials.previewDescription"</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)}>
              <span className="material-icons text-gray-500 text-sm mr-1">edit</span>
              "testimonials.editOptions"
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                "testimonials.comingSoon"
              </h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                "testimonials.previewComingSoon"
              </p>
              {renderFeatureList()}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline">
              <span className="material-icons text-gray-500 text-sm mr-1">print</span>
              "common.print"
            </Button>
            <Button variant="outline">
              <span className="material-icons text-gray-500 text-sm mr-1">file_download</span>
              "common.download"
            </Button>
            <Button>
              "testimonials.saveTestimonial"
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
  
  const renderManageTab = () => (
    <Card>
      <CardContent className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          "testimonials.comingSoon"
        </h3>
        <p className="text-gray-500 mb-4 max-w-md mx-auto">
          "testimonials.comingSoonMessage"
        </p>
        <Button>
          "testimonials.notifyMe"
        </Button>
      </CardContent>
    </Card>
  );
  
  const renderTemplatesTab = () => (
    <Card>
      <CardContent className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          "testimonials.comingSoon"
        </h3>
        <p className="text-gray-500 mb-4 max-w-md mx-auto">
          "testimonials.comingSoonMessage"
        </p>
        <Button>
          "testimonials.notifyMe"
        </Button>
      </CardContent>
    </Card>
  );
  
  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            "testimonials.title"
          </h1>
          <p className="text-gray-600 mt-1">
            "testimonials.subtitle"
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <span className="material-icons text-gray-500 text-sm">refresh</span>
            "common.reset"
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            disabled={false}
          >
            <span className="material-icons text-sm">description</span>
            "common.generate"
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-200 mb-6">
          <TabsList className="h-auto p-0 bg-transparent justify-start">
            <TabsTrigger
              value="generate"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
            >
              "common.generate"
            </TabsTrigger>
            <TabsTrigger
              value="batch"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
            >
              "common.batchProcess"
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
            >
              "common.templates"
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
            >
              "common.history"
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="generate" className="mt-0">
          {renderTestimonialGenerateTab()}
        </TabsContent>
        
        <TabsContent value="batch" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>"testimonials.batchProcessing"</CardTitle>
              <CardDescription>
                একাধিক প্রশংসাপত্র একসাথে তৈরি করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="batch-academic-year">"testimonials.academicYear"</Label>
                    <Select defaultValue="2025">
                      <SelectTrigger id="batch-academic-year">
                        <SelectValue placeholder="testimonials.selectAcademicYear" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batch-class">"testimonials.class"</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="batch-class">
                        <SelectValue placeholder="testimonials.selectClass" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সব শ্রেণী</SelectItem>
                        <SelectItem value="6">"classes.class6"</SelectItem>
                        <SelectItem value="7">"classes.class7"</SelectItem>
                        <SelectItem value="8">"classes.class8"</SelectItem>
                        <SelectItem value="9">"classes.class9"</SelectItem>
                        <SelectItem value="10">"classes.class10"</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="batch-section">"testimonials.section"</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="batch-section">
                        <SelectValue placeholder="testimonials.selectSection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সব শাখা</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batch-template">"testimonials.template"</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger id="batch-template">
                        <SelectValue placeholder="testimonials.selectTemplate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">"testimonials.standardTemplate"</SelectItem>
                        <SelectItem value="detailed">"testimonials.detailedTemplate"</SelectItem>
                        <SelectItem value="compact">"testimonials.compactTemplate"</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-grow">
                    <Label htmlFor="batch-roll-numbers">রোল নম্বর (কমা দিয়ে আলাদা করুন)</Label>
                    <Input id="batch-roll-numbers" placeholder="1, 2, 3, 4, 5" />
                  </div>
                  
                  <div>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        // Simulate student loading
                        setActiveTab("batch");
                      }}
                    >
                      <span className="material-icons text-gray-500 text-sm">download</span>
                      শিক্ষার্থী লোড করুন
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-medium">নির্বাচিত শিক্ষার্থীরা</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        5 জন শিক্ষার্থী নির্বাচিত
                      </span>
                      <Button variant="outline" size="sm" className="h-8">
                        নির্বাচন বাতিল করুন
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50">
                      <div className="col-span-1 font-medium">#</div>
                      <div className="col-span-4 font-medium">শিক্ষার্থীর নাম</div>
                      <div className="col-span-2 font-medium">রোল</div>
                      <div className="col-span-2 font-medium">শ্রেণী</div>
                      <div className="col-span-2 font-medium">শাখা</div>
                      <div className="col-span-1 font-medium text-right"></div>
                    </div>
                    
                    {[1, 2, 3, 4, 5].map((id) => (
                      <div key={id} className="grid grid-cols-12 gap-4 p-4 border-b">
                        <div className="col-span-1">{id}</div>
                        <div className="col-span-4">শিক্ষার্থী {id}</div>
                        <div className="col-span-2">{id}</div>
                        <div className="col-span-2">১০ম শ্রেণী</div>
                        <div className="col-span-2">A</div>
                        <div className="col-span-1 text-right">
                          <Button variant="ghost" size="sm" className="h-8 p-0 px-2">
                            <span className="material-icons text-red-500 text-sm">clear</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" className="flex items-center gap-2">
                    <span className="material-icons text-gray-500 text-sm">preview</span>
                    প্রিভিউ
                  </Button>
                  <Button className="flex items-center gap-2">
                    <span className="material-icons text-sm">print</span>
                    ব্যাচ জেনারেট করুন
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-0">
          {renderTemplatesTab()}
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          {renderManageTab()}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}