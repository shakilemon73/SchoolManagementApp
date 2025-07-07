import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Server, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Clock,
  Zap
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
  lastUpdated: string;
}

interface DatabaseMetrics {
  connectionPool: {
    active: number;
    idle: number;
    waiting: number;
  };
  queryPerformance: {
    averageTime: number;
    slowQueries: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
}

interface ServerMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    inbound: number;
    outbound: number;
  };
}

interface SystemMonitoringProps {
  authToken: string;
}

export default function SystemMonitoring({ authToken }: SystemMonitoringProps) {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch system health
  const { data: systemHealth, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ['/api/portal/system/health'],
    queryFn: async () => {
      const response = await fetch('/api/portal/system/health', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch system health');
      return response.json();
    },
    refetchInterval: refreshInterval
  });

  // Fetch database metrics
  const { data: dbMetrics, isLoading: dbLoading } = useQuery<DatabaseMetrics>({
    queryKey: ['/api/portal/system/database'],
    queryFn: async () => {
      const response = await fetch('/api/portal/system/database', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch database metrics');
      return response.json();
    },
    refetchInterval: refreshInterval
  });

  // Fetch server metrics
  const { data: serverMetrics, isLoading: serverLoading } = useQuery<ServerMetrics>({
    queryKey: ['/api/portal/system/server'],
    queryFn: async () => {
      const response = await fetch('/api/portal/system/server', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch server metrics');
      return response.json();
    },
    refetchInterval: refreshInterval
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      healthy: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      warning: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      critical: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    const config = configs[status as keyof typeof configs] || configs.critical;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const MetricCard = ({ title, value, unit, icon: Icon, color, progress }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {value}
              {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
            </p>
            {progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className={`h-1.5 rounded-full ${color.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-gray-600">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="text-sm">Auto-refresh: {refreshInterval / 1000}s</span>
          </div>
          {systemHealth && getStatusBadge(systemHealth.status)}
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="System Uptime"
          value={systemHealth ? formatUptime(systemHealth.uptime) : '--'}
          icon={Clock}
          color="text-blue-600"
        />
        <MetricCard
          title="Active Connections"
          value={systemHealth?.activeConnections || 0}
          icon={Network}
          color="text-green-600"
        />
        <MetricCard
          title="Response Time"
          value={systemHealth?.responseTime || 0}
          unit="ms"
          icon={Zap}
          color="text-yellow-600"
        />
        <MetricCard
          title="Error Rate"
          value={systemHealth?.errorRate || 0}
          unit="%"
          icon={AlertTriangle}
          color="text-red-600"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="server">Server Metrics</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>Current system health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>API Server</span>
                    {getStatusBadge('healthy')}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Database</span>
                    {getStatusBadge('healthy')}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Authentication</span>
                    {getStatusBadge('healthy')}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>File Storage</span>
                    {getStatusBadge('healthy')}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Email Service</span>
                    {getStatusBadge('warning')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Resource Usage
                </CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serverLoading ? (
                    <div className="text-center py-4">Loading metrics...</div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">CPU Usage</span>
                          <span className="text-sm font-medium">{serverMetrics?.cpu || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${serverMetrics?.cpu || 0}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Memory Usage</span>
                          <span className="text-sm font-medium">{serverMetrics?.memory || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${serverMetrics?.memory || 0}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Disk Usage</span>
                          <span className="text-sm font-medium">{serverMetrics?.disk || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{ width: `${serverMetrics?.disk || 0}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="server" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="CPU Usage"
              value={serverMetrics?.cpu || 0}
              unit="%"
              icon={Cpu}
              color="text-blue-600"
              progress={serverMetrics?.cpu}
            />
            <MetricCard
              title="Memory Usage"
              value={serverMetrics?.memory || 0}
              unit="%"
              icon={MemoryStick}
              color="text-green-600"
              progress={serverMetrics?.memory}
            />
            <MetricCard
              title="Disk Usage"
              value={serverMetrics?.disk || 0}
              unit="%"
              icon={HardDrive}
              color="text-yellow-600"
              progress={serverMetrics?.disk}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Network Traffic</CardTitle>
              <CardDescription>Real-time network activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {serverMetrics?.network?.inbound || 0} MB/s
                  </div>
                  <div className="text-sm text-gray-600">Inbound Traffic</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {serverMetrics?.network?.outbound || 0} MB/s
                  </div>
                  <div className="text-sm text-gray-600">Outbound Traffic</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Connection Pool
                </CardTitle>
                <CardDescription>Database connection status</CardDescription>
              </CardHeader>
              <CardContent>
                {dbLoading ? (
                  <div className="text-center py-4">Loading database metrics...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Active Connections</span>
                      <span className="font-medium">{dbMetrics?.connectionPool?.active || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Idle Connections</span>
                      <span className="font-medium">{dbMetrics?.connectionPool?.idle || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waiting Connections</span>
                      <span className="font-medium">{dbMetrics?.connectionPool?.waiting || 0}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
                <CardDescription>Database query analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Query Time</span>
                    <span className="font-medium">{dbMetrics?.queryPerformance?.averageTime || 0}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow Queries ({`>`}1s)</span>
                    <span className="font-medium">{dbMetrics?.queryPerformance?.slowQueries || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>Database storage metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Used Storage</span>
                  <span className="font-medium">
                    {dbMetrics?.storage?.used || 0} GB / {dbMetrics?.storage?.total || 0} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${dbMetrics?.storage?.percentage || 0}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 text-center">
                  {dbMetrics?.storage?.percentage || 0}% utilized
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Logs</CardTitle>
              <CardDescription>Latest system events and error logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-auto">
                <div className="text-xs font-mono space-y-1">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-gray-500">2025-06-02 07:21:14</span>
                    <span>System health check passed</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <Activity className="h-3 w-3 text-blue-600" />
                    <span className="text-gray-500">2025-06-02 07:20:45</span>
                    <span>Database connection pool refreshed</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                    <span className="text-gray-500">2025-06-02 07:19:23</span>
                    <span>High memory usage detected: 85%</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-gray-500">2025-06-02 07:18:11</span>
                    <span>New school instance created: school_1c_VCNMq</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Current system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium">High Memory Usage</h4>
                      <p className="text-sm text-gray-600">Memory usage is at 85% capacity</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Investigate</Button>
                </div>
                
                <div className="text-center py-8 text-gray-500">
                  No critical alerts at this time
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}