'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import PendenciasCard from '../PendenciasCard';

interface PendenciasModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  checklistId: string | string[];
  readonly?: boolean;
}

interface Pendencia {
  id: number;
  descricao: string;
  impeditiva: boolean;
  finalizada: boolean;
  criadopor: string;
  finalizadopor: string | null;
  criadoem: string;
}

export default function PendenciasModal({ open, onClose, onSuccess, checklistId, readonly = false }: PendenciasModalProps) {
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [descricao, setDescricao] = useState('');
  const [impeditiva, setImpeditiva] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [descricaoEdit, setDescricaoEdit] = useState('');

  useEffect(() => {
    if (open) {
      fetchPendencias();
    } else {
      // Reset form when modal closes
      setDescricao('');
      setImpeditiva(false);
      setEditando(null);
      setDescricaoEdit('');
    }
  }, [open, checklistId]);

  const fetchPendencias = async () => {
    try {
      const response = await fetch(`/api/checklist/${checklistId}/pendencias`);
      if (response.ok) {
        const data = await response.json();
        setPendencias(data);
      }
    } catch (error) {
      console.error('Erro ao buscar pendências:', error);
    }
  };

  const handleAdicionarPendencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readonly) return;
    if (!descricao.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/checklist/${checklistId}/pendencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao, impeditiva }),
      });

      if (response.ok) {
        setDescricao('');
        setImpeditiva(false);
        fetchPendencias();
        // NÃO chama onSuccess() para manter o modal aberto
      }
    } catch (error) {
      console.error('Erro ao adicionar pendência:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFinalizada = async (pendenciaId: number, finalizada: boolean) => {
    if (readonly) return;
    try {
      const response = await fetch(`/api/checklist/${checklistId}/pendencias/${pendenciaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalizada: !finalizada }),
      });

      if (response.ok) {
        fetchPendencias();
        // NÃO chama onSuccess() para manter o modal aberto
      }
    } catch (error) {
      console.error('Erro ao atualizar pendência:', error);
    }
  };

  const handleEditarPendencia = async (pendenciaId: number) => {
    if (readonly) return;
    if (!descricaoEdit.trim()) return;

    try {
      const response = await fetch(`/api/checklist/${checklistId}/pendencias/${pendenciaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: descricaoEdit }),
      });

      if (response.ok) {
        setEditando(null);
        setDescricaoEdit('');
        fetchPendencias();
        // NÃO chama onSuccess() para manter o modal aberto
      }
    } catch (error) {
      console.error('Erro ao editar pendência:', error);
    }
  };

  const handleDeletarPendencia = async (pendenciaId: number) => {
    if (readonly) return;
    if (!confirm('Deseja realmente remover esta pendência?')) return;

    try {
      const response = await fetch(`/api/checklist/${checklistId}/pendencias/${pendenciaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPendencias();
        // NÃO chama onSuccess() para manter o modal aberto
      }
    } catch (error) {
      console.error('Erro ao deletar pendência:', error);
    }
  };

  const handleStartEdit = (pendencia: Pendencia) => {
    setEditando(pendencia.id);
    setDescricaoEdit(pendencia.descricao);
  };

  const pendenciasImpeditivas = pendencias.filter(p => p.impeditiva);
  const pendenciasNaoImpeditivas = pendencias.filter(p => !p.impeditiva);

  return (
    <Dialog 
      open={open} 
      onClose={(event, reason) => {
        // Bloqueia fechar ao clicar fora (backdrop)
        if (reason === 'backdropClick') {
          return;
        }
        onClose();
      }}
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>Gerenciar Pendências</DialogTitle>
      <DialogContent>
        {/* Card da Etapa Pendências */}
        <Box sx={{ mb: 4 }}>
          <PendenciasCard 
            checklistId={checklistId}
            onObservacaoAdded={onSuccess}
            disabled={readonly}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Formulário para Adicionar Pendência */}
        <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Adicionar Nova Pendência
            </Typography>
            <Box component="form" onSubmit={handleAdicionarPendencia} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                label="Descrição da Pendência"
                fullWidth
                multiline
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                disabled={loading || readonly}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={impeditiva}
                  label="Tipo"
                  onChange={(e) => setImpeditiva(e.target.value as boolean)}
                  disabled={loading || readonly}
                >
                  <MenuItem value={false as any}>Não Impeditiva</MenuItem>
                  <MenuItem value={true as any}>Impeditiva</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Add />}
                disabled={readonly || loading || !descricao.trim()}
                sx={{ minWidth: 120, height: 56 }}
              >
                Adicionar
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Listas de Pendências */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Pendências Impeditivas */}
          <Card>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Pendências Impeditivas ({pendenciasImpeditivas.length})
              </Typography>
              {pendenciasImpeditivas.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Nenhuma pendência impeditiva
                </Typography>
              ) : (
                <List>
                  {pendenciasImpeditivas.map((pendencia, index) => (
                    <Box key={pendencia.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <Checkbox
                          edge="start"
                          checked={pendencia.finalizada}
                          onChange={() => handleToggleFinalizada(pendencia.id, pendencia.finalizada)}
                          disabled={readonly}
                        />
                        {editando === pendencia.id ? (
                          <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={descricaoEdit}
                              onChange={(e) => setDescricaoEdit(e.target.value)}
                              multiline
                              disabled={readonly}
                            />
                            <Button size="small" onClick={() => handleEditarPendencia(pendencia.id)} disabled={readonly}>
                              Salvar
                            </Button>
                            <Button size="small" onClick={() => setEditando(null)} disabled={readonly}>
                              Cancelar
                            </Button>
                          </Box>
                        ) : (
                          <ListItemText
                            primary={pendencia.descricao}
                            secondary={
                              <>
                                <Typography component="span" variant="caption" display="block">
                                  Criado por: {pendencia.criadopor} em {new Date(pendencia.criadoem).toLocaleDateString('pt-BR')}
                                </Typography>
                                {pendencia.finalizada && pendencia.finalizadopor && (
                                  <Typography component="span" variant="caption" display="block" color="success.main">
                                    Finalizado por: {pendencia.finalizadopor}
                                  </Typography>
                                )}
                              </>
                            }
                            sx={{
                              textDecoration: pendencia.finalizada ? 'line-through' : 'none',
                              opacity: pendencia.finalizada ? 0.6 : 1
                            }}
                          />
                        )}
                        <ListItemSecondaryAction>
                          {!pendencia.finalizada && (
                            <>
                              <IconButton edge="end" size="small" onClick={() => handleStartEdit(pendencia)} disabled={readonly}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton edge="end" size="small" onClick={() => handleDeletarPendencia(pendencia.id)} disabled={readonly}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Pendências Não Impeditivas */}
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Pendências Não Impeditivas ({pendenciasNaoImpeditivas.length})
              </Typography>
              {pendenciasNaoImpeditivas.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Nenhuma pendência não impeditiva
                </Typography>
              ) : (
                <List>
                  {pendenciasNaoImpeditivas.map((pendencia, index) => (
                    <Box key={pendencia.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <Checkbox
                          edge="start"
                          checked={pendencia.finalizada}
                          onChange={() => handleToggleFinalizada(pendencia.id, pendencia.finalizada)}
                          disabled={readonly}
                        />
                        {editando === pendencia.id ? (
                          <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={descricaoEdit}
                              onChange={(e) => setDescricaoEdit(e.target.value)}
                              multiline
                              disabled={readonly}
                            />
                            <Button size="small" onClick={() => handleEditarPendencia(pendencia.id)} disabled={readonly}>
                              Salvar
                            </Button>
                            <Button size="small" onClick={() => setEditando(null)} disabled={readonly}>
                              Cancelar
                            </Button>
                          </Box>
                        ) : (
                          <ListItemText
                            primary={pendencia.descricao}
                            secondary={
                              <>
                                <Typography component="span" variant="caption" display="block">
                                  Criado por: {pendencia.criadopor} em {new Date(pendencia.criadoem).toLocaleDateString('pt-BR')}
                                </Typography>
                                {pendencia.finalizada && pendencia.finalizadopor && (
                                  <Typography component="span" variant="caption" display="block" color="success.main">
                                    Finalizado por: {pendencia.finalizadopor}
                                  </Typography>
                                )}
                              </>
                            }
                            sx={{
                              textDecoration: pendencia.finalizada ? 'line-through' : 'none',
                              opacity: pendencia.finalizada ? 0.6 : 1
                            }}
                          />
                        )}
                        <ListItemSecondaryAction>
                          {!pendencia.finalizada && (
                            <>
                              <IconButton edge="end" size="small" onClick={() => handleStartEdit(pendencia)} disabled={readonly}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton edge="end" size="small" onClick={() => handleDeletarPendencia(pendencia.id)} disabled={readonly}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            onClick={() => {
              onSuccess(); // Atualiza a lista na aba antes de fechar
              onClose();
            }} 
            variant="contained"
          >
            Fechar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
