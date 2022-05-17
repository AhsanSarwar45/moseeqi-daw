import { Box } from "@chakra-ui/react";
import { PartSelectionIndex } from "@Interfaces/Selection";
import { Track } from "@Interfaces/Track";
import Ruler from "@scena/react-ruler";
import React, { useEffect, useRef, useState } from "react";
import PartView from "./PartView";

interface TrackProps {
    track: Track;
    trackIndex: number;
    setSelected: (index: number) => void;
    setPartTime: (
        trackIndex: number,
        partIndex: number,
        startTime: number,
        stopTime: number
    ) => void;
    selectedPartIndices: Array<PartSelectionIndex>;
    onPartClick: (trackIndex: number, partIndex: number) => void;
    onMoveSelectedParts: (startDelta: number, stopDelta: number) => void;
}

const TrackSequence = (props: TrackProps) => {};

export default TrackSequence;
