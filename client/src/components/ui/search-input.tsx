import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function SearchInput() {
  const { language } = useLanguage();
  
  const getPlaceholder = () => {
    switch (language) {
      case 'en':
        return 'Quick search... (Press Ctrl+K)';
      case 'bn':
        return 'দ্রুত খুঁজুন... (Ctrl+K চাপুন)';
      case 'ar':
        return 'البحث السريع... (اضغط Ctrl+K)';
      default:
        return 'দ্রুত খুঁজুন... (Ctrl+K চাপুন)';
    }
  };

  return (
    <Input 
      type="text" 
      placeholder={getPlaceholder()}
      className="pl-10 pr-16 py-2.5 bg-slate-50/80 border-slate-200/80 rounded-lg focus:bg-white focus:border-primary/40 transition-all duration-200"
      aria-label="Global search"
    />
  );
}