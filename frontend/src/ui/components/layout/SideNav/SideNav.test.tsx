import '@jest/globals';

import { fireEvent, screen } from '@testing-library/react';
import { SideNav } from './SideNav';
import { renderWithStore } from '@/test/testUtils';
import { sidenavReducer } from '@/store/sidenav/sidenavSlice';

const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

function renderSideNav(preloadedCollapsed: boolean) {
  return renderWithStore(<SideNav />, {
    reducer: { sidenav: sidenavReducer },
    preloadedState: { sidenav: { collapsed: preloadedCollapsed } },
  });
}

describe('SideNav', () => {
  it('shows labels when not collapsed', () => {
    mockUseLocation.mockReturnValue({ pathname: '/users' });
    renderSideNav(false);

    expect(screen.getByText('Navegação')).toBeInTheDocument();
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Filmes')).toBeInTheDocument();
    expect(screen.getByText('Navegação')).toBeVisible();
  });

  it('hides labels when collapsed', () => {
    mockUseLocation.mockReturnValue({ pathname: '/users' });
    renderSideNav(true);

    expect(screen.getByText('Navegação')).not.toBeVisible();
    expect(screen.getByText('Usuários')).not.toBeVisible();
    expect(screen.getByText('Filmes')).not.toBeVisible();
  });

  it('toggles collapsed state when clicking on the first navigation button', () => {
    mockUseLocation.mockReturnValue({ pathname: '/users' });
    renderSideNav(true);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]!);

    expect(screen.getByText('Navegação')).toBeVisible();
  });
});
