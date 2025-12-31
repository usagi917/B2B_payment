'use client';

import { createTheme, alpha } from '@mui/material/styles';

// Wagyu Premium Color Palette
const wagyuColors = {
  maroon: '#5D1A1D',
  maroonLight: '#8B3538',
  maroonDark: '#3D0F11',
  gold: '#C9A227',
  goldLight: '#E8C84A',
  goldDark: '#9A7B1C',
  cream: '#F5F0E8',
  creamDark: '#E8E0D0',
  charcoal: '#0D0D0F',
  slate: '#1A1A1D',
  slateLight: '#2D2D30',
  slateLighter: '#3A3A3D',
};

const semanticColors = {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  buyer: '#60A5FA',
  producer: '#34D399',
  admin: '#A78BFA',
};

export const wagyuTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: wagyuColors.gold,
      light: wagyuColors.goldLight,
      dark: wagyuColors.goldDark,
      contrastText: wagyuColors.charcoal,
    },
    secondary: {
      main: wagyuColors.maroon,
      light: wagyuColors.maroonLight,
      dark: wagyuColors.maroonDark,
      contrastText: wagyuColors.cream,
    },
    background: {
      default: wagyuColors.charcoal,
      paper: wagyuColors.slate,
    },
    text: {
      primary: wagyuColors.cream,
      secondary: '#B8B0A0',
      disabled: '#7A7570',
    },
    success: {
      main: semanticColors.success,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: semanticColors.warning,
      contrastText: '#FFFFFF',
    },
    error: {
      main: semanticColors.error,
      contrastText: '#FFFFFF',
    },
    info: {
      main: semanticColors.info,
      contrastText: '#FFFFFF',
    },
    divider: alpha(wagyuColors.cream, 0.1),
  },
  typography: {
    fontFamily: "'Outfit', sans-serif",
    h1: {
      fontFamily: "'Noto Serif JP', serif",
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontFamily: "'Noto Serif JP', serif",
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: "'Noto Serif JP', serif",
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h4: {
      fontFamily: "'Noto Serif JP', serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Noto Serif JP', serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "'Noto Serif JP', serif",
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    body1: {
      lineHeight: 1.7,
    },
    body2: {
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    overline: {
      fontWeight: 600,
      letterSpacing: '0.15em',
      color: wagyuColors.gold,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0, 0, 0, 0.4)',
    '0 4px 12px rgba(0, 0, 0, 0.45)',
    '0 4px 16px rgba(0, 0, 0, 0.5)',
    '0 6px 20px rgba(0, 0, 0, 0.55)',
    '0 8px 24px rgba(0, 0, 0, 0.6)',
    '0 8px 32px rgba(0, 0, 0, 0.6)',
    '0 10px 36px rgba(0, 0, 0, 0.65)',
    '0 12px 40px rgba(0, 0, 0, 0.65)',
    '0 14px 44px rgba(0, 0, 0, 0.7)',
    '0 16px 48px rgba(0, 0, 0, 0.7)',
    '0 18px 52px rgba(0, 0, 0, 0.75)',
    '0 20px 56px rgba(0, 0, 0, 0.75)',
    '0 22px 60px rgba(0, 0, 0, 0.8)',
    '0 24px 64px rgba(0, 0, 0, 0.8)',
    '0 26px 68px rgba(0, 0, 0, 0.85)',
    '0 28px 72px rgba(0, 0, 0, 0.85)',
    '0 30px 76px rgba(0, 0, 0, 0.9)',
    '0 32px 80px rgba(0, 0, 0, 0.9)',
    '0 34px 84px rgba(0, 0, 0, 0.95)',
    '0 36px 88px rgba(0, 0, 0, 0.95)',
    '0 38px 92px rgba(0, 0, 0, 1)',
    '0 40px 96px rgba(0, 0, 0, 1)',
    '0 42px 100px rgba(0, 0, 0, 1)',
    '0 44px 104px rgba(0, 0, 0, 1)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${wagyuColors.slateLighter} ${wagyuColors.slate}`,
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: wagyuColors.slate,
          },
          '&::-webkit-scrollbar-thumb': {
            background: wagyuColors.slateLighter,
            borderRadius: 9999,
            border: `2px solid ${wagyuColors.slate}`,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: wagyuColors.goldDark,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${wagyuColors.gold} 0%, ${wagyuColors.goldDark} 100%)`,
          color: wagyuColors.charcoal,
          boxShadow: `0 2px 8px rgba(0, 0, 0, 0.4), 0 4px 24px ${alpha(wagyuColors.gold, 0.2)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${wagyuColors.goldLight} 0%, ${wagyuColors.gold} 100%)`,
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 16px rgba(0, 0, 0, 0.5), 0 0 40px ${alpha(wagyuColors.gold, 0.3)}`,
          },
        },
        containedSuccess: {
          background: `linear-gradient(135deg, ${semanticColors.success} 0%, #059669 100%)`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 16px rgba(0, 0, 0, 0.5), 0 0 30px ${alpha(semanticColors.success, 0.25)}`,
          },
        },
        containedError: {
          background: `linear-gradient(135deg, ${semanticColors.error} 0%, #DC2626 100%)`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 16px rgba(0, 0, 0, 0.5), 0 0 30px ${alpha(semanticColors.error, 0.3)}`,
          },
        },
        outlined: {
          borderColor: alpha(wagyuColors.cream, 0.1),
          color: '#B8B0A0',
          '&:hover': {
            borderColor: wagyuColors.gold,
            color: wagyuColors.gold,
            background: alpha(wagyuColors.gold, 0.05),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: wagyuColors.slate,
          border: `1px solid ${alpha(wagyuColors.cream, 0.1)}`,
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: alpha(wagyuColors.cream, 0.2),
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: wagyuColors.slateLight,
            borderRadius: 12,
            transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: alpha(wagyuColors.cream, 0.1),
            },
            '&:hover fieldset': {
              borderColor: alpha(wagyuColors.cream, 0.2),
            },
            '&.Mui-focused': {
              background: wagyuColors.slate,
              '& fieldset': {
                borderColor: wagyuColors.gold,
                boxShadow: `0 0 0 3px ${alpha(wagyuColors.gold, 0.2)}`,
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: '#7A7570',
            '&.Mui-focused': {
              color: wagyuColors.gold,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          background: wagyuColors.slateLight,
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 500,
          fontSize: '0.625rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        filled: {
          border: '1px solid transparent',
        },
        outlined: {
          borderColor: alpha(wagyuColors.cream, 0.1),
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 9999,
          background: wagyuColors.slateLight,
          border: `1px solid ${alpha(wagyuColors.cream, 0.1)}`,
        },
        bar: {
          borderRadius: 9999,
          background: `linear-gradient(90deg, ${wagyuColors.goldDark}, ${wagyuColors.gold}, ${wagyuColors.goldLight})`,
          backgroundSize: '200% 100%',
          animation: 'progress-shimmer 2s ease-in-out infinite',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: wagyuColors.gold,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(wagyuColors.cream, 0.05),
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: wagyuColors.slateLighter,
          border: `1px solid ${alpha(wagyuColors.gold, 0.15)}`,
          borderRadius: 8,
          fontSize: '0.75rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        },
        arrow: {
          color: wagyuColors.slateLighter,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: alpha(wagyuColors.charcoal, 0.9),
          backdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${alpha(wagyuColors.cream, 0.1)}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#B8B0A0',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            color: wagyuColors.gold,
            background: alpha(wagyuColors.gold, 0.1),
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          background: `linear-gradient(90deg, ${wagyuColors.slateLight} 25%, ${wagyuColors.slateLighter} 50%, ${wagyuColors.slateLight} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.5s ease-in-out infinite',
        },
      },
    },
  },
});

// Export colors for use in components
export { wagyuColors, semanticColors };
