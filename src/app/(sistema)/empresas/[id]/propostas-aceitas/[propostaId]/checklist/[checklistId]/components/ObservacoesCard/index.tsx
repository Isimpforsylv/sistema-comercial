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
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

interface ObservacoesCardProps {
  checklistId: string | string[];
  etapaFinalizadaNome?: string; // Nome da etapa finalizada (ex: "Pre-Checklist")
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

const ObservacoesCard = forwardRef<ObservacoesCardHandle, ObservacoesCardProps>(({ checklistId, etapaFinalizadaNome }, ref) => {
  const [observacoes, setObservacoes] = useState<ObservacoesPorEtapa>({});
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

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
    <Card sx={{ position: 'sticky', top: 20 }}>
      <CardContent>
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
              const estaFinalizada = etapaFinalizadaNome === nometapa;
              
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
      </CardContent>
    </Card>
  );
});

ObservacoesCard.displayName = 'ObservacoesCard';

export default ObservacoesCard;
