'use client';

import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState<any[]>([]);

  function push(toast: any) {
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