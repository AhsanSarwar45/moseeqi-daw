import { getTrackId } from "@data/Id";
import { useLoadingStore } from "@data/stores/loading-status";
import { getState, setState } from "@data/stores/project";
import { StoreState, useStore } from "@data/stores/project";
import { Instruments } from "@Instruments/Instruments";
import { Instrument } from "@Interfaces/Instrument";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";
import { PartSaveData, TrackSaveData } from "@Interfaces/SaveData";
import { Track } from "@Interfaces/Track";
import { Id, NoteRecord, TrackMap, TrackRecord } from "@Types/Types";
import { produce, Draft } from "immer";
import * as Tone from "tone";
import { getNotesSaveData, getPartNote, mapNoteTime } from "./note";
import {
    addPartToTrack as addPartToTrack,
    createPart,
    getPartsSaveData,
    mapPartTime,
} from "./part";
import CreateSampler from "./sampler";

export const disposeTracks = (tracks: Draft<TrackMap>) => {
    tracks.forEach((track) => {
        track.parts.forEach((part) => {
            part.tonePart?.stop();
            part.tonePart?.clear(); // TODO: find if necessary
            part.tonePart?.dispose();
        });
    });
};

export const setTrackMute = (track: Draft<Track>, muted: boolean) => {
    track.parts.forEach((part) => {
        (part.tonePart as Tone.Part).mute = muted;
    });

    track.muted = muted;
};

export const setTrackSoloMute = (track: Draft<Track>, muted: boolean) => {
    track.parts.forEach((part) => {
        (part.tonePart as Tone.Part).mute = muted;
    });

    track.soloMuted = muted;
    if (muted) {
        track.muted = false;
    }
};

export const setTrackSolo = (
    track: Draft<Track>,
    allTracks: Draft<Track>[],
    soloed: boolean
) => {
    track.soloed = soloed;

    if (track.soloed) {
        setTrackMute(track, false);
        setTrackSoloMute(track, false);
    }

    const numTracksSoloed = allTracks.filter((track) => track.soloed).length;

    if (numTracksSoloed > 0) {
        allTracks.forEach((track) => {
            if (!track.soloed && !track.muted) {
                setTrackSoloMute(track, true);
            }
        });
    } else {
        allTracks.forEach((track) => {
            setTrackSoloMute(track, false);
        });
    }
};

export const setTrackRelease = (track: Draft<Track>, value: number) => {
    track.sampler.release = value;
};

export const setTrackAttack = (track: Draft<Track>, value: number) => {
    track.sampler.attack = value;
};

export const getTracksSaveData = (tracks: TrackMap): TrackSaveData[] => {
    // the sampler property makes the save data circular so we remove it
    // we also remove the meter property as it is not needed
    console.log(tracks);
    return Array.from(tracks).map(([id, track]) => {
        return {
            name: track.name,
            instrument: { ...track.instrument },
            parts: getPartsSaveData(Array.from(track.parts.values())),
            muted: track.muted,
            soloed: track.soloed,
            soloMuted: track.soloMuted,
        };
    });
};

export const changeTracksBpm = (
    tracks: Draft<TrackMap>,
    oldBpm: number,
    newBpm: number
) => {
    const newTimeMultiplier = oldBpm / newBpm;

    tracks.forEach((track) => {
        track.parts.forEach((part) => {
            part.tonePart?.clear();
            mapPartTime(part, (time) => time * newTimeMultiplier);

            part.notes.forEach((note) => {
                mapNoteTime(note, (time) => time * newTimeMultiplier);

                part.tonePart?.add(getPartNote(note));
            });
        });
    });
};

export const stopTrackParts = (track: Draft<Track>) => {
    track.parts.forEach((part) => {
        part.tonePart?.stop();
    });
};

export const clearTrack = (track: Draft<Track>) => {
    track.parts.forEach((part) => {
        part.tonePart?.clear();
        part.notes.clear();
    });
};

export const createTrack = (
    instrument: Instrument,
    partsData: Array<PartSaveData> = [],
    name: string = instrument.name,
    muted: boolean = false,
    soloed: boolean = false,
    soloMuted: boolean = false
): TrackRecord => {
    useLoadingStore.setState({ isLoading: true });

    const meter = new Tone.Meter();

    const sampler = CreateSampler(instrument, () =>
        useLoadingStore.setState({ isLoading: false })
    )
        .toDestination()
        .connect(meter);

    const trackRecord: TrackRecord = [
        getTrackId(),
        {
            name: name,
            instrument: instrument,
            parts: new Map<Id, Part>(),
            sampler: sampler,
            meter: meter,
            muted: muted,
            soloed: soloed,
            soloMuted: soloMuted,
        },
    ];

    const [trackId, track] = trackRecord;

    partsData.forEach((partData) => {
        const [partId, part] = createPart(
            partData.startTime,
            partData.stopTime,
            partData.rowIndex,
            partData.notes,
            trackRecord
        );

        track.parts.set(partId, part);
    });

    return trackRecord;
};

