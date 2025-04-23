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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ArrowBack as ArrowBackIcon,
  CloudDownload as CloudDownloadIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Close as CloseIcon,
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
  const { user, loading, checkSubscription } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { id } = router.query;
  
  const [productData, setProductData] = useState<ProductDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

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
        }
      }
    };
    checkAuth();
  }, [loading, user, router, checkSubscription]);

  // Fetch product data
  useEffect(() => {
    if (user && id) fetchProductData();
  }, [id, user]);

  const fetchProductData = () => {
    setIsLoading(true);
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
        <title>商品分析 | Seller Navi</title>
      </Head>
      
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight={600}>
            商品分析
          </Typography>
        </Box>
        
        {/* Product Overview Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ 
                  width: '100%', 
                  height: 200, 
                  bgcolor: 'grey.200', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    商品画像
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={9}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {productData.title}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        label={productData.category} 
                        size="small" 
                        sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', color: 'info.main' }} 
                      />
                      {productData.isImport && <Chip label="輸入品" size="small" color="secondary" />}
                      {productData.keywords.map((keyword, index) => (
                        <Chip 
                          key={index}
                          label={keyword} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {productData.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownloadIcon />}
                    onClick={handleDownloadCSV}
                    sx={{ ml: 2 }}
                  >
                    データ出力
                  </Button>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">価格</Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={600}>
                      ¥{productData.price.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">累計販売数</Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {productData.soldCount}個
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">累計売上</Typography>
                    <Typography variant="h6" fontWeight={600}>
                      ¥{productData.revenueTotal.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">トレンド</Typography>
                    <Typography variant="h6" color="success.main" fontWeight={600}>
                      {productData.trendChange}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Market Analysis Section */}
        <Typography variant="h5" sx={{ mb: 2 }}>市場分析</Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <DataSection title="市場サマリー" data={marketInsightsData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <DataSection title="仕入れ情報" data={supplyDetailsData} />
          </Grid>
        </Grid>
        
        {/* Competitor Analysis Section */}
        <Typography variant="h5" sx={{ mb: 2 }}>競合分析</Typography>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                主要競合 ({productData.competitors.length}社)
              </Typography>
              <Chip
                label={`競合レベル: ${productData.competition > 15 ? '高' : productData.competition > 8 ? '中' : '低'}`}
                color={productData.competition > 15 ? 'error' : productData.competition > 8 ? 'warning' : 'success'}
              />
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>出品者名</TableCell>
                    <TableCell align="right">価格</TableCell>
                    <TableCell align="right">販売数</TableCell>
                    <TableCell align="right">評価</TableCell>
                    <TableCell align="right">差別化ポイント</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productData.competitors.map((competitor, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">{competitor.name}</TableCell>
                      <TableCell align="right" sx={{ 
                        color: competitor.price > productData.price ? 'success.main' : 
                              competitor.price < productData.price ? 'error.main' : 'text.primary',
                        fontWeight: competitor.price === productData.price ? 600 : 400
                      }}>
                        ¥{competitor.price.toLocaleString()}
                        {competitor.price !== productData.price && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {competitor.price > productData.price ? `+${competitor.price - productData.price}` : `${competitor.price - productData.price}`}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{competitor.soldCount}</TableCell>
                      <TableCell align="right">{competitor.rating}</TableCell>
                      <TableCell align="right">
                        {index === 0 && '高級感のあるデザイン'}
                        {index === 1 && '低価格戦略'}
                        {index === 2 && 'ブランディング、高評価'}
                        {index === 3 && '特になし'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
        
        {/* Business Recommendation Section */}
        <Typography variant="h5" sx={{ mb: 2 }}>ビジネス提案</Typography>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>参入判断</Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CheckIcon color="success" fontSize="large" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        参入おすすめ度: 高
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        市場規模と需要の伸びから、参入の好機と判断できます。
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
                
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>メリット</Typography>
                <Box sx={{ mb: 2 }}>
                  <Stack spacing={1}>
                    {[
                      '安定した需要がある',
                      '利益率が高い (35-45%)',
                      '季節性が低く年間を通して販売可能'
                    ].map((benefit, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                        <CheckIcon color="success" fontSize="small" />
                        <Typography variant="body2">{benefit}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
                
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>リスク</Typography>
                <Stack spacing={1}>
                  {[
                    '競合が多い',
                    '品質リスクが中程度'
                  ].map((risk, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                      <CloseIcon color="error" fontSize="small" />
                      <Typography variant="body2">{risk}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>差別化戦略</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" paragraph>
                    競合分析から、以下の差別化戦略を提案します：
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      {
                        title: '価格戦略',
                        content: '¥2,980~¥3,100の価格帯で出品し、競合より低価格を実現しながら利益率を確保。'
                      },
                      {
                        title: '商品強化',
                        content: 'より長いバッテリー寿命とノイズキャンセリング性能を強調し、商品説明で訴求。'
                      },
                      {
                        title: 'マーケティング',
                        content: '「ワイヤレスイヤホン 防水 高音質」などのキーワード最適化と、初回購入者向けの特典を検討。'
                      }
                    ].map((strategy, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>{strategy.title}</Typography>
                        <Typography variant="body2">{strategy.content}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default ProductAnalysisPage; 