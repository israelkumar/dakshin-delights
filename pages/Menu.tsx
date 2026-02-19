
import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { fetchMenu } from '../api';
import { useToast } from '../components/Toast';
import MenuCard from '../components/MenuCard';
import { useLanguage } from '../LanguageContext';

interface MenuProps {
  addToCart: (item: MenuItem) => void;
}

const MenuCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-950 rounded-2xl overflow-hidden border border-primary/5 flex flex-col">
    <div className="h-56 skeleton"></div>
    <div className="p-5 space-y-3">
      <div className="h-5 w-3/4 skeleton"></div>
      <div className="h-4 w-full skeleton"></div>
      <div className="h-4 w-1/2 skeleton"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-4 w-16 skeleton"></div>
        <div className="h-9 w-28 skeleton rounded-lg"></div>
      </div>
    </div>
  </div>
);

// Category keys (used as API filter values — keep in English)
const CATEGORY_KEYS = ['All', 'Breakfast', 'Rice Dishes', 'Snacks', 'Desserts'];
// Spice level keys (used as API filter values — keep in English)
const SPICE_KEYS = ['Mild', 'Medium', 'Spicy'];

const Menu: React.FC<MenuProps> = ({ addToCart }) => {
  const [category, setCategory] = useState<string>('All');
  const [dietary, setDietary] = useState<string[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // FIX: Debounce filter changes (200ms) + AbortController for race conditions
    const abortController = new AbortController();

    const timer = setTimeout(() => {
      const filters: { category?: string; dietary?: string; spiceLevel?: string } = {};
      if (category !== 'All') filters.category = category;
      if (dietary.length === 1) filters.dietary = dietary[0];
      if (spiceLevel) filters.spiceLevel = spiceLevel;

      setLoading(true);
      setError(null);

      fetchMenu(filters).then(items => {
        // Only update if this request wasn't aborted
        if (!abortController.signal.aborted) {
          setFilteredItems(items);
        }
      }).catch(err => {
        // Ignore abort errors
        if (!abortController.signal.aborted) {
          setError(t.menu.somethingWentWrong);
          showToast('Failed to load menu. Please try again.', 'error');
        }
      }).finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });
    }, 200); // 200ms debounce

    // Cleanup: abort in-flight request and clear timer
    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  // t intentionally omitted from deps to avoid re-fetching on language change
  }, [category, dietary, spiceLevel, showToast]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDietary = (type: string) => {
    setDietary(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const clearFilters = () => {
    setCategory('All');
    setDietary([]);
    setSpiceLevel(null);
  };

  const hasActiveFilters = category !== 'All' || dietary.length > 0 || spiceLevel !== null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-8" aria-label="Menu filters">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">{t.menu.categories}</h3>
          <nav className="space-y-1" aria-label="Category filter">
            {CATEGORY_KEYS.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${category === cat ? 'bg-primary text-white font-semibold shadow-md shadow-primary/20' : 'hover:bg-primary/10'}`}
                aria-pressed={category === cat}
              >
                <span>{t.menu.categoryLabels[cat] ?? cat}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-primary/5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">{t.menu.refineSearch}</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase" id="dietary-label">{t.menu.dietary}</p>
              <div className="space-y-2" role="group" aria-labelledby="dietary-label">
                {['VEG', 'NON-VEG'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                      checked={dietary.includes(type)}
                      onChange={() => toggleDietary(type)}
                    />
                    <span className={`w-3 h-3 border ${type === 'VEG' ? 'border-green-600' : 'border-red-600'} rounded-sm flex items-center justify-center p-0.5`} aria-hidden="true">
                      <span className={`w-full h-full ${type === 'VEG' ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></span>
                    </span>
                    <span className="text-sm group-hover:text-primary transition-colors">
                      {type === 'VEG' ? t.menu.vegetarianOnly : t.menu.nonVegetarian}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase" id="spice-label">{t.menu.spiceLevel}</p>
              <div className="grid grid-cols-1 gap-2" role="group" aria-labelledby="spice-label">
                {SPICE_KEYS.map(level => (
                  <button
                    key={level}
                    onClick={() => setSpiceLevel(spiceLevel === level ? null : level)}
                    className={`text-xs py-2 px-3 border border-primary/20 rounded-lg text-left flex justify-between items-center transition-all ${spiceLevel === level ? 'bg-primary/10 border-primary' : 'hover:bg-primary/5'}`}
                    aria-pressed={spiceLevel === level}
                  >
                    {t.menu.spiceLevelLabels[level] ?? level}
                    <span className={`material-icons text-sm ${level === 'Mild' ? 'text-yellow-500' : level === 'Medium' ? 'text-orange-500' : 'text-red-600'}`} aria-hidden="true">
                      local_fire_department
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="w-full text-sm text-primary font-medium hover:underline">
                {t.menu.clearAllFilters}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Grid */}
      <section className="flex-1" aria-busy={loading}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {category === 'All' ? t.menu.menuHeading : t.menu.authenticHeading(t.menu.categoryLabels[category] ?? category)}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">{t.menu.menuSubtitle}</p>
          </div>
          {!loading && (
            <p className="text-sm text-slate-400">{t.menu.itemsFound(filteredItems.length)}</p>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <MenuCardSkeleton key={i} />)}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-16">
            <span className="material-icons text-6xl text-red-300 mb-4" aria-hidden="true">error_outline</span>
            <h2 className="text-xl font-bold mb-2">{t.menu.somethingWentWrong}</h2>
            <p className="text-stone-500 mb-6">{error}</p>
            <button onClick={() => setCategory(category)} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">{t.menu.tryAgain}</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <span className="material-icons text-6xl text-stone-300 mb-4" aria-hidden="true">search_off</span>
            <h2 className="text-xl font-bold mb-2">{t.menu.noDisheFound}</h2>
            <p className="text-stone-500 mb-6">{t.menu.tryAdjusting}</p>
            <button onClick={clearFilters} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">{t.menu.clearFilters}</button>
          </div>
        )}

        {/* Menu grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <MenuCard key={item.id} item={item} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Menu;
