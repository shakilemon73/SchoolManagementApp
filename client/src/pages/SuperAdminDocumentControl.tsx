import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Shield, 
  Plus, 
  Trash2, 
  Search, 
  Building2, 
  FileText, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LanguageText } from '@/components/ui/language-text';

interface School {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
}

interface DocumentType {
  id: number;
  name: string;
  nameBn: string;
  category: string;
  subcategory: string;
  description: string;
  isActive: boolean;
  creditsRequired: number;
}

interface Permission {
  id: number;
  schoolId: number;
  documentTypeId: number;
  isAllowed: boolean;
  creditsPerUse: number;
  grantedAt: string;
  grantedBy: string;
  notes: string;
  schoolName: string;
  documentName: string;
}

export default function SuperAdminDocumentControl() {
  const [schools, setSchools] = useState<School[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<number | null>(null);
  const [creditsPerUse, setCreditsPerUse] = useState(1);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load schools, document types, and permissions
      const [schoolsRes, documentsRes, permissionsRes] = await Promise.all([
        fetch('/api/super-admin/schools'),
        fetch('/api/super-admin/document-types'),
        fetch('/api/super-admin/schools/permissions')
      ]);

      if (schoolsRes.ok) {
        const schoolsData = await schoolsRes.json();
        setSchools(schoolsData);
      }

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json();
        setDocumentTypes(documentsData);
      }

      if (permissionsRes.ok) {
        const permissionsData = await permissionsRes.json();
        setPermissions(permissionsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const grantPermission = async () => {
    if (!selectedSchool || !selectedDocumentType) {
      toast({
        title: "Error",
        description: "Please select both school and document type.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/super-admin/schools/${selectedSchool}/grant-document/${selectedDocumentType}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creditsPerUse,
            notes,
            grantedBy: 'provider-admin'
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document permission granted successfully.",
        });
        setIsGrantDialogOpen(false);
        setSelectedDocumentType(null);
        setCreditsPerUse(1);
        setNotes('');
        loadData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to grant permission');
      }
    } catch (error) {
      console.error('Error granting permission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to grant permission",
        variant: "destructive"
      });
    }
  };

  const revokePermission = async (schoolId: number, documentTypeId: number) => {
    try {
      const response = await fetch(
        `/api/super-admin/schools/${schoolId}/revoke-document/${documentTypeId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document permission revoked successfully.",
        });
        loadData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to revoke permission');
      }
    } catch (error) {
      console.error('Error revoking permission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke permission",
        variant: "destructive"
      });
    }
  };

  const grantBulkPermissions = async (schoolId: number, documentTypeIds: number[]) => {
    try {
      const response = await fetch(
        `/api/super-admin/schools/${schoolId}/bulk-permissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentTypeIds,
            creditsPerUse: 1,
            grantedBy: 'provider-admin'
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: `Bulk permissions granted for ${documentTypeIds.length} document types.`,
        });
        loadData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to grant bulk permissions');
      }
    } catch (error) {
      console.error('Error granting bulk permissions:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to grant bulk permissions",
        variant: "destructive"
      });
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSchoolPermissions = (schoolId: number) => {
    return permissions.filter(p => p.schoolId === schoolId && p.isAllowed);
  };

  const getDocumentTypePermission = (schoolId: number, documentTypeId: number) => {
    return permissions.find(p => 
      p.schoolId === schoolId && 
      p.documentTypeId === documentTypeId && 
      p.isAllowed
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading provider control panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Provider Document Control</h1>
          </div>
          <p className="text-gray-600">
            Manage document type permissions for all schools in your network. 
            Control which document types each school can access and use.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{schools.length}</p>
                  <p className="text-sm text-gray-600">Total Schools</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{documentTypes.length}</p>
                  <p className="text-sm text-gray-600">Document Types</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{permissions.filter(p => p.isAllowed).length}</p>
                  <p className="text-sm text-gray-600">Active Permissions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(permissions.filter(p => p.isAllowed).map(p => p.schoolId)).size}
                  </p>
                  <p className="text-sm text-gray-600">Schools with Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              <LanguageText
                en="School Management"
                bn="স্কুল ব্যবস্থাপনা"
                ar="إدارة المدرسة"
              />
            </CardTitle>
            <CardDescription>
              Search and manage document permissions for individual schools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search schools by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Grant Permission
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      <LanguageText
                        en="Grant Document Permission"
                        bn="ডকুমেন্টের অনুমতি প্রদান করুন"
                        ar="منح إذن الوثيقة"
                      />
                    </DialogTitle>
                    <DialogDescription>
                      Allow a school to access a specific document type
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="school">School</Label>
                      <Select value={selectedSchool?.toString()} onValueChange={(value) => setSelectedSchool(Number(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school" />
                        </SelectTrigger>
                        <SelectContent>
                          {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id.toString()}>
                              {school.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="documentType">Document Type</Label>
                      <Select value={selectedDocumentType?.toString()} onValueChange={(value) => setSelectedDocumentType(Number(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id.toString()}>
                              {doc.name} ({doc.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="credits">Credits Per Use</Label>
                      <Input
                        id="credits"
                        type="number"
                        min="1"
                        value={creditsPerUse}
                        onChange={(e) => setCreditsPerUse(Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about this permission..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGrantDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={grantPermission}>
                      Grant Permission
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Schools Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Allowed Documents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => {
                  const schoolPermissions = getSchoolPermissions(school.id);
                  return (
                    <TableRow key={school.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{school.name}</div>
                          <div className="text-sm text-gray-500">ID: {school.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{school.email}</div>
                          <div className="text-sm text-gray-500">{school.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                          {school.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{schoolPermissions.length}</span>
                          <span className="text-sm text-gray-500">/ {documentTypes.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedSchool(school.id);
                              setIsGrantDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Grant
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const allDocIds = documentTypes.map(d => d.id);
                              grantBulkPermissions(school.id, allDocIds);
                            }}
                          >
                            Grant All
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Document Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>
              Detailed view of which schools have access to which document types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Document Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Credits Required</TableHead>
                    <TableHead>Schools with Access</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentTypes.map((docType) => {
                    const schoolsWithAccess = permissions.filter(
                      p => p.documentTypeId === docType.id && p.isAllowed
                    );
                    
                    return (
                      <TableRow key={docType.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{docType.name}</div>
                            <div className="text-sm text-gray-500">{docType.nameBn}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {docType.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{docType.creditsRequired}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{schoolsWithAccess.length}</span>
                            <span className="text-sm text-gray-500">/ {schools.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedDocumentType(docType.id);
                              setIsGrantDialogOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}