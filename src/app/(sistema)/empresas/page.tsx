'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Add, Business, Edit } from '@mui/icons-material';
import Header from '@/app/components/Header';
import EmpresaModal from './components/EmpresaModal';
import { Empresa } from '@/models/empresa';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const tiposEmpresa = ['Distribuidor', 'Importador', 'Fabricante'];

  const fetchEmpresas = async (search = '') => {
    try {
      setLoading(true);
      const url = search
        ? `/api/empresas?search=${encodeURIComponent(search)}`
        : '/api/empresas';
      const response = await fetch(url);
      const data = await response.json();
      setEmpresas(data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchEmpresas(value);
  };

  const filteredEmpresas = tipoFilter
    ? empresas.filter(empresa => {
        try {
          const tipos = empresa.tipo ? JSON.parse(empresa.tipo) : [];
          return tipos.includes(tipoFilter);
        } catch {
          return false;
        }
      })
    : empresas;

  const handleEmpresaCreated = async () => {
    // Salva posição do scroll antes de atualizar
    const scrollY = window.scrollY;
    
    setModalOpen(false);
    setEditingEmpresa(null);
    
    // Recarrega empresas
    await fetchEmpresas(searchTerm);
    
    // Restaura posição do scroll imediatamente após renderizar
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  const handleEditClick = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingEmpresa(null);
  };

  // Durante o carregamento inicial, deixe o overlay global cobrir a página
  if (initialLoad) return null;

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Empresas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie suas empresas cadastradas
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
            size="large"
          >
            Nova Empresa
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={tipoFilter}
                  label="Tipo"
                  onChange={(e) => setTipoFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {tiposEmpresa.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {tipoFilter && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Filtrando por:
                </Typography>
                <Chip
                  label={tipoFilter}
                  onDelete={() => setTipoFilter('')}
                  size="small"
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {filteredEmpresas.length === 0 ? (
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 8,
                  gap: 2,
                }}
              >
                <Business sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary">
                  Nenhuma empresa cadastrada
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Comece criando sua primeira empresa.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setModalOpen(true)}
                >
                  Criar Primeira Empresa
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {filteredEmpresas.map((empresa) => (
              <Card key={empresa.id}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {empresa.nomeempresa}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          Código: {empresa.codigoempresa}
                        </Typography>
                        {empresa.grupo && (
                          <Typography variant="body2" color="text.secondary">
                            Grupo: {empresa.grupo.nomegrupo}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Cliente: {empresa.cliente ? 'Sim' : 'Não'}
                        </Typography>
                        {empresa.tipo && JSON.parse(empresa.tipo).length > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Tipo: {JSON.parse(empresa.tipo).join(', ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Tooltip title="Editar empresa">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(empresa)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => window.location.href = `/empresas/${empresa.id}/propostas-aceitas`}
                      >
                        Ver propostas aceitas
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => window.location.href = `/empresas/${empresa.id}/propostas-enviadas`}
                      >
                        Ver propostas enviadas
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      <EmpresaModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleEmpresaCreated}
        empresa={editingEmpresa}
      />
    </>
  );
}
