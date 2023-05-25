import { Box, ChakraProps, Flex } from "@chakra-ui/react";
import { selectSetFocusArea, useFocusAreaStore } from "@data/stores/focus-area";
import { Panel } from "@Interfaces/enums/Panel";
import React, { HTMLAttributes, ReactNode } from "react";

interface FocusAreaProps extends ChakraProps {
    children?: ReactNode;
    panel: Panel;
}

export const FocusArea = (props: FocusAreaProps) => {
    const { children, panel, ...rest } = props;

    const setFocusArea = useFocusAreaStore(selectSetFocusArea);

    return (
        <Box {...rest} onMouseDown={() => setFocusArea(panel)}>
            {children}
        </Box>
    );
};
export const FlexFocusArea = (props: FocusAreaProps) => {
    const { children, panel, ...rest } = props;

    const setFocusArea = useFocusAreaStore(selectSetFocusArea);

    return (
        <Flex {...rest} onMouseDown={() => setFocusArea(panel)}>
            {children}
        </Flex>
    );
};
