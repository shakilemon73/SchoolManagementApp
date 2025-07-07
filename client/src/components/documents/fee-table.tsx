import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FeeItem {
  id: string;
  type: string;
  amount: number;
}

interface FeeTableProps {
  feeItems: FeeItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'type' | 'amount', value: string | number) => void;
  total: number;
}

export function FeeTable({ feeItems, onRemove, onUpdate, total }: FeeTableProps) {
  
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              "receipt.feeType"
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              "receipt.amount"
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {feeItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <Input 
                  type="text"
                  className="border-0 p-0 h-auto focus:ring-0"
                  value={item.type}
                  onChange={(e) => onUpdate(item.id, 'type', e.target.value)}
                />
              </TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                <Input 
                  type="number"
                  className="border-0 p-0 h-auto focus:ring-0 text-right"
                  value={item.amount}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "0" : e.target.value;
                    onUpdate(item.id, 'amount', parseFloat(value));
                  }}
                />
              </TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-500 h-auto p-1"
                  onClick={() => onRemove(item.id)}
                >
                  <span className="material-icons text-sm">delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-gray-50">
          <TableRow>
            <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
              "receipt.total"
            </TableCell>
            <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
              {total.toLocaleString()}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
