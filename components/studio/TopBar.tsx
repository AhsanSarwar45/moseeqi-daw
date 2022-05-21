import {
    ButtonGroup,
    Button,
    HStack,
    Heading,
    Icon,
    IconButton,
    Spacer,
    Input,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
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
            height="20px"
            width="full"
            flexShrink={0}
            padding={5}
            spacing={5}
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
            <Icon
                as={IoMdSave}
                color="White"
                h={30}
                w={30}
                onClick={props.onSave}
            />
            <FileUploader onFileUpload={props.onOpen} />
        </HStack>
    );
};
