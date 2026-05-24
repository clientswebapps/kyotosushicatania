import { useRef } from 'react';
import HeroCarousel from "../components/home/HeroCarousel";
import PromotionsSection from "../components/home/PromotionsSection";
import MenuPreview from "../components/home/MenuPreview";
import AboutSection from "../components/home/AboutSection";
import ContactSection from "../components/home/ContactSection";
import ScrollIndicator from "../components/home/ScrollIndicator";
import Footer from "../components/layout/Footer";
import '../styles/onboarding.css';

export default function Home() {
  const containerRef = useRef(null);

  return (
    <div className="home-onboarding" ref={containerRef}>
      <HeroCarousel />
      <PromotionsSection />
      <MenuPreview />
      <AboutSection />
      <ContactSection />
      <Footer />
      <ScrollIndicator containerRef={containerRef} />
    </div>
  );
}
