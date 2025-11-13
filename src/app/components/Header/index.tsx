'use client';

import { AppBar, Toolbar, Box, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { Brightness4, Brightness7, ArrowBack } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import { useRouter, usePathname } from 'next/navigation';
import UserMenu from '../UserMenu';

interface HeaderProps {
  showLogout?: boolean;
}

export default function Header({ showLogout = true }: HeaderProps) {
  const { mode, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? usePathname() : '';
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showLogout && mounted) {
      fetchUserName();
    }
  }, [showLogout, mounted]);

  const fetchUserName = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserName(data.user?.nome || data.nome || 'Usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar nome do usuário:', error);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!mounted) return null;
  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/empresas';

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderRadius: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
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
          {showLogout && !isLoginPage && userName && (
            <UserMenu userName={userName} />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
