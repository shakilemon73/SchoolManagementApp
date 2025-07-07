import React, { useState } from 'react';
import IdCardPreview, { StudentData, TemplateOptions } from './id-card-preview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './id-card-styles.css';

interface IdCardGeneratorProps {
  studentData: StudentData;
  templateOptions: TemplateOptions;
  schoolLogo?: string;
  onBack?: () => void;
}

const IdCardGenerator: React.FC<IdCardGeneratorProps> = ({
  studentData,
  templateOptions,
  schoolLogo,
  onBack
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate PDF function
  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const idCardElement = document.getElementById('id-card-preview');
      if (!idCardElement) {
        toast({
          title: "Error",
          description: "ID card preview element not found",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      const canvas = await html2canvas(idCardElement, {
        scale: 3, // Higher resolution
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Determine PDF dimensions based on ID card size
      const size = templateOptions.size;
      let pdfWidth, pdfHeight, orientation;
      
      if (size === 'credit') {
        pdfWidth = 85.6; // Width in mm
        pdfHeight = 53.98; // Height in mm
        orientation = 'landscape';
      } else if (size === 'portrait') {
        pdfWidth = 85; // Width in mm
        pdfHeight = 110; // Height in mm
        orientation = 'portrait';
      } else if (size === 'landscape') {
        pdfWidth = 110; // Width in mm
        pdfHeight = 85; // Height in mm
        orientation = 'landscape';
      } else {
        // Custom size defaults to A4
        pdfWidth = 210; // Width in mm (A4)
        pdfHeight = 297; // Height in mm (A4)
        orientation = 'portrait';
      }
      
      const pdf = new jsPDF({
        orientation: orientation as any,
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      // Calculate dimensions based on layout
      const layout = templateOptions.layout;
      
      if (layout === '1') {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else if (layout === '2') {
        const imgWidth = pdfWidth / 2;
        const imgHeight = pdfHeight;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.addImage(imgData, 'PNG', imgWidth, 0, imgWidth, imgHeight);
      } else if (layout === '4') {
        const imgWidth = pdfWidth / 2;
        const imgHeight = pdfHeight / 2;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.addImage(imgData, 'PNG', imgWidth, 0, imgWidth, imgHeight);
        pdf.addImage(imgData, 'PNG', 0, imgHeight, imgWidth, imgHeight);
        pdf.addImage(imgData, 'PNG', imgWidth, imgHeight, imgWidth, imgHeight);
      } else if (layout === '8') {
        const imgWidth = pdfWidth / 2;
        const imgHeight = pdfHeight / 4;
        
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 2; col++) {
            pdf.addImage(
              imgData, 
              'PNG', 
              col * imgWidth, 
              row * imgHeight, 
              imgWidth, 
              imgHeight
            );
          }
        }
      }

      // Save the PDF with student ID as filename
      pdf.save(`id-card-${studentData.id}.pdf`);
      
      toast({
        title: "PDF সফলভাবে তৈরি হয়েছে",
        description: "আপনার আইডি কার্ড PDF হিসাবে সংরক্ষণ করা হয়েছে",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
        <IdCardPreview 
          student={studentData}
          template={templateOptions}
          schoolLogo={schoolLogo}
        />
      </div>
      
      <div className="flex gap-4 justify-center">
        {onBack && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onBack}
          >
            <span className="material-icons">arrow_back</span>
            <span>পেছনে যান</span>
          </Button>
        )}
        
        <Button 
          className="flex items-center gap-2"
          onClick={generatePDF}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="material-icons animate-spin">refresh</span>
              <span>অপেক্ষা করুন...</span>
            </>
          ) : (
            <>
              <span className="material-icons">picture_as_pdf</span>
              <span>PDF হিসাবে ডাউনলোড করুন</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default IdCardGenerator;