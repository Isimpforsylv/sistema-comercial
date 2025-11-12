'use client';

import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { AccountCircle, Lock, Logout } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  userName: string;
}

export default function UserMenu({ userName }: UserMenuProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangePasswordClick = () => {
    handleMenuClose();
    setChangePasswordOpen(true);
    setError('');
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  };

  const handleChangePasswordClose = () => {
    setChangePasswordOpen(false);
    setError('');
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  };

  const handleChangePasswordSubmit = async () => {
    setError('');

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setError('Preencha todos os campos');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não conferem');
      return;
    }

    if (novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });

      if (res.ok) {
        handleChangePasswordClose();
        setSuccessOpen(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao alterar senha');
      }
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      setError('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      router.push('/login');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {userName}
        </Typography>
        <IconButton onClick={handleMenuOpen} color="inherit">
          <AccountCircle />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleChangePasswordClick}>
          <ListItemIcon>
            <Lock fontSize="small" />
          </ListItemIcon>
          <ListItemText>Alterar senha</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sair</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={changePasswordOpen} onClose={handleChangePasswordClose} maxWidth="sm" fullWidth>
        <DialogTitle>Alterar Senha</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Senha atual"
              type="password"
              fullWidth
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
            <TextField
              label="Nova senha"
              type="password"
              fullWidth
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            <TextField
              label="Confirmar nova senha"
              type="password"
              fullWidth
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChangePasswordClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleChangePasswordSubmit} variant="contained" disabled={loading}>
            {loading ? 'Alterando...' : 'Alterar senha'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          Senha alterada com sucesso!
        </Alert>
      </Snackbar>
    </>
  );
}
