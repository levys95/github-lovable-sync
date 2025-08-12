
import React from "react";
import { Cpu } from "lucide-react";
import { CpuForm } from "@/components/cpu/CpuForm";
import { CpuList } from "@/components/cpu/CpuList";
import { CpuOverviewPanels } from "@/components/cpu/CpuOverviewPanels";

const CpuPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center gap-3">
          <Cpu className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Stock Processeurs</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-8">
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
