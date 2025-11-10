'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Container, Typography, Box } from '@mui/material';
import Header from '@/app/components/Header';
import PreChecklistCard from './components/PreChecklistCard';
import ObservacoesCard, { ObservacoesCardHandle } from './components/ObservacoesCard';

export default function ChecklistPage() {
  const params = useParams();
  const empresaId = params?.id || '';
  const propostaId = params?.propostaId || '';
  const checklistId = params?.checklistId || '';
  const [mounted, setMounted] = useState(false);
  const [etapaFinalizadaNome, setEtapaFinalizadaNome] = useState<string | undefined>(undefined);
  const observacoesRef = useRef<ObservacoesCardHandle>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Checklist
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as etapas do checklist e observações
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Coluna esquerda - Etapas */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <PreChecklistCard 
                checklistId={checklistId} 
                onObservacaoAdded={() => observacoesRef.current?.refresh()}
                onEtapaStatusChange={(finalizada: boolean) => setEtapaFinalizadaNome(finalizada ? 'Pre-Checklist' : undefined)}
              />
              {/* Outras etapas virão aqui */}
            </Box>
          </Box>

          {/* Coluna direita - Observações */}
          <Box sx={{ width: 400 }}>
            <ObservacoesCard ref={observacoesRef} checklistId={checklistId} etapaFinalizadaNome={etapaFinalizadaNome} />
          </Box>
        </Box>
      </Container>
    </>
  );
}
