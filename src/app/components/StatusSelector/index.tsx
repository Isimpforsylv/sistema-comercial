'use client';

import { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
} from '@mui/material';

interface StatusSelectorProps {
  checklistId: string | string[];
  onStatusChange?: (status: string) => void;
  onValidationError?: (etapas: string[], pendencias: string[]) => void;
}

const STATUS_CONFIG = {
  em_andamento: { label: 'Em Andamento', color: '#FFA726' }, // Amarelo
  finalizado: { label: 'Finalizado', color: '#66BB6A' }, // Verde
  pausado: { label: 'Pausado', color: '#FF7043' }, // Laranja
  cancelado: { label: 'Cancelado', color: '#EF5350' }, // Vermelho
  desistiu: { label: 'Desistiu', color: '#9E9E9E' }, // Cinza
};

export default function StatusSelector({ checklistId, onStatusChange, onValidationError }: StatusSelectorProps) {
  const [status, setStatus] = useState('em_andamento');
  const [dataretorno, setDataretorno] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, [checklistId]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/checklist/${checklistId}/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status || 'em_andamento');
        if (data.dataretorno) {
          setDataretorno(new Date(data.dataretorno).toISOString().split('T')[0]);
        }
        // Propaga status inicial para o pai
        if (data.status) {
          onStatusChange?.(data.status);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const body: any = { status: newStatus };
      
      // Se for pausado e tiver data, incluir
      if (newStatus === 'pausado' && dataretorno) {
        body.dataretorno = dataretorno;
      }

      const response = await fetch(`/api/checklist/${checklistId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        onStatusChange?.(data.status);
        
        // Se não for pausado, limpar data
        if (data.status !== 'pausado') {
          setDataretorno('');
        }
      } else if (response.status === 400) {
        // Erro de validação
        const error = await response.json();
        if (error.etapasNaoFinalizadas || error.pendenciasImpeditivas) {
          onValidationError?.(
            error.etapasNaoFinalizadas || [],
            error.pendenciasImpeditivas || []
          );
          // Não muda o status
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDataRetornoChange = async (novaData: string) => {
    setDataretorno(novaData);
    
    // Se já está pausado, atualizar data
    if (status === 'pausado' && novaData) {
      try {
        await fetch(`/api/checklist/${checklistId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'pausado', dataretorno: novaData }),
        });
      } catch (error) {
        console.error('Erro ao atualizar data de retorno:', error);
      }
    }
  };

  if (loading) return <Typography>Carregando...</Typography>;

  const currentConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Select de Status */}
      <FormControl sx={{ minWidth: 200 }} size="small">
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          label="Status"
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <MenuItem key={key} value={key}>
              {config.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Campo Data Retorno (só aparece se Pausado) */}
      {status === 'pausado' && (
        <TextField
          label="Data do Retorno"
          type="date"
          size="small"
          value={dataretorno}
          onChange={(e) => handleDataRetornoChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
      )}
    </Box>
  );
}
