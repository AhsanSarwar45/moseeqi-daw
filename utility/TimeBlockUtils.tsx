import { TimeBlock } from "@Interfaces/TimeBlock";
import { Draft } from "immer";

export const SetTimeBlock = (
    timeBlock: Draft<TimeBlock>,
    startTime: number,
    stopTime: number
    // row: number
) => {
    timeBlock.startTime = startTime;
    timeBlock.stopTime = stopTime;
    timeBlock.duration = stopTime - startTime;
};

export const SetTimeBlockRowIndex = (
    timeBlock: Draft<TimeBlock>,
    rowIndex: number
) => {
    timeBlock.rowIndex = rowIndex;
    // console.log(rowIndex);
};

export const MapTimeBlock = (
    timeBlock: Draft<TimeBlock>,
    mapper: (startTime: number) => number
) => {
    timeBlock.startTime = mapper(timeBlock.startTime);
    timeBlock.stopTime = mapper(timeBlock.stopTime);
    timeBlock.duration = timeBlock.stopTime - timeBlock.startTime;
};
