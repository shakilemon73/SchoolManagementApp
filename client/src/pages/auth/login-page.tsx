import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, School, Lock, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response;
    },
    onSuccess: (data) => {
      // Redirect to the appropriate portal based on user role
      window.location.href = data.redirectUrl || "/dashboard";
    },
    onError: (error: any) => {
      setLoginError(error.message || "Login failed. Please try again.");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setLoginError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-200/50 dark:border-slate-700/50 shadow-2xl">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-4 rounded-2xl shadow-xl">
                <School className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-green-500 rounded-full border-3 border-white dark:border-slate-900 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              স্বাগতম
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-lg">
              আপনার স্কুল পোর্টালে প্রবেশ করুন
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {loginError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertDescription className="text-red-800 dark:text-red-300">{loginError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-medium">
                ব্যবহারকারীর নাম
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
                <Input
                  id="username"
                  type="text"
                  placeholder="আপনার ব্যবহারকারীর নাম লিখুন"
                  className="pl-12 h-12 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300"
                  {...form.register("username")}
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                পাসওয়ার্ড
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
                <Input
                  id="password"
                  type="password"
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  className="pl-12 h-12 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  প্রবেশ করছি...
                </>
              ) : (
                "প্রবেশ করুন"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">পোর্টাল অ্যাক্সেস</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-3 py-2 rounded-lg font-medium">
                অ্যাডমিন
              </span>
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-lg font-medium">
                অভিভাবক
              </span>
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-2 rounded-lg font-medium">
                শিক্ষার্থী
              </span>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm transition-colors duration-300 underline-offset-4 hover:underline"
            >
              ← হোম পেজে ফিরে যান
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}