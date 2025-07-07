import { useState, useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useDesignSystem } from '@/hooks/use-design-system';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { UXProvider } from '@/components/ux-system';
import TeacherAuth, { TeacherAuthContext } from './teacher-auth';
import TeacherPortalHome from './index';
import TeacherDashboard from './teacher-dashboard';
import AttendanceManagement from './attendance-management';
import LessonPlanning from './lesson-planning';
import AssignmentManagement from './assignment-management';

// Separate query client for teacher portal
const teacherQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Teacher Portal Layout Component
const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
  const [teacher] = useState(() => TeacherAuthContext.init());
  
  const handleLogout = () => {
    TeacherAuthContext.logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Teacher Navigation Header - Enhanced with UX Design System */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-xl md:text-2xl font-bold text-primary leading-snug">
                  শিক্ষক পোর্টাল
                </h1>
              </div>
              <nav className="hidden md:flex space-x-2">
                <a href="/teacher" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  হোম
                </a>
                <a href="/teacher/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  ড্যাশবোর্ড
                </a>
                <a href="/teacher/attendance" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  উপস্থিতি
                </a>
                <a href="/teacher/lesson-plans" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  পাঠ পরিকল্পনা
                </a>
                <a href="/teacher/assignments" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  অ্যাসাইনমেন্ট
                </a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm md:text-base text-slate-700 leading-relaxed">
                স্বাগতম, {teacher?.name || 'শিক্ষক'}
              </div>
              <button
                onClick={handleLogout}
                className="bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                লগআউট
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

// Protected Route Component for Teacher Portal
const TeacherProtectedRoute = ({ component: Component, ...props }: any) => {
  const teacher = TeacherAuthContext.init();
  
  if (!teacher) {
    return null; // Will be handled by main TeacherApp component
  }
  
  return (
    <TeacherLayout>
      <Component {...props} />
    </TeacherLayout>
  );
};

// Main Teacher Application Component
export default function TeacherApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);

  // Initialize UX design system
  useDesignSystem();

  useEffect(() => {
    const storedTeacher = TeacherAuthContext.init();
    if (storedTeacher) {
      setIsAuthenticated(true);
      setTeacher(storedTeacher);
    }
  }, []);

  const handleAuthenticated = (teacherData: any) => {
    setIsAuthenticated(true);
    setTeacher(teacherData);
  };

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={teacherQueryClient}>
        <LanguageProvider>
          <UXProvider>
            <TeacherAuth onAuthenticated={handleAuthenticated} />
            <Toaster />
          </UXProvider>
        </LanguageProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={teacherQueryClient}>
      <LanguageProvider>
        <UXProvider>
          <div className="teacher-portal-app">
            <Switch>
              {/* Teacher Portal Routes */}
              <TeacherProtectedRoute path="/teacher" component={TeacherPortalHome} />
              <TeacherProtectedRoute path="/teacher/dashboard" component={TeacherDashboard} />
              <TeacherProtectedRoute path="/teacher/attendance" component={AttendanceManagement} />
              <TeacherProtectedRoute path="/teacher/lesson-plans" component={LessonPlanning} />
              <TeacherProtectedRoute path="/teacher/assignments" component={AssignmentManagement} />
            </Switch>
          </div>
          <Toaster />
        </UXProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}