export const createTrackFromIndex = (instrumentIndex: number): TrackRecord => {
    const instrument = Instruments[instrumentIndex];
    return createTrack(instrument);
};

export const getTrackIndexFromId = (trackId: Id): Id => {
    return Array.from(useStore.getState().tracks.keys()).findIndex(
        (id) => id === trackId
    );
};

export const copyPartsToTrack = (
    fromTrack: Track,
    toTrackRecord: Draft<TrackRecord>
) => {
    fromTrack.parts.forEach((part) => {
        const partRecord = createPart(
            part.startTime,
            part.stopTime,
            part.rowIndex,
            getNotesSaveData(Array.from(part.notes.values()))
        );
        addPartToTrack(partRecord, toTrackRecord);
    });
};

export const getLastSelectedTrackConst = (): Track => {
    return getState().tracks.get(getState().lastSelectedTrackId) as Track;
};

export const getSelectedTrack = (
    draftState: Draft<StoreState> = getState()
): Draft<Track> => {
    return draftState.tracks.get(
        draftState.lastSelectedTrackId
    ) as Draft<Track>;
};

export const getSelectedTrackRecord = (
    draftState: Draft<StoreState> = getState()
): Draft<TrackRecord> => {
    return [
        draftState.lastSelectedTrackId,
        draftState.tracks.get(draftState.lastSelectedTrackId) as Draft<Track>,
    ];
};

export const deleteSelectedTracks = () => {
    setState((draftState) => {
        draftState.selectedTracksId.forEach((trackId) => {
            const track = draftState.tracks.get(trackId) as Track;
            stopTrackParts(track);
            draftState.tracks.delete(trackId);
        });

        const trackIds = Array.from(draftState.tracks.keys());
        draftState.lastSelectedTrackId = trackIds.length ? trackIds[0] : -1;
        draftState.selectedTracksId = trackIds.length ? [trackIds[0]] : [];
        draftState.selectedPartsId = [];
        draftState.selectedNotesId = [];
    }, "Delete track");
};

export const getTrackEntries = (): TrackRecord[] => {
    return Array.from(useStore.getState().tracks.entries());
};
export const getTrackIds = (): Id[] => {
    return Array.from(useStore.getState().tracks.keys());
};

export const setLastSelectedTrackId = (trackId: Id) => {
    setState((draftState) => {
        draftState.lastSelectedTrackId = trackId;
    }, "Select track");
};

export const setSelectedTrackAttack = (attack: number) => {
    setState((draftState) => {
        const selectedTrack = getSelectedTrack(draftState);
        if (selectedTrack) setTrackAttack(selectedTrack, attack);
    }, "Set track attack");
};

export const setSelectedTrackRelease = (release: number) => {
    setState((draftState) => {
        const selectedTrack = getSelectedTrack(draftState);
        if (selectedTrack) setTrackRelease(selectedTrack, release);
    }, "Set track release");
};

export const duplicateSelectedTracks = () => {
    const tracks = useStore.getState().tracks;

    tracks.forEach((track) => {
        const newTrack = createTrack(track.instrument);
        addTrack(newTrack);
        copyPartsToTrack(track, newTrack);
    });
};

export const clearSelectedTrack = () => {
    setState((draftState) => {
        const selectedTrack = getSelectedTrack(draftState);
        if (selectedTrack) clearTrack(selectedTrack);
    }, "Clear track");
};

export const toggleTrackMute = (trackId: Id) => {
    setState((draftState) => {
        const track = draftState.tracks.get(trackId) as Track;
        setTrackMute(track, !track.muted);
    }, "Mute track");
};

export const toggleTrackSolo = (trackId: Id) => {
    setState((draftState) => {
        const track = draftState.tracks.get(trackId) as Track;
        setTrackSolo(
            track,
            Array.from(draftState.tracks.values()),
            !track.soloed
        );
    }, "Solo track");
};

export const addTrack = ([trackId, track]: Draft<TrackRecord>) => {
    setState((draftState) => {
        draftState.tracks.set(trackId, track);
    }, "add track");
};

export const addInstrumentTrack = (instrument: Instrument) => {
    const track = createTrack(instrument);
    addTrack(track);
};

export const addTrackFromInstrumentIndex = (instrumentIndex: number) => {
    const instrument = Instruments[instrumentIndex];
    addInstrumentTrack(instrument);
};

export const deleteAllTracks = () => {
    setState((draftState) => {
        draftState.tracks.forEach((track) => {
            // TODO: maybe we should clear parts
            stopTrackParts(track);
        });
        draftState.tracks.clear();
        draftState.selectedTracksId = [];

        draftState.selectedPartsId = [];
        draftState.selectedNotesId = [];
    }, "Delete all tracks");
};
