import {
    useState,
    useEffect,
    useRef,
    memo,
    useCallback,
    useContext,
    ReactNode,
} from "react";
import {
    HStack,
    Icon,
    Container,
    Box,
    Flex,
    useRadioGroup,
    Button,
    IconButton,
    Tooltip,
} from "@chakra-ui/react";
import AutoSizer from "react-virtualized-auto-sizer";
import { VscClearAll } from "react-icons/vsc";
import { FixedSizeGrid as Grid } from "react-window";
import { BiMagnet, BiTrash } from "react-icons/bi";
import { TiDelete } from "react-icons/ti";

import { ButtonRadio } from "@Components/ButtonRadio";
import { MusicNotes } from "@Instruments/Instruments";
import { Track } from "@Interfaces/Track";
import { NotesModifierContext } from "@Data/NotesModifierContext";
import { GridContext } from "@Data/GridContext";
import { PlaybackState } from "@Types/Types";
import PianoRollGrid from "./PianoRollGrid";
import { Panel } from "@Interfaces/Panel";
import ToggleButton from "@Components/ToggleButton";
import { secondsPerWholeNote, wholeNoteDivisions } from "@Data/Constants";
import { BpmToBps } from "@Utility/TimeUtils";
import {
    EighthNoteIcon,
    HalfNoteIcon,
    QuarterNoteIcon,
    WholeNoteIcon,
} from "@Components/icons/Notes";

const numRows = MusicNotes.length;
const colors = MusicNotes.map((x) =>
    x.includes("#") ? "primary.600" : "primary.500"
);

interface GridCellProps {
    data: any; // TODO: Remove any
    rowIndex: number;
    columnIndex: number;
    style: any; // TODO: Remove any
}

const GridCell = memo((props: GridCellProps) => {
    const { onAddNote } = useContext(NotesModifierContext);
    const { currentPixelsPerSecond, columnWidth } = useContext(GridContext);

    const HandleOnClick = () => {
        onAddNote(
            (props.columnIndex * columnWidth) / currentPixelsPerSecond,
            props.rowIndex,
            props.data.divisor
        );
    };
    return (
        <Box
            onClick={HandleOnClick}
            bgColor={colors[props.rowIndex]}
            zIndex={500 - props.columnIndex}
            style={props.style}
            boxShadow={props.columnIndex % 8 === 7 ? "1px 0 0" : "0"}
            borderColor="primary.700"
            borderBottomWidth="1px"
            borderRightWidth="1px"
            cursor="url(https://cur.cursors-4u.net/cursors/cur-11/cur1046.cur), auto"
        />
    );
});

GridCell.displayName = "GridCell";

GridContext.displayName = "StickyGridContext";

interface PianoRollProps {
    track: Track;
    seek: number;
    bpm: number;
    setSeek: (seek: number) => void;
    playbackState: PlaybackState;
    numCols: number;
    focusedPanel: Panel;
    setFocusedPanel: (panel: Panel) => void;
}

interface DrawLengthOption {
    name: string;
    divisor: number;
    icon: ReactNode;
}

