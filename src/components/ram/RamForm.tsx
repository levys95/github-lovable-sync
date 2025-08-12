
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ImageCapture } from '@/components/ImageCapture';

import { CAPACITIES_GB, FREQUENCIES_BY_GEN, MANUFACTURERS, RAM_GENERATIONS, RamGeneration, RamManufacturer } from './constants';

type FormValues = {
  generation: RamGeneration;
  frequency_mhz: number;
  capacity_gb: number;
  manufacturer: RamManufacturer;
  quantity: number;
  location?: string;
  notes?: string;
};

export const RamForm: React.FC = () => {
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: { quantity: 0 as number } as Partial<FormValues> as FormValues,
  });
  const generation = watch('generation');
  const frequencies = useMemo(() => (generation ? FREQUENCIES_BY_GEN[generation] : []), [generation]);

  const [media, setMedia] = useState<string[]>([]);
  
  const { toast } = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationKey: ['ram_modules', 'insert'],
    mutationFn: async (payload: any) => {
      console.log('Inserting RAM payload:', payload);
      const { data, error } = await supabase.from('ram_modules').insert(payload).select().maybeSingle();
      if (error) throw error;
      return data;
    },
    meta: {
      onError: (err: any) => {
        toast({ title: 'Erreur', description: String(err?.message || err), variant: 'destructive' });
      }
    },
    onSuccess: () => {
      toast({ title: 'RAM ajoutée', description: 'Module enregistré avec succès.' });
      qc.invalidateQueries({ queryKey: ['ram_modules'] });
      // Reset media
      setMedia([]);
    }
  });

  const onSubmit = (values: FormValues) => {
    const images = media.filter((m) => !m.startsWith('data:video/'));
    const videos = media.filter((m) => m.startsWith('data:video/'));
    const payload = {
      generation: values.generation,
      capacity_gb: Number(values.capacity_gb),
      frequency_mhz: Number(values.frequency_mhz),
      manufacturer: values.manufacturer,
      quantity: Number(values.quantity) || 0,
      images,
      videos,
      location: values.location || null,
      notes: values.notes || null,
    };
    mutation.mutate(payload);
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6 space-y-4">
        <h3 className="text-lg font-semibold">Ajouter un module RAM</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Génération</Label>
              <Select onValueChange={(v) => setValue('generation', v as RamGeneration)}>
                <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                <SelectContent>
                  {RAM_GENERATIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fréquence (MHz)</Label>
              <Select onValueChange={(v) => setValue('frequency_mhz', Number(v))} disabled={!generation}>
                <SelectTrigger><SelectValue placeholder={generation ? 'Choisir…' : 'Sélectionnez la génération d’abord'} /></SelectTrigger>
                <SelectContent>
                  {frequencies.map((f) => <SelectItem key={f} value={String(f)}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Capacité (Go)</Label>
              <Select onValueChange={(v) => setValue('capacity_gb', Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                <SelectContent>
                  {CAPACITIES_GB.map((c) => <SelectItem key={c} value={String(c)}>{c} Go</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fabricant</Label>
              <Select onValueChange={(v) => setValue('manufacturer', v as RamManufacturer)}>
                <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                <SelectContent>
                  {MANUFACTURERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantité</Label>
              <Input type="number" min={0} step={1} placeholder="0" {...register('quantity', { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label>Localisation</Label>
              <Input placeholder="Aisle / Rack / Box…" {...register('location')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input placeholder="Notes (facultatif)" {...register('notes')} />
          </div>

          <div className="space-y-2">
            <ImageCapture images={media} onImagesChange={setMedia} maxImages={10} allowVideo={true} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
