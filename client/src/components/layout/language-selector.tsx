import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  
  const languageOptions = [
    { code: 'bn' as const, name: 'বাংলা', flag: '🇧🇩' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' }
  ];
  
  const currentLanguage = languageOptions.find(lang => lang.code === language);
  
  const handleLanguageChange = (langCode: 'en' | 'bn' | 'ar') => {
    setLanguage(langCode);
    setOpen(false);
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 h-9 px-3 text-gray-700 hover:text-gray-900"
        >
          <span className="text-base">{currentLanguage?.flag}</span>
          <span className="text-sm font-medium">{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[140px]">
        {languageOptions.map(({ code, name, flag }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`flex items-center gap-2 cursor-pointer ${
              language === code ? 'bg-secondary text-secondary-foreground' : ''
            }`}
          >
            <span className="text-base">{flag}</span>
            <span className="text-sm">{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}