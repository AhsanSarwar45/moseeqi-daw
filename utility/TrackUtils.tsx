import { getTrackId } from "@Data/Id";
import { useLoadingStore } from "@Data/IsLoadingStore";
import { SetState } from "@Data/Store";
import { StoreState, useStore } from "@Data/Store";
import { Instruments } from "@Instruments/Instruments";
import { Instrument } from "@Interfaces/Instrument";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { PartSaveData, TrackSaveData } from "@Interfaces/SaveData";
import { Track } from "@Interfaces/Track";
import produce, { Draft } from "immer";
import * as Tone from "tone";
import {
    GetPartNote,
    IsNoteInPart,
    MakeNotePartRelative,
    MapNoteTime,
} from "./NoteUtils";
import {
    AddNoteToPart,
    CreatePart,
    CreateTonePart,
    ExtendPart,
    GetNewPartStartTime,
    GetNewPartStopTime,
    GetPartsSaveData,
    MapPartTime,
} from "./PartUtils";
import CreateSampler from "./SamplerUtils";

export const DisposeTracks = (tracks: Draft<Track>[]) => {
    tracks.forEach((track) => {
        track.parts.forEach((part) => {
            part.tonePart.dispose();
        });
    });
};

export const SetTrackMute = (track: Draft<Track>, muted: boolean) => {
    track.parts.forEach((part) => {
        part.tonePart.mute = muted;
    });

    track.muted = muted;
};

