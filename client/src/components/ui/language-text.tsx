import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface LanguageTextProps {
  en: string;
  bn: string;
  ar: string;
  className?: string;
}

export function LanguageText({ en, bn, ar, className }: LanguageTextProps) {
  const { language } = useLanguage();
  
  const getText = () => {
    switch (language) {
      case 'en':
        return en;
      case 'bn':
        return bn;
      case 'ar':
        return ar;
      default:
        return bn; // Default to Bengali
    }
  };
  
  return <span className={className}>{getText()}</span>;
}

// Convenience components for specific languages
export function BnText({ children, className }: { children: string; className?: string }) {
  const { language } = useLanguage();
  return language === 'bn' ? <span className={className}>{children}</span> : null;
}

export function EnText({ children, className }: { children: string; className?: string }) {
  const { language } = useLanguage();
  return language === 'en' ? <span className={className}>{children}</span> : null;
}

export function ArText({ children, className }: { children: string; className?: string }) {
  const { language } = useLanguage();
  return language === 'ar' ? <span className={className}>{children}</span> : null;
}