import {
    ButtonGroup,
    Button,
    HStack,
    Heading,
    Icon,
    IconButton,
} from "@chakra-ui/react";
import FileUploader from "@Components/FIleUploader";
import { IoMdSave } from "react-icons/io";

interface TopBarProps {
    onSave: () => void;
    onOpen: (file: any) => void;
}

export const TopBar = (props: TopBarProps) => {
    return (
        <HStack
            height="20px"
            width="full"
            flexShrink={0}
            padding={5}
            spacing={5}
            bg="brand.primary"
            justifyContent="end"
            zIndex={9999}
            boxShadow="md"
        >
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
