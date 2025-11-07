'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { GrupoEmpresa } from '@/models/empresa';

interface EmpresaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmpresaModal({ open, onClose, onSuccess }: EmpresaModalProps) {
  const [grupos, setGrupos] = useState<GrupoEmpresa[]>([]);
  const [formData, setFormData] = useState({
    nomeempresa: '',
    codigoempresa: '',
    idgrupo: '',
    cliente: false,
    criadopor: 'Admin', // TODO: Pegar do usuário logado
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchGrupos();
    }
  }, [open]);

  const fetchGrupos = async () => {
    try {
      const response = await fetch('/api/grupos');
      const data = await response.json();
      setGrupos(data);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          idgrupo: formData.idgrupo ? parseInt(formData.idgrupo) : null,
        }),
      });

      if (response.ok) {
        setFormData({
          nomeempresa: '',
          codigoempresa: '',
          idgrupo: '',
          cliente: false,
          criadopor: 'Admin',
        });
        onSuccess();
      } else {
        console.error('Erro ao criar empresa');
      }
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nomeempresa: '',
        codigoempresa: '',
        idgrupo: '',
        cliente: false,
        criadopor: 'Admin',
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nova Empresa</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nome da Empresa"
              fullWidth
              required
              value={formData.nomeempresa}
              onChange={(e) => setFormData({ ...formData, nomeempresa: e.target.value })}
            />

            <TextField
              label="Código da Empresa"
              fullWidth
              required
              value={formData.codigoempresa}
              onChange={(e) => setFormData({ ...formData, codigoempresa: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Grupo da Empresa</InputLabel>
              <Select
                value={formData.idgrupo}
                label="Grupo da Empresa"
                onChange={(e) => setFormData({ ...formData, idgrupo: e.target.value })}
              >
                <MenuItem value="">
                  <em>Nenhum</em>
                </MenuItem>
                {grupos.map((grupo) => (
                  <MenuItem key={grupo.id} value={grupo.id}>
                    {grupo.nomegrupo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.checked })}
                />
              }
              label="Já é cliente?"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Empresa'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
