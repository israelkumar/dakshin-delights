
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MenuItem } from '../types';
import { fetchMenu } from '../api';
import MenuCard from '../components/MenuCard';

interface HomeProps {
  addToCart: (item: MenuItem) => void;
}

const SpecialtySkeleton: React.FC = () => (
  <div className="bg-white dark:bg-stone-900 rounded-xl overflow-hidden shadow-xl border border-stone-100 dark:border-stone-800">
    <div className="h-64 skeleton"></div>
    <div className="p-6 space-y-3">
      <div className="h-5 w-3/4 skeleton"></div>
      <div className="h-4 w-full skeleton"></div>
      <div className="h-10 w-full skeleton rounded-lg mt-4"></div>
    </div>
  </div>
);

const Home: React.FC<HomeProps> = ({ addToCart }) => {
  const [specialties, setSpecialties] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu().then(items => {
      setSpecialties(items.filter(item => item.isSpecial || ['m1', 'm2', 'm3'].includes(item.id)));
    }).catch(err => {
      console.error('Failed to fetch menu:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Crispy Masala Dosa"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDojTvKp6ngYcaiePS4vTrIP4QWjpCQ4ORSa9a72WRTPZALZW4aeh6H6Hj5LUS2zmFMAnTKFGxxPZJlY85U-s92uKagr-tB_TGHzBqdR_unDuiiuRh6MKxKHv5sXyj_1xVXiQywATIfRSRpmYo20Ksnm8aLIhz6G5AK6J3EEsuj0GF4wxedTKD-a-6OXezpNYv5Q2f8cd30yHHjYa5VGNapAvKzV2NMPG7FRLOPMgkBIAtsRRGiCc4TMMWbXl1M4pS1Tb6IXTdEO2M"
            width="1920"
            height="1080"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 via-background-dark/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary font-bold text-sm tracking-widest uppercase mb-4">
              Authentic South Indian
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Tradition Served on a <span className="text-primary">Banana Leaf</span>
            </h1>
            <p className="text-xl text-stone-200 mb-8 leading-relaxed">
              Experience the rich heritage of homemade recipes crafted by Chef Amara. Stone-ground spices, fermented batters, and love delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/menu" className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center space-x-2">
                <span>View Full Menu</span>
                <span className="material-icons" aria-hidden="true">arrow_forward</span>
              </Link>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                Explore Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Offer Banner */}
      <section className="bg-gradient-to-r from-deep-orange to-primary py-8 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
           <div className="flex items-center gap-4 text-white">
             <span className="material-icons text-4xl text-accent-gold" aria-hidden="true">celebration</span>
             <div>
               <h2 className="text-2xl font-bold">Buy 2 Dosas, Get 1 Filter Coffee <span className="text-accent-gold">FREE!</span></h2>
               <p className="opacity-90">Experience the perfect South Indian breakfast combo today.</p>
             </div>
           </div>
           <Link to="/menu" className="bg-white text-primary font-bold px-8 py-3 rounded-full shadow-xl hover:scale-105 transition-transform">
             Order Now
           </Link>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-24 pattern-overlay" aria-busy={loading}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2">Must Try</p>
            <h2 className="text-4xl font-bold text-stone-900 dark:text-white">Our Signature Specialties</h2>
            <div className="h-1 w-24 bg-primary mx-auto mt-4 rounded-full" aria-hidden="true"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <>
                <SpecialtySkeleton />
                <SpecialtySkeleton />
                <SpecialtySkeleton />
              </>
            ) : (
              specialties.map(item => (
                <MenuCard key={item.id} item={item} onAddToCart={addToCart} variant="featured" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Meet the Chef */}
      <section className="py-24 bg-stone-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" aria-hidden="true"></div>
              <div className="relative z-10 rounded-2xl overflow-hidden border-8 border-white/5 shadow-2xl">
                <img
                  alt="Chef at Work"
                  className="w-full h-[500px] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgV5oQfKEYkQpRZDzE-xGA1YJe9aS2P6mzr7_z038FgXRnRM4rQfFdYcZXmxc4Orf2Y7PMldFs7g3sUG4R0uhoOxXFHWuB3sWYyDXzx7BCzTkhAjMwVCRooKasyzKsRFFzMJ34io81hsyBvgJeIb1lZxqJ4jlkmmunB0ovIYv5pjdtdENaD4DstkVNOVQzajN9ha5g_qTqag0j-gNZpqoV-0kPefthrVZmjjIlvTw2yhQYB-4MGQrCIRyOwAysENkpjJVxx3haVYo"
                  loading="lazy"
                  width="600"
                  height="500"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary p-8 rounded-xl shadow-2xl hidden md:block">
                <p className="text-4xl font-bold">25+</p>
                <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Years of Craft</p>
              </div>
            </div>
            <div className="lg:w-1/2">
              <p className="text-primary font-bold tracking-widest uppercase text-sm mb-4">The Hands Behind the Flavor</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Meet Chef Amara</h2>
              <p className="text-stone-400 text-lg mb-6 leading-relaxed">
                Growing up in the heart of Tamil Nadu, Amara learned the secret of perfectly fermented batter and the exact moment to toast mustard seeds from her grandmother.
              </p>
              <p className="text-stone-400 text-lg mb-8 leading-relaxed">
                Every spice mix at Dakshin Delights is ground using traditional stone tools to preserve the essential oils and aroma that industrial processing loses. We don't just cook; we preserve a legacy.
              </p>
              <div className="flex items-center space-x-6">
                <img
                  alt="Chef Amara"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG3r10FnhMCepXvfOUvJeDvrM68LN-_g_AU_aC6l-KmywJT1ks71ipd0vV-SMGK_vJSJPw-iYlmBWa_ta1huwvsVkb9AwFe3lsDu6z5vCMAZwxQ7F4A8-6Bim-Hm8zvrhLFp8txQrTLrtYT8w0gOHczJV-VZckSW01iEJqnFMatNIRMWd3ew6ExaDDLafVxSpCegxLcI7eBR8dn60NYelqTn3JS8dymopHwbsB85_rbAMoOgEejPac_fYUy2M9zNIyJpndlPcJXc0"
                  loading="lazy"
                  width="64"
                  height="64"
                />
                <div>
                  <p className="font-bold text-xl italic">Chef Amara Krishnan</p>
                  <p className="text-primary font-medium">Founder & Head Chef</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2">Customer Stories</p>
            <h2 className="text-3xl font-bold">Love Letters from Our Kitchen</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ramesh K.', text: '"The Podi Dosa took me straight back to my childhood in Chennai. Truly authentic flavor profile!"' },
              { name: 'Priya S.', text: '"Fast delivery and the Sambar was still piping hot. The packing is very eco-friendly too."' },
              { name: 'Arun J.', text: '"Finally, a cloud kitchen that doesn\'t compromise on the quality of oil. Tastes just like home."' }
            ].map((t, idx) => (
              <div key={idx} className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-primary mb-4 flex" aria-label="5 out of 5 stars">
                  {[1,2,3,4,5].map(s => <span key={s} className="material-icons" aria-hidden="true">star</span>)}
                </div>
                <p className="text-stone-600 dark:text-stone-400 italic mb-6">{t.text}</p>
                <div className="font-bold">- {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
