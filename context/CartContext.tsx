import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem } from '../types';
import { useStore } from './StoreContext';
const shippingPrices: Record<string, number> = { 'Retirada no Studio Black7 (Gratuita)': 0, 'Entrega Expressa Zona Norte': 15, 'Envio Padrão São Paulo Capital': 25 };

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shipping: number;
  shippingMethod: string;
  setShippingMethod: (method: string, cost: number) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sb7_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      const value = saved ? JSON.parse(saved) : [];
      return Array.isArray(value) ? value.filter(item => item?.product?.id && Number.isInteger(item.quantity) && item.quantity > 0) : [];
    } catch {
      return [];
    }
  });

  const [shippingMethod, setShippingMethodState] = useState<string>(() => { try { const saved = localStorage.getItem('sb7-cart-shipping'); return saved && saved in shippingPrices ? saved : 'Retirada no Studio Black7 (Gratuita)'; } catch { return 'Retirada no Studio Black7 (Gratuita)'; } });
  const shippingCost = shippingPrices[shippingMethod] || 0;
  const { products } = useStore();
  const cartRef = useRef(cart);
  const commitCart = (next: CartItem[]) => { cartRef.current = next; setCart(next); };
  useEffect(() => {
    if (!products.length) return;
    const next = cartRef.current.map(item => ({ ...item, product: products.find(p => p.id === item.product.id) || { ...item.product, status: 'inactive' as const, stock: 0 } }));
    if (JSON.stringify(next) !== JSON.stringify(cartRef.current)) commitCart(next);
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Erro ao persistir carrinho:', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1): { success: boolean; message: string } => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return { success: false, message: 'Escolha entre 1 e 20 unidades.' };
    if (product.stock <= 0 || product.status !== 'active') {
      return { success: false, message: 'Este produto está esgotado no momento.' };
    }

    const prev = cartRef.current;
      const existing = prev.find(item => item.product.id === product.id);
      const nextQty = (existing?.quantity || 0) + quantity;
      if (nextQty > Math.min(product.stock,20)) return { success: false, message: `Quantidade máxima disponível: ${Math.min(product.stock,20)} un.` };
      commitCart(existing ? prev.map(item => item.product.id === product.id ? { product, quantity: nextQty } : item) : [...prev,{ product, quantity }]);
      return { success: true, message: `${product.name} adicionado ao carrinho!` };
  };

  const removeFromCart = (productId: string) => {
    commitCart(cartRef.current.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const item = cartRef.current.find(item => item.product.id === productId);
    if (!item || !Number.isInteger(quantity) || quantity > Math.min(item.product.stock,20)) return { success: false, message: `Estoque máximo: ${Math.min(item?.product.stock || 0,20)} unidades.` };
    commitCart(cartRef.current.map(item => item.product.id === productId ? { ...item, quantity } : item));
    return { success: true };
  };

  const clearCart = () => {
    commitCart([]);
  };

  const setShippingMethod = (method: string, cost: number) => {
    if (!(method in shippingPrices)) return;
    setShippingMethodState(method);
    try { localStorage.setItem('sb7-cart-shipping', method); } catch { /* Keep the selected method for this visit. */ }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => {
    const unitPrice = item.product.salePrice ?? item.product.price;
    return acc + unitPrice * item.quantity;
  }, 0);
  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shipping: shippingCost,
        shippingMethod,
        setShippingMethod,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de um CartProvider');
  }
  return context;
};
