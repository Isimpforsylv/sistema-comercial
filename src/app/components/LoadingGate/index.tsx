'use client';

import React, { useEffect, useState } from 'react';
import { useGlobalLoading } from '../LoadingProvider';
import PageLoader from '../PageLoader';

interface LoadingGateProps {
  children: React.ReactNode;
  // Tempo máximo para evitar travar a página caso algo nunca finalize
  timeoutMs?: number;
}

export default function LoadingGate({ children, timeoutMs = 15000 }: LoadingGateProps) {
  const { isLoading } = useGlobalLoading();
  const [hydrated, setHydrated] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  // Gate apenas do carregamento inicial: depois de liberar uma vez, nunca mais bloqueia a página
  const [initialGateOpen, setInitialGateOpen] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!timeoutMs) return;
    if (!isLoading || !initialGateOpen) return;
    const id = window.setTimeout(() => setTimedOut(true), timeoutMs);
    return () => window.clearTimeout(id);
  }, [isLoading, timeoutMs, initialGateOpen]);

  // Quando a primeira janela de carregamento concluir (ou estourar o timeout), não bloquear mais
  useEffect(() => {
    if (!initialGateOpen) return;
    if (!isLoading || timedOut) {
      setInitialGateOpen(false);
    }
  }, [isLoading, timedOut, initialGateOpen]);

  if (!hydrated) return null;
  const showOverlay = initialGateOpen && isLoading && !timedOut;

  return (
    <>
      {children}
      {showOverlay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.98)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 13000,
          }}
        >
          <PageLoader />
        </div>
      )}
    </>
  );
}
