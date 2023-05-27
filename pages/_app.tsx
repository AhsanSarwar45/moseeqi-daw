import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";

import Theme from "@theme/index";

import "@styles/globals.css";
import "@styles/knob.css";
import "@styles/resizable.css";

function App({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider theme={Theme}>
            <Component {...pageProps} />
        </ChakraProvider>
    );
}
export default App;
