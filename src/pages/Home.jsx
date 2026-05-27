import HeroCarousel from "../components/home/HeroCarousel";
import PromotionsSection from "../components/home/PromotionsSection";
import MenuPreview from "../components/home/MenuPreview";
import AboutSection from "../components/home/AboutSection";
import ContactSection from "../components/home/ContactSection";
import Footer from "../components/layout/Footer";
import '../styles/onboarding.css';

import { Helmet } from 'react-helmet-async';

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Kyō-To Sushi Catania",
    "image": "https://kyotosushicatania.web.app/images/sashimi-platter.avif",
    "url": "https://kyotosushicatania.web.app",
    "telephone": "+390951234567",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via Example 123",
      "addressLocality": "Catania",
      "addressRegion": "CT",
      "postalCode": "95100",
      "addressCountry": "IT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 37.502,
      "longitude": 15.087
    },
    "servesCuisine": "Japanese, Sushi, Asian Contemporary",
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "12:00",
        "closes": "15:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "19:00",
        "closes": "23:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday", "Sunday"],
        "opens": "12:00",
        "closes": "23:30"
      }
    ],
    "menu": "https://kyotosushicatania.web.app/menu"
  };

  return (
    <div className="home-onboarding">
      <Helmet>
        <title>Kyō-To Sushi Catania | Japanese Asian Contemporary Cuisine</title>
        <meta name="description" content="Kyō-To Sushi Catania offers the finest contemporary sushi and traditional Asian cuisine in Catania. Discover our signature dishes and reserve your table." />
        <meta property="og:title" content="Kyō-To Sushi Catania | Japanese Asian Contemporary Cuisine" />
        <meta property="og:description" content="The finest contemporary sushi and traditional Asian cuisine in Catania. Reserve your table today." />
        <meta property="og:image" content="https://kyotosushicatania.web.app/images/sashimi-platter.avif" />
        <meta property="og:url" content="https://kyotosushicatania.web.app/" />
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
      <ContactSection />
      <Footer />
    </div>
  );
}
