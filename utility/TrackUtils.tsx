import { getTrackId } from "@Data/Id";
import { useLoadingStore } from "@Data/IsLoadingStore";
import { getState, setState } from "@Data/Store";
import { StoreState, useStore } from "@Data/Store";
import { Instruments } from "@Instruments/Instruments";
import { Instrument } from "@Interfaces/Instrument";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { PartSaveData, TrackSaveData } from "@Interfaces/SaveData";
import { Track } from "@Interfaces/Track";
import { Id, NoteRecord, TrackMap, TrackRecord } from "@Types/Types";
import { produce, Draft } from "immer";
import * as Tone from "tone";
import { GetPartNote, MapNoteTime } from "./NoteUtils";
import {
    AddPartToTrack,
    CreatePart,
    GetPartsSaveData,
    MapPartTime,
} from "./PartUtils";
import CreateSampler from "./SamplerUtils";

export const DisposeTracks = (tracks: Draft<TrackMap>) => {
    tracks.forEach((track) => {
        track.parts.forEach((part) => {
            part.tonePart?.clear(); // TODO: find if necessary
            part.tonePart?.dispose();
        });
    });
};

export const SetTrackMute = (track: Draft<Track>, muted: boolean) => {
    track.parts.forEach((part) => {
        (part.tonePart as Tone.Part).mute = muted;
    });

    track.muted = muted;
};

export const SetTrackSoloMute = (track: Draft<Track>, muted: boolean) => {
    track.parts.forEach((part) => {
        (part.tonePart as Tone.Part).mute = muted;
    });

    track.soloMuted = muted;
    if (muted) {
        track.muted = false;
    }
};

export const SetTrackSolo = (
    track: Draft<Track>,
    allTracks: Draft<Track>[],
    soloed: boolean
) => {
    track.soloed = soloed;

    if (track.soloed) {
        SetTrackMute(track, false);
        SetTrackSoloMute(track, false);
    }

    const numTracksSoloed = allTracks.filter((track) => track.soloed).length;

    if (numTracksSoloed > 0) {
        allTracks.forEach((track) => {
            if (!track.soloed && !track.muted) {
                SetTrackSoloMute(track, true);
            }
        });
    } else {
        allTracks.forEach((track) => {
            SetTrackSoloMute(track, false);
        });
    }
};

export const SetTrackRelease = (track: Draft<Track>, value: number) => {
    track.sampler.release = value;
};

export const SetTrackAttack = (track: Draft<Track>, value: number) => {
    track.sampler.attack = value;
};

export const GetTracksSaveData = (tracks: Track[]): TrackSaveData[] => {
    // the sampler property makes the save data circular so we remove it
    // we also remove the meter property as it is not needed
    return tracks.map((track) => {
        return {
            name: track.name,
            instrument: { ...track.instrument },
            parts: GetPartsSaveData(track.parts),
            muted: track.muted,
            soloed: track.soloed,
            soloMuted: track.soloMuted,
        };
    });
};

export const ChangeTracksBpm = (
    tracks: Draft<TrackMap>,
    oldBpm: number,
    newBpm: number
) => {
    const newTimeMultiplier = oldBpm / newBpm;

    tracks.forEach((track) => {
        track.parts.forEach((part) => {
            part.tonePart?.clear();
            MapPartTime(part, (time) => time * newTimeMultiplier);

            part.notes.forEach((note) => {
                MapNoteTime(note, (time) => time * newTimeMultiplier);

                part.tonePart?.add(GetPartNote(note));
            });
        });
    });
};

export const StopTrackParts = (track: Draft<Track>) => {
    track.parts.forEach((part) => {
        part.tonePart?.stop();
    });
};

export const ClearTrack = (track: Draft<Track>) => {
    track.parts.forEach((part) => {
        part.tonePart?.clear();
        part.notes.clear();
    });
};

export const CreateTrack = (instrument: Instrument): TrackRecord => {
    useLoadingStore.setState({ isLoading: true });

    const meter = new Tone.Meter();

    const sampler = CreateSampler(instrument, () =>
        useLoadingStore.setState({ isLoading: false })
    )
        .toDestination()
        .connect(meter);

    return [
        getTrackId(),
        {
            name: instrument.name,
            instrument: instrument,
            parts: new Map<Id, Part>([]),
            sampler: sampler,
            meter: meter,
            muted: false,
            soloed: false,
            soloMuted: false,
        },
    ];
};

export const CreateTrackFromIndex = (instrumentIndex: number): TrackRecord => {
    const instrument = Instruments[instrumentIndex];
    return CreateTrack(instrument);
};

