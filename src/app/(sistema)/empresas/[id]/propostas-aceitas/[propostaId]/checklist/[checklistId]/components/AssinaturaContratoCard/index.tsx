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
import ContratoJuntoEnvioDialog from '../ContratoJuntoEnvioDialog';
import ConfirmDialog from '@/app/components/ConfirmDialog';

interface AssinaturaContratoCardProps {
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

export default function AssinaturaContratoCard({ checklistId, onObservacaoAdded, onEtapaStatusChange, disabled = false }: AssinaturaContratoCardProps) {
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
  const [contratoJuntoDialogOpen, setContratoJuntoDialogOpen] = useState(false);
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
      const response = await fetch(`/api/checklist/${checklistId}/etapas/Assinatura do Contrato`);
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
      const response = await fetch(`/api/checklist/${checklistId}/etapas/Assinatura do Contrato`, {
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
        // Removido fetchEtapa() - atualização local apenas
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
    console.log('handleDesfinalizar chamado - Assinatura');
    try {
      const response = await fetch(`/api/checklist/${checklistId}/etapas/Assinatura do Contrato/finalizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desfinalizar: true }),
      });

      console.log('Response status:', response.status);
      if (response.ok) {
        await fetchEtapa();
        onObservacaoAdded?.();
        onEtapaStatusChange?.(false);
      }
    } catch (error) {
      console.error('Erro ao desfinalizar etapa:', error);
    }
  };

  const handleFinalizarSuccess = () => {
    setFinalizarModalOpen(false);
    
    // Verifica se não tem nenhuma data preenchida
    if (!etapa.dataenvio && !etapa.dataretorno) {
      setContratoJuntoDialogOpen(true);
    } else {
      // Se tem data, finaliza normalmente
      fetchEtapa();
      onObservacaoAdded?.();
      onEtapaStatusChange?.(true);
    }
  };

  const handleContratoJuntoResponse = async (juntoEnvio: boolean) => {
    if (juntoEnvio) {
      // Criar observação automática
      try {
        await fetch(`/api/checklist/${checklistId}/observacoes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nometapa: 'Assinatura do Contrato',
            observacao: 'Contrato será enviado junto ao Novo Serviço',
          }),
        });
      } catch (error) {
        console.error('Erro ao criar observação:', error);
      }
    }
    
    // Recarregar etapa e notificar
    await fetchEtapa();
    onObservacaoAdded?.();
    onEtapaStatusChange?.(true);
  };

  if (loading || !mounted) return null;

  if (etapa.finalizada) {
    return (
      <>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
              <Typography variant="h6">Assinatura do Contrato - Finalizada</Typography>
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

        <ObservacaoModal open={obsModalOpen} onClose={() => setObsModalOpen(false)} onSuccess={() => { setObsModalOpen(false); onObservacaoAdded?.(); }} checklistId={checklistId} nometapa="Assinatura do Contrato" />
        <HistoricoModal open={historicoModalOpen} onClose={() => setHistoricoModalOpen(false)} historico={historicoTipo === 'dataenvio' ? etapa.historicodataenvio : etapa.historicodataretorno} titulo={historicoTipo === 'dataenvio' ? 'Histórico - Data do Envio' : 'Histórico - Data do Retorno'} />
        <CobrancasModal open={cobrancasModalOpen} onClose={() => setCobrancasModalOpen(false)} onSuccess={() => { setCobrancasModalOpen(false); fetchEtapa(); onObservacaoAdded?.(); }} checklistId={checklistId} nometapa="Assinatura do Contrato" dataCobranca={etapa.cobrarem} readonly={true} />
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
            <Typography variant="h6">Assinatura do Contrato</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button startIcon={<NoteAdd />} variant="outlined" size="small" onClick={() => setObsModalOpen(true)} disabled={disabled}>Observação</Button>
              {etapa.cobrarem && (
                <Button variant="contained" size="small" onClick={() => setCobrancasModalOpen(true)} disabled={disabled}>Atualizar Cobranças</Button>
              )}
              <Button variant="contained" color="success" size="small" onClick={() => setFinalizarModalOpen(true)} disabled={disabled}>Finalizar</Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, minHeight: '32px' }}>
                <Typography variant="body2" fontWeight="bold">Data do envio:</Typography>
                <Tooltip title="Ver histórico"><IconButton size="small" onClick={() => handleShowHistorico('dataenvio')} disabled={disabled}><History fontSize="small" /></IconButton></Tooltip>
              </Box>
              <TextField type="date" fullWidth size="small" value={etapa.dataenvio || ''} onChange={(e) => handleDateChange('dataenvio', e.target.value)} InputLabelProps={{ shrink: true }} disabled={disabled} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, minHeight: '32px' }}>
                <Typography variant="body2" fontWeight="bold">Data do retorno:</Typography>
                <Tooltip title="Ver histórico"><IconButton size="small" onClick={() => handleShowHistorico('dataretorno')} disabled={disabled}><History fontSize="small" /></IconButton></Tooltip>
              </Box>
              <TextField type="date" fullWidth size="small" value={etapa.dataretorno || ''} onChange={(e) => handleDateChange('dataretorno', e.target.value)} InputLabelProps={{ shrink: true }} disabled={disabled} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, minHeight: '32px' }}>
                <Typography variant="body2" fontWeight="bold">Cobrar em:</Typography>
              </Box>
              <TextField type="date" fullWidth size="small" value={etapa.cobrarem || ''} InputLabelProps={{ shrink: true }} disabled sx={{ '& .MuiInputBase-input.Mui-disabled': { color: 'text.primary', WebkitTextFillColor: 'inherit' } }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <ObservacaoModal open={obsModalOpen} onClose={() => setObsModalOpen(false)} onSuccess={() => { setObsModalOpen(false); onObservacaoAdded?.(); }} checklistId={checklistId} nometapa="Assinatura do Contrato" />
      <HistoricoModal open={historicoModalOpen} onClose={() => setHistoricoModalOpen(false)} historico={historicoTipo === 'dataenvio' ? etapa.historicodataenvio : etapa.historicodataretorno} titulo={historicoTipo === 'dataenvio' ? 'Histórico - Data do Envio' : 'Histórico - Data do Retorno'} />
      <CobrancasModal open={cobrancasModalOpen} onClose={() => setCobrancasModalOpen(false)} onSuccess={() => { setCobrancasModalOpen(false); fetchEtapa(); onObservacaoAdded?.(); }} checklistId={checklistId} nometapa="Assinatura do Contrato" dataCobranca={etapa.cobrarem} readonly={disabled} />
      <FinalizarModal open={finalizarModalOpen} onClose={() => setFinalizarModalOpen(false)} onSuccess={handleFinalizarSuccess} checklistId={checklistId} nometapa="Assinatura do Contrato" dataInicio={etapa.dataenvio} previsaoInicial={etapa.dataretorno} />
      <ContratoJuntoEnvioDialog open={contratoJuntoDialogOpen} onClose={() => setContratoJuntoDialogOpen(false)} onResponse={handleContratoJuntoResponse} />
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
