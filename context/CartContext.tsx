import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

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
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [shippingMethod, setShippingMethodState] = useState<string>('Retirada no Studio Black7 (Gratuita)');
  const [shippingCost, setShippingCost] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Erro ao persistir carrinho:', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1): { success: boolean; message: string } => {
    if (product.stock <= 0 || product.status === 'out_of_stock') {
      return { success: false, message: 'Este produto está esgotado no momento.' };
    }

    let addedSuccessfully = true;
    let feedback = '';

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stock) {
          addedSuccessfully = false;
          feedback = `Quantidade máxima disponível em estoque: ${product.stock} un.`;
          return prev;
        }
        feedback = `${product.name} adicionado ao carrinho!`;
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      } else {
        if (quantity > product.stock) {
          addedSuccessfully = false;
          feedback = `Quantidade solicitada indisponível. Estoque atual: ${product.stock} un.`;
          return prev;
        }
        feedback = `${product.name} adicionado ao carrinho!`;
        return [...prev, { product, quantity }];
      }
    });

    return { success: addedSuccessfully, message: feedback };
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    let ok = true;
    let msg = '';

    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            ok = false;
            msg = `Estoque máximo: ${item.product.stock} unidades.`;
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );

    return { success: ok, message: msg };
  };

  const clearCart = () => {
    setCart([]);
  };

  const setShippingMethod = (method: string, cost: number) => {
    setShippingMethodState(method);
    setShippingCost(cost);
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
