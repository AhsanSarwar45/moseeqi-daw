import React, { Fragment, useRef, useEffect } from "react";
import {
    Box,
    VStack,
    HStack,
    useDisclosure,
    useTheme,
    Icon,
} from "@chakra-ui/react";

import Ruler from "@scena/react-ruler";
import { useState } from "react";

import SeekHandle from "@components/studio/seek-handle";
import { ScrollbarStyle } from "@styles/scrollbar-style";
import { noteLengthOptions, secondsPerWholeNote } from "@data/constants";

import {
    selectProjectLength,
    selectTrackCount,
    useStore,
} from "@data/stores/project";
import SequenceView from "./sequence-view";
import TracksInfoView from "./tracks-info-view";
import { FocusArea, FlexFocusArea } from "@components/focus-area";
import { Panel } from "@interfaces/enums/panel";
import TracksSettingsView from "./tracks-settings-view";
import {
    addPartToTrackIndex,
    clearSelectedPartsIndices,
    deleteSelectedParts,
    getNewPartStartTime,
    getNewPartStopTime,
} from "@logic/part";
import Canvas from "../canvas";
import { getPixelsPerSecond } from "@logic/time";
import { dragSelectTimeBlocks } from "@logic/selection";
import { BoxBounds } from "@interfaces/box";
import { SelectionType } from "@interfaces/selection";
import { Coordinate } from "@interfaces/coordinate";
import GridLines from "react-gridlines";

interface TracksViewProps {}

const TracksView = (props: TracksViewProps) => {
    const sequenceHeight = 90;
    const pixelsPerRow = sequenceHeight;
    const baseWholeNoteWidth = 40;
    const basePixelsPerSecond = baseWholeNoteWidth / secondsPerWholeNote;
    // const snapDivisions = 8;
    // const snapWidth = baseWholeNoteWidth / snapDivisions;

    const theme = useTheme();

    const scaleGridTop = useRef<Ruler>(null);
    const scaleGridMain = useRef<Ruler>(null);
    const scaleGridMinor = useRef<Ruler>(null);

    const [snapWidthIndex, setSnapWidthIndex] = useState(3);
    const [isSnappingOn, setIsSnappingOn] = useState(true);

    const trackCount = useStore(selectTrackCount);
    const projectLength = useStore(selectProjectLength);

    const pixelsPerSecond = getPixelsPerSecond(basePixelsPerSecond);

    const sequenceViewHeight = trackCount * sequenceHeight + 1;

    const HandleWindowResize = () => {
        scaleGridTop.current?.resize();
        scaleGridMain.current?.resize();
        scaleGridMinor.current?.resize();
    };

    useEffect(() => {
        window.addEventListener("resize", HandleWindowResize);
        return () => {
            window.removeEventListener("resize", HandleWindowResize);
        };
    }, []);

    return (
        <VStack height="full" bgColor="primary.600" spacing={0}>
            <TracksSettingsView
                snapWidthIndex={snapWidthIndex}
                setSnapWidthIndex={setSnapWidthIndex}
                isSnappingOn={isSnappingOn}
                setIsSnappingOn={setIsSnappingOn}
            />
            <HStack
                alignItems="flex-start"
                spacing={0}
                width="full"
                height="full"
                overflowX="scroll"
                overflowY="scroll"
                sx={ScrollbarStyle}
                onMouseDown={(event) => {
                    if (event.currentTarget === event.target) {
                        clearSelectedPartsIndices();
                    }
                }}
            >
                <VStack
                    spacing={0}
                    position="sticky"
                    left={0}
                    zIndex={500}
                    bgColor="primary.700"
                >
                    <FocusArea panel={Panel.TracksInfoView}>
                        <Box
                            height={31}
                            bgColor="primary.600"
                            borderBottom="1px solid gray"
                            position="sticky"
                            top={0}
                            left={0}
                            width={200}
                            zIndex={9300}
                        />
                        <TracksInfoView />
                    </FocusArea>
                </VStack>

                <VStack alignItems="flex-start" spacing={0}>
                    <Box
                        height="30px"
                        padding="0px"
                        width={projectLength * basePixelsPerSecond}
                        position="sticky"
                        top={0}
                        zIndex={400}
                    >
                        <SeekHandle height={30 + sequenceViewHeight} />
                        <Ruler
                            type="horizontal"
                            unit={1}
                            zoom={40}
                            ref={scaleGridTop}
                            backgroundColor={theme.colors.primary[600]}
                            segment={4}
                        />
                    </Box>
                    <FocusArea
                        panel={Panel.SequenceView}
                        height={sequenceViewHeight}
                        padding="0px"
                        width={projectLength * basePixelsPerSecond}
                        marginTop="30px"
                        position="relative"
                    >
                        {/* <Ruler
                            type="horizontal"
                            unit={1}
                            zoom={40}
                            ref={scaleGridMinor}
                            backgroundColor={theme.colors.primary[400]}
                            segment={4}
                            mainLineSize={0}
                            shortLineSize={sequenceViewHeight}
                            longLineSize={sequenceViewHeight}
                            height={sequenceViewHeight}
                            lineColor="rgba(255,255,255,0.1)"
                            textColor="rgba(0,0,0,0)"
                        /> */}
                        <GridLines
                            className="grid-area"
                            cellWidth={10}
                            cellHeight={sequenceHeight}
                            strokeWidth={1}
                            lineColor="rgba(255,255,255,0.2)"
                            // cellWidth2={12}
                        >
                            <Box height={sequenceViewHeight} />
                        </GridLines>
                        <Canvas
                            onDoubleClick={(mousePos: Coordinate) => {
                                const partStartTime = getNewPartStartTime(
                                    mousePos.x / pixelsPerSecond
                                );
                                const partStopTime = getNewPartStopTime(
                                    (mousePos.x + 1) / pixelsPerSecond
                                );
                                addPartToTrackIndex(
                                    partStartTime,
                                    partStopTime,
                                    Math.floor(mousePos.y / pixelsPerRow)
                                );
                            }}
                            onClick={() => {
                                clearSelectedPartsIndices();
                                // setSelectedTrackIndex(props.trackIndex);
                            }}
                            onDragStop={(bounds: BoxBounds) =>
                                dragSelectTimeBlocks(
                                    bounds,
                                    pixelsPerSecond,
                                    pixelsPerRow,
                                    SelectionType.Part
                                )
                            }
                        />
                        <SequenceView
                            basePixelsPerSecond={basePixelsPerSecond}
                            sequenceHeight={sequenceHeight}
                            snapWidth={
                                isSnappingOn
                                    ? baseWholeNoteWidth /
                                      noteLengthOptions[snapWidthIndex].divisor
                                    : 1
                            }
                        />
                    </FocusArea>
                </VStack>
            </HStack>
        </VStack>
    );
};

TracksView.displayName = "TracksView";

export default TracksView;
