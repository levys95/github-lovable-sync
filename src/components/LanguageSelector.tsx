
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{language === 'lt' ? 'LT' : 'FR'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('lt')}>
          <span className="flex items-center gap-2">
            🇱🇹 {t('language.lithuanian')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('fr')}>
          <span className="flex items-center gap-2">
            🇫🇷 {t('language.french')}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
