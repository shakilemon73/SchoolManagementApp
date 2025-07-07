import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, Database, Users, GraduationCap, BookOpen, UserCheck } from 'lucide-react';
import { realtimeManager, useRealtime, useRealtimeEvent } from '@/lib/realtime';
import { LanguageText } from '@/components/ui/language-text';

interface ConnectionStatus {
  success: boolean;
  message: string;
  databaseConnected?: boolean;
  tablesAccessible?: {
    users: boolean;
    students: boolean;
    teachers: boolean;
  };
  timestamp: string;
}

interface RealtimeData {
  students: any[];
  teachers: any[];
  attendance: any[];
  examResults: any[];
  schoolStats: any;
}

export default function RealtimeTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    students: [],
    teachers: [],
    attendance: [],
    examResults: [],
    schoolStats: null
  });
  const [selectedUserRole, setSelectedUserRole] = useState<'student' | 'teacher' | 'staff' | 'parent' | 'admin'>('admin');
  const [isTestingRealtime, setIsTestingRealtime] = useState(false);
  
  const queryClient = useQueryClient();

  // Test database connection
  const { data: testResult, isLoading: isTestingConnection, refetch: testConnection } = useQuery({
    queryKey: ['/api/realtime/test'],
    enabled: false
  });

  // Initialize real-time for selected role
  const { isConnected: isRealtimeConnected, subscriptionCount } = useRealtime(selectedUserRole, 1);

  // Test real-time connection
  const testRealtimeConnection = async () => {
    setIsTestingRealtime(true);
    try {
      const connected = await realtimeManager.initialize();
      if (connected) {
        const subscriptionIds = realtimeManager.subscribeForRole(selectedUserRole, 1);
        console.log(`Subscribed to ${subscriptionIds.length} real-time channels for ${selectedUserRole}`);
      }
    } catch (error) {
      console.error('Real-time connection test failed:', error);
    } finally {
      setIsTestingRealtime(false);
    }
  };

  // Listen for real-time events
  useRealtimeEvent('student-updated', (data) => {
    console.log('Student data updated in real-time:', data);
    setRealtimeData(prev => ({
      ...prev,
      students: [data.new || data.record, ...prev.students.slice(0, 9)]
    }));
  });

  useRealtimeEvent('teacher-updated', (data) => {
    console.log('Teacher data updated in real-time:', data);
    setRealtimeData(prev => ({
      ...prev,
      teachers: [data.new || data.record, ...prev.teachers.slice(0, 9)]
    }));
  });

  useRealtimeEvent('attendance-updated', (data) => {
    console.log('Attendance updated in real-time:', data);
    setRealtimeData(prev => ({
      ...prev,
      attendance: [data.new || data.record, ...prev.attendance.slice(0, 9)]
    }));
  });

  // Fetch sample data for different user roles
  const loadSampleData = useMutation({
    mutationFn: async (role: string) => {
      const promises = [];
      
      if (role === 'admin' || role === 'staff') {
        promises.push(
          fetch('/api/realtime/school-stats/1').then(res => res.json()),
          fetch('/api/students?limit=5').then(res => res.json()),
          fetch('/api/teachers?limit=5').then(res => res.json())
        );
      }
      
      if (role === 'teacher' || role === 'admin') {
        promises.push(
          fetch('/api/realtime/attendance/1').then(res => res.json())
        );
      }
      
      if (role === 'student' || role === 'parent') {
        promises.push(
          fetch('/api/realtime/exam-results/1?limit=5').then(res => res.json())
        );
      }

      const results = await Promise.all(promises);
      return results;
    },
    onSuccess: (results) => {
      console.log('Sample data loaded:', results);
      // Process results based on role
      if (results.length > 0) {
        const [schoolStats, students, teachers] = results;
        setRealtimeData(prev => ({
          ...prev,
          schoolStats: schoolStats?.data || null,
          students: students?.data || prev.students,
          teachers: teachers?.data || prev.teachers
        }));
      }
    }
  });

  useEffect(() => {
    if (testResult) {
      setConnectionStatus(testResult as ConnectionStatus);
    }
  }, [testResult]);

  const handleTestConnection = async () => {
    await testConnection();
  };

  const handleRoleChange = (role: 'student' | 'teacher' | 'staff' | 'parent' | 'admin') => {
    setSelectedUserRole(role);
    loadSampleData.mutate(role);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-4 w-4" />;
      case 'teacher': return <Users className="h-4 w-4" />;
      case 'staff': return <UserCheck className="h-4 w-4" />;
      case 'parent': return <Users className="h-4 w-4" />;
      case 'admin': return <Database className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Database Connection Test</h1>
          <p className="text-muted-foreground">
            Test database connectivity and real-time features for students, teachers, staff, and parents
          </p>
        </div>
      </div>

      {/* Connection Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Test
          </CardTitle>
          <CardDescription>
            Test the basic database connection to Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTestConnection} 
            disabled={isTestingConnection}
            className="flex items-center gap-2"
          >
            {isTestingConnection ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Test Database Connection
          </Button>

          {connectionStatus && (
            <Alert className={connectionStatus.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {connectionStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={getStatusColor(connectionStatus.success)}>
                  {connectionStatus.message}
                </AlertDescription>
              </div>
              
              {connectionStatus.tablesAccessible && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">Table Access Status:</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(connectionStatus.tablesAccessible).map(([table, accessible]) => (
                      <Badge 
                        key={table} 
                        variant={accessible ? 'default' : 'destructive'}
                        className="flex items-center gap-1"
                      >
                        {accessible ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                Last tested: {new Date(connectionStatus.timestamp).toLocaleString()}
              </p>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* User Role Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Real-time Connection by User Role
          </CardTitle>
          <CardDescription>
            Test real-time functionality for different user types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['student', 'teacher', 'staff', 'parent', 'admin'] as const).map((role) => (
              <Button
                key={role}
                variant={selectedUserRole === role ? 'default' : 'outline'}
                onClick={() => handleRoleChange(role)}
                className="flex items-center gap-2"
              >
                {getRoleIcon(role)}
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            ))}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${isRealtimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">Real-time Status</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isRealtimeConnected ? 'Connected' : 'Disconnected'}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">Active Subscriptions</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {subscriptionCount} channels
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {getRoleIcon(selectedUserRole)}
                <span className="font-medium">Current Role</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedUserRole.charAt(0).toUpperCase() + selectedUserRole.slice(1)}
              </p>
            </Card>
          </div>

          <Button 
            onClick={testRealtimeConnection} 
            disabled={isTestingRealtime}
            className="flex items-center gap-2"
          >
            {isTestingRealtime ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Test Real-time Connection for {selectedUserRole}
          </Button>
        </CardContent>
      </Card>

      {/* Real-time Data Display */}
      {realtimeData.schoolStats && (
        <Card>
          <CardHeader>
            <CardTitle>
              <LanguageText
                en="Live School Statistics"
                bn="লাইভ স্কুল পরিসংখ্যান"
                ar="إحصائيات المدرسة المباشرة"
              />
            </CardTitle>
            <CardDescription>Real-time data updates for school management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{realtimeData.schoolStats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{realtimeData.schoolStats.totalTeachers}</p>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{realtimeData.schoolStats.recentAttendanceRecords}</p>
                <p className="text-sm text-muted-foreground">Recent Attendance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{realtimeData.schoolStats.totalBooks}</p>
                <p className="text-sm text-muted-foreground">Total Books</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Last updated: {realtimeData.schoolStats.lastUpdated ? new Date(realtimeData.schoolStats.lastUpdated).toLocaleString() : 'Never'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            <LanguageText
              en="Connection Summary"
              bn="সংযোগের সারসংক্ষেপ"
              ar="ملخص الاتصال"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Database Connection</span>
              <Badge variant={connectionStatus?.success ? 'default' : 'destructive'}>
                {connectionStatus?.success ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Real-time Features</span>
              <Badge variant={isRealtimeConnected ? 'default' : 'destructive'}>
                {isRealtimeConnected ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>User Role Testing</span>
              <Badge variant="default">
                {selectedUserRole} mode
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}