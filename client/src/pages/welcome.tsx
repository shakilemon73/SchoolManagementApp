import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { GraduationCap, Users, FileText, Settings } from "lucide-react";

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: "Document Management",
      description: "Generate certificates, admit cards, ID cards, and academic documents"
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Student Management", 
      description: "Manage student records, attendance, fees, and academic progress"
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-purple-600" />,
      title: "Academic System",
      description: "Class routines, exam management, results, and academic reports"
    },
    {
      icon: <Settings className="h-8 w-8 text-orange-600" />,
      title: "School Administration",
      description: "Complete administrative control with user management and settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            School Management System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A comprehensive digital platform for Bangladeshi educational institutions with 
            intelligent document management and advanced technological solutions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Setup Instructions */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                Get Started
              </CardTitle>
              <CardDescription>
                Set up your school management system in just a few steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Create Administrator Account</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Register the first admin user to start managing your school system
                </p>
                <Button 
                  onClick={() => setLocation("/register-admin")}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Create Admin Account
                </Button>
              </div>

              <div className="border-t pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Already Have an Account?</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Sign in to access your dashboard and manage your school
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/login")}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by React, Express.js, PostgreSQL, and Supabase | 
            Bilingual Support (English/Bengali) | 
            Credit-based Document System
          </p>
        </div>
      </div>
    </div>
  );
}