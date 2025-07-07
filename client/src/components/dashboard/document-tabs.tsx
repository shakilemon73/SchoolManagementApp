import { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';
import { Link } from 'wouter';

interface DocumentTab {
  id: string;
  label: string;
  icon: string;
  color: string;
  path: string;
  description?: string;
}

interface DocumentTabsProps {
  className?: string;
}

export function DocumentTabs({ className }: DocumentTabsProps) {
  const [activeTab, setActiveTab] = useState("student-docs");
  const isMobile = useMobile();
  
  // Document categories
  const documentTabs: DocumentTab[] = [
    {
      id: "student-docs",
      label: "শিক্ষার্থী ডকুমেন্টস",
      icon: "school",
      color: "bg-blue-100 text-blue-600",
      path: "/documents",
      description: "শিক্ষার্থীদের জন্য প্রয়োজনীয় সকল ডকুমেন্টস"
    },
    {
      id: "teacher-docs",
      label: "শিক্ষক ডকুমেন্টস",
      icon: "person",
      color: "bg-green-100 text-green-600",
      path: "/documents",
      description: "শিক্ষকদের জন্য প্রয়োজনীয় সকল ডকুমেন্টস"
    },
    {
      id: "admin-docs",
      label: "প্রশাসনিক ডকুমেন্টস",
      icon: "admin_panel_settings",
      color: "bg-purple-100 text-purple-600",
      path: "/documents",
      description: "প্রশাসনিক কাজের জন্য প্রয়োজনীয় সকল ডকুমেন্টস"
    },
    {
      id: "financial-docs",
      label: "আর্থিক ডকুমেন্টস",
      icon: "payments",
      color: "bg-amber-100 text-amber-600",
      path: "/documents",
      description: "আর্থিক বিষয়ক সকল ডকুমেন্টস"
    }
  ];
  
  // Document items by category
  const documentItems = {
    "student-docs": [
      { icon: "badge", title: "আইডি কার্ড", path: "/documents/id-cards", color: "bg-blue-100 text-blue-600" },
      { icon: "assignment", title: "এডমিট কার্ড", path: "/documents/admit-cards", color: "bg-blue-100 text-blue-600" },
      { icon: "menu_book", title: "ক্লাস রুটিন", path: "/documents/class-routines", color: "bg-blue-100 text-blue-600" },
      { icon: "grading", title: "মার্কশিট", path: "/documents/marksheets", color: "bg-blue-100 text-blue-600" },
      { icon: "summarize", title: "রেজাল্ট শিট", path: "/documents/result-sheets", color: "bg-blue-100 text-blue-600" },
      { icon: "contact_page", title: "টেস্টিমোনিয়াল", path: "/documents/testimonials", color: "bg-blue-100 text-blue-600" }
    ],
    "teacher-docs": [
      { icon: "badge", title: "শিক্ষক আইডি কার্ড", path: "/documents/teacher-id-cards", color: "bg-green-100 text-green-600" },
      { icon: "schedule", title: "শিক্ষক রুটিন", path: "/documents/teacher-routines", color: "bg-green-100 text-green-600" },
      { icon: "assignment_turned_in", title: "পে শিট", path: "/documents/pay-sheets", color: "bg-green-100 text-green-600" }
    ],
    "admin-docs": [
      { icon: "folder_open", title: "এডমিশন ফর্ম", path: "/documents/admission-forms", color: "bg-purple-100 text-purple-600" },
      { icon: "description", title: "অফিস অর্ডার", path: "/documents/office-orders", color: "bg-purple-100 text-purple-600" },
      { icon: "insert_drive_file", title: "নোটিশ", path: "/documents/notices", color: "bg-purple-100 text-purple-600" }
    ],
    "financial-docs": [
      { icon: "receipt", title: "ফি রসিদ", path: "/documents/fee-receipts", color: "bg-amber-100 text-amber-600" },
      { icon: "account_balance_wallet", title: "ব্যয় শিট", path: "/documents/expense-sheets", color: "bg-amber-100 text-amber-600" },
      { icon: "request_quote", title: "আয় রিপোর্ট", path: "/documents/income-reports", color: "bg-amber-100 text-amber-600" }
    ]
  };

  return (
    <div className={cn("mt-6", className)}>
      <Card className="border shadow-sm">
        <Tabs 
          defaultValue="student-docs" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className={cn(
            "w-full h-auto justify-start overflow-x-auto bg-muted/30 p-1 rounded-none",
            isMobile ? "flex" : "grid grid-cols-4"
          )}>
            {documentTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-2 py-3 px-4 data-[state=active]:bg-background",
                  isMobile ? "flex-shrink-0 min-w-[150px]" : ""
                )}
              >
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", tab.color)}>
                  <span className="material-icons text-sm">{tab.icon}</span>
                </div>
                <span className={isMobile ? "text-sm" : ""}>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {documentTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <CardContent className={cn(
                "p-4",
                isMobile ? "" : "pb-6"
              )}>
                {tab.description && (
                  <p className="text-sm text-muted-foreground mb-4">{tab.description}</p>
                )}
                
                <div className={cn(
                  "grid gap-3", 
                  isMobile ? "grid-cols-2" : "grid-cols-3 md:grid-cols-6"
                )}>
                  {documentItems[tab.id as keyof typeof documentItems]?.map((item, index) => (
                    <Link key={index} href={item.path}>
                      <div className={cn(
                        "bg-white rounded-lg p-4 shadow-sm border h-full flex flex-col items-center justify-center",
                        "cursor-pointer transition-all hover:shadow-md hover:-translate-y-1",
                      )}>
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center mb-3", 
                          item.color
                        )}>
                          <span className="material-icons text-xl">{item.icon}</span>
                        </div>
                        <p className="text-sm font-medium text-center">{item.title}</p>
                      </div>
                    </Link>
                  ))}
                  
                  <Button
                    variant="ghost" 
                    className="border border-dashed border-gray-300 rounded-lg p-4 h-full flex flex-col items-center justify-center hover:bg-muted/20"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                      <span className="material-icons text-muted-foreground text-xl">add</span>
                    </div>
                    <p className="text-sm font-medium text-center text-muted-foreground">আরো যোগ করুন</p>
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}