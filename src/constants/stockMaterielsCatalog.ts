import type { LucideIcon } from 'lucide-react';
import { 
  Laptop,
  Monitor,
  Smartphone,
  Server,
  Wifi,
  Computer as Desktop,
} from 'lucide-react';

export interface StockMaterielCategory {
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

export const stockMaterielCategories: StockMaterielCategory[] = [
  {
    id: 'laptops',
    name: 'Ordinateurs Portables',
    nameLt: 'Nešiojamieji kompiuteriai',
    description: 'Dell, HP, Lenovo - Tous modèles et configurations',
    descriptionLt: 'Dell, HP, Lenovo - Visi modeliai ir konfigūracijos',
    icon: Laptop,
    route: '/stock-materiels/laptops',
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-100 border-blue-200',
  },
  {
    id: 'desktops',
    name: 'Ordinateurs Fixes',
    nameLt: 'Stacionarūs kompiuteriai',
    description: 'PC fixes, workstations, mini PC',
    descriptionLt: 'Stacionarūs PC, darbo stotys, mini PC',
    icon: Desktop,
    route: '/stock-materiels/desktops',
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-100 border-green-200',
  },
  {
    id: 'smartphones',
    name: 'Smartphones',
    nameLt: 'Išmanieji telefonai',
    description: 'iPhone, Samsung, Huawei et autres marques',
    descriptionLt: 'iPhone, Samsung, Huawei ir kiti prekės ženklai',
    icon: Smartphone,
    route: '/stock-materiels/smartphones',
    color: 'text-rose-600',
    bgGradient: 'from-rose-50 to-pink-100 border-rose-200',
  },
  {
    id: 'monitors',
    name: 'Écrans & Moniteurs',
    nameLt: 'Ekranai ir monitoriai',
    description: 'LCD, LED, OLED - Toutes tailles et résolutions',
    descriptionLt: 'LCD, LED, OLED - Visi dydžiai ir raiškos',
    icon: Monitor,
    route: '/stock-materiels/monitors',
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-yellow-100 border-amber-200',
  },
  {
    id: 'servers',
    name: 'Serveurs',
    nameLt: 'Serveriai',
    description: 'Serveurs rack, tower, lames - Dell, HP',
    descriptionLt: 'Rack, tower, blade serveriai - Dell, HP',
    icon: Server,
    route: '/stock-materiels/servers',
    color: 'text-slate-600',
    bgGradient: 'from-slate-50 to-gray-100 border-slate-200',
  },
  {
    id: 'networking',
    name: 'Matériel Réseau',
    nameLt: 'Tinklo įranga',
    description: 'Switches, routeurs, points d\'accès, firewalls',
    descriptionLt: 'Jungikliai, maršrutizatoriai, prieigos taškai',
    icon: Wifi,
    route: '/stock-materiels/networking',
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-green-100 border-emerald-200',
  },
];