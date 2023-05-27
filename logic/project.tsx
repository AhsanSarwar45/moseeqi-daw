import {
    getDefaultProjectState,
    resetSelectionState,
    resetState,
    setState,
} from "@data/stores/project";
import { useStore } from "@data/stores/project";
import { ProjectSaveData } from "@interfaces/save-data";
import { Track } from "@interfaces/track";
import saveAs from "file-saver";
import { clearHistory } from "./history";
import { addPartToTrack } from "./part";
import {
    changeTracksBpm,
    createTrack,
    deleteAllTracks,
    disposeTracks,
    getTracksSaveData,
} from "./track";
import { synchronizeTone } from "./state";

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
            // TODO: This code is bug-prone.
            // It requires the following order of operations:
            // 1. Dispose tracks
            // 2. Set bpm
            // 3. Synchronize tone
            // 4. Set tracks
            // 5. resetSelectionState
            // 6. Synchronize tone
            // A change in this order will make it not work
            // TODO: Change the architecture to avoid this.

            disposeTracks(draftState.tracks);
            draftState.bpm = saveData.bpm;
            synchronizeTone(draftState);

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

            draftState.tracks.clear();
            Array.from(tracks).forEach(([trackId, track]) => {
                draftState.tracks.set(trackId, track);
            });
            draftState.projectName = saveData.projectName;
            draftState.projectLength = saveData.projectLength;
            resetSelectionState(draftState);
            synchronizeTone(draftState);
        },
        "Open project",
        false
    );

    clearHistory();
};
