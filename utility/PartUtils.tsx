import { wholeNoteDivisions } from "@Data/Constants";

export const GetNewPartStartTime = (
    noteStartTime: number,
    currentSecondsPerDivision: number
) => {
    const noteStartColumn = Math.floor(
        noteStartTime / currentSecondsPerDivision
    );
    // console.log("note moved", noteStartColumn);
    return (
        Math.floor(noteStartColumn / wholeNoteDivisions) *
        wholeNoteDivisions *
        currentSecondsPerDivision
    );
};

export const GetNewPartStopTime = (
    noteStopTime: number,
    currentSecondsPerDivision: number
) => {
    const noteStopColumn = Math.floor(noteStopTime / currentSecondsPerDivision);
    return (
        Math.ceil(noteStopColumn / wholeNoteDivisions) *
        wholeNoteDivisions *
        currentSecondsPerDivision
    );
};

export const GetExtendedPartStopTime = (
    noteStopTime: number,
    currentSecondsPerDivision: number
) => {
    const noteStopColumn = Math.ceil(noteStopTime / currentSecondsPerDivision);
    console.log("noteStopColumn", noteStopColumn);
    return noteStopColumn * currentSecondsPerDivision;
};
