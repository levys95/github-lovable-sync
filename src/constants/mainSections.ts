import type { LucideIcon } from 'lucide-react';
import { 
  Computer,
  Cpu,
  Wrench,
} from 'lucide-react';

export interface MainSection {
  id: string;
  name: string;
  nameLt: string;
  description: string;
  descriptionLt: string;
  icon: LucideIcon;
  route: string;
  color: string;
  bgGradient: string;
}

export const mainSections: MainSection[] = [
  {
    id: 'stock-materiels',
    name: 'Stock Matériels Informatiques',
    nameLt: 'IT Įrangos Atsargos',
    description: 'Ordinateurs, serveurs, smartphones, écrans, matériel réseau',
    descriptionLt: 'Kompiuteriai, serveriai, telefonai, ekranai, tinklo įranga',
    icon: Computer,
    route: '/stock-materiels',
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-100 border-blue-200',
  },
  {
    id: 'components',
    name: 'Composants',
    nameLt: 'Komponentai',
    description: 'RAM, processeurs, stockage, cartes graphiques',
    descriptionLt: 'RAM, procesoriai, saugykla, grafikos plokštės',
    icon: Cpu,
    route: '/components',
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-100 border-green-200',
  },
  {
    id: 'pieces-detachees',
    name: 'Pièces Détachées',
    nameLt: 'Atsarginės Dalys',
    description: 'Batteries, écrans, claviers, cartes mères (Dell, HP, Lenovo)',
    descriptionLt: 'Baterijos, ekranai, klaviatūros, pagrindinės plokštės',
    icon: Wrench,
    route: '/pieces-detachees',
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-red-100 border-orange-200',
  },
];