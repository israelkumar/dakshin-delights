
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MenuItem, CartItem } from './types';
import { fetchCart, addToCartApi, removeFromCartApi, updateCartItem } from './api';
import { LiveAssistant } from './components/LiveAssistant';
import { useToast } from './components/Toast';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { LanguageProvider, useLanguage } from './LanguageContext';

// Code-split pages
const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const Tracking = lazy(() => import('./pages/Tracking'));
const Studio = lazy(() => import('./pages/Studio'));

const LoadingSpinner: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-label={t.loading}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-stone-500 font-medium">{t.loading}</p>
      </div>
    </div>
  );
};

const Navbar: React.FC<{ cartCount: number }> = ({ cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.menu, path: '/menu' },
    { name: t.nav.myOrders, path: '/orders' },
    { name: t.nav.studio, path: '/studio' },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-primary/10" aria-label="Main navigation" onKeyDown={handleKeyDown}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2" aria-label="Dakshin Delights - Home">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-icons text-white" aria-hidden="true">restaurant_menu</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">Dakshin<span className="text-stone-700 dark:text-stone-200">Delights</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : ''}`}
                aria-current={location.pathname === link.path ? 'page' : undefined}
              >
                {link.name}
              </Link>
            ))}
            <LanguageToggle />
            <ThemeToggle />
            <Link to="/checkout" className="relative bg-primary text-white p-2.5 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all" aria-label={t.nav.cartLabel(cartCount)}>
              <span className="material-icons" aria-hidden="true">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-primary" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
          >
            <span className="material-icons" aria-hidden="true">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-white dark:bg-stone-950 border-b border-primary/10 py-4 px-4 space-y-4" role="menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block font-medium py-2"
              role="menuitem"
              aria-current={location.pathname === link.path ? 'page' : undefined}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-3 py-2">
            <span className="font-medium">{t.nav.theme}</span>
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <Link
            to="/checkout"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg"
            role="menuitem"
          >
            <span className="material-icons" aria-hidden="true">shopping_cart</span> {t.nav.cartCount(cartCount)}
          </Link>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-stone-100 dark:bg-stone-950 pt-20 pb-10" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="material-icons text-white text-sm" aria-hidden="true">restaurant_menu</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">Dakshin<span className="text-stone-700 dark:text-stone-200">Delights</span></span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              {t.footer.tagline}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-stone-200 dark:bg-stone-900 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Facebook">
                <span className="material-icons text-lg" aria-hidden="true">facebook</span>
              </a>
              <a href="#" className="w-10 h-10 bg-stone-200 dark:bg-stone-900 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Instagram">
                <span className="material-icons text-lg" aria-hidden="true">camera_alt</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">{t.footer.quickLinks}</h4>
            <ul className="space-y-4 text-stone-600 dark:text-stone-400">
              <li><Link to="/menu" className="hover:text-primary transition-colors">{t.footer.fullMenu}</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">{t.footer.trackOrder}</Link></li>
              <li><Link to="/studio" className="hover:text-primary transition-colors">{t.footer.aiStudio}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">{t.footer.operatingHours}</h4>
            <ul className="space-y-4 text-stone-600 dark:text-stone-400">
              <li className="flex justify-between">
                <span>{t.footer.monFri}</span>
                <span>7:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between text-primary font-medium">
                <span>{t.footer.satSun}</span>
                <span>6:30 AM - 11:00 PM</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">{t.footer.findUs}</h4>
            <div className="rounded-lg overflow-hidden h-32 mb-4 bg-gray-300 map-bg"></div>
            <p className="text-sm text-stone-600 dark:text-stone-400 flex items-center">
              <span className="material-icons text-primary text-sm mr-2" aria-hidden="true">location_on</span>
              {t.footer.address}
            </p>
          </div>
        </div>
        <div className="border-t border-stone-200 dark:border-stone-900 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-stone-500">
          <p>{t.footer.copyright}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">{t.footer.terms}</a>
            <a href="#" className="hover:text-primary transition-colors">{t.footer.cookies}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

function AppContent() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { showToast } = useToast();
  const { t } = useLanguage();

  const loadCart = useCallback(async () => {
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (err) {
      showToast('Failed to load cart. Please refresh the page.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = useCallback(async (item: MenuItem) => {
    try {
      const updated = await addToCartApi(item.id);
      setCart(updated);
      showToast(`${item.name} added to cart`, 'success');
    } catch (err) {
      showToast('Failed to add item to cart. Please try again.', 'error');
    }
  }, [showToast]);

  const removeFromCart = useCallback(async (id: string) => {
    try {
      const updated = await removeFromCartApi(id);
      setCart(updated);
      showToast('Item removed from cart', 'info');
    } catch (err) {
      showToast('Failed to remove item. Please try again.', 'error');
    }
  }, [showToast]);

  const updateQuantity = useCallback(async (menuItemId: string, quantity: number) => {
    try {
      const updated = await updateCartItem(menuItemId, quantity);
      setCart(updated);
    } catch (err) {
      showToast('Failed to update quantity. Please try again.', 'error');
    }
  }, [showToast]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Skip to content link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold">
          {t.nav.skipToContent}
        </a>
        <Navbar cartCount={cartCount} />
        <main id="main-content" className="flex-grow" role="main">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home addToCart={addToCart} />} />
              <Route path="/menu" element={<Menu addToCart={addToCart} />} />
              <Route path="/checkout" element={<Checkout cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} onOrderPlaced={loadCart} />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/tracking/:id" element={<Tracking />} />
              <Route path="/studio" element={<Studio />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <LiveAssistant />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
