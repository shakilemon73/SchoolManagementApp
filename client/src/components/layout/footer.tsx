import { Link } from 'wouter';
import { LanguageText } from '@/components/ui/language-text';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm text-center md:text-left">
            <p>
              © {currentYear} EduBD Pro. 
              <LanguageText
                en=" All rights reserved."
                bn=" সকল অধিকার সংরক্ষিত।"
                ar=" جميع الحقوق محفوظة."
              />
            </p>
            <p className="mt-1">
              <LanguageText
                en="Developed with ❤️ for Bangladeshi Educational Institutions"
                bn="বাংলাদেশী শিক্ষাপ্রতিষ্ঠানের জন্য ❤️ দিয়ে তৈরি"
                ar="تم التطوير بـ ❤️ للمؤسسات التعليمية البنغلاديشية"
              />
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
              <LanguageText
                en="Privacy Policy"
                bn="গোপনীয়তার নীতি"
                ar="سياسة الخصوصية"
              />
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
              <LanguageText
                en="Terms of Service"
                bn="সেবার শর্তাবলী"
                ar="شروط الخدمة"
              />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-xs">
                <LanguageText
                  en="Built on Replit"
                  bn="রেপ্লিটে তৈরি"
                  ar="مبني على Replit"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}