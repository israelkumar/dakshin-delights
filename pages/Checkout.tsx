
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { placeOrder } from '../api';
import { useToast } from '../components/Toast';

const TAX_RATE = 0.05;

interface CheckoutProps {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  onOrderPlaced?: () => void;
}

type CheckoutStep = 'contact' | 'address' | 'payment';

const STEPS: { key: CheckoutStep; label: string; icon: string }[] = [
  { key: 'contact', label: 'Contact', icon: 'person' },
  { key: 'address', label: 'Address', icon: 'location_on' },
  { key: 'payment', label: 'Payment', icon: 'account_balance_wallet' },
];

interface FormErrors {
  customerName?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, removeFromCart, updateQuantity, onOrderPlaced }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [placing, setPlacing] = useState(false);
  const [activeStep, setActiveStep] = useState<CheckoutStep>('contact');

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressType, setAddressType] = useState<'home' | 'work'>('home');
  const [homeAddress] = useState('Flat 402, Green Meadows, Koramangala 4th Block, Bangalore');
  const [workAddress] = useState('Indiranagar Tech Hub, 12th Main Road, Indiranagar');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const subtotal = cart.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
  const taxes = subtotal * TAX_RATE;
  const grandTotal = subtotal + taxes;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Full name is required';
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,15}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid phone number';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) {
      // Jump to the step with the first error
      if (errors.customerName || errors.phone) setActiveStep('contact');
      else if (errors.paymentMethod) setActiveStep('payment');
      showToast('Please fix the errors before placing your order.', 'error');
      return;
    }

    setPlacing(true);
    try {
      const order = await placeOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: addressType === 'home' ? homeAddress : workAddress,
        paymentMethod,
      });
      showToast('Order placed successfully!', 'success');
      onOrderPlaced?.();
      navigate(`/tracking/${order.id}`);
    } catch (err) {
      showToast('Failed to place order. Please try again.', 'error');
      setPlacing(false);
    }
  };

  const stepIndex = STEPS.findIndex(s => s.key === activeStep);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <span className="material-icons text-6xl text-stone-300 mb-4" aria-hidden="true">shopping_cart</span>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-stone-500 mb-6">Add some delicious items from our menu!</p>
        <button onClick={() => navigate('/menu')} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8" role="navigation" aria-label="Checkout progress">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.key}>
            <button
              onClick={() => setActiveStep(step.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                i <= stepIndex
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 text-stone-400'
              }`}
              aria-current={activeStep === step.key ? 'step' : undefined}
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
          <section className={`bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-primary/5 p-6 ${activeStep !== 'contact' ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-icons text-primary" aria-hidden="true">person</span>
              <h2 className="text-xl font-bold">Contact Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-slate-500 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  id="customerName"
                  className={`w-full rounded-lg border bg-transparent focus:ring-primary focus:border-primary px-3 py-2 ${errors.customerName ? 'border-red-500' : 'border-slate-200'}`}
                  type="text"
                  value={customerName}
                  onChange={(e) => { setCustomerName(e.target.value); setErrors(prev => ({ ...prev, customerName: undefined })); }}
                  onFocus={() => setActiveStep('contact')}
                  placeholder="Enter your full name"
                  required
                  aria-invalid={!!errors.customerName}
                  aria-describedby={errors.customerName ? 'customerName-error' : undefined}
                />
                {errors.customerName && <p id="customerName-error" className="text-red-500 text-xs mt-1" role="alert">{errors.customerName}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-500 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  id="phone"
                  className={`w-full rounded-lg border bg-transparent focus:ring-primary focus:border-primary px-3 py-2 ${errors.phone ? 'border-red-500' : 'border-slate-200'}`}
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: undefined })); }}
                  onFocus={() => setActiveStep('contact')}
                  placeholder="+91 98765 43210"
                  required
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && <p id="phone-error" className="text-red-500 text-xs mt-1" role="alert">{errors.phone}</p>}
              </div>
            </div>
          </section>

          {/* Delivery Address */}
          <section className={`bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-primary/5 p-6 ${activeStep !== 'address' ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-icons text-primary" aria-hidden="true">location_on</span>
                <h2 className="text-xl font-bold">Delivery Address</h2>
              </div>
            </div>
            <fieldset>
              <legend className="sr-only">Select delivery address</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`relative flex p-4 cursor-pointer rounded-xl border-2 transition-all ${addressType === 'home' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-zinc-800 hover:border-primary/30'}`}
                  onClick={() => { setAddressType('home'); setActiveStep('address'); }}
                >
                  <input type="radio" name="address" value="home" checked={addressType === 'home'} onChange={() => setAddressType('home')} className="sr-only" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Home</span>
                    <span className="font-semibold">Flat 402, Green Meadows</span>
                    <span className="text-sm text-slate-500">Koramangala 4th Block, Bangalore</span>
                  </div>
                  <span className="material-icons text-primary absolute top-4 right-4 text-xl" aria-hidden="true">{addressType === 'home' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                </label>
                <label
                  className={`relative flex p-4 cursor-pointer rounded-xl border-2 transition-all ${addressType === 'work' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-zinc-800 hover:border-primary/30'}`}
                  onClick={() => { setAddressType('work'); setActiveStep('address'); }}
                >
                  <input type="radio" name="address" value="work" checked={addressType === 'work'} onChange={() => setAddressType('work')} className="sr-only" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Work</span>
                    <span className="font-semibold">Indiranagar Tech Hub</span>
                    <span className="text-sm text-slate-500">12th Main Road, Indiranagar</span>
                  </div>
                  <span className={`material-icons absolute top-4 right-4 text-xl ${addressType === 'work' ? 'text-primary' : 'text-slate-300'}`} aria-hidden="true">{addressType === 'work' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                </label>
              </div>
            </fieldset>
          </section>

          {/* Payment Method */}
          <section className={`bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-primary/5 p-6 ${activeStep !== 'payment' ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-icons text-primary" aria-hidden="true">account_balance_wallet</span>
              <h2 className="text-xl font-bold">Payment Method <span className="text-red-500">*</span></h2>
            </div>
            <fieldset>
              <legend className="sr-only">Select payment method</legend>
              <div className="space-y-4">
                <label
                  className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all ${paymentMethod === 'CARD' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-stone-800'}`}
                  onClick={() => { setPaymentMethod('CARD'); setActiveStep('payment'); setErrors(prev => ({ ...prev, paymentMethod: undefined })); }}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} className="sr-only" />
                    <span className="material-icons text-slate-500" aria-hidden="true">credit_card</span>
                    <span className="font-semibold">Credit or Debit Card</span>
                  </div>
                  <span className={`material-icons ${paymentMethod === 'CARD' ? 'text-primary' : 'text-slate-300'}`} aria-hidden="true">{paymentMethod === 'CARD' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                </label>
                <label
                  className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all ${paymentMethod === 'UPI' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-stone-800'}`}
                  onClick={() => { setPaymentMethod('UPI'); setActiveStep('payment'); setErrors(prev => ({ ...prev, paymentMethod: undefined })); }}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="sr-only" />
                    <span className="material-icons text-slate-500" aria-hidden="true">qr_code_2</span>
                    <span className="font-semibold">UPI (PhonePe, GPay)</span>
                  </div>
                  <span className={`material-icons ${paymentMethod === 'UPI' ? 'text-primary' : 'text-slate-300'}`} aria-hidden="true">{paymentMethod === 'UPI' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                </label>
                <label
                  className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all ${paymentMethod === 'CASH' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-stone-800'}`}
                  onClick={() => { setPaymentMethod('CASH'); setActiveStep('payment'); setErrors(prev => ({ ...prev, paymentMethod: undefined })); }}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="CASH" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="sr-only" />
                    <span className="material-icons text-slate-500" aria-hidden="true">payments</span>
                    <span className="font-semibold">Cash on Delivery</span>
                  </div>
                  <span className={`material-icons ${paymentMethod === 'CASH' ? 'text-primary' : 'text-slate-300'}`} aria-hidden="true">{paymentMethod === 'CASH' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                </label>
              </div>
              {errors.paymentMethod && <p className="text-red-500 text-xs mt-2" role="alert">{errors.paymentMethod}</p>}
            </fieldset>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-primary/5 p-6">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
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
                          aria-label={`Decrease quantity of ${item.menuItem.name}`}
                        >
                          <span className="material-icons text-xs" aria-hidden="true">{item.quantity > 1 ? 'remove' : 'delete'}</span>
                        </button>
                        <span className="text-sm font-bold w-6 text-center" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100 transition-colors"
                          aria-label={`Increase quantity of ${item.menuItem.name}`}
                        >
                          <span className="material-icons text-xs" aria-hidden="true">add</span>
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.menuItem.id)} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <hr className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>&rupee;{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Taxes (5%)</span><span>&rupee;{taxes.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-6 border-t font-bold">
              <span className="text-xl">Grand Total</span>
              <span className="text-2xl text-primary">&rupee;{grandTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl mt-6 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <span>{placing ? 'PLACING ORDER...' : 'PLACE ORDER'}</span>
              <span className="material-icons" aria-hidden="true">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
