import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  FileDownload as FileDownloadIcon,
  History as HistoryIcon,
  Label as LabelIcon,
  SmartToy as SmartToyIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface Plan {
  name: string;
  price: string;
  description: string;
  features: {
    [key: string]: boolean | number;
  };
  buttonText: string;
  buttonVariant: 'contained' | 'outlined';
  popular?: boolean;
}

const features: Feature[] = [
  {
    name: 'ランキング検索',
    description: '商品の売上ランキングを検索・分析',
    icon: <SearchIcon />
  },
  {
    name: '競合分析',
    description: '競合商品の詳細な分析',
    icon: <AnalyticsIcon />
  },
  {
    name: 'CSVエクスポート',
    description: 'データをCSV形式でダウンロード',
    icon: <FileDownloadIcon />
  },
  {
    name: '検索履歴保存',
    description: '過去の検索結果を保存・参照',
    icon: <HistoryIcon />
  },
  {
    name: 'カスタムタグ',
    description: '商品に独自のタグを付与',
    icon: <LabelIcon />
  },
  {
    name: 'AIアシスタント',
    description: 'AIによる商品分析サポート',
    icon: <SmartToyIcon />
  },
  {
    name: '優先サポート',
    description: '24時間以内のサポート対応',
    icon: <SupportIcon />
  }
];

const plans: Plan[] = [
  {
    name: 'ベーシック',
    price: '¥0',
    description: '基本的な機能を無料でお試し',
    features: {
      'ランキング検索': 3,
      '競合分析': 3,
      'CSVエクスポート': false,
      '検索履歴保存': false,
      'カスタムタグ': false,
      'AIアシスタント': false,
      '優先サポート': false
    },
    buttonText: '無料で始める',
    buttonVariant: 'outlined'
  },
  {
    name: 'スタンダード',
    price: '¥4,980',
    description: '月額',
    features: {
      'ランキング検索': 50,
      '競合分析': 50,
      'CSVエクスポート': 5,
      '検索履歴保存': 7,
      'カスタムタグ': false,
      'AIアシスタント': false,
      '優先サポート': false
    },
    buttonText: 'スタンダードプランに申し込む',
    buttonVariant: 'contained',
    popular: true
  },
  {
    name: 'プレミアム',
    price: '¥9,980',
    description: '月額',
    features: {
      'ランキング検索': Infinity,
      '競合分析': Infinity,
      'CSVエクスポート': Infinity,
      '検索履歴保存': Infinity,
      'カスタムタグ': true,
      'AIアシスタント': true,
      '優先サポート': true
    },
    buttonText: 'プレミアムプランに申し込む',
    buttonVariant: 'contained'
  }
];

const FeaturesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  const getFeatureValue = (value: boolean | number) => {
    if (typeof value === 'boolean') {
      return value ? <CheckIcon color="success" /> : <CloseIcon color="error" />;
    }
    return value === Infinity ? '無制限' : `${value}回`;
  };

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            プランと機能
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            あなたのビジネスに最適なプランを選んでください
          </Typography>
        </Box>

        {/* Features Overview */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: 'primary.main', mr: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3">
                      {feature.name}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pricing Plans */}
        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  ...(plan.popular && {
                    border: `2px solid ${theme.palette.primary.main}`,
                    transform: isMobile ? 'none' : 'scale(1.05)',
                    zIndex: 1
                  })
                }}
              >
                {plan.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderBottomLeftRadius: 8
                    }}
                  >
                    <Typography variant="subtitle2">人気</Typography>
                  </Box>
                )}
                <CardHeader
                  title={plan.name}
                  subheader={plan.description}
                  titleTypographyProps={{ align: 'center', variant: 'h4' }}
                  subheaderTypographyProps={{ align: 'center' }}
                  sx={{ pb: 0 }}
                />
                <CardContent>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                      {plan.price}
                    </Typography>
                  </Box>
                  <List>
                    {features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getFeatureValue(plan.features[feature.name])}
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature.name}
                          secondary={typeof plan.features[feature.name] === 'number' && 
                            plan.features[feature.name] !== Infinity ? 
                            `${plan.features[feature.name]}回まで` : ''}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                      component={Link}
                      href={user ? '/subscription' : '/signup'}
                      variant={plan.buttonVariant}
                      color="primary"
                      fullWidth
                      size="large"
                    >
                      {plan.buttonText}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FAQ Section */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            よくある質問
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                プランの変更はいつでも可能ですか？
              </Typography>
              <Typography color="text.secondary">
                はい、いつでもプランをアップグレードまたはダウングレードすることができます。
                変更は即時に反映されます。
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                解約はいつでも可能ですか？
              </Typography>
              <Typography color="text.secondary">
                はい、いつでも解約することができます。
                解約後も、支払い済みの期間はサービスを利用できます。
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesPage; 