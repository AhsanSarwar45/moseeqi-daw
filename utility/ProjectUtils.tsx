import {
    defaultBPM,
    defaultInstrumentIndex,
    defaultProjectName,
} from "@Data/Defaults";
import { SetStoreState } from "@Data/SetStoreState";
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
    SetStoreState(
        {
            projectName: name,
        },
        "Change project name"
    );
};

export const SetProjectLength = (length: number) => {
    SetStoreState(
        {
            projectLength: length,
        },
        "Change project length"
    );
};

export const CreateNewProject = () => {
    DisposeTracks(useStore.getState().tracks);

    SetStoreState(
        {
            tracks: [CreateTrackFromIndex(defaultInstrumentIndex)],
            bpm: defaultBPM,
            projectName: defaultProjectName,
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

    DisposeTracks(useStore.getState().tracks);

    const newTracks: Array<Track> = [];

    saveData.tracks.forEach((track) => {
        const newTrack = CreateTrack(track.instrument);

        track.parts.forEach((part) => {
            newTrack.parts.push(
                CreatePart(part.startTime, part.stopTime, newTrack.sampler, [
                    ...part.notes,
                ])
            );
        });

        newTracks.push(newTrack);
    });

    // Convert track to current bpm
    ChangeTracksBpm(newTracks, saveData.bpm, useStore.getState().bpm);

    // pendingBpmUpdateRef.current = saveData.bpm;
    SetStoreState(
        {
            tracks: newTracks,
            bpm: saveData.bpm,
            projectName: saveData.name,
        },
        "Open project",
        false
    );

    ClearHistory();
};
