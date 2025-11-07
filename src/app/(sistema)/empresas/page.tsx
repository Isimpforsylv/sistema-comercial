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
} from '@mui/material';
import { Search, Add, Business } from '@mui/icons-material';
import Header from '@/app/components/Header';
import EmpresaModal from './components/EmpresaModal';
import { Empresa } from '@/models/empresa';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchEmpresas(value);
  };

  const handleEmpresaCreated = () => {
    setModalOpen(false);
    fetchEmpresas(searchTerm);
  };

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
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography>Carregando...</Typography>
          </Box>
        ) : empresas.length === 0 ? (
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
            {empresas.map((empresa) => (
              <Card key={empresa.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {empresa.nomeempresa}
                      </Typography>
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
                      <Typography variant="caption" color="text.secondary">
                        Criado por: {empresa.criadopor}
                      </Typography>
                    </Box>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.location.href = `/empresas/${empresa.id}/propostas-aceitas`}
                        >
                          Ver propostas aceitas
                        </Button>
                        <Button
                          variant="outlined"
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
        onClose={() => setModalOpen(false)}
        onSuccess={handleEmpresaCreated}
      />
    </>
  );
}
