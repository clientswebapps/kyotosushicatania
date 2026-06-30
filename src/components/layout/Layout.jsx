import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../common/WhatsAppButton';
import PWAInstallPromo from '../common/PWAInstallPromo';

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <Navbar />
      <div className={`app-content ${isHome ? 'main--home' : ''}`}>
        <Outlet />
      </div>
      {!isHome && <Footer />}
      {!isAdmin && <WhatsAppButton />}
      {!isAdmin && <PWAInstallPromo />}
    </>
  );
};

export default Layout;
