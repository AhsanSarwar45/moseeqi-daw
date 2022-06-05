export enum SelectionType {
    None,
    Part,
    Note,
    Track,
}

export interface NoteSelectionIndex {
    noteIndex: number;
    partIndex: number;
}

export interface PartSelectionIndex {
    partIndex: number;
    trackIndex: number;
}

export interface TrackSelectionIndex {
    trackIndex: number;
}

export interface SubSelectionIndex {
    containerIndex: number;
    selectionIndex: number;
}

export interface Selection {
    type: SelectionType;
    indices:
        | Array<NoteSelectionIndex>
        | Array<PartSelectionIndex>
        | Array<TrackSelectionIndex>;
}
