import {
    HStack,
    Icon,
    Spacer,
    Input,
    Text,
    useDisclosure,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Box,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IoMdSave, IoMdHelpCircleOutline } from "react-icons/io";
import { TiFolderOpen } from "react-icons/ti";
import { RiFileAddLine } from "react-icons/ri";
import { BiCopy, BiPaste, BiExit, BiUndo, BiRedo } from "react-icons/bi";

import MoseeqiLogo from "@Components/icons/MoseeqiLogo";
import FileUploader from "@Components/FIleUploader";
import {
    ChangeTracksBpm,
    CreateTrack,
    CreateTrackFromIndex,
    DisposeTracks,
    GetTracksSaveData,
} from "@Utility/TrackUtils";
import {
    selectAddTrack,
    selectSetTracks,
    selectTracks,
    useTracksStore,
} from "@Data/TracksStore";
import {
    defaultBPM,
    defaultInstrumentIndex,
    defaultProjectName,
} from "@Data/Defaults";
import { selectSetBpm, useBpmStore } from "@Data/BpmStore";
import { SaveData } from "@Interfaces/SaveData";
import { Track } from "@Interfaces/Track";
import { CreatePart } from "@Utility/PartUtils";
import saveAs from "file-saver";

interface TopBarProps {}

export const TopBar = (props: TopBarProps) => {
    const [projectName, setProjectName] = useState(defaultProjectName);
    const fileInputRef = useRef<any>(null);

    const setTracks = useTracksStore(selectSetTracks);

    const { bpm, setBpm } = useBpmStore();

    const CreateNewProject = () => {
        DisposeTracks(useTracksStore.getState().tracks);

        setTracks([CreateTrackFromIndex(defaultInstrumentIndex)]);
        setBpm(defaultBPM);
        setProjectName(defaultProjectName);
    };

    const SaveToFile = () => {
        const data: SaveData = {
            tracks: GetTracksSaveData(useTracksStore.getState().tracks),
            bpm: bpm,
            name: projectName,
        };

        const blob = new Blob([JSON.stringify(data)], {
            type: "text/plain;charset=utf-8",
        });

        saveAs(blob, projectName + ".msq");
    };

    const OpenFile = async (file: File) => {
        const saveData: SaveData = JSON.parse(await file.text());

        DisposeTracks(useTracksStore.getState().tracks);

        const newTracks: Array<Track> = [];

        saveData.tracks.forEach((track) => {
            const newTrack = CreateTrack(track.instrument);

            track.parts.forEach((part) => {
                newTrack.parts.push(
                    CreatePart(
                        part.startTime,
                        part.stopTime,
                        newTrack.sampler,
                        [...part.notes]
                    )
                );
            });

            newTracks.push(newTrack);
        });

        // Convert track to current bpm
        ChangeTracksBpm(newTracks, saveData.bpm, useBpmStore.getState().bpm);

        // pendingBpmUpdateRef.current = saveData.bpm;

        setProjectName(saveData.name);
        setTracks(newTracks);
        setBpm(saveData.bpm);
    };

    return (
        <HStack
            className="top-bar"
            width="full"
            flexShrink={0}
            padding={2}
            spacing={8}
            bg="brand.primary"
            justifyContent="start"
            zIndex={999}
            boxShadow="md"
        >
            <MoseeqiLogo
                width="2rem"
                height="2rem"
                fillOpacity={0}
                stroke={"brand.secondary"}
                strokeWidth="0.5rem"
            />
            <Box>
                <Menu colorScheme="primary">
                    <MenuButton>
                        <Text>File</Text>
                    </MenuButton>

                    <MenuList bgColor="primary.500">
                        <MenuItem
                            icon={<RiFileAddLine />}
                            command="⌘+N"
                            onClick={CreateNewProject}
                        >
                            <Text>New</Text>
                        </MenuItem>
                        <MenuItem
                            icon={<IoMdSave />}
                            command="⌘+S"
                            onClick={SaveToFile}
                        >
                            <Text>Save</Text>
                        </MenuItem>

                        <MenuItem
                            icon={<TiFolderOpen />}
                            command="⌘+O"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <FileUploader
                                ref={fileInputRef}
                                onFileUpload={OpenFile}
                                display={<Text>Open</Text>}
                            />
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem icon={<BiExit />} command="⌘+Q">
                            <Text>Exit</Text>
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>

            <Box>
                <Menu colorScheme="primary">
                    <MenuButton>
                        <Text>Edit</Text>
                    </MenuButton>

                    <MenuList bgColor="primary.500">
                        <MenuItem icon={<BiUndo />} command="⌘+Z">
                            <Text>Undo</Text>
                        </MenuItem>
                        <MenuItem icon={<BiRedo />} command="⌘+Shift+Z">
                            <Text>Redo</Text>
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem icon={<BiCopy />} command="⌘+C">
                            <Text>Copy</Text>
                        </MenuItem>
                        <MenuItem icon={<BiPaste />} command="⌘+V">
                            <Text>Paste</Text>
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>

            <Box>
                <Menu colorScheme="primary">
                    <MenuButton>
                        <Text>Tutorials</Text>
                    </MenuButton>

                    <MenuList bgColor="primary.500">
                        <MenuItem>
                            <Text>Basics</Text>
                        </MenuItem>
                        <MenuItem>
                            <Text>Piano Roll</Text>
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>

            <Spacer />
            <Input
                width="20%"
                variant="unstyled"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                textColor="white"
                size="lg"
                borderRadius="sm"
                paddingX={2}
                _hover={{ bg: "primary.700" }}
                textAlign="center"
            />

            <Spacer />
        </HStack>
    );
};