export const SetTrackSoloMute = (track: Draft<Track>, muted: boolean) => {
    track.parts.forEach((part) => {
        part.tonePart.mute = muted;
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
    tracks: Draft<Track>[],
    oldBpm: number,
    newBpm: number
) => {
    const newTimeMultiplier = oldBpm / newBpm;

    tracks.forEach((track) => {
        track.parts.forEach((part) => {
            part.tonePart.clear();
            MapPartTime(part, (time) => time * newTimeMultiplier);

            part.notes.forEach((note) => {
                MapNoteTime(note, (time) => time * newTimeMultiplier);

                part.tonePart.add(GetPartNote(note));
            });
        });
    });
};

export const StopTrackParts = (track: Draft<Track>) => {
    track.parts.forEach((part) => {
        part.tonePart.stop();
    });
};

export const ClearTrack = (track: Draft<Track>) => {
    track.parts.forEach((part) => {
        part.tonePart.clear();
        part.notes = [];
    });
};

export const CreateTrack = (instrument: Instrument): Track => {
    useLoadingStore.setState({ isLoading: true });

    const meter = new Tone.Meter();

    const sampler = CreateSampler(instrument, () =>
        useLoadingStore.setState({ isLoading: false })
    )
        .toDestination()
        .connect(meter);

    return {
        id: getTrackId(),
        name: instrument.name,
        instrument: instrument,
        parts: [],
        sampler: sampler,
        meter: meter,
        muted: false,
        soloed: false,
        soloMuted: false,
    };
};

export const CreateTrackFromIndex = (instrumentIndex: number): Track => {
    const instrument = Instruments[instrumentIndex];
    return CreateTrack(instrument);
};

export const AddNoteToTrack = (track: Draft<Track>, note: Draft<Note>) => {
    // console.log("add");
    // Check which part the note is in
    const currentPartIndex = track.parts.findIndex((part) =>
        IsNoteInPart(note, part)
    );

    // If the note lies in an existing part, add it to the part
    if (currentPartIndex !== -1) {
        // console.log("existing");
        const part = track.parts[currentPartIndex];

        // if the end of the note lies beyond the end of the part, extend the part
        if (note.stopTime > part.stopTime) {
            ExtendPart(note, part);
        }
        MakeNotePartRelative(note, part);
        AddNoteToPart(note, part);
    }
    // If in not in any existing part, create a new part and add the note to it
    else {
        // console.log("new");

        // TODO: Add snap settings
        const partStartTime = GetNewPartStartTime(note.startTime);
        const partStopTime = GetNewPartStopTime(note.stopTime);
        const newPart = CreatePart(
            partStartTime,
            partStopTime,
            track.sampler,
            []
        );
        MakeNotePartRelative(note, newPart);
        AddNoteToPart(note, newPart);
        track.parts.push(newPart);

        // console.log(track);
    }
};

export const CopyParts = (
    originalTrack: Draft<Track>,
    copiedTrack: Draft<Track>
) => {
    copiedTrack.parts = originalTrack.parts.map((part) => {
        return CreatePart(part.startTime, part.stopTime, copiedTrack.sampler, [
            ...part.notes,
        ]);
    });
};

export const DeleteTrackAtIndex = (index: number) => {
    SetState((draftState) => {
        const trackToDelete = draftState.tracks[index];
        StopTrackParts(trackToDelete);
        (draftState.tracks = draftState.tracks.filter(
            (tracks) => tracks.id !== trackToDelete.id
        )),
            (draftState.selectedTrackIndex =
                draftState.selectedTrackIndex > 0
                    ? draftState.selectedTrackIndex - 1
                    : 0);
        draftState.selectedPartIndices = [];
        draftState.selectedNoteIndices = [];
        draftState.trackCount--;
    }, "Delete track");
};

export const GetSelectedTrack = () => {
    return useStore.getState().tracks[useStore.getState().selectedTrackIndex];
};

export const DeleteSelectedTrack = () => {
    DeleteTrackAtIndex(useStore.getState().selectedTrackIndex);
};

export const SetSelectedTrackAttack = (attack: number) => {
    SetState((draftState) => {
        const selectedTrack = draftState.tracks[draftState.selectedTrackIndex];
        SetTrackAttack(selectedTrack, attack);
    }, "Set track attack");
};

export const SetSelectedTrackRelease = (release: number) => {
    SetState((draftState) => {
        const selectedTrack = draftState.tracks[draftState.selectedTrackIndex];
        SetTrackRelease(selectedTrack, release);
    }, "Set track release");
};

export const DuplicateSelectedTrack = () => {
    const selectedTrack = GetSelectedTrack();
    const newTrack = CreateTrack(selectedTrack.instrument);
    CopyParts(selectedTrack, newTrack);
    AddTrack(newTrack);
};

export const ClearSelectedTrack = () => {
    SetState((draftState) => {
        const selectedTrack = draftState.tracks[draftState.selectedTrackIndex];
        ClearTrack(selectedTrack);
    }, "Clear track");
};

export const ToggleTrackMute = (trackIndex: number) => {
    SetState((draftState) => {
        const track = draftState.tracks[trackIndex];
        SetTrackMute(track, !track.muted);
    }, "Mute track");
};

export const ToggleTrackSolo = (trackIndex: number) => {
    SetState((draftState) => {
        const track = draftState.tracks[trackIndex];
        SetTrackSolo(track, draftState.tracks, !track.soloed);
    }, "Solo track");
};

export const AddTrack = (track: Draft<Track>) => {
    SetState((draftState) => {
        draftState.tracks.push(track);
        draftState.trackCount++;
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
    SetState((draftState) => {
        draftState.tracks.forEach((track) => {
            // TODO: maybe we should clear parts
            StopTrackParts(track);
        });
        draftState.tracks = [];
        draftState.trackCount = 0;
        draftState.selectedTrackIndex = 0;
        draftState.selectedPartIndices = [];
        draftState.selectedNoteIndices = [];
    }, "Delete all tracks");
};

export const SetSelectedTrackIndex = (trackIndex: number) => {
    if (trackIndex === useStore.getState().selectedTrackIndex) return;
    SetState((draftState) => {
        draftState.selectedTrackIndex = trackIndex;
        draftState.selectedNoteIndices = [];
    }, "Select track");
};
