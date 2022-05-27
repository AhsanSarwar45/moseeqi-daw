import React, { Fragment, useRef, useEffect, memo } from "react";
import {
    Button,
    Flex,
    Text,
    IconButton,
    Box,
    VStack,
    HStack,
    useDisclosure,
    useTheme,
    Icon,
} from "@chakra-ui/react";
import { TiPlus, TiVolumeMute } from "react-icons/ti";
import { BiDuplicate } from "react-icons/bi";
import Ruler from "@scena/react-ruler";
import * as Tone from "tone";
import { useState } from "react";

import { AddTrackModal } from "./AddTrackModal";
import { Track } from "@Interfaces/Track";
import SeekHandle from "@Components/studio/SeekHandle";
import { Panel } from "@Interfaces/Panel";
import { PartSelectionIndex } from "@Interfaces/Selection";
import PartView from "./PartView";
import { ScrollbarStyle } from "@Styles/ScrollbarStyle";
import { secondsPerWholeNote } from "@Data/Constants";
import TooltipButton from "@Components/TooltipButton";
import ToggleButton from "@Components/ToggleButton";

interface MeterProps {
    width: number | string;
    meter: Tone.Meter;
    fillColor: string;
    bgColor: string;
    borderColor: string;
    borderWidth: number | string;
}

const Meter = (props: MeterProps) => {
    const meterAnimationRef = useRef(0);
    const metersRef = useRef<Array<HTMLDivElement>>([]);
    // const maxHeight =

    useEffect(() => {
        meterAnimationRef.current = requestAnimationFrame(function animate() {
            const values = props.meter.getValue();

            if (props.meter.channels > 1) {
                const values_list = values as Array<number>;
                for (let index = 0; index < values_list.length; index++) {
                    metersRef.current[index].style.height = `${
                        values_list[index] + 100
                    }%`;
                }
            } else {
                const value = values as number;
                metersRef.current[0].style.height = `${value + 100}%`;
            }

            //	metersRef.current.style.height = `${meter.getValue() + 100}%`;

            meterAnimationRef.current = requestAnimationFrame(animate);
        });
        return () => {
            cancelAnimationFrame(meterAnimationRef.current);
        };
    }, [props.meter]);

    useEffect(() => {
        metersRef.current = metersRef.current.slice(0, props.meter.channels);
    }, [props.meter]);

    return (
        <HStack top={1} spacing={1} position="absolute" bottom={1} right={1}>
            {[...Array(props.meter.channels)].map((channel, i) => (
                <Box
                    height="100%"
                    width={props.width}
                    bgColor={props.bgColor}
                    position="relative"
                    borderColor={props.borderColor}
                    borderWidth={props.borderWidth}
                    key={i}
                    //id={`meter${i}`}
                >
                    <Box
                        ref={(el) =>
                            (metersRef.current[i] = el as HTMLDivElement)
                        }
                        position="absolute"
                        bottom={0}
                        // height={`${meterHeight + 100}%`}
                        width="100%"
                        bgColor={props.fillColor}
                    />
                </Box>
            ))}
        </HStack>
    );
};

interface TracksViewProps {
    tracks: Array<Track>;
    playbackState: number;
    seek: number;
    setSeek: (seek: number) => void;
    onAddTrack: (instrument: number) => void;
    onDuplicateSelectedTrack: () => void;
    selected: number;
    setSelected: (trackIndex: number) => void;
    activeWidth: number;
    setActiveWidth: (width: number) => void;
    toggleMute: (trackIndex: number) => void;
    toggleSolo: (trackIndex: number) => void;
    focusedPanel: Panel;
    setFocusedPanel: (panel: Panel) => void;
    selectedPartIndices: Array<PartSelectionIndex>;
    setSelectedPartIndices: (indices: Array<PartSelectionIndex>) => void;
    setTracks: (tracks: Array<Track>) => void;
    bpm: number;
    projectLength: number;
}

