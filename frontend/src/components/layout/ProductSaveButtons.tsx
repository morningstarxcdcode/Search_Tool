import React, { useState, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Badge, 
  Menu, 
  MenuItem, 
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Star, 
  StarBorder, 
  BookmarkBorder, 
  Bookmark,
  Lock
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

interface ProductSaveButtonsProps {
  productId: string;
  productTitle: string;
}

const ProductSaveButtons: React.FC<ProductSaveButtonsProps> = ({ productId, productTitle }) => {
  const { user, checkSubscription, canUseCustomTags } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [canUseStars, setCanUseStars] = useState(false);
  
  // Check user's subscription plan
  useEffect(() => {
    const checkUserPlan = async () => {
      if (user) {
        const plan = await checkSubscription();
        if (typeof plan === 'string') {
          setUserPlan(plan);
        }
        
        // Check if user can use custom tags (which includes starring)
        const canUseTagging = await canUseCustomTags();
        setCanUseStars(canUseTagging);
      }
    };
    
    checkUserPlan();
  }, [user, checkSubscription, canUseCustomTags]);
  
  // Check if the action is allowed based on the subscription plan
  const canSaveProduct = async (type: 'like' | 'star' | 'bookmark') => {
    if (!userPlan) return false;
    
    // Star feature is only available for standard and premium plans
    if (type === 'star' && !canUseStars) {
      return false;
    }
    
    // Basic users can save up to 5 products
    // Standard users can save up to 50 products
    // Premium users can save unlimited products
    const savedLimit = {
      'basic': 5,
      'standard': 50,
      'premium': Infinity
    };
    
    // For demo purposes, we'll assume the user hasn't reached their limit yet
    return true;
  };
  
  const handleSaveClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleSave = async (type: 'like' | 'star' | 'bookmark') => {
    // Check if user can save products
    const canSave = await canSaveProduct(type);
    if (!canSave) {
      setShowUpgradeDialog(true);
      handleClose();
      return;
    }
    
    // Save product based on type
    switch (type) {
      case 'like':
        setLiked(!liked);
        setSnackbarMessage(!liked ? '「いいね」に追加しました' : '「いいね」から削除しました');
        break;
      case 'star':
        setStarred(!starred);
        setSnackbarMessage(!starred ? '★に追加しました' : '★から削除しました');
        break;
      case 'bookmark':
        setBookmarked(!bookmarked);
        setSnackbarMessage(!bookmarked ? '「素敵」に追加しました' : '「素敵」から削除しました');
        break;
    }
    
    setShowSnackbar(true);
    handleClose();
  };
  
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="保存">
          <IconButton 
            color="primary" 
            onClick={handleSaveClick}
            size="small"
          >
            <Badge 
              color="primary" 
              variant="dot" 
              invisible={!liked && !starred && !bookmarked}
            >
              <BookmarkBorder fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleSave('like')}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {liked ? (
              <Favorite fontSize="small" color="error" sx={{ mr: 1 }} />
            ) : (
              <FavoriteBorder fontSize="small" sx={{ mr: 1 }} />
            )}
            <Typography variant="body2">いいね</Typography>
          </Box>
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleSave('star')}
          disabled={!canUseStars}
          sx={{ 
            opacity: canUseStars ? 1 : 0.7,
            '&.Mui-disabled': {
              opacity: 0.7
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!canUseStars && (
              <Lock fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
            )}
            {starred && canUseStars ? (
              <Star fontSize="small" color="warning" sx={{ mr: 1 }} />
            ) : (
              <StarBorder fontSize="small" sx={{ mr: 1 }} />
            )}
            <Typography variant="body2">★ 付ける</Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={() => handleSave('bookmark')}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {bookmarked ? (
              <Bookmark fontSize="small" color="primary" sx={{ mr: 1 }} />
            ) : (
              <BookmarkBorder fontSize="small" sx={{ mr: 1 }} />
            )}
            <Typography variant="body2">素敵</Typography>
          </Box>
        </MenuItem>
      </Menu>
      
      {/* Snackbar for feedback */}
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
      
      {/* Upgrade Dialog */}
      <Dialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
      >
        <DialogTitle>保存機能の制限</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {userPlan === 'basic' 
              ? '基本プランでは最大5つまでの商品を保存できます。またいいねのみ利用可能です。★機能を利用するには、スタンダードプラン以上へのアップグレードが必要です。' 
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
    </>
  );
};

export default ProductSaveButtons; 