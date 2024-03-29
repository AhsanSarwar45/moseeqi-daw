import { Box, Flex, HStack } from "@chakra-ui/react";

import SeekHandle from "../seek-handle";
import Ruler from "@scena/react-ruler";
import Theme from "@theme/index";
import { Dimension } from "@custom-types/types";
import { wholeNoteDivisions } from "@data/constants";

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
