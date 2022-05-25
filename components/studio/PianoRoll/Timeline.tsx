import { forwardRef, memo, useContext, useMemo, useRef, useState } from "react";
import { Box, Flex, HStack } from "@chakra-ui/react";
import { PianoKeys } from "@Data/Constants";
import SeekHandle from "../SeekHandle";
import Ruler from "@scena/react-ruler";
import Theme from "@Theme/index.ts";
import { Dimension } from "@Interfaces/Dimensions";
import { StrDimToNum } from "@Utility/DimensionUtils";
import {
    blackKeyHeightModifier,
    blackKeyWidthModifier,
    wholeNoteDivisions,
} from "@Data/Constants";

interface TimelineProps {
    gridHeight: Dimension;
    height: Dimension;
    stickyWidth: Dimension;
    width: Dimension;
    columnWidth: number;
    playbackState: number;
    seek: number;
    setSeek: (seek: number) => void;
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
                playbackState={props.playbackState}
                seek={props.seek}
                scale={props.columnWidth / 5}
                setSeek={props.setSeek}
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
