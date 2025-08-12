import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { RAM_GENERATIONS, RamGeneration, FREQUENCIES_BY_GEN } from '@/components/ram/constants';

interface RamRowLite {
  generation: RamGeneration;
  frequency_mhz: number;
  quantity: number;
}

export const RamOverviewPanels: React.FC = () => {
  const { data: rows, isLoading, isError } = useQuery({
    queryKey: ['ram-overview-panels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ram_modules')
        .select('generation, frequency_mhz, quantity');
      if (error) throw error;
      return (data || []) as RamRowLite[];
    },
  });

  const grouped = useMemo(() => {
    const base: Record<RamGeneration, { total: number; byFreq: Record<number, number> }> = {
      DDR5: { total: 0, byFreq: {} },
      DDR4: { total: 0, byFreq: {} },
      DDR3: { total: 0, byFreq: {} },
      DDR3L: { total: 0, byFreq: {} },
    };
    (rows || []).forEach((r) => {
      const gen = r.generation as RamGeneration;
      const freq = r.frequency_mhz;
      const qty = Number(r.quantity || 0);
      base[gen].total += qty;
      base[gen].byFreq[freq] = (base[gen].byFreq[freq] || 0) + qty;
    });
    return base;
  }, [rows]);

  const genStyle = (gen: RamGeneration) => {
    const varName = {
      DDR5: '--ram-ddr5',
      DDR4: '--ram-ddr4',
      DDR3: '--ram-ddr3',
      DDR3L: '--ram-ddr3l',
    }[gen] as '--ram-ddr5' | '--ram-ddr4' | '--ram-ddr3' | '--ram-ddr3l';
    return {
      background: `linear-gradient(135deg, hsl(var(${varName}) / 0.08), transparent)`,
      borderColor: `hsl(var(${varName}) / 0.35)`,
    } as React.CSSProperties;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {RAM_GENERATIONS.map((gen) => (
          <Card key={gen} className="border" style={genStyle(gen)}>
            <CardHeader>
              <CardTitle className="text-lg">{gen}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-16 rounded-md bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <section aria-labelledby="ram-overview" className="mb-8">
      <h2 id="ram-overview" className="sr-only">Vue d'ensemble RAM par génération et fréquence</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {RAM_GENERATIONS.map((gen) => {
          const data = grouped[gen];
          const freqs = Object.entries(data.byFreq)
            .map(([f, q]) => ({ freq: Number(f), qty: q }))
            .sort((a, b) => a.freq - b.freq);
          return (
            <Card key={gen} className="border" style={genStyle(gen)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{gen}</CardTitle>
                  <Badge>{data.total}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {freqs.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucune fréquence</div>
                ) : (
                  <ul className="space-y-2">
                    {freqs.map(({ freq, qty }) => (
                      <li key={freq} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{freq} MHz</span>
                        <Badge variant="secondary">{qty}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
