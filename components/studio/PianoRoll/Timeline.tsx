import { Box, Flex, HStack } from "@chakra-ui/react";
import { PianoKeys } from "@data/Constants";
import SeekHandle from "../SeekHandle";
import Ruler from "@scena/react-ruler";
import Theme from "@Theme/index.ts";
import { Dimension } from "@Types/Types";
import { StrDimToNum } from "@logic/dimension";
import {
    blackKeyHeightModifier,
    blackKeyWidthModifier,
    wholeNoteDivisions,
} from "@data/Constants";

interface TimelineProps {
    gridHeight: Dimension;
    height: Dimension;
    stickyWidth: Dimension;
    width: Dimension;
    columnWidth: number;
}

export const Timeline = (props: TimelineProps) => {
    return (
        <Box
            height={props.height}
            padding="0px"
            width={props.width}
            position="sticky"
            top={0}
            zIndex={8}
        >
            <SeekHandle
                height={props.gridHeight}
                scale={props.columnWidth / 5}
            />
            <Ruler
                type="horizontal"
                unit={1}
                zoom={wholeNoteDivisions * props.columnWidth}
                // ref={scaleGridTop}
                backgroundColor={Theme.colors.primary[600]}
                segment={wholeNoteDivisions}
            />
        </Box>
    );
};
