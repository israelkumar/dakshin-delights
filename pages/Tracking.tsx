
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Order } from '../types';
import { fetchOrder } from '../api';
import { useToast } from '../components/Toast';
import { useLanguage } from '../LanguageContext';

const Tracking: React.FC = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (id) {
      fetchOrder(id)
        .then(setOrder)
        .catch(err => {
          setError('Failed to load order details.');
          showToast('Failed to load order tracking.', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [id, showToast]);

  const getTrackingSteps = (status: string) => {
    const steps = [
      { title: t.tracking.orderConfirmed, time: t.tracking.confirmed, active: true, done: true },
      { title: t.tracking.preparingMeal, time: '', active: false, done: false },
      { title: t.tracking.pickedUp, time: '', active: false, done: false },
      { title: t.tracking.delivered, time: '', active: false, done: false }
    ];
    if (status === 'PREPARING' || status === 'ON THE WAY' || status === 'DELIVERED') {
      steps[1].active = true;
      steps[1].done = true;
      steps[1].time = t.tracking.inProgress;
    }
    if (status === 'ON THE WAY' || status === 'DELIVERED') {
      steps[2].active = true;
      steps[2].done = true;
      steps[2].time = t.tracking.pickedUpTime;
    }
    if (status === 'DELIVERED') {
      steps[3].active = true;
      steps[3].done = true;
      steps[3].time = t.tracking.delivered;
    }
    if (status === 'PREPARING') {
      steps[1].done = false;
    }
    return steps;
  };

  const trackingSteps = order ? getTrackingSteps(order.status) : [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="h-8 w-48 skeleton mb-4"></div>
        <div className="h-4 w-64 skeleton mb-8"></div>
        <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 min-h-[400px] skeleton"></div>
            <div className="p-6 space-y-4">
              <div className="h-8 w-32 skeleton"></div>
              <div className="h-4 w-24 skeleton"></div>
              <div className="space-y-6 mt-8">
                {[1,2,3,4].map(i => <div key={i} className="flex gap-4"><div className="h-6 w-6 rounded-full skeleton"></div><div className="h-4 w-32 skeleton"></div></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <span className="material-icons text-6xl text-red-300 mb-4" aria-hidden="true">error_outline</span>
        <h1 className="text-2xl font-bold mb-2">{t.tracking.orderNotFound}</h1>
        <p className="text-stone-500 mb-6">{error || t.tracking.couldntFind}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 relative">
      <div className="absolute inset-0 south-indian-pattern pointer-events-none -z-10 opacity-5" aria-hidden="true"></div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold uppercase tracking-tight">{t.tracking.title}</h1>
        <p className="text-stone-500 mt-2">{t.tracking.subtitle}</p>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-primary/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 relative min-h-[400px] bg-gray-100 overflow-hidden map-bg">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="absolute w-full h-full opacity-30" viewBox="0 0 400 300" aria-hidden="true">
                <path d="M50,250 Q150,200 250,150 T350,50" fill="none" stroke="#ec5b13" strokeDasharray="8 4" strokeWidth="4"></path>
              </svg>
              <div className="absolute bottom-10 left-10 flex flex-col items-center">
                <div className="bg-white dark:bg-gray-950 p-2 rounded-lg shadow-lg border-2 border-primary">
                  <span className="material-icons text-primary" aria-hidden="true">store</span>
                </div>
                <span className="text-[10px] font-bold mt-1 bg-white dark:bg-gray-950 px-2 rounded">Dakshin Delights</span>
              </div>
              <div className="absolute top-10 right-10 flex flex-col items-center">
                <div className="bg-white dark:bg-gray-950 p-2 rounded-lg shadow-lg border-2 border-gray-400">
                  <span className="material-icons text-gray-600" aria-hidden="true">home</span>
                </div>
                <span className="text-[10px] font-bold mt-1 bg-white dark:bg-gray-950 px-2 rounded">{t.checkout.home}</span>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="bg-primary p-2.5 rounded-full shadow-2xl ring-4 ring-white">
                  <span className="material-icons text-white leading-none" aria-hidden="true">motorcycle</span>
                </div>
                <div className="mt-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg" aria-live="polite">{order.status}</div>
              </div>
            </div>
          </div>
          <div className="p-6 border-l border-gray-100 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col justify-between">
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold">{order.eta ? `ETA: ${order.eta}` : t.tracking.orderPlaced}</h2>
                <p className="text-stone-500 text-sm mt-1">{t.tracking.orderNum}{id}</p>
                <p className="text-stone-400 text-xs mt-1">{t.tracking.total}: &rupee;{order.total.toFixed(2)} &bull; {t.tracking.items(order.items.length)}</p>
              </div>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100" role="list" aria-label="Delivery progress">
                {trackingSteps.map((step, i) => (
                  <div key={i} className="flex gap-4 relative" role="listitem">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ring-4 ring-white dark:ring-stone-900 ${step.done ? 'bg-green-500' : step.active ? 'bg-primary' : 'bg-gray-200'}`} aria-hidden="true">
                      <span className="material-icons text-white text-xs">{step.done ? 'check' : step.active ? 'local_shipping' : 'location_on'}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${step.active ? 'text-primary' : 'text-stone-400'}`}>{step.title}</p>
                      <p className="text-xs text-stone-500">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-stone-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img alt="Delivery partner Ramesh Kumar" className="h-12 w-12 rounded-full border-2 border-primary/20 object-cover" src="https://picsum.photos/100/100?random=1" loading="lazy" width="48" height="48" />
                  <div>
                    <p className="text-sm font-bold">Ramesh Kumar</p>
                    <p className="text-xs text-stone-500">{t.tracking.deliveryPartner}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 rounded-full bg-primary/10 text-primary" aria-label={t.tracking.callPartner}><span className="material-icons text-lg" aria-hidden="true">call</span></button>
                  <button className="p-2.5 rounded-full bg-primary/10 text-primary" aria-label={t.tracking.chatPartner}><span className="material-icons text-lg" aria-hidden="true">chat</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
