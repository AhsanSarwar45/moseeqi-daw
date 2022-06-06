import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { useState, useEffect, Fragment } from "react";
import { SplitDirection } from "@devbookhq/splitter";

import PlayBackController from "@Components/studio/PlaybackController";
import PianoRoll from "@Components/studio/PianoRoll/PianoRoll";
import TracksView from "@Components/studio/TracksView/TracksView";
import PropertiesPanel from "@Components/studio/PropertiesPanel";
import WaitingModal from "@Components/WaitingModal";
import Splitter from "@Components/Splitter";

import TopBar from "./TopBar";
import Hotkeys from "./Hotkeys";

const Studio = () => {
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
            <Hotkeys />
            <WaitingModal />
        </Fragment>
    );
};

export default Studio;
