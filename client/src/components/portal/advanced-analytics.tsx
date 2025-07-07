import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalDocuments: number;
  activeUsers: number;
  growthRate: number;
  monthlyData: Array<{
    month: string;
    schools: number;
    revenue: number;
    documents: number;
  }>;
  topSchools: Array<{
    id: number;
    name: string;
    documentsGenerated: number;
    creditsUsed: number;
    revenue: number;
  }>;
  featureUsage: Array<{
    feature: string;
    usage: number;
    enabled: number;
  }>;
}

interface AdvancedAnalyticsProps {
  authToken: string;
}

export default function AdvancedAnalytics({ authToken }: AdvancedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('schools');

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/portal/analytics/detailed', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/portal/analytics/detailed?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  const exportData = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/portal/analytics/export?format=${format}&range=${timeRange}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && (
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend}% from last period
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into portal performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${analytics?.totalRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          trend={12.5}
          color="text-green-600"
        />
        <MetricCard
          title="Documents Generated"
          value={analytics?.totalDocuments?.toLocaleString() || 0}
          icon={FileText}
          trend={8.2}
          color="text-blue-600"
        />
        <MetricCard
          title="Active Schools"
          value={analytics?.activeUsers || 0}
          icon={Users}
          trend={15.3}
          color="text-purple-600"
        />
        <MetricCard
          title="Growth Rate"
          value={`${analytics?.growthRate || 0}%`}
          icon={TrendingUp}
          trend={3.1}
          color="text-orange-600"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">School Performance</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Monthly Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trends
              </CardTitle>
              <CardDescription>
                Growth trends across key metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="h-64 flex items-end space-x-2">
                  {analytics?.monthlyData?.map((month, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ 
                          height: `${(month.schools / Math.max(...(analytics.monthlyData?.map(m => m.schools) || [1]))) * 200}px`,
                          minHeight: '4px'
                        }}
                      />
                      <span className="text-xs mt-2 text-gray-600">{month.month}</span>
                    </div>
                  )) || <div className="text-center py-8">No data available</div>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>School distribution by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">45%</div>
                  <div className="text-sm text-gray-600">North America</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">30%</div>
                  <div className="text-sm text-gray-600">Europe</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">20%</div>
                  <div className="text-sm text-gray-600">Asia</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">5%</div>
                  <div className="text-sm text-gray-600">Others</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Schools</CardTitle>
              <CardDescription>Schools with highest activity and revenue generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topSchools?.map((school, index) => (
                  <div key={school.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{school.name}</h3>
                        <p className="text-sm text-gray-600">
                          {school.documentsGenerated} documents generated
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${school.revenue}</div>
                      <div className="text-sm text-gray-600">{school.creditsUsed} credits used</div>
                    </div>
                  </div>
                )) || <div className="text-center py-8">No school data available</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Adoption</CardTitle>
              <CardDescription>How schools are using different platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.featureUsage?.map((feature) => (
                  <div key={feature.feature} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{feature.feature}</span>
                      <span className="text-sm text-gray-600">
                        {feature.enabled} of {feature.usage} schools
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(feature.enabled / feature.usage) * 100}%` }}
                      />
                    </div>
                  </div>
                )) || <div className="text-center py-8">No feature usage data available</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Revenue analysis by source and time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">$24,500</div>
                  <div className="text-sm text-gray-600">Subscription Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">$8,200</div>
                  <div className="text-sm text-gray-600">Credit Purchases</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">$2,100</div>
                  <div className="text-sm text-gray-600">Add-on Features</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}