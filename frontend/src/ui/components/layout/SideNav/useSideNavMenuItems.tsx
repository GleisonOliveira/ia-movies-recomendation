import { useMemo, type ReactElement } from 'react';
import { type SxProps } from '@mui/material';
import { ExpandMore, Menu } from '@mui/icons-material';
import MovieIcon from '@mui/icons-material/LocalMovies';
import PeopleIcon from '@mui/icons-material/People';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleCollapsed } from '@/store/sidenav/sidenavSlice';

export type SideNavTabKey = 'users' | 'movies';

export type UseSideNavMenuItemsReturn = {
  active: SideNavTabKey;
  collapsed: boolean;
  collapsedIcon: ReactElement;
  expandedIcon: ReactElement;
  iconSx: SxProps;
  onToggleCollapsed: () => void;
  onGoUsers: () => void;
  onGoMovies: () => void;
  items: Array<{
    key: SideNavTabKey;
    activeKey: SideNavTabKey;
    label: string;
    icon: ReactElement;
    onClick: () => void;
  }>;
};

export function useSideNavMenuItems(): UseSideNavMenuItemsReturn {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const collapsed = useAppSelector((s) => s.sidenav.collapsed);

  const active: SideNavTabKey = location.pathname === '/movies' ? 'movies' : 'users';

  const collapsedIcon = useMemo(() => <Menu />, []);
  const expandedIcon = useMemo(() => <ExpandMore />, []);

  const iconSx = useMemo(
    () => ({
      width: 40,
      minWidth: 40,
      mr: collapsed ? 0 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [collapsed],
  );

  return {
    active,
    collapsed,
    collapsedIcon,
    expandedIcon,
    iconSx,
    onToggleCollapsed: () => dispatch(toggleCollapsed()),
    onGoUsers: () => {
      void navigate({ to: '/users' });
    },
    onGoMovies: () => {
      void navigate({ to: '/movies' });
    },
    items: [
      {
        key: 'users',
        activeKey: 'users',
        label: 'Usuários',
        icon: <PeopleIcon />,
        onClick: () => {
          void navigate({ to: '/users' });
        },
      },
      {
        key: 'movies',
        activeKey: 'movies',
        label: 'Filmes',
        icon: <MovieIcon />,
        onClick: () => {
          void navigate({ to: '/movies' });
        },
      },
    ],
  };
}

// Ícones e configs de itens ficam no composable.
