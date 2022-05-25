import { HStack, Icon, Spacer, Input } from "@chakra-ui/react";
import TooltipButton from "@Components/TooltipButton";
import FileUploader from "@Components/FIleUploader";
import { useEffect, useState } from "react";
import { IoMdSave } from "react-icons/io";

interface TopBarProps {
    onSave: () => void;
    onOpen: (file: any) => void;
    fileName: string;
    onSetFileName: (fileName: string) => void;
}

export const TopBar = (props: TopBarProps) => {
    const [fileName, setFileName] = useState(props.fileName);

    useEffect(() => {
        setFileName(props.fileName);
    }, [props.fileName]);

    return (
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
                ariaLabel="Save project"
                onClick={props.onSave}
                label="Save"
                icon={<Icon as={IoMdSave} />}
                tooltip="Download the project to your device"
            />

            <FileUploader onFileUpload={props.onOpen} />
        </HStack>
    );
};
