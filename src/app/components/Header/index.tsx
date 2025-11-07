'use client';

import { AppBar, Toolbar, Box, IconButton, Button } from '@mui/material';
import { Brightness4, Brightness7, Logout } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderProps {
  showLogout?: boolean;
}

export default function Header({ showLogout = true }: HeaderProps) {
  const { mode, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push('/login');
  };

  const isLoginPage = pathname === '/login';

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isLoginPage ? (
            <Image
              src="https://tickets.ideia2001.com.br/_next/static/media/logo-ideia.635711bc.svg"
              alt="Ideia 2001"
              width={120}
              height={40}
              priority
            />
          ) : (
            <Link href="/empresas" style={{ display: 'flex', alignItems: 'center' }}>
              <Image
                src="https://tickets.ideia2001.com.br/_next/static/media/logo-ideia.635711bc.svg"
                alt="Ideia 2001"
                width={120}
                height={40}
                priority
              />
            </Link>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          
          {showLogout && !isLoginPage && (
            <Button
              startIcon={<Logout />}
              onClick={handleLogout}
              color="inherit"
            >
              Sair
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
