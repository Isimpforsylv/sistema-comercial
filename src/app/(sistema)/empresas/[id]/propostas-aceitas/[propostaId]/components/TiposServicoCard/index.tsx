'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add, OpenInNew } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ServicoModal from '../ServicoModal';

interface TiposServicoCardProps {
  empresaId: string | string[];
  propostaId: string | string[];
}

interface Servico {
  id: number;
  nomedescricao: string;
  criadoem: string;
  criadopor: string;
  tiposervico: {
    id: number;
    nometiposervico: string;
  };
  checklist?: { id: number } | null;
  melhoria?: { id: number } | null;
}

export default function TiposServicoCard({ empresaId, propostaId }: TiposServicoCardProps) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchServicos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/servicos`);
      if (response.ok) {
        const data = await response.json();
        setServicos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, [empresaId, propostaId]);

  const handleSuccess = () => {
    setModalOpen(false);
    fetchServicos();
  };

  const handleOpenServico = (servico: Servico) => {
    if (servico.tiposervico.nometiposervico === 'Checklist' && servico.checklist) {
      router.push(`/empresas/${empresaId}/propostas-aceitas/${propostaId}/checklist/${servico.checklist.id}`);
    } else if (servico.tiposervico.nometiposervico === 'Melhoria' && servico.melhoria) {
      router.push(`/empresas/${empresaId}/propostas-aceitas/${propostaId}/melhoria/${servico.melhoria.id}`);
    }
  };

  if (loading) return <Typography>Carregando tipos de serviço...</Typography>;

  if (!mounted) return null;

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Tipos de Serviço</Typography>
            <Button startIcon={<Add />} onClick={() => setModalOpen(true)} variant="contained" size="small">
              Adicionar Serviço
            </Button>
          </Box>

          {servicos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" gutterBottom>
                Nenhum serviço cadastrado
              </Typography>
              <Button variant="contained" onClick={() => setModalOpen(true)} size="small">
                Adicionar Primeiro Serviço
              </Button>
            </Box>
          ) : (
            <List>
              {servicos.map((servico) => (
                <ListItem
                  key={servico.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                  secondaryAction={
                    <Tooltip title={`Abrir ${servico.tiposervico.nometiposervico}`}>
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => handleOpenServico(servico)}
                      >
                        <OpenInNew />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{servico.nomedescricao}</Typography>
                        <Chip
                          label={servico.tiposervico.nometiposervico}
                          size="small"
                          color={servico.tiposervico.nometiposervico === 'Checklist' ? 'primary' : 'secondary'}
                        />
                      </Box>
                    }
                    secondary={
                      `Criado em: ${new Date(servico.criadoem).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} por ${servico.criadopor}`
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <ServicoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        empresaId={empresaId}
        propostaId={propostaId}
      />
    </>
  );
}
