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
} from '@mui/material';

interface InformacoesPropostaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => void;
  empresaId: string | string[];
  propostaId: string | string[];
  informacoes: any;
}

const paises = ['Brasil', 'Estados Unidos', 'Argentina', 'Chile', 'Colômbia', 'México', 'Peru', 'Uruguai'];

const estadosBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function InformacoesPropostaModal({
  open,
  onClose,
  onSuccess,
  empresaId,
  propostaId,
  informacoes,
}: InformacoesPropostaModalProps) {
  const [formData, setFormData] = useState({
    empresa: '',
    pais: 'Brasil',
    estado: '',
    cidade: '',
    endereco: '',
    contato: '',
    email: '',
    telefone: '',
    linkwiki: '',
    caminhopasta: '\\\\serverideia2\\Comercial',
    dataaceite: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (informacoes) {
      setFormData({
        empresa: informacoes.empresa || '',
        pais: informacoes.pais || 'Brasil',
        estado: informacoes.estado || '',
        cidade: informacoes.cidade || '',
        endereco: informacoes.endereco || '',
        contato: informacoes.contato || '',
        email: informacoes.email || '',
        telefone: informacoes.telefone || '',
        linkwiki: informacoes.linkwiki || '',
        caminhopasta: informacoes.caminhopasta || '\\\\serverideia2\\Comercial',
        dataaceite: informacoes.dataaceite ? new Date(informacoes.dataaceite).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [informacoes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = informacoes ? 'PUT' : 'POST';
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/informacoes`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        onSuccess(data); // Passa os dados atualizados
      }
    } catch (error) {
      console.error('Erro ao salvar informações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        <DialogTitle>
          {informacoes ? 'Editar Informações da Proposta' : 'Cadastrar Informações da Proposta'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Data do Aceite"
              type="date"
              fullWidth
              required
              value={formData.dataaceite}
              onChange={(e) => handleChange('dataaceite', e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="País"
                fullWidth
                required
                select
                value={formData.pais}
                onChange={(e) => handleChange('pais', e.target.value)}
                disabled={loading}
              >
                {paises.map((pais) => (
                  <MenuItem key={pais} value={pais}>
                    {pais}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Estado"
                fullWidth
                required
                select={formData.pais === 'Brasil'}
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                disabled={loading}
              >
                {formData.pais === 'Brasil' &&
                  estadosBrasil.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Cidade"
                fullWidth
                required
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                disabled={loading}
              />

              <TextField
                label="Endereço"
                fullWidth
                required
                value={formData.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                disabled={loading}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Contato"
                fullWidth
                required
                value={formData.contato}
                onChange={(e) => handleChange('contato', e.target.value)}
                disabled={loading}
              />

              <TextField
                label="E-mail"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Telefone"
                fullWidth
                required
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                disabled={loading}
              />

              <TextField
                label="Link da Wiki"
                fullWidth
                value={formData.linkwiki}
                onChange={(e) => handleChange('linkwiki', e.target.value)}
                disabled={loading}
              />
            </Box>

            <TextField
              label="Caminho da Pasta"
              fullWidth
              required
              value={formData.caminhopasta}
              onChange={(e) => handleChange('caminhopasta', e.target.value)}
              disabled={loading}
              helperText="Use \\\\ no início para caminhos de rede"
            />
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
