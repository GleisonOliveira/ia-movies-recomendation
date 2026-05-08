import { Drawer, Stack } from '@mui/material';
import { SideNavMenuItems } from './SideNavMenuItems';
import { useSideNav } from './useSideNav';

export function SideNav() {
  const { drawerWidth } = useSideNav();

  return (
  <Stack sx={{ flexShrink: 0, width: drawerWidth }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: 'var(--app-surface)',
            borderRight: '1px solid var(--app-border)',
            overflowX: 'visible',
          },
        }}
      >
        <Stack
          sx={{
            height: '100%',
            p: 0,
          }}
          spacing={2}
        >
          <SideNavMenuItems
          />
        </Stack>
      </Drawer>
    </Stack>
  );
}
