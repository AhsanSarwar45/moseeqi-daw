import { useBpmStore } from "@Data/BpmStore";
import { useProjectStore } from "@Data/ProjectStore";
import { useTracksStore } from "@Data/TracksStore";
import { SaveData } from "@Interfaces/SaveData";
import { Track } from "@Interfaces/Track";
import saveAs from "file-saver";
import { CreatePart } from "./PartUtils";
import CreateTrack, {
    ChangeTracksBpm,
    DisposeTracks,
    GetTracksSaveData,
} from "./TrackUtils";
