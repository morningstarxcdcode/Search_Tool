import React, { useState, useEffect, useMemo } from 'react';
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
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
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
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Category as CategoryIcon,
  LocalOffer as LocalOfferIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface Product {
  id: string;
  name: string;
  price: string;
  sold?: number;
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State declarations
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Memoized data
  const trendData = useMemo(() => [
    { name: '1月', value: 4000 },
    { name: '2月', value: 3000 },
    { name: '3月', value: 2000 },
    { name: '4月', value: 2780 },
    { name: '5月', value: 1890 },
    { name: '6月', value: 2390 },
  ], []);

  const aiSuggestions = useMemo(() => [
    'おすすめの中国輸入商品は？',
    '利益率の高い中国商品のキーワードは？',
    '中国製品を見分けるコツを教えて',
    '最近流行っている中国輸入商品のカテゴリーは？',
    '季節商品のトレンド予測は？',
    '競合分析の方法を教えて',
    '在庫管理のベストプラクティスは？',
  ], []);

  const summaryData = useMemo(() => [
    {
      title: '注目のトレンド商品',
      value: '53',
      change: '+12%',
      icon: <TrendingUpIcon sx={{ fontSize: 36, color: '#2196F3' }} />,
      color: '#2196F3',
    },
    {
      title: '昨日の検索数',
      value: '24',
      change: '+5%',
      icon: <SearchIcon sx={{ fontSize: 36, color: '#9C27B0' }} />,
      color: '#9C27B0',
    },
    {
      title: 'アクティブユーザー',
      value: '1,234',
      change: '+8%',
      icon: <PeopleIcon sx={{ fontSize: 36, color: '#4CAF50' }} />,
      color: '#4CAF50',
    },
    {
      title: 'AI分析回数',
      value: '89',
      change: '+15%',
      icon: <SmartToyIcon sx={{ fontSize: 36, color: '#FF9800' }} />,
      color: '#FF9800',
    },
  ], []);

  const fetchTrendingProducts = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}api/v1/products`);
      setTrendingProducts(response.data);
      console.log(response.data)
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


  // Fix sorting functionality
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedProducts = useMemo(() => {
    return [...trendingProducts].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' 
          ? Number(a.price) - Number(b.price)
          : Number(b.price) - Number(a.price);
      } else if (sortBy === 'sold') {
        return sortOrder === 'asc'
          ? ((a.sold ?? 0) - (b.sold ?? 0))
          : ((b.sold ?? 0) - (a.sold ?? 0));
      }
      return 0;
    });
  }, [trendingProducts, sortBy, sortOrder]);

  // Fix price formatting
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0' : numPrice.toLocaleString();
  };

  // Fix image loading error handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/images/placeholder.png'; // Add a placeholder image
  };



  // Fix notification handling
  const handleNotificationClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowNotification(false);
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>ダッシュボード | Seller Navi</title>
        <meta name="description" content="物販リサーチのデータ分析と市場トレンドを確認できるダッシュボード" />
      </Head>

      {/* Mobile Sidebar */}
      <Drawer
        anchor="left"
        open={showSidebar}
        onClose={() => setShowSidebar(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Seller Navi
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItem button>
            <ListItemIcon>
              <AnalyticsIcon />
            </ListItemIcon>
            <ListItemText primary="分析" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="カテゴリー" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <LocalOfferIcon />
            </ListItemIcon>
            <ListItemText primary="キーワード" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <TimelineIcon />
            </ListItemIcon>
            <ListItemText primary="トレンド" />
          </ListItem>
        </List>
      </Drawer>

      <Box sx={{ 
        background: 'linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)',
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4 
          }}>
            {isMobile && (
              <IconButton onClick={() => setShowSidebar(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography 
              variant="h4" 
              component="h1" 
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Box>
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
                            <Chip 
                              label={item.change}
                              size="small"
                              color="success"
                              sx={{ 
                                height: 20,
                                '& .MuiChip-label': {
                                  px: 1,
                                  fontSize: '0.75rem',
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

          {/* Trend Chart */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              トレンド推移
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2196F3" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Tabs for different data views */}
          <Box sx={{ mb: 4 }}>
       
                        
            {/* Best Selling Products */}
  
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
                            <TableCell 
                              sx={{ 
                                fontWeight: 600,
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                              }}
                              onClick={() => handleSort('name')}
                            >
                              商品名
                              {sortBy === 'name' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                              )}
                            </TableCell>
                            <TableCell 
                              align="right" 
                              sx={{ 
                                fontWeight: 600,
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                              }}
                              onClick={() => handleSort('price')}
                            >
                              価格
                              {sortBy === 'price' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sortedProducts.slice(0,10).map((product, index) => (
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
                                    onError={handleImageError}
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
                                  ¥{formatPrice(product.price)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
          </Box>
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

      {/* Notification Snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Dashboard; 