import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import theme from '@/styles/theme';
import createEmotionCache from '@/utils/createEmotionCache';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';

// Client-side cache, shared for the whole session of the user in the browser
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp({ 
  Component, 
  pageProps, 
  emotionCache = clientSideEmotionCache 
}: MyAppProps) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
} 