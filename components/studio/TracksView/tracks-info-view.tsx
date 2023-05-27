import React from "react";

import { selectTrackCount, useStore } from "@data/stores/project";
import TrackInfo from "./track-info";
import { getTrackIds } from "@logic/track";

interface TracksInfoViewProps {}

const TracksInfoView = () => {
    const trackMap = useStore((state) => state.tracks);

    return (
        <>
            {Array.from(trackMap).map(([trackId, track]) => {
                return (
                    <TrackInfo trackId={trackId} track={track} key={trackId} />
                );
            })}
        </>
    );
};

export default TracksInfoView;
