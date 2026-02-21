
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import { fetchOrders } from '../api';
import { useToast } from '../components/Toast';
import { useLanguage } from '../LanguageContext';

const OrderSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl p-5">
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1 w-full space-y-3">
        <div className="h-3 w-32 skeleton"></div>
        <div className="h-5 w-48 skeleton"></div>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <div className="h-10 w-24 skeleton rounded-lg"></div>
        <div className="h-10 w-24 skeleton rounded-lg"></div>
      </div>
    </div>
  </div>
);

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(err => {
        setError(t.orders.somethingWentWrong);
        showToast('Failed to load orders. Please try again.', 'error');
      })
      .finally(() => setLoading(false));
  // t intentionally omitted from deps to avoid re-fetching on language change
  }, [showToast]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeOrders = orders.filter(o => o.status === 'PREPARING' || o.status === 'ON THE WAY');
  const pastOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 relative">
      <div className="absolute inset-0 south-indian-pattern pointer-events-none -z-10 opacity-5" aria-hidden="true"></div>
      <h1 className="text-3xl font-bold mb-2">{t.orders.title}</h1>
      <p className="text-stone-500 mb-10">{t.orders.subtitle}</p>

      <div className="space-y-6" aria-busy={loading}>
        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-16">
            <span className="material-icons text-6xl text-red-300 mb-4" aria-hidden="true">error_outline</span>
            <h2 className="text-xl font-bold mb-2">{t.orders.somethingWentWrong}</h2>
            <p className="text-stone-500 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">{t.orders.tryAgain}</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {activeOrders.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-3 w-3 rounded-full bg-primary animate-pulse" aria-hidden="true"></span>
                  <h2 className="text-xl font-semibold uppercase tracking-wider text-primary">{t.orders.activeOrders}</h2>
                </div>

                {activeOrders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-stone-900 border border-primary/20 rounded-xl p-6 shadow-sm" role="article" aria-label={t.orders.activeOrderLabel(order.id)}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <span className="text-xs font-bold text-primary/70 uppercase">Order #{order.id}</span>
                        <h3 className="text-lg font-bold">{order.items[0]?.menuItem.name || 'Order'}</h3>
                      </div>
                      <Link to={`/tracking/${order.id}`} className="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-primary/20">{t.orders.trackLive}</Link>
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full mb-2" role="progressbar" aria-valuenow={order.status === 'ON THE WAY' ? 66 : 33} aria-valuemin={0} aria-valuemax={100}>
                      <div className={`h-1 bg-primary rounded-full ${order.status === 'ON THE WAY' ? 'w-2/3' : 'w-1/3'}`}></div>
                    </div>
                    <p className="text-sm text-stone-500">
                      {order.status === 'PREPARING' ? t.orders.preparingMeal : t.orders.onTheWay}
                      {order.eta ? ` \u2022 ETA: ${order.eta}` : ''}
                    </p>
                  </div>
                ))}
              </>
            )}

            {orders.length === 0 && (
              <div className="text-center py-16">
                <span className="material-icons text-6xl text-stone-300 mb-4" aria-hidden="true">receipt_long</span>
                <h2 className="text-2xl font-bold mb-2">{t.orders.noOrders}</h2>
                <p className="text-stone-500 mb-6">{t.orders.noOrdersDesc}</p>
                <Link to="/menu" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">{t.orders.browseMenu}</Link>
              </div>
            )}

            {pastOrders.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-12 mb-6 flex items-center gap-2">
                  <span className="material-icons text-gray-400" aria-hidden="true">history</span>
                  {t.orders.pastOrders}
                </h2>

                <div className="space-y-4">
                  {pastOrders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl p-5 hover:border-primary/30 transition-all" role="article" aria-label={t.orders.pastOrderLabel(order.id, order.status)}>
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-xs text-gray-400 font-medium">{order.date} &bull; #{order.id}</span>
                              <h4 className="font-bold text-lg">
                                {order.items[0]?.menuItem.name || 'Order'}
                                {order.items.length > 1 ? ` ${t.orders.more(order.items.length - 1)}` : ''}
                              </h4>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold">&rupee;{order.total.toFixed(2)}</span>
                              <div className={`flex items-center justify-end gap-1 text-xs font-bold mt-1 ${order.status === 'DELIVERED' ? 'text-green-600' : 'text-red-500'}`}>
                                <span className="material-icons text-sm" aria-hidden="true">{order.status === 'DELIVERED' ? 'check_circle' : 'cancel'}</span>
                                {order.status}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto md:pl-6 md:border-l border-gray-100">
                          <button className="flex-1 md:flex-none whitespace-nowrap px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all" aria-label={t.orders.reorderLabel(order.items[0]?.menuItem.name || 'order')}>{t.orders.reorder}</button>
                          <button className="flex-1 md:flex-none whitespace-nowrap px-6 py-2.5 border border-stone-200 text-stone-600 font-medium rounded-lg hover:bg-stone-50 transition-all" aria-label={t.orders.detailsLabel(order.id)}>{t.orders.details}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
