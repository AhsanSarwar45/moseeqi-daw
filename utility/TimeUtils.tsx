import { useBpmStore } from "@Data/BpmStore";
import { initialSecondsPerDivision, wholeNoteDivisions } from "@Data/Constants";

export const ColumnToSeconds = (column: number) => {
    return column / 8;
};

export const BpmToBps = (bpm: number) => {
    return bpm / 60;
};

export const GetSecondsPerDivision = (): number => {
    return initialSecondsPerDivision / BpmToBps(useBpmStore.getState().bpm);
};

export const GetWholeNoteDuration = (): number => {
    return wholeNoteDivisions * GetSecondsPerDivision();
};

export const DivisorToDuration = (divisor: number) => {
    return GetWholeNoteDuration() / divisor;
};

export const GetPixelsPerSecond = (basePixelsPerSecond: number): number => {
    return basePixelsPerSecond * BpmToBps(useBpmStore.getState().bpm);
};
