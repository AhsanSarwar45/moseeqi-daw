import { getTrackId } from "@Data/Id";
import { useLoadingStore } from "@Data/IsLoadingStore";
import { useTracksStore } from "@Data/TracksStore";
import { Instruments } from "@Instruments/Instruments";
import { Instrument } from "@Interfaces/Instrument";
import { Note } from "@Interfaces/Note";
import { TrackSaveData } from "@Interfaces/SaveData";
import { Track } from "@Interfaces/Track";
import * as Tone from "tone";
import { GetPartNote, IsNoteInPart, MakeNotePartRelative } from "./NoteUtils";
import {
    AddNoteToPart,
    CreatePart,
    CreateTonePart,
    ExtendPart,
    GetNewPartStartTime,
    GetNewPartStopTime,
} from "./PartUtils";
import CreateSampler from "./SamplerUtils";

export const DisposeTracks = (tracks: Array<Track>) => {
    tracks.forEach((track) => {
        track.parts.forEach((part) => {
            part.tonePart.dispose();
        });
    });
};

export const SetTrackMute = (track: Track, muted: boolean) => {
    track.parts.forEach((part) => {
        part.tonePart.mute = muted;
    });

    track.muted = muted;
};

export const SetTrackSoloMute = (track: Track, muted: boolean) => {
    track.parts.forEach((part) => {
        part.tonePart.mute = muted;
    });

    track.soloMuted = muted;
    if (muted) {
        track.muted = false;
    }
};

export const SetTrackSolo = (
    track: Track,
    allTracks: Array<Track>,
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

export const SetTrackRelease = (track: Track, value: number) => {
    track.sampler.release = value;
};

export const SetTrackAttack = (track: Track, value: number) => {
    track.sampler.attack = value;
};

export const GetTracksSaveData = (
    tracks: Array<Track>
): Array<TrackSaveData> => {
    // the sampler property makes the save data circular so we remove it
    // we also remove the meter property as it is not needed
    return tracks.map((track) => {
        return {
            id: track.id,
            name: track.name,
            instrument: track.instrument,
            parts: track.parts,
            muted: track.muted,
            soloed: track.soloed,
            soloMuted: track.soloMuted,
        };
    });
};

export const ChangeTracksBpm = (
    tracks: Array<Track>,
    oldBpm: number,
    newBpm: number
) => {
    const newTimeMultiplier = oldBpm / newBpm;

    tracks.forEach((track) => {
        track.parts.forEach((part) => {
            part.tonePart.clear();
            part.startTime *= newTimeMultiplier;
            part.stopTime *= newTimeMultiplier;
            part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);

            part.notes.forEach((note) => {
                note.startTime *= newTimeMultiplier;
                note.stopTime *= newTimeMultiplier;
                note.duration *= newTimeMultiplier;

                part.tonePart.add(GetPartNote(note));
            });
        });
    });
};

export const StopTrackParts = (track: Track) => {
    track.parts.forEach((part) => {
        part.tonePart.stop();
    });
};

export const ClearTrack = (track: Track) => {
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

export const GetTracksCopy = () => {
    return [...useTracksStore.getState().tracks];
};

export const AddNoteToTrack = (track: Track, note: Note) => {
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

export const CopyParts = (originalTrack: Track, copiedTrack: Track) => {
    copiedTrack.parts = originalTrack.parts.map((part) => {
        return CreatePart(part.startTime, part.stopTime, copiedTrack.sampler, [
            ...part.notes,
        ]);
    });
};

export const GetSelectedTrack = (
    tracks: Array<Track> = useTracksStore.getState().tracks
): Track => {
    return tracks[useTracksStore.getState().selectedTrackIndex];
};
