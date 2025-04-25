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
  Chip,
  CircularProgress,
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ArrowBack as ArrowBackIcon,
  CloudDownload as CloudDownloadIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

// Mock product data
const mockProductData = {
  id: 'p1',
  title: 'ワイヤレスイヤホン Bluetooth 5.2 ノイズキャンセリング機能付き 防水',
  price: 3200,
  imageUrl: 'https://static.mercdn.net/item/detail/orig/photos/m82491234_1.jpg',
  soldCount: 145,
  revenueTotal: 464000,
  seller: 'techgadgets2023',
  category: '家電',
  isImport: true,
  competition: 12,
  trendChange: '+12%',
  lastSoldDate: '2025-04-15',
  description: 'Bluetooth 5.2対応の高音質ワイヤレスイヤホン。最大8時間の連続再生、IPX7防水、ノイズキャンセリング機能付きで通話もクリア。充電ケース付きで合計32時間使用可能。',
  salesHistory: [
    { date: '2025-04-15', count: 5, revenue: 16000 },
    { date: '2025-04-14', count: 3, revenue: 9600 },
    { date: '2025-04-13', count: 7, revenue: 22400 },
    { date: '2025-04-12', count: 4, revenue: 12800 },
    { date: '2025-04-11', count: 6, revenue: 19200 },
    { date: '2025-04-10', count: 8, revenue: 25600 },
    { date: '2025-04-09', count: 5, revenue: 16000 },
  ],
  competitors: [
    { name: 'audiolife', price: 3500, soldCount: 125, rating: 4.2 },
    { name: 'tech_direct', price: 2980, soldCount: 98, rating: 4.0 },
    { name: 'soundmaster', price: 3350, soldCount: 112, rating: 4.5 },
    { name: 'gadgetfusion', price: 3120, soldCount: 87, rating: 3.9 },
  ],
  marketInsights: {
    avgPrice: 3150,
    priceRange: [2400, 4200],
    avgSoldPerWeek: 24,
    marketSize: '大',
    demandTrend: '上昇',
    seasonality: '年間安定',
    profitMargin: '約35-45%',
    importSource: '中国広東省',
  },
  keywords: ['Bluetooth', 'ワイヤレス', 'イヤホン', 'ノイズキャンセリング', '防水', '高音質'],
  supplyDetails: {
    minOrderQty: 20,
    deliveryTime: '2-3週間',
    avgUnitCost: 1800,
    supplierCount: 8,
    qualityRisk: '中',
  }
};

// Define the type for product data
type ProductDataType = typeof mockProductData;

// Component interfaces
interface DataRowProps {
  label: string;
  value: string | number;
  color?: string;
}

interface DataSectionProps {
  title: string;
  data: Record<string, string | number>;
}

// Component for displaying a data row with label and value
const DataRow = ({ label, value, color }: DataRowProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body1" fontWeight={500} color={color || 'text.primary'}>{value}</Typography>
  </Box>
);

// Component for market/supply data sections
const DataSection = ({ title, data }: DataSectionProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Object.entries(data).map(([key, value], index) => (
          <DataRow 
            key={index} 
            label={key} 
            value={value} 
          />
        ))}
      </Box>
    </CardContent>
  </Card>
);

