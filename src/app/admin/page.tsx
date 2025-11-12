import { redirect } from 'next/navigation';
import Header from '@/app/components/Header';
import { Container, Typography, Box } from '@mui/material';
import { getCurrentUser } from '@/lib/auth';
import UsersTable from './components/UsersTable';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.admin) redirect('/empresas');

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1">Administração</Typography>
          <Typography variant="body2" color="text.secondary">Gerencie usuários do sistema</Typography>
        </Box>
        <UsersTable />
      </Container>
    </>
  );
}
