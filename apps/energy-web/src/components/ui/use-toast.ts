'use client';

import { ReactNode, useState } from 'react';

export type ToastItem = {
  id: number;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export type CreateToastInput = Omit<ToastItem, 'id'>;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function push(toast: CreateToastInput) {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
  }

  function remove(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return {
    toasts,
    push,
    remove,
  };
}