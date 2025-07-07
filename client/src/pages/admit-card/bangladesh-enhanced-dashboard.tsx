import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Users, 
  Calendar, 
  Shield, 
  Download, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  GraduationCap,
  Award,
  UserCheck,
  Printer,
  Clock,
  TrendingUp
} from 'lucide-react';

interface AdmitCardStats {
  totalGenerated: number;
  thisMonth: number;
  thisWeek: number;
  byExamType: {
    hsc: number;
    ssc: number;
    jsc: number;
    custom: number;
  };
  byBoard: {
    dhaka: number;
    chittagong: number;
    rajshahi: number;
    sylhet: number;
    barisal: number;
    comilla: number;
    jessore: number;
    dinajpur: number;
    madrasha: number;
    technical: number;
  };
  recentActivity: {
    printed: number;
    downloaded: number;
    verified: number;
  };
}

interface BoardTemplate {
  id: string;
  boardName: string;
  boardNameBn: string;
  boardCode: string;
  examTypes: string[];
  subjectGroups: string[];
  isActive: boolean;
  templateCount: number;
}

export default function BangladeshEnhancedAdmitCardDashboard() {
  const { toast } = useToast();
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');

  // Fetch enhanced statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admit-cards/enhanced-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admit-cards/enhanced-stats');
      if (!response.ok) throw new Error('Failed to fetch enhanced stats');
      return response.json() as Promise<AdmitCardStats>;
    }
  });

  // Fetch Bangladesh education boards
  const { data: boards, isLoading: boardsLoading } = useQuery({
    queryKey: ['/api/bangladesh-boards'],
    queryFn: async () => {
      const response = await fetch('/api/bangladesh-boards');
      if (!response.ok) throw new Error('Failed to fetch boards');
      return response.json() as Promise<BoardTemplate[]>;
    }
  });

  const bangladeshBoards = [
    { name: 'Dhaka Board', nameBn: 'ঢাকা বোর্ড', code: 'dhaka', color: 'bg-blue-500' },
    { name: 'Chittagong Board', nameBn: 'চট্টগ্রাম বোর্ড', code: 'chittagong', color: 'bg-green-500' },
    { name: 'Rajshahi Board', nameBn: 'রাজশাহী বোর্ড', code: 'rajshahi', color: 'bg-purple-500' },
    { name: 'Sylhet Board', nameBn: 'সিলেট বোর্ড', code: 'sylhet', color: 'bg-orange-500' },
    { name: 'Barisal Board', nameBn: 'বরিশাল বোর্ড', code: 'barisal', color: 'bg-pink-500' },
    { name: 'Comilla Board', nameBn: 'কুমিল্লা বোর্ড', code: 'comilla', color: 'bg-teal-500' },
    { name: 'Jessore Board', nameBn: 'যশোর বোর্ড', code: 'jessore', color: 'bg-indigo-500' },
    { name: 'Dinajpur Board', nameBn: 'দিনাজপুর বোর্ড', code: 'dinajpur', color: 'bg-red-500' },
    { name: 'Madrasha Board', nameBn: 'মাদ্রাসা বোর্ড', code: 'madrasha', color: 'bg-emerald-500' },
    { name: 'Technical Board', nameBn: 'কারিগরি বোর্ড', code: 'technical', color: 'bg-yellow-500' }
  ];

  const examTypes = [
    { code: 'hsc', name: 'HSC', nameBn: 'উচ্চ মাধ্যমিক', icon: GraduationCap },
    { code: 'ssc', name: 'SSC', nameBn: 'মাধ্যমিক', icon: BookOpen },
    { code: 'jsc', name: 'JSC', nameBn: 'জুনিয়র স্কুল', icon: Award },
    { code: 'hsc_vocational', name: 'HSC Vocational', nameBn: 'এইচএসসি ভোকেশনাল', icon: UserCheck }
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          
          {/* Enhanced Hero Section with Bangladesh Identity */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">হোম</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">বাংলাদেশ এডমিট কার্ড সিস্টেম</span>
            </nav>
            
            <div className="bg-gradient-to-r from-green-600 via-red-500 to-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <FileText className="text-white" size={32} />
                      </div>
                      <div>
                        <h1 className="text-4xl md:text-5xl font-bold">
                          বাংলাদেশ এডমিট কার্ড সিস্টেম
                        </h1>
                        <p className="text-white/90 text-lg mt-2">
                          শিক্ষা বোর্ড অনুমোদিত প্রবেশপত্র ব্যবস্থাপনা
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <Shield size={16} />
                        <span>নিরাপদ ও সুরক্ষিত</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <CheckCircle size={16} />
                        <span>বোর্ড অনুমোদিত</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <Clock size={16} />
                        <span>দ্রুত প্রক্রিয়াকরণ</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/admit-card/create-single">
                      <Button className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105">
                        <FileText className="mr-2" size={20} />
                        নতুন এডমিট কার্ড
                      </Button>
                    </Link>
                    <Link href="/admit-card/batch-creation">
                      <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-3 rounded-xl font-medium">
                        <Users className="mr-2" size={20} />
                        ব্যাচ তৈরি
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">মোট এডমিট কার্ড</p>
                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {statsLoading ? '...' : stats?.totalGenerated.toLocaleString('bn-BD') || '০'}
                    </div>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80">সর্বমোট তৈরি</p>
                  </div>
                  <FileText className="text-blue-500" size={40} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">এই মাসে</p>
                    <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {statsLoading ? '...' : stats?.thisMonth.toLocaleString('bn-BD') || '০'}
                    </div>
                    <p className="text-xs text-green-600/80 dark:text-green-400/80">নতুন কার্ড</p>
                  </div>
                  <TrendingUp className="text-green-500" size={40} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">প্রিন্ট করা হয়েছে</p>
                    <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {statsLoading ? '...' : stats?.recentActivity?.printed.toLocaleString('bn-BD') || '০'}
                    </div>
                    <p className="text-xs text-purple-600/80 dark:text-purple-400/80">গত ৭ দিনে</p>
                  </div>
                  <Printer className="text-purple-500" size={40} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">ডাউনলোড</p>
                    <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                      {statsLoading ? '...' : stats?.recentActivity?.downloaded.toLocaleString('bn-BD') || '০'}
                    </div>
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/80">গত সপ্তাহে</p>
                  </div>
                  <Download className="text-orange-500" size={40} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bangladesh Education Boards Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="text-blue-600" size={24} />
                  শিক্ষা বোর্ড সমূহ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {bangladeshBoards.map((board) => (
                    <div key={board.code} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className={`w-4 h-4 rounded-full ${board.color}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {board.nameBn}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {board.name}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {stats?.byBoard?.[board.code as keyof typeof stats.byBoard] || 0}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="text-green-600" size={24} />
                  পরীক্ষার ধরন
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examTypes.map((exam) => {
                    const Icon = exam.icon;
                    const count = stats?.byExamType?.[exam.code as keyof typeof stats.byExamType] || 0;
                    return (
                      <div key={exam.code} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Icon className="text-gray-600 dark:text-gray-400" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{exam.nameBn}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{exam.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {count.toLocaleString('bn-BD')}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">এডমিট কার্ড</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <Link href="/admit-card/create-single">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">একক এডমিট কার্ড</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">একটি স্টুডেন্টের জন্য</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <Link href="/admit-card/batch-creation">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="text-green-600 dark:text-green-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">ব্যাচ তৈরি</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">একসাথে অনেকগুলো</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <Link href="/admit-card/templates">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Award className="text-purple-600 dark:text-purple-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">টেমপ্লেট ব্যবস্থাপনা</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">কাস্টম ডিজাইন</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Footer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  বাংলাদেশ শিক্ষা বোর্ড অনুমোদিত
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  এই সিস্টেম বাংলাদেশের সকল শিক্ষা বোর্ডের নিয়ম অনুসরণ করে এডমিট কার্ড তৈরি করে।
                  সকল প্রবেশপত্র সরকারি নীতিমালা অনুযায়ী নিরাপদ ও সুরক্ষিত।
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="text-green-600" size={20} />
                <CheckCircle className="text-blue-600" size={20} />
                <Award className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}