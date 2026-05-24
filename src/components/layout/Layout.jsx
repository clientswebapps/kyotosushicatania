import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <Navbar />
      <main className={isHome ? 'main--home' : ''}>
        <Outlet />
      </main>
      {!isHome && <Footer />}
    </>
  );
};

export default Layout;
