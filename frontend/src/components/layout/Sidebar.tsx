import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Article as ArticleIcon,
  CardGiftcard as CardGiftcardIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

// Define sidebar navigation items
const navItems = [
  {
    path: '/dashboard',
    name: 'ダッシュボード',
    icon: <DashboardIcon />,
    requiresAuth: true,
  },
  {
    path: '/search',
    name: '商品検索',
    icon: <SearchIcon />,
    requiresAuth: true,
  },
  {
    path: '/rankings',
    name: 'ランキング検索',
    icon: <BarChartIcon />,
    requiresAuth: true,
  },
  {
    path: '/saved-products',
    name: '保存した商品',
    icon: <FavoriteIcon />,
    requiresAuth: true,
  },
  // ... existing code ...
]; 