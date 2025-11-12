'use client';

import Header from '@/app/components/Header';
import { useParams } from 'next/navigation';
import { Container, Typography, Box } from '@mui/material';
import InformacoesPropostaCard from './components/InformacoesPropostaCard';
import ValoresCard from './components/ValoresCard';
import TiposServicoCard from './components/TiposServicoCard';

export default function PropostaAceitaDetalhePage() {
  const params = useParams();
  const empresaId = params?.id || '';
  const propostaId = params?.propostaId || '';

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
        </Box>
      </Container>
    </>
  );
}
