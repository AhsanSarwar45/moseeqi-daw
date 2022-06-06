// 0: Stopped, 1: Playing, 2: Paused
// TODO: Change to strings
// export type PlaybackState = 0 | 1 | 2;

import { StoreState } from "@Data/Store";

export type Dimension = string | number;

export type PartialState =
    | StoreState
    | Partial<StoreState>
    | ((state: StoreState) => StoreState | Partial<StoreState>);
