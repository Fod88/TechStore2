import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/store/Navbar';
import Footer from '../components/store/Footer';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0), [pathname]
  });
  return null;
}

export default function StoreLayout() {
  return (
    <div className="store">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main" className="store__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
