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
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IoMdSave, IoMdHelpCircleOutline } from "react-icons/io";
import { useTheme } from "@chakra-ui/react";
import { TiFolderOpen } from "react-icons/ti";
import { BiCopy, BiPaste, BiExit, BiUndo, BiRedo } from "react-icons/bi";

import HelpModal from "@Components/HelpModal";
import MoseeqiLogo from "@Components/icons/MoseeqiLogo";
import TooltipButton from "@Components/TooltipButton";
import FileUploader from "@Components/FIleUploader";

interface TopBarProps {
    onSave: () => void;
    onOpen: (file: any) => void;
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
                <Menu colorScheme="primary">
                    <MenuButton>
                        <Text>File</Text>
                    </MenuButton>

                    <MenuList bgColor="primary.500">
                        <MenuItem
                            icon={<IoMdSave />}
                            command="⌘+S"
                            onClick={props.onSave}
                            textColor="text.primary"
                            _focus={{ bgColor: "primary.700" }}
                        >
                            <Text>Save</Text>
                        </MenuItem>

                        <MenuItem
                            icon={<TiFolderOpen />}
                            command="⌘+O"
                            onClick={() => fileInputRef.current.click()}
                            textColor="text.primary"
                            _focus={{ bgColor: "primary.700" }}
                        >
                            <FileUploader
                                ref={fileInputRef}
                                onFileUpload={props.onOpen}
                                display={<Text>Open</Text>}
                            />
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem
                            icon={<BiExit />}
                            command="⌘+Q"
                            textColor="text.primary"
                            _focus={{ bgColor: "primary.700" }}
                        >
                            <Text>Exit</Text>
                        </MenuItem>
                    </MenuList>
                </Menu>
                <Menu colorScheme="primary">
                    <MenuButton>
                        <Text>Edit</Text>
                    </MenuButton>

                    <MenuList bgColor="primary.500">
                        <MenuItem
                            icon={<BiUndo />}
                            command="⌘+Z"
                            textColor="text.primary"
                            _focus={{ bgColor: "primary.700" }}
                        >
                            <Text>Undo</Text>
                        </MenuItem>
                        <MenuItem
                            icon={<BiRedo />}
                            command="⌘+Shift+Z"
                            textColor="text.primary"
                            _focus={{ bgColor: "primary.700" }}
                        >
                            <Text>Redo</Text>
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem
                            icon={<BiCopy />}
                            command="⌘+C"
                            textColor="text.primary"
                            _focus={{ bgColor: "primary.700" }}
                        >
                            <Text>Copy</Text>
                        </MenuItem>
                        <MenuItem
                            icon={<BiPaste />}
                            command="⌘+V"
                            textColor="text.primary"
                            _focus={{ bgColor: "primary.700" }}
                        >
                            <Text>Paste</Text>
                        </MenuItem>
                    </MenuList>
                </Menu>
                <Menu colorScheme="primary">
                    <MenuButton>
                        <Text>Tutorials</Text>
                    </MenuButton>

                    <MenuList bgColor="primary.500">
                        <MenuItem
                            textColor="text.primary"
                            _focus={{ bgColor: "primary.700" }}
                        >
                            <Text>Basics</Text>
                        </MenuItem>
                        <MenuItem
                            textColor="text.primary"
                            _focus={{ bgColor: "primary.700" }}
                        >
                            <Text>Piano Roll</Text>
                        </MenuItem>
                    </MenuList>
                </Menu>

                <Spacer />
                <Input
                    width="20%"
                    variant="unstyled"
                    value={fileName}
                    onChange={(event) => setFileName(event.target.value)}
                    onBlur={() => props.onSetFileName(fileName)}
                    textColor="white"
                    size="lg"
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
