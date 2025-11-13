'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface PendenciasDialogProps {
  open: boolean;
  onClose: () => void;
  onResponse: (temPendencias: boolean) => void;
}

export default function PendenciasDialog({ open, onClose, onResponse }: PendenciasDialogProps) {
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
      <DialogTitle>Pendências do Checklist</DialogTitle>
      <DialogContent>
        <Typography>
          Ficou alguma pendência nesta etapa de Checklist?
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