export const GetTrackIndexFromId = (trackId: Id): Id => {
    return Array.from(useStore.getState().tracks.keys()).findIndex(
        (id) => id === trackId
    );
};

export const CopyParts = (
    fromTrack: Track,
    toTrackRecord: Draft<TrackRecord>
) => {
    fromTrack.parts.forEach((part) => {
        const partRecord = CreatePart(
            part.startTime,
            part.stopTime,
            part.rowIndex,
            part.notes
        );
        AddPartToTrack(partRecord, toTrackRecord);
    });
};

export const GetLastSelectedTrackConst = (): Track => {
    return getState().tracks.get(getState().lastSelectedTrackId) as Track;
};

export const GetSelectedTrack = (
    draftState: Draft<StoreState> = getState()
): Draft<Track> => {
    return draftState.tracks.get(
        draftState.lastSelectedTrackId
    ) as Draft<Track>;
};

export const GetSelectedTrackRecord = (
    draftState: Draft<StoreState> = getState()
): Draft<TrackRecord> => {
    return [
        draftState.lastSelectedTrackId,
        draftState.tracks.get(draftState.lastSelectedTrackId) as Draft<Track>,
    ];
};

export const DeleteSelectedTracks = () => {
    setState((draftState) => {
        draftState.selectedTracksId.forEach((trackId) => {
            const track = draftState.tracks.get(trackId) as Track;
            StopTrackParts(track);
            draftState.tracks.delete(trackId);
        });

        const trackIds = Array.from(draftState.tracks.keys());
        draftState.lastSelectedTrackId = trackIds.length ? trackIds[0] : -1;
        draftState.selectedTracksId = trackIds.length ? [trackIds[0]] : [];
        draftState.selectedPartsId = [];
        draftState.selectedNotesId = [];
    }, "Delete track");
};

export const GetTrackEntries = (): TrackRecord[] => {
    return Array.from(useStore.getState().tracks.entries());
};
export const GetTrackIds = (): Id[] => {
    return Array.from(useStore.getState().tracks.keys());
};

export const SetLastSelectedTrackId = (trackId: Id) => {
    setState((draftState) => {
        draftState.lastSelectedTrackId = trackId;
    }, "Select track");
};

export const SetSelectedTrackAttack = (attack: number) => {
    setState((draftState) => {
        const selectedTrack = GetSelectedTrack(draftState);
        if (selectedTrack) SetTrackAttack(selectedTrack, attack);
    }, "Set track attack");
};

export const SetSelectedTrackRelease = (release: number) => {
    setState((draftState) => {
        const selectedTrack = GetSelectedTrack(draftState);
        if (selectedTrack) SetTrackRelease(selectedTrack, release);
    }, "Set track release");
};

export const DuplicateSelectedTracks = () => {
    const tracks = useStore.getState().tracks;

    tracks.forEach((track) => {
        const newTrack = CreateTrack(track.instrument);
        AddTrack(newTrack);
        CopyParts(track, newTrack);
    });
};

export const ClearSelectedTrack = () => {
    setState((draftState) => {
        const selectedTrack = GetSelectedTrack(draftState);
        if (selectedTrack) ClearTrack(selectedTrack);
    }, "Clear track");
};

export const ToggleTrackMute = (trackId: Id) => {
    setState((draftState) => {
        const track = draftState.tracks.get(trackId) as Track;
        SetTrackMute(track, !track.muted);
    }, "Mute track");
};

export const ToggleTrackSolo = (trackId: Id) => {
    setState((draftState) => {
        const track = draftState.tracks.get(trackId) as Track;
        SetTrackSolo(
            track,
            Array.from(draftState.tracks.values()),
            !track.soloed
        );
    }, "Solo track");
};

export const AddTrack = ([trackId, track]: Draft<TrackRecord>) => {
    setState((draftState) => {
        draftState.tracks.set(trackId, track);
    }, "Add track");
};

export const AddInstrumentTrack = (instrument: Instrument) => {
    const track = CreateTrack(instrument);
    AddTrack(track);
};

export const AddTrackFromInstrumentIndex = (instrumentIndex: number) => {
    const instrument = Instruments[instrumentIndex];
    AddInstrumentTrack(instrument);
};

export const DeleteAllTracks = () => {
    setState((draftState) => {
        draftState.tracks.forEach((track) => {
            // TODO: maybe we should clear parts
            StopTrackParts(track);
        });
        draftState.tracks.clear();
        draftState.selectedTracksId = [];

        draftState.selectedPartsId = [];
        draftState.selectedNotesId = [];
    }, "Delete all tracks");
};
