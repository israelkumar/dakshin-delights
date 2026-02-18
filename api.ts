import { MenuItem, CartItem, Order } from './types';

const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api`;

const fetchOptions: RequestInit = {
  credentials: 'include',
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...fetchOptions, ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchMenu(filters?: {
  category?: string;
  dietary?: string;
  spiceLevel?: string;
}): Promise<MenuItem[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.dietary) params.set('dietary', filters.dietary);
  if (filters?.spiceLevel) params.set('spiceLevel', filters.spiceLevel);

  const query = params.toString();
  return request<MenuItem[]>(`${BASE_URL}/menu${query ? `?${query}` : ''}`);
}

export async function fetchMenuItem(id: string): Promise<MenuItem> {
  return request<MenuItem>(`${BASE_URL}/menu/${id}`);
}

export async function fetchCart(): Promise<CartItem[]> {
  return request<CartItem[]>(`${BASE_URL}/cart`);
}

export async function addToCartApi(menuItemId: string, quantity = 1): Promise<CartItem[]> {
  return request<CartItem[]>(`${BASE_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ menuItemId, quantity }),
  });
}

export async function updateCartItem(menuItemId: string, quantity: number): Promise<CartItem[]> {
  return request<CartItem[]>(`${BASE_URL}/cart/${menuItemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCartApi(menuItemId: string): Promise<CartItem[]> {
  return request<CartItem[]>(`${BASE_URL}/cart/${menuItemId}`, {
    method: 'DELETE',
  });
}

export async function placeOrder(details: {
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
}): Promise<Order> {
  return request<Order>(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
}

export async function fetchOrders(): Promise<Order[]> {
  return request<Order[]>(`${BASE_URL}/orders`);
}

export async function fetchOrder(id: string): Promise<Order> {
  return request<Order>(`${BASE_URL}/orders/${id}`);
}
