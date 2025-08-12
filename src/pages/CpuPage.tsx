
import React, { useEffect } from "react";
import { Cpu as CpuIcon, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { CpuForm } from "@/components/cpu/CpuForm";
import { CpuList } from "@/components/cpu/CpuList";
import { CpuOverviewPanels } from "@/components/cpu/CpuOverviewPanels";
import { CpuCatalogSyncButton } from "@/components/cpu/CpuCatalogSyncButton";
import { BurgerMenu } from "@/components/BurgerMenu";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const CpuPage: React.FC = () => {
  useEffect(() => {
    document.title = "Stock Processeurs | Inventaire CPU Intel & AMD";
    const description =
      "Gestion du stock de processeurs Intel et AMD. Vue d’ensemble, ajout et liste du catalogue.";

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.origin + "/processeurs";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16 relative">
            <div className="flex items-center gap-3">
              <BurgerMenu categories={[]} selectedCategory={null} counts={{}} onSelect={() => {}} />
              <Link to="/" className="flex items-center">
                <Logo className="h-16 w-auto md:h-20" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const { supabase } = await import("@/integrations/supabase/client");
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="flex items-center gap-2"
                aria-label="Se déconnecter"
              >
                <span className="hidden sm:inline">Déconnexion</span>
                <LogOut className="h-4 w-4 sm:hidden" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-8">
        <section className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CpuIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Stock Processeurs</h1>
          </div>
          <CpuCatalogSyncButton />
        </section>

        <CpuOverviewPanels />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <CpuList />
          </div>
          <div className="order-1 lg:order-2">
            <CpuForm />
          </div>
        </section>
      </main>
    </div>
  );
};

export default CpuPage;
