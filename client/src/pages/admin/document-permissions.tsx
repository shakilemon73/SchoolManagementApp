import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Save, Settings, Users, Building2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { AppShell } from '@/components/layout/AppShell';
import { ResponsivePageLayout } from '@/components/layout/ResponsivePageLayout';

interface DocumentTemplate {
  id: number;
  name: string;
  nameBn: string;
  category: string;
  icon: string;
  creditsRequired: number;
  isEnabled: boolean;
}

interface User {
  id: number;
  username: string;
  role: string;
  schoolId?: string;
}

interface School {
  id: string;
  name: string;
  nameBn: string;
}

export default function DocumentPermissions() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedTarget, setSelectedTarget] = useState<string>('default');
  const [targetType, setTargetType] = useState<'user' | 'school'>('school');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch all document templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/admin/document-templates'],
    queryFn: async () => {
      const response = await fetch('/api/admin/document-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Fetch document permissions for selected target
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/admin/document-permissions', selectedTarget, targetType],
    queryFn: async () => {
      const response = await fetch(`/api/admin/document-permissions?target=${selectedTarget}&type=${targetType}`);
      if (!response.ok) throw new Error('Failed to fetch permissions');
      return response.json();
    }
  });

  // Fetch users for selection
  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Fetch schools for selection
  const { data: schools = [] } = useQuery({
    queryKey: ['/api/admin/schools'],
    queryFn: async () => {
      const response = await fetch('/api/admin/schools');
      if (!response.ok) throw new Error('Failed to fetch schools');
      return response.json();
    }
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ documentId, isEnabled, creditsOverride }: { 
      documentId: number; 
      isEnabled: boolean; 
      creditsOverride?: number 
    }) => {
      const response = await fetch('/api/admin/document-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: selectedTarget,
          targetType,
          documentId,
          isEnabled,
          creditsOverride
        })
      });
      if (!response.ok) throw new Error('Failed to update permission');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-permissions'] });
      toast({
        title: 'Permission Updated',
        description: 'Document permission has been successfully updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update document permission.',
        variant: 'destructive',
      });
    }
  });

  // Bulk toggle mutation
  const bulkToggleMutation = useMutation({
    mutationFn: async ({ category, isEnabled }: { category: string; isEnabled: boolean }) => {
      const response = await fetch('/api/admin/document-permissions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: selectedTarget,
          targetType,
          category,
          isEnabled
        })
      });
      if (!response.ok) throw new Error('Failed to bulk update permissions');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-permissions'] });
      toast({
        title: 'Bulk Update Complete',
        description: 'All permissions in the category have been updated.',
      });
    }
  });

  // Merge templates with permissions
  const documentsWithPermissions = templates.map((template: any) => {
    const permission = permissions.find((p: any) => p.documentTemplateId === template.id);
    return {
      ...template,
      isEnabled: permission?.isEnabled ?? true,
      creditsOverride: permission?.creditsOverride ?? template.creditsRequired
    };
  });

  // Filter documents
  const filteredDocuments = documentsWithPermissions.filter((doc: any) => {
    const matchesSearch = searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.nameBn.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const documentsByCategory = filteredDocuments.reduce((acc: any, doc: any) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  const categories = [
    { id: 'financial', name: 'Financial Management', nameBn: 'আর্থিক ব্যবস্থাপনা', icon: '💰' },
    { id: 'academic', name: 'Academic Records', nameBn: 'একাডেমিক রেকর্ড', icon: '📊' },
    { id: 'certification', name: 'Certificates & Legal', nameBn: 'সনদপত্র ও আইনি', icon: '📜' },
    { id: 'communication', name: 'Communication', nameBn: 'যোগাযোগ', icon: '📢' },
    { id: 'teaching', name: 'Teaching Resources', nameBn: 'শিক্ষণ সামগ্রী', icon: '📚' },
    { id: 'examination', name: 'Examinations', nameBn: 'পরীক্ষা', icon: '📝' },
    { id: 'identity', name: 'ID Cards & Access', nameBn: 'পরিচয়পত্র', icon: '🎓' },
    { id: 'enrollment', name: 'Admissions', nameBn: 'ভর্তি', icon: '📄' },
    { id: 'support', name: 'Student Support', nameBn: 'শিক্ষার্থী সহায়তা', icon: '🎯' }
  ];

  const handleTogglePermission = (documentId: number, isEnabled: boolean) => {
    updatePermissionMutation.mutate({ documentId, isEnabled });
  };

  const handleCreditsChange = (documentId: number, credits: number) => {
    const doc = documentsWithPermissions.find(d => d.id === documentId);
    updatePermissionMutation.mutate({ 
      documentId, 
      isEnabled: doc?.isEnabled ?? true, 
      creditsOverride: credits 
    });
  };

  const handleBulkToggle = (category: string, isEnabled: boolean) => {
    bulkToggleMutation.mutate({ category, isEnabled });
  };

  return (
    <AppShell>
      <ResponsivePageLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Document Access Control</h1>
              <p className="text-muted-foreground">
                Control which documents users and schools can access
              </p>
            </div>
            <Shield className="h-8 w-8 text-primary" />
          </div>

          {/* Target Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Select Target</span>
              </CardTitle>
              <CardDescription>
                Choose whether to manage permissions for users or schools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Control Type</label>
                  <Select value={targetType} onValueChange={(value: 'user' | 'school') => setTargetType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>School-wide Control</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="user">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Individual User Control</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">
                    {targetType === 'school' ? 'Select School' : 'Select User'}
                  </label>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${targetType}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Settings</SelectItem>
                      {targetType === 'school' ? 
                        schools.map((school: School) => (
                          <SelectItem key={school.id} value={school.id}>
                            {language === 'bn' ? school.nameBn : school.name}
                          </SelectItem>
                        )) :
                        users.map((user: User) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.username} ({user.role})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{language === 'bn' ? category.nameBn : category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Permissions */}
          <div className="space-y-6">
            {Object.entries(documentsByCategory).map(([categoryId, categoryDocs]: [string, any]) => {
              const category = categories.find(c => c.id === categoryId);
              const enabledCount = categoryDocs.filter((doc: any) => doc.isEnabled).length;
              const totalCount = categoryDocs.length;

              return (
                <Card key={categoryId}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category?.icon}</span>
                        <div>
                          <CardTitle>
                            {language === 'bn' ? category?.nameBn : category?.name}
                          </CardTitle>
                          <CardDescription>
                            {enabledCount} of {totalCount} documents enabled
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkToggle(categoryId, true)}
                        >
                          Enable All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkToggle(categoryId, false)}
                        >
                          Disable All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {categoryDocs.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{doc.icon}</span>
                            <div>
                              <div className="font-medium">
                                {language === 'bn' ? doc.nameBn : doc.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {doc.id} • Type: {doc.type}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <label className="text-sm">Credits:</label>
                              <Input
                                type="number"
                                value={doc.creditsOverride}
                                onChange={(e) => handleCreditsChange(doc.id, parseInt(e.target.value) || 1)}
                                className="w-20"
                                min="1"
                                max="100"
                              />
                            </div>
                            <Switch
                              checked={doc.isEnabled}
                              onCheckedChange={(checked) => handleTogglePermission(doc.id, checked)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredDocuments.length === 0 && !templatesLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ResponsivePageLayout>
    </AppShell>
  );
}