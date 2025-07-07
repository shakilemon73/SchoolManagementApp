import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigation } from '@/lib/navigation';
import { LanguageText } from '@/components/ui/language-text';
import { useMobile } from '@/hooks/use-mobile';

interface NavigationBarProps {
  title?: {
    en: string;
    bn: string;
    ar: string;
  };
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function NavigationBar({ 
  title, 
  showBackButton = true, 
  showHomeButton = true 
}: NavigationBarProps) {
  const { goBack, canGoBack, setLocation } = useNavigation();
  const isMobile = useMobile();

  const handleGoHome = () => {
    setLocation('/');
  };

  const handleGoBack = () => {
    if (canGoBack()) {
      goBack();
    } else {
      // Fallback to browser back
      window.history.back();
    }
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      {/* Back button */}
      {showBackButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGoBack}
          className="flex items-center gap-2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
          {!isMobile && (
            <span>
              <LanguageText
                en="Back"
                bn="পিছনে"
                ar="رجوع"
              />
            </span>
          )}
        </Button>
      )}

      {/* Home button */}
      {showHomeButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoHome}
          className="flex items-center gap-2"
          aria-label="Go to home"
        >
          <Home className="h-4 w-4" />
          {!isMobile && (
            <span>
              <LanguageText
                en="Home"
                bn="হোম"
                ar="الرئيسية"
              />
            </span>
          )}
        </Button>
      )}

      {/* Page title */}
      {title && (
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            <LanguageText
              en={title.en}
              bn={title.bn}
              ar={title.ar}
            />
          </h2>
        </div>
      )}
    </div>
  );
}