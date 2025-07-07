import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Shield, Activity, Lock } from 'lucide-react';

interface PortalAdmin {
  id: number;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'support';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface UserManagementProps {
  authToken: string;
}

export default function UserManagement({ authToken }: UserManagementProps) {
  const [newUserDialog, setNewUserDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all portal admins
  const { data: admins, isLoading } = useQuery<PortalAdmin[]>({
    queryKey: ['/api/portal/admins'],
    queryFn: async () => {
      const response = await fetch('/api/portal/admins', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch admins');
      return response.json();
    }
  });

  // Create new admin mutation
  const createAdminMutation = useMutation({
    mutationFn: async (adminData: any) => {
      const response = await fetch('/api/portal/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(adminData),
      });
      if (!response.ok) throw new Error('Failed to create admin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/admins'] });
      setNewUserDialog(false);
      toast({ title: 'Success', description: 'Admin user created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const adminData = Object.fromEntries(formData);
    createAdminMutation.mutate(adminData);
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      support: 'bg-green-100 text-green-800',
    };
    return (
      <Badge className={colors[role as keyof typeof colors] || colors.support}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage portal administrators and their permissions</p>
        </div>
        <Dialog open={newUserDialog} onOpenChange={setNewUserDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin User</DialogTitle>
              <DialogDescription>
                Add a new administrator to the portal with specific role permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="admin">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">Support - Limited access</SelectItem>
                    <SelectItem value="admin">Admin - Full school management</SelectItem>
                    <SelectItem value="super_admin">Super Admin - System control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createAdminMutation.isPending}>
                {createAdminMutation.isPending ? 'Creating...' : 'Create Admin'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Portal Administrators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading administrators...</div>
            ) : admins?.length ? (
              admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{admin.fullName}</h3>
                        {getRoleBadge(admin.role)}
                      </div>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No administrators</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first admin user.</p>
                <Button onClick={() => setNewUserDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Admin
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}