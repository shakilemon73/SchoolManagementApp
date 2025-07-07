import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Monitor, 
  Users, 
  Database,
  Zap,
  Shield,
  Bell,
  FileText,
  Power,
  RefreshCw,
  Terminal,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';

interface RemoteControlProps {
  schoolId: string;
  authToken: string;
}

interface SchoolSettings {
  schoolName: string;
  maxStudents: number;
  maxTeachers: number;
  features: {
    parentPortal: boolean;
    videoConference: boolean;
    smsNotifications: boolean;
    bulkDocuments: boolean;
    customTemplates: boolean;
  };
  appearance: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    theme: 'light' | 'dark';
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
}

export default function RemoteControl({ schoolId, authToken }: RemoteControlProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [commandDialog, setCommandDialog] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [customCommand, setCustomCommand] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch school data
  const { data: schoolData, isLoading } = useQuery({
    queryKey: ['/api/portal/schools', schoolId, 'remote'],
    queryFn: async () => {
      const response = await fetch(`/api/portal/schools/${schoolId}/remote`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch school data');
      return response.json();
    }
  });

  // Execute remote command mutation
  const executeCommandMutation = useMutation({
    mutationFn: async ({ command, params }: { command: string; params?: any }) => {
      const response = await fetch(`/api/portal/schools/${schoolId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ command, params }),
      });
      if (!response.ok) throw new Error('Failed to execute command');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/schools', schoolId] });
      toast({ title: 'Success', description: data.message || 'Command executed successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update school settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SchoolSettings>) => {
      const response = await fetch(`/api/portal/schools/${schoolId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/schools', schoolId] });
      toast({ title: 'Success', description: 'Settings updated successfully' });
    },
  });

  const executeCommand = (command: string, params?: any) => {
    executeCommandMutation.mutate({ command, params });
  };

  const QuickActionButton = ({ icon: Icon, label, command, variant = "outline", params }: any) => (
    <Button 
      variant={variant} 
      className="flex flex-col h-20 w-full"
      onClick={() => executeCommand(command, params)}
      disabled={executeCommandMutation.isPending}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span className="text-xs">{label}</span>
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Header with School Info */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Remote Control</h2>
          <p className="text-gray-600">Direct control panel for {schoolData?.name || schoolId}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={schoolData?.status === 'active' ? 'default' : 'secondary'}>
            {schoolData?.status || 'Unknown'}
          </Badge>
          <Dialog open={commandDialog} onOpenChange={setCommandDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Terminal className="h-4 w-4 mr-2" />
                Custom Command
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Execute Custom Command</DialogTitle>
                <DialogDescription>
                  Run a custom command on the school's system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="command">Command</Label>
                  <Textarea 
                    id="command" 
                    value={customCommand}
                    onChange={(e) => setCustomCommand(e.target.value)}
                    placeholder="Enter command or SQL query..."
                    className="font-mono"
                  />
                </div>
                <Button 
                  onClick={() => {
                    executeCommand('custom', { command: customCommand });
                    setCommandDialog(false);
                    setCustomCommand('');
                  }}
                  className="w-full"
                >
                  Execute Command
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Control</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Execute common administrative tasks instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <QuickActionButton
                  icon={RefreshCw}
                  label="Sync Data"
                  command="sync_all_data"
                />
                <QuickActionButton
                  icon={Database}
                  label="Backup DB"
                  command="backup_database"
                />
                <QuickActionButton
                  icon={Bell}
                  label="Send Notice"
                  command="broadcast_notice"
                />
                <QuickActionButton
                  icon={Users}
                  label="Reset Passwords"
                  command="reset_all_passwords"
                />
                <QuickActionButton
                  icon={FileText}
                  label="Generate Reports"
                  command="generate_reports"
                />
                <QuickActionButton
                  icon={Shield}
                  label="Security Scan"
                  command="security_scan"
                />
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Server Status</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Database</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Backup</span>
                    <span className="text-sm text-gray-600">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Used</span>
                    <span className="text-sm text-gray-600">2.4 GB / 10 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Active Users</span>
                    <span className="font-medium">{schoolData?.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documents Today</span>
                    <span className="font-medium">{schoolData?.documentsToday || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Calls/Hour</span>
                    <span className="font-medium">{schoolData?.apiCalls || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credits Remaining</span>
                    <span className="font-medium">{schoolData?.creditsRemaining || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Remote Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Maintenance Mode</span>
                    <Switch 
                      checked={maintenanceMode}
                      onCheckedChange={(checked) => {
                        setMaintenanceMode(checked);
                        executeCommand('toggle_maintenance', { enabled: checked });
                      }}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => executeCommand('force_logout_all')}
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Force Logout All
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => executeCommand('clear_cache')}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management Control</CardTitle>
              <CardDescription>
                Direct control over school users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Bulk User Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => executeCommand('reset_student_passwords')}
                    >
                      Reset Student Passwords
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => executeCommand('reset_teacher_passwords')}
                    >
                      Reset Teacher Passwords
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => executeCommand('deactivate_inactive_users')}
                    >
                      Deactivate Inactive
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => executeCommand('export_user_list')}
                    >
                      Export User List
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Permission Controls</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Student Document Access</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Parent Portal Access</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Teacher Admin Rights</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Remote Settings Control</CardTitle>
              <CardDescription>
                Configure school settings remotely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">System Limits</h3>
                    <div className="space-y-2">
                      <Label htmlFor="maxStudents">Maximum Students</Label>
                      <Input 
                        id="maxStudents" 
                        type="number" 
                        defaultValue={schoolData?.maxStudents || 500}
                        onBlur={(e) => updateSettingsMutation.mutate({ maxStudents: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTeachers">Maximum Teachers</Label>
                      <Input 
                        id="maxTeachers" 
                        type="number" 
                        defaultValue={schoolData?.maxTeachers || 50}
                        onBlur={(e) => updateSettingsMutation.mutate({ maxTeachers: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Feature Controls</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Parent Portal</span>
                        <Switch 
                          defaultChecked={schoolData?.features?.parentPortal}
                          onCheckedChange={(checked) => updateSettingsMutation.mutate({ 
                            features: { ...schoolData?.features, parentPortal: checked }
                          })}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Video Conferencing</span>
                        <Switch 
                          defaultChecked={schoolData?.features?.videoConference}
                          onCheckedChange={(checked) => updateSettingsMutation.mutate({ 
                            features: { ...schoolData?.features, videoConference: checked }
                          })}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>SMS Notifications</span>
                        <Switch 
                          defaultChecked={schoolData?.features?.smsNotifications}
                          onCheckedChange={(checked) => updateSettingsMutation.mutate({ 
                            features: { ...schoolData?.features, smsNotifications: checked }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Control Panel</CardTitle>
              <CardDescription>
                Direct database management and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Database Operations</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => executeCommand('backup_database')}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Create Backup
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => executeCommand('optimize_database')}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Optimize Database
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => executeCommand('analyze_performance')}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      Analyze Performance
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Data Management</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => executeCommand('cleanup_old_data')}
                    >
                      Clean Old Data
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => executeCommand('rebuild_indexes')}
                    >
                      Rebuild Indexes
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => executeCommand('verify_data_integrity')}
                    >
                      Verify Integrity
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance & Updates</CardTitle>
              <CardDescription>
                System maintenance and update controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">System Updates</h3>
                    <Button 
                      className="w-full"
                      onClick={() => executeCommand('check_updates')}
                    >
                      Check for Updates
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => executeCommand('schedule_maintenance')}
                    >
                      Schedule Maintenance
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Emergency Controls</h3>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => executeCommand('emergency_shutdown')}
                    >
                      Emergency Shutdown
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => executeCommand('restore_from_backup')}
                    >
                      Restore from Backup
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}