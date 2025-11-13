'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface EnviarServicoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresaId: string | string[];
  propostaId: string | string[];
  proposta: any;
}

interface ValorEditavel {
  id: number;
  nomevalor: string;
  valor: string;
  formapagamento: string;
  prazo: string;
  valorfinal: string;
  formafinal: string;
  prazofinal: string;
  recursos: RecursoEditavel[];
}

interface RecursoEditavel {
  id: number;
  nomerecurso: string;
  valor: string;
  formapagamento: string;
  prazo: string;
  valorfinal: string;
  formafinal: string;
  prazofinal: string;
}

export default function EnviarServicoModal({
  open,
  onClose,
  onSuccess,
  empresaId,
  propostaId,
  proposta,
}: EnviarServicoModalProps) {
  const [codigoservico, setCodigoservico] = useState('');
  const [dataenvioproj, setDataenvioproj] = useState(new Date().toISOString().split('T')[0]);
  const [dataenviofinanceiro, setDataenviofinanceiro] = useState(new Date().toISOString().split('T')[0]);
  const [valores, setValores] = useState<ValorEditavel[]>([]);
  const [loading, setLoading] = useState(false);
  const [gerandoCodigo, setGerandoCodigo] = useState(false);

  useEffect(() => {
    if (open) {
      setCodigoservico(proposta?.codproposta || '');
      setDataenvioproj(new Date().toISOString().split('T')[0]);
      setDataenviofinanceiro(new Date().toISOString().split('T')[0]);
      fetchValores();
    }
  }, [open, proposta]);

  const fetchValores = async () => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/valores`);
      if (response.ok) {
        const data = await response.json();
        setValores(data.map((v: any) => ({
          id: v.id,
          nomevalor: v.nomevalor,
          valor: v.valor,
          formapagamento: v.formapagamento,
          prazo: v.prazo,
          valorfinal: v.valorfinal || v.valor,
          formafinal: v.formafinal || v.formapagamento,
          prazofinal: v.prazofinal || v.prazo,
          recursos: (v.recursos || []).map((r: any) => ({
            id: r.id,
            nomerecurso: r.nomerecurso,
            valor: r.valor,
            formapagamento: r.formapagamento,
            prazo: r.prazo,
            valorfinal: r.valorfinal || r.valor,
            formafinal: r.formafinal || r.formapagamento,
            prazofinal: r.prazofinal || r.prazo,
          })),
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar valores:', error);
    }
  };

  const handleGerarCodigo = async () => {
    setGerandoCodigo(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/gerar-codigo`);
      if (response.ok) {
        const data = await response.json();
        setCodigoservico(data.codigo);
      }
    } catch (error) {
      console.error('Erro ao gerar código:', error);
    } finally {
      setGerandoCodigo(false);
    }
  };

  const handleValorChange = (id: number, field: string, value: string) => {
    setValores(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const handleRecursoChange = (valorId: number, recursoId: number, field: string, value: string) => {
    setValores(prev => prev.map(v => 
      v.id === valorId ? {
        ...v,
        recursos: v.recursos.map(r => 
          r.id === recursoId ? { ...r, [field]: value } : r
        )
      } : v
    ));
  };

  const calcularDataEntrega = (prazoStr: string) => {
    const prazo = parseInt(prazoStr.replace(/\D/g, ''));
    if (isNaN(prazo)) return '-';
    
    const hoje = new Date();
    const dataEntrega = new Date(hoje);
    dataEntrega.setDate(dataEntrega.getDate() + prazo);
    
    return dataEntrega.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/enviar-servico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoservico,
          dataenvioproj,
          dataenviofinanceiro,
          valores: valores.map(v => ({
            id: v.id,
            valorfinal: v.valorfinal,
            formafinal: v.formafinal,
            prazofinal: v.prazofinal,
            recursos: v.recursos.map(r => ({
              id: r.id,
              valorfinal: r.valorfinal,
              formafinal: r.formafinal,
              prazofinal: r.prazofinal,
            })),
          })),
        }),
      });
      
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao enviar serviço:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Enviar Novo Serviço</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* Código do Serviço */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="Código do Serviço"
                fullWidth
                required
                value={codigoservico}
                onChange={(e) => setCodigoservico(e.target.value)}
                disabled={loading || gerandoCodigo}
                InputProps={{
                  readOnly: !!codigoservico && !gerandoCodigo,
                }}
              />
              <IconButton 
                onClick={handleGerarCodigo} 
                disabled={loading || gerandoCodigo}
                color="primary"
                sx={{ minWidth: 56 }}
              >
                <Refresh />
              </IconButton>
            </Box>

            {/* Datas */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Data do Envio para Projetos"
                type="date"
                fullWidth
                required
                value={dataenvioproj}
                onChange={(e) => setDataenvioproj(e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Data do Envio para Financeiro"
                type="date"
                fullWidth
                required
                value={dataenviofinanceiro}
                onChange={(e) => setDataenviofinanceiro(e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Tabela de Valores Editável */}
            {valores.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Valores e Prazos
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Valor Original</TableCell>
                        <TableCell>Valor Final</TableCell>
                        <TableCell>Forma Original</TableCell>
                        <TableCell>Forma Final</TableCell>
                        <TableCell>Prazo (dias)</TableCell>
                        <TableCell>Data Entrega</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {valores.map((valor) => (
                        <React.Fragment key={valor.id}>
                          <TableRow>
                            <TableCell>{valor.nomevalor}</TableCell>
                            <TableCell>{valor.valor}</TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={valor.valorfinal}
                                onChange={(e) => handleValorChange(valor.id, 'valorfinal', e.target.value)}
                                disabled={loading}
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>{valor.formapagamento}</TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={valor.formafinal}
                                onChange={(e) => handleValorChange(valor.id, 'formafinal', e.target.value)}
                                disabled={loading}
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={valor.prazofinal}
                                onChange={(e) => handleValorChange(valor.id, 'prazofinal', e.target.value)}
                                disabled={loading}
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>{calcularDataEntrega(valor.prazofinal)}</TableCell>
                          </TableRow>
                          {valor.recursos && valor.recursos.length > 0 && valor.recursos.map((recurso) => (
                            <TableRow key={`recurso-${recurso.id}`} sx={{ bgcolor: 'action.hover' }}>
                              <TableCell sx={{ pl: 4 }}>+ {recurso.nomerecurso}</TableCell>
                              <TableCell>{recurso.valor}</TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={recurso.valorfinal}
                                  onChange={(e) => handleRecursoChange(valor.id, recurso.id, 'valorfinal', e.target.value)}
                                  disabled={loading}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>{recurso.formapagamento}</TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={recurso.formafinal}
                                  onChange={(e) => handleRecursoChange(valor.id, recurso.id, 'formafinal', e.target.value)}
                                  disabled={loading}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={recurso.prazofinal}
                                  onChange={(e) => handleRecursoChange(valor.id, recurso.id, 'prazofinal', e.target.value)}
                                  disabled={loading}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>{calcularDataEntrega(recurso.prazofinal)}</TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Enviando...' : 'Confirmar Envio'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
