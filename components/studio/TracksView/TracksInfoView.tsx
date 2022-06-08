import React from "react";

import { selectTrackCount, useStore } from "@Data/Store";
import TrackInfo from "./TrackInfo";

interface TracksInfoViewProps {}

const TracksInfoView = () => {
    const trackCount = useStore(selectTrackCount);

    return (
        <>
            {[...Array(trackCount)].map((_, index) => {
                // console.log(index, trackCount, 4);
                return <TrackInfo index={index} key={index} />;
            })}
        </>
    );
};

export default TracksInfoView;
