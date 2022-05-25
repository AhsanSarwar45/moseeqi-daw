import { Box, HStack } from "@chakra-ui/react";
import { PianoKeys } from "@Data/Constants";
import { Dimension } from "@Interfaces/Dimensions";
import { StrDimToNum } from "@Utility/DimensionUtils";
import { memo } from "react";
import { Key } from "./Key";

interface KeysViewProps {
    width: Dimension;
    stickyHeight: Dimension;
    rowHeight: Dimension;
    onKeyDown: (label: string) => void;
    onKeyUp: (label: string) => void;
}

export const KeysView = memo((props: KeysViewProps) => {
    return (
        <Box
            position="sticky"
            left={0}
            justifyContent="start"
            alignItems="start"
            zIndex={9}
        >
            <HStack
                height={props.stickyHeight}
                bgColor="primary.500"
                position="sticky"
                top={0}
                left={0}
                width={props.width}
                zIndex={9300}
                marginBottom={`${0.3 * StrDimToNum(props.rowHeight) - 8}px`}
            />
            {PianoKeys.map((label, index) => (
                <Key
                    key={index}
                    index={index}
                    label={label}
                    width={StrDimToNum(props.width)}
                    height={StrDimToNum(props.rowHeight)}
                    onKeyDown={props.onKeyDown}
                    onKeyUp={props.onKeyUp}
                />
            ))}
        </Box>
    );
});

KeysView.displayName = "KeysView";
