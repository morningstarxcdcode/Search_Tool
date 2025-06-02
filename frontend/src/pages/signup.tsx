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
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';

const SignupPage = () => {
  const { signup, error, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setFormError('すべての項目を入力してください');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('パスワードが一致しません');
      return;
    }
    
    if (!agreeToTerms) {
      setFormError('ご利用規約に同意してください');
      return;
    }
    
    try {
      await signup(name, email, password);
      router.push('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setFormError('アカウント登録に失敗しました。もう一度お試しください。');
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
      <Container maxWidth="sm">
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
            アカウント登録
          </Typography>
          
          {(error || formError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {formError || error}
            </Alert>
          )}
          
          <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
            デモ用アカウントはログインページから: admin@gmail.com / 123456 でログインできます
          </Alert>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="お名前"
              name="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="パスワード確認"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  <Link href="/terms" passHref>
                    <Typography component="a" variant="body2" color="primary" sx={{ textDecoration: 'none' }}>
                      ご利用規約
                    </Typography>
                  </Link>
                  に同意します
                </Typography>
              }
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading || !agreeToTerms}
            >
              {loading ? <CircularProgress size={24} /> : 'アカウント登録'}
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" passHref>
                  <Typography variant="body2" component="a" sx={{ 
                    color: 'primary.main', 
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}>
                    既にアカウントをお持ちの方はこちら
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

export default SignupPage; 