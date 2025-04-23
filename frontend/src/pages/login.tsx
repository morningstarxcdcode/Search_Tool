import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const { login, error, loading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!email || !password) {
      setFormError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
    }
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
          
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            ログイン
          </Typography>
          
          {(error || formError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {formError || error}
            </Alert>
          )}
          
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'ログイン'}
            </Button>
            
            <Grid container>
              <Grid item xs>
                <Link href="/forgot-password" passHref>
                  <Typography variant="body2" component="a" sx={{ 
                    color: 'primary.main', 
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}>
                    パスワードをお忘れですか？
                  </Typography>
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" passHref>
                  <Typography variant="body2" component="a" sx={{ 
                    color: 'primary.main', 
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}>
                    アカウント登録はこちら
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
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

export default LoginPage; 