'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface ObservacaoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  melhoriaId: string | string[];
  empresaId: string | string[];
  propostaId: string | string[];
  nometapa: string;
}

export default function ObservacaoModal({
  open,
  onClose,
  onSuccess,
  melhoriaId,
  empresaId,
  propostaId,
  nometapa,
}: ObservacaoModalProps) {
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setObservacao('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/melhoria/${melhoriaId}/observacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nometapa, observacao }),
      });
      if (response.ok) {
        setObservacao('');
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar observação:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={(event, reason) => {
        // Só bloqueia fechar ao clicar fora (backdrop)
        if (reason === 'backdropClick') {
          return;
        }
        onClose();
      }}
      maxWidth="sm" 
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Adicionar Observação - {nometapa}</DialogTitle>
        <DialogContent>
          <TextField
            label="Observação"
            multiline
            rows={4}
            fullWidth
            required
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            disabled={loading}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
