import {
    useState,
    useEffect,
    useRef,
    memo,
    useCallback,
    useContext,
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

const PianoRoll = memo((props: PianoRollProps) => {
    const columnWidth = 60;
    const rowHeight = 20;
    const cellWidth = 8;
    const noteWidth = cellWidth * 8;
    const cellHeight = 6;
    const options = ["Whole", "1/2", "1/4", "1/8"];

    const wholeNoteWidth = columnWidth * wholeNoteDivisions;
    const pixelsPerSecond = wholeNoteWidth / secondsPerWholeNote;

    const [currentPixelsPerSecond, setCurrentPixelsPerSecond] = useState(
        pixelsPerSecond * BpmToBps(props.bpm)
    );

    const { onClearNotes } = useContext(NotesModifierContext);

    const [isSnappingOn, setIsSnappingOn] = useState(true);
    const [noteDivisor, setNoteDivisor] = useState(4);

    const hasScrolledRef = useRef(false);
    // const gridRef = useRef<Grid<any>>(null);

    const { getRootProps, getRadioProps } = useRadioGroup({
        name: "Note Length",
        defaultValue: "1/4",
        onChange: (value) => {
            if (value === "Whole") {
                setNoteDivisor(1);
            } else if (value === "1/2") {
                setNoteDivisor(2);
            } else if (value === "1/4") {
                setNoteDivisor(4);
            } else if (value === "1/8") {
                setNoteDivisor(8);
            }
        },
    });

    const group = getRootProps();

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
        props.track.sampler.triggerAttackRelease(key, `${duration}n`);
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
                <HStack {...group} spacing={0}>
                    {options.map((value) => {
                        const radio = getRadioProps({ value });
                        return (
                            <ButtonRadio key={value} {...radio}>
                                {value}
                            </ButtonRadio>
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
                                    divisor: noteDivisor,
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
