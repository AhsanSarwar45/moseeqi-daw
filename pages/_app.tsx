import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';

import Theme from '../src/components/theme';

function App({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={Theme}>
			<Component {...pageProps} />
		</ChakraProvider>
	);
}
export default App;
