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
  Checkbox,
  FormGroup,
  FormLabel,
} from '@mui/material';
import { GrupoEmpresa, Empresa } from '@/models/empresa';

interface EmpresaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresa?: Empresa | null;
}

export default function EmpresaModal({ open, onClose, onSuccess, empresa }: EmpresaModalProps) {
  const [grupos, setGrupos] = useState<GrupoEmpresa[]>([]);
  const [formData, setFormData] = useState({
    nomeempresa: '',
    codigoempresa: '',
    idgrupo: '',
    cliente: false,
    tipo: [] as string[],
    criadopor: 'Admin', // TODO: Pegar do usuário logado
  });
  const [loading, setLoading] = useState(false);

  const tiposEmpresa = ['Distribuidor', 'Importador', 'Fabricante'];

  useEffect(() => {
    if (open) {
      fetchGrupos();
      
      // Se está editando, preenche o formulário
      if (empresa) {
        const tipos = empresa.tipo ? JSON.parse(empresa.tipo) : [];
        setFormData({
          nomeempresa: empresa.nomeempresa,
          codigoempresa: empresa.codigoempresa,
          idgrupo: empresa.idgrupo?.toString() || '',
          cliente: empresa.cliente,
          tipo: tipos,
          criadopor: empresa.criadopor,
        });
      }
    } else {
      // Reset form when modal closes
      setFormData({
        nomeempresa: '',
        codigoempresa: '',
        idgrupo: '',
        cliente: false,
        tipo: [],
        criadopor: 'Admin',
      });
    }
  }, [open, empresa]);

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
      const isEdit = !!empresa;
      const url = isEdit ? `/api/empresas/${empresa.id}` : '/api/empresas';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
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
        tipo: [],
        criadopor: 'Admin',
      });
      onClose();
    }
  };

  const handleTipoChange = (tipo: string) => {
    setFormData(prev => ({
      ...prev,
      tipo: (prev.tipo || []).includes(tipo)
        ? (prev.tipo || []).filter(t => t !== tipo)
        : [...(prev.tipo || []), tipo]
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={(event, reason) => {
        if (reason === 'backdropClick') {
          return;
        }
        handleClose();
      }} 
      maxWidth="sm" 
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{empresa ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
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

            <Box>
              <FormLabel component="legend" sx={{ mb: 1 }}>Tipo da Empresa</FormLabel>
              <FormGroup>
                {tiposEmpresa.map((tipo) => (
                  <FormControlLabel
                    key={tipo}
                    control={
                      <Checkbox
                        checked={formData.tipo?.includes(tipo) || false}
                        onChange={() => handleTipoChange(tipo)}
                      />
                    }
                    label={tipo}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? (empresa ? 'Salvando...' : 'Criando...') : (empresa ? 'Salvar' : 'Criar Empresa')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
