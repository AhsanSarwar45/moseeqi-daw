import { Box } from "@chakra-ui/react";

import { useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import { NotesModifierContext } from "@Data/NotesModifierContext";
import {
    selectMoveNoteInSelectedTrack,
    selectRemoveNoteFromSelectedTrack,
    selectSelectedTrack,
    useTracksStore,
} from "@Data/TracksStore";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { Snap } from "@Utility/SnapUtils";
import { GetPartNote, MoveNote } from "@Utility/NoteUtils";

interface MidiNoteProps {
    note: Note;
    part: Part;
    partIndex: number;
    noteIndex: number;
    cellHeight: number;
    cellWidth: number;
    isSnappingOn: boolean;
    currentPixelsPerSecond: number;
}

export const MidiNote = (props: MidiNoteProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const removeNoteFromSelectedTrack = useTracksStore(
        selectRemoveNoteFromSelectedTrack
    );
    const moveNoteInSelectedTrack = useTracksStore(
        selectMoveNoteInSelectedTrack
    );

    const selectedTrack = useTracksStore(selectSelectedTrack);

    const [snappedDraggingPosition, setSnappedDraggingPosition] = useState(
        props.note.startTime * props.currentPixelsPerSecond
    );
    // const [snappedResizingWidth, setSnappedResizingWidth] = useState(
    //     props.note.duration * props.currentPixelsPerSecond
    // );
    const OnNoteClick = (key: string, duration: number) => {
        selectedTrack.sampler.triggerAttackRelease(key, duration);
    };

    useEffect(() => {
        setSnappedDraggingPosition(
            props.note.startTime * props.currentPixelsPerSecond
        );
        // setSnappedResizingWidth(
        //     props.note.duration * props.currentPixelsPerSecond
        // );
    }, [
        props.currentPixelsPerSecond,
        // props.note.duration,
        props.note.startTime,
    ]);

    const handleRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        handleRef.current?.addEventListener(
            "contextmenu",
            function (event: any) {
                event.preventDefault();
                return false;
            },
            false
        );
    }, []);

    return (
        <Rnd
            // pointerEvents="auto"
            size={{
                width: props.note.duration * props.currentPixelsPerSecond,
                height: props.cellHeight,
            }}
            position={{
                x: isDragging
                    ? snappedDraggingPosition
                    : props.note.startTime * props.currentPixelsPerSecond,
                y: props.note.keyIndex * props.cellHeight,
            }}
            enableResizing={{
                top: false,
                right: true,
                bottom: false,
                left: false,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false,
            }}
            // bounds="parent"
            resizeGrid={[props.isSnappingOn ? props.cellWidth : 1, 0]}
            dragGrid={[
                props.isSnappingOn ? props.cellWidth : 1,
                props.cellHeight,
            ]}
            onDrag={(event, data) => {
                if (props.isSnappingOn) {
                    if (isDragging) {
                        setSnappedDraggingPosition(
                            Snap(data.x, props.cellWidth)
                        );
                    }
                }
            }}
            onDragStart={(event, data) => {
                if (props.isSnappingOn) {
                    if (data.x % props.cellWidth !== 0) {
                        setIsDragging(true);
                    }
                }
            }}
            onDragStop={(event, data) => {
                const localStartTime =
                    data.lastX / props.currentPixelsPerSecond;

                let startTime = localStartTime + props.part.startTime;
                // console.log(startTime);

                const row = data.lastY / props.cellHeight;

                // console.log(column, props.part.startTime);

                if (startTime < 0) {
                    startTime = 0;
                }
                if (startTime < 0) {
                    startTime = 0;
                }

                moveNoteInSelectedTrack(
                    props.partIndex,
                    props.noteIndex,
                    startTime,
                    startTime + props.note.duration,
                    row
                );
                setIsDragging(false);
            }}
            // onResize={(e, direction, ref, delta, position) => {
            //     if (props.isSnappingOn && isResizing) {
            //         const width = parseInt(ref.style.width);
            //         const startPosition = position.x;
            //         const stopPosition = startPosition + width;

            //         const snappedStopPosition = Snap(
            //             stopPosition,
            //             props.cellWidth
            //         );

            //         console.log(
            //             startPosition,
            //             stopPosition,
            //             snappedStopPosition,
            //             snappedStopPosition - startPosition
            //         );
            //         setSnappedResizingWidth(snappedStopPosition - position.x);
            //         setIsResizing(false);
            //     }
            // }}
            onResizeStart={(e, direction, ref) => {
                setIsResizing(true);
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const width = parseInt(ref.style.width);

                const localStartTime =
                    position.x / props.currentPixelsPerSecond;
                let startTime = localStartTime + props.part.startTime;

                const duration = width / props.currentPixelsPerSecond;

                const row = position.y / props.cellHeight;
                // console.log("width", width, "position", position);
                moveNoteInSelectedTrack(
                    props.partIndex,
                    props.noteIndex,
                    startTime,
                    startTime + duration,
                    row
                );
                // props.onClick(props.note.note, duration)
                setIsResizing(false);
            }}
            minWidth={props.cellWidth / 2 - 1}
        >
            <Box
                ref={handleRef as any}
                height="full"
                borderRadius="sm"
                borderWidth="1px"
                borderColor="secondary.700"
                bgColor="secondary.500"
                onContextMenu={() => {
                    removeNoteFromSelectedTrack(
                        props.partIndex,
                        props.noteIndex
                    );
                    return false;
                }}
                zIndex={9999}
            />
        </Rnd>
    );
};
