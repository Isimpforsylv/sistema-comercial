'use client';

import Header from '@/app/components/Header';
import { useParams } from 'next/navigation';
import { Container, Typography, Box, Button } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import InformacoesPropostaCard from './components/InformacoesPropostaCard';
import ValoresCard from './components/ValoresCard';
import TiposServicoCard from './components/TiposServicoCard';
import EnviarServicoModal from './components/EnviarServicoModal';
import ResumoEnvioCard from './components/ResumoEnvioCard';

export default function PropostaAceitaDetalhePage() {
  const params = useParams();
  const empresaId = params?.id || '';
  const propostaId = params?.propostaId || '';
  const [modalEnvioOpen, setModalEnvioOpen] = useState(false);
  const [proposta, setProposta] = useState<any>(null);
  const [refreshResumo, setRefreshResumo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchProposta();
    }
  }, [empresaId, propostaId, mounted]);

  const fetchProposta = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}`);
      if (response.ok) {
        const data = await response.json();
        setProposta(data);
      }
    } catch (error) {
      console.error('Erro ao buscar proposta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnvioSuccess = () => {
    setModalEnvioOpen(false);
    fetchProposta();
    setRefreshResumo(prev => prev + 1);
  };

  if (loading || !mounted) return null;

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Detalhes da Proposta Aceita
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as informações e recursos da proposta
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <InformacoesPropostaCard empresaId={empresaId} propostaId={propostaId} />
          <ValoresCard empresaId={empresaId} propostaId={propostaId} />
          <TiposServicoCard empresaId={empresaId} propostaId={propostaId} />
          
          {!proposta?.finalizado && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Send />}
                onClick={() => setModalEnvioOpen(true)}
                color="success"
              >
                Enviar Novo Serviço
              </Button>
            </Box>
          )}

          <ResumoEnvioCard key={refreshResumo} empresaId={empresaId} propostaId={propostaId} />
        </Box>
      </Container>

      <EnviarServicoModal
        open={modalEnvioOpen}
        onClose={() => setModalEnvioOpen(false)}
        onSuccess={handleEnvioSuccess}
        empresaId={empresaId}
        propostaId={propostaId}
        proposta={proposta}
      />
    </>
  );
}
