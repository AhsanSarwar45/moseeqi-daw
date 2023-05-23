// Modified from: https://stackoverflow.com/questions/52063018/intersection-of-two-deep-objects-in-javascript

import { setState, StoreState } from "@Data/Store";
import * as Tone from "tone";
import { SynchronizePart } from "./PartUtils";
import { DisposeTracks, GetTracksSaveData } from "./TrackUtils";

export const GetObjectIntersection = (object1: any, object2: any): any => {
    // if (object1 == null) return;
    let intersectedProps = Object.keys(object1).map((k) => {
        let temp;
        if (!(k in object2)) {
            return {};
        }
        if (
            object1[k] &&
            typeof object1[k] === "object" &&
            object2[k] &&
            typeof object2[k] === "object"
        ) {
            temp = GetObjectIntersection(object1[k], object2[k]);
            return Object.keys(temp).length ? { [k]: temp } : {};
        }
        // if (k == null) return {};
        // if (object1[k] === object2[k]) {
        //     return { [k]: object1[k] };
        // }
        return { [k]: object1[k] };
    });

    intersectedProps = intersectedProps.filter(
        (item) => Object.keys(item)[0] != null
    );

    // console.log(intersectedProps);

    return intersectedProps.reduce(function (result, item) {
        var key = Object.keys(item)[0];
        result[key] = item[key];
        return result;
    }, {});
};

export const SynchronizeState = (oldState: StoreState) => {
    DisposeTracks(oldState.tracks);
    setState(
        (draftState) => {
            Tone.Transport.bpm.value = draftState.bpm;
            draftState.tracks.forEach((track) => {
                track.parts.forEach((part) => {
                    SynchronizePart(part);
                    (part.tonePart as Tone.Part).mute =
                        track.muted || track.soloMuted;
                });
                // TODO: maybe sync sampler
            });
        },
        "Sync state",
        false
    );
};
