import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app'
import theme from '../shared/theme';
import WSProvider from '../features/room/wsProvider';

function Root({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme} resetCSS>
      <WSProvider shouldConnect>
        <Component {...pageProps} />
      </WSProvider>
    </ChakraProvider>
  )
}

export default Root;
