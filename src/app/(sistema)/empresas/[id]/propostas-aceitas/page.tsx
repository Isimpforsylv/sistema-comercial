'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Header from '@/app/components/Header';
import PropostaAceitaModal from './components/PropostaAceitaModal';

interface PropostaAceita {
  id: number;
  nomeproposta: string;
  codproposta?: string | null;
  criadoem: string;
}

export default function PropostasAceitasPage() {
  const params = useParams();
  const empresaId = Number(params?.id);
  const [modalOpen, setModalOpen] = useState(false);
  const [propostas, setPropostas] = useState<PropostaAceita[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingProposta, setEditingProposta] = useState<PropostaAceita | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propostaToDelete, setPropostaToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPropostas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas`);
      const data = await response.json();
      setPropostas(data);
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (empresaId) fetchPropostas();
  }, [empresaId]);

  const handleSuccess = async () => {
    const scrollY = window.scrollY;
    setModalOpen(false);
    setEditingProposta(null);
    await fetchPropostas();
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  const handleEditClick = (e: React.MouseEvent, proposta: PropostaAceita) => {
    e.stopPropagation();
    setEditingProposta(proposta);
    setModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, propostaId: number) => {
    e.stopPropagation();
    setPropostaToDelete(propostaId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propostaToDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const scrollY = window.scrollY;
        setPropostas(prev => prev.filter(p => p.id !== propostaToDelete));
        setDeleteDialogOpen(false);
        setPropostaToDelete(null);
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      }
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (initialLoad) return null;

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Lista de Propostas
          </Typography>
          <Button variant="contained" onClick={() => setModalOpen(true)}>
            Criar Nova Proposta
          </Button>
        </Box>
        {propostas.length === 0 ? (
          <Card>
            <CardContent>
              <Typography align="center" color="text.secondary">
                Nenhuma proposta cadastrada
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {propostas.map((prop) => (
                <Card key={prop.id} sx={{ cursor: 'pointer', position: 'relative' }} onClick={() => window.location.href = `/empresas/${empresaId}/propostas-aceitas/${prop.id}`}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{prop.nomeproposta}</Typography>
                        {prop.codproposta && (
                          <Typography variant="body2" color="primary" sx={{ mb: 0.5 }}>
                            Código: {prop.codproposta}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Criado em: {new Date(prop.criadoem).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => handleEditClick(e, prop)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => handleDeleteClick(e, prop.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
            ))}
          </Box>
        )}
      </Container>
      <PropostaAceitaModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProposta(null);
        }}
        onSuccess={handleSuccess}
        empresaId={empresaId}
        proposta={editingProposta}
      />

      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
