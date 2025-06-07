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
  TextField,
  MenuItem,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Chip,
  LinearProgress,
  Pagination,
  Divider,
  IconButton,
  Alert,
  Backdrop,
  CircularProgress,
  useTheme,
  Radio,
  RadioGroup,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Fade,
  Zoom,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CloudDownload as CloudDownloadIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  SmartToy as SmartToyIcon,
  Psychology as PsychologyIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  TrendingUp as TrendingUpIcon,
  LocalOffer as LocalOfferIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import ProductSaveButtons from '@/components/layout/ProductSaveButtons';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  price: string;
  image_url: string;
  description: string;
  brand: string;
  condition: string;
  category: string;
  seller_name: string;
  url: string;
}

const SearchPage = () => {
  const { 
    user, 
    loading, 
    checkSubscription, 
    canExportCSV, 
    canPerformRankingSearch,
    canUseAIAssistant,
    incrementSearchCount
  } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [period, setPeriod] = useState('30days');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('likes_desc');
  const [isImportOnly, setIsImportOnly] = useState(true);
  const [productType, setProductType] = useState('import');
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [exportCount, setExportCount] = useState(0);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [aiSearchKeywords, setAiSearchKeywords] = useState<string[]>([]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [canUseAi, setCanUseAi] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [searchLimit, setSearchLimit] = useState(Infinity);
  const [results, setResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  // Check user permissions and limits
  useEffect(() => {
    const checkPermissions = async () => {
      if (user) {
        try {
          // Check if user can export CSV
          const canExport = await canExportCSV();
          setCanExport(canExport);
          
          // Get search count and limit
          setSearchCount(user.searchCount || 0);
          
          // Set search limit based on plan
          const limits = {
            'basic': 3,
            'standard': 50,
            'premium': Infinity
          };
          setSearchLimit(limits[user.plan as keyof typeof limits] || 0);
          
          // Check if user can use AI search
          const canUseAiAssistant = await canUseAIAssistant();
          setCanUseAi(canUseAiAssistant);
          
          // Get export count
          setExportCount(user.exportCount || 0);
        } catch (err) {
          console.error('Error checking permissions:', err);
          setError('権限の確認中にエラーが発生しました。');
        }
      }
    };
    
    checkPermissions();
  }, [user, canExportCSV, canUseAIAssistant]);

  // Handle search submit
  const handleSearch = async () => {
    try {
      setError(null);
      
      // Check if user can perform another search
      const canSearch = await canPerformRankingSearch();
      
      if (!canSearch) {
        setShowUpgradeDialog(true);
        return;
      }
      
      setIsSearching(true);
      setShowBackdrop(true);
      
      // Increment search count
      try {
        await incrementSearchCount();
        setSearchCount((prev) => prev + 1);
      } catch (err) {
        console.error('Error incrementing search count:', err);
        // Continue with search even if increment fails
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}api/v1/products/search`, {
        keyword: searchTerm,
        category: category !== 'all' ? category : undefined,
        min_price: minPrice ? parseInt(minPrice) : undefined,
        max_price: maxPrice ? parseInt(maxPrice) : undefined,
        sort_by: sortBy
      });

      if (response.data) {
        setResults(response.data);
      } else {
        setResults([]);
        setError('検索結果の形式が不正です。');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('検索に失敗しました。少し時間をおいてから再度試してください。');
      setResults([]);
    } finally {
      setIsSearching(false);
      setShowBackdrop(false);
    }
  };

  // Clear search filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setPeriod('30days');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('likes_desc');
    setIsImportOnly(true);
    setProductType('import');
    setError(null);
  };

  // Handle CSV download
  const handleDownloadCSV = async () => {
    try {
      // Check if user can export CSV
      const canExport = await canExportCSV();
      
      if (!canExport) {
        setShowUpgradeDialog(true);
        return;
      }
      
      // In a real app, this would generate and download the CSV
      alert('CSVがダウンロードされました。');
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError('CSVのダウンロードに失敗しました。');
    }
  };

  // Toggle AI search
  const toggleAiSearch = async () => {
    try {
      // Check if user can use AI search
      if (!canUseAi) {
        setShowUpgradeDialog(true);
        return;
      }
      
      setShowAiSearch(!showAiSearch);
    } catch (err) {
      console.error('Error toggling AI search:', err);
      setError('AI検索の切り替えに失敗しました。');
    }
  };

  // Handle AI search
  const handleAiSearch = async () => {
    if (!canUseAi) return;
    
    try {
      setIsAiSearching(true);
      setError(null);
      
      // In a real app, this would be an API call to an AI service
      // For this demo, we'll simulate AI-enhanced search
      setTimeout(() => {
        // Simulate AI generating additional keywords for Chinese imports
        const aiGenerated = [
          '多機能',
          'USB充電',
          'ポータブル',
          '折りたたみ式',
          '高コスパ',
          'LEDライト',
        ].sort(() => 0.5 - Math.random()).slice(0, 3);
        
        setAiSearchKeywords([...aiGenerated]);
        
        // Incorporate AI keywords into search
        let enhancedSearchTerm = searchTerm;
        if (searchTerm) {
          enhancedSearchTerm += ' ' + aiGenerated.join(' ');
        } else {
          enhancedSearchTerm = aiGenerated.join(' ');
        }
        
        setSearchTerm(enhancedSearchTerm);
        setIsAiSearching(false);
      }, 1500);
    } catch (err) {
      console.error('Error in AI search:', err);
      setError('AI検索の処理中にエラーが発生しました。');
      setIsAiSearching(false);
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

  // Format price
  const formatPrice = (price: string | number) => {
    return typeof price === 'string' 
      ? parseInt(price.replace(/[^0-9]/g, '')).toLocaleString()
      : price.toLocaleString();
  };

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/images/placeholder.png';
  };

  return (
    <>
      <Head>
        <title>商品検索 | Mercari Search Tool</title>
        <meta name="description" content="Mercari商品検索ツール" />
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          pt: { xs: 2, md: 4 },
          pb: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Search Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
              商品検索
            </Typography>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="商品名、キーワードを入力"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearchTerm('')}
                            edge="end"
                          >
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <TextField
                      select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      label="カテゴリー"
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
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSearch}
                      disabled={isSearching}
                      startIcon={<SearchIcon />}
                      sx={{ flex: 1 }}
                    >
                      検索
                    </Button>
                    <Tooltip title="AI検索">
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={toggleAiSearch}
                        disabled={!canUseAi || isAiSearching}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        <SmartToyIcon />
                      </Button>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>

              {/* Advanced Filters */}
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="最低価格"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="最高価格"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined">
                      <TextField
                        select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        label="並び替え"
                      >
                        <MenuItem value="price_asc">価格（安い順）</MenuItem>
                        <MenuItem value="price_desc">価格（高い順）</MenuItem>
                        <MenuItem value="likes_desc">いいね（多い順）</MenuItem>
                      </TextField>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isImportOnly}
                            onChange={(e) => setIsImportOnly(e.target.checked)}
                          />
                        }
                        label="輸入品のみ"
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Box>

          {/* Search Results */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isSearching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : results.length > 0 ? (
            <Grid container spacing={3}>
              {results.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '100%',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleDescriptionClick(product)}
                    >
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        onError={handleImageError}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component="h2"
                        gutterBottom
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          height: '3em',
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="h5"
                        color="primary"
                        fontWeight="bold"
                        gutterBottom
                      >
                        ¥{formatPrice(product.price)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {product.brand && (
                          <Chip
                            size="small"
                            label={product.brand}
                            icon={<LocalOfferIcon />}
                          />
                        )}
                        {product.category && (
                          <Chip
                            size="small"
                            label={product.category}
                            icon={<CategoryIcon />}
                          />
                        )}
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <ProductSaveButtons productId={product.id} productTitle={product.name} />
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : !isSearching && searchTerm && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                検索結果が見つかりませんでした
              </Typography>
              <Typography variant="body1" color="text.secondary">
                別のキーワードで検索してみてください
              </Typography>
            </Box>
          )}

          {/* AI Search Dialog */}
          <Dialog
            open={showAiSearch}
            onClose={() => setShowAiSearch(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon color="primary" />
                <Typography variant="h6">AI検索アシスタント</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                AIが検索キーワードを分析し、最適な検索結果を提案します。
              </DialogContentText>
              {isAiSearching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    提案キーワード:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {aiSearchKeywords.map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        onClick={() => {
                          setSearchTerm((prev) => 
                            prev ? `${prev} ${keyword}` : keyword
                          );
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAiSearch(false)}>キャンセル</Button>
              <Button
                variant="contained"
                onClick={handleAiSearch}
                disabled={isAiSearching}
              >
                検索を実行
              </Button>
            </DialogActions>
          </Dialog>

          {/* Product Description Modal */}
          <Dialog
            open={showDescriptionModal}
            onClose={handleCloseModal}
            maxWidth="md"
            fullWidth
          >
            {selectedProduct && (
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="div" fontWeight={600}>
                      {selectedProduct.name}
                    </Typography>
                    <IconButton onClick={handleCloseModal} size="small">
                      <ClearIcon />
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
                        }}
                      >
                        <Image
                          src={selectedProduct.image_url}
                          alt={selectedProduct.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          onError={handleImageError}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                          ¥{formatPrice(selectedProduct.price)}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {selectedProduct.description}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                          商品詳細
                        </Typography>
                        <Grid container spacing={2}>
                          {selectedProduct.brand && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                ブランド
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {selectedProduct.brand}
                              </Typography>
                            </Grid>
                          )}
                          {selectedProduct.condition && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                状態
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {selectedProduct.condition}
                              </Typography>
                            </Grid>
                          )}
                          {selectedProduct.category && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                カテゴリ
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {selectedProduct.category}
                              </Typography>
                            </Grid>
                          )}
                          {selectedProduct.seller_name && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                出品者
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {selectedProduct.seller_name}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          href={selectedProduct.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<ShoppingBagIcon />}
                        >
                          商品ページを見る
                        </Button>
                        <ProductSaveButtons productId={selectedProduct.id} productTitle={selectedProduct.name} />
                      </Box>
                    </Grid>
                  </Grid>
                </DialogContent>
              </>
            )}
          </Dialog>

          {/* Upgrade Dialog */}
          <Dialog
            open={showUpgradeDialog}
            onClose={() => setShowUpgradeDialog(false)}
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon color="primary" />
                <Typography variant="h6">機能制限</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                この機能を使用するには、プレミアムプランへのアップグレードが必要です。
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowUpgradeDialog(false)}>キャンセル</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push('/subscription')}
              >
                アップグレード
              </Button>
            </DialogActions>
          </Dialog>

          {/* Loading Backdrop */}
          <Backdrop
            sx={{
              color: '#fff',
              zIndex: theme.zIndex.drawer + 1,
            }}
            open={showBackdrop}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </Container>
      </Box>
    </>
  );
};

export default SearchPage; 