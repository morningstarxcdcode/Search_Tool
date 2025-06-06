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
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import axios from 'axios';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const { user, loading, checkSubscription, updateProfile, updateNotificationSettings, changePassword } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    trendAlerts: true,
    productUpdates: false,
    marketResearch: true,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    sessionTimeout: '30'
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    plan: 'premium',
    nextBillingDate: '2025-05-15',
    cardLast4: '4242',
  });

  // Check if user is logged in and has active subscription
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        // New simplified logic without redirects
        if (user) {
          const isSubscribed = await checkSubscription();
          setHasSubscription(isSubscribed);
          
          setProfileData({
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
          });
        }
      }
    };

    checkAuth();
  }, [loading, user, router, checkSubscription]);

  // Handle tab change
  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle notification settings changes
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.checked,
    });
  };

  // Handle security settings changes
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'twoFactorAuth') {
      setSecuritySettings({
        ...securitySettings,
        twoFactorAuth: e.target.checked
      });
    } else {
      setSecuritySettings({
        ...securitySettings,
        [e.target.name]: e.target.value
      });
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    
    try {
      await updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phoneNumber
      });
      setSaveSuccess(true);
    } catch (error: any) {
      setSaveError(error.message || '設定の保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save notification settings
  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    
    try {
      await updateNotificationSettings(notificationSettings);
      setSaveSuccess(true);
    } catch (error: any) {
      setSaveError(error.message || '通知設定の保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    
    try {
      await changePassword(
        securitySettings.currentPassword,
        securitySettings.newPassword
      );
      setSaveSuccess(true);
      // Clear password fields
      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      setSaveError(error.message || 'パスワードの変更に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
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
        <title>設定 | Seller Navi</title>
      </Head>
      
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            設定
          </Typography>
          <Typography variant="body1" color="text.secondary">
            アカウント設定と各種機能の設定ができます。
          </Typography>
        </Box>
        
        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={3}>
            <SettingsSidebar selectedTab={tabValue} onTabChange={handleTabChange} />
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              {saveSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  設定が正常に保存されました。
                </Alert>
              )}
              
              {saveError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {saveError}
                </Alert>
              )}
              
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>
                  プロフィール設定
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  アカウント情報とプロフィールを管理します。
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="お名前"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="メールアドレス"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="電話番号"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? '保存中...' : 'プロフィールを保存'}
                  </Button>
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  通知設定
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  通知の受信方法と種類を設定します。
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                        name="emailNotifications"
                        color="primary"
                      />
                    }
                    label="メール通知"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                    重要な更新や機能のお知らせをメールで受け取ります。
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.trendAlerts}
                        onChange={handleNotificationChange}
                        name="trendAlerts"
                        color="primary"
                      />
                    }
                    label="トレンドアラート"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                    市場トレンドの変化や注目商品についての通知を受け取ります。
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.productUpdates}
                        onChange={handleNotificationChange}
                        name="productUpdates"
                        color="primary"
                      />
                    }
                    label="商品更新通知"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                    ウォッチリストに追加した商品の価格や在庫状況の変化を通知します。
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.marketResearch}
                        onChange={handleNotificationChange}
                        name="marketResearch"
                        color="primary"
                      />
                    }
                    label="市場調査レポート"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                    定期的な市場調査レポートをメールで受け取ります。
                  </Typography>
                </FormGroup>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                  >
                    {isSaving ? '保存中...' : '通知設定を保存'}
                  </Button>
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  セキュリティ設定
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  アカウントのセキュリティ設定を管理します。
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  パスワード変更
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="現在のパスワード"
                      type="password"
                      name="currentPassword"
                      value={securitySettings.currentPassword}
                      onChange={handleSecurityChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="新しいパスワード"
                      type="password"
                      name="newPassword"
                      value={securitySettings.newPassword}
                      onChange={handleSecurityChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="新しいパスワード（確認）"
                      type="password"
                      name="confirmPassword"
                      value={securitySettings.confirmPassword}
                      onChange={handleSecurityChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePasswordChange}
                      disabled={isSaving || !securitySettings.currentPassword || !securitySettings.newPassword || securitySettings.newPassword !== securitySettings.confirmPassword}
                      sx={{ mt: 1 }}
                    >
                      {isSaving ? '変更中...' : 'パスワードを変更'}
                    </Button>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" gutterBottom>
                  追加のセキュリティ
                </Typography>
                <FormGroup sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onChange={handleSecurityChange}
                        name="twoFactorAuth"
                        color="primary"
                      />
                    }
                    label="2段階認証を有効にする"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                    ログイン時に追加の認証コードが必要になり、セキュリティが向上します。
                  </Typography>
                </FormGroup>
                
                <Typography variant="subtitle1" gutterBottom>
                  セッション設定
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="セッションタイムアウト"
                      name="sessionTimeout"
                      value={securitySettings.sessionTimeout}
                      onChange={handleSecurityChange}
                      variant="outlined"
                      helperText="指定時間操作がない場合、自動的にログアウトします"
                    >
                      <MenuItem value="15">15分</MenuItem>
                      <MenuItem value="30">30分</MenuItem>
                      <MenuItem value="60">1時間</MenuItem>
                      <MenuItem value="120">2時間</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>
                  支払い情報
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  サブスクリプションと支払い方法を管理します。
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  現在のプラン
                </Typography>
                <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6" color="primary.main">
                        プレミアムプラン
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        すべての機能にアクセス可能なプランです。市場分析、競合情報、レポート生成などの機能が利用できます。
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button variant="outlined" color="primary">
                        プラン変更
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2">次回請求日</Typography>
                        <Typography variant="body2" fontWeight={500}>{paymentInfo.nextBillingDate}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Typography variant="subtitle1" gutterBottom>
                  支払い方法
                </Typography>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PaymentIcon sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body1">
                            クレジットカード **** **** **** {paymentInfo.cardLast4}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            有効期限: 09/25
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button variant="outlined" size="small">
                        変更
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </TabPanel>
              
              <TabPanel value={tabValue} index={4}>
                <Typography variant="h6" gutterBottom>
                  ヘルプ＆サポート
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  よくある質問やサポート情報を確認します。
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  お問い合わせ
                </Typography>
                <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
                  <Typography variant="body2" paragraph>
                    ご質問やサポートが必要な場合は、以下からお問い合わせください。
                  </Typography>
                  <Button variant="contained" color="primary">
                    サポートに問い合わせる
                  </Button>
                </Paper>
                
                <Typography variant="subtitle1" gutterBottom>
                  よくある質問
                </Typography>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      サブスクリプションはいつでもキャンセルできますか？
                    </Typography>
                    <Typography variant="body2">
                      はい、いつでもキャンセル可能です。次回の請求日前にキャンセルすれば、追加料金は発生しません。
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      データはどのように更新されますか？
                    </Typography>
                    <Typography variant="body2">
                      市場データは毎日更新されます。ランキングデータは24時間ごとに更新され、最新のトレンド情報が確認できます。
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      他のプラットフォームとの連携は可能ですか？
                    </Typography>
                    <Typography variant="body2">
                      現在はAPIを通じて主要なEコマースプラットフォームと連携可能です。設定ページから接続の設定ができます。
                    </Typography>
                  </Box>
                </Paper>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default SettingsPage; 