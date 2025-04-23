import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Paper,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Favorite as FavoriteIcon,
  Summarize as SummarizeIcon,
  TrendingUp as TrendingUpIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const { user, loading, checkSubscription } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [hasSubscription, setHasSubscription] = useState(false);
  
  // Mock data for user profile
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    joinDate: '',
    plan: '',
    searches: 0,
    reports: 0,
    watchlist: 0,
  });
  
  // Mock data for activity history
  const recentSearches = [
    { id: 1, term: 'ワイヤレスイヤホン', date: '2025-04-18', results: 42 },
    { id: 2, term: 'スマートウォッチ', date: '2025-04-16', results: 36 },
    { id: 3, term: 'ポータブル充電器', date: '2025-04-15', results: 28 },
    { id: 4, term: '加湿器 ミニ', date: '2025-04-12', results: 15 },
    { id: 5, term: 'Bluetooth スピーカー', date: '2025-04-10', results: 33 },
  ];
  
  const recentReports = [
    { id: 1, title: '市場トレンドレポート: 家電カテゴリ', date: '2025-04-17', type: 'トレンド分析' },
    { id: 2, title: '競合分析: ワイヤレスイヤホン', date: '2025-04-15', type: '競合分析' },
    { id: 3, title: '商品パフォーマンスレポート', date: '2025-04-12', type: 'パフォーマンス' },
  ];
  
  const watchlistItems = [
    { id: 1, name: 'ワイヤレスイヤホン Bluetooth 5.2', price: '¥3,200', trend: '+12%' },
    { id: 2, name: 'スマートウォッチ 多機能 防水', price: '¥4,980', trend: '+8%' },
    { id: 3, name: 'ポータブル充電器 大容量 10000mAh', price: '¥2,500', trend: '+5%' },
    { id: 4, name: 'フェイシャルマスク 保湿 美容液', price: '¥1,200', trend: '+22%' },
  ];

  // Check if user is logged in and has active subscription
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else {
          const isSubscribed = await checkSubscription();
          setHasSubscription(isSubscribed);

          if (!isSubscribed) {
            router.push('/subscription');
          } else {
            // Set mock user data
            setUserData({
              name: user.name || '山田 太郎',
              email: user.email || 'yamada@example.com',
              companyName: user.companyName || 'Yamada Trading Co.',
              phoneNumber: user.phoneNumber || '03-1234-5678',
              joinDate: '2025-01-15',
              plan: 'プレミアム',
              searches: 127,
              reports: 14,
              watchlist: 8,
            });
          }
        }
      }
    };

    checkAuth();
  }, [loading, user, router, checkSubscription]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Navigate to settings page
  const goToSettings = () => {
    router.push('/settings');
  };

  // Loading state
  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>プロフィール | Seller Navi</title>
      </Head>
      
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            プロフィール
          </Typography>
          <Typography variant="body1" color="text.secondary">
            アカウント情報と利用履歴を確認できます。
          </Typography>
        </Box>
        
        {/* Profile Overview Card */}
        <Paper sx={{ mb: 4, overflow: 'hidden' }}>
          <Box sx={{ 
            p: { xs: 3, md: 4 }, 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 4,
          }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'primary.main', 
                fontSize: '3rem',
                border: '4px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {userData.name?.charAt(0)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {userData.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {userData.email}
                  </Typography>
                  <Chip 
                    label={userData.plan} 
                    color="primary" 
                    size="small" 
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={goToSettings}
                >
                  編集
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      会社名
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {userData.companyName}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      電話番号
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {userData.phoneNumber}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      登録日
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {userData.joinDate}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      利用状況
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color="success.main">
                      アクティブ
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    {userData.searches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    検索
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    {userData.reports}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    レポート
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    {userData.watchlist}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ウォッチリスト
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Activity Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile activity tabs"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: 120,
                py: 2,
              }
            }}
          >
            <Tab icon={<SearchIcon />} label="検索履歴" iconPosition="start" />
            <Tab icon={<SummarizeIcon />} label="レポート" iconPosition="start" />
            <Tab icon={<FavoriteIcon />} label="ウォッチリスト" iconPosition="start" />
          </Tabs>
          
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                最近の検索
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                最近行った検索履歴を表示しています。
              </Typography>
              
              <List>
                {recentSearches.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem 
                      secondaryAction={
                        <IconButton edge="end">
                          <KeyboardArrowRightIcon />
                        </IconButton>
                      }
                      sx={{ 
                        py: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.03)'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <SearchIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.term} 
                        secondary={`${item.date} | ${item.results}件の結果`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => router.push('/search')}
                >
                  検索履歴をすべて表示
                </Button>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                レポート一覧
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                作成したレポートや分析の一覧です。
              </Typography>
              
              <List>
                {recentReports.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem 
                      secondaryAction={
                        <IconButton edge="end">
                          <KeyboardArrowRightIcon />
                        </IconButton>
                      }
                      sx={{ 
                        py: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.03)'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <SummarizeIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.title} 
                        secondary={`${item.date} | ${item.type}`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                >
                  レポート一覧を表示
                </Button>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                ウォッチリスト
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                追跡している商品の一覧です。
              </Typography>
              
              <Grid container spacing={2}>
                {watchlistItems.map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.id}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box 
                          sx={{ 
                            height: 120, 
                            bgcolor: 'grey.100', 
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">商品画像</Typography>
                        </Box>
                        <Typography variant="subtitle2" gutterBottom noWrap title={item.name}>
                          {item.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body1" fontWeight={600} color="primary.main">
                            {item.price}
                          </Typography>
                          <Chip 
                            icon={<TrendingUpIcon fontSize="small" />}
                            label={item.trend}
                            color="success"
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                >
                  ウォッチリストをすべて表示
                </Button>
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ProfilePage; 