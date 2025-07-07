import { formatCurrency } from '@/lib/utils';

interface FeeItem {
  id: string;
  type: string;
  amount: number;
}

interface StudentData {
  studentId: string;
  receiptNo: string;
  studentName: string;
  studentClass: string;
  section: string;
  paymentDate: string;
  month: string;
  paymentMethod: string;
  feeItems: FeeItem[];
  totalAmount: number;
}

interface TemplateSelectorProps {
  template: string;
  onTemplateChange: (template: string) => void;
  studentData: StudentData;
}

export function TemplateSelector({ 
  template, 
  onTemplateChange,
  studentData
}: TemplateSelectorProps) {
    
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        "template.selection"
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Template 1: Modern Blue */}
        <div className="relative">
          <input 
            type="radio" 
            id="template1" 
            name="template" 
            className="sr-only"
            checked={template === 'modernBlue'}
            onChange={() => onTemplateChange('modernBlue')} 
          />
          <label 
            htmlFor="template1" 
            className={`block border-2 rounded-md cursor-pointer overflow-hidden ${
              template === 'modernBlue' ? 'border-primary' : 'border-gray-200'
            }`}
          >
            <div className="template-preview aspect-[210/297] bg-white p-2">
              <div className="h-full border border-gray-300 overflow-hidden rounded-sm p-2" id="receipt-preview">
                <div className="bg-primary text-white text-center py-2 rounded-sm mb-2">
                  <h3 className="text-xs font-bold">UNITY SCHOOL</h3>
                  <p className="text-[8px]">123 Education St, Dhaka, Bangladesh</p>
                </div>
                <div className="flex justify-between items-start mb-2 text-[8px]">
                  <div>
                    <p><strong>"receipt.receiptNo":</strong> {studentData.receiptNo}</p>
                    <p><strong>"receipt.date":</strong> {formatDate(studentData.paymentDate)}</p>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=30&h=30" 
                    alt="School Logo" 
                    className="w-6 h-6"
                  />
                </div>
                <div className="mb-2 border-b border-gray-300 pb-1 text-[8px]">
                  <p><strong>"receipt.studentName":</strong> {studentData.studentName}</p>
                  <p><strong>"receipt.studentId":</strong> {studentData.studentId}</p>
                  <p><strong>"receipt.class":</strong> {studentData.studentClass}, {studentData.section}</p>
                </div>
                <div className="mb-2">
                  <h4 className="text-[9px] font-bold mb-1">"receipt.feeDetails"</h4>
                  <table className="w-full text-[7px] mb-1">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-0.5">"receipt.feeType"</th>
                        <th className="text-right py-0.5">"receipt.amount"</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.feeItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-0.5">{item.type}</td>
                          <td className="text-right py-0.5">{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-300 font-bold">
                        <td className="py-0.5">"receipt.total"</td>
                        <td className="text-right py-0.5">{studentData.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-2 bg-primary/5">
              <span className="block text-sm font-medium text-primary">
                "template.modernBlue"
              </span>
            </div>
          </label>
        </div>
        
        {/* Template 2: Classic Green */}
        <div className="relative">
          <input 
            type="radio" 
            id="template2" 
            name="template" 
            className="sr-only"
            checked={template === 'classicGreen'}
            onChange={() => onTemplateChange('classicGreen')} 
          />
          <label 
            htmlFor="template2" 
            className={`block border-2 rounded-md cursor-pointer overflow-hidden ${
              template === 'classicGreen' 
                ? 'border-primary' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="template-preview aspect-[210/297] bg-white p-2">
              <div className="h-full border border-gray-300 overflow-hidden rounded-sm p-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-success">UNITY SCHOOL</h3>
                    <p className="text-[8px]">123 Education St, Dhaka</p>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=30&h=30" 
                    alt="School Logo" 
                    className="w-6 h-6"
                  />
                </div>
                <div className="border-t border-b border-gray-300 py-1 mb-2">
                  <h4 className="text-center text-[9px] font-bold">"receipt.paymentReceipt"</h4>
                </div>
                <div className="mb-2 text-[8px]">
                  <div className="grid grid-cols-2 gap-1">
                    <p><strong>"receipt.receiptNo":</strong> {studentData.receiptNo}</p>
                    <p><strong>"receipt.date":</strong> {formatDate(studentData.paymentDate)}</p>
                    <p><strong>"receipt.studentName":</strong> {studentData.studentName}</p>
                    <p><strong>"receipt.studentId":</strong> {studentData.studentId}</p>
                    <p><strong>"receipt.class":</strong> {studentData.studentClass}</p>
                    <p><strong>"receipt.section":</strong> {studentData.section}</p>
                  </div>
                </div>
                <div className="mb-2">
                  <table className="w-full text-[7px] mb-1">
                    <thead>
                      <tr className="bg-success/10 border-t border-b border-success/30">
                        <th className="text-left py-0.5 px-1">"receipt.feeType"</th>
                        <th className="text-right py-0.5 px-1">"receipt.amount"</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.feeItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-0.5 px-1">{item.type}</td>
                          <td className="text-right py-0.5 px-1">{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-success/10 border-t border-success/30 font-bold">
                        <td className="py-0.5 px-1">"receipt.total"</td>
                        <td className="text-right py-0.5 px-1">{studentData.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-2">
              <span className="block text-sm font-medium text-gray-700">
                "template.classicGreen"
              </span>
            </div>
          </label>
        </div>
        
        {/* Template 3: Traditional */}
        <div className="relative">
          <input 
            type="radio" 
            id="template3" 
            name="template" 
            className="sr-only"
            checked={template === 'traditional'}
            onChange={() => onTemplateChange('traditional')} 
          />
          <label 
            htmlFor="template3" 
            className={`block border-2 rounded-md cursor-pointer overflow-hidden ${
              template === 'traditional' 
                ? 'border-primary' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="template-preview aspect-[210/297] bg-white p-2">
              <div className="h-full border border-gray-300 overflow-hidden rounded-sm p-2">
                <div className="text-center mb-2">
                  <img 
                    src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=30&h=30" 
                    alt="School Logo" 
                    className="w-8 h-8 mx-auto mb-1"
                  />
                  <h3 className="text-xs font-bold">UNITY SCHOOL</h3>
                  <p className="text-[8px]">123 Education St, Dhaka, Bangladesh</p>
                  <div className="flex justify-center items-center mt-1">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <p className="text-[9px] font-bold px-2">"receipt.receipt"</p>
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>
                </div>
                <div className="mb-2 text-[8px]">
                  <div className="grid grid-cols-2 gap-1">
                    <p><strong>"receipt.receiptNo":</strong> {studentData.receiptNo}</p>
                    <p><strong>"receipt.date":</strong> {formatDate(studentData.paymentDate)}</p>
                  </div>
                </div>
                <div className="mb-2 text-[8px] border-t border-b border-gray-300 py-1">
                  <p><strong>"receipt.studentName":</strong> {studentData.studentName}</p>
                  <p><strong>"receipt.studentId":</strong> {studentData.studentId}</p>
                  <p><strong>"receipt.class":</strong> {studentData.studentClass}, {studentData.section}</p>
                </div>
                <div className="mb-2">
                  <table className="w-full text-[7px] mb-1 border">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-0.5 px-1 border-r">"receipt.feeType"</th>
                        <th className="text-right py-0.5 px-1">"receipt.amount"</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.feeItems.map((item, index) => (
                        <tr key={item.id} className={index < studentData.feeItems.length - 1 ? 'border-b' : ''}>
                          <td className="py-0.5 px-1 border-r">{item.type}</td>
                          <td className="text-right py-0.5 px-1">{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-bold">
                        <td className="py-0.5 px-1 border-r">"receipt.total"</td>
                        <td className="text-right py-0.5 px-1">{studentData.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-2">
              <span className="block text-sm font-medium text-gray-700">
                "template.traditional"
              </span>
            </div>
          </label>
        </div>
        
        {/* Add Custom Template */}
        <div className="relative">
          <div className="border-2 border-dashed border-gray-300 rounded-md overflow-hidden h-full flex flex-col">
            <div className="aspect-[210/297] bg-gray-50 flex items-center justify-center p-4 flex-1">
              <div className="text-center">
                <span className="material-icons text-gray-400 text-3xl mb-2">add_circle_outline</span>
                <span className="block text-sm text-gray-500">
                  "template.uploadCustom"
                </span>
              </div>
            </div>
            <div className="p-2 bg-gray-50 border-t border-gray-300">
              <span className="block text-sm font-medium text-gray-700">
                "template.custom"
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
