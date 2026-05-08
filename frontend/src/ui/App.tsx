import { CssBaseline, GlobalStyles, ThemeProvider, createTheme } from '@mui/material';
import { AppProviders } from './providers/AppProviders';
import { AppRouterProvider } from './router/router';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#d6d6d6', contrastText: '#0a0a0a' },
    secondary: { main: '#a6a6a6' },
    background: { default: '#07070b', paper: '#0f0f16' },
    text: { primary: '#f4f4f6', secondary: '#a8a8b3' },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 800,
        },
        contained: {
          backgroundColor: 'var(--app-danger)',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: 'var(--app-danger-dark-20)',
          },
        },
        outlined: {
          borderColor: 'rgba(255,59,48,0.75)',
          borderWidth: 2,
          borderStyle: 'solid',
          color: '#ffffff',
          '&:hover': {
            borderColor: 'rgba(255,59,48,0.95)',
            backgroundColor: 'var(--app-danger-dark-20)',
          },
        },
        text: {
          color: '#ffffff',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.06)',
          },
        },
      },
    },
  },
});

export function App() {
  return (
    <AppProviders>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            ':root': {
              '--app-bg-0': '#07070b',
              '--app-bg-1': '#0f0f16',
              '--app-surface': '#0f0f16',
              '--app-surface-2': 'rgba(255,255,255,0.04)',
              '--app-surface-3': 'rgba(255,255,255,0.06)',
              '--app-border': 'rgba(255,255,255,0.10)',
              '--app-border-2': 'rgba(255,255,255,0.16)',
              '--app-text': '#f4f4f6',
              '--app-text-secondary': '#a8a8b3',
              '--app-accent': '#d6d6d6',
              '--app-danger': '#ff3b30',
              '--app-danger-2': '#e1271a',
              '--app-danger-dark-20': '#cc2f26',
            },
            body: { backgroundColor: 'var(--app-bg-0)' },
          }}
        />
        <AppRouterProvider />
      </ThemeProvider>
    </AppProviders>
  );
}
