import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Settings, 
  BarChart3, 
  FileText,
  Calendar,
  Bell,
  LogOut,
  Database
} from "lucide-react";
import { Link } from "wouter";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminPortal() {
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const adminModules = [
    {
      title: "Student Management",
      description: "Manage student records, admissions, and profiles",
      icon: Users,
      link: "/students",
      color: "bg-blue-500",
    },
    {
      title: "Teacher Management", 
      description: "Handle teacher profiles, assignments, and schedules",
      icon: GraduationCap,
      link: "/teachers",
      color: "bg-green-500",
    },
    {
      title: "Academic Management",
      description: "Classes, subjects, exams, and results",
      icon: BookOpen,
      link: "/academic",
      color: "bg-purple-500",
    },
    {
      title: "Financial Management",
      description: "Fee collection, payments, and financial reports",
      icon: BarChart3,
      link: "/financial",
      color: "bg-yellow-500",
    },
    {
      title: "Library System",
      description: "Book inventory, issue/return tracking",
      icon: FileText,
      link: "/library",
      color: "bg-indigo-500",
    },
    {
      title: "Transport Management",
      description: "Vehicle tracking, route management",
      icon: Calendar,
      link: "/transport",
      color: "bg-red-500",
    },
    {
      title: "Notifications",
      description: "Send announcements and alerts",
      icon: Bell,
      link: "/notifications",
      color: "bg-pink-500",
    },
    {
      title: "System Settings",
      description: "School configuration and user management",
      icon: Settings,
      link: "/settings",
      color: "bg-gray-500",
    },
    {
      title: "Supabase Admin",
      description: "Manage separate Supabase instances for schools",
      icon: Database,
      link: "/standalone-admin",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Admin Portal
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  School Management System
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
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
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
            Welcome back, {user?.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your school's operations from this central dashboard
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminModules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <Link key={index} href={module.link}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
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
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}