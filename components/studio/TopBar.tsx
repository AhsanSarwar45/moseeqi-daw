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
import { useTheme } from "@chakra-ui/react";
import { TiFolderOpen } from "react-icons/ti";
import { RiFileAddLine } from "react-icons/ri";
import { BiCopy, BiPaste, BiExit, BiUndo, BiRedo } from "react-icons/bi";

import HelpModal from "@Components/HelpModal";
import MoseeqiLogo from "@Components/icons/MoseeqiLogo";
import TooltipButton from "@Components/TooltipButton";
import FileUploader from "@Components/FIleUploader";

interface TopBarProps {
    onSave: () => void;
    onOpen: (file: any) => void;
    onNew: () => void;
    fileName: string;
    onSetFileName: (fileName: string) => void;
}

export const TopBar = (props: TopBarProps) => {
    const [fileName, setFileName] = useState(props.fileName);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const theme = useTheme();
    const fileInputRef = useRef<any>(null);

    useEffect(() => {
        setFileName(props.fileName);
    }, [props.fileName]);

    return (
        <>
            <HStack
                className="top-bar"
                width="full"
                flexShrink={0}
                padding={2}
                spacing={8}
                bg="brand.primary"
                justifyContent="start"
                zIndex={9999}
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
                                onClick={props.onNew}
                            >
                                <Text>New</Text>
                            </MenuItem>
                            <MenuItem
                                icon={<IoMdSave />}
                                command="⌘+S"
                                onClick={props.onSave}
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
                                    onFileUpload={props.onOpen}
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
                    value={fileName}
                    onChange={(event) => setFileName(event.target.value)}
                    onBlur={() => props.onSetFileName(fileName)}
                    textColor="white"
                    size="lg"
                    borderRadius="sm"
                    paddingX={2}
                    _hover={{ bg: "primary.700" }}
                    textAlign="center"
                />

                <Spacer />
            </HStack>
            <HelpModal onClose={onClose} isOpen={isOpen} />
        </>
    );
};
