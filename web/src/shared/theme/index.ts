import { extendTheme, ColorModeOptions } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';

const fonts = { mono: `'Menlo', monospace`, body: 'Lato, sans-serif' };

const breakpoints = createBreakpoints({
  sm: '40em',
  md: '52em',
  lg: '64em',
  xl: '80em',
});

const config: ColorModeOptions = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.75rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '5rem',
  '9xl': '9rem',
};

const fontWeights = {
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

const colors = {
  black: '#16161D',
  radical_red: '#FA2B56',
  torea_bay: '#0F358E',
  primary: {
    400: '#709BE7',
    600: '#FFAEAB',
    700: '#0F358E',
    800: '#FF4D4D',
    900: '#D92929',
  },
  accent: {
    400: '#79F2E2',
  },
  secondary: {
    600: '#FA2B56',
    700: '#F91C3D',
  },
  grays: {
    0: '#FFFFFF',
    100: '#F9FCFB',
    200: '#EAEBEA',
    300: '#DDDEDD',
    400: '#BBBDBB',
    500: '#838583',
    600: '#656665',
    700: '#131C13',
    800: '#282928',
    900: '#030503',
  },
};

const sizes = {
  container: {
    full: '100vw',
  },
};

const theme = extendTheme({
  config,
  sizes,
  fontWeights,
  fontSizes,
  colors,
  fonts,
  breakpoints,
});

export default theme;

