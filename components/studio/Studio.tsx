import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { SplitDirection } from "@devbookhq/splitter";

import PlayBackController from "@components/studio/playback-controller";
import PianoRoll from "@components/studio/PianoRoll/piano-roll";
import TracksView from "@components/studio/TracksView/tracks-view";
import PropertiesPanel from "@components/studio/properties-panel";
import WaitingModal from "@components/waiting-modal";
import Splitter from "@components/splitter";

import TopBar from "./top-bar";
import Hotkeys from "./hotkeys";

const Studio = () => {
    return (
        <>
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
                    {/* <Splitter initialSizes={[80, 20]}> */}
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
                    {/* <PropertiesPanel /> */}
                    {/* </Splitter> */}
                </Flex>
                <PlayBackController />
            </Flex>
            <Hotkeys />
            <WaitingModal />
        </>
    );
};

export default Studio;
