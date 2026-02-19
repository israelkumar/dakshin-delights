
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { useToast } from '../components/Toast';
import { useCheckoutForm, CheckoutStep } from '../hooks/useCheckoutForm';
import { useLanguage } from '../LanguageContext';

const TAX_RATE = 0.05;

interface CheckoutProps {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  onOrderPlaced?: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, removeFromCart, updateQuantity, onOrderPlaced }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const STEPS: { key: CheckoutStep; label: string; icon: string }[] = [
    { key: 'contact', label: t.checkout.stepContact, icon: 'person' },
    { key: 'address', label: t.checkout.stepAddress, icon: 'location_on' },
    { key: 'payment', label: t.checkout.stepPayment, icon: 'account_balance_wallet' },
  ];

  const form = useCheckoutForm({
    onSuccess: (orderId) => {
      showToast('Order placed successfully!', 'success');
      onOrderPlaced?.();
      navigate(`/tracking/${orderId}`);
    },
    onError: () => {
      showToast('Failed to place order. Please try again.', 'error');
    },
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
  const taxes = subtotal * TAX_RATE;
  const grandTotal = subtotal + taxes;

  const handlePlaceOrder = async () => {
    const result = await form.submitOrder();
    if (!result.success && result.errors) {
      showToast('Please fix the errors before placing your order.', 'error');
    }
  };

  const stepIndex = STEPS.findIndex(s => s.key === form.activeStep);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <span className="material-icons text-6xl text-stone-300 mb-4" aria-hidden="true">shopping_cart</span>
        <h1 className="text-2xl font-bold mb-4">{t.checkout.cartEmpty}</h1>
        <p className="text-stone-500 mb-6">{t.checkout.cartEmptyDesc}</p>
        <button onClick={() => navigate('/menu')} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">{t.checkout.browseMenu}</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t.checkout.title}</h1>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8" role="navigation" aria-label="Checkout progress">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.key}>
            <button
              onClick={() => form.setActiveStep(step.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                i <= stepIndex
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 text-stone-400'
              }`}
              aria-current={form.activeStep === step.key ? 'step' : undefined}
            >
              <span className="material-icons text-sm" aria-hidden="true">{step.icon}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-0.5 mx-1 ${i < stepIndex ? 'bg-primary' : 'bg-stone-200'}`} aria-hidden="true"></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Contact Details */}
          <section className={`bg-white dark:bg-stone-950 rounded-xl shadow-sm border border-primary/5 p-6 ${form.activeStep !== 'contact' ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-icons text-primary" aria-hidden="true">person</span>
              <h2 className="text-xl font-bold">{t.checkout.contactDetails}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-slate-500 mb-1">{t.checkout.fullName} <span className="text-red-500">*</span></label>
                <input
                  id="customerName"
                  className={`w-full rounded-lg border bg-transparent focus:ring-primary focus:border-primary px-3 py-2 ${form.errors.customerName ? 'border-red-500' : 'border-slate-200'}`}
                  type="text"
                  value={form.customerName}
                  onChange={(e) => form.setCustomerName(e.target.value)}
                  onFocus={() => form.setActiveStep('contact')}
                  placeholder={t.checkout.fullNamePlaceholder}
                  required
                  aria-invalid={!!form.errors.customerName}
                  aria-describedby={form.errors.customerName ? 'customerName-error' : undefined}
                />
                {form.errors.customerName && <p id="customerName-error" className="text-red-500 text-xs mt-1" role="alert">{form.errors.customerName}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-500 mb-1">{t.checkout.phoneNumber} <span className="text-red-500">*</span></label>
                <input
                  id="phone"
                  className={`w-full rounded-lg border bg-transparent focus:ring-primary focus:border-primary px-3 py-2 ${form.errors.phone ? 'border-red-500' : 'border-slate-200'}`}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => form.setPhone(e.target.value)}
                  onFocus={() => form.setActiveStep('contact')}
                  placeholder={t.checkout.phonePlaceholder}
                  required
                  aria-invalid={!!form.errors.phone}
                  aria-describedby={form.errors.phone ? 'phone-error' : undefined}
                />
                {form.errors.phone && <p id="phone-error" className="text-red-500 text-xs mt-1" role="alert">{form.errors.phone}</p>}
              </div>
            </div>
          </section>

          {/* Delivery Address */}
          <section className={`bg-white dark:bg-stone-950 rounded-xl shadow-sm border border-primary/5 p-6 ${form.activeStep !== 'address' ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-icons text-primary" aria-hidden="true">location_on</span>
                <h2 className="text-xl font-bold">{t.checkout.deliveryAddress}</h2>
              </div>
            </div>
            <fieldset>
              <legend className="sr-only">{t.checkout.selectAddress}</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`relative flex p-4 cursor-pointer rounded-xl border-2 transition-all ${form.addressType === 'home' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-zinc-900 hover:border-primary/30'}`}
                  onClick={() => { form.setAddressType('home'); form.setActiveStep('address'); }}
                >
                  <input type="radio" name="address" value="home" checked={form.addressType === 'home'} onChange={() => form.setAddressType('home')} className="sr-only" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{t.checkout.home}</span>
                    <span className="font-semibold">Flat 402, Green Meadows</span>
                    <span className="text-sm text-slate-500">Koramangala 4th Block, Bangalore</span>
                  </div>
                  <span className="material-icons text-primary absolute top-4 right-4 text-xl" aria-hidden="true">{form.addressType === 'home' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                </label>
                <label
                  className={`relative flex p-4 cursor-pointer rounded-xl border-2 transition-all ${form.addressType === 'work' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-zinc-900 hover:border-primary/30'}`}
                  onClick={() => { form.setAddressType('work'); form.setActiveStep('address'); }}
                >
                  <input type="radio" name="address" value="work" checked={form.addressType === 'work'} onChange={() => form.setAddressType('work')} className="sr-only" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t.checkout.work}</span>
                    <span className="font-semibold">Indiranagar Tech Hub</span>
                    <span className="text-sm text-slate-500">12th Main Road, Indiranagar</span>
                  </div>
                  <span className={`material-icons absolute top-4 right-4 text-xl ${form.addressType === 'work' ? 'text-primary' : 'text-slate-300'}`} aria-hidden="true">{form.addressType === 'work' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                </label>
              </div>
            </fieldset>
          </section>

          {/* Payment Method */}
          <section className={`bg-white dark:bg-stone-950 rounded-xl shadow-sm border border-primary/5 p-6 ${form.activeStep !== 'payment' ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-icons text-primary" aria-hidden="true">account_balance_wallet</span>
              <h2 className="text-xl font-bold">{t.checkout.paymentMethod} <span className="text-red-500">*</span></h2>
            </div>
            <fieldset>
              <legend className="sr-only">{t.checkout.selectPayment}</legend>
              <div className="space-y-4">
                <label
                  className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all ${form.paymentMethod === 'CARD' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-stone-900'}`}
                  onClick={() => { form.setPaymentMethod('CARD'); form.setActiveStep('payment'); }}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="CARD" checked={form.paymentMethod === 'CARD'} onChange={() => form.setPaymentMethod('CARD')} className="sr-only" />
                    <span className="material-icons text-slate-500" aria-hidden="true">credit_card</span>
                    <span className="font-semibold">{t.checkout.creditDebit}</span>
                  </div>
                  <span className={`material-icons ${form.paymentMethod === 'CARD' ? 'text-primary' : 'text-slate-300'}`} aria-hidden="true">{form.paymentMethod === 'CARD' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                </label>
                <label
                  className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all ${form.paymentMethod === 'UPI' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-stone-900'}`}
                  onClick={() => { form.setPaymentMethod('UPI'); form.setActiveStep('payment'); }}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="UPI" checked={form.paymentMethod === 'UPI'} onChange={() => form.setPaymentMethod('UPI')} className="sr-only" />
                    <span className="material-icons text-slate-500" aria-hidden="true">qr_code_2</span>
                    <span className="font-semibold">{t.checkout.upi}</span>
                  </div>
                  <span className={`material-icons ${form.paymentMethod === 'UPI' ? 'text-primary' : 'text-slate-300'}`} aria-hidden="true">{form.paymentMethod === 'UPI' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                </label>
                <label
                  className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all ${form.paymentMethod === 'CASH' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-stone-900'}`}
                  onClick={() => { form.setPaymentMethod('CASH'); form.setActiveStep('payment'); }}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="CASH" checked={form.paymentMethod === 'CASH'} onChange={() => form.setPaymentMethod('CASH')} className="sr-only" />
                    <span className="material-icons text-slate-500" aria-hidden="true">payments</span>
                    <span className="font-semibold">{t.checkout.cashOnDelivery}</span>
                  </div>
                  <span className={`material-icons ${form.paymentMethod === 'CASH' ? 'text-primary' : 'text-slate-300'}`} aria-hidden="true">{form.paymentMethod === 'CASH' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                </label>
              </div>
              {form.errors.paymentMethod && <p className="text-red-500 text-xs mt-2" role="alert">{form.errors.paymentMethod}</p>}
            </fieldset>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white dark:bg-stone-950 rounded-xl shadow-xl border border-primary/5 p-6">
            <h3 className="font-bold text-lg mb-4">{t.checkout.orderSummary}</h3>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.menuItem.id} className="flex gap-3 items-center">
                  <img src={item.menuItem.image} className="w-12 h-12 rounded-lg object-cover" alt={item.menuItem.name} loading="lazy" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{item.menuItem.name}</h4>
                      <span className="font-semibold text-sm">&rupee;{(item.menuItem.price * item.quantity).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => item.quantity > 1 ? updateQuantity(item.menuItem.id, item.quantity - 1) : removeFromCart(item.menuItem.id)}
                          className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100 transition-colors"
                          aria-label={t.checkout.decreaseQty(item.menuItem.name)}
                        >
                          <span className="material-icons text-xs" aria-hidden="true">{item.quantity > 1 ? 'remove' : 'delete'}</span>
                        </button>
                        <span className="text-sm font-bold w-6 text-center" aria-label={t.checkout.quantityLabel(item.quantity)}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100 transition-colors"
                          aria-label={t.checkout.increaseQty(item.menuItem.name)}
                        >
                          <span className="material-icons text-xs" aria-hidden="true">add</span>
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.menuItem.id)} className="text-red-500 text-xs hover:underline">{t.checkout.remove}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <hr className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500"><span>{t.checkout.subtotal}</span><span>&rupee;{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-500"><span>{t.checkout.taxes}</span><span>&rupee;{taxes.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-6 border-t font-bold">
              <span className="text-xl">{t.checkout.grandTotal}</span>
              <span className="text-2xl text-primary">&rupee;{grandTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={form.placing}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl mt-6 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <span>{form.placing ? t.checkout.placingOrder : t.checkout.placeOrder}</span>
              <span className="material-icons" aria-hidden="true">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
