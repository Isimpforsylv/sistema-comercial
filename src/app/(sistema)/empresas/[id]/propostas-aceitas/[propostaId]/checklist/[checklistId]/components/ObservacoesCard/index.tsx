'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { ExpandMore, Settings } from '@mui/icons-material';
import PendenciasModal from '../PendenciasModal';

interface ObservacoesCardProps {
  checklistId: string | string[];
  etapasFinalizadas?: string[]; // Array de nomes das etapas finalizadas
}

export interface ObservacoesCardHandle {
  refresh: () => void;
}

interface Observacao {
  id: number;
  observacao: string;
  criadopor: string;
  criadoem: string;
}

interface ObservacoesPorEtapa {
  [nometapa: string]: Observacao[];
}

const ObservacoesCard = forwardRef<ObservacoesCardHandle, ObservacoesCardProps>(({ checklistId, etapasFinalizadas = [] }, ref) => {
  const [observacoes, setObservacoes] = useState<ObservacoesPorEtapa>({});
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [pendenciasModalOpen, setPendenciasModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchObservacoes = async () => {
    if (initialLoad) {
      setLoading(true);
    }
    try {
      const response = await fetch(`/api/checklist/${checklistId}/observacoes`);
      if (response.ok) {
        const data = await response.json();
        // Agrupar por etapa
        const grouped: ObservacoesPorEtapa = {};
        data.forEach((obs: Observacao & { nometapa: string }) => {
          if (!grouped[obs.nometapa]) {
            grouped[obs.nometapa] = [];
          }
          grouped[obs.nometapa].push(obs);
        });
        setObservacoes(grouped);
      }
    } catch (error) {
      console.error('Erro ao buscar observações:', error);
    } finally {
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchObservacoes();
    }
  }, [checklistId, mounted]);

  useImperativeHandle(ref, () => ({
    refresh: fetchObservacoes
  }));

  if (loading || !mounted) return <Typography>Carregando...</Typography>;

  return (
    <>
      <Card sx={{ position: 'sticky', top: 20 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="Observações" />
            <Tab label="Pendências" />
          </Tabs>

          {/* Tab Observações */}
          {tabValue === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Observações
              </Typography>
        
        {Object.keys(observacoes).length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Nenhuma observação cadastrada
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(observacoes).map(([nometapa, obs]) => {
              const estaFinalizada = etapasFinalizadas.includes(nometapa);
              
              return (
                <Accordion key={nometapa} defaultExpanded={!estaFinalizada}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {nometapa} ({obs.length}){estaFinalizada ? ' - Finalizada' : ''}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense disablePadding>
                      {obs.map((observacao, index) => (
                        <Box key={observacao.id}>
                          <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemText
                              primary={observacao.observacao}
                              secondary={`Por ${observacao.criadopor} em ${new Date(observacao.criadoem).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}`}
                            />
                          </ListItem>
                          {index < obs.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
            </>
          )}

          {/* Tab Pendências */}
          {tabValue === 1 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Gerenciar Pendências
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Controle as pendências impeditivas e não impeditivas do checklist
              </Typography>
              <Button
                variant="contained"
                startIcon={<Settings />}
                onClick={() => setPendenciasModalOpen(true)}
              >
                Gerenciar Pendências
              </Button>
            </Box>
          )}
      </CardContent>
    </Card>

    <PendenciasModal
      open={pendenciasModalOpen}
      onClose={() => setPendenciasModalOpen(false)}
      onSuccess={() => {
        setPendenciasModalOpen(false);
        fetchObservacoes();
      }}
      checklistId={checklistId}
    />
    </>
  );
});

ObservacoesCard.displayName = 'ObservacoesCard';

export default ObservacoesCard;
