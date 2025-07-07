import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  MessageSquare,
  FileText,
  Bus,
  Bell,
  LogOut
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ParentPortal() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const parentModules = [
    {
      title: "Child's Profile",
      description: "View your child's academic information and progress",
      icon: User,
      link: "/child-profile",
      color: "bg-blue-500",
    },
    {
      title: "Academic Progress",
      description: "Track grades, assignments, and exam results",
      icon: BookOpen,
      link: "/academic-progress",
      color: "bg-green-500",
    },
    {
      title: "Attendance",
      description: "Monitor daily attendance and leave applications",
      icon: Calendar,
      link: "/attendance",
      color: "bg-purple-500",
    },
    {
      title: "Fee Management",
      description: "View fee structure, payments, and outstanding dues",
      icon: DollarSign,
      link: "/fees",
      color: "bg-yellow-500",
    },
    {
      title: "Teacher Communication",
      description: "Message teachers and view announcements",
      icon: MessageSquare,
      link: "/communication",
      color: "bg-indigo-500",
    },
    {
      title: "Reports & Certificates",
      description: "Download progress reports and certificates",
      icon: FileText,
      link: "/reports",
      color: "bg-red-500",
    },
    {
      title: "Transport Tracking",
      description: "Track school bus and transport information",
      icon: Bus,
      link: "/transport",
      color: "bg-pink-500",
    },
    {
      title: "Notifications",
      description: "View school announcements and alerts",
      icon: Bell,
      link: "/notifications",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-orange-600 p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Parent Portal
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Monitor Your Child's Education
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {user?.role}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Stay connected with your child's educational journey
          </p>
        </div>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-gray-600">Overall Performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">95%</p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">৳0</p>
                  <p className="text-sm text-gray-600">Outstanding Fees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {parentModules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`${module.color} p-2 rounded-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}