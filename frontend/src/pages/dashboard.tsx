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
  Divider,
  TextField,
  MenuItem,
  Paper,
  Chip,
  CircularProgress,
  useTheme,
  Tab,
  Tabs,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  ShoppingBag as ShoppingBagIcon,
  People as PeopleIcon,
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user, loading, checkSubscription } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [period, setPeriod] = useState('30days');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

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

  // Mock data for summary cards
  const summaryData = [
    {
      title: '注目のトレンド商品',
      value: '53',
      icon: <TrendingUpIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: '昨日の検索数',
      value: '24',
      icon: <SearchIcon sx={{ fontSize: 36, color: 'secondary.main' }} />,
      color: 'secondary.main',
    },
    {
      title: '中国輸入商品数',
      value: '1,230',
      icon: <ShoppingBagIcon sx={{ fontSize: 36, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: '競合セラー数',
      value: '147',
      icon: <PeopleIcon sx={{ fontSize: 36, color: 'info.main' }} />,
      color: 'info.main',
    },
  ];

  // Trending products mock data
  const trendingProducts = [
    {
      id: 1,
      name: 'ワイヤレスイヤホン Bluetooth 5.2',
      category: '家電',
      price: '¥3,200',
      sold: 45,
      competition: 8,
      trend: '+12%',
    },
    {
      id: 2,
      name: 'スマートウォッチ 多機能 防水',
      category: '家電',
      price: '¥4,980',
      sold: 38,
      competition: 12,
      trend: '+8%',
    },
    {
      id: 3,
      name: 'フェイシャルマスク 保湿 美容液',
      category: '美容',
      price: '¥1,200',
      sold: 72,
      competition: 15,
      trend: '+22%',
    },
    {
      id: 4,
      name: 'ポータブル充電器 大容量 10000mAh',
      category: '家電',
      price: '¥2,500',
      sold: 29,
      competition: 10,
      trend: '+5%',
    },
    {
      id: 5,
      name: 'ミニ加湿器 USB充電式 静音',
      category: 'ホーム',
      price: '¥1,980',
      sold: 53,
      competition: 7,
      trend: '+18%',
    },
  ];

  // If loading, show loading state
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
        <title>ダッシュボード | Seller Navi</title>
      </Head>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            ダッシュボード
          </Typography>
          <Typography variant="body1" color="text.secondary">
            物販リサーチのデータ分析と市場トレンドを確認できます。
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {summaryData.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Box sx={{ mr: 2 }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.title}
                    </Typography>
                    <Typography variant="h5" component="div" fontWeight={600} sx={{ color: item.color }}>
                      {item.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Search */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              クイック検索
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="キーワードを入力"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="カテゴリー"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">すべて</MenuItem>
                  <MenuItem value="fashion">ファッション</MenuItem>
                  <MenuItem value="electronics">家電</MenuItem>
                  <MenuItem value="home">ホーム</MenuItem>
                  <MenuItem value="beauty">美容</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="期間"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  size="small"
                >
                  <MenuItem value="30days">過去30日</MenuItem>
                  <MenuItem value="60days">過去60日</MenuItem>
                  <MenuItem value="90days">過去90日</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={() => setIsSearching(true)}
                  sx={{ py: 1 }}
                >
                  検索
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: 120,
                fontWeight: 600,
              },
            }}
          >
            <Tab label="トレンド分析" />
            <Tab label="売れ筋商品" />
            <Tab label="競合分析" />
          </Tabs>
        </Box>

        {/* Trend Analysis Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">市場トレンド</Typography>
                    <TextField
                      select
                      size="small"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      sx={{ minWidth: 150 }}
                    >
                      <MenuItem value="30days">過去30日</MenuItem>
                      <MenuItem value="60days">過去60日</MenuItem>
                      <MenuItem value="90days">過去90日</MenuItem>
                    </TextField>
                  </Box>
                  <Box sx={{ height: 300, position: 'relative' }}>
                    {/* Chart would go here in a real implementation */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center' 
                      }}
                    >
                      グラフデータを読み込み中...
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    カテゴリー別売上
                  </Typography>
                  <Box sx={{ height: 300, position: 'relative' }}>
                    {/* Chart would go here in a real implementation */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center' 
                      }}
                    >
                      グラフデータを読み込み中...
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Trending Products Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                注目の売れ筋商品
              </Typography>
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.palette.grey[100] }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>商品名</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>カテゴリー</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>価格</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>販売数</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>競合数</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>トレンド</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendingProducts.map((product) => (
                        <tr key={product.id} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <td style={{ padding: '12px 16px' }}>{product.name}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <Chip 
                              label={product.category} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 
                                  product.category === '家電' ? 'rgba(33, 150, 243, 0.1)' :
                                  product.category === '美容' ? 'rgba(233, 30, 99, 0.1)' :
                                  product.category === 'ホーム' ? 'rgba(76, 175, 80, 0.1)' :
                                  'rgba(156, 39, 176, 0.1)',
                                color: 
                                  product.category === '家電' ? 'info.main' :
                                  product.category === '美容' ? 'error.main' :
                                  product.category === 'ホーム' ? 'success.main' :
                                  'secondary.main',
                              }} 
                            />
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>{product.price}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>{product.sold}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>{product.competition}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: theme.palette.success.main, fontWeight: 600 }}>
                            {product.trend}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Paper>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="outlined" color="primary">
                  すべての商品を表示
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Competitor Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                競合分析
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                競合セラーの分析データを表示します。こちらの機能は現在開発中です。
              </Typography>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" gutterBottom color="text.secondary">
                  近日公開予定
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  新機能のリリースをお待ちください。
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Container>
    </>
  );
};

export default Dashboard; 