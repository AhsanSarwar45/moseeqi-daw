import { Box } from "@chakra-ui/react";
import { NotesModifierContext } from "@Data/NotesModifierContext";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import { GridContext } from "@Data/GridContext";
import { secondsPerWholeNote, wholeNoteDivisions } from "@Data/Constants";
import { BpmToBps } from "@Utility/TimeUtils";

interface FilledCellProps {
    note: Note;
    part: Part;
    partIndex: number;
    noteIndex: number;
    cellHeight: number;
    cellWidth: number;
    onClick: (key: string, duration: number) => void;
}

const FilledCell = (props: FilledCellProps) => {
    const { onMoveNote, onRemoveNote, onResizeNote } =
        useContext(NotesModifierContext);
    const [activeWidth, setActiveWidth] = useState(
        (8 / props.note.duration) * props.cellWidth - 1
    );

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
            size={{ width: activeWidth, height: props.cellHeight - 1 }}
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
            resizeGrid={[props.cellWidth, props.cellHeight - 1]}
            dragGrid={[props.cellWidth, props.cellHeight]}
            position={{
                x: props.note.startColumn * props.cellWidth,
                y: props.note.noteIndex * props.cellHeight,
            }}
            onDragStop={(event, data) => {
                // Round off data.x to nearest cellWidth
                data.lastX =
                    Math.round(data.lastX / props.cellWidth) * props.cellWidth;
                // Round off data.y to nearest cellHeight
                data.lastY =
                    Math.round(data.lastY / props.cellHeight) *
                    props.cellHeight;

                const localColumn = data.lastX / props.cellWidth;
                let column = localColumn + props.part.startTime * 4;
                const row = data.lastY / props.cellHeight;

                console.log(column, props.part.startTime);

                if (column < 0) {
                    column = 0;
                }
                if (column < 0) {
                    column = 0;
                }

                onMoveNote(props.partIndex, props.noteIndex, column, row);
            }}
            minWidth={props.cellWidth - 1}
            onResizeStop={(e, direction, ref, delta, position) => {
                const width = parseInt(ref.style.width);

                setActiveWidth(width - 1);
                const duration = (8 / width) * props.cellWidth;
                // console.log("width", width, "position", position);
                onResizeNote(props.partIndex, props.noteIndex, duration);
                // props.onClick(props.note.note, duration)
            }}
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
    const { columnWidth, rowHeight, onFilledNoteClick, gridHeight, bpm } =
        useContext(GridContext);

    const wholeNoteWidth = columnWidth * wholeNoteDivisions;
    const pixelsPerSecond = wholeNoteWidth / secondsPerWholeNote;

    const [currentPixelsPerSecond, setCurrentPixelsPerSecond] = useState(
        pixelsPerSecond * BpmToBps(bpm)
    );

    useEffect(() => {
        setCurrentPixelsPerSecond(pixelsPerSecond * BpmToBps(bpm));
    }, [bpm, wholeNoteWidth]);

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
