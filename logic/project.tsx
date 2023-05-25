import {
    getDefaultProjectState,
    resetSelectionState,
    resetState,
    setState,
} from "@data/stores/project";
import { useStore } from "@data/stores/project";
import { ProjectSaveData } from "@Interfaces/SaveData";
import { Track } from "@Interfaces/Track";
import saveAs from "file-saver";
import { clearHistory } from "./history";
import { createPart } from "./part";
import {
    changeTracksBpm,
    createTrack,
    deleteAllTracks,
    disposeTracks,
    getTracksSaveData,
} from "./track";
import { createNote } from "./note";
import { Note } from "@Interfaces/Note";
import { Part } from "@Interfaces/Part";

export const setProjectName = (name: string) => {
    setState((draftState) => {
        draftState.projectName = name;
    }, "Change project name");
};

export const setProjectLength = (length: number) => {
    setState((draftState) => {
        draftState.projectLength = length;
    }, "Change project length");
};

export const createNewProject = () => {
    setState(
        (draftState) => {
            disposeTracks(draftState.tracks);
            draftState.tracks.clear();
            resetState(draftState);
        },
        "Create new project",
        false
    );

    clearHistory();
};

export const saveProjectToFile = () => {
    const data = useStore.getState();

    const saveData: ProjectSaveData = {
        tracks: getTracksSaveData(useStore.getState().tracks),
        bpm: useStore.getState().bpm,
        projectName: data.projectName,
        projectLength: data.projectLength,
    };

    const blob = new Blob([JSON.stringify(saveData)], {
        type: "text/plain;charset=utf-8",
    });

    saveAs(blob, data.projectName + ".msq");
};

export const openProjectFromFile = async (file: File) => {
    const saveData: ProjectSaveData = JSON.parse(await file.text());
    // pendingBpmUpdateRef.current = saveData.bpm;
    setState(
        (draftState) => {
            disposeTracks(draftState.tracks);

            const newTracks = saveData.tracks.map((trackSaveData, index) => {
                return createTrack(
                    trackSaveData.instrument,
                    trackSaveData.parts,
                    trackSaveData.name,
                    trackSaveData.muted,
                    trackSaveData.soloed,
                    trackSaveData.soloMuted
                );
            });

            const tracks = new Map<number, Track>(newTracks);

            changeTracksBpm(tracks, saveData.bpm, draftState.bpm);
            draftState.tracks.clear();
            Array.from(tracks).forEach(([trackId, track]) => {
                draftState.tracks.set(trackId, track);
            });
            draftState.bpm = saveData.bpm;
            draftState.projectName = saveData.projectName;
            draftState.projectLength = saveData.projectLength;
            draftState.lastSelectedTrackId = tracks.size
                ? Array.from(tracks.keys())[0]
                : -1;
            resetSelectionState(draftState);
            // // Convert track to current bpm
        },
        "Open project",
        false
    );

    clearHistory();
};
