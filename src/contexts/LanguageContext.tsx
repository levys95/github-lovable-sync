
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'lt' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  lt: {
    // Header
    'header.title': 'Gestionnaire Entrepôt E-Déchets',
    'header.addItem': 'Pridėti Prekę',
    
    // Statistics
    'stats.ready': 'Paruošti Daiktai',
    'stats.waiting': 'Laukia Rūšiavimo',
    'stats.unknown': 'Nežinomi Daiktai',
    'stats.total': 'Viso Daiktų',
    'stats.grossWeight': 'Bendras Svoris',
    'stats.netWeight': 'Grynasis',
    
    // Search and filters
    'search.placeholder': 'Ieškoti prekių, prekių ženklų, modelių arba siuntų numerių...',
    'filter.allCategories': 'Visos Kategorijos',
    
    // Empty state
    'empty.title': 'Prekių nerasta',
    'empty.description': 'Pabandykite keisti paieškos arba filtravimo kriterijus.',
    'empty.descriptionNoItems': 'Pradėkite pridėdami pirmą inventoriaus prekę.',
    'empty.addFirst': 'Pridėti Pirmą Prekę',
    
    // Dialog
    'dialog.edit': 'Redaguoti Prekę',
    'dialog.add': 'Pridėti Naują Prekę',
    'dialog.category': 'Kategorija',
    'dialog.selectCategory': 'Pasirinkti kategoriją',
    'dialog.metalContent': 'Metalų Turinys:',
    'dialog.condition': 'Būklė',
    'dialog.ready': 'Paruošta',
    'dialog.waitingSorting': 'Laukia Rūšiavimo',
    'dialog.unknown': 'Nežinoma',
    'dialog.dateAdded': 'Pridėjimo Data',
    'dialog.shipmentNumber': 'Siuntimo Numeris',
    'dialog.weightInfo': 'Svorio Informacija (kg)',
    'dialog.totalWeight': 'Bendras Svoris (kg)',
    'dialog.bigBagWeight': 'Big Bag Svoris (kg)',
    'dialog.palletWeight': 'Paletės Svoris (kg)',
    'dialog.netWeight': 'Grynasis Svoris:',
    'dialog.location': 'Vietos Zona',
    'dialog.selectLocation': 'Pasirinkti vietos zoną',
    'dialog.description': 'Aprašymas',
    'dialog.descriptionPlaceholder': 'Papildoma informacija apie prekę...',
    'dialog.cancel': 'Atšaukti',
    'dialog.update': 'Atnaujinti Prekę',
    'dialog.addItem': 'Pridėti Prekę',
    
    // Confirmation dialog
    'confirm.title': 'Patvirtinti Šalinimą',
    'confirm.description': 'Ar tikrai norite ištrinti šį elementą "{category}"? Šis veiksmas negali būti atšauktas.',
    'confirm.cancel': 'Atšaukti',
    'confirm.delete': 'Ištrinti',
    
    // Language
    'language.lithuanian': 'Lietuvių',
    'language.french': 'Prancūzų',
  },
  fr: {
    // Header
    'header.title': 'Gestionnaire Entrepôt E-Déchets',
    'header.addItem': 'Ajouter Article',
    
    // Statistics
    'stats.ready': 'Articles Prêts',
    'stats.waiting': 'En Attente de Tri',
    'stats.unknown': 'Articles Inconnus',
    'stats.total': 'Total Articles',
    'stats.grossWeight': 'Poids Brut',
    'stats.netWeight': 'Net',
    
    // Search and filters
    'search.placeholder': 'Rechercher articles, marques, modèles ou numéros d\'expédition...',
    'filter.allCategories': 'Toutes Catégories',
    
    // Empty state
    'empty.title': 'Aucun article trouvé',
    'empty.description': 'Essayez d\'ajuster vos critères de recherche ou de filtrage.',
    'empty.descriptionNoItems': 'Commencez par ajouter votre premier article d\'inventaire.',
    'empty.addFirst': 'Ajouter Premier Article',
    
    // Dialog
    'dialog.edit': 'Modifier Article',
    'dialog.add': 'Ajouter Nouvel Article',
    'dialog.category': 'Catégorie',
    'dialog.selectCategory': 'Sélectionner catégorie',
    'dialog.metalContent': 'Contenu Métallique:',
    'dialog.condition': 'État',
    'dialog.ready': 'Prêt',
    'dialog.waitingSorting': 'En Attente de Tri',
    'dialog.unknown': 'Inconnu',
    'dialog.dateAdded': 'Date d\'Ajout',
    'dialog.shipmentNumber': 'Numéro d\'Expédition',
    'dialog.weightInfo': 'Informations de Poids (kg)',
    'dialog.totalWeight': 'Poids Total (kg)',
    'dialog.bigBagWeight': 'Poids Big Bag (kg)',
    'dialog.palletWeight': 'Poids Palette (kg)',
    'dialog.netWeight': 'Poids Net:',
    'dialog.location': 'Zone d\'Emplacement',
    'dialog.selectLocation': 'Sélectionner zone d\'emplacement',
    'dialog.description': 'Description',
    'dialog.descriptionPlaceholder': 'Détails supplémentaires sur l\'article...',
    'dialog.cancel': 'Annuler',
    'dialog.update': 'Mettre à Jour Article',
    'dialog.addItem': 'Ajouter Article',
    
    // Confirmation dialog
    'confirm.title': 'Confirmer la suppression',
    'confirm.description': 'Êtes-vous sûr de vouloir supprimer cet élément "{category}" ? Cette action ne peut pas être annulée.',
    'confirm.cancel': 'Annuler',
    'confirm.delete': 'Supprimer',
    
    // Language
    'language.lithuanian': 'Lituanien',
    'language.french': 'Français',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
