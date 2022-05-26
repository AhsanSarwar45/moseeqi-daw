import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useContext,
    ReactNode,
} from "react";
import { HStack, Icon, Box, Flex, VStack, ButtonGroup } from "@chakra-ui/react";
import Ruler from "@scena/react-ruler";

import { BiMagnet, BiTrash } from "react-icons/bi";

import { PianoKeys } from "@Data/Constants";
import { Track } from "@Interfaces/Track";
import { NotesModifierContext } from "@Data/NotesModifierContext";
import { PlaybackState } from "@Types/Types";
import { Panel } from "@Interfaces/Panel";
import ToggleButton from "@Components/ToggleButton";
import {
    blackKeyHeightModifier,
    secondsPerWholeNote,
    wholeNoteDivisions,
} from "@Data/Constants";
import { BpmToBps } from "@Utility/TimeUtils";
import {
    EighthNoteIcon,
    HalfNoteIcon,
    QuarterNoteIcon,
    WholeNoteIcon,
} from "@Components/icons/Notes";
import { ScrollbarStyle } from "@Styles/ScrollbarStyle";
import PianoRollPartView from "./PianoRollPartView";
import { SnapDown } from "@Utility/SnapUtils";
import { KeysView } from "./KeysView";
import { Row } from "./Row";
import { Timeline } from "./Timeline";
import TooltipButton from "@Components/TooltipButton";

interface PianoRollProps {
    track: Track;
    seek: number;
    bpm: number;
    projectLength: number;
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

const PianoRoll = (props: PianoRollProps) => {
    const columnWidth = 40;
    const whiteKeyHeight = 30;
    const stickyHeight = "30px";
    const stickyWidth = 120;
    const numNotes = PianoKeys.length;
    const numWhiteNotes = PianoKeys.filter(
        (label) => !label.includes("#")
    ).length;
    const gridHeight = numWhiteNotes * whiteKeyHeight;
    const gridCellHeight = blackKeyHeightModifier * whiteKeyHeight;

    const options: Array<DrawLengthOption> = [
        { name: "Whole Note", icon: <WholeNoteIcon />, divisor: 1 },
        { name: "Half Note", icon: <HalfNoteIcon />, divisor: 2 },
        { name: "Quarter Note", icon: <QuarterNoteIcon />, divisor: 4 },
        { name: "Eighth Note", icon: <EighthNoteIcon />, divisor: 8 },
    ];

    // console.log(numNotes, gridCellHeight);

    const wholeNoteWidth = columnWidth * wholeNoteDivisions;
    const pixelsPerSecond = wholeNoteWidth / secondsPerWholeNote;

    const { onAddNote } = useContext(NotesModifierContext);

    const [isSnappingOn, setIsSnappingOn] = useState(true);
    const [selectedDrawLengthIndex, setSelectedDrawLengthIndex] = useState(2);
    const [currentPixelsPerSecond, setCurrentPixelsPerSecond] = useState(
        pixelsPerSecond * BpmToBps(props.bpm)
    );

    const { onClearNotes } = useContext(NotesModifierContext);

    const hasScrolledRef = useRef(false);
    const clickAreaRef = useRef<any>(null);
    // const scaleGridTop = useRef<Ruler>(null);
    // const scaleGridMain = useRef<Ruler>(null);
    const scaleGridMinor = useRef<Ruler>(null);

    useEffect(() => {
        let timeScaleRefValue: Ruler | null = null;
        let timeScaleMainRefValue: Ruler | null = null;
        let timeScaleMinorRefValue: Ruler | null = null;

        window.addEventListener("resize", () => {
            //  scaleGridTop.current?.resize();
            //  scaleGridMain.current?.resize();
            scaleGridMinor.current?.resize();

            //  timeScaleRefValue = scaleGridTop.current;
            //  timeScaleMainRefValue = scaleGridMain.current;
            timeScaleMinorRefValue = scaleGridMinor.current;
        });
        return () => {
            window.removeEventListener("resize", () => {
                timeScaleRefValue?.resize();
                timeScaleMainRefValue?.resize();
                timeScaleMinorRefValue?.resize();
            });
        };
    }, []);

    const gridRef = useCallback((node: any) => {
        if (node !== null && !hasScrolledRef.current) {
            node.scrollTo(0, 550);
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
                boxShadow="md"
                zIndex={10}
            >
                <ButtonGroup
                    size="sm"
                    isAttached
                    variant="solid"
                    colorScheme="secondary"
                >
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
                                // borderWidth={0}
                            />
                        );
                    })}
                </ButtonGroup>
                <TooltipButton
                    aria-label="Clear project"
                    onClick={onClearNotes}
                    label="Clear"
                    icon={<Icon as={BiTrash} />}
                    tooltip="Clear all the notes in the piano roll"
                />

