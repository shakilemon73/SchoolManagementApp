import { useState } from 'react';
import { LayoutSelector } from './layout-selector';
import { TemplateSelector } from './template-selector';
import { FeeTable } from './fee-table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface FeeItem {
  id: string;
  type: string;
  amount: number;
}

export function ReceiptGenerator() {
    const [studentId, setStudentId] = useState('STD-2023-1214');
  const [receiptNo, setReceiptNo] = useState('REC-2023-0521');
  const [studentName, setStudentName] = useState('Mohammad Rahman');
  const [studentClass, setStudentClass] = useState('Class 5');
  const [section, setSection] = useState('Section A');
  const [paymentDate, setPaymentDate] = useState('2023-05-15');
  const [month, setMonth] = useState('May 2023');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [layout, setLayout] = useState<'1' | '2' | '4' | '9'>('1');
  const [template, setTemplate] = useState('modernBlue');
  
  const [feeItems, setFeeItems] = useState<FeeItem[]>([
    { id: '1', type: 'Tuition Fee', amount: 2500 },
    { id: '2', type: 'Exam Fee', amount: 500 },
    { id: '3', type: 'Library Fee', amount: 300 }
  ]);

  const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);

  const addFeeItem = () => {
    const newId = String(feeItems.length + 1);
    setFeeItems([...feeItems, { id: newId, type: '', amount: 0 }]);
  };

  const removeFeeItem = (id: string) => {
    setFeeItems(feeItems.filter(item => item.id !== id));
  };

  const updateFeeItem = (id: string, field: 'type' | 'amount', value: string | number) => {
    setFeeItems(feeItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const generatePdf = async () => {
    const receiptElement = document.getElementById('receipt-preview');
    if (!receiptElement) return;

    const canvas = await html2canvas(receiptElement);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions based on layout
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
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
    } else if (layout === '9') {
      const imgWidth = pdfWidth / 3;
      const imgHeight = pdfHeight / 3;
      
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
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

    pdf.save(`receipt-${receiptNo}.pdf`);
  };

  return (
    <div>
      <LayoutSelector layout={layout} onLayoutChange={setLayout} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Student Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            "receipt.studentInformation"
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-id">"receipt.studentId"</Label>
                <Input 
                  id="student-id"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="receipt-no">"receipt.receiptNo"</Label>
                <Input 
                  id="receipt-no"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="student-name">"receipt.studentName"</Label>
              <Input 
                id="student-name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class">"receipt.class"</Label>
                <Select value={studentClass} onValueChange={setStudentClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="receipt.selectClass" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class 5">Class 5</SelectItem>
                    <SelectItem value="Class 6">Class 6</SelectItem>
                    <SelectItem value="Class 7">Class 7</SelectItem>
                    <SelectItem value="Class 8">Class 8</SelectItem>
                    <SelectItem value="Class 9">Class 9</SelectItem>
                    <SelectItem value="Class 10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="section">"receipt.section"</Label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="receipt.selectSection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Section A">Section A</SelectItem>
                    <SelectItem value="Section B">Section B</SelectItem>
                    <SelectItem value="Section C">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment-date">"receipt.paymentDate"</Label>
                <Input 
                  id="payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="month">"receipt.month"</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="receipt.selectMonth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="May 2023">May 2023</SelectItem>
                    <SelectItem value="June 2023">June 2023</SelectItem>
                    <SelectItem value="July 2023">July 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fee Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            "receipt.feeDetails"
          </h3>
          
          <FeeTable 
            feeItems={feeItems}
            onRemove={removeFeeItem}
            onUpdate={updateFeeItem}
            total={totalAmount}
          />
          
          <Button
            type="button"
            variant="link"
            className="text-primary hover:text-primary-dark mt-2 p-0 h-auto"
            onClick={addFeeItem}
          >
            <span className="material-icons text-sm mr-1">add_circle</span>
            "receipt.addFeeItem"
          </Button>
          
          <div className="mt-4">
            <Label htmlFor="payment-method">"receipt.paymentMethod"</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="receipt.selectPaymentMethod" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">"receipt.cash"</SelectItem>
                <SelectItem value="Bank Transfer">"receipt.bankTransfer"</SelectItem>
                <SelectItem value="Mobile Banking">"receipt.mobileBanking"</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <TemplateSelector 
        template={template} 
        onTemplateChange={setTemplate}
        studentData={{
          studentId,
          receiptNo,
          studentName,
          studentClass,
          section,
          paymentDate,
          month,
          paymentMethod,
          feeItems,
          totalAmount
        }}
      />
      
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline">
          "common.cancel"
        </Button>
        <Button variant="secondary" className="flex items-center gap-2">
          <span className="material-icons text-sm">visibility</span>
          "common.preview"
        </Button>
        <Button className="flex items-center gap-2" onClick={generatePdf}>
          <span className="material-icons text-sm">print</span>
          "receipt.generateAndPrint"
        </Button>
      </div>
    </div>
  );
}
