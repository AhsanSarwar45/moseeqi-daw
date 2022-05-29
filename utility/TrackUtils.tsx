import { GetIdCallback } from "@Hooks/useNumId";
import { Instruments } from "@Instruments/Instruments";
import { TrackSaveData } from "@Interfaces/SaveData";
import { Track } from "@Interfaces/Track";
import * as Tone from "tone";
import { GetPartNote } from "./NoteUtils";
import { CreateTonePart } from "./PartUtils";
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

export const GetTracksSaveData = (
    tracks: Array<Track>
): Array<TrackSaveData> => {
    // the sampler property makes the save data circular so we remove it
    // we also remove the meter property as it is not needed
    return tracks.map((track) => {
        return {
            name: track.name,
            instrument: track.instrument,
            parts: track.parts,
            muted: track.muted,
            soloed: track.soloed,
            soloMuted: track.soloMuted,
        };
    });
};

export const ChangeTrackBpm = (
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

const CreateTrack = (
    instrumentIndex: number,
    onLoadInstrumentStart: (instruments: number) => void,
    onLoadInstrumentEnd: () => void,
    getPartId: GetIdCallback
): Track => {
    // Causes the loading modal to show
    onLoadInstrumentStart(1);
    const instrument = Instruments[instrumentIndex];

    const meter = new Tone.Meter();

    const sampler = CreateSampler(instrument, () => onLoadInstrumentEnd())
        .toDestination()
        .connect(meter);

    const tonePart = CreateTonePart(sampler).start(0);

    return {
        name: instrument.name,
        instrument: instrument,
        parts: [
            {
                id: getPartId(),
                tonePart: tonePart,
                startTime: 0,
                stopTime: 8,
                notes: [],
            },
        ],
        sampler: sampler,
        meter: meter,
        muted: false,
        soloed: false,
        soloMuted: false,
    };
};

export default CreateTrack;
