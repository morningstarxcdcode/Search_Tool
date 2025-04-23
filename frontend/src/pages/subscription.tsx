import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const plans = [
  {
    id: 'basic',
    name: 'ベーシック',
    price: '2,980',
    period: '月額',
    features: [
      '基本リサーチ機能',
      '月間100件の商品検索',
      'カテゴリ別ランキング',
      'メールサポート',
    ],
    recommended: false,
  },
  {
    id: 'standard',
    name: 'スタンダード',
    price: '4,980',
    period: '月額',
    features: [
      '基本リサーチ機能',
      '月間500件の商品検索',
      'カテゴリ別ランキング',
      'キーワード分析',
      '売上予測',
      'メール・チャットサポート',
    ],
    recommended: true,
  },
  {
    id: 'premium',
    name: 'プレミアム',
    price: '9,980',
    period: '月額',
    features: [
      '基本リサーチ機能',
      '無制限の商品検索',
      'カテゴリ別ランキング',
      'キーワード分析',
      '売上予測',
      '競合分析',
      '市場動向レポート',
      '専任サポート',
    ],
    recommended: false,
  },
];

const SubscriptionPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    // In a real app, this would be an API call to process the payment
    // For demo purposes, we'll just simulate a processing delay
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to dashboard after successful subscription
      router.push('/dashboard');
    }, 2000);
  };
  
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        py: 6,
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Image
            src="/logo.png"
            alt="Seller Navi Logo"
            width={200}
            height={70}
            style={{ objectFit: 'contain' }}
          />
          
          <Typography variant="h4" component="h1" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
            サブスクリプションプラン
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            あなたのビジネスに最適なプランを選択して、eSelling Naviの機能をフル活用しましょう。
            {user && <> {user.name}様にぴったりのプランをお選びください。</>}
          </Typography>
        </Box>
        
        <Grid container spacing={3} justifyContent="center">
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  border: plan.recommended ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  }
                }}
              >
                {plan.recommended && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      py: 0.5,
                      px: 2,
                      borderTopLeftRadius: 16,
                      borderBottomLeftRadius: 16,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    おすすめ
                  </Box>
                )}
                
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                    {plan.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography variant="h4" component="span" sx={{ fontWeight: 700 }}>
                      ¥{plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      /{plan.period}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <List sx={{ mb: 2 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} dense disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={selectedPlan === plan.id ? "contained" : "outlined"}
                    color="primary"
                    size="large"
                    onClick={() => handlePlanSelect(plan.id)}
                    sx={{ py: 1 }}
                  >
                    {selectedPlan === plan.id ? "選択中" : "選択する"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={!selectedPlan || isProcessing}
            onClick={handleSubscribe}
            sx={{ py: 1.5, px: 4, minWidth: 200 }}
          >
            {isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              '申し込む'
            )}
          </Button>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            ※ クレジットカード情報の入力画面に進みます。
          </Typography>
        </Box>
        
        <Paper sx={{ mt: 8, p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            よくある質問
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600}>
                いつでもキャンセルできますか？
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                はい、いつでもキャンセル可能です。次回の請求日前までにキャンセルいただければ、追加料金は発生しません。
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600}>
                プランの変更はできますか？
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                いつでもプランのアップグレードやダウングレードが可能です。変更は即時反映され、料金は日割り計算されます。
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default SubscriptionPage; 