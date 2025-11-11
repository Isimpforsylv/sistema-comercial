'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import Header from '@/app/components/Header';
import PageLoader from '@/app/components/PageLoader';
import PropostaAceitaModal from './components/PropostaAceitaModal';
import { usePageLoading } from '@/hooks/usePageLoading';

interface PropostaAceita {
  id: number;
  nomeproposta: string;
  criadoem: string;
}

export default function PropostasAceitasPage() {
  const params = useParams();
  const empresaId = Number(params?.id);
  const [modalOpen, setModalOpen] = useState(false);
  const [propostas, setPropostas] = useState<PropostaAceita[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const pageLoading = usePageLoading();

  const fetchPropostas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas`);
      const data = await response.json();
      setPropostas(data);
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (empresaId) fetchPropostas();
  }, [empresaId]);

  const handleSuccess = async () => {
    // Salva posição do scroll antes de atualizar
    const scrollY = window.scrollY;
    
    setModalOpen(false);
    
    // Recarrega propostas
    await fetchPropostas();
    
    // Restaura posição do scroll imediatamente após renderizar
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  if (pageLoading || initialLoad) {
    return <PageLoader />;
  }

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Lista de Propostas
          </Typography>
          <Button variant="contained" onClick={() => setModalOpen(true)}>
            Criar Nova Proposta
          </Button>
        </Box>
        {loading ? (
          <Typography>Carregando...</Typography>
        ) : propostas.length === 0 ? (
          <Card>
            <CardContent>
              <Typography align="center" color="text.secondary">
                Nenhuma proposta cadastrada
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {propostas.map((prop) => (
                <Card key={prop.id} sx={{ cursor: 'pointer' }} onClick={() => window.location.href = `/empresas/${empresaId}/propostas-aceitas/${prop.id}`}>
                  <CardContent>
                    <Typography variant="h6">{prop.nomeproposta}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Criado em: {new Date(prop.criadoem).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </CardContent>
                </Card>
            ))}
          </Box>
        )}
      </Container>
      <PropostaAceitaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        empresaId={empresaId}
      />
    </>
  );
}
