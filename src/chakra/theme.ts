import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
  fonts: {
    body: 'var(--font-opensans)',
  },
  styles: {
    global: () => ({
      body: {
        bg: "gray.200",
      }
    }),
  },
  components: {
    // Button:
  }
})
