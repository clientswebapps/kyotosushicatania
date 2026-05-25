import HeroCarousel from "../components/home/HeroCarousel";
import PromotionsSection from "../components/home/PromotionsSection";
import MenuPreview from "../components/home/MenuPreview";
import AboutSection from "../components/home/AboutSection";
import ContactSection from "../components/home/ContactSection";
import Footer from "../components/layout/Footer";
import '../styles/onboarding.css';

export default function Home() {
  return (
    <div className="home-onboarding">
      <HeroCarousel />
      <PromotionsSection />
      <MenuPreview />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
