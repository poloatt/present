import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { FooterNavigation } from '../navigation/navigationbar';
import { 
  SettingsOutlined as SettingsIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const menuItems = [
  { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' },
  { text: 'Perfil', icon: <PersonIcon />, path: '/perfil' }
];

export function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, toggleSidebar } = useSidebar();
  const { user } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      <Header />
      <Drawer
        variant="permanent"
        anchor="right"
        open={isOpen}
        onClose={() => toggleSidebar()}
        sx={{
          '& .MuiDrawer-paper': {
            width: isOpen ? 240 : 0,
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            backgroundColor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
            position: 'fixed',
            height: '100vh',
            top: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.drawer,
            visibility: isOpen ? 'visible' : 'hidden'
          },
        }}
      >
        <Box sx={{ height: '40px' }} />
        <List sx={{ p: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 40,
                  justifyContent: isOpen ? 'initial' : 'center',
                  px: isOpen ? 2.5 : 1.5,
                  borderRadius: 1,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    '& .MuiSvgIcon-root': {
                      fontSize: 20,
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '48px',
          pb: '120px',
          pr: {
            xs: 0,
            sm: isOpen ? '240px' : 0
          },
          transition: 'padding-right 0.3s ease',
          minHeight: '100vh',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        <Box sx={{ 
          width: '100%',
          maxWidth: '100%',
          mx: 'auto',
          px: {
            xs: 0.15,
            sm: 0.3,
            md: 0.45,
            lg: 0.6
          },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Outlet />
        </Box>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <FooterNavigation />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
