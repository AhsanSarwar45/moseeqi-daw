import { TimeBlock } from "@Interfaces/TimeBlock";

export const SetTimeBlockTime = (
    timeBlock: TimeBlock,
    startTime: number,
    stopTime: number
    // row: number
) => {
    // note.key = PianoKeys[row];
    // note.keyIndex = row;
    timeBlock.startTime = startTime;
    timeBlock.stopTime = stopTime;
    timeBlock.duration = stopTime - startTime;
    return;
};

export const MapTimeBlock = (
    timeBlock: TimeBlock,
    mapper: (startTime: number) => number
) => {
    timeBlock.startTime = mapper(timeBlock.startTime);
    timeBlock.stopTime = mapper(timeBlock.stopTime);
    timeBlock.duration = timeBlock.stopTime - timeBlock.startTime;
};
