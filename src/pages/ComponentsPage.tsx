import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BurgerMenu } from '@/components/BurgerMenu';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Logo } from '@/components/Logo';
import { 
  LogOut,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { componentCategories } from '@/constants/componentsCatalog';


const ComponentsPage: React.FC = () => {
  const { language } = useLanguage();

  useEffect(() => {
    document.title = 'Tous les Composants | Inventaire Stock Électronique';
    const content = 'Vue d\'ensemble de tous les stocks de composants électroniques : RAM, processeurs, disques durs, écrans et plus.';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = content;

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.origin + '/components';
  }, []);

// ... keep existing code (component grid is driven by componentCategories imported from constants)

  const title = language === 'fr' ? 'Tous les Composants' : 'Visi komponentai';
  const subtitle = language === 'fr' 
    ? 'Explorez notre inventaire complet de composants électroniques' 
    : 'Peržiūrėkite mūsų visą elektronikos komponentų inventorių';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16 relative">
            <div className="flex items-center gap-3">
              <BurgerMenu categories={[]} selectedCategory={null} counts={{}} onSelect={() => {}} />
              <Link to="/" className="flex items-center">
                <Logo className="h-16 w-auto md:h-20" />
              </Link>
            </div>
            <h1 className="hidden sm:block text-xl md:text-2xl font-medium absolute left-1/2 transform -translate-x-1/2">{title}</h1>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  const { supabase } = await import('@/integrations/supabase/client');
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
                className="flex items-center gap-2"
                aria-label="Se déconnecter"
              >
                <span className="hidden sm:inline">Déconnexion</span>
                <LogOut className="h-4 w-4 sm:hidden" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {componentCategories.map((category) => {
            const IconComponent = category.icon;
            const categoryName = language === 'fr' ? category.name : category.nameLt;
            const categoryDescription = language === 'fr' ? category.description : category.descriptionLt;

            return (
              <Card 
                key={category.id}
                className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${category.bgGradient} border-2 cursor-pointer`}
              >
                <Link to={category.route} className="block h-full">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full bg-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className={`h-8 w-8 ${category.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-gray-900">
                      {categoryName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-center text-sm text-gray-600 mb-4 line-clamp-2">
                      {categoryDescription}
                    </CardDescription>
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="group-hover:bg-white group-hover:shadow-md transition-all duration-300"
                      >
                        <span className="mr-2">
                          {language === 'fr' ? 'Voir le stock' : 'Peržiūrėti atsargas'}
                        </span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ComponentsPage;