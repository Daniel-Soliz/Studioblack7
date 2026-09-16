import React from 'react';
import {
  Header,
  Hero,
  AboutSection,
  FounderSection,
  TeamAndStatsSection,
  ServicesSection,
  FeaturedProductsSection,
  SocialProofSection,
  PositioningSection,
  LocationAndHoursSection,
  BookingSection,
  ContactSection,
  Footer,
  FloatingWhatsApp,
} from '../components';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Fixed Sticky Header */}
      <Header />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <Hero />
        <AboutSection />
        <FounderSection />
        <TeamAndStatsSection />
        <ServicesSection />
        <FeaturedProductsSection />
        <SocialProofSection />
        <PositioningSection />
        <LocationAndHoursSection />
        <BookingSection />
        <ContactSection />
      </main>

      {/* Official Footer */}
      <Footer />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsApp />
    </div>
  );
};
