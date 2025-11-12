'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { History, NoteAdd, ExpandMore } from '@mui/icons-material';
import ObservacaoModal from '../ObservacaoModal';
import HistoricoModal from '../HistoricoModal';
import CobrancasModal from '../CobrancasModal';
import FinalizarModal from '../FinalizarModal';
import ConfirmDialog from '@/app/components/ConfirmDialog';

interface PendenciasCardProps {
  checklistId: string | string[];
  onObservacaoAdded?: () => void;
  onEtapaStatusChange?: (finalizada: boolean) => void;
  disabled?: boolean;
}

interface EtapaData {
  id?: number;
  dataenvio: string;
  dataretorno: string;
  cobrarem: string;
  historicodataenvio: string;
  historicodataretorno: string;
  finalizada?: boolean;
  datafim?: string;
}

export default function PendenciasCard({ checklistId, onObservacaoAdded, onEtapaStatusChange, disabled = false }: PendenciasCardProps) {
  const [etapa, setEtapa] = useState<EtapaData>({
    dataenvio: '',
    dataretorno: '',
    cobrarem: '',
    historicodataenvio: '[]',
    historicodataretorno: '[]',
    finalizada: false,
    datafim: '',
  });
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [cobrancasModalOpen, setCobrancasModalOpen] = useState(false);
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false);
  const [confirmDesfinalizarOpen, setConfirmDesfinalizarOpen] = useState(false);
  const [historicoTipo, setHistoricoTipo] = useState<'dataenvio' | 'dataretorno'>('dataenvio');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchEtapa = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/checklist/${checklistId}/etapas/Pendências`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setEtapa({
            ...data,
            dataenvio: data.dataenvio ? new Date(data.dataenvio).toISOString().split('T')[0] : '',
            dataretorno: data.dataretorno ? new Date(data.dataretorno).toISOString().split('T')[0] : '',
            cobrarem: data.cobrarem ? new Date(data.cobrarem).toISOString().split('T')[0] : '',
            datafim: data.datafim ? new Date(data.datafim).toISOString().split('T')[0] : '',
            finalizada: data.finalizada || false,
          });
          onEtapaStatusChange?.(data.finalizada || false);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar etapa:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchEtapa();
    }
  }, [checklistId, mounted]);

  const handleDateChange = async (field: 'dataenvio' | 'dataretorno', value: string) => {
    try {
      const response = await fetch(`/api/checklist/${checklistId}/etapas/Pendências`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      
      if (response.ok) {
        if (field === 'dataretorno' && value) {
          setEtapa((prev) => ({ ...prev, [field]: value, cobrarem: value }));
        } else {
          setEtapa((prev) => ({ ...prev, [field]: value }));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar data:', error);
    }
  };

  const handleShowHistorico = (tipo: 'dataenvio' | 'dataretorno') => {
    setHistoricoTipo(tipo);
    setHistoricoModalOpen(true);
  };

  const handleDesfinalizar = async () => {
    try {
      const response = await fetch(`/api/checklist/${checklistId}/etapas/Pendências/finalizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desfinalizar: true }),
      });

      if (response.ok) {
        await fetchEtapa();
        onEtapaStatusChange?.(false);
        // NÃO chama onObservacaoAdded para manter modal de gerenciar pendências aberto
      }
    } catch (error) {
      console.error('Erro ao desfinalizar etapa:', error);
    }
  };

  if (loading || !mounted) return null;

  if (etapa.finalizada) {
    return (
      <>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
              <Typography variant="h6">Pendências - Finalizada</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="body2">
                  <strong>Data início:</strong> {etapa.dataenvio ? new Date(etapa.dataenvio).toLocaleDateString('pt-BR') : '-'}
                </Typography>
                <Typography variant="body2">
                  <strong>Data fim:</strong> {etapa.datafim ? new Date(etapa.datafim).toLocaleDateString('pt-BR') : '-'}
                  {etapa.dataretorno && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      (Previsão inicial: {new Date(etapa.dataretorno).toLocaleDateString('pt-BR')})
                    </Typography>
                  )}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">Detalhes da Etapa</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button startIcon={<NoteAdd />} variant="outlined" size="small" onClick={() => setObsModalOpen(true)} disabled={disabled}>Observação</Button>
                {etapa.cobrarem && (
                  <Button variant="outlined" size="small" onClick={() => setCobrancasModalOpen(true)} disabled={disabled}>Histórico de Cobranças</Button>
                )}
                <Button variant="outlined" color="warning" size="small" onClick={() => setConfirmDesfinalizarOpen(true)} disabled={disabled}>Desfinalizar</Button>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Data do envio:</Typography>
                <TextField type="date" fullWidth size="small" value={etapa.dataenvio || ''} InputLabelProps={{ shrink: true }} disabled />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Data do retorno:</Typography>
                <TextField type="date" fullWidth size="small" value={etapa.dataretorno || ''} InputLabelProps={{ shrink: true }} disabled />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Cobrar em:</Typography>
                <TextField type="date" fullWidth size="small" value={etapa.cobrarem || ''} InputLabelProps={{ shrink: true }} disabled />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <ObservacaoModal open={obsModalOpen} onClose={() => setObsModalOpen(false)} onSuccess={() => { setObsModalOpen(false); onObservacaoAdded?.(); }} checklistId={checklistId} nometapa="Pendências" />
        <HistoricoModal open={historicoModalOpen} onClose={() => setHistoricoModalOpen(false)} historico={historicoTipo === 'dataenvio' ? etapa.historicodataenvio : etapa.historicodataretorno} titulo={historicoTipo === 'dataenvio' ? 'Histórico - Data do Envio' : 'Histórico - Data do Retorno'} />
        <CobrancasModal open={cobrancasModalOpen} onClose={() => setCobrancasModalOpen(false)} onSuccess={() => { setCobrancasModalOpen(false); fetchEtapa(); onObservacaoAdded?.(); }} checklistId={checklistId} nometapa="Pendências" dataCobranca={etapa.cobrarem} readonly={true} />
        <ConfirmDialog
          open={confirmDesfinalizarOpen}
          onClose={() => setConfirmDesfinalizarOpen(false)}
          onConfirm={handleDesfinalizar}
          title="Desfinalizar Etapa"
          message="Deseja realmente desfinalizar esta etapa? Ela voltará ao estado ativo."
          confirmText="Desfinalizar"
          confirmColor="warning"
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Pendências</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<NoteAdd />}
                variant="outlined"
                size="small"
                onClick={() => setObsModalOpen(true)}
              >
                Observação
              </Button>
              {etapa.cobrarem && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setCobrancasModalOpen(true)}
                  disabled={disabled}
                >
                  Atualizar Cobranças
                </Button>
              )}
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => setFinalizarModalOpen(true)}
                disabled={disabled}
              >
                Finalizar
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Data do envio */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, minHeight: '32px' }}>
                <Typography variant="body2" fontWeight="bold">
                  Data do envio:
                </Typography>
                <Tooltip title="Ver histórico">
                  <IconButton size="small" onClick={() => handleShowHistorico('dataenvio')} disabled={disabled}>
                    <History fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={etapa.dataenvio || ''}
                onChange={(e) => handleDateChange('dataenvio', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={disabled}
              />
            </Box>

            {/* Data do retorno */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, minHeight: '32px' }}>
                <Typography variant="body2" fontWeight="bold">
                  Data do retorno:
                </Typography>
                <Tooltip title="Ver histórico">
                  <IconButton size="small" onClick={() => handleShowHistorico('dataretorno')} disabled={disabled}>
                    <History fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={etapa.dataretorno || ''}
                onChange={(e) => handleDateChange('dataretorno', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={disabled}
              />
            </Box>

            {/* Cobrar em */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, minHeight: '32px' }}>
                <Typography variant="body2" fontWeight="bold">
                  Cobrar em:
                </Typography>
              </Box>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={etapa.cobrarem || ''}
                InputLabelProps={{ shrink: true }}
                disabled
                sx={{ '& .MuiInputBase-input.Mui-disabled': { color: 'text.primary', WebkitTextFillColor: 'inherit' } }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <ObservacaoModal
        open={obsModalOpen}
        onClose={() => setObsModalOpen(false)}
        onSuccess={() => {
          setObsModalOpen(false);
          onObservacaoAdded?.();
        }}
        checklistId={checklistId}
        nometapa="Pendências"
      />

      <HistoricoModal
        open={historicoModalOpen}
        onClose={() => setHistoricoModalOpen(false)}
        historico={historicoTipo === 'dataenvio' ? etapa.historicodataenvio : etapa.historicodataretorno}
        titulo={historicoTipo === 'dataenvio' ? 'Histórico - Data do Envio' : 'Histórico - Data do Retorno'}
      />

      <CobrancasModal
        open={cobrancasModalOpen}
        onClose={() => setCobrancasModalOpen(false)}
        onSuccess={() => {
          setCobrancasModalOpen(false);
          fetchEtapa();
          onObservacaoAdded?.();
        }}
        checklistId={checklistId}
        nometapa="Pendências"
        dataCobranca={etapa.cobrarem}
      />

      <FinalizarModal
        open={finalizarModalOpen}
        onClose={() => setFinalizarModalOpen(false)}
        onSuccess={() => {
          setFinalizarModalOpen(false);
          fetchEtapa();
          onEtapaStatusChange?.(true);
          // NÃO chama onObservacaoAdded para manter modal de gerenciar pendências aberto
        }}
        checklistId={checklistId}
        nometapa="Pendências"
        dataInicio={etapa.dataenvio}
        previsaoInicial={etapa.dataretorno}
      />
    </>
  );
}
