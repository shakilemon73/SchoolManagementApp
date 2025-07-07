import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentPageTemplate } from './DocumentPageTemplate';

const salarySlipSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeNameBn: z.string().min(1, 'বাংলা নাম আবশ্যক'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  designation: z.string().min(1, 'Designation is required'),
  department: z.string().min(1, 'Department is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  salaryMonth: z.string().min(1, 'Salary month is required'),
  basicSalary: z.number().min(0, 'Basic salary is required'),
  houseRent: z.number().min(0, 'House rent allowance is required'),
  medicalAllowance: z.number().min(0, 'Medical allowance is required'),
  transportAllowance: z.number().min(0, 'Transport allowance is required'),
  otherAllowances: z.number().min(0, 'Other allowances amount'),
  providentFund: z.number().min(0, 'Provident fund deduction'),
  incomeTax: z.number().min(0, 'Income tax deduction'),
  otherDeductions: z.number().min(0, 'Other deductions amount'),
  instituteName: z.string().min(1, 'Institute name is required'),
  instituteAddress: z.string().min(1, 'Institute address is required'),
});

type SalarySlipFormData = z.infer<typeof salarySlipSchema>;

interface SalarySlipPreviewProps {
  data: SalarySlipFormData;
}

function SalarySlipPreview({ data }: SalarySlipPreviewProps) {
  const totalEarnings = data.basicSalary + data.houseRent + data.medicalAllowance + data.transportAllowance + data.otherAllowances;
  const totalDeductions = data.providentFund + data.incomeTax + data.otherDeductions;
  const netSalary = totalEarnings - totalDeductions;

  return (
    <div className="bg-white p-8 border-2 border-gray-300 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{data.instituteName}</h1>
        <p className="text-sm text-gray-600 mb-4">{data.instituteAddress}</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Salary Slip / বেতনপত্র</h2>
        <p className="text-lg font-semibold text-gray-700">For the month of {data.salaryMonth}</p>
      </div>

      {/* Employee Information */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Information / কর্মচারীর তথ্য</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Employee Name:</Label>
            <p className="text-base font-medium">{data.employeeName}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">কর্মচারীর নাম:</Label>
            <p className="text-base font-medium">{data.employeeNameBn}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Employee ID:</Label>
            <p className="text-base font-bold text-blue-600">{data.employeeId}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Designation:</Label>
            <p className="text-base font-medium">{data.designation}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Department:</Label>
            <p className="text-base font-medium">{data.department}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Joining Date:</Label>
            <p className="text-base font-medium">{data.joiningDate}</p>
          </div>
        </div>
      </div>

      {/* Salary Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Earnings */}
        <div>
          <h4 className="text-lg font-semibold text-green-800 mb-3 border-b border-green-200 pb-2">
            Earnings / আয়
          </h4>
          <table className="w-full">
            <tbody className="space-y-2">
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Basic Salary</td>
                <td className="py-2 text-right font-semibold">৳ {data.basicSalary.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">House Rent Allowance</td>
                <td className="py-2 text-right font-semibold">৳ {data.houseRent.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Medical Allowance</td>
                <td className="py-2 text-right font-semibold">৳ {data.medicalAllowance.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Transport Allowance</td>
                <td className="py-2 text-right font-semibold">৳ {data.transportAllowance.toLocaleString()}</td>
              </tr>
              {data.otherAllowances > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 text-gray-700">Other Allowances</td>
                  <td className="py-2 text-right font-semibold">৳ {data.otherAllowances.toLocaleString()}</td>
                </tr>
              )}
              <tr className="border-t-2 border-green-600 bg-green-50">
                <td className="py-3 font-bold text-green-800">Total Earnings</td>
                <td className="py-3 text-right font-bold text-green-800">৳ {totalEarnings.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions */}
        <div>
          <h4 className="text-lg font-semibold text-red-800 mb-3 border-b border-red-200 pb-2">
            Deductions / কর্তন
          </h4>
          <table className="w-full">
            <tbody className="space-y-2">
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Provident Fund</td>
                <td className="py-2 text-right font-semibold">৳ {data.providentFund.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Income Tax</td>
                <td className="py-2 text-right font-semibold">৳ {data.incomeTax.toLocaleString()}</td>
              </tr>
              {data.otherDeductions > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 text-gray-700">Other Deductions</td>
                  <td className="py-2 text-right font-semibold">৳ {data.otherDeductions.toLocaleString()}</td>
                </tr>
              )}
              <tr className="border-t-2 border-red-600 bg-red-50">
                <td className="py-3 font-bold text-red-800">Total Deductions</td>
                <td className="py-3 text-right font-bold text-red-800">৳ {totalDeductions.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Net Salary */}
      <div className="mb-6 bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-blue-800">Net Salary / নিট বেতন</h3>
            <p className="text-sm text-blue-600">Total Earnings - Total Deductions</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-800">৳ {netSalary.toLocaleString()}</p>
            <p className="text-sm text-blue-600">{data.salaryMonth}</p>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <h4 className="font-semibold text-yellow-800 mb-2">Payment Information / পেমেন্ট তথ্য:</h4>
        <p className="text-sm text-yellow-700">
          This salary slip is computer-generated and does not require a signature. 
          Payment will be processed as per company policy.
        </p>
        <p className="text-sm text-yellow-700 mt-1">
          এই বেতনপত্রটি কম্পিউটার-উৎপন্ন এবং স্বাক্ষরের প্রয়োজন নেই। 
          কোম্পানির নীতি অনুযায়ী পেমেন্ট প্রক্রিয়া করা হবে।
        </p>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between items-center pt-8 border-t-2 border-gray-300">
        <div className="text-center">
          <div className="w-40 h-16 border-b border-gray-400 mb-2"></div>
          <p className="text-sm text-gray-600">Employee Signature</p>
          <p className="text-xs text-gray-500">কর্মচারীর স্বাক্ষর</p>
        </div>
        <div className="text-center">
          <div className="w-40 h-16 border-b border-gray-400 mb-2"></div>
          <p className="text-sm text-gray-600">HR Manager</p>
          <p className="text-xs text-gray-500">এইচআর ম্যানেজার</p>
        </div>
        <div className="text-center">
          <div className="w-40 h-16 border-b border-gray-400 mb-2"></div>
          <p className="text-sm text-gray-600">Principal/Director</p>
          <p className="text-xs text-gray-500">প্রধান/পরিচালক</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs text-gray-500">
        <p>Generated on: {new Date().toLocaleDateString()} | This is a computer-generated document</p>
        <p>তৈরির তারিখ: {new Date().toLocaleDateString()} | এটি একটি কম্পিউটার-উৎপন্ন নথি</p>
      </div>
    </div>
  );
}

export function SalarySlipGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<SalarySlipFormData | null>(null);

  const form = useForm<SalarySlipFormData>({
    resolver: zodResolver(salarySlipSchema),
    defaultValues: {
      employeeName: '',
      employeeNameBn: '',
      employeeId: '',
      designation: '',
      department: '',
      joiningDate: '',
      salaryMonth: '',
      basicSalary: 0,
      houseRent: 0,
      medicalAllowance: 0,
      transportAllowance: 0,
      otherAllowances: 0,
      providentFund: 0,
      incomeTax: 0,
      otherDeductions: 0,
      instituteName: '',
      instituteAddress: '',
    },
  });

  const onSubmit = (data: SalarySlipFormData) => {
    setFormData(data);
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      setPreviewMode(true);
    }
  };

  const stepOneForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employeeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="employeeNameBn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>কর্মচারীর নাম (বাংলা)</FormLabel>
                <FormControl>
                  <Input placeholder="বাংলায় নাম লিখুন" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Principal">Principal</SelectItem>
                    <SelectItem value="Vice Principal">Vice Principal</SelectItem>
                    <SelectItem value="Head Teacher">Head Teacher</SelectItem>
                    <SelectItem value="Assistant Head Teacher">Assistant Head Teacher</SelectItem>
                    <SelectItem value="Senior Teacher">Senior Teacher</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Assistant Teacher">Assistant Teacher</SelectItem>
                    <SelectItem value="Librarian">Librarian</SelectItem>
                    <SelectItem value="Lab Assistant">Lab Assistant</SelectItem>
                    <SelectItem value="Office Assistant">Office Assistant</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                    <SelectItem value="Security Guard">Security Guard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Science, Arts, Administration" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="joiningDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Joining Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salaryMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Month</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., January 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instituteName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institute Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter institute name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instituteAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institute Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter institute address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full">
          Next: Add Salary Details →
        </Button>
      </form>
    </Form>
  );

  const stepTwoForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-800">Earnings / আয়</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="basicSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Basic Salary (৳)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="houseRent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Rent Allowance (৳)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medicalAllowance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical Allowance (৳)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transportAllowance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transport Allowance (৳)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otherAllowances"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Allowances (৳)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-800">Deductions / কর্তন</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="providentFund"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provident Fund (৳)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incomeTax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Tax (৳)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otherDeductions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Deductions (৳)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
            ← Back
          </Button>
          <Button type="submit" className="flex-1">
            Generate Salary Slip →
          </Button>
        </div>
      </form>
    </Form>
  );

  const previewComponent = formData ? <SalarySlipPreview data={formData} /> : null;

  return (
    <DocumentPageTemplate
      documentType="Salary Slip"
      documentTypeBn="বেতনপত্র"
      documentTypeAr="قسيمة راتب"
      stepOneForm={stepOneForm}
      stepTwoForm={stepTwoForm}
      previewComponent={previewComponent}
    >
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-gray-600">
            <li>• Enter all employee details accurately</li>
            <li>• Add all salary components and deductions</li>
            <li>• Net salary is calculated automatically</li>
            <li>• Review all amounts before generating</li>
          </ul>
        </CardContent>
      </Card>
    </DocumentPageTemplate>
  );
}