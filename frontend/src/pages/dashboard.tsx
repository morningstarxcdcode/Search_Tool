import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Paper,
  Chip,
  CircularProgress,
  useTheme,
  Tab,
  Tabs,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Badge,
  Fade,
  Zoom,
  IconButton,
  alpha,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  ShoppingBag as ShoppingBagIcon,
  People as PeopleIcon,
  SmartToy as SmartToyIcon,
  Lock as LockIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  price: string;
  sold: number;
  competition: number;
  image_url: string;
  description: string;
  brand: string;
  condition: string;
  category: string;
  seller_name: string;
  lastSoldDate: string;
}

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
  const { user, loading, checkSubscription, canUseAIAssistant } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [period, setPeriod] = useState('30days');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [userPlan, setUserPlan] = useState('');
  const [canUseAI, setCanUseAI] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    'おすすめの中国輸入商品は？',
    '利益率の高い中国商品のキーワードは？',
    '中国製品を見分けるコツを教えて',
    '最近流行っている中国輸入商品のカテゴリーは？'
  ]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  const fetchTrendingProducts = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}api/v1/products`);
      setTrendingProducts(response.data);
    } catch (error) {
      console.error('Error fetching trending products:', error);
      setTrendingProducts([]);
    }
  };

  // Fetch trending products on component mount
  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  // Check if user is logged in and has active subscription
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } 
        else {
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

  // Check if user can use AI assistant
  useEffect(() => {
    const checkAIPermission = async () => {
      if (user) {
        const plan = await checkSubscription();
        setUserPlan(typeof plan === 'string' ? plan : '');
        
        const canUseAI = await canUseAIAssistant();
        setCanUseAI(canUseAI);
      }
    };
    
    checkAIPermission();
  }, [user, canUseAIAssistant, checkSubscription]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle AI assistant toggle
  const handleAIAssistantToggle = () => {
    if (!canUseAI) {
      router.push('/subscription');
      return;
    }
    
    setShowAIAssistant(prev => !prev);
  };

  // Add this function to handle AI query submission
  const handleAiQuerySubmit = () => {
    if (!aiQuery.trim()) return;
    
    setIsAiProcessing(true);
    
    // In a real app, this would be an API call to an AI service
    // For demo purposes, we'll simulate a response after a delay
    setTimeout(() => {
      let response = '';
      
      if (aiQuery.includes('おすすめ') || aiQuery.includes('人気')) {
        response = `現在人気の中国輸入商品カテゴリーは以下の通りです：

1. ワイヤレスイヤホン（特に5.2以上のBluetooth規格対応製品）
2. モバイルバッテリー（20000mAh以上の大容量タイプ）
3. LEDライト関連商品（自撮り用リングライトなど）
4. 収納グッズ（特に多機能・省スペースタイプ）
5. ミニ家電（卓上加湿器、ポータブル扇風機など）

これらの商品は「輸入」「インポート」だけでなく「高品質」「多機能」などのキーワードと組み合わせると効率的に検索できます。`;
      } else if (aiQuery.includes('キーワード') || aiQuery.includes('検索')) {
        response = `中国輸入商品を効果的に検索するには、以下のキーワードを組み合わせると良いでしょう：

基本キーワード：
「輸入」「インポート」「海外」「中国」

補助キーワード（カテゴリー別）：
- 家電：「多機能」「USB充電」「ポータブル」「折りたたみ」
- アクセサリー：「韓国風」「トレンド」「おしゃれ」
- 収納：「省スペース」「多用途」「便利グッズ」

これらを組み合わせることで、より精度高く中国輸入品を特定できます。`;
      } else if (aiQuery.includes('見分け')) {
        response = `中国製品を見分けるポイント：

