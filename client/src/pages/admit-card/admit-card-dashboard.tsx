import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AdmitCardStats {
  totalGenerated: number;
  thisMonth: number;
  thisWeek: number;
}

interface RecentHistory {
  id: string;
  studentName: string;
  studentNameBn: string;
  templateName: string;
  createdAt: string;
  examType: string;
  status: 'generated' | 'downloaded' | 'printed';
}

interface Template {
  id: string;
  name: string;
  nameBn: string;
  category: 'default' | 'custom';
  previewUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdmitCardDashboard() {
  const { toast } = useToast();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admit-cards/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admit-cards/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json() as Promise<AdmitCardStats>;
    }
  });

  // Fetch recent history
  const { data: recentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/admit-cards/recent'],
    queryFn: async () => {
      const response = await fetch('/api/admit-cards/recent?limit=10');
      if (!response.ok) throw new Error('Failed to fetch recent history');
      return response.json() as Promise<RecentHistory[]>;
    }
  });

  // Fetch available templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/admit-cards/templates'],
    queryFn: async () => {
      const response = await fetch('/api/admit-cards/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json() as Promise<Template[]>;
    }
  });

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Enhanced Hero Section - Don Norman's Clear Mental Model */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">হোম</Link>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">এডমিট কার্ড সিস্টেম</span>
            </nav>
            
            {/* Hero Header with Status Indicator */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl p-8 border border-green-100 dark:border-green-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">description</span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        এডমিট কার্ড সিস্টেম
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        পরীক্ষার প্রবেশপত্র তৈরি ও ব্যবস্থাপনা
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>সিস্টেম সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <span className="material-icons text-sm">verified</span>
                      <span>নিরাপদ প্রিন্টিং</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/admit-card/create-single">
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105">
                      <span className="material-icons mr-2">add</span>
                      নতুন এডমিট কার্ড
                    </Button>
                  </Link>
                  <Button variant="outline" className="px-6 py-3 rounded-xl font-medium border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20">
                    <span className="material-icons mr-2">history</span>
                    ইতিহাস দেখুন
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Cards - Julie Zhuo's Information Hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">description</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট এডমিট কার্ড</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {statsLoading ? (
                            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          ) : (
                            stats?.totalGenerated.toLocaleString('bn-BD') || '০'
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">সর্বমোট তৈরি হয়েছে</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-green-600 dark:text-green-400 text-xl">trending_up</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">এই মাসে</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {statsLoading ? (
                            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          ) : (
                            stats?.thisMonth.toLocaleString('bn-BD') || '০'
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">চলতি মাসে তৈরি</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-icons text-orange-600 dark:text-orange-400 text-xl">schedule</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">এই সপ্তাহে</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {statsLoading ? (
                            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          ) : (
                            stats?.thisWeek.toLocaleString('bn-BD') || '০'
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">চলতি সপ্তাহে তৈরি</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Template Selection - Dieter Rams' Minimalism & Luke Wroblewski's Mobile-First */}
          <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                    <span className="material-icons text-purple-600 dark:text-purple-400 text-xl">dashboard_customize</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      টেমপ্লেট নির্বাচন
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">আপনার প্রয়োজন অনুযায়ী ডিজাইন বেছে নিন</p>
                  </div>
                </div>
                <Link href="/admit-card/templates">
                  <Button variant="outline" className="px-4 py-2 rounded-xl border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                    <span className="material-icons mr-2 text-sm">visibility</span>
                    সব টেমপ্লেট
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {templatesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {templates.map((template: any) => (
                    <div key={template.id} className="group cursor-pointer">
                      <div className="aspect-[3/4] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden group-hover:border-purple-300 dark:group-hover:border-purple-600 group-hover:shadow-lg transition-all duration-300 mb-4">
                        {template.previewUrl ? (
                          <img 
                            src={template.previewUrl} 
                            alt={`${template.nameBn} টেমপ্লেট প্রিভিউ`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 p-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <span className="material-icons text-purple-600 dark:text-purple-400 text-xl">description</span>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">এডমিট কার্ড</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">A4 ফরম্যাট</div>
                              <div className="border-t border-dashed border-gray-300 dark:border-gray-600 pt-3 space-y-1">
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                  ছাত্র তথ্য
                                </div>
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                  পরীক্ষার সূচি
                                </div>
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                  স্কুল লোগো
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {template.nameBn || template.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={template.category === 'default' ? 'default' : 'secondary'} 
                              className="text-xs px-2 py-1 rounded-md"
                            >
                              {template.category === 'default' ? 'ডিফল্ট' : 'কাস্টম'}
                            </Badge>
                            {template.isActive && (
                              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                সক্রিয়
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/admit-card/create-single?template=${template.id}`}>
                            <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all hover:scale-105">
                              <span className="material-icons text-sm mr-1">person</span>
                              একক তৈরি
                            </Button>
                          </Link>
                        
                        <Link href={`/admit-card/batch-creation?template=${template.id}`}>
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
            ) : (
              <div className="text-center py-12">
                <span className="material-icons text-6xl text-gray-300 mb-4">dashboard_customize</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন টেমপ্লেট পাওয়া যায়নি</h3>
                <p className="text-gray-500 mb-6">প্রথমে কিছু টেমপ্লেট তৈরি করুন</p>
                <Link href="/admit-card/templates/create">
                  <Button>
                    <span className="material-icons mr-2">add</span>
                    নতুন টেমপ্লেট তৈরি করুন
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

          {/* Enhanced Recent Activity & Quick Actions - Alan Cooper's Interaction Design & Susan Weinschenk's Cognitive Load */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent History with Enhanced Design */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">history</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      সাম্প্রতিক কার্যক্রম
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">সর্বশেষ তৈরি করা এডমিট কার্ডসমূহ</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {historyLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentHistory && recentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {recentHistory.map((item) => (
                      <div key={item.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800">
                        <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-icons text-green-600 dark:text-green-400 text-lg">description</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.studentNameBn || item.studentName}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="truncate">{item.templateName}</span>
                            <span className="text-gray-400">•</span>
                            <span className="whitespace-nowrap">{formatDate(item.createdAt)}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">{item.examType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-icons text-sm">more_vert</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Link href="/admit-card/history">
                      <Button variant="outline" className="w-full">
                        সম্পূর্ণ ইতিহাস দেখুন
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-icons text-4xl text-gray-300 mb-2">description</span>
                  <p className="text-gray-500">এখনো কোন এডমিট কার্ড তৈরি হয়নি</p>
                  <Link href="/admit-card/create-single">
                    <Button className="mt-3">প্রথম এডমিট কার্ড তৈরি করুন</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

            {/* Enhanced Quick Actions - Aarron Walter's Emotional Design & Jonathan Ive's Minimalism */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                    <span className="material-icons text-orange-600 dark:text-orange-400 text-xl">bolt</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      দ্রুত কার্যক্রম
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">প্রয়োজনীয় সেবা ও টুলস</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <Link href="/admit-card/templates">
                    <div className="group p-5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-icons text-blue-600 dark:text-blue-400 text-xl">store</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            টেমপ্লেট স্টোর
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">নতুন ডিজাইন ও লেআউট সংগ্রহ করুন</p>
                        </div>
                        <span className="material-icons text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">arrow_forward</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/admit-card/history">
                    <div className="group p-5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all duration-300 cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-icons text-green-600 dark:text-green-400 text-xl">manage_history</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            ইতিহাস ব্যবস্থাপনা
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">পূর্বের সকল রেকর্ড দেখুন ও পরিচালনা করুন</p>
                        </div>
                        <span className="material-icons text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">arrow_forward</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/admit-card/settings">
                    <div className="group p-5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all duration-300 cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-icons text-purple-600 dark:text-purple-400 text-xl">settings</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            সিস্টেম সেটিংস
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">এডমিট কার্ড পছন্দসমূহ কনফিগার করুন</p>
                        </div>
                        <span className="material-icons text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center">
                        <span className="material-icons text-amber-600 dark:text-amber-400 text-sm">tips_and_updates</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">সাহায্য ও টিপস</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">এডমিট কার্ড তৈরির জন্য সহায়তা নিন</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}