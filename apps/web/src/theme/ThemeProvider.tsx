'use client';

import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { wagyuTheme } from './wagyuTheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MUIThemeProvider theme={wagyuTheme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
