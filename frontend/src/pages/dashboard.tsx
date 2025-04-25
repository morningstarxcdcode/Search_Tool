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
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  ShoppingBag as ShoppingBagIcon,
  People as PeopleIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  SmartToy as SmartToyIcon,
  Lock as LockIcon,
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
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    'おすすめの中国輸入商品は？',
    '利益率の高い中国商品のキーワードは？',
    '中国製品を見分けるコツを教えて',
    '最近流行っている中国輸入商品のカテゴリーは？'
  ]);

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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Tooltip title={canUseAI ? 'AIアシスタントを使用' : 'プレミアムプラン限定機能'}>
                <span>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={canUseAI ? <SmartToyIcon /> : <LockIcon />}
                    onClick={handleAIAssistantToggle}
                    sx={{ ml: 1 }}
                    disabled={!canUseAI}
                  >
                    AIアシスタント
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>

        {/* AI Assistant Panel */}
        {showAIAssistant && (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mt: 3, 
              borderLeft: '4px solid', 
              borderColor: 'secondary.main',
              backgroundColor: 'rgba(156, 39, 176, 0.05)' 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SmartToyIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">中国輸入品AI検索アシスタント</Typography>
              <Chip 
                label="プレミアム機能" 
                size="small" 
                color="secondary" 
                variant="outlined" 
                sx={{ ml: 2 }} 
              />
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
                    sx={{ cursor: 'pointer' }}
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
              />
              <Button 
                variant="contained" 
                color="secondary"
                onClick={handleAiQuerySubmit}
                disabled={!aiQuery.trim() || isAiProcessing}
                sx={{ ml: 1, whiteSpace: 'nowrap' }}
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
                  borderRadius: 1,
                  whiteSpace: 'pre-line'
                }}
              >
                <Typography variant="body2">{aiResponse}</Typography>
              </Paper>
            )}
          </Paper>
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
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="トレンド分析" icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label="売れ筋商品" icon={<ShoppingBagIcon />} iconPosition="start" />
            <Tab label="競合分析" icon={<PeopleIcon />} iconPosition="start" />
          </Tabs>
          
          {/* Trend Analysis */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                市場トレンド分析
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                過去30日間のトレンド変化と市場の動向を分析しています。急上昇キーワードや注目カテゴリをチェックして、新たな商品機会を発見しましょう。
              </Typography>
            </Box>
            
            {/* Trend analysis content */}
            <Grid container spacing={3}>
              {/* Trend charts and other analytics would go here */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    急上昇キーワード
                  </Typography>
                  {/* Sample data visualization */}
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
              <Typography variant="h6" gutterBottom>
                売れ筋商品ランキング
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                現在最も売れている商品とそのパフォーマンスデータです。売上個数と売上金額の両面から分析できます。
              </Typography>
            </Box>
            
            {/* Product ranking would go here */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={0} variant="outlined" sx={{ p: 0 }}>
                  <Box sx={{ overflowX: 'auto' }}>
                    {/* Sample product ranking table */}
                    {/* In a real app, this would display actual data */}
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'background.paper' }}>
                          <TableCell>順位</TableCell>
                          <TableCell>商品名</TableCell>
                          <TableCell align="right">価格</TableCell>
                          <TableCell align="right">売上個数</TableCell>
                          <TableCell align="right">売上金額</TableCell>
                          <TableCell align="right">競合数</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trendingProducts.map((product, index) => (
                          <TableRow key={product.id} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell align="right">{product.price}</TableCell>
                            <TableCell align="right">{product.sold}個</TableCell>
                            <TableCell align="right">
                              ¥{(parseInt(product.price.replace(/[^0-9]/g, '')) * product.sold).toLocaleString()}
                            </TableCell>
                            <TableCell align="right">{product.competition}</TableCell>
                          </TableRow>
                        ))}
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
              <Typography variant="h6" gutterBottom>
                競合セラー分析
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                主要競合のセラー情報と販売パフォーマンスの詳細分析です。競合の強みと弱みを理解し、自社の戦略立案に活用できます。
              </Typography>
            </Box>
            
            {/* Competitor analysis content */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    主要競合セラー
                  </Typography>
                  {/* Sample data visualization */}
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
      </Container>
    </>
  );
};

export default Dashboard; 