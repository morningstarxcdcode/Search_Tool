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
  Tabs,
  Tab,
  Button,
  Divider,
  Chip,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Badge,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
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

// Mock saved product data
const mockLikedProducts = [
  {
    id: 'p1',
    title: 'ワイヤレスイヤホン Bluetooth 5.2 ノイズキャンセリング機能付き 防水',
    price: 3200,
    category: '家電',
    imageUrl: 'https://static.mercdn.net/item/detail/orig/photos/m82491234_1.jpg',
    savedDate: '2025-04-23',
    note: 'ノイズキャンセリング機能が優れている。競合が少ない。',
  },
  {
    id: 'p3',
    title: 'フェイシャルマスク 保湿 美容液 エッセンス 毛穴ケア 20枚入り 韓国コスメ',
    price: 1200,
    category: '美容',
    imageUrl: 'https://static.mercdn.net/item/detail/orig/photos/m92837465_1.jpg',
    savedDate: '2025-04-22',
    note: '低価格で利益率が高い。リピート購入が期待できる。',
  },
];

const mockStarredProducts = [
  {
    id: 'p2',
    title: 'スマートウォッチ 多機能 心拍数 血圧 歩数計 GPS 連携 防水 睡眠モニター',
    price: 4980,
    category: '家電',
    imageUrl: 'https://static.mercdn.net/item/detail/orig/photos/m72381923_1.jpg',
    savedDate: '2025-04-21',
    note: '競合調査中。類似商品の仕入れを検討。',
  },
];

const mockBookmarkedProducts = [
  {
    id: 'p5',
    title: 'ミニ加湿器 USB充電式 卓上 静音 LEDライト付き オフィス 寝室用',
    price: 1980,
    category: 'ホーム',
    imageUrl: 'https://static.mercdn.net/item/detail/orig/photos/m52836472_1.jpg',
    savedDate: '2025-04-20',
    note: 'デザインが良い。シーズン商品として冬に販売予定。',
  },
  {
    id: 'p6',
    title: '折りたたみ傘 自動開閉 軽量 コンパクト 撥水 耐風 晴雨兼用 UV対策',
    price: 1450,
    category: '日用品',
    imageUrl: 'https://static.mercdn.net/item/detail/orig/photos/m92736451_1.jpg',
    savedDate: '2025-04-19',
    note: '梅雨シーズンに向けて仕入れ検討中。耐風性能が売り。',
  },
];

