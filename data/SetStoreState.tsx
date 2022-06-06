import { PartialState } from "@Types/Types";
import {
    GetSaveState,
    GetSaveStateDiff,
    GetObjectIntersection,
} from "@Utility/StateUtils";
import { GetTracksSaveData } from "@Utility/TrackUtils";
import IsEqual from "fast-deep-equal/react";
import { StoreState, useStore } from "./Store";
import { HistoryState, useUndoStore } from "./UndoStore";

let isUndoHistoryEnabled = true;

export const DisableUndoHistory = () => {
    isUndoHistoryEnabled = false;
};

export const EnableUndoHistory = () => {
    isUndoHistoryEnabled = true;
};

export const SetStoreState = (
    partialState: PartialState,
    actionName: string,
    addToUndoHistory: boolean = true
) => {
    const prevState = { ...useStore.getState() };
    const nextState =
        typeof partialState === "function"
            ? partialState(prevState)
            : partialState;

    if (isUndoHistoryEnabled && addToUndoHistory) {
        // const historyState: HistoryState = {
        //     actionName: actionName,
        //     patch: GetSaveStateDiff(prevState, nextState),
        // };
        // // useUndoStore.setState((prev) => ({
        // //     pastStates: [...prev.pastStates, historyState],
        // //     futureStates: [],
        // // }));
        // console.log(historyState);
    }
    console.log(nextState);

    useStore.setState(nextState);
};
