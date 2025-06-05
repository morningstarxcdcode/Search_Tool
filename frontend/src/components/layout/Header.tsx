import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Container,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Leaderboard as LeaderboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  
  const menuItems = [
    { text: 'ダッシュボード', icon: <DashboardIcon />, href: '/dashboard' },
    { text: '商品検索', icon: <SearchIcon />, href: '/search' },
    { text: 'ランキング', icon: <LeaderboardIcon />, href: '/rankings' },
    { text: '設定', icon: <SettingsIcon />, href: '/settings' },
  ];
  
  const isActive = (href: string) => router.pathname === href;
  
  const renderMobileDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={handleDrawerToggle}
    >
      <Box sx={{ width: 250 }} role="presentation">
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image 
            src="/logo.png" 
            alt="Seller Navi Logo" 
            width={150} 
            height={50} 
            style={{ 
              objectFit: 'contain',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <Link key={item.text} href={item.href} passHref legacyBehavior>
              <ListItem 
                button 
                selected={isActive(item.href)}
                onClick={handleDrawerToggle}
                sx={{
                  bgcolor: isActive(item.href) ? 'rgba(0, 85, 255, 0.08)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(0, 85, 255, 0.12)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.href) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    color: isActive(item.href) ? 'primary.main' : 'inherit',
                    fontWeight: isActive(item.href) ? 600 : 400,
                  }}
                />
              </ListItem>
            </Link>
          ))}
        </List>
        
        {user && (
          <>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="ログアウト" />
              </ListItem>
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
  
  return (
    <>
      <AppBar 
        position="fixed" 
        color="default" 
        elevation={isScrolled ? 1 : 0} 
        sx={{ 
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.7)' : 'white',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease-in-out',
          zIndex: theme.zIndex.drawer + 1,
          borderBottom: isScrolled ? 'none' : `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Link href="/" passHref legacyBehavior>
                <Box component="a" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                  <Image 
                    src="/logo.png" 
                    alt="Seller Navi Logo" 
                    width={150} 
                    height={50} 
                    style={{ 
                      objectFit: 'contain',
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                </Box>
              </Link>
            </Box>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {menuItems.map((item) => (
                  <Link key={item.text} href={item.href} passHref legacyBehavior>
                    <Button
                      color={isActive(item.href) ? 'primary' : 'inherit'}
                      sx={{ 
                        mx: 1,
                        fontWeight: isActive(item.href) ? 600 : 400,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 85, 255, 0.08)',
                        }
                      }}
                      startIcon={item.icon}
                    >
                      {item.text}
                    </Button>
                  </Link>
                ))}
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {user ? (
                <>
                  <Button
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                    startIcon={
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: 'primary.main',
                          fontSize: '0.875rem'
                        }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                    }
                    sx={{ textTransform: 'none' }}
                  >
                    {!isMobile && user.name}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                        mt: 1.5,
                        width: 220,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Link href="/profile" passHref legacyBehavior>
                      <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                          <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        プロフィール
                      </MenuItem>
                    </Link>
                    <Link href="/settings" passHref legacyBehavior>
                      <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                          <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        設定
                      </MenuItem>
                    </Link>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      ログアウト
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Link href="/login" passHref legacyBehavior>
                    <Button 
                      color="inherit" 
                      sx={{ mr: 1 }}
                    >
                      ログイン
                    </Button>
                  </Link>
                  <Link href="/signup" passHref legacyBehavior>
                    <Button 
                      variant="contained" 
                      color="primary"
                    >
                      会員登録
                    </Button>
                  </Link>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
      {renderMobileDrawer()}
    </>
  );
};

export default Header; 