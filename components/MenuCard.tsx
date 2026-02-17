
import React from 'react';
import { MenuItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  variant?: 'grid' | 'featured';
}

const MenuCard: React.FC<MenuCardProps> = React.memo(({ item, onAddToCart, variant = 'grid' }) => {
  if (variant === 'featured') {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-xl overflow-hidden shadow-xl hover:-translate-y-2 transition-transform border border-stone-100 dark:border-stone-800">
        <div className="h-64 relative">
          <img alt={item.name} className="w-full h-full object-cover" src={item.image} loading="lazy" width="400" height="256" />
          <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full font-bold">
            &rupee;{item.price}
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{item.name}</h3>
          <p className="text-stone-600 dark:text-stone-400 text-sm mb-4">{item.description}</p>
          <button
            onClick={() => onAddToCart(item)}
            className="w-full py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors"
            aria-label={`Add ${item.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 rounded-2xl overflow-hidden border border-primary/5 hover:shadow-xl transition-all group flex flex-col">
      <div className="relative h-56">
        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={item.image} alt={item.name} loading="lazy" width="400" height="224" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
            <span className={`w-2 h-2 border ${item.dietary === 'VEG' ? 'border-green-600' : 'border-red-600'} rounded-sm flex items-center justify-center p-0.5`} aria-hidden="true">
              <span className={`w-full h-full ${item.dietary === 'VEG' ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></span>
            </span>
            {item.dietary}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 bg-primary text-white font-bold py-1 px-3 rounded-full text-sm shadow-lg">
          &rupee;{item.price}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.name}</h3>
          <div className="flex items-center text-yellow-500" aria-label={`Rating: ${item.rating} out of 5`}>
            <span className="material-icons text-sm" aria-hidden="true">star</span>
            <span className="text-xs font-bold ml-1 text-slate-700 dark:text-slate-300">{item.rating}</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{item.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="material-icons text-primary/60 text-base" aria-hidden="true">local_fire_department</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{item.spiceLevel}</span>
          </div>
          <button
            onClick={() => onAddToCart(item)}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
            aria-label={`Add ${item.name} to cart`}
          >
            <span className="material-icons text-sm" aria-hidden="true">add_shopping_cart</span>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
});

MenuCard.displayName = 'MenuCard';

export default MenuCard;
