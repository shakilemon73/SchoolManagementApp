import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useDesignSystem } from '@/hooks/use-design-system';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Users,
  ClipboardList,
  Calendar,
  BarChart3,
  Award,
  FileText,
  MessageSquare,
  Settings,
  Bell,
  Target,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

// UX-Enhanced Components
const UXCard = ({ children, interactive = false, ...props }: any) => {
  const baseClasses = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200";
  const interactiveClasses = interactive ? "hover:scale-[1.02] cursor-pointer hover:border-slate-300 dark:hover:border-slate-600" : "";
  
  return (
    <Card className={cn(baseClasses, interactiveClasses)} {...props}>
      {children}
    </Card>
  );
};

const NavigationCard = ({ title, description, icon: Icon, href, color, badge }: any) => (
  <Link href={href}>
    <UXCard interactive>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            color === "blue" && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            color === "green" && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            color === "orange" && "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
            color === "purple" && "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
            color === "red" && "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </CardContent>
    </UXCard>
  </Link>
);

const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
  <UXCard>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">{subtitle}</p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          color === "blue" && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
          color === "green" && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
          color === "orange" && "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
          color === "purple" && "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </UXCard>
);

export default function TeacherPortalHome() {
  // Initialize UX design system
  useDesignSystem();

  // Fetch teacher overview data
  const { data: overview } = useQuery({
    queryKey: ['/api/teachers/overview'],
    staleTime: 60000,
  });

  const navigationItems = [
    {
      title: "ড্যাশবোর্ড",
      description: "আজকের কার্যক্রম ও পরিসংখ্যান দেখুন",
      icon: BarChart3,
      href: "/teacher/dashboard",
      color: "blue",
      badge: "নতুন"
    },
    {
      title: "উপস্থিতি ব্যবস্থাপনা",
      description: "ছাত্রছাত্রীদের উপস্থিতি নিন ও রেকর্ড রাখুন",
      icon: Users,
      href: "/teacher/attendance",
      color: "green"
    },
    {
      title: "পাঠ পরিকল্পনা",
      description: "কার্যকর শিক্ষাদানের জন্য পাঠ পরিকল্পনা তৈরি করুন",
      icon: BookOpen,
      href: "/teacher/lesson-plans",
      color: "purple"
    },
    {
      title: "অ্যাসাইনমেন্ট",
      description: "ছাত্রদের জন্য কাজ তৈরি ও মূল্যায়ন করুন",
      icon: ClipboardList,
      href: "/teacher/assignments",
      color: "orange"
    },
    {
      title: "ক্লাস রুটিন",
      description: "আপনার ক্লাসের সময়সূচী দেখুন",
      icon: Calendar,
      href: "/teacher/schedule",
      color: "blue"
    },
    {
      title: "মার্ক এন্ট্রি",
      description: "পরীক্ষার ফলাফল ও মূল্যায়ন এন্ট্রি করুন",
      icon: Award,
      href: "/teacher/marks",
      color: "red"
    },
    {
      title: "রিপোর্ট ও বিশ্লেষণ",
      description: "শিক্ষার্থীদের পারফরম্যান্স বিশ্লেষণ করুন",
      icon: TrendingUp,
      href: "/teacher/reports",
      color: "purple"
    },
    {
      title: "যোগাযোগ",
      description: "অভিভাবক ও প্রশাসনের সাথে যোগাযোগ করুন",
      icon: MessageSquare,
      href: "/teacher/communication",
      color: "green"
    },
    {
      title: "রিসোর্স সেন্টার",
      description: "শিক্ষাগত উপকরণ ও টেমপ্লেট পান",
      icon: FileText,
      href: "/teacher/resources",
      color: "orange"
    }
  ];

  const quickStats = [
    {
      title: "আজকের ক্লাস",
      value: "৬টি",
      subtitle: "৪টি সম্পন্ন, ২টি বাকি",
      icon: Calendar,
      color: "blue"
    },
    {
      title: "মোট ছাত্রছাত্রী",
      value: "১২৮ জন",
      subtitle: "৪টি শ্রেণীতে",
      icon: Users,
      color: "green"
    },
    {
      title: "চলমান অ্যাসাইনমেন্ট",
      value: "৮টি",
      subtitle: "৩টি নতুন জমা",
      icon: ClipboardList,
      color: "orange"
    },
    {
      title: "গড় উপস্থিতি",
      value: "৯২%",
      subtitle: "এই সপ্তাহে",
      icon: CheckCircle,
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            শিক্ষক পোর্টাল
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            আপনার শিক্ষাদান কার্যক্রম পরিচালনার জন্য সম্পূর্ণ সমাধান
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Access Message */}
        <UXCard>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    আজকের কার্যক্রম
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    আপনার আজকের গুরুত্বপূর্ণ কাজগুলো দেখুন
                  </p>
                </div>
              </div>
              <Link href="/teacher/dashboard">
                <Button variant="outline" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  ড্যাশবোর্ড দেখুন
                </Button>
              </Link>
            </div>
          </CardContent>
        </UXCard>

        {/* Navigation Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            সুবিধাসমূহ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationItems.map((item, index) => (
              <NavigationCard key={index} {...item} />
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UXCard>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                সাম্প্রতিক কার্যক্রম
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      ষষ্ঠ 'ক' শ্রেণীর উপস্থিতি নেওয়া হয়েছে
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">৩০ মিনিট আগে</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      নতুন পাঠ পরিকল্পনা তৈরি করা হয়েছে
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">১ ঘন্টা আগে</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      অ্যাসাইনমেন্ট জমা পড়েছে
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">২ ঘন্টা আগে</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </UXCard>

          <UXCard>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                আসন্ন কাজ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      মাসিক পরীক্ষার প্রশ্ন প্রস্তুতি
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      সপ্তম শ্রেণী - বাংলা
                    </p>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    ২ দিন
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      অভিভাবক সভা প্রস্তুতি
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      প্রগতি রিপোর্ট তৈরি
                    </p>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    ৫ দিন
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      শিক্ষক প্রশিক্ষণ
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      ডিজিটাল শিক্ষাদান পদ্ধতি
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ১ সপ্তাহ
                  </Badge>
                </div>
              </div>
            </CardContent>
          </UXCard>
        </div>

        {/* Help Section */}
        <UXCard>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              সাহায্য প্রয়োজন?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              আমাদের গাইড ও টিউটোরিয়াল দেখুন অথবা সাপোর্ট টিমের সাথে যোগাযোগ করুন
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                ইউজার গাইড
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                সাপোর্ট চ্যাট
              </Button>
            </div>
          </CardContent>
        </UXCard>
      </div>
    </div>
  );
}