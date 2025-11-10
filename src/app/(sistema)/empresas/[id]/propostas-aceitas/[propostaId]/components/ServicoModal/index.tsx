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
  onSuccess: () => void;
  empresaId: string | string[];
  propostaId: string | string[];
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
    }
  }, [open]);

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
      const response = await fetch(
        `/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/servicos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        onSuccess();
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Adicionar Serviço</DialogTitle>
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
                disabled={loading}
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
