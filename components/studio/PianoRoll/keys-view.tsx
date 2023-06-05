import { Box, HStack } from "@chakra-ui/react";
import { PianoKeys } from "@data/constants";
import { Dimension } from "@custom-types/types";
import { StrDimToNum } from "@logic/dimension";
import { memo } from "react";
import Key from "./key";

interface KeysViewProps {
    width: Dimension;
    stickyHeight: Dimension;
    rowHeight: Dimension;
}
const KeysView = (props: KeysViewProps) => {
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
                bgColor="primary.600"
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
                />
            ))}
        </Box>
    );
};

export default memo(KeysView);
