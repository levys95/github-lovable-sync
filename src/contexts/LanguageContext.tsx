
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

    // Units
    'unit.kg': 'KG',
    'unit.ppm': 'ppm',
    'unit.percent': '%',
    
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
    'dialog.name': 'Prekės pavadinimas',
    'dialog.namePlaceholder': 'Įveskite prekės pavadinimą',
    'dialog.brand': 'Prekės ženklas',
    'dialog.brandPlaceholder': 'Įveskite prekės ženklą',
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
    
    // Pagination
    'pagination.prev': 'Ankstesnis',
    'pagination.next': 'Kitas',
    'pagination.of': 'iš',
    'pagination.items': 'prekių',

    // PPM / Cards
    'ppm.totalTitle': 'Bendras metalų turinys',
    'ppm.totalWeightLabel': 'Bendras svoris',
    'card.totalWeight': 'Bendras Svoris:',
    'card.bigBag': 'Big Bag:',
    'card.pallet': 'Paletė:',
    'card.netWeight': 'Grynasis Svoris:',
    'card.metalContent': 'Metalų Turinys:',

    // Media / Images
    'media.title': 'Nuotraukos ir vaizdo įrašai',
    'media.photoBtn': 'Nuotrauka',
    'media.videoBtn': 'Vaizdo įrašas',
    'media.uploadBtn': 'Įkelti',
    'media.capture': 'Fotografuoti',
    'media.cancel': 'Atšaukti',
    'media.none': 'Nuotraukų ar vaizdo įrašų nepridėta',
    'media.hint.mobileNative': 'Naudokite mygtukus Nuotrauka ir Vaizdo įrašas turiniui įrašyti',
    'media.hint.mobileWeb': 'Bakstelėkite mygtukus nuotraukoms ar vaizdo įrašams daryti',
    'media.hint.desktop': 'Naudokite kamerą arba įkelkite failus',

    // Toasts / Errors
    'toast.successTitle': 'Sėkmė',
    'toast.errorTitle': 'Klaida',
    'toast.addSuccess': 'Prekė sėkmingai pridėta',
    'toast.addError': 'Nepavyko pridėti prekės',
    'toast.updateSuccess': 'Prekė sėkmingai atnaujinta',
    'toast.updateError': 'Nepavyko atnaujinti prekės',
    'toast.deleteSuccess': 'Prekė sėkmingai ištrinta',
    'toast.deleteError': 'Nepavyko ištrinti prekės',

    // Misc
    'loading': 'Kraunama...',

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

    // Units
    'unit.kg': 'KG',
    'unit.ppm': 'ppm',
    'unit.percent': '%',
    
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
    'dialog.name': 'Nom de l\'Article',
    'dialog.namePlaceholder': 'Entrez le nom de l\'article',
    'dialog.brand': 'Marque',
    'dialog.brandPlaceholder': 'Entrez la marque',
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
    
    // Pagination
    'pagination.prev': 'Précédent',
    'pagination.next': 'Suivant',
    'pagination.of': 'sur',
    'pagination.items': 'articles',

    // PPM / Cards
    'ppm.totalTitle': 'Contenu Métallique Total',
    'ppm.totalWeightLabel': 'Poids Total',
    'card.totalWeight': 'Poids Total:',
    'card.bigBag': 'Big Bag:',
    'card.pallet': 'Palette:',
    'card.netWeight': 'Poids Net:',
    'card.metalContent': 'Contenu Métallique:',

    // Media / Images
    'media.title': 'Photos & Vidéos',
    'media.photoBtn': 'Photo',
    'media.videoBtn': 'Vidéo',
    'media.uploadBtn': 'Upload',
    'media.capture': 'Capturer',
    'media.cancel': 'Annuler',
    'media.none': 'Aucune photo ou vidéo ajoutée',
    'media.hint.mobileNative': 'Utilisez les boutons Photo et Vidéo pour capturer du contenu',
    'media.hint.mobileWeb': 'Appuyez sur les boutons pour prendre des photos ou vidéos',
    'media.hint.desktop': 'Utilisez la caméra ou téléchargez des fichiers',

    // Toasts / Errors
    'toast.successTitle': 'Succès',
    'toast.errorTitle': 'Erreur',
    'toast.addSuccess': 'Article ajouté avec succès',
    'toast.addError': "Échec de l'ajout de l'article",
    'toast.updateSuccess': 'Article mis à jour avec succès',
    'toast.updateError': "Échec de la mise à jour de l'article",
    'toast.deleteSuccess': 'Article supprimé avec succès',
    'toast.deleteError': "Échec de la suppression de l'article",

    // Misc
    'loading': 'Chargement...',

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
