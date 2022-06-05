import { initialSecondsPerDivision, wholeNoteDivisions } from "@Data/Constants";
import { useStore } from "@Data/Store";

export const ColumnToSeconds = (column: number) => {
    return column / 8;
};

export const BpmToBps = (bpm: number) => {
    return bpm / 60;
};

export const GetSecondsPerDivision = (): number => {
    return initialSecondsPerDivision / BpmToBps(useStore.getState().bpm);
};

export const GetWholeNoteDuration = (): number => {
    return wholeNoteDivisions * GetSecondsPerDivision();
};

export const DivisorToDuration = (divisor: number) => {
    return GetWholeNoteDuration() / divisor;
};

export const GetPixelsPerSecond = (basePixelsPerSecond: number): number => {
    return basePixelsPerSecond * BpmToBps(useStore.getState().bpm);
};
