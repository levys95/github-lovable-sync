import type { LucideIcon } from 'lucide-react';
import { 
  MemoryStick,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Laptop,
  Server,
  Battery,
  Wifi,
  Cable,
} from 'lucide-react';

export interface ComponentCategory {
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

export const componentCategories: ComponentCategory[] = [
  {
    id: 'ram',
    name: 'Mémoire RAM',
    nameLt: 'RAM atmintis',
    description: 'DDR5, DDR4, DDR3, DDR3L - Toutes fréquences et capacités',
    descriptionLt: 'DDR5, DDR4, DDR3, DDR3L - Visi dažniai ir talpumai',
    icon: MemoryStick,
    route: '/ram',
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-100 border-blue-200',
  },
  {
    id: 'processors',
    name: 'Processeurs',
    nameLt: 'Procesoriai',
    description: 'CPU Intel, AMD - Socket LGA, AM4, AM5',
    descriptionLt: 'CPU Intel, AMD - Socket LGA, AM4, AM5',
    icon: Cpu,
    route: '/processeurs',
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-100 border-green-200',
  },
  {
    id: 'storage',
    name: 'Stockage',
    nameLt: 'Saugykla',
    description: 'SSD, HDD, M.2 NVMe - Toutes capacités',
    descriptionLt: 'SSD, HDD, M.2 NVMe - Visi talpumai',
    icon: HardDrive,
    route: '/storage',
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-violet-100 border-purple-200',
  },
  {
    id: 'monitors',
    name: 'Écrans',
    nameLt: 'Ekranai',
    description: 'Moniteurs LCD, LED, OLED - Toutes tailles',
    descriptionLt: 'LCD, LED, OLED monitoriai - Visi dydžiai',
    icon: Monitor,
    route: '/monitors',
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-yellow-100 border-amber-200',
  },
  {
    id: 'smartphones',
    name: 'Smartphones',
    nameLt: 'Išmanieji telefonai',
    description: 'iPhone, Samsung, Huawei et autres marques',
    descriptionLt: 'iPhone, Samsung, Huawei ir kiti prekės ženklai',
    icon: Smartphone,
    route: '/smartphones',
    color: 'text-rose-600',
    bgGradient: 'from-rose-50 to-pink-100 border-rose-200',
  },
  {
    id: 'laptops',
    name: 'Ordinateurs Portables',
    nameLt: 'Nešiojamieji kompiuteriai',
    description: 'PC portables, MacBook, Ultrabooks',
    descriptionLt: 'PC nešiojamieji, MacBook, Ultrabooks',
    icon: Laptop,
    route: '/laptops',
    color: 'text-cyan-600',
    bgGradient: 'from-cyan-50 to-teal-100 border-cyan-200',
  },
  {
    id: 'servers',
    name: 'Serveurs',
    nameLt: 'Serveriai',
    description: 'Serveurs rack, tower, lames',
    descriptionLt: 'Rack, tower, blade serveriai',
    icon: Server,
    route: '/servers',
    color: 'text-slate-600',
    bgGradient: 'from-slate-50 to-gray-100 border-slate-200',
  },
  {
    id: 'batteries',
    name: 'Batteries',
    nameLt: 'Baterijos',
    description: 'Batteries lithium, plomb, NiMH',
    descriptionLt: 'Ličio, švino, NiMH baterijos',
    icon: Battery,
    route: '/batteries',
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-red-100 border-orange-200',
  },
  {
    id: 'networking',
    name: 'Réseau',
    nameLt: 'Tinklo įranga',
    description: 'Routeurs, switches, points d\'accès',
    descriptionLt: 'Maršrutizatoriai, jungikliai, prieigos taškai',
    icon: Wifi,
    route: '/networking',
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-green-100 border-emerald-200',
  },
  {
    id: 'cables',
    name: 'Câbles & Accessoires',
    nameLt: 'Kabeliai ir priedai',
    description: 'USB, HDMI, Ethernet, alimentations',
    descriptionLt: 'USB, HDMI, Ethernet, maitinimo šaltiniai',
    icon: Cable,
    route: '/cables',
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-blue-100 border-indigo-200',
  },
];
