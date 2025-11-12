'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Container, Typography, Box } from '@mui/material';
import Header from '@/app/components/Header';
import PageLoader from '@/app/components/PageLoader';
import StatusSelector from '@/app/components/StatusSelector';
import ValidationModal from '@/app/components/ValidationModal';
import PreChecklistCard from './components/PreChecklistCard';
import ChecklistCard from './components/ChecklistCard';
import ValidacaoDesenvolvimentoCard from './components/ValidacaoDesenvolvimentoCard';
import AssinaturaContratoCard from './components/AssinaturaContratoCard';
import ObservacoesCard, { ObservacoesCardHandle } from './components/ObservacoesCard';
import { usePageLoading } from '@/hooks/usePageLoading';

export default function ChecklistPage() {
  const params = useParams();
  const empresaId = params?.id || '';
  const propostaId = params?.propostaId || '';
  const checklistId = params?.checklistId || '';
  const [mounted, setMounted] = useState(false);
  const [etapasFinalizadas, setEtapasFinalizadas] = useState<string[]>([]);
  const [statusChecklist, setStatusChecklist] = useState('em_andamento');
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [etapasNaoFinalizadas, setEtapasNaoFinalizadas] = useState<string[]>([]);
  const [pendenciasImpeditivas, setPendenciasImpeditivas] = useState<string[]>([]);
  const observacoesRef = useRef<ObservacoesCardHandle>(null);
  const pageLoading = usePageLoading();

  const isFinalizado = statusChecklist === 'finalizado';

  const handleEtapaStatusChange = (nometapa: string, finalizada: boolean) => {
    setEtapasFinalizadas((prev) => {
      if (finalizada) {
        return [...prev.filter((e) => e !== nometapa), nometapa];
      } else {
        return prev.filter((e) => e !== nometapa);
      }
    });
  };

  const handleValidationError = (etapas: string[], pendencias: string[]) => {
    setEtapasNaoFinalizadas(etapas);
    setPendenciasImpeditivas(pendencias);
    setValidationModalOpen(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pageLoading || !mounted) {
    return <PageLoader />;
  }

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

        {/* Status Selector */}
        <Box sx={{ mb: 3 }}>
          <StatusSelector 
            checklistId={checklistId}
            onStatusChange={setStatusChecklist}
            onValidationError={handleValidationError}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Coluna esquerda - Etapas */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <PreChecklistCard 
                checklistId={checklistId} 
                onObservacaoAdded={() => observacoesRef.current?.refresh()}
                onEtapaStatusChange={(finalizada: boolean) => handleEtapaStatusChange('Pre-Checklist', finalizada)}
                disabled={isFinalizado}
              />
              <ChecklistCard 
                checklistId={checklistId} 
                onObservacaoAdded={() => observacoesRef.current?.refresh()}
                onEtapaStatusChange={(finalizada: boolean) => handleEtapaStatusChange('Checklist', finalizada)}
                disabled={isFinalizado}
              />
              <ValidacaoDesenvolvimentoCard 
                checklistId={checklistId} 
                onObservacaoAdded={() => observacoesRef.current?.refresh()}
                onEtapaStatusChange={(finalizada: boolean) => handleEtapaStatusChange('Validação de Desenvolvimento', finalizada)}
                disabled={isFinalizado}
              />
              <AssinaturaContratoCard 
                checklistId={checklistId} 
                onObservacaoAdded={() => observacoesRef.current?.refresh()}
                onEtapaStatusChange={(finalizada: boolean) => handleEtapaStatusChange('Assinatura do Contrato', finalizada)}
                disabled={isFinalizado}
              />
            </Box>
          </Box>

          {/* Coluna direita - Observações */}
          <Box sx={{ width: 400 }}>
            <ObservacoesCard ref={observacoesRef} checklistId={checklistId} etapasFinalizadas={etapasFinalizadas} disabled={isFinalizado} />
          </Box>
        </Box>
      </Container>

      {/* Modal de Validação */}
      <ValidationModal
        open={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        etapasNaoFinalizadas={etapasNaoFinalizadas}
        pendenciasImpeditivas={pendenciasImpeditivas}
      />
    </>
  );
}
