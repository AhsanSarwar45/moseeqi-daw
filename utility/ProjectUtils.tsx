import {
    defaultBPM,
    defaultInstrumentIndex,
    defaultProjectName,
} from "@Data/Defaults";
import { setState } from "@Data/Store";
import { useStore } from "@Data/Store";
import { useUndoStore } from "@Data/UndoStore";
import { SaveData } from "@Interfaces/SaveData";
import { Track } from "@Interfaces/Track";
import saveAs from "file-saver";
import { ClearHistory } from "./HistoryUtils";
import { CreatePart } from "./PartUtils";
import {
    ChangeTracksBpm,
    CreateTrack,
    CreateTrackFromIndex,
    DisposeTracks,
    GetTracksSaveData,
} from "./TrackUtils";

export const SetProjectName = (name: string) => {
    setState((draftState) => {
        draftState.projectName = name;
    }, "Change project name");
};

export const SetProjectLength = (length: number) => {
    setState((draftState) => {
        draftState.projectLength = length;
    }, "Change project length");
};

export const CreateNewProject = () => {
    setState(
        (draftState) => {
            DisposeTracks(draftState.tracks);

            draftState.tracks = [CreateTrackFromIndex(defaultInstrumentIndex)];
            draftState.bpm = defaultBPM;
            draftState.projectName = defaultProjectName;
        },
        "Create new project",
        false
    );

    ClearHistory();
};

export const SaveProjectToFile = () => {
    const projectName = useStore.getState().projectName;

    const data: SaveData = {
        tracks: GetTracksSaveData(useStore.getState().tracks),
        bpm: useStore.getState().bpm,
        name: projectName,
    };

    const blob = new Blob([JSON.stringify(data)], {
        type: "text/plain;charset=utf-8",
    });

    saveAs(blob, projectName + ".msq");
};

export const OpenProjectFromFile = async (file: File) => {
    const saveData: SaveData = JSON.parse(await file.text());
    // pendingBpmUpdateRef.current = saveData.bpm;
    setState(
        (draftState) => {
            DisposeTracks(draftState.tracks);

            const newTracks: Array<Track> = [];

            saveData.tracks.forEach((trackSaveData, index) => {
                const newTrack = CreateTrack(trackSaveData.instrument);

                trackSaveData.parts.forEach((part) => {
                    newTrack.parts.push(
                        CreatePart(
                            part.startTime,
                            part.stopTime,
                            index,
                            [...part.notes],
                            newTrack
                        )
                    );
                });

                newTracks.push(newTrack);
            });

            // Convert track to current bpm
            ChangeTracksBpm(newTracks, saveData.bpm, draftState.bpm);

            draftState.tracks = newTracks;
            (draftState.bpm = saveData.bpm),
                (draftState.projectName = saveData.name);
        },
        "Open project",
        false
    );

    ClearHistory();
};
