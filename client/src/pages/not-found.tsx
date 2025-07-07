import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";
import { LanguageText } from "@/components/ui/language-text";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
          
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            <LanguageText
              en="Page Not Found"
              bn="পেজ পাওয়া যায়নি"
              ar="الصفحة غير موجودة"
            />
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <LanguageText
              en="The page you're looking for doesn't exist or has been moved."
              bn="আপনি যে পেজটি খুঁজছেন তা বিদ্যমান নেই অথবা সরানো হয়েছে।"
              ar="الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
            />
          </p>

          <Link href="/dashboard">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              <LanguageText
                en="Go to Dashboard"
                bn="ড্যাশবোর্ডে যান"
                ar="اذهب إلى لوحة التحكم"
              />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
