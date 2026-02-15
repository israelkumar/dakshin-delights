/**
 * Server-side validation utilities
 * These mirror client-side validation but cannot be bypassed via direct API calls
 */

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends Error {
  errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationException';
    this.errors = errors;
  }
}

/**
 * Validates customer name
 * Rules: Required, 2-50 characters, letters/spaces only
 */
export function validateName(name: string): ValidationError | null {
  if (!name || typeof name !== 'string') {
    return { field: 'customerName', message: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { field: 'customerName', message: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { field: 'customerName', message: 'Name must be less than 50 characters' };
  }

  if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    return { field: 'customerName', message: 'Name can only contain letters and spaces' };
  }

  return null;
}

/**
 * Validates phone number
 * Rules: Required, 10 digits
 */
export function validatePhone(phone: string): ValidationError | null {
  if (!phone || typeof phone !== 'string') {
    return { field: 'phone', message: 'Phone number is required' };
  }

  const trimmed = phone.trim();

  if (!/^\d{10}$/.test(trimmed)) {
    return { field: 'phone', message: 'Phone number must be exactly 10 digits' };
  }

  return null;
}

/**
 * Validates address
 * Rules: Required, 10-200 characters
 */
export function validateAddress(address: string): ValidationError | null {
  if (!address || typeof address !== 'string') {
    return { field: 'address', message: 'Address is required' };
  }

  const trimmed = address.trim();

  if (trimmed.length < 10) {
    return { field: 'address', message: 'Address must be at least 10 characters' };
  }

  if (trimmed.length > 200) {
    return { field: 'address', message: 'Address must be less than 200 characters' };
  }

  return null;
}

/**
 * Validates payment method
 * Rules: Required, must be one of the accepted values
 */
export function validatePaymentMethod(method: string): ValidationError | null {
  if (!method || typeof method !== 'string') {
    return { field: 'paymentMethod', message: 'Payment method is required' };
  }

  const validMethods = ['CARD', 'UPI', 'CASH'];
  if (!validMethods.includes(method.toUpperCase())) {
    return { field: 'paymentMethod', message: `Payment method must be one of: ${validMethods.join(', ')}` };
  }

  return null;
}

/**
 * Validates an order request body
 * @throws ValidationException if validation fails
 */
export function validateOrderRequest(body: any): void {
  const errors: ValidationError[] = [];

  const nameError = validateName(body.customerName);
  if (nameError) errors.push(nameError);

  const phoneError = validatePhone(body.phone);
  if (phoneError) errors.push(phoneError);

  const addressError = validateAddress(body.address);
  if (addressError) errors.push(addressError);

  const paymentError = validatePaymentMethod(body.paymentMethod);
  if (paymentError) errors.push(paymentError);

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }
}
