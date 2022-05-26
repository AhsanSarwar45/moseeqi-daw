import { ChakraProvider } from "@chakra-ui/react";
import { render } from "@testing-library/react";
import { ReactNode } from "react";

import Theme from "@Theme/";

const renderWithTheme = (ui: any) => {
    const Wrapper = ({ children }: any) => (
        <ChakraProvider theme={Theme}>{children}</ChakraProvider>
    );

    return render(ui, { wrapper: Wrapper });
};

export default renderWithTheme;
