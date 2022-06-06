import { useStore } from "@Data/Store";
import { useUndoStore } from "@Data/UndoStore";

export const Undo = () => {
    useUndoStore.setState((state) => {
        const pastStatesCopy = [...state.pastStates];
        const futureStatesCopy = [...state.futureStates];
        const pastState = pastStatesCopy.pop();
        if (pastState) {
            console.log("undo");
            useStore.setState(pastState.patch);
            futureStatesCopy.push(pastState);
        }

        return {
            pastStates: pastStatesCopy,
            futureStates: futureStatesCopy,
        };
    });
};

export const Redo = () => {
    useUndoStore.setState((state) => {
        const pastStatesCopy = [...state.pastStates];
        const futureStatesCopy = [...state.futureStates];
        const futureState = futureStatesCopy.pop();
        if (futureState) {
            console.log("redo");

            useStore.setState(futureState.patch);
            pastStatesCopy.push(futureState);
        }

        return {
            pastStates: pastStatesCopy,
            futureStates: futureStatesCopy,
        };
    });
};

export const ClearHistory = () => {
    useUndoStore.setState({
        pastStates: [],
        futureStates: [],
    });
};
