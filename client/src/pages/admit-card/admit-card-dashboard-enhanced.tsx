import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Users, 
  Download, 
  Upload,
  Settings,
  GraduationCap,
  Award,
  BookOpen,
  FileSpreadsheet,
  Eye,
  Plus,
  Zap,
  Flag
} from 'lucide-react';

interface DashboardStats {
  totalCards: number;
  thisMonth: number;
  templates: number;
  students: number;
  recentImports: number;
}

export default function AdmitCardDashboardEnhanced() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admit-cards/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admit-cards/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  // Fetch recent activity
  const { data: recentCards } = useQuery({
    queryKey: ['/api/admit-cards/recent'],
    queryFn: async () => {
      const response = await fetch('/api/admit-cards/recent');
      if (!response.ok) throw new Error('Failed to fetch recent cards');
      return response.json();
    }
  });

  const quickActions = [
    {
      title: 'একক এডমিট কার্ড',
      description: 'একজন শিক্ষার্থীর জন্য এডমিট কার্ড তৈরি করুন',
      icon: FileText,
      href: '/admit-card/create-single',
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'ব্যাচ তৈরি',
      description: 'একসাথে অনেক এডমিট কার্ড তৈরি করুন',
      icon: Users,
      href: '/admit-card/batch-creation',
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'শিক্ষার্থী ইমপোর্ট',
      description: 'Excel/CSV ফাইল থেকে শিক্ষার্থী তথ্য আপলোড',
      icon: Upload,
      href: '/admit-card/student-import',
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'বাংলাদেশ টেমপ্লেট',
      description: 'সরকারি বোর্ডের অনুমোদিত টেমপ্লেট',
      icon: Flag,
      href: '/admit-card/bangladesh-templates',
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'টেমপ্লেট ম্যানেজার',
      description: 'কাস্টম টেমপ্লেট তৈরি ও সম্পাদনা',
      icon: Settings,
      href: '/admit-card/templates',
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'সেটিংস',
      description: 'এডমিট কার্ড সিস্টেম কনফিগারেশন',
      icon: Settings,
      href: '/admit-card/settings',
      color: 'bg-gray-500',
      textColor: 'text-gray-600'
    }
  ];

  const examBoards = [
    { name: 'JSC', namebn: 'জেএসসি', color: 'bg-blue-100 text-blue-800' },
    { name: 'SSC', namebn: 'এসএসসি', color: 'bg-green-100 text-green-800' },
    { name: 'HSC', namebn: 'এইচএসসি', color: 'bg-purple-100 text-purple-800' },
    { name: 'Dakhil', namebn: 'দাখিল', color: 'bg-orange-100 text-orange-800' },
    { name: 'Alim', namebn: 'আলিম', color: 'bg-red-100 text-red-800' },
    { name: 'Technical', namebn: 'কারিগরি', color: 'bg-indigo-100 text-indigo-800' }
  ];

  return (
    <AppShell>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">এডমিট কার্ড ম্যানেজমেন্ট</h1>
            <p className="text-muted-foreground">
              বাংলাদেশ শিক্ষা বোর্ডের অনুমোদিত এডমিট কার্ড সিস্টেম
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admit-card/student-import">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                শিক্ষার্থী ইমপোর্ট
              </Button>
            </Link>
            <Link href="/admit-card/create-single">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                নতুন কার্ড
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট এডমিট কার্ড</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.totalGenerated || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                সর্বমোট তৈরি কার্ড
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">এই মাসে</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.thisMonth || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                চলতি মাসে তৈরি
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">টেমপ্লেট</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.templates || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                উপলব্ধ টেমপ্লেট
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">শিক্ষার্থী</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.students || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                নিবন্ধিত শিক্ষার্থী
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>দ্রুত কাজ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium ${action.textColor}`}>
                            {action.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bangladesh Education Board Templates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                বাংলাদেশ শিক্ষা বোর্ড টেমপ্লেট
              </CardTitle>
              <Link href="/admit-card/templates">
                <Button variant="outline" size="sm">
                  সব টেমপ্লেট দেখুন
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* JSC Template */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-blue-500">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-600">জেএসসি - ঢাকা শিক্ষা বোর্ড</h3>
                      <p className="text-sm text-muted-foreground">
                        JSC পরীক্ষার জন্য অফিসিয়াল টেমপ্লেট
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">QR কোড</Badge>
                        <Badge variant="secondary" className="text-xs">ওয়াটারমার্ক</Badge>
                        <Badge variant="secondary" className="text-xs">২,৪৫০ বার ব্যবহৃত</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SSC Template */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-green-500">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-green-600">এসএসসি - সকল শিক্ষা বোর্ড</h3>
                      <p className="text-sm text-muted-foreground">
                        SSC পরীক্ষার সার্বজনীন টেমপ্লেট
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">বহু-বোর্ড</Badge>
                        <Badge variant="secondary" className="text-xs">গ্রুপ নির্বাচন</Badge>
                        <Badge variant="secondary" className="text-xs">৩,৮৫০ বার ব্যবহৃত</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HSC Template */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-purple-500">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-purple-600">এইচএসসি - বিজ্ঞান বিভাগ</h3>
                      <p className="text-sm text-muted-foreground">
                        HSC বিজ্ঞান গ্রুপের জন্য বিশেষ টেমপ্লেট
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">ব্যবহারিক পরীক্ষা</Badge>
                        <Badge variant="secondary" className="text-xs">ল্যাব নির্দেশনা</Badge>
                        <Badge variant="secondary" className="text-xs">১,৯২০ বার ব্যবহৃত</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Madrasha Template */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-orange-500">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-orange-600">দাখিল - মাদ্রাসা বোর্ড</h3>
                      <p className="text-sm text-muted-foreground">
                        মাদ্রাসা শিক্ষা বোর্ডের দাখিল পরীক্ষা
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">আরবি টেক্সট</Badge>
                        <Badge variant="secondary" className="text-xs">ইসলামিক স্টাডিজ</Badge>
                        <Badge variant="secondary" className="text-xs">৮৯০ বার ব্যবহৃত</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Template */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-500">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-indigo-600">এসএসসি ভোকেশনাল - কারিগরি</h3>
                      <p className="text-sm text-muted-foreground">
                        কারিগরি শিক্ষা বোর্ডের ভোকেশনাল পরীক্ষা
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">ট্রেড সাবজেক্ট</Badge>
                        <Badge variant="secondary" className="text-xs">ব্যবহারিক দক্ষতা</Badge>
                        <Badge variant="secondary" className="text-xs">৫২০ বার ব্যবহৃত</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HSC Business Studies */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-red-500">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-red-600">এইচএসসি - ব্যবসায় শিক্ষা</h3>
                      <p className="text-sm text-muted-foreground">
                        ব্যবসায় শিক্ষা বিভাগের জন্য টেমপ্লেট
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">কমার্স বিষয়</Badge>
                        <Badge variant="secondary" className="text-xs">হিসাববিজ্ঞান কোড</Badge>
                        <Badge variant="secondary" className="text-xs">১,৬৮০ বার ব্যবহৃত</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Education Board Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">সমর্থিত শিক্ষা বোর্ডসমূহ:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {examBoards.map((board) => (
                  <Badge key={board.name} variant="secondary" className={`justify-center ${board.color}`}>
                    {board.namebn}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>সাম্প্রতিক এডমিট কার্ড</CardTitle>
                <Link href="/admit-card/history">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    সম্পূর্ণ ইতিহাস দেখুন
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentCards && recentCards.length > 0 ? (
                <div className="space-y-3">
                  {recentCards.slice(0, 5).map((card: any) => (
                    <div key={card.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{card.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {card.studentNameBn} • রোল: {card.rollNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{card.examType}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(card.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  কোনো সাম্প্রতিক কার্ড নেই
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>বৈশিষ্ট্যসমূহ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">QR কোড সহ নিরাপত্তা</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm">ডিজিটাল স্বাক্ষর</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm">ওয়াটারমার্ক সুরক্ষা</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm">বহুভাষিক সাপোর্ট</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm">Excel ইমপোর্ট সুবিধা</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-sm">বোর্ড অনুমোদিত ডিজাইন</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help & Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>সহায়তা ও নির্দেশনা</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">ব্যবহারের নির্দেশনা</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  এডমিট কার্ড তৈরির ধাপে ধাপে গাইড
                </p>
                <Button variant="outline" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  গাইড দেখুন
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">ভিডিও টিউটোরিয়াল</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  সিস্টেম ব্যবহারের ভিডিও শিক্ষা
                </p>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  ভিডিও দেখুন
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">সাপোর্ট টিম</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  যেকোনো সমস্যার জন্য যোগাযোগ করুন
                </p>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  সাপোর্ট
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}