'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';

interface HistoricoModalProps {
  open: boolean;
  onClose: () => void;
  historico: string;
  titulo: string;
}

interface HistoricoItem {
  data: string;
  alteradoPor: string;
  alteradoEm: string;
}

export default function HistoricoModal({ open, onClose, historico, titulo }: HistoricoModalProps) {
  let historicoArray: HistoricoItem[] = [];
  
  try {
    historicoArray = JSON.parse(historico || '[]');
  } catch (error) {
    console.error('Erro ao parsear histórico:', error);
  }

  return (
    <Dialog 
      open={open} 
      onClose={(event, reason) => {
        if (reason === 'backdropClick') {
          return;
        }
        onClose();
      }} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        {historicoArray.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Nenhuma alteração registrada</Typography>
          </Box>
        ) : (
          <List>
            {historicoArray.map((item, index) => (
              <ListItem key={index} divider={index < historicoArray.length - 1}>
                <ListItemText
                  primary={new Date(item.data).toLocaleDateString('pt-BR')}
                  secondary={`Alterado por: ${item.alteradoPor} em ${new Date(item.alteradoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
