import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    setLoading(true);
    // In a real app, this would call an API endpoint
    // For demo purposes, we'll just simulate a successful request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };
  
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        py: 8,
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="xs">
        <Paper 
          elevation={3} 
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Image
              src="/logo.png"
              alt="Seller Navi Logo"
              width={180}
              height={60}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            パスワードのリセット
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            アカウントに登録されているメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success ? (
            <>
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                パスワードリセット用のメールを送信しました。メールボックスを確認してください。
              </Alert>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                component={Link}
                href="/login"
                sx={{ mt: 2 }}
              >
                ログインページに戻る
              </Button>
            </>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="メールアドレス"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : '送信'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link href="/login" passHref legacyBehavior>
                  <a style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ 
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' } 
                    }}>
                      ログインページに戻る
                    </Typography>
                  </a>
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Seller Navi. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage; 