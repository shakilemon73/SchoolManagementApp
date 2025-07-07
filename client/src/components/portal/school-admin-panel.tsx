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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  School,
  FileText,
  Settings,
  Edit,
  Trash2,
  Download,
  Upload,
  BookOpen,
  Calendar,
  CreditCard,
  Shield,
  Eye
} from 'lucide-react';

interface SchoolAdminPanelProps {
  schoolId: string;
  schoolName: string;
  authToken: string;
  onClose: () => void;
}

interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  rollNumber: string;
  fatherName: string;
  motherName: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

interface Teacher {
  id: number;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  classes: string[];
  designation: string;
  isActive: boolean;
  createdAt: string;
}

interface Class {
  id: number;
  className: string;
  section: string;
  teacherId: number;
  studentCount: number;
  subjects: string[];
}

export default function SchoolAdminPanel({ schoolId, schoolName, authToken, onClose }: SchoolAdminPanelProps) {
  const [activeTab, setActiveTab] = useState('students');
  const [newStudentDialog, setNewStudentDialog] = useState(false);
  const [newTeacherDialog, setNewTeacherDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch school students
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/portal/schools', schoolId, 'students'],
    queryFn: async () => {
      const response = await fetch(`/api/portal/schools/${schoolId}/students`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    }
  });

  // Fetch school teachers
  const { data: teachers, isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ['/api/portal/schools', schoolId, 'teachers'],
    queryFn: async () => {
      const response = await fetch(`/api/portal/schools/${schoolId}/teachers`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    }
  });

  // Fetch school classes
  const { data: classes, isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ['/api/portal/schools', schoolId, 'classes'],
    queryFn: async () => {
      const response = await fetch(`/api/portal/schools/${schoolId}/classes`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const response = await fetch(`/api/portal/schools/${schoolId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) throw new Error('Failed to add student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/schools', schoolId, 'students'] });
      setNewStudentDialog(false);
      toast({ title: 'Success', description: 'Student added successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Add teacher mutation
  const addTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      const response = await fetch(`/api/portal/schools/${schoolId}/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(teacherData),
      });
      if (!response.ok) throw new Error('Failed to add teacher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/schools', schoolId, 'teachers'] });
      setNewTeacherDialog(false);
      toast({ title: 'Success', description: 'Teacher added successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update user status mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ type, id, updates }: { type: 'student' | 'teacher'; id: number; updates: any }) => {
      const response = await fetch(`/api/portal/schools/${schoolId}/${type}s/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(`Failed to update ${type}`);
      return response.json();
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/schools', schoolId, `${type}s`] });
      toast({ title: 'Success', description: 'User updated successfully' });
    },
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const studentData = Object.fromEntries(formData);
    addStudentMutation.mutate(studentData);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const teacherData = Object.fromEntries(formData);
    addTeacherMutation.mutate(teacherData);
  };

  const toggleUserStatus = (type: 'student' | 'teacher', user: any) => {
    updateUserMutation.mutate({
      type,
      id: user.id,
      updates: { isActive: !user.isActive }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            School Administration - {schoolName}
          </DialogTitle>
          <DialogDescription>
            Complete administrative control over school users and data
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="students" className="space-y-4 m-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Student Management</h3>
                  <p className="text-sm text-gray-600">{students?.length || 0} total students</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Import
                  </Button>
                  <Dialog open={newStudentDialog} onOpenChange={setNewStudentDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddStudent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID</Label>
                            <Input id="studentId" name="studentId" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="class">Class</Label>
                            <Select name="class">
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Class 1</SelectItem>
                                <SelectItem value="2">Class 2</SelectItem>
                                <SelectItem value="3">Class 3</SelectItem>
                                <SelectItem value="4">Class 4</SelectItem>
                                <SelectItem value="5">Class 5</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="section">Section</Label>
                            <Select name="section">
                              <SelectTrigger>
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">Section A</SelectItem>
                                <SelectItem value="B">Section B</SelectItem>
                                <SelectItem value="C">Section C</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rollNumber">Roll Number</Label>
                            <Input id="rollNumber" name="rollNumber" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fatherName">Father's Name</Label>
                            <Input id="fatherName" name="fatherName" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="motherName">Mother's Name</Label>
                            <Input id="motherName" name="motherName" required />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={addStudentMutation.isPending}>
                          {addStudentMutation.isPending ? 'Adding...' : 'Add Student'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {studentsLoading ? (
                      <div className="text-center py-8">Loading students...</div>
                    ) : students?.length ? (
                      <div className="space-y-2">
                        {students.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                                <GraduationCap className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{student.name}</h4>
                                  <Badge variant="outline">{student.studentId}</Badge>
                                  {!student.isActive && <Badge variant="secondary">Inactive</Badge>}
                                </div>
                                <p className="text-sm text-gray-600">
                                  Class {student.class}-{student.section} | Roll: {student.rollNumber}
                                </p>
                                <p className="text-xs text-gray-500">{student.email} | {student.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant={student.isActive ? "outline" : "default"} 
                                size="sm"
                                onClick={() => toggleUserStatus('student', student)}
                              >
                                {student.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
                        <p className="text-gray-600 mb-4">Add students to get started.</p>
                        <Button onClick={() => setNewStudentDialog(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add First Student
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teachers" className="space-y-4 m-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Teacher Management</h3>
                  <p className="text-sm text-gray-600">{teachers?.length || 0} total teachers</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Dialog open={newTeacherDialog} onOpenChange={setNewTeacherDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Teacher
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Teacher</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddTeacher} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="teacherName">Full Name</Label>
                            <Input id="teacherName" name="name" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teacherId">Teacher ID</Label>
                            <Input id="teacherId" name="teacherId" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="teacherEmail">Email</Label>
                            <Input id="teacherEmail" name="email" type="email" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teacherPhone">Phone</Label>
                            <Input id="teacherPhone" name="phone" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Select name="designation">
                              <SelectTrigger>
                                <SelectValue placeholder="Select designation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="senior_teacher">Senior Teacher</SelectItem>
                                <SelectItem value="head_teacher">Head Teacher</SelectItem>
                                <SelectItem value="principal">Principal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={addTeacherMutation.isPending}>
                          {addTeacherMutation.isPending ? 'Adding...' : 'Add Teacher'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {teachersLoading ? (
                      <div className="text-center py-8">Loading teachers...</div>
                    ) : teachers?.length ? (
                      <div className="space-y-2">
                        {teachers.map((teacher) => (
                          <div key={teacher.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                                <Users className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{teacher.name}</h4>
                                  <Badge variant="outline">{teacher.teacherId}</Badge>
                                  {!teacher.isActive && <Badge variant="secondary">Inactive</Badge>}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {teacher.subject} | {teacher.designation}
                                </p>
                                <p className="text-xs text-gray-500">{teacher.email} | {teacher.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant={teacher.isActive ? "outline" : "default"} 
                                size="sm"
                                onClick={() => toggleUserStatus('teacher', teacher)}
                              >
                                {teacher.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers yet</h3>
                        <p className="text-gray-600 mb-4">Add teachers to get started.</p>
                        <Button onClick={() => setNewTeacherDialog(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add First Teacher
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes" className="space-y-4 m-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Class Management</h3>
                  <p className="text-sm text-gray-600">{classes?.length || 0} total classes</p>
                </div>
                <Button size="sm">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Add Class
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classesLoading ? (
                  <div className="col-span-full text-center py-8">Loading classes...</div>
                ) : classes?.length ? (
                  classes.map((cls) => (
                    <Card key={cls.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{cls.className}-{cls.section}</CardTitle>
                        <CardDescription>{cls.studentCount} students</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm"><span className="font-medium">Teacher ID:</span> {cls.teacherId}</p>
                          <p className="text-sm"><span className="font-medium">Subjects:</span> {cls.subjects?.join(', ')}</p>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                    <p className="text-gray-600 mb-4">Create classes to organize students and teachers.</p>
                    <Button>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Create First Class
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Document Management</CardTitle>
                  <CardDescription>Manage school documents and templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col">
                      <FileText className="h-5 w-5 mb-1" />
                      <span className="text-xs">ID Cards</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col">
                      <FileText className="h-5 w-5 mb-1" />
                      <span className="text-xs">Certificates</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col">
                      <FileText className="h-5 w-5 mb-1" />
                      <span className="text-xs">Report Cards</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col">
                      <FileText className="h-5 w-5 mb-1" />
                      <span className="text-xs">Admit Cards</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 m-0">
              <Card>
                <CardHeader>
                  <CardTitle>School Settings</CardTitle>
                  <CardDescription>Configure school preferences and limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">System Limits</h3>
                        <div className="space-y-2">
                          <Label htmlFor="maxStudents">Maximum Students</Label>
                          <Input id="maxStudents" type="number" defaultValue="500" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxTeachers">Maximum Teachers</Label>
                          <Input id="maxTeachers" type="number" defaultValue="50" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-medium">Features</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Parent Portal</span>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>SMS Notifications</span>
                            <Switch />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Online Payments</span>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Student List Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Attendance Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Performance Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Fee Collection Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Outstanding Dues
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Payment History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}