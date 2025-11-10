'use client';

import { useState } from 'react';
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
  checklistId: string | string[];
  nometapa: string;
}

export default function ObservacaoModal({
  open,
  onClose,
  onSuccess,
  checklistId,
  nometapa,
}: ObservacaoModalProps) {
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/checklist/${checklistId}/observacoes`, {
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
