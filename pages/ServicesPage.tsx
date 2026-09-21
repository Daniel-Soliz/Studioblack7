import React from 'react';
import {
  Header,
  ServicesSection,
  Footer,
  FloatingWhatsApp,
} from '../components';

export const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header />
      <main className="flex-grow pt-16">
        <ServicesSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};
