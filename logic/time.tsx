import { initialSecondsPerDivision, wholeNoteDivisions } from "@data/constants";
import { useStore } from "@data/stores/project";

export const columnToSeconds = (column: number) => {
    return column / 8;
};

export const bpmToBps = (bpm: number) => {
    return bpm / 60;
};

export const getSecondsPerDivision = (): number => {
    return initialSecondsPerDivision / bpmToBps(useStore.getState().bpm);
};

export const getWholeNoteDuration = (): number => {
    return wholeNoteDivisions * getSecondsPerDivision();
};

export const divisorToDuration = (divisor: number) => {
    return getWholeNoteDuration() / divisor;
};

export const getPixelsPerSecond = (basePixelsPerSecond: number): number => {
    return basePixelsPerSecond * bpmToBps(useStore.getState().bpm);
};
