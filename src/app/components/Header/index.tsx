'use client';

import { AppBar, Toolbar, Box, IconButton, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { Brightness4, Brightness7, Logout, ArrowBack } from '@mui/icons-material';
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
  const pathname = typeof window !== 'undefined' ? usePathname() : '';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      router.push('/login');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!mounted) return null;
  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/empresas';

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!isLoginPage && !isHomePage && (
            <IconButton onClick={handleGoBack} color="inherit" sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
          )}
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
