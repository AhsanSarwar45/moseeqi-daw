import React from "react";

import { selectTrackCount, useStore } from "@Data/Store";
import TrackInfo from "./TrackInfo";
import { GetTrackIds } from "@Utility/TrackUtils";

interface TracksInfoViewProps {}

const TracksInfoView = () => {
    const trackCount = useStore(selectTrackCount);

    return (
        <>
            {GetTrackIds().map((trackId) => {
                // console.log(index, trackCount, 4);
                return <TrackInfo trackId={trackId} key={trackId} />;
            })}
        </>
    );
};

export default TracksInfoView;
