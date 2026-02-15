import { useState } from 'react';
import { placeOrder } from '../api';

interface FormErrors {
  customerName?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
}

export type CheckoutStep = 'contact' | 'address' | 'payment';

interface UseCheckoutFormOptions {
  onSuccess?: (orderId: string) => void;
  onError?: () => void;
}

export function useCheckoutForm(options: UseCheckoutFormOptions = {}) {
  const [activeStep, setActiveStep] = useState<CheckoutStep>('contact');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressType, setAddressType] = useState<'home' | 'work'>('home');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [placing, setPlacing] = useState(false);

  const homeAddress = 'Flat 402, Green Meadows, Koramangala 4th Block, Bangalore';
  const workAddress = 'Indiranagar Tech Hub, 12th Main Road, Indiranagar';

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

  const handleCustomerNameChange = (value: string) => {
    setCustomerName(value);
    setErrors(prev => ({ ...prev, customerName: undefined }));
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setErrors(prev => ({ ...prev, phone: undefined }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    setErrors(prev => ({ ...prev, paymentMethod: undefined }));
  };

  const submitOrder = async () => {
    if (!validate()) {
      // Jump to the step with the first error
      if (errors.customerName || errors.phone) setActiveStep('contact');
      else if (errors.paymentMethod) setActiveStep('payment');
      return { success: false, errors };
    }

    setPlacing(true);
    try {
      const order = await placeOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: addressType === 'home' ? homeAddress : workAddress,
        paymentMethod,
      });

      options.onSuccess?.(order.id);
      return { success: true, orderId: order.id };
    } catch (err) {
      options.onError?.();
      setPlacing(false);
      return { success: false, error: err };
    }
  };

  return {
    // State
    activeStep,
    customerName,
    phone,
    addressType,
    paymentMethod,
    errors,
    placing,
    homeAddress,
    workAddress,

    // Actions
    setActiveStep,
    setCustomerName: handleCustomerNameChange,
    setPhone: handlePhoneChange,
    setAddressType,
    setPaymentMethod: handlePaymentMethodChange,
    submitOrder,
  };
}
