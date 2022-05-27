import { Icon } from "@chakra-ui/react";

import { forwardRef, ReactNode, useRef } from "react";

import TooltipButton from "./TooltipButton";

interface FileUploaderProps {
    display: ReactNode;
    onFileUpload: (file: any) => void;
}

const FileUploader = forwardRef((props: FileUploaderProps, ref) => {
    const HandleChange = (event: any) => {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            props.onFileUpload(file);
        }
    };
    return (
        <>
            {props.display}
            <input
                type="file"
                ref={ref as any}
                onChange={HandleChange}
                style={{ display: "none" }}
                accept=".msq"
            />
        </>
    );
});

FileUploader.displayName = "FileUploader";

export default FileUploader;
