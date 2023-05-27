import { Icon } from "@chakra-ui/react";

import { forwardRef, ReactNode, useRef } from "react";

import TooltipButton from "./tooltip-button";

interface FileUploaderProps {
    display: ReactNode;
    onFileUpload: (file: any) => void;
}

const FileUploader = forwardRef((props: FileUploaderProps, ref) => {
    const HandleChange = (event: any) => {
        console.log("f");
        const element = event.target as HTMLInputElement;
        if (element.files) {
            if (element.files.length > 0) {
                const file = element.files[0];
                props.onFileUpload(file);
            }
        }
        element.value = "";
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
