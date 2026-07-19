import { motion } from 'framer-motion';
import { useCollection } from '../../hooks/useFirestore';
import { Star } from 'lucide-react';
import '../../styles/bestsellers.css';

const imageMap = {
  'Dragon Roll': '/images/dragon-roll.avif',
  'Premium Mixed Sashimi': '/images/sashimi-platter.avif',
  'Tonkotsu Ramen': '/images/tonkotsu-ramen.avif',
  'Rainbow Roll': '/images/rainbow-roll.avif',
  'Mixed Tempura': '/images/tempura-platter.avif',
  'Grilled Gyoza': '/images/gyoza.avif',
};

const fallbackItems = [
  {
    id: 'bs-1',
    name: 'Dragon Roll',
    description: 'Special roll with tempura shrimp, avocado, tobiko, and teriyaki sauce.',
    price: 14.9,
    imageUrl: '/images/dragon-roll.avif',
  },
  {
    id: 'bs-2',
    name: 'Premium Mixed Sashimi',
    description: 'Premium selection of fresh sashimi: salmon, tuna, yellowtail, and red shrimp.',
    price: 22.9,
    imageUrl: '/images/sashimi-platter.avif',
  },
  {
    id: 'bs-3',
    name: 'Tonkotsu Ramen',
    description: 'Creamy pork broth with noodles, chashu, marinated egg, and scallion.',
    price: 16.9,
    imageUrl: '/images/tonkotsu-ramen.avif',
  },
  {
    id: 'bs-4',
    name: 'Rainbow Roll',
    description: 'Uramaki topped with slices of salmon, tuna, avocado, and shrimp.',
    price: 16.5,
    imageUrl: '/images/rainbow-roll.avif',
  },
  {
    id: 'bs-5',
    name: 'Mixed Tempura',
    description: 'Shrimp and seasonal vegetables in crispy batter with tentsuyu sauce.',
    price: 13.9,
    imageUrl: '/images/tempura-platter.avif',
  },
  {
    id: 'bs-6',
    name: 'Grilled Gyoza',
    description: 'Japanese dumplings filled with meat and vegetables, grilled and served with ponzu.',
    price: 8.9,
    imageUrl: '/images/gyoza.avif',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const formatPrice = (price) => {
  return `€${Number(price).toFixed(2)}`;
};

const BestSellers = () => {
  const { data: firebaseItems } = useCollection('menuItems', {
    whereField: 'isBestSeller',
    whereValue: true,
  });

  const items =
    firebaseItems && firebaseItems.length > 0 ? firebaseItems : fallbackItems;

  const getImage = (item) => {
    return item.imageUrl || imageMap[item.name] || '/images/dragon-roll.avif';
  };

  return (
    <section className="bestsellers">
      <div className="bestsellers__container">
        <motion.div
          className="bestsellers__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="bestsellers__title">Our Best Sellers</h2>
          <p className="bestsellers__subtitle">The most loved dishes by our guests</p>
          <hr className="bestsellers__divider" />
        </motion.div>

        <motion.div
          className="bestsellers__grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              className="bestsellers__card"
              variants={cardVariants}
            >
              <div className="bestsellers__card-image-wrapper">
                <img
                  src={getImage(item)}
                  alt={item.name}
                  className="bestsellers__card-image"
                  loading="lazy"
                  onError={(e) => {
                    if (e.target.src !== '/images/logo.avif') {
                      e.target.src = '/images/logo.avif';
                      e.target.style.opacity = '0.20';
                      e.target.style.objectFit = 'contain';
                      e.target.style.padding = '16px';
                    }
                  }}
                />
                <div className="bestsellers__badge">
                  <Star size={10} style={{ marginRight: '4px', fill: 'currentColor' }} />
                  Best Seller
                </div>
              </div>
              <div className="bestsellers__card-body">
                <h3 className="bestsellers__card-name">{item.name}</h3>
                <p className="bestsellers__card-description">{item.description}</p>
                <div className="bestsellers__card-footer">
                  <span className="bestsellers__card-price">{formatPrice(item.price)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BestSellers;
