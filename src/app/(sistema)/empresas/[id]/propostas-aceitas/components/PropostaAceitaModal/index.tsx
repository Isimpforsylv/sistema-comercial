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
} from '@mui/material';

interface PropostaAceitaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresaId: number;
  proposta?: { id: number; nomeproposta: string; codproposta?: string | null } | null;
}

export default function PropostaAceitaModal({ open, onClose, onSuccess, empresaId, proposta }: PropostaAceitaModalProps) {
  const [nomeproposta, setNomeproposta] = useState('');
  const [codproposta, setCodproposta] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset or load form data when modal opens
  useEffect(() => {
    if (open) {
      if (proposta) {
        setNomeproposta(proposta.nomeproposta || '');
        setCodproposta(proposta.codproposta || '');
      } else {
        setNomeproposta('');
        setCodproposta('');
      }
    }
  }, [open, proposta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEdit = !!proposta;
      const url = isEdit 
        ? `/api/empresas/${empresaId}/propostas-aceitas/${proposta.id}`
        : `/api/empresas/${empresaId}/propostas-aceitas`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeproposta, codproposta: codproposta || null }),
      });
      if (response.ok) {
        setNomeproposta('');
        setCodproposta('');
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar proposta:', error);
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
        <DialogTitle>{proposta ? 'Editar Proposta Aceita' : 'Nova Proposta Aceita'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nome da Proposta"
              fullWidth
              required
              value={nomeproposta}
              onChange={(e) => setNomeproposta(e.target.value)}
              disabled={loading}
            />
            <TextField
              label="Código/Número da Proposta"
              fullWidth
              value={codproposta}
              onChange={(e) => setCodproposta(e.target.value)}
              disabled={loading}
              helperText="Opcional"
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