                <ToggleButton
                    tooltipLabel={"Snap to grid"}
                    onClick={() => setIsSnappingOn(!isSnappingOn)}
                    icon={<Icon as={BiMagnet} />}
                    isToggled={isSnappingOn}
                />
            </HStack>

            <HStack
                ref={gridRef}
                alignItems="flex-start"
                position="relative"
                spacing={0}
                width="full"
                height="100%"
                overflowX="scroll"
                overflowY="scroll"
                sx={ScrollbarStyle}
                bgColor="primary.600"
                zIndex={9}
            >
                <KeysView
                    width={stickyWidth}
                    stickyHeight={stickyHeight}
                    rowHeight={whiteKeyHeight}
                    onKeyDown={OnKeyDown}
                    onKeyUp={OnKeyUp}
                />

                <VStack alignItems="flex-start" spacing={0}>
                    <Timeline
                        gridHeight={gridHeight}
                        height={stickyHeight}
                        stickyWidth={stickyWidth}
                        columnWidth={columnWidth}
                        width={props.projectLength * pixelsPerSecond}
                        playbackState={props.playbackState}
                        seek={props.seek}
                        setSeek={props.setSeek}
                    />
                    <Box
                        height={gridHeight}
                        padding="0px"
                        width={props.projectLength * pixelsPerSecond}
                        marginTop={stickyHeight}
                        position="relative"
                    >
                        <Box
                            position="relative"
                            width="full"
                            height="full"
                            zIndex={1}
                        >
                            <Ruler
                                type="horizontal"
                                unit={1}
                                zoom={wholeNoteDivisions * columnWidth}
                                ref={scaleGridMinor}
                                backgroundColor={"rgba(0,0,0,0)"}
                                segment={wholeNoteDivisions}
                                mainLineSize={0}
                                shortLineSize={gridHeight}
                                longLineSize={gridHeight}
                                height={gridHeight}
                                lineColor="rgba(255,255,255,0.1)"
                                textColor="rgba(0,0,0,0)"
                            />
                        </Box>

                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            // bgColor="Red"
                            width={props.projectLength * pixelsPerSecond}
                            height={gridHeight}
                            zIndex={0}
                        >
                            {PianoKeys.map((label, index) => {
                                return (
                                    <Row
                                        key={label}
                                        height={gridCellHeight}
                                        label={label}
                                    />
                                );
                            })}
                        </Box>

                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            // bgColor="Red"
                            width={props.projectLength * pixelsPerSecond}
                            height={gridHeight}
                            zIndex={7}
                            cursor="url(https://cur.cursors-4u.net/cursors/cur-11/cur1046.cur), auto"
                        >
                            {props.track.parts.map((part, partIndex) => (
                                <PianoRollPartView
                                    key={part.id}
                                    part={part}
                                    partIndex={partIndex}
                                    rowHeight={gridCellHeight}
                                    cellWidth={columnWidth}
                                    gridHeight={gridHeight}
                                    pixelsPerSecond={pixelsPerSecond}
                                    currentPixelsPerSecond={
                                        currentPixelsPerSecond
                                    }
                                    isSnappingOn={isSnappingOn}
                                    onFilledNoteClick={OnNoteClick}
                                />
                            ))}
                            <Box
                                ref={clickAreaRef}
                                width="full"
                                height="full"
                                onClick={(event) => {
                                    const rect =
                                        clickAreaRef.current?.getBoundingClientRect();

                                    let x = event.clientX - rect?.left;
                                    const y = event.clientY - rect?.top;

                                    if (isSnappingOn) {
                                        x = SnapDown(x, columnWidth);
                                    }

                                    onAddNote(
                                        x / currentPixelsPerSecond,
                                        Math.floor(y / gridCellHeight),
                                        options[selectedDrawLengthIndex].divisor
                                    );
                                }}
                            />
                        </Box>
                    </Box>
                </VStack>
            </HStack>
        </Flex>
    );
};

export default PianoRoll;
