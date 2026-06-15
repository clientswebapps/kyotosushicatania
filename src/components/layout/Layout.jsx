import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../common/WhatsAppButton';

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
    </>
  );
};

export default Layout;