const ProductAnalysisPage = () => {
  const { 
    user, 
    loading, 
    checkSubscription, 
    canViewCompetitorAnalysis,
    incrementCompetitorAnalysisCount
  } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { id } = router.query;
  
  const [productData, setProductData] = useState<ProductDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [competitorAnalysisCount, setCompetitorAnalysisCount] = useState(0);
  const [competitorAnalysisLimit, setCompetitorAnalysisLimit] = useState(Infinity);
  const [userPlan, setUserPlan] = useState('');

  // Check authentication and subscription
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else {
          const isSubscribed = await checkSubscription();
          setHasSubscription(isSubscribed);
          if (!isSubscribed) router.push('/subscription');
          
          // Set user plan
          setUserPlan(user.subscription.plan);
          
          // Set competitor analysis count and limit
          setCompetitorAnalysisCount(user.competitorAnalysisCount || 0);
          
          // Set analysis limit based on plan
          const limits = {
            'basic': 3,
            'standard': 50,
            'premium': Infinity
          };
          setCompetitorAnalysisLimit(limits[user.subscription.plan as keyof typeof limits] || 0);
        }
      }
    };
    checkAuth();
  }, [loading, user, router, checkSubscription]);

  // Fetch product data
  useEffect(() => {
    if (user && id) fetchProductData();
  }, [id, user]);

  const fetchProductData = async () => {
    // Check if user can view more competitor analyses
    const canView = await canViewCompetitorAnalysis();
    if (!canView) {
      setShowUpgradeDialog(true);
      return;
    }
    
    setIsLoading(true);
    
    // Increment the competitor analysis count
    await incrementCompetitorAnalysisCount();
    setCompetitorAnalysisCount(prev => prev + 1);
    
    // Simulate API delay
    setTimeout(() => {
      setProductData(mockProductData);
      setIsLoading(false);
    }, 800);
  };

  const handleBack = () => router.back();
  
  const handleDownloadCSV = () => alert('CSVダウンロード機能は実装予定です。');

  // Loading state
  if (loading || !user || isLoading || !productData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Format market insights data for the DataSection component
  const marketInsightsData = {
    '市場規模': productData.marketInsights.marketSize,
    '需要トレンド': productData.marketInsights.demandTrend,
    '季節性': productData.marketInsights.seasonality,
    '平均価格': `¥${productData.marketInsights.avgPrice.toLocaleString()}`,
    '価格帯': `¥${productData.marketInsights.priceRange[0].toLocaleString()} 〜 ¥${productData.marketInsights.priceRange[1].toLocaleString()}`,
    '週間平均販売数': `${productData.marketInsights.avgSoldPerWeek}個`,
    '想定利益率': productData.marketInsights.profitMargin
  };

  // Format supply details data for the DataSection component
  const supplyDetailsData = {
    '仕入れ元': productData.marketInsights.importSource,
    '仕入れ単価 (平均)': `¥${productData.supplyDetails.avgUnitCost.toLocaleString()}`,
    '最小発注数量': `${productData.supplyDetails.minOrderQty}個`,
    '納期': productData.supplyDetails.deliveryTime,
    '仕入れ先数': `${productData.supplyDetails.supplierCount}社`,
    '品質リスク': productData.supplyDetails.qualityRisk
  };

  return (
    <>
      <Head>
        <title>競合分析 | Seller Navi</title>
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            検索結果へ戻る
          </Button>
          
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right', mb: 1 }}>
              競合分析: {competitorAnalysisCount} / {competitorAnalysisLimit === Infinity ? '無制限' : competitorAnalysisLimit}
            </Typography>
            
            {userPlan !== 'premium' && (
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => router.push('/subscription')}
              >
                アップグレード
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Product details card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{
                    width: '100%',
                    height: 250,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    mb: 2
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    商品画像
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {productData.keywords.map((keyword, index) => (
                    <Chip 
                      key={index} 
                      label={keyword} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))}
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {productData.title}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      価格
                    </Typography>
                    <Typography variant="h6">
                      ¥{productData.price.toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      販売数
                    </Typography>
                    <Typography variant="h6">
                      {productData.soldCount}個
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      総売上
                    </Typography>
                    <Typography variant="h6">
                      ¥{productData.revenueTotal.toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      トレンド
                    </Typography>
                    <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {productData.trendChange}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="body2" paragraph>
                  {productData.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  商品詳細
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      出品者
                    </Typography>
                    <Typography variant="body1">
                      {productData.seller}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      カテゴリ
                    </Typography>
                    <Typography variant="body1">
                      {productData.category}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      競合数
                    </Typography>
                    <Typography variant="body1">
                      {productData.competition}社
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Competitors table */}
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          競合詳細
          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>出品者</TableCell>
                <TableCell align="right">価格</TableCell>
                <TableCell align="right">販売数</TableCell>
                <TableCell align="right">評価</TableCell>
                <TableCell align="right">差別化ポイント</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productData.competitors.map((competitor, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {competitor.name}
                  </TableCell>
                  <TableCell align="right">
                    ¥{competitor.price.toLocaleString()}
                    {competitor.price < productData.price ? (
                      <Typography component="span" color="error.main" fontSize="small" sx={{ ml: 1 }}>
                        -¥{(productData.price - competitor.price).toLocaleString()}
                      </Typography>
                    ) : (
                      <Typography component="span" color="success.main" fontSize="small" sx={{ ml: 1 }}>
                        +¥{(competitor.price - productData.price).toLocaleString()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{competitor.soldCount}個</TableCell>
                  <TableCell align="right">{competitor.rating}</TableCell>
                  <TableCell align="right">
                    {Math.random() > 0.5 ? (
                      <CheckIcon fontSize="small" color="success" />
                    ) : (
                      <CloseIcon fontSize="small" color="error" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Market insights and supply details */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DataSection title="市場分析" data={marketInsightsData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <DataSection title="仕入れ情報" data={supplyDetailsData} />
          </Grid>
        </Grid>
      </Container>
      
      {/* Upgrade Dialog */}
      <Dialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            機能制限のお知らせ
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {userPlan === 'basic' ? (
              <>
                ベーシックプランでは月に3回までの競合分析が可能です。上限に達しました。
                より多くの分析をご希望の場合は、上位プランへのアップグレードをご検討ください。
              </>
            ) : userPlan === 'standard' ? (
              <>
                スタンダードプランでは月に50回までの競合分析が可能です。上限に達しました。
                無制限の分析をご希望の場合は、プレミアムプランへのアップグレードをご検討ください。
              </>
            ) : (
              <>
                この機能を利用するには、プランへのアップグレードが必要です。
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpgradeDialog(false)}>
            閉じる
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setShowUpgradeDialog(false);
              router.push('/subscription');
            }}
          >
            プランをアップグレード
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductAnalysisPage; 