const TracksView = memo((props: TracksViewProps) => {
    const wholeNoteWidth = 40;
    const pixelsPerSecond = wholeNoteWidth / secondsPerWholeNote;
    const snapDivisions = 8;
    const snapWidth = wholeNoteWidth / snapDivisions;

    const theme = useTheme();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const scaleGridTop = useRef<Ruler>(null);
    const scaleGridMain = useRef<Ruler>(null);
    const scaleGridMinor = useRef<Ruler>(null);

    const [isShiftHeld, setIsShiftHeld] = useState(false);

    const [tracks, setTracks] = useState(props.tracks);

    useEffect(() => {
        setTracks(props.tracks);
    }, [props.tracks]);

    const OnKeyDown = ({ key }: { key: string }) => {
        if (key === "Shift") {
            setIsShiftHeld(true);
        }
    };

    const OnKeyUp = ({ key }: { key: string }) => {
        if (key === "Shift") {
            setIsShiftHeld(false);
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", OnKeyDown);
        window.addEventListener("keyup", OnKeyUp);
        return () => {
            window.removeEventListener("keydown", OnKeyDown);
            window.removeEventListener("keyup", OnKeyUp);
        };
    }, []);

    useEffect(() => {
        let timeScaleRefValue: Ruler | null = null;
        let timeScaleMainRefValue: Ruler | null = null;
        let timeScaleMinorRefValue: Ruler | null = null;

        window.addEventListener("resize", () => {
            scaleGridTop.current?.resize();
            scaleGridMain.current?.resize();
            scaleGridMinor.current?.resize();

            timeScaleRefValue = scaleGridTop.current;
            timeScaleMainRefValue = scaleGridMain.current;
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

    const SetSelectedParts = (trackIndex: number, partIndex: number) => {
        const selectedPartIndex = props.selectedPartIndices.findIndex(
            (index) =>
                index.trackIndex === trackIndex && index.partIndex === partIndex
        );

        if (isShiftHeld) {
            // if this part is already selected, deselect it, otherwise select it

            if (selectedPartIndex >= 0) {
                let selectedPartIndicesCopy = [...props.selectedPartIndices];
                selectedPartIndicesCopy.splice(selectedPartIndex, 1);
                props.setSelectedPartIndices(selectedPartIndicesCopy);
            } else {
                props.setSelectedPartIndices([
                    ...props.selectedPartIndices,
                    { trackIndex, partIndex },
                ]);
            }
        } else {
            // If selected parts does not contain this part, then reset selected parts to only this part
            if (selectedPartIndex < 0) {
                props.setSelectedPartIndices([{ trackIndex, partIndex }]);
            }
        }
    };

    const MoveSelectedParts = (startDelta: number, stopDelta: number) => {
        Tone.Transport.bpm.value = props.bpm;

        let tracksCopy = [...tracks];

        props.selectedPartIndices.forEach(({ trackIndex, partIndex }) => {
            let part = tracksCopy[trackIndex].parts[partIndex];

            part.startTime += startDelta;
            part.stopTime += stopDelta;

            part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);

            tracksCopy[trackIndex].parts[partIndex] = part;
        });

        setTracks(tracksCopy);
    };

    return (
        <Fragment>
            <HStack
                alignItems="flex-start"
                spacing={0}
                width="full"
                height="100%"
                overflowX="scroll"
                overflowY="scroll"
                sx={ScrollbarStyle}
                bgColor="primary.600"
                onClick={(event) => {
                    if (event.currentTarget === event.target) {
                        props.setSelectedPartIndices([]);
                    }
                }}
            >
                <VStack
                    spacing={0}
                    position="sticky"
                    // height={90 * props.tracks.length}
                    left={0}
                    zIndex={500}
                    onClick={(event) => {
                        props.setFocusedPanel(Panel.TrackView);
                    }}
                >
                    <HStack
                        paddingX={1}
                        height={30}
                        // width="full"
                        spacing={1}
                        justifyContent="flex-start"
                        bgColor="primary.500"
                        borderBottom="1px solid gray"
                        position="sticky"
                        top={0}
                        left={0}
                        width={200}
                        zIndex={9300}
                    >
                        <TooltipButton
                            aria-label="Add track"
                            onClick={onOpen}
                            label=""
                            icon={<Icon as={TiPlus} />}
                            tooltip="Add track"
                            fontSize="xs"
                            size="xs"
                        />
                        <TooltipButton
                            aria-label="Duplicate track"
                            onClick={props.onDuplicateSelectedTrack}
                            label=""
                            icon={<Icon as={BiDuplicate} />}
                            tooltip="Duplicate selected track"
                            fontSize="xs"
                            size="xs"
                        />
                    </HStack>
                    {props.tracks.map((track: Track, index: number) => (
                        <HStack
                            key={index}
                            color="white"
                            paddingY={2}
                            paddingX={2}
                            width={200}
                            height={90}
                            bgColor={
                                props.selected === index
                                    ? "primary.700"
                                    : "primary.500"
                            }
                            boxSizing="border-box"
                            borderBottomWidth={1}
                            borderColor={"gray.500"}
                            onMouseDown={(event) => {
                                props.setSelected(index);
                            }}
                            // height={200}
                            position="relative"
                            alignItems="flex-start"
                        >
                            <VStack alignItems="flex-start">
                                <Text color="white">{track.name}</Text>

                                <HStack>
                                    <ToggleButton
                                        tooltipLabel={"Mute"}
                                        onClick={() => props.toggleMute(index)}
                                        isToggled={track.muted}
                                        label="M"
                                        borderWidth={1}
                                        size="xs"
                                        textColor={
                                            track.soloMuted
                                                ? "secondary.500"
                                                : "white"
                                        }
                                        // borderColor="secondary.700"
                                        // onColor="secondary.700"
                                        // offColor="secondary.500"
                                    />
                                    <ToggleButton
                                        tooltipLabel={"Solo"}
                                        onClick={() => props.toggleSolo(index)}
                                        isToggled={track.soloed}
                                        label="S"
                                        borderWidth={1}
                                        size="xs"
                                        // borderColor="secondary.700"
                                        // onColor="secondary.700"
                                        // offColor="secondary.500"
                                    />
                                    {/* <Button
                                        width="20px"
                                        borderColor="secondary.700"
                                        borderWidth="1px"
                                        bgColor={
                                            track.muted
                                                ? "secondary.700"
                                                : "secondary.500"
                                        }
                                        colorScheme="secondary"
                                        size="xs"
                                        flexShrink={0}
                                        borderRadius="sm"
                                        onClick={() => props.toggleMute(index)}
                                    >
                                        M
                                    </Button> */}
                                    {/* <Button
                                        width="20px"
                                        borderColor="secondary.700"
                                        borderWidth="1px"
                                        colorScheme="secondary"
                                        size="xs"
                                        flexShrink={0}
                                        borderRadius="sm"
                                    >
                                        S
                                    </Button> */}
                                </HStack>
                            </VStack>
                            <Meter
                                width="10px"
                                meter={track.meter}
                                bgColor="brand.primary"
                                fillColor="brand.accent1"
                                borderColor="primary.700"
                                borderWidth="1px"
                            />
                        </HStack>
                    ))}
                </VStack>

                <VStack
                    alignItems="flex-start"
                    spacing={0}
                    onClick={(event) => {
                        props.setFocusedPanel(Panel.TrackSequencer);
                    }}
                >
                    <Box
                        height="30px"
                        padding="0px"
                        width={props.projectLength * pixelsPerSecond}
                        position="sticky"
                        top={0}
                        zIndex={400}
                    >
                        <SeekHandle
                            playbackState={props.playbackState}
                            seek={props.seek}
                            setSeek={props.setSeek}
                            height={30 + 90 * props.tracks.length}
                        />
                        <Ruler
                            type="horizontal"
                            unit={1}
                            zoom={40}
                            ref={scaleGridTop}
                            backgroundColor={theme.colors.primary[600]}
                            segment={4}
                        />
                    </Box>
                    <Box
                        height={90 * props.tracks.length}
                        padding="0px"
                        width={props.projectLength * pixelsPerSecond}
                        marginTop="30px"
                        position="relative"
                    >
                        <Ruler
                            type="horizontal"
                            unit={1}
                            zoom={40}
                            ref={scaleGridMinor}
                            backgroundColor={theme.colors.primary[400]}
                            segment={4}
                            mainLineSize={0}
                            shortLineSize={90 * props.tracks.length}
                            longLineSize={90 * props.tracks.length}
                            height={90 * props.tracks.length}
                            lineColor="rgba(255,255,255,0.1)"
                            textColor="rgba(0,0,0,0)"
                        />

                        {/* <Ruler style={{ marginTop: -(86 * props.tracks.length), marginLeft: -1 }} height={43 * props.tracks.length} type="horizontal" unit={1} zoom={40} ref={scaleGridMain} backgroundColor='rgba(0,0,0,0)' segment={1} lineColor='rgba(255,255,255,0.3)' textColor='rgba(0,0,0,0)' /> */}

                        {/* <Box position="absolute" width={props.projectLength * pixelsPerSecond} p={0}>
							<Ruler type="horizontal" unit={1} zoom={40} ref={scaleGridMain} backgroundColor={theme.colors.primary[400]} segment={4} height={86} mainLineSize={0} shortLineSize={86} longLineSize={86} lineColor='rgba(255,255,255,0.1)' textColor='rgba(0,0,0,0)' />
						</Box>
						<Box position="absolute" width={props.projectLength * pixelsPerSecond} p={0}>
							<Ruler type="horizontal" unit={1} zoom={40} ref={scaleGridMinor} backgroundColor='rgba(0,0,0,0)' segment={1} height={86} lineColor='rgba(255,255,255,0.3)' textColor='rgba(0,0,0,0)' />
						</Box> */}
                        <Box position="absolute" top={0} left={0}>
                            {tracks.map((track: Track, trackIndex: number) => (
                                <Box
                                    key={trackIndex}
                                    height="90px"
                                    width={
                                        props.projectLength * pixelsPerSecond
                                    }
                                    position="relative"
                                    padding="0px"
                                    onMouseDown={(event) => {
                                        if (
                                            event.currentTarget === event.target
                                        ) {
                                            props.setSelectedPartIndices([]);
                                            props.setSelected(trackIndex);
                                        }
                                    }}
                                    borderBottom="1px solid gray"
                                >
                                    {track.parts.map((part, partIndex) => (
                                        <PartView
                                            key={part.id}
                                            part={part}
                                            tracks={props.tracks}
                                            bpm={props.bpm}
                                            trackIndex={trackIndex}
                                            partIndex={partIndex}
                                            pixelsPerSecond={pixelsPerSecond}
                                            snapWidth={snapWidth}
                                            selectedPartIndices={
                                                props.selectedPartIndices
                                            }
                                            onPartClick={SetSelectedParts}
                                            onMoveSelectedParts={
                                                MoveSelectedParts
                                            }
                                            onMoveSelectedPartsStop={() =>
                                                props.setTracks(tracks)
                                            }
                                        />
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </VStack>
            </HStack>
            <AddTrackModal
                onClose={onClose}
                isOpen={isOpen}
                onSubmit={props.onAddTrack}
            />
        </Fragment>
    );
});

TracksView.displayName = "TracksView";

export default TracksView;
