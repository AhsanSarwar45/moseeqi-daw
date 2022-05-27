import { HStack, Icon, Spacer, Input, useDisclosure } from "@chakra-ui/react";
import TooltipButton from "@Components/TooltipButton";
import FileUploader from "@Components/FIleUploader";
import { useEffect, useState } from "react";
import { IoMdSave, IoMdHelpCircleOutline } from "react-icons/io";
import HelpModal from "@Components/HelpModal";
import MoseeqiLogo from "@Logos/MoseeqiLogo.svg";
import { useTheme } from "@chakra-ui/react";

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
                spacing={2}
                bg="brand.primary"
                justifyContent="start"
                zIndex={9999}
                boxShadow="md"
            >
                <MoseeqiLogo
                    width="2rem"
                    stroke={theme.colors.brand.secondary}
                    fill="none"
                />
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
                <TooltipButton
                    onClick={props.onSave}
                    label="Save"
                    icon={<Icon as={IoMdSave} />}
                    tooltip="Download the project to your device"
                />

                <FileUploader onFileUpload={props.onOpen} />
                <TooltipButton
                    onClick={onOpen}
                    label="Tutorial"
                    icon={<Icon as={IoMdHelpCircleOutline} />}
                    tooltip="View help topics"
                />
            </HStack>
            <HelpModal onClose={onClose} isOpen={isOpen} />
        </>
    );
};