const PianoRoll = memo((props: PianoRollProps) => {
    const columnWidth = 60;
    const rowHeight = 20;
    const cellWidth = 8;
    const noteWidth = cellWidth * 8;
    const cellHeight = 6;
    const options: Array<DrawLengthOption> = [
        { name: "Whole Note", icon: <WholeNoteIcon />, divisor: 1 },
        { name: "Half Note", icon: <HalfNoteIcon />, divisor: 2 },
        { name: "Quarter Note", icon: <QuarterNoteIcon />, divisor: 4 },
        { name: "Eighth Note", icon: <EighthNoteIcon />, divisor: 8 },
    ];

    const wholeNoteWidth = columnWidth * wholeNoteDivisions;
    const pixelsPerSecond = wholeNoteWidth / secondsPerWholeNote;

    const [isSnappingOn, setIsSnappingOn] = useState(true);
    const [selectedDrawLengthIndex, setSelectedDrawLengthIndex] = useState(2);
    const [currentPixelsPerSecond, setCurrentPixelsPerSecond] = useState(
        pixelsPerSecond * BpmToBps(props.bpm)
    );

    const { onClearNotes } = useContext(NotesModifierContext);

    const hasScrolledRef = useRef(false);

    const gridRef = useCallback((node: any) => {
        if (node !== null && !hasScrolledRef.current) {
            node.scrollToItem({
                columnIndex: 0,
                rowIndex: 57,
            });
            hasScrolledRef.current = true;
        }
        window.addEventListener("keydown", function (e) {
            if (e.keyCode == 32) {
                e.preventDefault();
            }
        });
    }, []);

    useEffect(() => {
        setCurrentPixelsPerSecond(pixelsPerSecond * BpmToBps(props.bpm));
    }, [pixelsPerSecond, props.bpm, wholeNoteWidth]);

    const OnKeyDown = (key: string) => {
        props.track.sampler.triggerAttack([key]);
    };

    const OnNoteClick = (key: string, duration: number) => {
        props.track.sampler.triggerAttackRelease(key, duration);
        console.log("Duration: " + duration);
    };

    const OnKeyUp = (key: string) => {
        props.track.sampler.triggerRelease([key]);
    };

    return (
        <Flex
            height="100%"
            flexDirection="column"
            width="full"
            onClick={() => props.setFocusedPanel(Panel.PianoRoll)}
        >
            <HStack
                w="full"
                // height="20px"
                flexShrink={0}
                padding={2}
                spacing={2}
                bg="brand.primary"
                position="sticky"
                left={0}
            >
                <HStack spacing={0}>
                    {options.map((option, index) => {
                        // const name = value;
                        return (
                            <ToggleButton
                                tooltipLabel={option.name}
                                key={option.name}
                                onClick={() =>
                                    setSelectedDrawLengthIndex(index)
                                }
                                icon={option.icon}
                                isToggled={index === selectedDrawLengthIndex}
                            />
                        );
                    })}
                </HStack>
                <Button
                    aria-label="Clear notes"
                    colorScheme={"secondary"}
                    onClick={onClearNotes}
                    size="sm"
                    fontWeight={400}
                    fontSize="md"
                    leftIcon={<Icon as={BiTrash} />}
                >
                    Clear
                </Button>
                <ToggleButton
                    tooltipLabel={"Snap to grid"}
                    onClick={() => setIsSnappingOn(!isSnappingOn)}
                    icon={<Icon as={BiMagnet} />}
                    isToggled={isSnappingOn}
                />
            </HStack>
            <Container
                margin={0}
                padding={0}
                height="full"
                width="full"
                maxWidth="full"
                overflow="hidden"
            >
                <AutoSizer>
                    {({ height, width }: { height: number; width: number }) => (
                        <GridContext.Provider
                            value={{
                                stickyHeight: 30,
                                stickyWidth: 150,
                                columnWidth: columnWidth,
                                rowHeight: rowHeight,
                                gridWidth: columnWidth * props.numCols,
                                gridHeight: rowHeight * MusicNotes.length,
                                isSnappingOn: isSnappingOn,
                                onKeyDown: OnKeyDown,
                                onKeyUp: OnKeyUp,
                                playbackState: props.playbackState,
                                seek: props.seek,
                                setSeek: props.setSeek,
                                parts: props.track.parts,
                                onFilledNoteClick: OnNoteClick,
                                currentPixelsPerSecond: currentPixelsPerSecond,
                                pixelsPerSecond: pixelsPerSecond,
                            }}
                        >
                            <Grid
                                ref={gridRef}
                                columnCount={props.numCols}
                                rowCount={numRows}
                                height={height}
                                width={width}
                                columnWidth={columnWidth}
                                rowHeight={rowHeight}
                                innerElementType={PianoRollGrid}
                                itemData={{
                                    divisor:
                                        options[selectedDrawLengthIndex]
                                            .divisor,
                                }}
                            >
                                {GridCell}
                            </Grid>
                        </GridContext.Provider>
                    )}
                </AutoSizer>
            </Container>
        </Flex>
    );
});

PianoRoll.displayName = "PianoRoll";

export default PianoRoll;
