import { fireEvent, screen } from '@testing-library/react';
import { SideNavMenuItems } from './SideNavMenuItems';
import { renderWithStore } from '@/test/testUtils';
import { sidenavReducer } from '@/store/sidenav/sidenavSlice';

const mockNavigate = jest.fn();

const mockUseLocation = jest.fn();

jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

function renderMenuItems(preloadedCollapsed: boolean) {
  return renderWithStore(<SideNavMenuItems />, {
    reducer: { sidenav: sidenavReducer },
    preloadedState: { sidenav: { collapsed: preloadedCollapsed } },
  });
}

describe('SideNavMenuItems', () => {
  it('renders navigation labels when not collapsed', () => {
    mockUseLocation.mockReturnValue({ pathname: '/users' });
    renderMenuItems(false);

    expect(screen.getByText('Navegação')).toBeInTheDocument();
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Filmes')).toBeInTheDocument();
  });

  it('hides labels when collapsed', () => {
    mockUseLocation.mockReturnValue({ pathname: '/users' });
    renderMenuItems(true);

    expect(screen.getByText('Navegação')).not.toBeVisible();
    expect(screen.getByText('Usuários')).not.toBeVisible();
    expect(screen.getByText('Filmes')).not.toBeVisible();
  });

  it('calls onNavigate with correct routes', () => {
    mockNavigate.mockClear();
    mockUseLocation.mockReturnValue({ pathname: '/users' });
    renderMenuItems(false);

    fireEvent.click(screen.getByText('Usuários'));
    fireEvent.click(screen.getByText('Filmes'));

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/users' });
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/movies' });
  });
});
