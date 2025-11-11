'use client';

import { useState, useEffect } from 'react';

export function usePageLoading() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tempo mínimo de carregamento para garantir transição suave
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // Aumentado para 800ms

    return () => clearTimeout(timer);
  }, []);

  return loading;
}
