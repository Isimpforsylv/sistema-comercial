'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface ContratoJuntoEnvioDialogProps {
  open: boolean;
  onClose: () => void;
  onResponse: (juntoEnvio: boolean) => void;
}

export default function ContratoJuntoEnvioDialog({ open, onClose, onResponse }: ContratoJuntoEnvioDialogProps) {
  const handleSim = () => {
    onResponse(true);
    onClose();
  };

  const handleNao = () => {
    onResponse(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assinatura do Contrato</DialogTitle>
      <DialogContent>
        <Typography>
          Esta etapa será feita junto ao envio do serviço?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleNao} variant="outlined">
          Não
        </Button>
        <Button onClick={handleSim} variant="contained" color="primary">
          Sim
        </Button>
      </DialogActions>
    </Dialog>
  );
}
