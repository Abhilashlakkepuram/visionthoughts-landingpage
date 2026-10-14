import StageProvider from "@/components/ui/StageProvider";
import SceneCanvas from "@/components/scene/SceneCanvas";
import Nav from "@/components/ui/Nav";
import Cursor from "@/components/ui/Cursor";
import Preloader from "@/components/ui/Preloader";
import ScrollReveals from "@/components/ui/ScrollReveals";

import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import Services from "@/components/sections/Services";
import Identity from "@/components/sections/Identity";
import Why from "@/components/sections/Why";
import FinalCta from "@/components/sections/FinalCta";
import Footer from "@/components/sections/Footer";

import { site, services } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  url: site.url,
  email: site.email,
  telephone: site.phone,
  slogan: site.tagline,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kukatpally, Hyderabad",
    addressRegion: "Telangana",
    addressCountry: "IN",
  },
  openingHours: "Mo-Sa 09:00-19:00",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Digital Services",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.name,
        description: s.description,
      },
    })),
  },
};

export default function Page() {
  return (
    <StageProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <SceneCanvas />
      <div className="vignette" aria-hidden="true" />

      <Nav />

      <main id="main" className="relative z-10">
        <Hero />
        <Statement />
        <Services />
        <Identity />
        <Why />
        <FinalCta />
      </main>

      <Footer />

      <Cursor />
      <ScrollReveals />
      <Preloader />
    </StageProvider>
  );
}
