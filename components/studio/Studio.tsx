import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { useState, useEffect, Fragment } from "react";
import { SplitDirection } from "@devbookhq/splitter";
import { useHotkeys } from "react-hotkeys-hook";

import { PlayBackController } from "@Components/studio/PlaybackController";
import PianoRoll from "@Components/studio/PianoRoll/PianoRoll";
import TracksView from "@Components/studio/TracksView/TracksView";
import { PropertiesPanel } from "@Components/studio/PropertiesPanel";
import { WaitingModal } from "@Components/WaitingModal";

import Splitter from "@Components/Splitter";

import { TopBar } from "./TopBar";

const Studio = () => {
    //const [ numCols, setNumCols ] = useState(40);
    // const [keyMap, setKeyMap] = useState({
    //     TOGGLE_PLAYBACK: "space",
    //     DELETE_TRACKS: "delete",
    // });

    // useHotkeys(
    //     keyMap.TOGGLE_PLAYBACK,
    //     () => {
    //         TogglePlayback();
    //     },
    //     {},
    //     [playbackState]
    // );

    //             } else if (focusedPanel === Panel.TrackSequencer) {
    //                 if (selectedPartIndices.length > 0) {
    //                     let tracksCopy = [...tracks];

    //                     // Stop all the parts to be deleted

    //                     selectedPartIndices.forEach(
    //                         ({ trackIndex, partIndex }) => {
    //                             // console.log(
    //                             //     trackIndex,
    //                             //     partIndex
    //                             // );
    //                             tracksCopy[trackIndex].parts[
    //                                 partIndex
    //                             ].tonePart.cancel(0);

    //                             // Hacky way to mark part to be deleted
    //                             tracksCopy[trackIndex].parts[partIndex] =
    //                                 null as any;
    //                         }
    //                     );

    //                     // Delete all the null parts
    //                     tracksCopy.forEach((track, trackIndex) => {
    //                         tracksCopy[trackIndex].parts = track.parts.filter(
    //                             (part) => part !== null
    //                         );
    //                     });

    //                     setTracks(tracksCopy);
    //                     setSelectedPartIndices([]);
    //                 }
    //             }
    //         }
    //     };

    return (
        <Fragment>
            <Flex
                height="100vh"
                width="full"
                overflow="hidden"
                flexDirection="column"
            >
                <TopBar />
                <Flex
                    width="100%"
                    height="100%"
                    flexDirection="row"
                    overflow="hidden"
                >
                    <Splitter initialSizes={[80, 20]}>
                        <Flex
                            height="100%"
                            overflow="hidden"
                            flexDirection="column"
                            flexGrow={3}
                        >
                            <Splitter direction={SplitDirection.Vertical}>
                                <TracksView />
                                <PianoRoll />
                            </Splitter>
                        </Flex>
                        <PropertiesPanel />
                    </Splitter>
                </Flex>
                <PlayBackController />
            </Flex>

            <WaitingModal />
        </Fragment>
    );
};

export default Studio;
