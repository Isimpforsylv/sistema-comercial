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
} from '@mui/material';
import { History, NoteAdd } from '@mui/icons-material';
import ObservacaoModal from '../ObservacaoModal';
import HistoricoModal from '../HistoricoModal';

interface PreChecklistCardProps {
  checklistId: string | string[];
  onObservacaoAdded?: () => void;
}

interface EtapaData {
  id?: number;
  dataenvio: string;
  dataretorno: string;
  cobrarem: string;
  historicodataenvio: string;
  historicodataretorno: string;
}

export default function PreChecklistCard({ checklistId, onObservacaoAdded }: PreChecklistCardProps) {
  const [etapa, setEtapa] = useState<EtapaData>({
    dataenvio: '',
    dataretorno: '',
    cobrarem: '',
    historicodataenvio: '[]',
    historicodataretorno: '[]',
  });
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [historicoTipo, setHistoricoTipo] = useState<'dataenvio' | 'dataretorno'>('dataenvio');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchEtapa = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/checklist/${checklistId}/etapas/Pre-Checklist`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          // Converter datas para formato yyyy-MM-dd
          setEtapa({
            ...data,
            dataenvio: data.dataenvio ? new Date(data.dataenvio).toISOString().split('T')[0] : '',
            dataretorno: data.dataretorno ? new Date(data.dataretorno).toISOString().split('T')[0] : '',
            cobrarem: data.cobrarem ? new Date(data.cobrarem).toISOString().split('T')[0] : '',
          });
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
      const response = await fetch(`/api/checklist/${checklistId}/etapas/Pre-Checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      
      if (response.ok) {
        // Se mudou dataretorno, atualiza também cobrarem
        if (field === 'dataretorno' && value) {
          setEtapa((prev) => ({ ...prev, [field]: value, cobrarem: value }));
        } else {
          setEtapa((prev) => ({ ...prev, [field]: value }));
        }
        fetchEtapa(); // Recarrega para pegar histórico atualizado
      }
    } catch (error) {
      console.error('Erro ao atualizar data:', error);
    }
  };

  const handleShowHistorico = (tipo: 'dataenvio' | 'dataretorno') => {
    setHistoricoTipo(tipo);
    setHistoricoModalOpen(true);
  };

  if (loading || !mounted) return <Typography>Carregando...</Typography>;

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Pre-Checklist</Typography>
            <Button
              startIcon={<NoteAdd />}
              variant="outlined"
              size="small"
              onClick={() => setObsModalOpen(true)}
            >
              Observação
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Data do envio */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, minHeight: '32px' }}>
                <Typography variant="body2" fontWeight="bold">
                  Data do envio:
                </Typography>
                <Tooltip title="Ver histórico">
                  <IconButton size="small" onClick={() => handleShowHistorico('dataenvio')}>
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
              />
            </Box>

            {/* Data do retorno */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, minHeight: '32px' }}>
                <Typography variant="body2" fontWeight="bold">
                  Data do retorno:
                </Typography>
                <Tooltip title="Ver histórico">
                  <IconButton size="small" onClick={() => handleShowHistorico('dataretorno')}>
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
              />
            </Box>

            {/* Cobrar em (somente leitura) */}
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
        nometapa="Pre-Checklist"
      />

      <HistoricoModal
        open={historicoModalOpen}
        onClose={() => setHistoricoModalOpen(false)}
        historico={historicoTipo === 'dataenvio' ? etapa.historicodataenvio : etapa.historicodataretorno}
        titulo={historicoTipo === 'dataenvio' ? 'Histórico - Data do Envio' : 'Histórico - Data do Retorno'}
      />
    </>
  );
}
