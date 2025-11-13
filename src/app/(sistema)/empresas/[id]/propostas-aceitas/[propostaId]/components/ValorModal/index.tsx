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
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

interface ValorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newValor?: any) => void;
  empresaId: string | string[];
  propostaId: string | string[];
  valor?: any;
}

interface Recurso {
  id: number;
  nomerecurso: string;
  valor: string;
  formapagamento: string;
  prazo: string;
  outrorecurso?: string;
}

export default function ValorModal({
  open,
  onClose,
  onSuccess,
  empresaId,
  propostaId,
  valor,
}: ValorModalProps) {
  const [formData, setFormData] = useState({
    nomevalor: '',
    valor: 'R$ ',
    formapagamento: '',
    mensalidade: 'R$ ',
    alteracaomensalidade: '',
    prazo: '',
    observacao: '',
  });
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [listaRecursos, setListaRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRecursos, setShowRecursos] = useState(false);

  useEffect(() => {
    if (open) {
      fetchListaRecursos();
      
      // Se está editando, preenche o formulário
      if (valor) {
        setFormData({
          nomevalor: valor.nomevalor || '',
          valor: valor.valor || 'R$ ',
          formapagamento: valor.formapagamento || '',
          mensalidade: valor.mensalidade || 'R$ ',
          alteracaomensalidade: valor.alteracaomensalidade || '',
          prazo: valor.prazo?.toString() || '',
          observacao: valor.observacao || '',
        });
        setRecursos(valor.recursos || []);
        setShowRecursos((valor.recursos || []).length > 0);
      } else {
        // Se está criando, limpa o formulário
        setFormData({
          nomevalor: '',
          valor: 'R$ ',
          formapagamento: '',
          mensalidade: 'R$ ',
          alteracaomensalidade: '',
          prazo: '',
          observacao: '',
        });
        setRecursos([]);
        setShowRecursos(false);
      }
    }
  }, [open, valor]);

  const fetchListaRecursos = async () => {
    try {
      const response = await fetch('/api/lista-recursos');
      if (response.ok) {
        const data = await response.json();
        setListaRecursos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar lista de recursos:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'valor' || field === 'mensalidade') {
      if (!value.startsWith('R$ ')) {
        value = 'R$ ' + value.replace('R$ ', '');
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRecurso = () => {
    setRecursos([
      ...recursos,
      {
        id: Date.now(),
        nomerecurso: '',
        valor: 'R$ ',
        formapagamento: formData.formapagamento,
        prazo: formData.prazo,
      },
    ]);
  };

  const handleRemoveRecurso = (id: number) => {
    setRecursos(recursos.filter((r) => r.id !== id));
  };

  const handleRecursoChange = (id: number, field: string, value: string) => {
    if (field === 'valor' && !value.startsWith('R$ ')) {
      value = 'R$ ' + value.replace('R$ ', '');
    }
    setRecursos(
      recursos.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEdit = !!valor;
      const url = isEdit
        ? `/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/valores/${valor.id}`
        : `/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/valores`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recursos }),
      });
      
      if (response.ok) {
        const savedValor = await response.json();
        onSuccess(savedValor);
        setFormData({
          nomevalor: '',
          valor: 'R$ ',
          formapagamento: '',
          mensalidade: 'R$ ',
          alteracaomensalidade: '',
          prazo: '',
          observacao: '',
        });
        setRecursos([]);
        setShowRecursos(false);
      }
    } catch (error) {
      console.error('Erro ao salvar valor:', error);
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
      maxWidth="md" 
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{valor ? 'Editar Valor' : 'Adicionar Valor'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nome do Valor"
              fullWidth
              required
              value={formData.nomevalor}
              onChange={(e) => handleChange('nomevalor', e.target.value)}
              disabled={loading}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Valor"
                fullWidth
                required
                value={formData.valor}
                onChange={(e) => handleChange('valor', e.target.value)}
                disabled={loading}
              />
              <TextField
                label="Forma de Pagamento"
                fullWidth
                required
                value={formData.formapagamento}
                onChange={(e) => handleChange('formapagamento', e.target.value)}
                disabled={loading}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Mensalidade"
                fullWidth
                required
                value={formData.mensalidade}
                onChange={(e) => handleChange('mensalidade', e.target.value)}
                disabled={loading}
              />
              <TextField
                label="Alteração da Mensalidade"
                fullWidth
                value={formData.alteracaomensalidade}
                onChange={(e) => handleChange('alteracaomensalidade', e.target.value)}
                disabled={loading}
              />
            </Box>

            <TextField
              label="Prazo (em dias)"
              fullWidth
              required
              type="number"
              value={formData.prazo}
              onChange={(e) => handleChange('prazo', e.target.value)}
              disabled={loading}
              helperText="Informe o prazo em dias"
            />

            <TextField
              label="Observação"
              fullWidth
              multiline
              rows={3}
              value={formData.observacao}
              onChange={(e) => handleChange('observacao', e.target.value)}
              disabled={loading}
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Recursos Adicionais</Typography>
              <Button
                startIcon={<Add />}
                onClick={handleAddRecurso}
                variant="outlined"
                size="small"
                disabled={loading}
              >
                Adicionar Recurso
              </Button>
            </Box>

            {recursos.map((recurso, index) => (
              <Box
                key={recurso.id}
                sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2">Recurso {index + 1}</Typography>
                  <IconButton size="small" onClick={() => handleRemoveRecurso(recurso.id)} color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Nome do Recurso</InputLabel>
                    <Select
                      value={
                        listaRecursos.some(lr => lr.nomerecurso === recurso.nomerecurso) 
                          ? recurso.nomerecurso 
                          : 'Outro'
                      }
                      label="Nome do Recurso"
                      onChange={(e) => handleRecursoChange(recurso.id, 'nomerecurso', e.target.value)}
                      disabled={loading}
                    >
                      {listaRecursos.map((lr) => (
                        <MenuItem key={lr.id} value={lr.nomerecurso}>
                          {lr.nomerecurso}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {(recurso.nomerecurso === 'Outro' || !listaRecursos.some(lr => lr.nomerecurso === recurso.nomerecurso)) && (
                    <TextField
                      label="Especifique o recurso"
                      fullWidth
                      value={
                        listaRecursos.some(lr => lr.nomerecurso === recurso.nomerecurso)
                          ? recurso.outrorecurso || ''
                          : recurso.nomerecurso
                      }
                      onChange={(e) => {
                        if (recurso.nomerecurso === 'Outro') {
                          handleRecursoChange(recurso.id, 'outrorecurso', e.target.value);
                        } else {
                          handleRecursoChange(recurso.id, 'nomerecurso', e.target.value);
                        }
                      }}
                      disabled={loading}
                    />
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Valor"
                      fullWidth
                      value={recurso.valor}
                      onChange={(e) => handleRecursoChange(recurso.id, 'valor', e.target.value)}
                      disabled={loading}
                    />
                    <TextField
                      label="Forma de Pagamento"
                      fullWidth
                      value={recurso.formapagamento}
                      onChange={(e) => handleRecursoChange(recurso.id, 'formapagamento', e.target.value)}
                      disabled={loading}
                    />
                  </Box>

                  <TextField
                    label="Prazo (em dias)"
                    fullWidth
                    type="number"
                    value={recurso.prazo}
                    onChange={(e) => handleRecursoChange(recurso.id, 'prazo', e.target.value)}
                    disabled={loading}
                  />
                </Box>
              </Box>
            ))}
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
