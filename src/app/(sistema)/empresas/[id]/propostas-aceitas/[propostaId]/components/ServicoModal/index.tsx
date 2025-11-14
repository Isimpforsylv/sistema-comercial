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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

interface ServicoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newServico?: any) => void;
  empresaId: string | string[];
  propostaId: string | string[];
  servico?: any | null;
}

interface TipoServico {
  id: number;
  nometiposervico: string;
}

export default function ServicoModal({
  open,
  onClose,
  onSuccess,
  empresaId,
  propostaId,
  servico,
}: ServicoModalProps) {
  const [formData, setFormData] = useState({
    nomedescricao: '',
    idtiposervico: '',
  });
  const [tiposServico, setTiposServico] = useState<TipoServico[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTiposServico();
      
      // Se está editando, preenche o formulário
      if (servico) {
        setFormData({
          nomedescricao: servico.nomedescricao || '',
          idtiposervico: servico.idtiposervico?.toString() || '',
        });
      } else {
        // Se está criando, limpa o formulário
        setFormData({
          nomedescricao: '',
          idtiposervico: '',
        });
      }
    }
  }, [open, servico]);

  const fetchTiposServico = async () => {
    try {
      const response = await fetch('/api/tipos-servico');
      if (response.ok) {
        const data = await response.json();
        setTiposServico(data);
      }
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEdit = !!servico;
      const url = isEdit
        ? `/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/servicos/${servico.id}`
        : `/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/servicos`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const savedServico = await response.json();
        onSuccess(savedServico);
        setFormData({
          nomedescricao: '',
          idtiposervico: '',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
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
        <DialogTitle>{servico ? 'Editar Serviço' : 'Adicionar Serviço'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nome/Descrição do Serviço"
              fullWidth
              required
              value={formData.nomedescricao}
              onChange={(e) => handleChange('nomedescricao', e.target.value)}
              disabled={loading}
            />

            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.idtiposervico}
                label="Tipo"
                onChange={(e) => handleChange('idtiposervico', e.target.value)}
                disabled={loading || !!servico}
              >
                {tiposServico.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nometiposervico}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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
