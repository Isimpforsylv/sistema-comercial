'use client';

import Header from '@/app/components/Header';
import { useParams } from 'next/navigation';
import { Container, Typography, Box, TextField, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import PendenciasCard from './components/PendenciasCard';
import ObservacoesCard from './components/ObservacoesCard';
import StatusSelector from '@/app/components/StatusSelector';
import ValidationModal from '@/app/components/ValidationModal';
import PageLoader from '@/app/components/PageLoader';

export default function MelhoriaPage() {
  const params = useParams();
  const empresaId = params?.id || '';
  const propostaId = params?.propostaId || '';
  const melhoriaId = params?.melhoriaId || '';
  const [melhoria, setMelhoria] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [observacoesKey, setObservacoesKey] = useState(0);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [etapasNaoFinalizadas, setEtapasNaoFinalizadas] = useState<string[]>([]);
  const [pendenciasImpeditivas, setPendenciasImpeditivas] = useState<string[]>([]);
  const [codigoEspecificacao, setCodigoEspecificacao] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchMelhoria();
    }
  }, [empresaId, propostaId, melhoriaId, mounted]);

  const fetchMelhoria = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/melhoria/${melhoriaId}`);
      if (response.ok) {
        const data = await response.json();
        setMelhoria(data);
        setCodigoEspecificacao(data.codigoespecificacao || '');
      }
    } catch (error) {
      console.error('Erro ao buscar melhoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleObservacaoAdded = () => {
    setObservacoesKey(prev => prev + 1);
  };

  const handleStatusChange = async (newStatus: string) => {
    await fetchMelhoria();
  };

  const handleValidationError = (etapas: string[], pendencias: string[]) => {
    setEtapasNaoFinalizadas(etapas);
    setPendenciasImpeditivas(pendencias);
    setValidationModalOpen(true);
  };

  const handleCodigoEspecificacaoBlur = async () => {
    if (!melhoriaId) return;
    
    try {
      await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/melhoria/${melhoriaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoespecificacao: codigoEspecificacao }),
      });
    } catch (error) {
      console.error('Erro ao atualizar código de especificação:', error);
    }
  };

  const disabled = melhoria?.status === 'finalizado';

  if (loading || !mounted) return <PageLoader />;

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Melhoria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie pendências e observações da melhoria
            </Typography>
          </Box>
          <StatusSelector 
            melhoriaId={melhoriaId}
            empresaId={empresaId}
            propostaId={propostaId}
            onStatusChange={handleStatusChange}
            onValidationError={handleValidationError}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: '1 1 65%' }}>
            <PendenciasCard 
              empresaId={empresaId} 
              propostaId={propostaId} 
              melhoriaId={melhoriaId}
              disabled={disabled}
              onObservacaoAdded={handleObservacaoAdded}
            />
            
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Código da Especificação
              </Typography>
              <TextField
                fullWidth
                label="Código da Especificação"
                value={codigoEspecificacao}
                onChange={(e) => setCodigoEspecificacao(e.target.value)}
                onBlur={handleCodigoEspecificacaoBlur}
                disabled={disabled}
                placeholder="Digite o código da especificação"
              />
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 35%' }}>
            <ObservacoesCard 
              key={observacoesKey}
              melhoriaId={melhoriaId}
              empresaId={empresaId}
              propostaId={propostaId}
              etapasFinalizadas={melhoria?.etapas?.filter((e: any) => e.finalizada).map((e: any) => e.nometapa) || []}
              disabled={disabled}
            />
          </Box>
        </Box>
      </Container>

      <ValidationModal
        open={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        etapasNaoFinalizadas={etapasNaoFinalizadas}
        pendenciasImpeditivas={pendenciasImpeditivas}
      />
    </>
  );
}
