export enum SelectionType {
    None,
    Part,
    Note,
    Track,
}

export interface NoteSelectionIndices {
    noteIndex: number;
    partIndex: number;
    trackIndex: number;
}

export interface PartSelectionIndex {
    partIndex: number;
    trackIndex: number;
}

export interface TrackSelectionIndices {
    trackIndex: number;
}

export interface Selection {
    type: SelectionType;
    indices:
        | Array<NoteSelectionIndices>
        | Array<PartSelectionIndex>
        | Array<TrackSelectionIndices>;
}
