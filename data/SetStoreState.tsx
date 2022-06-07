import { PartialState } from "@Types/Types";
import produce, { Draft } from "immer";
import { StoreState, useStore } from "./Store";

let isUndoHistoryEnabled = true;

export const DisableUndoHistory = () => {
    isUndoHistoryEnabled = false;
};

export const EnableUndoHistory = () => {
    isUndoHistoryEnabled = true;
};

declare type ValidRecipeReturnType<State> = State | void | undefined;

export const SetState = (
    recipe: (
        draftState: Draft<StoreState>
    ) => ValidRecipeReturnType<Draft<StoreState>>,
    actionName: string,
    addToUndoHistory: boolean = true
) => {
    console.log(actionName);
    useStore.setState(produce(useStore.getState(), recipe));
};

// export const SetStoreState = (
//     partialState: PartialState,
//     actionName: string,
//     addToUndoHistory: boolean = true
// ) => {
//     const prevState = { ...useStore.getState() };
//     const nextState =
//         typeof partialState === "function"
//             ? partialState(prevState)
//             : partialState;

//     if (isUndoHistoryEnabled && addToUndoHistory) {
//         // const historyState: HistoryState = {
//         //     actionName: actionName,
//         //     patch: GetSaveStateDiff(prevState, nextState),
//         // };
//         // // useUndoStore.setState((prev) => ({
//         // //     pastStates: [...prev.pastStates, historyState],
//         // //     futureStates: [],
//         // // }));
//         // console.log(historyState);
//     }
//     console.log(nextState);

//     useStore.setState(nextState);
// };
