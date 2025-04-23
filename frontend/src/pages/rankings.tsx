import React, { useState, useEffect, useRef } from 'react';
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
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  GetApp as GetAppIcon,
  TrendingUp as TrendingUpIcon,
  Sort as SortIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Mock ranking data
const mockRankings = [
  {
    id: '1',
    rank: 1,
    title: 'ワイヤレスイヤホン Bluetooth 5.2 ノイズキャンセリング機能付き 防水',
    category: '家電',
    price: 3200,
    soldCount: 145,
    revenue: 464000,
    competition: 12,
    trendChange: '+12%',
    isImport: true,
  },
  {
    id: '2',
    rank: 2,
    title: 'フェイシャルマスク 保湿 美容液 エッセンス 毛穴ケア 20枚入り 韓国コスメ',
    category: '美容',
    price: 1200,
    soldCount: 132,
    revenue: 158400,
    competition: 18,
    trendChange: '+22%',
    isImport: true,
  },
  {
    id: '3',
    rank: 3,
    title: 'スマートウォッチ 多機能 心拍数 血圧 歩数計 GPS 連携 防水 睡眠モニター',
    category: '家電',
    price: 4980,
    soldCount: 98,
    revenue: 488040,
    competition: 15,
    trendChange: '+8%',
    isImport: true,
  },
  {
    id: '4',
    rank: 4,
    title: 'ミニ加湿器 USB充電式 卓上 静音 LEDライト付き オフィス 寝室用',
    category: 'ホーム',
    price: 1980,
    soldCount: 87,
    revenue: 172260,
    competition: 9,
    trendChange: '+18%',
    isImport: true,
  },
  {
    id: '5',
    rank: 5,
    title: '折りたたみ傘 自動開閉 軽量 コンパクト 撥水 耐風 晴雨兼用 UV対策',
    category: '日用品',
    price: 1450,
    soldCount: 84,
    revenue: 121800,
    competition: 11,
    trendChange: '+15%',
    isImport: true,
  },
  {
    id: '6',
    rank: 6,
    title: 'ポータブル充電器 大容量 10000mAh USB-C 急速充電 薄型 軽量 2ポート',
    category: '家電',
    price: 2500,
    soldCount: 76,
    revenue: 190000,
    competition: 14,
    trendChange: '+5%',
    isImport: true,
  },
  {
    id: '7',
    rank: 7,
    title: 'LEDリングライト 自撮り用 10インチ 3色モード 10段階調光 三脚スタンド付き',
    category: '家電',
    price: 2680,
    soldCount: 68,
    revenue: 182240,
    competition: 8,
    trendChange: '+25%',
    isImport: true,
  },
  {
    id: '8',
    rank: 8,
    title: 'ヘアドライヤー 大風量 マイナスイオン 速乾 冷温風 折りたたみ 軽量',
    category: '美容',
    price: 3500,
    soldCount: 65,
    revenue: 227500,
    competition: 10,
    trendChange: '+7%',
    isImport: true,
  },
  {
    id: '9',
    rank: 9,
    title: 'ワイヤレス充電器 Qi対応 急速充電 スタンド型 iPhone Android対応',
    category: '家電',
    price: 2200,
    soldCount: 62,
    revenue: 136400,
    competition: 13,
    trendChange: '+10%',
    isImport: true,
  },
  {
    id: '10',
    rank: 10,
    title: 'スマホスタンド 卓上 角度調整可能 滑り止め アルミ製 折りたたみ式',
    category: 'スマホアクセサリー',
    price: 980,
    soldCount: 58,
    revenue: 56840,
    competition: 7,
    trendChange: '+14%',
    isImport: true,
  },
];

