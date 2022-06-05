import { TimeContainer } from "@Interfaces/TimeContainer";

export const SetTimeContainerTime = (
    timeContainer: TimeContainer,
    startTime: number,
    stopTime: number
    // row: number
) => {
    // note.key = PianoKeys[row];
    // note.keyIndex = row;
    timeContainer.startTime = startTime;
    timeContainer.stopTime = stopTime;
    timeContainer.duration = stopTime - startTime;
    return;
};
