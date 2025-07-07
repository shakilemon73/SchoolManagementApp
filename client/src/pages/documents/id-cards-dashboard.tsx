import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface IdCardStats {
  totalGenerated: number;
  thisMonth: number;
  thisWeek: number;
}

interface RecentHistory {
  id: string;
  studentName: string;
  studentId: string;
  className: string;
  section: string;
  createdAt: string;
  status: 'generated' | 'downloaded' | 'printed';
}

interface Template {
  id: string;
  name: string;
  nameBn: string;
  category: 'default' | 'modern' | 'simple';
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function IdCardsDashboard() {
  const { toast } = useToast();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/id-cards/stats'],
    queryFn: async () => {
      const response = await fetch('/api/id-cards/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json() as Promise<IdCardStats>;
    }
  });

  // Fetch recent history
  const { data: recentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/id-cards/recent'],
    queryFn: async () => {
      const response = await fetch('/api/id-cards/recent?limit=10');
      if (!response.ok) throw new Error('Failed to fetch recent history');
      return response.json() as Promise<RecentHistory[]>;
    }
  });

  // Available templates (mock data for now)
  const templates = [
    {
      id: 'modern',
      name: 'Modern ID Card',
      nameBn: 'আধুনিক আইডি কার্ড',
      category: 'modern' as const,
      description: 'গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড ও আধুনিক ডিজাইন',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'classic',
      name: 'Classic ID Card',
      nameBn: 'ক্ল্যাসিক আইডি কার্ড',
      category: 'default' as const,
      description: 'প্রথাগত নীল ও সাদা ডিজাইন',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'simple',
      name: 'Simple ID Card',
      nameBn: 'সরল আইডি কার্ড',
      category: 'simple' as const,
      description: 'সাদামাটা ও পরিষ্কার ডিজাইন',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      generated: { label: 'তৈরি হয়েছে', variant: 'default' as const },
      downloaded: { label: 'ডাউনলোড হয়েছে', variant: 'secondary' as const },
      printed: { label: 'প্রিন্ট হয়েছে', variant: 'outline' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.generated;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-700">হোম</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">আইডি কার্ড ড্যাশবোর্ড</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">আইডি কার্ড ড্যাশবোর্ড</h1>
              <p className="text-gray-600 mt-1">শিক্ষার্থীদের আইডি কার্ড তৈরি ও পরিচালনা করুন</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট তৈরি</CardTitle>
              <span className="material-icons text-blue-600">badge</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.totalGenerated ?? 0).toLocaleString('bn-BD')}
              </div>
              <p className="text-xs text-gray-500 mt-1">সর্বমোট আইডি কার্ড</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">এই মাসে</CardTitle>
              <span className="material-icons text-green-600">trending_up</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.thisMonth ?? 0).toLocaleString('bn-BD')}
              </div>
              <p className="text-xs text-gray-500 mt-1">চলতি মাসে তৈরি</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">এই সপ্তাহে</CardTitle>
              <span className="material-icons text-orange-600">schedule</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.thisWeek ?? 0).toLocaleString('bn-BD')}
              </div>
              <p className="text-xs text-gray-500 mt-1">চলতি সপ্তাহে তৈরি</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Templates Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">dashboard_customize</span>
                আইডি কার্ড টেমপ্লেট নির্বাচন করুন
              </CardTitle>
              <Button variant="outline" size="sm">
                সব টেমপ্লেট দেখুন
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="group">
                  <div className="aspect-[3/4] bg-white border-2 border-gray-200 rounded-lg overflow-hidden group-hover:border-blue-300 transition-colors mb-3">
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                      <span className="material-icons text-4xl text-blue-500 mb-2">badge</span>
                      <div className="text-center">
                        <div className="text-xs font-semibold text-gray-700 mb-1">আইডি কার্ড</div>
                        <div className="text-xs text-gray-500">স্ট্যান্ডার্ড সাইজ</div>
                        <div className="border-t border-dashed border-gray-300 mt-2 pt-2">
                          <div className="text-xs text-gray-600">✓ ছাত্র তথ্য</div>
                          <div className="text-xs text-gray-600">✓ ছবি</div>
                          <div className="text-xs text-gray-600">✓ রক্তের গ্রুপ</div>
                          <div className="text-xs text-gray-600">✓ স্কুল লোগো</div>
                          <div className="text-xs text-gray-600">✓ QR কোড</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {template.nameBn}
                      </h3>
                      <p className="text-xs text-gray-500">{template.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={template.category === 'default' ? 'default' : 'secondary'} className="text-xs">
                          {template.category === 'default' ? 'ডিফল্ট' : template.category === 'modern' ? 'আধুনিক' : 'সরল'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Link href={`/documents/id-cards/create?template=${template.id}`}>
                        <Button size="sm" className="w-full">
                          <span className="material-icons text-sm mr-1">person</span>
                          একক তৈরি
                        </Button>
                      </Link>
                      
                      <Link href={`/documents/id-cards/batch?template=${template.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <span className="material-icons text-sm mr-1">groups</span>
                          ব্যাচ তৈরি
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">history</span>
                সাম্প্রতিক কার্যক্রম
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentHistory && recentHistory.length > 0 ? (
                <div className="space-y-4">
                  {recentHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.studentName}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span>আইডি: {item.studentId}</span>
                          <span>•</span>
                          <span>{item.className} - {item.section}</span>
                          <span>•</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <Button variant="ghost" size="sm">
                          <span className="material-icons text-sm">more_vert</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <Link href="/documents/id-cards/history">
                      <Button variant="outline" className="w-full">
                        সম্পূর্ণ ইতিহাস দেখুন
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-icons text-4xl text-gray-300 mb-2">badge</span>
                  <p className="text-gray-500">এখনো কোন আইডি কার্ড তৈরি হয়নি</p>
                  <Link href="/documents/id-cards/create">
                    <Button className="mt-3">প্রথম আইডি কার্ড তৈরি করুন</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">bolt</span>
                দ্রুত কার্যক্রম
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/documents/id-cards/create">
                  <div className="p-4 border border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group cursor-pointer">
                    <div className="text-center">
                      <span className="material-icons text-3xl text-blue-500 group-hover:text-blue-600 mb-2">person_add</span>
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-700">একক আইডি কার্ড</h3>
                      <p className="text-xs text-gray-500 mt-1">একজন শিক্ষার্থীর জন্য আইডি কার্ড তৈরি করুন</p>
                    </div>
                  </div>
                </Link>

                <Link href="/documents/id-cards/batch">
                  <div className="p-4 border border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group cursor-pointer">
                    <div className="text-center">
                      <span className="material-icons text-3xl text-green-500 group-hover:text-green-600 mb-2">group_add</span>
                      <h3 className="font-medium text-gray-900 group-hover:text-green-700">ব্যাচ তৈরি</h3>
                      <p className="text-xs text-gray-500 mt-1">একসাথে অনেক শিক্ষার্থীর আইডি কার্ড তৈরি করুন</p>
                    </div>
                  </div>
                </Link>

                <Link href="/documents/id-cards/templates">
                  <div className="p-4 border border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group cursor-pointer">
                    <div className="text-center">
                      <span className="material-icons text-3xl text-purple-500 group-hover:text-purple-600 mb-2">dashboard_customize</span>
                      <h3 className="font-medium text-gray-900 group-hover:text-purple-700">টেমপ্লেট ম্যানেজার</h3>
                      <p className="text-xs text-gray-500 mt-1">নতুন টেমপ্লেট তৈরি ও কাস্টমাইজ করুন</p>
                    </div>
                  </div>
                </Link>

                <Link href="/documents/id-cards/settings">
                  <div className="p-4 border border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group cursor-pointer">
                    <div className="text-center">
                      <span className="material-icons text-3xl text-orange-500 group-hover:text-orange-600 mb-2">settings</span>
                      <h3 className="font-medium text-gray-900 group-hover:text-orange-700">সেটিংস</h3>
                      <p className="text-xs text-gray-500 mt-1">আইডি কার্ড সেটিংস ও কনফিগারেশন</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}