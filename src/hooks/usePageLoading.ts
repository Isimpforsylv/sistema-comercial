'use client';

import { useEffect, useRef, useState } from 'react';
import { useGlobalLoading } from '@/app/components/LoadingProvider';

type Options = {
  // Tempo máximo para a primeira liberação; depois disso o gate local desarma
  timeoutMs?: number;
  // Se true (default), só bloqueia na primeira janela de carregamento após mount
  gateOnce?: boolean;
};

// Gate de carregamento no nível da página: bloqueia apenas o primeiro paint
export function usePageLoading(opts: Options = {}) {
  const { isLoading } = useGlobalLoading();
  const { timeoutMs = 15000, gateOnce = true } = opts;
  const [hydrated, setHydrated] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [gateOpen, setGateOpen] = useState(true);
  const timeoutId = useRef<number | null>(null);

  useEffect(() => setHydrated(true), []);

  // Controla timeout apenas enquanto o gate estiver aberto
  useEffect(() => {
    if (!gateOpen) return;
    if (!timeoutMs) return;
    if (!isLoading) return;
    if (timeoutId.current) window.clearTimeout(timeoutId.current);
    timeoutId.current = window.setTimeout(() => setTimedOut(true), timeoutMs);
    return () => {
      if (timeoutId.current) window.clearTimeout(timeoutId.current);
    };
  }, [isLoading, timeoutMs, gateOpen]);

  // Fecha o gate quando a primeira janela terminar (ou estourar timeout)
  useEffect(() => {
    if (!gateOpen) return;
    if (!gateOnce) return; // mantém comportamento antigo se quiser
    if (!isLoading || timedOut) {
      setGateOpen(false);
    }
  }, [isLoading, timedOut, gateOpen, gateOnce]);

  // Enquanto não hidratar, considere carregando para evitar FOUC
  if (!hydrated) return true;
  if (gateOnce) {
    return gateOpen && isLoading && !timedOut;
  }
  // Modo legado: acompanha isLoading sempre
  return isLoading;
}
