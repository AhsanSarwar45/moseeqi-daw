import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';

import Theme from '@Theme/index';

import '@Styles/globals.css';
import '@Styles/Knob.css';
import '@Styles/Resizable.css';

function App({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={Theme}>
			<Component {...pageProps} />
		</ChakraProvider>
	);
}
export default App;
