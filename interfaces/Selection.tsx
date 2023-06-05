import { Id } from "@custom-types/types";

export enum SelectionType {
    None,
    Part,
    Note,
    Track,
}

export namespace SelectionType {
    export function toString(selectionType: SelectionType): string {
        return SelectionType[selectionType];
    }

    export function fromString(selectionType: string): SelectionType {
        return (SelectionType as any)[selectionType];
    }
}

// export interface NoteSelectionIndex {
//     noteIndex: number;
//     partIndex: number;
// }

// export interface PartSelectionIndex {
//     partIndex: number;
//     trackIndex: number;
// }

// export interface TrackSelectionIndex {
//     trackIndex: number;
// }

export interface SelectionSubId {
    readonly containerId: Id;
    readonly entityId: Id;
}

export type SelectionId = Id | SelectionSubId;

// export interface Selection {
//     type: SelectionType;
//     indices:
//         | Array<NoteSelectionIndex>
//         | Array<PartSelectionIndex>
//         | Array<TrackSelectionIndex>;
// }
