import { Box } from "@chakra-ui/react";
import { NotesModifierContext } from "@Data/NotesModifierContext";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import { GridContext } from "@Data/GridContext";
import { secondsPerWholeNote, wholeNoteDivisions } from "@Data/Constants";
import { BpmToBps } from "@Utility/TimeUtils";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { Snap } from "@Utility/SnapUtils";

interface FilledCellProps {
    note: Note;
    part: Part;
    partIndex: number;
    noteIndex: number;
    cellHeight: number;
    cellWidth: number;
    isSnappingOn: boolean;
    onClick: (key: string, duration: number) => void;
}

const FilledCell = (props: FilledCellProps) => {
    const { onMoveNote, onRemoveNote } = useContext(NotesModifierContext);

    const { currentPixelsPerSecond, pixelsPerSecond } = useContext(GridContext);

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const [snappedDraggingPosition, setSnappedDraggingPosition] = useState(
        props.note.startTime * pixelsPerSecond * props.note.bps
    );
    const [snappedResizingWidth, setSnappedResizingWidth] = useState(
        props.note.duration * pixelsPerSecond * props.note.bps
    );

    useEffect(() => {
        setSnappedDraggingPosition(
            props.note.startTime * pixelsPerSecond * props.note.bps
        );
    }, [pixelsPerSecond, props.note.bps, props.note.startTime]);

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
                width:
                    (isResizing
                        ? snappedResizingWidth
                        : props.note.duration *
                          pixelsPerSecond *
                          props.note.bps) - 1,
                height: props.cellHeight - 1,
            }}
            position={{
                x: isDragging
                    ? snappedDraggingPosition
                    : props.note.startTime * pixelsPerSecond * props.note.bps,
                y: props.note.noteIndex * props.cellHeight,
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
            resizeGrid={[
                props.isSnappingOn ? props.cellWidth : 1,
                props.cellHeight - 1,
            ]}
            dragGrid={[
                props.isSnappingOn ? props.cellWidth : 1,
                props.cellHeight,
            ]}
            onDrag={(event, data) => {
                if (props.isSnappingOn) {
                    if (isResizing) {
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
                const localStartTime = data.lastX / currentPixelsPerSecond;

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

                onMoveNote(
                    props.partIndex,
                    props.noteIndex,
                    startTime,
                    startTime + props.note.duration,
                    row
                );
                setIsDragging(false);
            }}
            onResize={(e, direction, ref, delta, position) => {
                if (props.isSnappingOn) {
                    const width = parseInt(ref.style.width);
                    const stopPosition = position.x + width;
                    const snappedStopPosition = Snap(
                        stopPosition,
                        props.cellWidth
                    );
                    setSnappedResizingWidth(snappedStopPosition - position.x);
                }
            }}
            onResizeStart={(e, direction, ref) => {
                if (props.isSnappingOn) {
                    setIsResizing(true);
                }
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const width = parseInt(ref.style.width);

                const localStartTime = position.x / currentPixelsPerSecond;
                let startTime = localStartTime + props.part.startTime;

                const duration = width / (pixelsPerSecond * props.note.bps);

                const row = position.y / props.cellHeight;
                // console.log("width", width, "position", position);
                onMoveNote(
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
                // pointerEvents="auto"
                ref={handleRef as any}
                // className={`cellHandle${props.note.time}${props.note.noteIndex}`}
                // cursor="url(https://icons.iconarchive.com/icons/fatcow/farm-fresh/32/draw-eraser-icon.png) -80 40, auto"
                // cursor="move"
                height="full"
                borderRadius="5px"
                borderWidth="1px"
                borderColor="secondary.700"
                bgColor="secondary.500"
                onContextMenu={() => {
                    onRemoveNote(props.partIndex, props.noteIndex);
                    return false;
                }}
                zIndex={9999}
                // onClick={() => props.onClick(props.note.note, props.note.duration)}
            >
                {/* {`${index} ${note.time} ${MusicNotes[note.noteIndex]}`} */}
            </Box>
        </Rnd>
    );
};

interface PianoRollProps {
    partIndex: number;
    part: Part;
}

const PianoRollPartView = ({ partIndex, part }: PianoRollProps) => {
    const {
        columnWidth,
        rowHeight,
        onFilledNoteClick,
        gridHeight,
        isSnappingOn,
        currentPixelsPerSecond,
    } = useContext(GridContext);

    return (
        // <Box key={partIndex} >
        <Box
            key={partIndex}
            position="absolute"
            left={part.startTime * currentPixelsPerSecond}
        >
            <Box
                borderWidth={1}
                zIndex={9998}
                position="absolute"
                pointerEvents="none"
                width={
                    (part.stopTime - part.startTime) * currentPixelsPerSecond +
                    1
                }
                height={gridHeight}
                bgColor="rgba(255,0,0,0.05)"
            />

            {part.notes.map((note: Note, noteIndex: number) => (
                <FilledCell
                    key={note.id}
                    note={note}
                    noteIndex={noteIndex}
                    part={part}
                    isSnappingOn={isSnappingOn}
                    partIndex={partIndex}
                    cellHeight={rowHeight}
                    cellWidth={columnWidth}
                    onClick={onFilledNoteClick}
                />
            ))}
        </Box>
    );
};

export default PianoRollPartView;
