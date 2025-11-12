'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Alert,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface ValidationModalProps {
  open: boolean;
  onClose: () => void;
  etapasNaoFinalizadas: string[];
  pendenciasImpeditivas: string[];
}

export default function ValidationModal({
  open,
  onClose,
  etapasNaoFinalizadas,
  pendenciasImpeditivas,
}: ValidationModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Não é possível finalizar o checklist
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Para finalizar o checklist, é necessário completar todos os requisitos abaixo:
        </Alert>

        {etapasNaoFinalizadas.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Etapas não finalizadas ({etapasNaoFinalizadas.length}):
            </Typography>
            <List dense>
              {etapasNaoFinalizadas.map((etapa, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText primary={`• ${etapa}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {pendenciasImpeditivas.length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Pendências impeditivas não resolvidas ({pendenciasImpeditivas.length}):
            </Typography>
            <List dense>
              {pendenciasImpeditivas.map((pendencia, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText primary={`• ${pendencia}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Entendi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
