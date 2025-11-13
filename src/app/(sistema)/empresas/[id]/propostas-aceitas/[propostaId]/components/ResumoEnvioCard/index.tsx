'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface ResumoEnvioCardProps {
  empresaId: string | string[];
  propostaId: string | string[];
}

export default function ResumoEnvioCard({ empresaId, propostaId }: ResumoEnvioCardProps) {
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumo();
  }, [empresaId, propostaId]);

  const fetchResumo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/resumo-envio`);
      if (response.ok) {
        const data = await response.json();
        if (data.finalizado) {
          setResumo(data);
        } else {
          setResumo(null);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumo();
  }, [empresaId, propostaId]);

  if (loading || !resumo) return null;

  const calcularDataEntrega = (prazoStr: string) => {
    const prazo = parseInt(prazoStr.replace(/\D/g, ''));
    if (isNaN(prazo)) return '-';
    
    const hoje = new Date();
    const dataEntrega = new Date(hoje);
    dataEntrega.setDate(dataEntrega.getDate() + prazo);
    
    return dataEntrega.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const calcularTotal = () => {
    let total = 0;
    resumo.valores.forEach((v: any) => {
      // Valor principal
      const valor = parseFloat(v.valorfinal?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
      total += valor;
      
      // Recursos adicionais
      if (v.recursos && v.recursos.length > 0) {
        v.recursos.forEach((r: any) => {
          const valorRecurso = parseFloat(r.valorfinal?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
          total += valorRecurso;
        });
      }
    });
    return total;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CheckCircle color="success" />
          <Typography variant="h6">Serviço Enviado</Typography>
          <Chip label="Finalizado" color="success" size="small" sx={{ ml: 'auto' }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Código e Datas na mesma linha */}
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Código do Serviço:
              </Typography>
              <Typography variant="body1">{resumo.codproposta || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Envio para Projetos:
              </Typography>
              <Typography variant="body1">
                {resumo.dataenvioproj 
                  ? new Date(resumo.dataenvioproj).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : '-'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Envio para Financeiro:
              </Typography>
              <Typography variant="body1">
                {resumo.dataenviofinanceiro 
                  ? new Date(resumo.dataenviofinanceiro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : '-'}
              </Typography>
            </Box>
          </Box>

          {/* Valores Totais */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Valores e Prazos de Entrega:
            </Typography>
            <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Valor Final</TableCell>
                    <TableCell>Forma de Pagamento</TableCell>
                    <TableCell>Mensalidade</TableCell>
                    <TableCell>Prazo</TableCell>
                    <TableCell>Data de Entrega</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resumo.valores.map((valor: any) => (
                    <React.Fragment key={valor.id}>
                      <TableRow>
                        <TableCell>{valor.nomevalor}</TableCell>
                        <TableCell>{valor.valorfinal || valor.valor}</TableCell>
                        <TableCell>{valor.formafinal || valor.formapagamento}</TableCell>
                        <TableCell>{valor.mensalidade || '-'}</TableCell>
                        <TableCell>{valor.prazofinal || valor.prazo}</TableCell>
                        <TableCell>{calcularDataEntrega(valor.prazofinal || valor.prazo)}</TableCell>
                      </TableRow>
                      {valor.recursos && valor.recursos.length > 0 && valor.recursos.map((recurso: any) => (
                        <TableRow key={`recurso-${recurso.id}`} sx={{ bgcolor: 'action.hover' }}>
                          <TableCell sx={{ pl: 4 }}>+ {recurso.nomerecurso}</TableCell>
                          <TableCell>{recurso.valorfinal || recurso.valor}</TableCell>
                          <TableCell>{recurso.formafinal || recurso.formapagamento}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>{recurso.prazofinal || recurso.prazo}</TableCell>
                          <TableCell>{calcularDataEntrega(recurso.prazofinal || recurso.prazo)}</TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Total */}
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Total: R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
