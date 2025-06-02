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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Fade,
  Zoom,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  GetApp as GetAppIcon,
  TrendingUp as TrendingUpIcon,
  Sort as SortIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  EmojiEvents as EmojiEventsIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Image from 'next/image';

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

interface RankBadgeProps {
  rank: number;
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => {
  if (rank > 3) {
    return <Typography variant="body1" fontWeight={600}>{rank}</Typography>;
  }
  
  // Choose color based on rank
  const colors = {
    1: '#FFD700', // Gold
    2: '#C0C0C0', // Silver
    3: '#CD7F32', // Bronze
  };
  
  const badges = {
    1: '金',
    2: '銀',
    3: '銅'
  };
  
  return (
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: colors[rank as 1 | 2 | 3],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ color: rank === 2 ? '#333' : '#fff' }}
      >
        {badges[rank as 1 | 2 | 3]}
      </Typography>
    </Box>
  );
};

interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  condition: string;
  category: string;
  image_url: string;
  seller_name: string;
  lastSoldDate: string;
  description: string;
  import: string;
}

const RankingsPage = () => {
  const { user, loading, checkSubscription, canPerformRankingSearch } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [category, setCategory] = useState('all');
  const [period, setPeriod] = useState('30days');
  const [sortBy, setSortBy] = useState('sold');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [canSearch, setCanSearch] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [userPlan, setUserPlan] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

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
  }, [category, period, sortBy, user]);

  // Fetch rankings from API
  const fetchRankings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}api/v1/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('CSVのダウンロードに失敗しました。');
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <FilterListIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        フィルター
                      </Typography>
                    </Box>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={3}>
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
                      
                      <Grid item xs={12} md={3}>
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
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Button
                          fullWidth
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
                          CSVダウンロード
                        </Button>
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
                          maxHeight: '70vh',
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
                              <TableCell sx={{ fontWeight: 600, width: '100px', py: 2 }}>商品画像</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>商品名</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>カテゴリー</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>価格</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>ブランド</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>状態</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>出品者</TableCell>
                              <TableCell sx={{ fontWeight: 600, py: 2 }}>最終販売日</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {products.map((product) => (
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
                                      backgroundColor:
                                        product.category === '家電' ? 'rgba(33, 150, 243, 0.1)' :
                                        product.category === '美容' ? 'rgba(233, 30, 99, 0.1)' :
                                        product.category === 'ホーム' ? 'rgba(76, 175, 80, 0.1)' :
                                        product.category === '日用品' ? 'rgba(255, 152, 0, 0.1)' :
                                        'rgba(156, 39, 176, 0.1)',
                                      color:
                                        product.category === '家電' ? 'info.main' :
                                        product.category === '美容' ? 'error.main' :
                                        product.category === 'ホーム' ? 'success.main' :
                                        product.category === '日用品' ? 'warning.main' :
                                        'secondary.main',
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
                                  <Typography variant="body2" color="text.secondary">
                                    {product.brand}
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
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {product.lastSoldDate}
                                  </Typography>
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
        </Container>
      </Box>
    </>
  );
};

export default RankingsPage; 