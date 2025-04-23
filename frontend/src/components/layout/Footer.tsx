import React from 'react';
import { Box, Container, Typography, Grid, Link as MuiLink, Divider } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Seller Navi',
      links: [
        { text: 'ホーム', href: '/' },
        { text: '料金プラン', href: '/pricing' },
        { text: 'よくある質問', href: '/faq' },
        { text: 'お問い合わせ', href: '/contact' },
      ],
    },
    {
      title: 'リソース',
      links: [
        { text: 'ブログ', href: '/blog' },
        { text: 'チュートリアル', href: '/tutorials' },
        { text: 'マニュアル', href: '/manual' },
      ],
    },
    {
      title: '会社情報',
      links: [
        { text: '運営会社', href: '/company' },
        { text: '利用規約', href: '/terms' },
        { text: 'プライバシーポリシー', href: '/privacy' },
        { text: '特定商取引法に基づく表記', href: '/legal' },
      ],
    },
  ];

  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', pt: 6, pb: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ mb: 3 }}>
              <Link href="/" passHref legacyBehavior>
                <Box component="a" sx={{ display: 'inline-block' }}>
                  <Image
                    src="/logo.png"
                    alt="Seller Navi Logo"
                    width={150}
                    height={50}
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </Link>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              物販の商品リサーチを効率化し、売れ筋商品を素早く見つけるためのツールです。
            </Typography>
          </Grid>
          
          {footerLinks.map((section) => (
            <Grid item xs={6} sm={4} md={2} key={section.title}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight={600}>
                {section.title}
              </Typography>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {section.links.map((link) => (
                  <Box component="li" key={link.text} sx={{ mb: 1 }}>
                    <Link href={link.href} passHref legacyBehavior>
                      <MuiLink
                        underline="hover"
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.875rem',
                          '&:hover': { color: 'primary.main' } 
                        }}
                      >
                        {link.text}
                      </MuiLink>
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight={600}>
              お問い合わせ
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              ご質問やご不明点がございましたら、お気軽にお問い合わせください。
            </Typography>
            <MuiLink
              href="mailto:support@sellernavi.com"
              color="primary"
              sx={{ fontWeight: 500 }}
            >
              support@sellernavi.com
            </MuiLink>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Seller Navi All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 