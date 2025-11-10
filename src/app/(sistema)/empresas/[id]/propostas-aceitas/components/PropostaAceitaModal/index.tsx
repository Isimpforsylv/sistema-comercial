'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

interface PropostaAceitaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresaId: number;
}

export default function PropostaAceitaModal({ open, onClose, onSuccess, empresaId }: PropostaAceitaModalProps) {
  const [nomeproposta, setNomeproposta] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeproposta }),
      });
      if (response.ok) {
        setNomeproposta('');
        onSuccess();
      }
    } catch (error) {
      // erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nova Proposta Aceita</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Nome da Proposta"
              fullWidth
              required
              value={nomeproposta}
              onChange={(e) => setNomeproposta(e.target.value)}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
