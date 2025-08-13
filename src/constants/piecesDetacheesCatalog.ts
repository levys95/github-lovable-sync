import type { LucideIcon } from 'lucide-react';
import { 
  Battery,
  Monitor,
  Cpu,
  Keyboard,
  Zap,
  HardDrive,
  MousePointer,
  Wrench,
} from 'lucide-react';

export interface PieceDetacheeCategory {
  id: string;
  name: string;
  nameLt: string;
  description: string;
  descriptionLt: string;
  icon: LucideIcon;
  route: string;
  color: string;
  bgGradient: string;
  brands: string[]; // Dell, HP, Lenovo
}

export const pieceDetacheeCategories: PieceDetacheeCategory[] = [
  {
    id: 'batteries',
    name: 'Batteries',
    nameLt: 'Baterijos',
    description: 'Batteries pour portables Dell, HP, Lenovo',
    descriptionLt: 'Dell, HP, Lenovo nešiojamųjų baterijos',
    icon: Battery,
    route: '/pieces-detachees/batteries',
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-red-100 border-orange-200',
    brands: ['Dell', 'HP', 'Lenovo'],
  },
  {
    id: 'laptop-screens',
    name: 'Écrans PC Portables',
    nameLt: 'Nešiojamųjų ekranai',
    description: 'Écrans LCD/LED pour portables - toutes tailles',
    descriptionLt: 'LCD/LED ekranai nešiojamiesiems - visi dydžiai',
    icon: Monitor,
    route: '/pieces-detachees/laptop-screens',
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-violet-100 border-purple-200',
    brands: ['Dell', 'HP', 'Lenovo'],
  },
  {
    id: 'motherboards',
    name: 'Cartes Mères',
    nameLt: 'Pagrindinės plokštės',
    description: 'Cartes mères pour portables et fixes',
    descriptionLt: 'Pagrindinės plokštės nešiojamiesiems ir stacionariems',
    icon: Cpu,
    route: '/pieces-detachees/motherboards',
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-100 border-green-200',
    brands: ['Dell', 'HP', 'Lenovo'],
  },
  {
    id: 'keyboards',
    name: 'Claviers & Touchpads',
    nameLt: 'Klaviatūros ir jutikliai',
    description: 'Claviers et touchpads pour portables',
    descriptionLt: 'Klaviatūros ir jutikliai nešiojamiesiems',
    icon: Keyboard,
    route: '/pieces-detachees/keyboards',
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-100 border-blue-200',
    brands: ['Dell', 'HP', 'Lenovo'],
  },
  {
    id: 'chargers',
    name: 'Chargeurs & Adaptateurs',
    nameLt: 'Krovikliai ir adapteriai',
    description: 'Chargeurs originaux et compatibles',
    descriptionLt: 'Originalūs ir suderinami krovikliai',
    icon: Zap,
    route: '/pieces-detachees/chargers',
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-50 to-amber-100 border-yellow-200',
    brands: ['Dell', 'HP', 'Lenovo'],
  },
  {
    id: 'chassis',
    name: 'Chassis & Coques',
    nameLt: 'Korpusai ir dangteliai',
    description: 'Chassis, coques, panels pour portables/fixes',
    descriptionLt: 'Korpusai, dangteliai, panelės',
    icon: HardDrive,
    route: '/pieces-detachees/chassis',
    color: 'text-slate-600',
    bgGradient: 'from-slate-50 to-gray-100 border-slate-200',
    brands: ['Dell', 'HP', 'Lenovo'],
  },
  {
    id: 'peripherals',
    name: 'Périphériques',
    nameLt: 'Periferija',
    description: 'Webcams, haut-parleurs, ventilateurs',
    descriptionLt: 'Kameros, garsiakalbiai, ventiliatoriai',
    icon: MousePointer,
    route: '/pieces-detachees/peripherals',
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-blue-100 border-indigo-200',
    brands: ['Dell', 'HP', 'Lenovo'],
  },
  {
    id: 'tools',
    name: 'Outils & Accessoires',
    nameLt: 'Įrankiai ir priedai',
    description: 'Outils de réparation, vis, câbles internes',
    descriptionLt: 'Remonto įrankiai, varžtai, vidiniai kabeliai',
    icon: Wrench,
    route: '/pieces-detachees/tools',
    color: 'text-cyan-600',
    bgGradient: 'from-cyan-50 to-teal-100 border-cyan-200',
    brands: ['Dell', 'HP', 'Lenovo'],
  },
];