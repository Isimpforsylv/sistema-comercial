'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Button, IconButton, Tooltip } from '@mui/material';
import { Edit, ContentCopy } from '@mui/icons-material';
import InformacoesPropostaModal from '../InformacoesPropostaModal';

interface InformacoesPropostaCardProps {
  empresaId: string | string[];
  propostaId: string | string[];
}

interface InformacoesProposta {
  id?: number;
  empresa: string;
  pais: string;
  estado: string;
  cidade: string;
  endereco: string;
  contato: string;
  email: string;
  telefone: string;
  linkwiki: string;
  caminhopasta: string;
  dataaceite: string;
  criadopor: string;
  atualizadopor: string;
}

export default function InformacoesPropostaCard({ empresaId, propostaId }: InformacoesPropostaCardProps) {
  const [informacoes, setInformacoes] = useState<InformacoesProposta | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchInformacoes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}/propostas-aceitas/${propostaId}/informacoes`);
      if (response.ok) {
        const data = await response.json();
        setInformacoes(data);
      }
    } catch (error) {
      console.error('Erro ao buscar informações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInformacoes();
  }, [empresaId, propostaId]);

  const handleSuccess = () => {
    setModalOpen(false);
    fetchInformacoes();
  };

  const handleCopyPath = async () => {
    if (informacoes?.caminhopasta) {
      try {
        await navigator.clipboard.writeText(informacoes.caminhopasta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Erro ao copiar:', error);
      }
    }
  };

  if (loading) return <Typography>Carregando informações...</Typography>;

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Informações da Proposta</Typography>
            <Button startIcon={<Edit />} onClick={() => setModalOpen(true)} variant="outlined" size="small">
              Editar
            </Button>
          </Box>

          {informacoes ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Empresa */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Empresa:
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {informacoes.empresa}
                </Typography>
              </Box>

              {/* Endereço */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Endereço:
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {informacoes.endereco} - {informacoes.cidade} - {informacoes.estado} | {informacoes.pais}
                </Typography>
              </Box>

              {/* Contato (Wiki) */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Contato (
                  {informacoes.linkwiki ? (
                    <Typography
                      component="a"
                      href={informacoes.linkwiki}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontSize: 'inherit',
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Wiki
                    </Typography>
                  ) : (
                    'Wiki'
                  )}
                  ):
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {informacoes.contato} - {informacoes.email} - {informacoes.telefone}
                </Typography>
              </Box>

              {/* Caminho da Pasta */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Caminho da pasta:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {informacoes.caminhopasta}
                  </Typography>
                  <Tooltip title={copied ? 'Copiado!' : 'Copiar caminho'}>
                    <IconButton
                      size="small"
                      onClick={handleCopyPath}
                      color={copied ? 'success' : 'default'}
                      sx={{ ml: 0.5 }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Data do Aceite */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  Data do aceite:
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {new Date(informacoes.dataaceite).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>

              {/* Última atualização */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Última atualização por: {informacoes.atualizadopor}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" gutterBottom>Nenhuma informação cadastrada</Typography>
              <Button variant="contained" onClick={() => setModalOpen(true)} size="small">
                Cadastrar Informações
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <InformacoesPropostaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        empresaId={empresaId}
        propostaId={propostaId}
        informacoes={informacoes}
      />
    </>
  );
}
