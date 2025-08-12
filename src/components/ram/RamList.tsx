
import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { MANUFACTURERS, RAM_GENERATIONS, FREQUENCIES_BY_GEN, RamGeneration, RamManufacturer } from './constants';
import { Trash2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
type RamRow = {
  id: string;
  generation: RamGeneration;
  capacity_gb: number;
  frequency_mhz: number;
  manufacturer: RamManufacturer;
  quantity: number;
  images: string[];
  videos: string[];
  files: string[];
  location: string | null;
  notes: string | null;
  created_at: string;
};

export const RamList: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['ram_modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ram_modules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      console.log('Fetched ram_modules:', data);
      return (data || []) as RamRow[];
    },
  });

  const [gen, setGen] = useState<RamGeneration | 'all'>('all');
  const [man, setMan] = useState<RamManufacturer | 'all'>('all');
  const [freq, setFreq] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (gen !== 'all' && r.generation !== gen) return false;
      if (man !== 'all' && r.manufacturer !== man) return false;
      if (freq !== 'all' && r.frequency_mhz !== freq) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const text = `${r.generation} ${r.manufacturer} ${r.capacity_gb} ${r.frequency_mhz} ${r.location || ''} ${r.notes || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rows, gen, man, freq, search]);

  const del = useMutation({
    mutationKey: ['ram_modules', 'delete'],
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ram_modules').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    meta: {
      onError: (err: any) => {
        toast({ title: 'Suppression échouée', description: String(err?.message || err), variant: 'destructive' });
      }
    },
    onSuccess: () => {
      toast({ title: 'Supprimé', description: 'Module supprimé.' });
      qc.invalidateQueries({ queryKey: ['ram_modules'] });
    }
  });

  const updateQty = useMutation({
    mutationKey: ['ram_modules', 'update-qty'],
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await supabase.from('ram_modules').update({ quantity }).eq('id', id);
      if (error) throw error;
      return id;
    },
    meta: {
      onError: (err: any) => {
        toast({ title: 'Mise à jour échouée', description: String(err?.message || err), variant: 'destructive' });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ram_modules'] });
    }
  });

  const fetchAsDataUrl = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url + '?v=2', { cache: 'no-cache' });
      const blob = await res.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  };

  const generatePdf = async (r: RamRow) => {
    const doc = new jsPDF();

    // Logo
    const logo = await fetchAsDataUrl('/lovable-uploads/f49dc73c-6cdf-40f2-8469-c10cb8d64b09.png');
    if (logo) {
      doc.addImage(logo, 'PNG', 15, 12, 28, 28);
    }

    // Title
    doc.setFontSize(16);
    doc.text('Fiche Module RAM', 50, 20);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleString()}`, 50, 27);

    // Table
    const body = [
      ['Génération', r.generation],
      ['Capacité', `${r.capacity_gb} Go`],
      ['Fréquence', `${r.frequency_mhz} MHz`],
      ['Fabricant', r.manufacturer],
      ['Quantité', String(r.quantity)],
      ['Localisation', r.location || '-'],
      ['Notes', r.notes || '-'],
      ['Créé le', new Date(r.created_at).toLocaleString()],
    ];

    autoTable(doc, {
      startY: 45,
      head: [['Champ', 'Valeur']],
      body,
      theme: 'grid',
      styles: { fontSize: 11 },
      headStyles: { fillColor: [23, 37, 84], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    } as any);

    const filename = `RAM_${r.generation}_${r.capacity_gb}Go_${r.frequency_mhz}MHz_${r.manufacturer}.pdf`;
    doc.save(filename);
  };

  const availableFreqs = gen === 'all' ? [] : FREQUENCIES_BY_GEN[gen];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Select onValueChange={(v) => setGen(v as any)} value={gen}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Génération" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {RAM_GENERATIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => setMan(v as any)} value={man}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Fabricant" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {MANUFACTURERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => setFreq(v === 'all' ? 'all' : Number(v))} value={String(freq)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Fréquence" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {availableFreqs.map(f => <SelectItem key={f} value={String(f)}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Génération</TableHead>
              <TableHead>Capacité</TableHead>
              <TableHead>Fréq. (MHz)</TableHead>
              <TableHead>Fabricant</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={7}>Chargement…</TableCell></TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={7}>Aucun résultat</TableCell></TableRow>
            )}
            {!isLoading && filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.generation}</TableCell>
                <TableCell>{r.capacity_gb} Go</TableCell>
                <TableCell>{r.frequency_mhz}</TableCell>
                <TableCell>{r.manufacturer}</TableCell>
                <TableCell className="min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      defaultValue={r.quantity}
                      className="w-24"
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isFinite(v)) return;
                        updateQty.mutate({ id: r.id, quantity: v });
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="max-w-[220px] truncate">{r.location || '-'}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => generatePdf(r)}>
                    <FileText className="h-4 w-4 mr-1" /> PDF
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => del.mutate(r.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
