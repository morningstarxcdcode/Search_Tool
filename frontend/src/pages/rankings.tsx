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
  IconButton,
  useTheme,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Fade,
  Zoom,
  Tooltip,
  alpha,
  Badge,
  Alert,
  Snackbar,
  useMediaQuery,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  GetApp as GetAppIcon,
  TrendingUp as TrendingUpIcon,
  Sort as SortIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  LocalOffer as LocalOfferIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
  Timeline as TimelineIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as EmojiEventsIcon,
  Info as InfoIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface Product {
  id: string;
  name: string;
  price: number;
  condition: string;
  category: string;
  image_url: string;
  seller_name: string;
  lastSoldDate: string;
  description: string;
  import: string;
  sold?: number;
  views?: number;
  competition?: number;
  priceHistory?: { date: string; price: number }[];
}

const RankingsPage = () => {
  const { user, loading, checkSubscription } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [category, setCategory] = useState('all');
  const [period, setPeriod] = useState('30days');
  const [sortBy, setSortBy] = useState('price_desc');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [userPlan, setUserPlan] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showOnlyImported, setShowOnlyImported] = useState(false);

  // Check if user is logged in and has active subscription
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else {
          const isSubscribed = await checkSubscription();
          setHasSubscription(isSubscribed);
          setUserPlan(user.plan || 'basic');

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
  }, [category, period, sortBy, showOnlyImported, user]);

  // Fetch rankings from API
  const fetchRankings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}api/v1/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setSnackbarMessage('データの取得に失敗しました。');
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle description click
  const handleDescriptionClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDescriptionModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowDescriptionModal(false);
    setSelectedProduct(null);
  };

  // Download rankings as CSV
  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}api/v1/products/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rankings-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbarMessage('CSVファイルをダウンロードしました');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setSnackbarMessage('CSVのダウンロードに失敗しました');
      setShowSnackbar(true);
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>売れ筋ランキング | Seller Navi</title>
      </Head>
      
      <Box sx={{ 
        background: 'linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)',
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Fade in timeout={800}>
            <Box>
              {/* Header Section */}
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
                  売れ筋ランキング
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
                >
                  各カテゴリーの売れ筋商品ランキングを確認できます。
                  市場動向を把握し、最適な商品選定にお役立てください。
                </Typography>
              </Box>
              
              {/* Filters Card */}
              <Zoom in timeout={1000}>
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
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          fullWidth
                          label="カテゴリー"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                            }
                          }}
                        >
                          <MenuItem value="all">すべて</MenuItem>
                          <MenuItem value="ファッション">ファッション</MenuItem>
                          <MenuItem value="ベビー・キッズ">ベビー・キッズ</MenuItem>
                          <MenuItem value="ホビー・楽器・アート">ホビー・楽器・アート</MenuItem>
                          <MenuItem value="チケット">チケット</MenuItem>
                          <MenuItem value="本・雑誌・漫画">本・雑誌・漫画</MenuItem>
                          <MenuItem value="生活家電・空調">生活家電・空調</MenuItem>
                          <MenuItem value="ゲーム・おもちゃ・グッズ">ゲーム・おもちゃ・グッズ</MenuItem>
                          <MenuItem value="アウトドア・釣り・旅行用品">アウトドア・釣り・旅行用品</MenuItem>
                          <MenuItem value="コスメ・美容">コスメ・美容</MenuItem>
                          <MenuItem value="食品・飲料・酒">食品・飲料・酒</MenuItem>
                          <MenuItem value="スポーツ">スポーツ</MenuItem>
                          <MenuItem value="ダイエット・健康">ダイエット・健康</MenuItem>
                          <MenuItem value="家具・インテリア">家具・インテリア</MenuItem>
                          <MenuItem value="ペット用品">ペット用品</MenuItem>
                          <MenuItem value="DIY・工具">DIY・工具</MenuItem>
                          <MenuItem value="フラワー・ガーデニング">フラワー・ガーデニング</MenuItem>
                          <MenuItem value="ハンドメイド・手芸">ハンドメイド・手芸</MenuItem>
                          <MenuItem value="車・バイク・自転車">車・バイク・自転車</MenuItem>
                          <MenuItem value="CD・DVD・ブルーレイ">CD・DVD・ブルーレイ</MenuItem>
                          <MenuItem value="キッチン・日用品・その他">キッチン・日用品・その他</MenuItem>
                          <MenuItem value="スマホ・タブレット・パソコン">スマホ・タブレット・パソコン</MenuItem>
                          <MenuItem value="テレビ・オーディオ・カメラ">テレビ・オーディオ・カメラ</MenuItem>
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          fullWidth
                          label="並び替え"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <SortIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            ),
                          }}
                        >
                          <MenuItem value="price_asc">価格（安い順）</MenuItem>
                          <MenuItem value="price_desc">価格（高い順）</MenuItem>
                          <MenuItem value="date_desc">出品日（新しい順）</MenuItem>
                          <MenuItem value="date_asc">出品日（古い順）</MenuItem>
                          <MenuItem value="sold_desc">売上数（多い順）</MenuItem>
                          <MenuItem value="views_desc">閲覧数（多い順）</MenuItem>
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={showOnlyImported}
                                onChange={(e) => setShowOnlyImported(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="輸入品のみ"
                          />
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<GetAppIcon />}
                            onClick={handleDownloadCSV}
                            sx={{ 
                              height: '40px',
                              borderRadius: 2,
                              textTransform: 'none',
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                              '&:hover': {
                                boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)',
                              }
                            }}
                          >
                            CSV
                          </Button>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<RefreshIcon />}
                            onClick={fetchRankings}
                            sx={{ 
                              height: '40px',
                              borderRadius: 2,
                              textTransform: 'none',
                            }}
                          >
                            更新
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Zoom>
              
              {/* Rankings Table */}
              <Fade in timeout={1200}>
                <Card 
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    overflow: 'hidden'
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    {isLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <TableContainer 
                        component={Paper} 
                        sx={{ 
                          boxShadow: 'none',
                          overflow: 'auto',
                          position: 'relative',
                          '&::-webkit-scrollbar': {
                            width: '8px',
                            height: '8px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#888',
                            borderRadius: '4px',
                            '&:hover': {
                              background: '#555',
                            },
                          },
                        }}
                        ref={tableContainerRef}
                        onScroll={handleScroll}
                      >
                        <Table sx={{ minWidth: 700 }}>
                          <TableHead 
                            sx={{ 
                              backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.9)' : '#f8fafc',
                              position: 'sticky',
                              top: 0,
                              zIndex: 10,
                              backdropFilter: isScrolled ? 'blur(8px)' : 'none',
                              transition: 'all 0.3s ease',
                              boxShadow: isScrolled ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                            }}
                          >
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, width: '60px', py: 2 }}>順位</TableCell>
                              <TableCell sx={{ fontWeight: 600, width: '100px', py: 2 }}>商品画像</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>商品名</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>カテゴリー</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>価格</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>状態</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>出品者</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {products.map((product, index) => (
                              <TableRow
                                key={product.id}
                                onClick={() => handleDescriptionClick(product)}
                                sx={{
                                  cursor: 'pointer',
                                  '&:last-child td, &:last-child th': { border: 0 },
                                  '&:hover': { 
                                    backgroundColor: 'rgba(33, 150, 243, 0.04)',
                                    transition: 'background-color 0.2s ease',
                                  },
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: index < 3 ? 
                                      index === 0 ? 'gold' : 
                                      index === 1 ? 'silver' : 
                                      '#cd7f32' : 'transparent',
                                    color: index < 3 ? 'white' : 'text.secondary',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    boxShadow: index < 3 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                                  }}>
                                    {index + 1}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box 
                                    sx={{ 
                                      position: 'relative', 
                                      width: 80, 
                                      height: 80,
                                      borderRadius: 2,
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
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="body2" fontWeight={500}>
                                      {product.name}
                                    </Typography>
                                    {product.import && (
                                      <Chip
                                        label="輸入"
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ 
                                          height: 20, 
                                          fontSize: '0.625rem',
                                          borderRadius: 1,
                                        }}
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={product.category}
                                    size="small"
                                    sx={{
                                      borderRadius: 1,
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Typography 
                                    variant="body2" 
                                    fontWeight={600} 
                                    color="primary"
                                    sx={{
                                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                      backgroundClip: 'text',
                                      textFillColor: 'transparent',
                                      WebkitBackgroundClip: 'text',
                                      WebkitTextFillColor: 'transparent',
                                    }}
                                  >
                                    ¥{product.price.toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={product.condition}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ borderRadius: 1 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar 
                                      sx={{ 
                                        width: 24, 
                                        height: 24,
                                        fontSize: '0.75rem',
                                        bgcolor: 'primary.main'
                                      }}
                                    >
                                      {product.seller_name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body2">
                                      {product.seller_name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Box>
          </Fade>

          {/* Description Modal */}
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
                          {selectedProduct.sold !== undefined && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                売上数
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingUpIcon 
                                  fontSize="small" 
                                  color={selectedProduct.sold > 0 ? 'success' : 'disabled'} 
                                />
                                <Typography variant="body1" fontWeight={500} color={selectedProduct.sold > 0 ? 'success.main' : 'text.secondary'}>
                                  {selectedProduct.sold}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {selectedProduct.views !== undefined && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                閲覧数
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {selectedProduct.views.toLocaleString()}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                      {selectedProduct.priceHistory && selectedProduct.priceHistory.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                            価格推移
                          </Typography>
                          <Box sx={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={selectedProduct.priceHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <RechartsTooltip />
                                <Line 
                                  type="monotone" 
                                  dataKey="price" 
                                  stroke="#2196F3" 
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<FavoriteBorderIcon />}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                            '&:hover': {
                              boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)',
                            }
                          }}
                        >
                          お気に入りに追加
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<ShareIcon />}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          共有
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </DialogContent>
              </>
            )}
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={showSnackbar}
            autoHideDuration={3000}
            onClose={() => setShowSnackbar(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setShowSnackbar(false)} 
              severity="success" 
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
};

export default RankingsPage; 