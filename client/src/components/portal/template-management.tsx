import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Eye, Copy, Settings, Globe, Lock } from 'lucide-react';

interface DocumentTemplate {
  id: number;
  name: string;
  type: string;
  category: string;
  description?: string;
  isGlobal: boolean;
  isActive: boolean;
  requiredCredits: number;
  version: string;
  createdAt: string;
  usage: number;
}

interface TemplateManagementProps {
  authToken: string;
}

export default function TemplateManagement({ authToken }: TemplateManagementProps) {
  const [newTemplateDialog, setNewTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all document templates
  const { data: templates, isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/portal/templates'],
    queryFn: async () => {
      const response = await fetch('/api/portal/templates', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Create new template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await fetch('/api/portal/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(templateData),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/templates'] });
      setNewTemplateDialog(false);
      toast({ title: 'Success', description: 'Template created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await fetch(`/api/portal/templates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/templates'] });
      toast({ title: 'Success', description: 'Template updated successfully' });
    },
  });

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const templateData = {
      name: formData.get('name'),
      type: formData.get('type'),
      category: formData.get('category'),
      description: formData.get('description'),
      requiredCredits: parseInt(formData.get('requiredCredits') as string),
      isGlobal: formData.get('isGlobal') === 'on',
      template: {
        layout: formData.get('layout'),
        fields: JSON.parse(formData.get('fields') as string || '[]'),
        styling: JSON.parse(formData.get('styling') as string || '{}')
      }
    };
    createTemplateMutation.mutate(templateData);
  };

  const toggleTemplateStatus = (template: DocumentTemplate) => {
    updateTemplateMutation.mutate({
      id: template.id,
      updates: { isActive: !template.isActive }
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800',
      administrative: 'bg-green-100 text-green-800',
      financial: 'bg-yellow-100 text-yellow-800',
      communication: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Template Management</h2>
          <p className="text-gray-600">Manage document templates and school access permissions</p>
        </div>
        <Dialog open={newTemplateDialog} onOpenChange={setNewTemplateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Document Template</DialogTitle>
              <DialogDescription>
                Design a new template that schools can use for document generation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Document Type</Label>
                  <Select name="type">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id-card">ID Card</SelectItem>
                      <SelectItem value="fee-receipt">Fee Receipt</SelectItem>
                      <SelectItem value="admit-card">Admit Card</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="report-card">Report Card</SelectItem>
                      <SelectItem value="notice">Notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requiredCredits">Required Credits</Label>
                  <Input id="requiredCredits" name="requiredCredits" type="number" defaultValue="1" min="1" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Brief description of the template" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="layout">Template Layout (HTML)</Label>
                <Textarea 
                  id="layout" 
                  name="layout" 
                  placeholder="Enter HTML template code..."
                  className="min-h-32 font-mono text-sm"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fields">Available Fields (JSON)</Label>
                  <Textarea 
                    id="fields" 
                    name="fields" 
                    placeholder='["studentName", "class", "rollNumber"]'
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="styling">Styling Options (JSON)</Label>
                  <Textarea 
                    id="styling" 
                    name="styling" 
                    placeholder='{"fontSize": "12px", "fontFamily": "Arial"}'
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isGlobal" name="isGlobal" />
                <Label htmlFor="isGlobal">Make available to all schools</Label>
              </div>

              <Button type="submit" className="w-full" disabled={createTemplateMutation.isPending}>
                {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="global">Global Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Templates</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : templates?.length ? (
              templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          {getCategoryBadge(template.category)}
                          {template.isGlobal && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              <Globe className="h-3 w-3 mr-1" />
                              Global
                            </Badge>
                          )}
                          {!template.isActive && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Type:</span> {template.type}</p>
                          <p><span className="font-medium">Credits Required:</span> {template.requiredCredits}</p>
                          <p><span className="font-medium">Version:</span> {template.version}</p>
                          <p><span className="font-medium">Usage:</span> {template.usage || 0} schools</p>
                          {template.description && (
                            <p><span className="font-medium">Description:</span> {template.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedTemplate(template);
                          setPreviewDialog(true);
                        }}>
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-1" />
                          Clone
                        </Button>
                        <Button 
                          variant={template.isActive ? "outline" : "default"} 
                          size="sm"
                          onClick={() => toggleTemplateStatus(template)}
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          {template.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
                  <p className="text-gray-600 mb-4">Create your first document template to get started.</p>
                  <Button onClick={() => setNewTemplateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle>Global Templates</CardTitle>
              <CardDescription>
                Templates available to all schools by default
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Global template management interface would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Templates</CardTitle>
              <CardDescription>
                School-specific templates with restricted access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Custom template management interface would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>
                Manage which schools have access to specific templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Template access control interface would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Preview of how this template will appear to schools
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-auto border rounded p-4 bg-gray-50">
            <div className="bg-white p-6 rounded shadow-sm">
              <p className="text-center text-gray-600">Template preview would be rendered here</p>
              <p className="text-sm text-gray-500 mt-2">Type: {selectedTemplate?.type}</p>
              <p className="text-sm text-gray-500">Category: {selectedTemplate?.category}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}