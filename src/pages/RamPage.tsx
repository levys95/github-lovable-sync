
import React from 'react';
import { RamForm } from '@/components/ram/RamForm';
import { RamList } from '@/components/ram/RamList';
import { Card, CardContent } from '@/components/ui/card';

const RamPage: React.FC = () => {
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
