import { Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useSideNavMenuItems } from './useSideNavMenuItems';

export function SideNavMenuItems() {
  const { active, collapsed, collapsedIcon, expandedIcon, iconSx, onToggleCollapsed, items } = useSideNavMenuItems();

  return (
    <>
      <List disablePadding>
        <ListItemButton
          onClick={onToggleCollapsed}
          sx={{
            borderRadius: 0,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 0 : 1,
            mb: 0.5,
            mt: 0,
          }}
        >
          <ListItemIcon sx={iconSx}>{collapsed ? collapsedIcon : expandedIcon}</ListItemIcon>
          <Collapse orientation="horizontal" in={!collapsed}>
            <ListItemText primary="Navegação" sx={{ opacity: 0.85 }} />
          </Collapse>
        </ListItemButton>
      </List>

      <List disablePadding>
        {items.map((item) => (
          <ListItemButton
            key={item.key}
            onClick={item.onClick}
            selected={active === item.activeKey}
            sx={{
              borderRadius: 0,
              mb: 0.5,
              px: collapsed ? 0 : 1,
              justifyContent: collapsed ? 'center' : 'flex-start',
              mt: 0,
            }}
          >
            <ListItemIcon sx={iconSx}>{item.icon}</ListItemIcon>
            <Collapse orientation="horizontal" in={!collapsed}>
              <ListItemText primary={item.label} />
            </Collapse>
          </ListItemButton>
        ))}
      </List>
    </>
  );
}
