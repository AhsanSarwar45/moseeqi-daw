import { forwardRef, memo, useContext, useMemo, useRef, useState } from "react";
import { Box, Flex, HStack } from "@chakra-ui/react";
import { MusicNotes } from "@Instruments/Instruments";
import { CellCoordinates } from "@Interfaces/CellProps";
import SeekHandle from "./SeekHandle";
import Ruler from "@scena/react-ruler";
import Theme from "@Theme/index.ts";
import { GridContext } from "@Data/GridContext";
import { Dimension } from "@Interfaces/Dimensions";
import { StrDimToNum } from "@Utility/DimensionUtils";
import {
    blackKeyHeightModifier,
    blackKeyWidthModifier,
    wholeNoteDivisions,
} from "@Data/Constants";

// const PianoRollGrid = forwardRef(({ children, ...rest }: any, ref) => {
//     const props = useContext(GridContext);

//     const [minRow, maxRow, minColumn, maxColumn] = GetRenderedCursor(children); // TODO maybe there is more elegant way to get this

//     const leftSideRows = ColumnsBuilder(
//         minRow,
//         maxRow,
//         props.rowHeight,
//         props.stickyWidth,
//         MusicNotes
//     );
//     const containerStyle = {
//         ...rest.style,
//         width: `${parseFloat(rest.style.width) + props.stickyWidth}px`,
//         height: `${parseFloat(rest.style.height) + props.stickyHeight}px`,
//     };
//     const containerProps = { ...rest, style: containerStyle };

//     return (
//         <Box
//             ref={ref}
//             {...containerProps}
//             bgColor="primary.600"

//             // sx={ScrollbarStyle}
//         >
//             <StickyHeader
//                 headerWidth={props.gridWidth}
//                 stickyHeight={props.stickyHeight}
//                 stickyWidth={props.stickyWidth}
//                 playbackState={props.playbackState}
//                 seek={props.seek}
//                 setSeek={props.setSeek}
//             />
//             <StickyColumns
//                 rows={leftSideRows}
//                 stickyHeight={props.stickyHeight}
//                 stickyWidth={props.stickyWidth}
//                 onKeyDown={props.onKeyDown}
//                 onKeyUp={props.onKeyUp}
//             />

//             <Box
//                 position="absolute"
//                 top={props.stickyHeight}
//                 left={props.stickyWidth}
//             >
//                 {children}
//             </Box>

//             <Box
//                 position="absolute"
//                 top={props.stickyHeight}
//                 left={props.stickyWidth}
//                 zIndex={600}
//             >
//                 {props.parts.map((part, partIndex) => (
//                     <PianoRollPartView
//                         key={partIndex}
//                         part={part}
//                         partIndex={partIndex}
//                     />
//                 ))}
//             </Box>
//         </Box>
//     );
// });

// PianoRollGrid.displayName = "PianoRollGrid";

interface KeyProps {
    label: string;
    index: number;
    width: number;
    height: number;
    onKeyDown: (label: string) => void;
    onKeyUp: (label: string) => void;
}

enum KeyType {
    White,
    Black,
}

const BlackKeyOffsets = [
    { name: "A#", offset: 1 / 3 },
    { name: "C#", offset: 2 / 3 },
    { name: "D#", offset: 1 / 3 },
    { name: "F#", offset: 2 / 3 },
    { name: "G#", offset: 1 / 2 },

    { name: "B", offset: 2 / 3 },
    { name: "E", offset: 2 / 3 },
    { name: "C", offset: 0 },
    { name: "D", offset: 1 / 3 },
    { name: "F", offset: 0 },
    { name: "G", offset: 1 / 3 },
];

const Key = (props: KeyProps) => {
    const type = useRef<KeyType>(
        props.label.includes("#") ? KeyType.Black : KeyType.White
    );

    const offset = useMemo<KeyType>(() => {
        const keyOffsetIndex = BlackKeyOffsets.findIndex((key) =>
            props.label.includes(key.name)
        );

        if (keyOffsetIndex === -1) {
            return blackKeyHeightModifier * 0.5 * props.height;
        } else {
            return (
                blackKeyHeightModifier *
                BlackKeyOffsets[keyOffsetIndex].offset *
                props.height
            );
        }
    }, [props.height, props.label]);

    return (
        <Flex
            position="relative"
            paddingLeft="10px"
            border="1px solid gray"
            boxSizing="border-box"
            cursor="pointer"
            userSelect="none"
            onMouseDown={() => props.onKeyDown(props.label)}
            onMouseUp={() => props.onKeyUp(props.label)}
            justifyContent="right"
            alignItems="center"
            paddingRight="5px"
            borderRightRadius="md"
            fontSize="xs"
            bgColor={type.current === KeyType.White ? "white" : "black"}
            textColor={type.current === KeyType.White ? "black" : "white"}
            height={`${
                type.current === KeyType.White
                    ? props.height
                    : props.height * blackKeyHeightModifier
            }px`}
            width={`${
                type.current === KeyType.White
                    ? props.width
                    : props.width * blackKeyWidthModifier
            }px`}
            marginTop={`${-offset}px`}
            zIndex={type.current === KeyType.White ? 1 : 2}
            // sx={pianoOctaveStyles[index % 12]}
        >
            {props.label}
        </Flex>
    );
};

interface RowProps {
    label: string;
    height: number;
}

export const Row = (props: RowProps) => {
    const type = useRef<KeyType>(
        props.label.includes("#") ? KeyType.Black : KeyType.White
    );

    const isTopBorderVisible = useRef(
        props.label.includes("C") || props.label.includes("F")
    );

    return (
        <Box
            bgColor={
                type.current === KeyType.White ? "primary.500" : "primary.600"
            }
            height={props.height}
            width={"full"}
            borderColor={"primary.600"}
            boxSizing="border-box"
            borderTopWidth={isTopBorderVisible.current ? "1px" : "0px"}
            // sx={pianoOctaveStyles[index % 12]}
        />
    );
};

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
                // width="full"
                bgColor="primary.500"
                // borderRight="1px solid gray"
                position="sticky"
                top={0}
                left={0}
                width={props.width}
                zIndex={9300}
                marginBottom={`${0.3 * StrDimToNum(props.rowHeight) - 8}px`}
            />
            {MusicNotes.map((label, index) => (
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

export const TimeLine = (props: TimelineProps) => {
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
                scale={12}
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
