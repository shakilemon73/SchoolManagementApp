import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreditPackage } from "@shared/schema";

export interface CreditPackageCardProps {
  creditPackage: CreditPackage;
  selected?: boolean;
  onClick?: () => void;
}

export function CreditPackageCard({ creditPackage, selected = false, onClick }: CreditPackageCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer border-2 transition-all",
        selected ? "border-primary" : "border-border hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          {/* Package header */}
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium">{creditPackage.name}</h3>
            {selected && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                নির্বাচিত
              </span>
            )}
          </div>
          
          {/* Credits */}
          <div className="text-2xl font-bold text-primary my-2 flex items-baseline">
            {creditPackage.credits}
            <span className="text-sm ml-1 text-muted-foreground">ক্রেডিট</span>
          </div>
          
          {/* Price */}
          <div className="mt-auto">
            <div className="text-xl font-semibold mb-1">{creditPackage.price} ৳</div>
            {creditPackage.description && (
              <p className="text-xs text-muted-foreground">{creditPackage.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}