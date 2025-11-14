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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';

interface CobrancasModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  melhoriaId: string | string[];
  empresaId: string | string[];
  propostaId: string | string[];
  nometapa: string;
  dataCobranca: string;
  readonly?: boolean;
}

interface Cobranca {
  id: number;
  datacobranca: string;
  quandofcobrado: string;
  proximacobranca: string;
  observacao: string;
  criadopor: string;
  criadoem: string;
}

export default function CobrancasModal({
  open,
  onClose,
  onSuccess,
  melhoriaId,
  empresaId,
  propostaId,
  nometapa,
  dataCobranca,
  readonly = false,
}: CobrancasModalProps) {
  const [quandoCobrado, setQuandoCobrado] = useState('');
  const [proximaCobranca, setProximaCobranca] = useState('');
  const [observacao, setObservacao] = useState('');
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Sugerir data de hoje
      const hoje = new Date().toISOString().split('T')[0];
      setQuandoCobrado(hoje);
      calcularProximaCobranca(hoje);
      fetchCobrancas();
    }
  }, [open]);

  const fetchCobrancas = async () => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/melhoria/${melhoriaId}/cobrancas/${nometapa}`);
      if (response.ok) {
        const data = await response.json();
        setCobrancas(data);
      }
    } catch (error) {
      console.error('Erro ao buscar cobranças:', error);
    }
  };

  const calcularProximaCobranca = (dataBase: string) => {
    if (!dataBase) return;
    
    const data = new Date(dataBase + 'T00:00:00');
    let diasAdicionados = 0;
    
    // Adicionar 3 dias úteis
    while (diasAdicionados < 3) {
      data.setDate(data.getDate() + 1);
      const diaSemana = data.getDay();
      // 0 = Domingo, 6 = Sábado
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasAdicionados++;
      }
    }
    
    setProximaCobranca(data.toISOString().split('T')[0]);
  };

  const handleQuandoCobradoChange = (value: string) => {
    setQuandoCobrado(value);
    calcularProximaCobranca(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quandoCobrado) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/melhoria/${melhoriaId}/cobrancas/${nometapa}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datacobranca: dataCobranca,
          quandofcobrado: quandoCobrado,
          proximacobranca: proximaCobranca,
          observacao,
        }),
      });

      if (response.ok) {
        setQuandoCobrado('');
        setProximaCobranca('');
        setObservacao('');
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar cobrança:', error);
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
      <DialogTitle>{readonly ? 'Histórico de Cobranças' : 'Atualizar Cobranças'} - {nometapa}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Formulário - somente se não for readonly */}
          {!readonly && (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                <TextField
                  label="Data da cobrança"
                  type="date"
                  fullWidth
                  value={dataCobranca}
                  disabled
                  InputLabelProps={{ shrink: true }}
                  helperText="Data atual no campo 'Cobrar em'"
                />
                
                <TextField
                  label="Quando foi cobrado"
                  type="date"
                  fullWidth
                  required
                  value={quandoCobrado}
                  onChange={(e) => handleQuandoCobradoChange(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  label="Próxima cobrança"
                  type="date"
                  fullWidth
                  value={proximaCobranca}
                  onChange={(e) => setProximaCobranca(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Calculado automaticamente: +3 dias úteis"
                />
                
                <TextField
                  label="Observação da cobrança"
                  multiline
                  rows={3}
                  fullWidth
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </Box>

              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Histórico */}
          <Typography variant="h6" gutterBottom>
            Histórico de Cobranças
          </Typography>
          
          {cobrancas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="text.secondary">
                Nenhuma cobrança registrada
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data Cobrança</TableCell>
                    <TableCell>Quando Cobrado</TableCell>
                    <TableCell>Próxima</TableCell>
                    <TableCell>Observação</TableCell>
                    <TableCell>Por</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cobrancas.map((cobranca) => (
                    <TableRow key={cobranca.id}>
                      <TableCell>
                        {new Date(cobranca.datacobranca).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {new Date(cobranca.quandofcobrado).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {new Date(cobranca.proximacobranca).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{cobranca.observacao || '-'}</TableCell>
                      <TableCell>{cobranca.criadopor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {readonly ? 'Fechar' : 'Cancelar'}
        </Button>
        {!readonly && (
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
