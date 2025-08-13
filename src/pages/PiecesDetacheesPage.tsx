import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, LogOut } from "lucide-react";
import { BurgerMenu } from "@/components/BurgerMenu";
import { Logo } from "@/components/Logo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { pieceDetacheeCategories } from "@/constants/piecesDetacheesCatalog";

const PiecesDetacheesPage: React.FC = () => {
  const { language } = useLanguage();

  useEffect(() => {
    if (language === 'lt') {
      document.title = "Atsarginės dalys - Inventorius";
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Valdykite atsargines dalis Dell, HP, Lenovo įrangai - baterijos, ekranai, klaviatūros');
      }
    } else {
      document.title = "Pièces Détachées - Inventaire";
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Gérez vos pièces détachées Dell, HP, Lenovo - batteries, écrans, claviers, cartes mères');
      }
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.origin + '/pieces-detachees');
    }
  }, [language]);

  const handleLogout = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Logo />
            <BurgerMenu 
              categories={[]}
              selectedCategory={null}
              counts={{}}
              onSelect={() => {}}
            />
            <h1 className="font-semibold text-foreground">
              {language === 'lt' ? 'Atsarginės Dalys' : 'Pièces Détachées'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {language === 'lt' ? 'Atsijungti' : 'Déconnexion'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {language === 'lt' ? 'Atsarginės Dalys' : 'Pièces Détachées'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'lt' 
              ? 'Valdykite atsargines dalis Dell, HP ir Lenovo įrangai - baterijos, ekranai, klaviatūros ir daugiau'
              : 'Gérez vos pièces détachées pour équipements Dell, HP et Lenovo - batteries, écrans, claviers et plus'
            }
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="outline">Dell</Badge>
            <Badge variant="outline">HP</Badge>
            <Badge variant="outline">Lenovo</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pieceDetacheeCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.id} to={category.route}>
                <Card className={`h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${category.bgGradient}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-white/50 ${category.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {language === 'lt' ? category.nameLt : category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === 'lt' ? category.descriptionLt : category.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {category.brands.map((brand) => (
                        <Badge key={brand} variant="secondary" className="text-xs">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      {language === 'lt' ? 'Žiūrėti atsargas' : 'Voir le stock'}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default PiecesDetacheesPage;