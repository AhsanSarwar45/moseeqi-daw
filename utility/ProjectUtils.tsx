import {
    defaultBPM,
    defaultInstrumentIndex,
    defaultProjectName,
} from "@Data/Defaults";
import { useStore } from "@Data/Store";
import { SaveData } from "@Interfaces/SaveData";
import { Track } from "@Interfaces/Track";
import saveAs from "file-saver";
import { CreatePart } from "./PartUtils";
import {
    ChangeTracksBpm,
    CreateTrack,
    CreateTrackFromIndex,
    DisposeTracks,
    GetTracksSaveData,
} from "./TrackUtils";

export const SetProjectName = (name: string) => {
    useStore.setState({
        projectName: name,
    });
};

export const SetProjectLength = (length: number) => {
    useStore.setState({
        projectLength: length,
    });
};

export const CreateNewProject = () => {
    DisposeTracks(useStore.getState().tracks);

    useStore.setState({
        tracks: [CreateTrackFromIndex(defaultInstrumentIndex)],
        bpm: defaultBPM,
        projectName: defaultProjectName,
    });
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
    useStore.setState({
        tracks: newTracks,
        bpm: saveData.bpm,
        projectName: saveData.name,
    });
};
