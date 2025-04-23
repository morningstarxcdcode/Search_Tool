import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Skip layout on login and signup pages
  const isAuthPage = router.pathname === '/login' || router.pathname === '/signup';
  
  if (isAuthPage) {
    return (
      <Box component="main" sx={{ minHeight: '100vh' }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout; 