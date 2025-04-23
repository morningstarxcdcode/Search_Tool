import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Paper,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

interface SettingsSidebarProps {
  selectedTab: number;
  onTabChange: (index: number) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ selectedTab, onTabChange }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  
  const menuItems = [
    { 
      icon: <PersonIcon />,
      text: "プロフィール",
      index: 0
    },
    { 
      icon: <NotificationsIcon />,
      text: "通知設定",
      index: 1
    },
    { 
      icon: <SecurityIcon />,
      text: "セキュリティ",
      index: 2
    },
    { 
      icon: <PaymentIcon />,
      text: "支払い情報",
      index: 3
    },
    { 
      icon: <HelpIcon />,
      text: "ヘルプ＆サポート",
      index: 4,
      customStyle: {
        color: primaryColor,
        '& .MuiListItemIcon-root': {
          color: primaryColor,
        }
      }
    }
  ];

  const getMenuItemStyles = (index: number, customStyle?: any) => {
    const baseStyles = {
      borderRadius: 2,
      marginBottom: 1.5,
      padding: '12px 16px',
      color: theme.palette.text.secondary,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '& .MuiListItemIcon-root': {
        color: theme.palette.text.secondary,
        minWidth: 40,
      },
      '& .MuiListItemText-primary': {
        fontWeight: 500,
      },
      '&:last-child': {
        marginBottom: 0
      }
    };

    if (selectedTab === index) {
      return {
        ...baseStyles,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        '& .MuiListItemIcon-root': {
          color: theme.palette.common.white,
        },
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
        }
      };
    }

    if (customStyle) {
      return { ...baseStyles, ...customStyle };
    }

    return baseStyles;
  };

  return (
    <Box sx={{ 
      position: 'sticky', 
      top: 24,
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2.5,
          borderRadius: 2,
          overflow: 'hidden',
          height: '100%',
          flex: 1
        }}
      >
        <List sx={{ 
          px: 1, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Box>
            {menuItems.slice(0, -1).map((item) => (
              <ListItem
                key={item.index}
                onClick={() => onTabChange(item.index)}
                sx={getMenuItemStyles(item.index)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </Box>
          <Box>
            {menuItems.slice(-1).map((item) => (
              <ListItem
                key={item.index}
                onClick={() => onTabChange(item.index)}
                sx={getMenuItemStyles(item.index, item.customStyle)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </Box>
        </List>
      </Paper>
    </Box>
  );
};

export default SettingsSidebar; 