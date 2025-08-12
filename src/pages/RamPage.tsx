
import React, { useEffect } from 'react';
import { RamForm } from '@/components/ram/RamForm';
import { RamList } from '@/components/ram/RamList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BurgerMenu } from '@/components/BurgerMenu';
import { LanguageSelector } from '@/components/LanguageSelector';
import { RamOverviewPanels } from '@/components/ram/RamOverviewPanels';
import { Logo } from '@/components/Logo';
import { FileText } from 'lucide-react';

const RamPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Stock RAM | Inventaire DDR5, DDR4, DDR3, DDR3L';
    const content = 'Stock RAM: DDR5, DDR4, DDR3, DDR3L avec fréquences, capacités, fabricants, photos et fichiers.';
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
    link.href = window.location.origin + '/ram';
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center gap-3">
              <BurgerMenu categories={[]} selectedCategory={null} counts={{}} onSelect={() => {}} />
              <Logo className="h-14 w-auto md:h-16" />
              <h1 className="hidden sm:block text-xl md:text-2xl font-bold">Stock RAM</h1>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <RamOverviewPanels />

        <section aria-labelledby="ram-form-list">
          <h2 id="ram-form-list" className="sr-only">Formulaire d'ajout et inventaire RAM</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RamForm />
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Inventaire</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.dispatchEvent(new CustomEvent('generate-full-ram-pdf'))}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    PDF Complet
                  </Button>
                </div>
                <RamList />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RamPage;
