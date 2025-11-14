'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';

interface FinalizarModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  melhoriaId: string | string[];
  empresaId: string | string[];
  propostaId: string | string[];
  nometapa: string;
  dataInicio: string;
  previsaoInicial: string;
}

export default function FinalizarModal({
  open,
  onClose,
  onSuccess,
  melhoriaId,
  empresaId,
  propostaId,
  nometapa,
  dataInicio,
  previsaoInicial,
}: FinalizarModalProps) {
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Sugerir data de hoje
      const hoje = new Date().toISOString().split('T')[0];
      setDataFim(hoje);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataFim) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/melhoria/${melhoriaId}/etapas/pendencias/finalizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datafim: dataFim }),
      });

      if (response.ok) {
        onSuccess();
      } else if (response.status === 400) {
        const error = await response.json();
        alert(error.error + (error.pendenciasImpeditivas ? '\n\nPendências impeditivas:\n- ' + error.pendenciasImpeditivas.join('\n- ') : ''));
      }
    } catch (error) {
      console.error('Erro ao finalizar etapa:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={(event, reason) => {
        if (reason === 'backdropClick') {
          return;
        }
        onClose();
      }} 
      maxWidth="sm" 
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Finalizar {nometapa}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Data início"
              type="date"
              fullWidth
              value={dataInicio}
              disabled
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Data fim"
              type="date"
              fullWidth
              required
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText={`Previsão inicial: ${previsaoInicial ? new Date(previsaoInicial).toLocaleDateString('pt-BR') : '-'}`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Finalizando...' : 'Finalizar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
