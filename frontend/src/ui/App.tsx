import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AppContainer } from './layout/AppContainer';
import { AppProviders } from './providers/AppProviders';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8bd3ff' },
    secondary: { main: '#ffb86c' },
    background: { default: '#0b1020', paper: '#10192f' },
  },
  shape: { borderRadius: 16 },
});

export function App() {
  return (
    <AppProviders>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContainer />
      </ThemeProvider>
    </AppProviders>
  );
}
