'use client';

import { useEffect, useState } from 'react';
import ToastContainer, { Toast, ToastType } from '@/components/common/Toast';

export default function CartToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleCartToast = (event: CustomEvent) => {
      const { type, message } = event.detail;
      const newToast: Toast = {
        id: `cart-${Date.now()}-${Math.random()}`,
        message: message || 'Item added to cart',
        type: (type as ToastType) || 'success',
        duration: 3000,
      };
      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener('cartToast', handleCartToast as EventListener);

    return () => {
      window.removeEventListener('cartToast', handleCartToast as EventListener);
    };
  }, []);

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return <ToastContainer toasts={toasts} onClose={handleClose} position="top-right" />;
}