const RankingsPage = () => {
  const { user, loading, checkSubscription } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [category, setCategory] = useState('all');
  const [period, setPeriod] = useState('30days');
  const [sortBy, setSortBy] = useState('sold');
  const [isLoading, setIsLoading] = useState(false);
  const [rankings, setRankings] = useState<any[]>(mockRankings);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

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

  // Handle filter changes
  useEffect(() => {
    if (user) {
      fetchRankings();
    }
  }, [category, period, sortBy, user]);

  // Mock API call to fetch rankings
  const fetchRankings = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Apply filters
      let filteredRankings = [...mockRankings];
      
      if (category !== 'all') {
        filteredRankings = filteredRankings.filter(item => item.category === category);
      }
      
      // Apply sorting
      filteredRankings.sort((a, b) => {
        switch (sortBy) {
          case 'sold':
            return b.soldCount - a.soldCount;
          case 'revenue':
            return b.revenue - a.revenue;
          case 'price_high':
            return b.price - a.price;
          case 'price_low':
            return a.price - b.price;
          default:
            return a.rank - b.rank;
        }
      });
      
      // Update rankings with new rank numbers
      const updatedRankings = filteredRankings.map((item, index) => ({
        ...item,
        rank: index + 1
      }));
      
      setRankings(updatedRankings);
      setIsLoading(false);
    }, 800);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Download rankings as CSV (mock function)
  const handleDownloadCSV = () => {
    alert('CSVダウンロード機能は実装予定です。');
  };

  // Handle scroll event for blur effect
  const handleScroll = () => {
    if (tableContainerRef.current) {
      const scrollTop = tableContainerRef.current.scrollTop;
      setIsScrolled(scrollTop > 10);
    }
  };

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
        <title>売れ筋ランキング | Seller Navi</title>
      </Head>
      
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            売れ筋ランキング
          </Typography>
          <Typography variant="body1" color="text.secondary">
            各カテゴリーの売れ筋商品ランキングを確認できます。
          </Typography>
        </Box>
        
        {/* Filters Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="カテゴリー"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">すべて</MenuItem>
                  <MenuItem value="家電">家電</MenuItem>
                  <MenuItem value="美容">美容</MenuItem>
                  <MenuItem value="ホーム">ホーム</MenuItem>
                  <MenuItem value="日用品">日用品</MenuItem>
                  <MenuItem value="スマホアクセサリー">スマホアクセサリー</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={3}>
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
              
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="並び替え"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <SortIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                >
                  <MenuItem value="sold">売上数（多い順）</MenuItem>
                  <MenuItem value="revenue">売上金額（多い順）</MenuItem>
                  <MenuItem value="price_high">価格（高い順）</MenuItem>
                  <MenuItem value="price_low">価格（安い順）</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<GetAppIcon />}
                  onClick={handleDownloadCSV}
                  sx={{ height: '40px' }}
                >
                  CSVダウンロード
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Tabs for different period views */}
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: 100,
                fontWeight: 600,
              },
            }}
          >
            <Tab label="今日のランキング" />
            <Tab label="週間ランキング" />
            <Tab label="月間ランキング" />
          </Tabs>
        </Box>
        
        {/* Rankings Table */}
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    boxShadow: 'none',
                    maxHeight: '70vh',
                    overflow: 'auto',
                    position: 'relative'
                  }}
                  ref={tableContainerRef}
                  onScroll={handleScroll}
                >
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead 
                      sx={{ 
                        backgroundColor: isScrolled ? 'rgba(245, 245, 245, 0.8)' : '#f5f5f5',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        backdropFilter: isScrolled ? 'blur(8px)' : 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: isScrolled ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          bottom: 0,
                          width: '100%',
                          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        }
                      }}
                    >
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '60px', whiteSpace: 'nowrap', padding: '12px 16px' }}>順位</TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', padding: '12px 16px' }}>商品名</TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', padding: '12px 16px' }}>カテゴリー</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap', padding: '12px 16px' }}>価格</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap', padding: '12px 16px', minWidth: '100px' }}>
                          売上数
                          <IconButton size="small" onClick={() => setSortBy('sold')} sx={{ ml: 0.5 }}>
                            {sortBy === 'sold' ? (
                              <KeyboardArrowDownIcon fontSize="small" color="primary" />
                            ) : (
                              <KeyboardArrowUpIcon fontSize="small" />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap', padding: '12px 16px', minWidth: '120px' }}>
                          売上金額
                          <IconButton size="small" onClick={() => setSortBy('revenue')} sx={{ ml: 0.5 }}>
                            {sortBy === 'revenue' ? (
                              <KeyboardArrowDownIcon fontSize="small" color="primary" />
                            ) : (
                              <KeyboardArrowUpIcon fontSize="small" />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap', padding: '12px 16px' }}>競合数</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap', padding: '12px 16px' }}>トレンド</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rankings.map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                            backgroundColor: row.rank <= 3 ? 'rgba(255, 204, 0, 0.05)' : 'inherit',
                          }}
                        >
                          <TableCell sx={{ padding: '12px 16px' }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              color: row.rank <= 3 ? 'white' : 'text.primary',
                              bgcolor: row.rank === 1 ? 'gold' : 
                                row.rank === 2 ? 'silver' :
                                row.rank === 3 ? '#cd7f32' : 'transparent',
                              fontWeight: 'bold',
                            }}>
                              {row.rank}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ padding: '12px 16px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight={row.rank <= 3 ? 600 : 400}>
                                {row.title}
                              </Typography>
                              {row.isImport && (
                                <Chip
                                  label="輸入"
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                  sx={{ ml: 1, height: 20, fontSize: '0.625rem' }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ padding: '12px 16px' }}>
                            <Chip
                              label={row.category}
                              size="small"
                              sx={{
                                backgroundColor:
                                  row.category === '家電' ? 'rgba(33, 150, 243, 0.1)' :
                                  row.category === '美容' ? 'rgba(233, 30, 99, 0.1)' :
                                  row.category === 'ホーム' ? 'rgba(76, 175, 80, 0.1)' :
                                  row.category === '日用品' ? 'rgba(255, 152, 0, 0.1)' :
                                  'rgba(156, 39, 176, 0.1)',
                                color:
                                  row.category === '家電' ? 'info.main' :
                                  row.category === '美容' ? 'error.main' :
                                  row.category === 'ホーム' ? 'success.main' :
                                  row.category === '日用品' ? 'warning.main' :
                                  'secondary.main',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ padding: '12px 16px' }}>¥{row.price.toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ padding: '12px 16px', fontWeight: 600 }}>{row.soldCount}</TableCell>
                          <TableCell align="right" sx={{ padding: '12px 16px' }}>¥{row.revenue.toLocaleString()}</TableCell>
                          <TableCell align="center" sx={{ padding: '12px 16px' }}>{row.competition}</TableCell>
                          <TableCell align="center" sx={{ padding: '12px 16px' }}>
                            <Chip
                              label={row.trendChange}
                              size="small"
                              color="success"
                              sx={{ height: 24, fontSize: '0.75rem' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                週間ランキングは準備中です
              </Typography>
              <Typography variant="body2" color="text.secondary">
                もうしばらくお待ちください。
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                月間ランキングは準備中です
              </Typography>
              <Typography variant="body2" color="text.secondary">
                もうしばらくお待ちください。
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Insights Card */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">市場インサイト</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  トップカテゴリー
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  現在最も売れているカテゴリーは「家電」です。特にワイヤレスイヤホンとスマートウォッチが人気です。
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  価格帯分析
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  売れている商品の平均価格は¥2,350です。¥1,000〜¥3,000の価格帯の商品が最も人気があります。
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  競合状況
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  トップ10商品の平均競合数は10.7です。新規参入にはすき間市場を狙うことをおすすめします。
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default RankingsPage; 