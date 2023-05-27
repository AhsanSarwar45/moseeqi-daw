import { Box } from "@chakra-ui/react";
import { KeyType } from "@interfaces/key-type";
import { useRef } from "react";

interface RowProps {
    label: string;
    height: number;
}

export const Row = (props: RowProps) => {
    const type = useRef<KeyType>(
        props.label.includes("#") ? KeyType.Black : KeyType.White
    );

    const isTopBorderVisible = useRef(
        props.label.includes("C") || props.label.includes("F")
    );

    return (
        <Box
            bgColor={
                type.current === KeyType.White ? "primary.500" : "primary.600"
            }
            height={props.height}
            width={"full"}
            borderColor={"primary.600"}
            boxSizing="border-box"
            borderTopWidth={isTopBorderVisible.current ? "1px" : "0px"}
            // sx={pianoOctaveStyles[index % 12]}
        />
    );
};