const SavedProductsPage = () => {
  const { user, loading, checkSubscription } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [userPlan, setUserPlan] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [likedProducts, setLikedProducts] = useState(mockLikedProducts);
  const [starredProducts, setStarredProducts] = useState(mockStarredProducts);
  const [bookmarkedProducts, setBookmarkedProducts] = useState(mockBookmarkedProducts);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  
  // Check if user is logged in and has active subscription
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else {
          const plan = await checkSubscription();
          if (typeof plan === 'string') {
            setUserPlan(plan);
          }
          
          // Check save limits
          const totalSaved = likedProducts.length + starredProducts.length + bookmarkedProducts.length;
          
          if (((typeof plan === 'string' && plan === 'basic') && totalSaved >= 5) || 
              ((typeof plan === 'string' && plan === 'standard') && totalSaved >= 50)) {
            setShowUpgradeDialog(true);
          }
        }
      }
    };

    checkAuth();
  }, [loading, user, router, checkSubscription, likedProducts.length, starredProducts.length, bookmarkedProducts.length]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle delete product
  const handleDeleteProduct = (type: string, productId: string) => {
    if (type === 'like') {
      setLikedProducts(prev => prev.filter(product => product.id !== productId));
    } else if (type === 'star') {
      setStarredProducts(prev => prev.filter(product => product.id !== productId));
    } else if (type === 'bookmark') {
      setBookmarkedProducts(prev => prev.filter(product => product.id !== productId));
    }
  };
  
  // Handle view note
  const handleViewNote = (product: any) => {
    setSelectedProduct(product);
    setShowNoteDialog(true);
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
        <title>保存した商品 | Seller Navi</title>
      </Head>
      
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            保存した商品
          </Typography>
          <Typography variant="body1" color="text.secondary">
            「いいね」「気になる」「素敵」に追加した商品を管理できます。
          </Typography>
          
          {/* Subscription limit indicator */}
          <Paper 
            variant="outlined" 
            sx={{ 
              mt: 2, 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={500}>
                保存済み商品数: {likedProducts.length + starredProducts.length + bookmarkedProducts.length}
                {userPlan === 'basic' && ' / 5'}
                {userPlan === 'standard' && ' / 50'}
                {userPlan === 'premium' && ' (無制限)'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userPlan === 'basic' && '基本プランでは最大5個まで保存できます'}
                {userPlan === 'standard' && 'スタンダードプランでは最大50個まで保存できます'}
                {userPlan === 'premium' && 'プレミアムプランでは無制限に保存できます'}
              </Typography>
            </Box>
            
            {userPlan !== 'premium' && (
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                onClick={() => router.push('/subscription')}
              >
                プランをアップグレード
              </Button>
            )}
          </Paper>
        </Box>
        
        {/* Tabs */}
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: 100,
              },
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Badge badgeContent={likedProducts.length} color="error" sx={{ mr: 1 }}>
                    <FavoriteIcon fontSize="small" color={tabValue === 0 ? 'error' : 'inherit'} />
                  </Badge>
                  <Typography>いいね</Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Badge badgeContent={starredProducts.length} color="warning" sx={{ mr: 1 }}>
                    <StarIcon fontSize="small" color={tabValue === 1 ? 'warning' : 'inherit'} />
                  </Badge>
                  <Typography>気になる</Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Badge badgeContent={bookmarkedProducts.length} color="primary" sx={{ mr: 1 }}>
                    <BookmarkIcon fontSize="small" color={tabValue === 2 ? 'primary' : 'inherit'} />
                  </Badge>
                  <Typography>素敵</Typography>
                </Box>
              } 
            />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        {/* Liked Products */}
        <TabPanel value={tabValue} index={0}>
          {likedProducts.length > 0 ? (
            <Grid container spacing={3}>
              {likedProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8, 
                        bgcolor: 'error.main', 
                        color: 'white',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      <FavoriteIcon fontSize="small" />
                    </Box>
                    
                    <Box sx={{ position: 'relative', height: 140, bgcolor: 'grey.100' }}>
                      {/* Image would be here */}
                      <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'grey.200'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          商品画像
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        {product.title.length > 40 ? `${product.title.substring(0, 40)}...` : product.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" color="primary" fontWeight={600}>
                          ¥{product.price.toLocaleString()}
                        </Typography>
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
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" display="block">
                        保存日: {product.savedDate}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button 
                          size="small" 
                          startIcon={<InfoIcon />}
                          onClick={() => handleViewNote(product)}
                        >
                          メモを見る
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteProduct('like', product.id)}
                        >
                          削除
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                「いいね」に保存した商品はありません
              </Typography>
              <Typography variant="body2" color="text.secondary">
                商品検索画面から「いいね」ボタンをクリックすると、ここに表示されます。
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => router.push('/search')}
              >
                商品を検索する
              </Button>
            </Box>
          )}
        </TabPanel>
        
        {/* Starred Products */}
        <TabPanel value={tabValue} index={1}>
          {starredProducts.length > 0 ? (
            <Grid container spacing={3}>
              {starredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8, 
                        bgcolor: 'warning.main', 
                        color: 'white',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      <StarIcon fontSize="small" />
                    </Box>
                    
                    <Box sx={{ position: 'relative', height: 140, bgcolor: 'grey.100' }}>
                      {/* Image would be here */}
                      <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'grey.200'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          商品画像
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        {product.title.length > 40 ? `${product.title.substring(0, 40)}...` : product.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" color="primary" fontWeight={600}>
                          ¥{product.price.toLocaleString()}
                        </Typography>
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
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" display="block">
                        保存日: {product.savedDate}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button 
                          size="small" 
                          startIcon={<InfoIcon />}
                          onClick={() => handleViewNote(product)}
                        >
                          メモを見る
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteProduct('star', product.id)}
                        >
                          削除
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                「気になる」に保存した商品はありません
              </Typography>
              <Typography variant="body2" color="text.secondary">
                商品検索画面から「気になる」ボタンをクリックすると、ここに表示されます。
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => router.push('/search')}
              >
                商品を検索する
              </Button>
            </Box>
          )}
        </TabPanel>
        
        {/* Bookmarked Products */}
        <TabPanel value={tabValue} index={2}>
          {bookmarkedProducts.length > 0 ? (
            <Grid container spacing={3}>
              {bookmarkedProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8, 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      <BookmarkIcon fontSize="small" />
                    </Box>
                    
                    <Box sx={{ position: 'relative', height: 140, bgcolor: 'grey.100' }}>
                      {/* Image would be here */}
                      <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'grey.200'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          商品画像
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        {product.title.length > 40 ? `${product.title.substring(0, 40)}...` : product.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" color="primary" fontWeight={600}>
                          ¥{product.price.toLocaleString()}
                        </Typography>
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
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" display="block">
                        保存日: {product.savedDate}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button 
                          size="small" 
                          startIcon={<InfoIcon />}
                          onClick={() => handleViewNote(product)}
                        >
                          メモを見る
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteProduct('bookmark', product.id)}
                        >
                          削除
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                「素敵」に保存した商品はありません
              </Typography>
              <Typography variant="body2" color="text.secondary">
                商品検索画面から「素敵」ボタンをクリックすると、ここに表示されます。
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => router.push('/search')}
              >
                商品を検索する
              </Button>
            </Box>
          )}
        </TabPanel>
        
        {/* Upgrade Dialog */}
        <Dialog
          open={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
        >
          <DialogTitle>保存数の上限に達しています</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {userPlan === 'basic' 
                ? '基本プランでは最大5つまでの商品しか保存できません。より多くの商品を保存するには、上位プランにアップグレードしてください。' 
                : 'スタンダードプランでは最大50個までの商品を保存できます。無制限に商品を保存するには、プレミアムプランにアップグレードしてください。'}
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
        
        {/* Note Dialog */}
        <Dialog
          open={showNoteDialog}
          onClose={() => setShowNoteDialog(false)}
        >
          <DialogTitle>メモ</DialogTitle>
          <DialogContent>
            {selectedProduct && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  {selectedProduct.title}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" paragraph>
                  {selectedProduct.note}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNoteDialog(false)}>
              閉じる
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default SavedProductsPage; 