1. 商品説明に「海外製品」「輸入品」「インポート」などの記載がある
2. 商品名に英語と日本語が混在している
3. 商品説明文に翻訳調の日本語がある
4. 同じ商品画像で複数の出品者が販売している
5. 価格が市場相場より明らかに安い
6. 複数の機能を一つの製品に詰め込んでいる
7. ブランド名が英語の造語や略語になっている

これらの特徴が複数当てはまる場合は、中国からの輸入品である可能性が高いです。`;
      } else {
        response = `ご質問ありがとうございます。中国輸入商品に関しては、以下のような傾向があります：

- 季節の変わり目に新商品が増加する傾向
- 日本での流行から2-3ヶ月遅れで類似商品が登場することが多い
- 「送料無料」「期間限定」などのキーワードと組み合わせて検索すると良い結果が得られます
- 商品説明に「インポート」と明記されていなくても、出品者名や価格帯から中国輸入品と判断できる場合があります

特定のカテゴリーやキーワードについて詳しく知りたい場合は、もう少し具体的にお尋ねください。`;
      }
      
      setAiResponse(response);
      setIsAiProcessing(false);
    }, 2000);
  };

  // Mock data for summary cards
  const summaryData = [
    {
      title: '注目のトレンド商品',
      value: '53',
      icon: <TrendingUpIcon sx={{ fontSize: 36, color: '#2196F3' }} />,
      color: '#2196F3',
    },
    {
      title: '昨日の検索数',
      value: '24',
      icon: <SearchIcon sx={{ fontSize: 36, color: '#9C27B0' }} />,
      color: '#9C27B0',
    },
    {
      title: '中国輸入商品数',
      value: '1,230',
      icon: <ShoppingBagIcon sx={{ fontSize: 36, color: '#4CAF50' }} />,
      color: '#4CAF50',
    },
    {
      title: '競合セラー数',
      value: '147',
      icon: <PeopleIcon sx={{ fontSize: 36, color: '#03A9F4' }} />,
      color: '#03A9F4',
    },
  ];

  // Add handleDescriptionClick function
  const handleDescriptionClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDescriptionModal(true);
  };

  // Add handleCloseModal function
  const handleCloseModal = () => {
    setShowDescriptionModal(false);
    setSelectedProduct(null);
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
        <title>ダッシュボード | Seller Navi</title>
      </Head>
      <Box sx={{ 
        background: 'linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)',
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Fade in timeout={800}>
            <Box>
              <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom 
                  fontWeight={700}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ダッシュボード
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
                >
                  物販リサーチのデータ分析と市場トレンドを確認できます。
                  最新の市場動向を把握し、最適な商品選定にお役立てください。
                </Typography>
              </Box>

              {/* Summary Cards */}
              <Zoom in timeout={1000}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {summaryData.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box 
                              sx={{ 
                                mr: 2,
                                p: 1,
                                borderRadius: 2,
                                backgroundColor: alpha(item.color, 0.1),
                              }}
                            >
                              {item.icon}
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {item.title}
                              </Typography>
                              <Typography 
                                variant="h5" 
                                component="div" 
                                fontWeight={600} 
                                sx={{ 
                                  color: item.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                {item.value}
                                <ArrowUpwardIcon 
                                  sx={{ 
                                    fontSize: 16,
                                    color: '#4CAF50',
                                    animation: 'pulse 2s infinite',
                                    '@keyframes pulse': {
                                      '0%': { opacity: 1 },
                                      '50%': { opacity: 0.5 },
                                      '100%': { opacity: 1 },
                                    },
                                  }} 
                                />
                              </Typography>
                            </Box>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={70} 
                            sx={{ 
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: alpha(item.color, 0.1),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: item.color,
                              },
                            }} 
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Zoom>

              {/* Quick Search */}
              {/* <Fade in timeout={1200}>
                <Card 
                  sx={{ 
                    mb: 4,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <FilterListIcon sx={{ mr: 1, color: '#2196F3' }} />
                      <Typography variant="h6" fontWeight={600}>
                        クイック検索
                      </Typography>
                    </Box>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          placeholder="キーワードを入力"
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                            }
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                            }
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                            }
                          }}
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
                          sx={{ 
                            py: 1,
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                            '&:hover': {
                              boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)',
                            }
                          }}
                        >
                          検索
                        </Button>
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Tooltip title={canUseAI ? 'AIアシスタントを使用' : 'プレミアムプラン限定機能'}>
                        <span>
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={canUseAI ? <SmartToyIcon /> : <LockIcon />}
                            onClick={handleAIAssistantToggle}
                            sx={{ 
                              ml: 1,
                              borderRadius: 2,
                              textTransform: 'none',
                            }}
                            disabled={!canUseAI}
                          >
                            AIアシスタント
                          </Button>
                        </span>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Fade> */}

              {/* AI Assistant Panel */}
              {showAIAssistant && (
                <Fade in timeout={500}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      mt: 3, 
                      borderRadius: 2,
                      borderLeft: '4px solid', 
                      borderColor: '#9C27B0',
                      backgroundColor: 'rgba(156, 39, 176, 0.05)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SmartToyIcon sx={{ mr: 1, color: '#9C27B0' }} />
                      <Typography variant="h6">中国輸入品AI検索アシスタント</Typography>
                      <Chip 
                        label="プレミアム機能" 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                        sx={{ ml: 2, borderRadius: 1 }} 
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => setShowAIAssistant(false)}
                        sx={{ ml: 'auto' }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      AIが中国輸入品のリサーチをサポートします。キーワード提案、商品特徴の分析、見分け方のアドバイスなど、データに基づいた提案を受け取れます。
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        おすすめ質問:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {aiSuggestions.map((suggestion, index) => (
                          <Chip 
                            key={index}
                            label={suggestion}
                            onClick={() => setAiQuery(suggestion)}
                            color="secondary"
                            variant="outlined"
                            sx={{ 
                              cursor: 'pointer',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <TextField
                        fullWidth
                        label="AIに質問する（例：「中国輸入品の見分け方は？」）"
                        variant="outlined"
                        size="small"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        disabled={isAiProcessing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                          }
                        }}
                      />
                      <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={handleAiQuerySubmit}
                        disabled={!aiQuery.trim() || isAiProcessing}
                        sx={{ 
                          ml: 1, 
                          whiteSpace: 'nowrap',
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(156, 39, 176, 0.2)',
                          '&:hover': {
                            boxShadow: '0 6px 16px rgba(156, 39, 176, 0.3)',
                          }
                        }}
                      >
                        {isAiProcessing ? '処理中...' : '質問する'}
                      </Button>
                    </Box>
                    
                    {isAiProcessing && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <CircularProgress color="secondary" size={30} />
                      </Box>
                    )}
                    
                    {aiResponse && !isAiProcessing && (
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          backgroundColor: 'white',
                          borderRadius: 2,
                          whiteSpace: 'pre-line',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Typography variant="body2">{aiResponse}</Typography>
                      </Paper>
                    )}
                  </Paper>
                </Fade>
              )}

              {/* Tabs for different data views */}
              <Box sx={{ mb: 4 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                      borderRadius: 2,
                      mx: 0.5,
                      minWidth: 120,
                      textTransform: 'none',
                      fontWeight: 600,
                    },
                  }}
                >
                  <Tab 
                    label="トレンド分析" 
                    icon={<TrendingUpIcon />} 
                    iconPosition="start" 
                  />
                  <Tab 
                    label="売れ筋商品" 
                    icon={<ShoppingBagIcon />} 
                    iconPosition="start" 
                  />
                  <Tab 
                    label="競合分析" 
                    icon={<PeopleIcon />} 
                    iconPosition="start" 
                  />
                </Tabs>
                
                {/* Trend Analysis */}
                <TabPanel value={tabValue} index={0}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      市場トレンド分析
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      過去30日間のトレンド変化と市場の動向を分析しています。急上昇キーワードや注目カテゴリをチェックして、新たな商品機会を発見しましょう。
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Paper 
                        sx={{ 
                          p: 3,
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                          急上昇キーワード
                        </Typography>
                        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography color="text.secondary">
                            トレンドデータを表示（開発中）
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </TabPanel>
                
                {/* Best Selling Products */}
                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      売れ筋商品ランキング
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      現在最も売れている商品とそのパフォーマンスデータです。売上個数と売上金額の両面から分析できます。
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Paper 
                        elevation={0} 
                        variant="outlined" 
                        sx={{ 
                          p: 0,
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            商品一覧
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              startIcon={<RefreshIcon />}
                              size="small"
                              onClick={() => fetchTrendingProducts()}
                              sx={{ borderRadius: 2 }}
                            >
                              更新
                            </Button>
                            <Button
                              startIcon={<DownloadIcon />}
                              size="small"
                              sx={{ borderRadius: 2 }}
                            >
                              CSV
                            </Button>
                          </Box>
                        </Box>
                        <Box sx={{ overflowX: 'auto' }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'background.paper' }}>
                                <TableCell sx={{ fontWeight: 600 }}>順位</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>商品画像</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>商品名</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>価格</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>競合数</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {trendingProducts.map((product, index) => {
                                const price = product.price;
                                
                                return (
                                  <TableRow 
                                    key={product.id} 
                                    onClick={() => handleDescriptionClick(product)}
                                    sx={{
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: 'rgba(33, 150, 243, 0.04)',
                                        transition: 'background-color 0.2s ease',
                                      },
                                    }}
                                  >
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                          {index + 1}
                                        </Typography>
                                        {index < 3 && (
                                          <StarIcon 
                                            sx={{ 
                                              color: index === 0 ? '#FFD700' : 
                                                     index === 1 ? '#C0C0C0' : 
                                                     '#CD7F32',
                                              fontSize: 16,
                                            }} 
                                          />
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box 
                                        sx={{ 
                                          position: 'relative', 
                                          width: 60, 
                                          height: 60,
                                          borderRadius: 1,
                                          overflow: 'hidden',
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        }}
                                      >
                                        <Image
                                          src={product.image_url}
                                          alt={product.name}
                                          fill
                                          style={{ objectFit: 'cover' }}
                                        />
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight={500}>
                                        {product.name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography 
                                        variant="body2" 
                                        fontWeight={600}
                                        sx={{
                                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                          backgroundClip: 'text',
                                          textFillColor: 'transparent',
                                          WebkitBackgroundClip: 'text',
                                          WebkitTextFillColor: 'transparent',
                                        }}
                                      >
                                        ¥{price.toLocaleString()}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2" color="text.secondary">
                                        {product.competition}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </TabPanel>
                
                {/* Competitor Analysis */}
                <TabPanel value={tabValue} index={2}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      競合セラー分析
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      主要競合のセラー情報と販売パフォーマンスの詳細分析です。競合の強みと弱みを理解し、自社の戦略立案に活用できます。
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Paper 
                        sx={{ 
                          p: 3,
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                          主要競合セラー
                        </Typography>
                        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography color="text.secondary">
                            競合分析データを表示（開発中）
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Add Description Modal */}
      <Dialog
        open={showDescriptionModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        {selectedProduct && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" fontWeight={600}>
                  {selectedProduct.name}
                </Typography>
                <IconButton onClick={handleCloseModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box 
                    sx={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: 400,
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Image
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      商品説明
                    </Typography>
                    <Typography variant="body1" paragraph color="text.secondary">
                      {selectedProduct.description}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      商品詳細
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          ブランド
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedProduct.brand}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          状態
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedProduct.condition}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          カテゴリ
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedProduct.category}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          価格
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight={600}
                          sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          ¥{selectedProduct.price.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};

export default Dashboard; 