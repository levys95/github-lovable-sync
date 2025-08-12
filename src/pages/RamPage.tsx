
import React, { useEffect } from 'react';
import { RamForm } from '@/components/ram/RamForm';
import { RamList } from '@/components/ram/RamList';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Stock RAM</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RamForm />
        <Card>
          <CardContent className="p-4 md:p-6 space-y-4">
            <h3 className="text-lg font-semibold">Inventaire</h3>
            <RamList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RamPage;
