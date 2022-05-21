import { Icon } from "@chakra-ui/react";
import { useRef } from "react";
import { TiFolderOpen } from "react-icons/ti";

interface FileUploaderProps {
    onFileUpload: (file: any) => void;
}

const FileUploader = (props: FileUploaderProps) => {
    const hiddenFileInput = useRef<any>(null);

    const HandleClick = (event: any) => {
        hiddenFileInput.current.click();
    };
    const HandleChange = (event: any) => {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            props.onFileUpload(file);
        }
    };
    return (
        <>
            <Icon
                as={TiFolderOpen}
                color="White"
                h={30}
                w={30}
                onClick={HandleClick}
            />
            <input
                type="file"
                ref={hiddenFileInput}
                onChange={HandleChange}
                style={{ display: "none" }}
                accept=".msq"
            />
        </>
    );
};

export default FileUploader;
