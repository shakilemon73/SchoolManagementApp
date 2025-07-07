import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PaymentMethod = "bkash" | "nagad" | "rocket" | "upay" | "bank-transfer" | "cash" | "other";

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  className?: string;
}

export function PaymentMethodSelector({ value, onChange, className }: PaymentMethodSelectorProps) {
  const methods = [
    {
      id: "bkash",
      name: "বিকাশ",
      icon: "bkash",
      color: "bg-pink-600"
    },
    {
      id: "nagad",
      name: "নগদ",
      icon: "nagad",
      color: "bg-orange-600"
    },
    {
      id: "rocket",
      name: "রকেট",
      icon: "rocket",
      color: "bg-purple-600"
    },
    {
      id: "upay",
      name: "উপায়",
      icon: "upay",
      color: "bg-teal-600"
    },
    {
      id: "bank-transfer",
      name: "ব্যাংক ট্রান্সফার",
      icon: "account_balance",
      color: "bg-blue-600"
    },
    {
      id: "cash",
      name: "ক্যাশ",
      icon: "payments",
      color: "bg-green-600"
    }
  ];

  return (
    <RadioGroup 
      value={value} 
      onValueChange={(val) => onChange(val as PaymentMethod)}
      className={cn("space-y-4", className)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => (
          <div key={method.id} className="flex items-center">
            <RadioGroupItem 
              value={method.id} 
              id={method.id}
              className="sr-only"
            />
            <Label
              htmlFor={method.id}
              className={cn(
                "flex items-center space-x-3 w-full p-3 border-2 rounded-lg cursor-pointer transition-all",
                value === method.id ? "border-primary" : "border-border hover:border-gray-400"
              )}
            >
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", method.color)}>
                {method.id === "bkash" || method.id === "nagad" || method.id === "rocket" || method.id === "upay" ? (
                  <span className="text-xl font-bold">
                    {method.id.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span className="material-icons">{method.icon}</span>
                )}
              </div>
              <span className="font-medium">{method.name}</span>
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}