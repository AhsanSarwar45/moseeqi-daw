import { BoxBounds } from "@interfaces/box";
import { TimeBlock } from "@interfaces/time-block";
import { Draft } from "immer";

export const setTimeBlock = (
    timeBlock: Draft<TimeBlock>,
    startTime: number,
    stopTime: number
    // row: number
) => {
    timeBlock.startTime = startTime;
    timeBlock.stopTime = stopTime;
    timeBlock.duration = stopTime - startTime;
};

export const setTimeBlockRowIndex = (
    timeBlock: Draft<TimeBlock>,
    rowIndex: number
) => {
    timeBlock.rowIndex = rowIndex;
    // console.log(rowIndex);
};

export const mapTimeBlock = (
    timeBlock: Draft<TimeBlock>,
    mapper: (startTime: number) => number
) => {
    timeBlock.startTime = mapper(timeBlock.startTime);
    timeBlock.stopTime = mapper(timeBlock.stopTime);
    timeBlock.duration = timeBlock.stopTime - timeBlock.startTime;
};

export const copyTimeBlock = (to: Draft<TimeBlock>, from: Draft<TimeBlock>) => {
    to.startTime = from.startTime;
    to.stopTime = from.stopTime;
    to.duration = from.duration;
    to.rowIndex = from.rowIndex;
};

export const getTimeBlockBounds = (
    timeBlock: TimeBlock,
    pixelsPerSecond: number,
    pixelsPerRow: number
): BoxBounds => {
    // console.log(timeBlock.startTime);
    const top = timeBlock.rowIndex * pixelsPerRow;
    const left = timeBlock.startTime * pixelsPerSecond;
    const width = timeBlock.duration * pixelsPerSecond;
    const height = pixelsPerRow;

    return { top, left, width, height };
};
