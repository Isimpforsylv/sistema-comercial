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
  melhoriaId: string | string[];
  empresaId: string | string[];
  propostaId: string | string[];
  etapasFinalizadas?: string[]; // Array de nomes das etapas finalizadas
  disabled?: boolean; // Bloqueia gerenciamento de pendências
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

interface Pendencia {
  id: number;
  descricao: string;
  impeditiva: boolean;
  finalizada: boolean;
  criadopor: string;
  finalizadopor: string | null;
  criadoem: string;
}

const ObservacoesCard = forwardRef<ObservacoesCardHandle, ObservacoesCardProps>(({ melhoriaId, empresaId, propostaId, etapasFinalizadas = [], disabled = false }, ref) => {
  const [observacoes, setObservacoes] = useState<ObservacoesPorEtapa>({});
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [pendenciasModalOpen, setPendenciasModalOpen] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchObservacoes = async () => {
    if (initialLoad) {
      setLoading(true);
    }
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/melhoria/${melhoriaId}/observacoes`);
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
        
        // Inicializar estado de expansão dos painéis
        const newExpandedPanels: { [key: string]: boolean } = {};
        Object.keys(grouped).forEach(nometapa => {
          const estaFinalizada = etapasFinalizadas.includes(nometapa);
          newExpandedPanels[nometapa] = !estaFinalizada;
        });
        setExpandedPanels(newExpandedPanels);
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

  const fetchPendencias = async () => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/melhoria/${melhoriaId}/pendencias`);
      if (response.ok) {
        const data = await response.json();
        setPendencias(data);
      }
    } catch (error) {
      console.error('Erro ao buscar pendências:', error);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchObservacoes();
      fetchPendencias();
    }
  }, [melhoriaId, mounted]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchObservacoes();
      fetchPendencias();
    }
  }));

  if (loading || !mounted) return null;

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
                <Accordion 
                  key={nometapa} 
                  expanded={expandedPanels[nometapa] ?? !estaFinalizada}
                  onChange={(e, isExpanded) => setExpandedPanels(prev => ({ ...prev, [nometapa]: isExpanded }))}
                >
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
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Pendências
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Settings />}
                  onClick={() => setPendenciasModalOpen(true)}
                  disabled={disabled}
                >
                  Gerenciar Pendências
                </Button>
              </Box>

              {pendencias.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhuma pendência cadastrada
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Pendências Impeditivas */}
                  {pendencias.filter(p => p.impeditiva).length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" color="error" sx={{ mb: 1 }}>
                        Impeditivas ({pendencias.filter(p => p.impeditiva && !p.finalizada).length} ativas)
                      </Typography>
                      <List dense>
                        {pendencias.filter(p => p.impeditiva).map((pendencia, index) => (
                          <Box key={pendencia.id}>
                            <ListItem 
                              disablePadding 
                              sx={{ 
                                mb: 1,
                                opacity: pendencia.finalizada ? 0.6 : 1,
                                textDecoration: pendencia.finalizada ? 'line-through' : 'none'
                              }}
                            >
                              <ListItemText
                                primary={pendencia.descricao}
                                secondary={
                                  pendencia.finalizada 
                                    ? `Finalizada por ${pendencia.finalizadopor}` 
                                    : `Criada por ${pendencia.criadopor} em ${new Date(pendencia.criadoem).toLocaleDateString('pt-BR')}`
                                }
                              />
                            </ListItem>
                            {index < pendencias.filter(p => p.impeditiva).length - 1 && <Divider />}
                          </Box>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Pendências Não Impeditivas */}
                  {pendencias.filter(p => !p.impeditiva).length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" color="warning.main" sx={{ mb: 1 }}>
                        Não Impeditivas ({pendencias.filter(p => !p.impeditiva && !p.finalizada).length} ativas)
                      </Typography>
                      <List dense>
                        {pendencias.filter(p => !p.impeditiva).map((pendencia, index) => (
                          <Box key={pendencia.id}>
                            <ListItem 
                              disablePadding 
                              sx={{ 
                                mb: 1,
                                opacity: pendencia.finalizada ? 0.6 : 1,
                                textDecoration: pendencia.finalizada ? 'line-through' : 'none'
                              }}
                            >
                              <ListItemText
                                primary={pendencia.descricao}
                                secondary={
                                  pendencia.finalizada 
                                    ? `Finalizada por ${pendencia.finalizadopor}` 
                                    : `Criada por ${pendencia.criadopor} em ${new Date(pendencia.criadoem).toLocaleDateString('pt-BR')}`
                                }
                              />
                            </ListItem>
                            {index < pendencias.filter(p => !p.impeditiva).length - 1 && <Divider />}
                          </Box>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
      </CardContent>
    </Card>

    <PendenciasModal
      open={pendenciasModalOpen}
      onClose={() => setPendenciasModalOpen(false)}
      onSuccess={() => {
        setPendenciasModalOpen(false);
        fetchObservacoes();
        fetchPendencias();
      }}
      melhoriaId={melhoriaId}
      empresaId={empresaId}
      propostaId={propostaId}
      readonly={disabled}
    />
    </>
  );
});

ObservacoesCard.displayName = 'ObservacoesCard';

export default ObservacoesCard;
