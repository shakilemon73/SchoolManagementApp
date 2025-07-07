import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Database, 
  Server, 
  Users, 
  Shield, 
  Plus, 
  RefreshCw, 
  Search,
  Filter,
  Bell,
  Settings,
  BarChart3,
  School,
  TrendingUp,
  Globe,
  CheckCircle,
  AlertTriangle,
  Activity,
  Eye,
  Edit3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LanguageText } from '@/components/ui/language-text';

interface SchoolWithStatus {
  id: number;
  schoolId: string;
  name: string;
  subdomain: string;
  contactEmail: string;
  planType: string;
  status: string;
  hasSupabase: boolean;
  connectionStatus: 'connected' | 'error' | 'unknown';
  supabaseUrl?: string;
  projectId?: string;
  apiKey?: string;
  createdAt: string;
}

interface OverviewStats {
  totalSchools: number;
  activeSchools: number;
  schoolsWithSupabase: number;
  connectedClients: number;
  planDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export default function ModernStandaloneAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch overview data
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['/api/standalone-admin/overview'],
    refetchInterval: 30000,
  });

  // Fetch schools data
  const { data: schools, isLoading: schoolsLoading, refetch: refetchSchools } = useQuery({
    queryKey: ['/api/standalone-admin/schools'],
    refetchInterval: 30000,
  });

  const overviewData = overview as OverviewStats | undefined;
  const schoolsData = schools as SchoolWithStatus[] | undefined;

  // Modern Navigation Component
  const Navigation = () => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Super Admin</h1>
              <p className="text-sm text-gray-500">Multi-Tenant Management</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => refetchOverview()}
              variant="outline" 
              size="sm"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Modern Tab Navigation
  const TabNavigation = () => (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'schools', label: 'Schools', icon: School },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Dashboard Overview Cards
  const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Schools</p>
              <p className="text-3xl font-bold text-gray-900">{overviewData?.totalSchools || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <School className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">All systems operational</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Schools</p>
              <p className="text-3xl font-bold text-gray-900">{overviewData?.activeSchools || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">100% uptime</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Database Instances</p>
              <p className="text-3xl font-bold text-gray-900">{overviewData?.schoolsWithSupabase || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Shield className="h-4 w-4 text-purple-500 mr-1" />
            <span className="text-sm text-purple-600">Secure & isolated</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Clients</p>
              <p className="text-3xl font-bold text-gray-900">{overviewData?.connectedClients || 0}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Globe className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-sm text-orange-600">Real-time sync</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // School Management Table
  const SchoolsTable = () => (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              <LanguageText
                en="School Management"
                bn="স্কুল ব্যবস্থাপনা"
                ar="إدارة المدرسة"
              />
            </CardTitle>
            <CardDescription>
              <LanguageText
                en="Manage all school instances and their database connections"
                bn="সকল স্কুল ইনস্ট্যান্স এবং তাদের ডাটাবেস সংযোগ পরিচালনা করুন"
                ar="إدارة جميع مثيلات المدرسة واتصالات قاعدة البيانات الخاصة بها"
              />
            </CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Database
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schoolsData?.filter(school => 
                school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                school.schoolId.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((school) => (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <School className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{school.name}</div>
                        <div className="text-sm text-gray-500">{school.schoolId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={school.status === 'active' ? 'default' : 'secondary'}
                      className={school.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {school.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {school.planType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {school.connectionStatus === 'connected' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm text-yellow-600">Pending</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  // Main Content Renderer
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <LanguageText
                      en="System Health"
                      bn="সিস্টেম স্বাস্থ্য"
                      ar="صحة النظام"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database Performance</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">Excellent</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Response Time</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">120ms avg</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Security Status</span>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-blue-600">Protected</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    <LanguageText
                      en="Recent Activity"
                      bn="সাম্প্রতিক কার্যকলাপ"
                      ar="النشاط الأخير"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">New school registered: ABC School</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Database backup completed</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">System update deployed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'schools':
        return <SchoolsTable />;
      case 'database':
        return (
          <Card>
            <CardHeader>
              <CardTitle>
                <LanguageText
                  en="Database Management"
                  bn="ডাটাবেস ব্যবস্থাপনা"
                  ar="إدارة قاعدة البيانات"
                />
              </CardTitle>
              <CardDescription>
                <LanguageText
                  en="Manage Supabase instances and database connections"
                  bn="সুপাবেস ইনস্ট্যান্স এবং ডাটাবেস সংযোগ পরিচালনা করুন"
                  ar="إدارة مثيلات Supabase واتصالات قاعدة البيانات"
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Database management features coming soon...</p>
            </CardContent>
          </Card>
        );
      case 'analytics':
        return (
          <Card>
            <CardHeader>
              <CardTitle>
                <LanguageText
                  en="System Analytics"
                  bn="সিস্টেম অ্যানালিটিক্স"
                  ar="تحليلات النظام"
                />
              </CardTitle>
              <CardDescription>
                <LanguageText
                  en="Monitor performance and usage statistics"
                  bn="কর্মক্ষমতা এবং ব্যবহারের পরিসংখ্যান নিরীক্ষণ করুন"
                  ar="مراقبة الأداء وإحصائيات الاستخدام"
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <TabNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}