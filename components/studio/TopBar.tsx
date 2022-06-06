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
import { IoMdSave } from "react-icons/io";
import { TiFolderOpen } from "react-icons/ti";
import { RiFileAddLine } from "react-icons/ri";
import { BiCopy, BiPaste, BiExit, BiUndo, BiRedo } from "react-icons/bi";

import MoseeqiLogo from "@Components/icons/MoseeqiLogo";
import FileUploader from "@Components/FIleUploader";
import { defaultProjectName } from "@Data/Defaults";
import {
    CreateNewProject,
    SaveProjectToFile,
    OpenProjectFromFile,
    SetProjectName,
} from "@Utility/ProjectUtils";
import { selectProjectName, useStore } from "@Data/Store";

interface TopBarProps {}

const TopBar = (props: TopBarProps) => {
    const [localProjectName, setLocalProjectName] = useState(
        useStore.getState().projectName
    );
    const fileInputRef = useRef<any>(null);

    useEffect(
        () =>
            useStore.subscribe(selectProjectName, (projectName) => {
                setLocalProjectName(projectName);
            }),
        []
    );

    return (
        <HStack
            className="top-bar"
            width="full"
            flexShrink={0}
            padding={2}
            spacing={8}
            bg="primary.600"
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
                            onClick={SaveProjectToFile}
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
                                onFileUpload={OpenProjectFromFile}
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
                value={localProjectName}
                onChange={(event) => setLocalProjectName(event.target.value)}
                onBlur={() => SetProjectName(localProjectName)}
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

export default TopBar;
