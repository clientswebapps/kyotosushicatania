import HeroCarousel from "../components/home/HeroCarousel";
import PromotionsSection from "../components/home/PromotionsSection";
import MenuPreview from "../components/home/MenuPreview";
import AboutSection from "../components/home/AboutSection";
import MenuGallery from "../components/home/MenuGallery";
import ContactSection from "../components/home/ContactSection";
import Footer from "../components/layout/Footer";
import '../styles/onboarding.css';

import { Helmet } from 'react-helmet-async';

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Kyō-To Sushi Catania",
    "image": "https://www.kyotosushicatania.com/images/sashimi-platter.avif",
    "url": "https://www.kyotosushicatania.com",
    "telephone": "+390952907347",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via Barone della Bicocca, 14",
      "addressLocality": "Catania",
      "addressRegion": "CT",
      "postalCode": "95124",
      "addressCountry": "IT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 37.5028,
      "longitude": 15.0867
    },
    "servesCuisine": "Japanese, Sushi, Asian Contemporary",
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "18:00",
        "closes": "23:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "12:30",
        "closes": "15:00"
      }
    ],
    "menu": "https://www.kyotosushicatania.com/menu"
  };

  return (
    <main className="home-onboarding">
      <Helmet>
        <title>Kyō-To Sushi Catania | Japanese Asian Contemporary Cuisine</title>
        <meta name="description" content="Kyō-To Sushi Catania offers the finest contemporary sushi and traditional Asian cuisine in Catania. Discover our signature dishes and reserve your table." />
        <meta property="og:title" content="Kyō-To Sushi Catania | Japanese Asian Contemporary Cuisine" />
        <meta property="og:description" content="The finest contemporary sushi and traditional Asian cuisine in Catania. Reserve your table today." />
        <meta property="og:image" content="https://www.kyotosushicatania.com/images/sashimi-platter.avif" />
        <meta property="og:url" content="https://www.kyotosushicatania.com/" />
        <meta property="og:type" content="restaurant.restaurant" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <HeroCarousel />
      <PromotionsSection />
      <MenuPreview />
      <AboutSection />
      <MenuGallery />
      <ContactSection />
      <Footer />
    </main>
  );
}