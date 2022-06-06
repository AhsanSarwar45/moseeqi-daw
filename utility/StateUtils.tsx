// Modified from: https://stackoverflow.com/questions/52063018/intersection-of-two-deep-objects-in-javascript

import { StoreState } from "@Data/Store";
import { GetTracksSaveData } from "./TrackUtils";

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

export const GetSaveState = (state: StoreState): any => {
    const { tracks, ...restState } = state;
    return { ...restState, tracks: GetTracksSaveData(tracks) };
};

export const GetSaveStateDiff = (
    prevState: StoreState,
    nextState: Partial<StoreState>
): any => {
    const prevSaveState = GetSaveState(prevState);
    return GetObjectIntersection(prevSaveState, nextState);
};
