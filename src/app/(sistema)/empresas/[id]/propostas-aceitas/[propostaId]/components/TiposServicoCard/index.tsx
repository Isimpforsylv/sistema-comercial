'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ServicoModal from '../ServicoModal';

interface TiposServicoCardProps {
  empresaId: string | string[];
  propostaId: string | string[];
}

interface Servico {
  id: number;
  nomedescricao: string;
  criadoem: string;
  criadopor: string;
  tiposervico: {
    id: number;
    nometiposervico: string;
  };
  checklist?: { 
    id: number;
    status?: string;
  } | null;
  melhoria?: { id: number } | null;
}

const STATUS_CONFIG = {
  em_andamento: { label: 'Em Andamento', color: '#FFA726' }, // Amarelo
  finalizado: { label: 'Finalizado', color: '#66BB6A' }, // Verde
  pausado: { label: 'Pausado', color: '#FF7043' }, // Laranja
  cancelado: { label: 'Cancelado', color: '#EF5350' }, // Vermelho
  desistiu: { label: 'Desistiu', color: '#9E9E9E' }, // Cinza
};

export default function TiposServicoCard({ empresaId, propostaId }: TiposServicoCardProps) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchServicos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/servicos`);
      if (response.ok) {
        const data = await response.json();
        setServicos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, [empresaId, propostaId]);

  const handleSuccess = (newServico?: any) => {
    setModalOpen(false);
    setEditingServico(null);
    
    // Se recebeu novo serviço, adiciona ao estado local
    if (newServico) {
      const scrollY = window.scrollY;
      
      // Se está editando, atualiza o serviço existente
      if (editingServico) {
        setServicos((prev) => prev.map((s) => (s.id === newServico.id ? newServico : s)));
      } else {
        // Se está criando, adiciona ao array
        setServicos((prev) => [...prev, newServico]);
      }
      
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }
  };

  const handleEditClick = (servico: Servico) => {
    setEditingServico(servico);
    setModalOpen(true);
  };

  const handleOpenServico = (servico: Servico) => {
    if (servico.tiposervico.nometiposervico === 'Checklist' && servico.checklist) {
      router.push(`/empresas/${empresaId}/propostas-aceitas/${propostaId}/checklist/${servico.checklist.id}`);
    } else if (servico.tiposervico.nometiposervico === 'Melhoria' && servico.melhoria) {
      router.push(`/empresas/${empresaId}/propostas-aceitas/${propostaId}/melhoria/${servico.melhoria.id}`);
    }
  };

  const handleDeleteClick = (servicoId: number) => {
    setServicoToDelete(servicoId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setServicoToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!servicoToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/servicos/${servicoToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Salva posição do scroll antes de atualizar
        const scrollY = window.scrollY;
        
        // Remove do estado local
        setServicos((prev) => prev.filter((s) => s.id !== servicoToDelete));
        
        // Restaura posição do scroll
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
        
        setDeleteDialogOpen(false);
        setServicoToDelete(null);
      }
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Typography>Carregando tipos de serviço...</Typography>;

  if (!mounted) return null;

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Tipos de Serviço</Typography>
            <Button startIcon={<Add />} onClick={() => setModalOpen(true)} variant="contained" size="small">
              Adicionar Serviço
            </Button>
          </Box>

          {servicos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" gutterBottom>
                Nenhum serviço cadastrado
              </Typography>
              <Button variant="contained" onClick={() => setModalOpen(true)} size="small">
                Adicionar Primeiro Serviço
              </Button>
            </Box>
          ) : (
            <List>
              {servicos.map((servico) => (
                <ListItem
                  key={servico.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => handleEditClick(servico)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDeleteClick(servico.id)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenServico(servico)}
                        sx={{ minWidth: 80 }}
                      >
                        Abrir
                      </Button>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body1">{servico.nomedescricao}</Typography>
                        <Chip
                          label={servico.tiposervico.nometiposervico}
                          size="small"
                          color={servico.tiposervico.nometiposervico === 'Checklist' ? 'primary' : 'secondary'}
                        />
                        {servico.checklist?.status && (
                          <Chip
                            label={STATUS_CONFIG[servico.checklist.status as keyof typeof STATUS_CONFIG]?.label || servico.checklist.status}
                            size="small"
                            sx={{
                              bgcolor: STATUS_CONFIG[servico.checklist.status as keyof typeof STATUS_CONFIG]?.color || '#9E9E9E',
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      `Criado em: ${new Date(servico.criadoem).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} por ${servico.criadopor}`
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <ServicoModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingServico(null);
        }}
        onSuccess={handleSuccess}
        empresaId={empresaId}
        propostaId={propostaId}
        servico={editingServico}
      />

      <Dialog 
        open={deleteDialogOpen} 
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return;
          }
          handleDeleteCancel();
        }}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover este tipo de serviço? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
