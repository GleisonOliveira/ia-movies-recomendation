import { useAppSelector } from '@/store/hooks';

export type UseSideNavReturn = {
  drawerWidth: number;
};

export function useSideNav(): UseSideNavReturn {
  const widthCollapsed = 66;
  const widthExpanded = 240;

  const collapsed = useAppSelector((s) => s.sidenav.collapsed);

  const drawerWidth = collapsed ? widthCollapsed : widthExpanded;

  return { drawerWidth };
}
