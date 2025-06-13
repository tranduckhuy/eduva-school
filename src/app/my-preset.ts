import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      DEFAULT: '#2093e7',
      50: '#f0f9ff',
      100: '#d9f0fb',
      200: '#b6e4f7',
      300: '#81d2f1',
      400: '#4dbfe9',
      500: '#2093e7',
      600: '#157cd9',
      700: '#115fb8',
      800: '#0e4b92',
    },
    secondary: {
      DEFAULT: '#3371ed',
      50: '#f3f7ff',
      100: '#e2ebfd',
      200: '#cddcfb',
      300: '#aed9f9',
      400: '#7dc1f6',
      500: '#3371ed',
      600: '#265cd6',
      700: '#1d48b3',
      800: '#163990',
    },
  },
  components: {
    button: {
      root: {
        fontSize: '14px',
        sm: {
          fontSize: '14px',
          paddingX: '20px',
        },
      },
      colorScheme: {
        light: {
          text: {
            primary: {
              hoverBackground: 'transparent',
              activeBackground: 'transparent',
              color: '#000',
            },
          },
        },
      },
    },
  },
});
