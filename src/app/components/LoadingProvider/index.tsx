'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type LoadingContextType = {
  // Número de operações em andamento
  activeCount: number;
  // Indica se deve bloquear a página
  isLoading: boolean;
  // Inicia uma operação manual e retorna o finalizador
  startTask: () => () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function useGlobalLoading(): LoadingContextType {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useGlobalLoading deve ser usado dentro de <LoadingProvider />');
  return ctx;
}

const PATCH_FLAG = '__ci2001_fetch_patched__';

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [activeCount, setActiveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const hideTimer = useRef<number | null>(null);

  const inc = useCallback(() => setActiveCount((c) => c + 1), []);
  const dec = useCallback(() => setActiveCount((c) => Math.max(0, c - 1)), []);

  // Controla visibilidade com pequeno debounce para evitar flicker
  useEffect(() => {
    if (activeCount > 0) {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      setIsLoading(true);
    } else {
      // atraso curto para evitar piscar
      hideTimer.current = window.setTimeout(() => setIsLoading(false), 150);
    }
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [activeCount]);

  // Patching global fetch no client para contar requisições
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (w[PATCH_FLAG]) return;
    w[PATCH_FLAG] = true;

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        // Determina URL e opções
        const input = args[0];
        const init = (args[1] || {}) as RequestInit;

        // Permite pular contagem explicitamente
        const headers = new Headers(init.headers as any);
        const skip = headers.get('x-loading-skip');
        if (skip === '1') {
          return await originalFetch(...args);
        }

        // Normaliza URL
        let urlStr = '';
        if (typeof input === 'string') urlStr = input;
        else if (input instanceof URL) urlStr = input.toString();
        else if (input && typeof (input as Request).url === 'string') urlStr = (input as Request).url;

        // Só contar chamadas à API do próprio app (evita HMR/Next/dev overlay)
        let isApi = false;
        try {
          if (urlStr.startsWith('/')) {
            isApi = urlStr.startsWith('/api/');
          } else {
            const url = new URL(urlStr, window.location.origin);
            const sameOrigin = url.origin === window.location.origin;
            isApi = sameOrigin && url.pathname.startsWith('/api/');
          }
        } catch {
          // Em caso de URL inválida, não conta
          isApi = false;
        }

        if (!isApi) {
          return await originalFetch(...args);
        }

        inc();
        try {
          return await originalFetch(...args);
        } finally {
          dec();
        }
      } catch (e) {
        // Em caso de erro no wrapper, não quebrar fetch
        return await originalFetch(...args);
      }
    };

    return () => {
      // não desfazemos o patch para evitar inconsistência entre renders
    };
  }, [inc, dec]);

  // Permite tarefas manuais (não baseadas em fetch)
  const startTask = useCallback(() => {
    inc();
    let done = false;
    return () => {
      if (done) return;
      done = true;
      dec();
    };
  }, [inc, dec]);

  const value = useMemo(() => ({ activeCount, isLoading, startTask }), [activeCount, isLoading, startTask]);

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}
