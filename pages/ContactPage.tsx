import React from 'react';
import {
  Header,
  ContactSection,
  Footer,
  FloatingWhatsApp,
} from '../components';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header />
      <main className="flex-grow pt-16">
        <ContactSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};
