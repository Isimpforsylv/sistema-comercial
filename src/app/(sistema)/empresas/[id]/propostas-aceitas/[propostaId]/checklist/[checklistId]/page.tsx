'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Container, Typography, Box } from '@mui/material';
import Header from '@/app/components/Header';
import PreChecklistCard from './components/PreChecklistCard';
import ChecklistCard from './components/ChecklistCard';
import ValidacaoDesenvolvimentoCard from './components/ValidacaoDesenvolvimentoCard';
import AssinaturaContratoCard from './components/AssinaturaContratoCard';
import ObservacoesCard, { ObservacoesCardHandle } from './components/ObservacoesCard';

export default function ChecklistPage() {
  const params = useParams();
  const empresaId = params?.id || '';
  const propostaId = params?.propostaId || '';
  const checklistId = params?.checklistId || '';
  const [mounted, setMounted] = useState(false);
  const [etapasFinalizadas, setEtapasFinalizadas] = useState<string[]>([]);
  const observacoesRef = useRef<ObservacoesCardHandle>(null);

  const handleEtapaStatusChange = (nometapa: string, finalizada: boolean) => {
    setEtapasFinalizadas((prev) => {
      if (finalizada) {
        return [...prev.filter((e) => e !== nometapa), nometapa];
      } else {
        return prev.filter((e) => e !== nometapa);
      }
    });
  };

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
                onEtapaStatusChange={(finalizada: boolean) => handleEtapaStatusChange('Pre-Checklist', finalizada)}
              />
              <ChecklistCard 
                checklistId={checklistId} 
                onObservacaoAdded={() => observacoesRef.current?.refresh()}
                onEtapaStatusChange={(finalizada: boolean) => handleEtapaStatusChange('Checklist', finalizada)}
              />
              <ValidacaoDesenvolvimentoCard 
                checklistId={checklistId} 
                onObservacaoAdded={() => observacoesRef.current?.refresh()}
                onEtapaStatusChange={(finalizada: boolean) => handleEtapaStatusChange('Validação de Desenvolvimento', finalizada)}
              />
              <AssinaturaContratoCard 
                checklistId={checklistId} 
                onObservacaoAdded={() => observacoesRef.current?.refresh()}
                onEtapaStatusChange={(finalizada: boolean) => handleEtapaStatusChange('Assinatura do Contrato', finalizada)}
              />
            </Box>
          </Box>

          {/* Coluna direita - Observações */}
          <Box sx={{ width: 400 }}>
            <ObservacoesCard ref={observacoesRef} checklistId={checklistId} etapasFinalizadas={etapasFinalizadas} />
          </Box>
        </Box>
      </Container>
    </>
  );
}
