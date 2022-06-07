import { Draft } from "immer";

type ValidRecipeReturnType<State> = State | void | undefined;

export type Recipe<T> = (
    draftState: Draft<T>
) => ValidRecipeReturnType<Draft<T>>;
