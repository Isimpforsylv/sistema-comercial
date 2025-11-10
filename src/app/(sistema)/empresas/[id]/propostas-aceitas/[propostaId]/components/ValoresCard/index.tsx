'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Add, ExpandMore, Info, SubdirectoryArrowRight, Delete } from '@mui/icons-material';
import ValorModal from '../ValorModal';

interface ValoresCardProps {
  empresaId: string | string[];
  propostaId: string | string[];
}

interface Recurso {
  id: number;
  nomerecurso: string;
  valor: string;
  formapagamento: string;
  prazo: string;
}

interface Valor {
  id: number;
  nomevalor: string;
  valor: string;
  formapagamento: string;
  mensalidade: string;
  alteracaomensalidade: string;
  prazo: string;
  observacao: string;
  criadopor: string;
  recursos: Recurso[];
}

export default function ValoresCard({ empresaId, propostaId }: ValoresCardProps) {
  const [valores, setValores] = useState<Valor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [valorToDelete, setValorToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchValores = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/valores`);
      if (response.ok) {
        const data = await response.json();
        setValores(data);
      }
    } catch (error) {
      console.error('Erro ao buscar valores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValores();
  }, [empresaId, propostaId]);

  const handleSuccess = () => {
    setModalOpen(false);
    fetchValores();
  };

  const handleDeleteClick = (valorId: number) => {
    setValorToDelete(valorId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!valorToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/valores/${valorToDelete}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        fetchValores();
        setDeleteDialogOpen(false);
        setValorToDelete(null);
      }
    } catch (error) {
      console.error('Erro ao deletar valor:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setValorToDelete(null);
  };

  if (loading) return <Typography>Carregando valores...</Typography>;

  return (
    <>
      <Card>
        <CardContent>
          <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                <Typography variant="h6">Valores ({valores.length})</Typography>
                <Button
                  startIcon={<Add />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalOpen(true);
                  }}
                  variant="contained"
                  size="small"
                >
                  Adicionar Valor
                </Button>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {valores.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" gutterBottom>
                    Nenhum valor cadastrado
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Nome do Valor</strong></TableCell>
                        <TableCell align="right"><strong>Valor</strong></TableCell>
                        <TableCell align="right"><strong>Mensalidade</strong></TableCell>
                        <TableCell align="right"><strong>Prazo</strong></TableCell>
                        <TableCell align="center"><strong>Ações</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {valores.map((valor) => (
                        <>
                          {/* Linha do Valor Principal */}
                          <TableRow key={valor.id} sx={{ '& > *': { borderBottom: 'unset' } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {valor.nomevalor}
                                </Typography>
                                <Tooltip
                                  title={
                                    <Box sx={{ p: 1 }}>
                                      <Typography variant="caption" display="block">
                                        <strong>Forma de pagamento:</strong> {valor.formapagamento}
                                      </Typography>
                                      <Typography variant="caption" display="block">
                                        <strong>Alteração da mensalidade:</strong>{' '}
                                        {valor.alteracaomensalidade || '-'}
                                      </Typography>
                                      <Typography variant="caption" display="block">
                                        <strong>Observações:</strong> {valor.observacao || '-'}
                                      </Typography>
                                      <Typography variant="caption" display="block">
                                        <strong>Criado por:</strong> {valor.criadopor}
                                      </Typography>
                                    </Box>
                                  }
                                  arrow
                                >
                                  <IconButton size="small">
                                    <Info fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell align="right">{valor.valor}</TableCell>
                            <TableCell align="right">{valor.mensalidade}</TableCell>
                            <TableCell align="right">{valor.prazo} dias</TableCell>
                            <TableCell align="center">
                              <Tooltip title="Remover valor">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(valor.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>

                          {/* Linhas dos Recursos */}
                          {valor.recursos?.map((recurso) => (
                            <TableRow key={recurso.id} sx={{ backgroundColor: 'action.hover' }}>
                              <TableCell sx={{ pl: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <SubdirectoryArrowRight fontSize="small" color="action" />
                                  <Typography variant="body2" color="text.secondary">
                                    {recurso.nomerecurso}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">{recurso.valor}</TableCell>
                              <TableCell align="right">-</TableCell>
                              <TableCell align="right">{recurso.prazo} dias</TableCell>
                              <TableCell align="center"></TableCell>
                            </TableRow>
                          ))}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      <ValorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        empresaId={empresaId}
        propostaId={propostaId}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover este valor? Esta ação também removerá todos os recursos
            adicionais vinculados a ele e não pode ser desfeita.
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
