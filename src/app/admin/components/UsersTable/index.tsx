"use client";

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { Add, AdminPanelSettings, Delete, LockReset, PersonOff, Person } from '@mui/icons-material';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import { useRouter } from 'next/navigation';

export type UsuarioRow = {
  id: number;
  nome: string;
  email: string;
  admin: boolean;
  ativo: boolean;
  criadoem: string;
  atualizadoem: string;
};

export default function UsersTable() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Create user dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [saving, setSaving] = useState(false);

  // Change password dialog
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState<UsuarioRow | null>(null);
  const [pwdNova, setPwdNova] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  // Confirm delete
  const [confirm, setConfirm] = useState<{ open: boolean; title?: string; message?: string; onConfirm?: () => void }>({ open: false });

  useEffect(() => setMounted(true), []);

  // Check admin and fetch users
  const bootstrap = async () => {
    try {
      const me = await fetch('/api/auth/me');
      if (me.status !== 200) {
        setErrorMsg('Não autenticado. Faça login novamente.');
        router.push('/login');
        return;
      }
      const meJson = await me.json();
      if (!meJson?.user?.admin) {
        setErrorMsg('Acesso restrito a administradores.');
        router.push('/empresas');
        return;
      }

      const res = await fetch('/api/admin/usuarios');
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      } else {
        const txt = await res.text();
        console.error('Erro ao buscar usuários:', res.status, txt);
        setErrorMsg(`Erro ao buscar usuários: ${res.status} ${txt}`);
      }
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => { bootstrap(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(u => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [search, usuarios]);

  const toggleAdmin = async (u: UsuarioRow) => {
    const res = await fetch(`/api/admin/usuarios/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin: !u.admin }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsuarios(prev => prev.map(x => x.id === u.id ? updated : x));
    }
  };

  const toggleAtivo = async (u: UsuarioRow) => {
    const res = await fetch(`/api/admin/usuarios/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !u.ativo }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsuarios(prev => prev.map(x => x.id === u.id ? updated : x));
    }
  };

  const excluirUsuario = async (u: UsuarioRow) => {
    const res = await fetch(`/api/admin/usuarios/${u.id}`, { method: 'DELETE' });
    if (res.ok) setUsuarios(prev => prev.filter(x => x.id !== u.id));
  };

  const abrirTrocaSenha = (u: UsuarioRow) => {
    setPwdUser(u); setPwdNova(''); setPwdOpen(true);
  };
  const salvarSenha = async () => {
    if (!pwdUser || !pwdNova) return;
    setPwdSaving(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${pwdUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: pwdNova }),
      });
      if (res.ok) {
        setPwdOpen(false);
      }
    } finally { setPwdSaving(false); }
  };

  const criarUsuario = async () => {
    if (!novoNome || !novoEmail || !novaSenha || novaSenha !== confirmarSenha) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome, email: novoEmail, senha: novaSenha, confirmarSenha }),
      });
      if (res.ok) {
        const novo = await res.json();
        setUsuarios(prev => [novo, ...prev]);
        setCreateOpen(false);
        setNovoNome(''); setNovoEmail(''); setNovaSenha(''); setConfirmarSenha('');
      } else {
        const txt = await res.text();
        console.error('Erro ao criar usuário:', res.status, txt);
        setErrorMsg(`Erro ao criar usuário: ${res.status} ${txt}`);
      }
    } finally { setSaving(false); }
  };

  if (!mounted || initialLoad) return null;

  // Show error banner if occurred
  const ErrorBanner = errorMsg ? (
    <Box sx={{ mb: 2 }}>
      <Typography color="error">{errorMsg}</Typography>
    </Box>
  ) : null;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>Criar usuário</Button>
      </Box>

  {ErrorBanner}
  <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Buscar por nome ou email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              fullWidth
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Nome</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell align="center"><strong>Admin</strong></TableCell>
                  <TableCell align="center"><strong>Ativo</strong></TableCell>
                  <TableCell align="right"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.nome}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell align="center">{u.admin ? 'Sim' : 'Não'}</TableCell>
                    <TableCell align="center">{u.ativo ? 'Sim' : 'Não'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={u.admin ? 'Remover admin' : 'Tornar admin'}>
                        <IconButton size="small" color={u.admin ? 'secondary' : 'primary'} onClick={() => toggleAdmin(u)}>
                          <AdminPanelSettings fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={u.ativo ? 'Desativar acesso' : 'Ativar acesso'}>
                        <IconButton size="small" color={u.ativo ? 'warning' : 'success'} onClick={() => toggleAtivo(u)}>
                          {u.ativo ? <PersonOff fontSize="small" /> : <Person fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Mudar senha">
                        <IconButton size="small" onClick={() => abrirTrocaSenha(u)}>
                          <LockReset fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir usuário">
                        <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, title: 'Excluir usuário', message: `Deseja realmente excluir ${u.nome}?`, onConfirm: () => excluirUsuario(u) })}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Criar usuário */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Criar usuário</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} fullWidth />
          <TextField label="Email" type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} fullWidth />
          <TextField label="Senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} fullWidth />
          <TextField label="Confirmar senha" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} fullWidth error={confirmarSenha.length>0 && confirmarSenha!==novaSenha} helperText={confirmarSenha.length>0 && confirmarSenha!==novaSenha ? 'Senhas não conferem' : ' '} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button onClick={criarUsuario} variant="contained" disabled={saving || !novoNome || !novoEmail || !novaSenha || novaSenha !== confirmarSenha}>{saving ? 'Salvando...' : 'Criar'}</Button>
        </DialogActions>
      </Dialog>

      {/* Trocar senha */}
      <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Alterar senha {pwdUser ? `- ${pwdUser.nome}` : ''}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Nova senha" type="password" value={pwdNova} onChange={(e) => setPwdNova(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwdOpen(false)}>Cancelar</Button>
          <Button onClick={salvarSenha} variant="contained" disabled={pwdSaving || !pwdNova}>{pwdSaving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title || ''}
        message={confirm.message || ''}
        onClose={() => setConfirm({ open: false })}
        onConfirm={() => { confirm.onConfirm?.(); setConfirm({ open: false }); }}
      />
    </>
  );
}
