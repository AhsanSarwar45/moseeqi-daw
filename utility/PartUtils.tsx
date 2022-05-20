import { wholeNoteDivisions } from "@Data/Constants";

export const GetNewPartStartColumn = (noteStartColumn: number) => {
    return (
        Math.floor(noteStartColumn / wholeNoteDivisions) * wholeNoteDivisions
    );
};

export const GetNewPartStopColumn = (noteStopColumn: number) => {
    return Math.ceil(noteStopColumn / wholeNoteDivisions) * wholeNoteDivisions;
};
