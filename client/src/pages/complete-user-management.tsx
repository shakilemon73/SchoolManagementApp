import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar,
  Shield,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useSupabaseUsers, useSupabaseSignUp } from '@/hooks/use-complete-supabase-migration';
import { useToast } from '@/hooks/use-toast';

export default function CompleteUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  const { toast } = useToast();
  
  // Direct Supabase user management (NO EXPRESS SERVER!)
  const { data: users = [], isLoading, error, refetch } = useSupabaseUsers();
  const createUserMutation = useSupabaseSignUp();

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (formData: FormData) => {
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const fullName = formData.get('fullName')?.toString();
    const role = formData.get('role')?.toString();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      email,
      password,
      userData: {
        full_name: fullName,
        role: role || 'user'
      }
    }, {
      onSuccess: () => {
        setShowCreateUser(false);
        refetch();
      }
    });
  };

  const getRoleBadge = (user: any) => {
    const role = user.user_metadata?.role || 'user';
    const variant = role === 'admin' ? 'destructive' : role === 'teacher' ? 'default' : 'secondary';
    return <Badge variant={variant}>{role}</Badge>;
  };

  const getStatusBadge = (user: any) => {
    const isEmailConfirmed = user.email_confirmed_at;
    return (
      <Badge variant={isEmailConfirmed ? 'default' : 'outline'}>
        {isEmailConfirmed ? 'Active' : 'Pending'}
      </Badge>
    );
  };

  if (error) {
    return (
      <AppShell>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load users. Please check your Supabase configuration.
            </AlertDescription>
          </Alert>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">User Management</h1>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Supabase Only
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowCreateUser(true)}
              size="sm"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Total Users</span>
              </div>
              <p className="text-2xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <p className="text-2xl font-bold">
                {users.filter(u => u.email_confirmed_at).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <p className="text-2xl font-bold">
                {users.filter(u => !u.email_confirmed_at).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Admins</span>
              </div>
              <p className="text-2xl font-bold">
                {users.filter(u => u.user_metadata?.role === 'admin').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Sign In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Loading users...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{user.user_metadata?.full_name || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user)}</TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create User Form */}
        {showCreateUser && (
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input name="email" type="email" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input name="fullName" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <Input name="password" type="password" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select name="role" className="w-full px-3 py-2 border rounded-md">
                      <option value="user">User</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateUser(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}