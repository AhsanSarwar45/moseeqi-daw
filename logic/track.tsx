import { getTrackId } from "@data/id";
import { useLoadingStore } from "@data/stores/loading-status";
import {
    getState,
    selectSelectedTracksIds,
    setState,
} from "@data/stores/project";
import { StoreState, useStore } from "@data/stores/project";
import { Instruments } from "@instruments/instruments";
import { Instrument } from "@interfaces/instrument";
import { Note } from "@interfaces/note";
import { Part } from "@interfaces/part";
import { PartSaveData, TrackSaveData } from "@interfaces/save-data";
import { Track } from "@interfaces/track";
import {
    Id,
    NoteRecord,
    PartMap,
    TrackMap,
    TrackRecord,
} from "@custom-types/types";
import { produce, Draft } from "immer";
import * as Tone from "tone";
import { getNotesSaveData, getPartNote, mapNoteTime } from "./note";
import {
    addPartToTrack,
    getPartSaveData,
    getPartsSaveData,
    mapPartTime,
} from "./part";
import CreateSampler from "./sampler";
import { create } from "lodash";

export const disposeTracks = (tracks: Draft<TrackMap>) => {
    tracks.forEach((track) => {
        track.parts.forEach((part) => {
            part.tonePart.stop();
            part.tonePart.clear(); // TODO: find if necessary
            part.tonePart.dispose();
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
            part.tonePart.clear();
            mapPartTime(part, (time) => time * newTimeMultiplier);

            part.notes.forEach((note) => {
                mapNoteTime(note, (time) => time * newTimeMultiplier);

                part.tonePart.add(getPartNote(note));
            });
        });
    });
};

export const stopTrackParts = (track: Draft<Track>) => {
    track.parts.forEach((part) => {
        part.tonePart.stop();
    });
};

export const clearTrack = (track: Draft<Track>) => {
    track.parts.forEach((part) => {
        part.tonePart.clear();
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

    partsData.forEach((partData) => {
        addPartToTrack(
            trackRecord,
            partData.startTime,
            partData.stopTime,
            partData.rowIndex,
            partData.notes
        );
    });

    return trackRecord;
};

export const createTrackFromIndex = (instrumentIndex: number): TrackRecord => {
    const instrument = Instruments[instrumentIndex];
    return createTrack(instrument);
};

export const createTrackFromTrack = (track: Track) => {
    const trackRecord = createTrack(
        track.instrument,
        getPartsSaveData(Array.from(track.parts.values())),
        track.name,
        track.muted,
        track.soloed,
        track.soloMuted
    );
    return trackRecord;
};

export const addTrack = ([trackId, track]: Draft<TrackRecord>) => {
    setState((draftState) => {
        draftState.tracks.set(trackId, track);
    }, "Add track");
};

export const addInstrumentTrack = (instrument: Instrument) => {
    const track = createTrack(instrument);
    addTrack(track);
};

export const addTrackFromInstrumentIndex = (instrumentIndex: number) => {
    const instrument = Instruments[instrumentIndex];
    addInstrumentTrack(instrument);
};

export const getTrackIndexFromId = (trackId: Id): Id => {
    return Array.from(useStore.getState().tracks.keys()).findIndex(
        (id) => id === trackId
    );
};

export const copyPartsToTrack = (
    parts: Draft<PartMap>,
    trackRecord: Draft<TrackRecord>
) => {
    parts.forEach((part) => {
        addPartToTrack(
            trackRecord,
            part.startTime,
            part.stopTime,
            part.rowIndex,
            getNotesSaveData(Array.from(part.notes.values()))
        );
    });
};

export const getLastSelectedTrackId = (
    state: Draft<StoreState> = getState()
): number => {
    return state.selectedTracksId.slice(-1)[0] ?? -1;
};

export const getLastSelectedTrackConst = (): Track | undefined => {
    return getState().tracks.get(getState().selectedTracksId.slice(-1)[0]);
};

export const getLastSelectedTrack = (
    state: Draft<StoreState> = getState()
): Draft<Track> => {
    return state.tracks.get(getLastSelectedTrackId(state)) as Draft<Track>;
};

export const getLastSelectedTrackRecord = (
    state: Draft<StoreState> = getState()
): Draft<TrackRecord> | undefined => {
    const id = getLastSelectedTrackId(state);
    if (id == -1) return undefined;
    return [id, state.tracks.get(id) as Draft<Track>];
};

export const deleteSelectedTracks = () => {
    setState((draftState) => {
        draftState.selectedTracksId.forEach((trackId) => {
            const track = draftState.tracks.get(trackId) as Track;
            stopTrackParts(track);
            draftState.tracks.delete(trackId);
        });

        const trackIds = Array.from(draftState.tracks.keys());
        draftState.selectedTracksId = trackIds.length ? [trackIds[0]] : [];
        draftState.selectedPartsId = [];
        draftState.selectedNotesId = [];
    }, "Delete track");
};

export const copySelectedTracks = () => {
    const selectedTracksId = getState().selectedTracksId;
    setState((draftState) => {
        draftState.copiedTracksId = selectedTracksId;
    }, "Copy tracks");
};

export const pasteSelectedTracks = () => {
    if (useLoadingStore.getState().isLoading) return;
    const copiedTracksId = getState().copiedTracksId;
    setState((draftState) => {
        copiedTracksId.forEach((trackId) => {
            const track = getState().tracks.get(trackId);
            if (track) {
                const [newTrackId, newTrack] = createTrackFromTrack(track);
                draftState.tracks.set(newTrackId, newTrack);
            }
        });
        draftState.selectedTracksId = copiedTracksId;
    }, "Paste tracks");
};

export const getTrackEntries = (): TrackRecord[] => {
    return Array.from(useStore.getState().tracks.entries());
};
export const getTrackIds = (): Id[] => {
    return Array.from(useStore.getState().tracks.keys());
};

// export const setLastSelectedTrackId = (trackId: Id) => {
//     setState((draftState) => {
//         draftState.lastSelectedTrackId = trackId;
//     }, "Select track");
// };

export const setSelectedTrackAttack = (attack: number) => {
    setState((draftState) => {
        const selectedTrack = getLastSelectedTrack(draftState);
        if (selectedTrack) setTrackAttack(selectedTrack, attack);
    }, "Set track attack");
};

export const setSelectedTrackRelease = (release: number) => {
    setState((draftState) => {
        const selectedTrack = getLastSelectedTrack(draftState);
        if (selectedTrack) setTrackRelease(selectedTrack, release);
    }, "Set track release");
};

export const createTrackFromTrackRecord = (trackRecord: TrackRecord) => {
    const [trackId, track] = trackRecord;
    return createTrackFromTrack(track);
};

export const duplicateSelectedTracks = () => {
    const selectedTracksId = getState().selectedTracksId;
    setState((draftState) => {
        const newTrackIds = new Array<Id>();
        selectedTracksId.forEach((trackId) => {
            const track = getState().tracks.get(trackId);
            if (track) {
                const [newTrackId, newTrack] = createTrackFromTrack(track);
                draftState.tracks.set(newTrackId, newTrack);
                newTrackIds.push(newTrackId);
            }
        });
        draftState.selectedTracksId = newTrackIds;
    }, "Duplicate selected tracks");
};

export const clearSelectedTrack = () => {
    setState((draftState) => {
        const selectedTrack = getLastSelectedTrack(draftState);
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
