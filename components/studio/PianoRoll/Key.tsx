import { Flex } from "@chakra-ui/react";
import { blackKeyHeightModifier, blackKeyWidthModifier } from "@Data/Constants";
import { KeyType } from "@Interfaces/KeyType";
import { useMemo, useRef } from "react";

interface KeyProps {
    label: string;
    index: number;
    width: number;
    height: number;
    onKeyDown: (label: string) => void;
    onKeyUp: (label: string) => void;
}

const BlackKeyOffsets = [
    { name: "A#", offset: 1 / 3 },
    { name: "C#", offset: 2 / 3 },
    { name: "D#", offset: 1 / 3 },
    { name: "F#", offset: 2 / 3 },
    { name: "G#", offset: 1 / 2 },

    { name: "B", offset: 2 / 3 },
    { name: "E", offset: 2 / 3 },
    { name: "C", offset: 0 },
    { name: "D", offset: 1 / 3 },
    { name: "F", offset: 0 },
    { name: "G", offset: 1 / 3 },
];

export const Key = (props: KeyProps) => {
    const type = useRef<KeyType>(
        props.label.includes("#") ? KeyType.Black : KeyType.White
    );

    const offset = useMemo<KeyType>(() => {
        const keyOffsetIndex = BlackKeyOffsets.findIndex((key) =>
            props.label.includes(key.name)
        );

        if (keyOffsetIndex === -1) {
            return blackKeyHeightModifier * 0.5 * props.height;
        } else {
            return (
                blackKeyHeightModifier *
                BlackKeyOffsets[keyOffsetIndex].offset *
                props.height
            );
        }
    }, [props.height, props.label]);

    return (
        <Flex
            position="relative"
            paddingLeft="10px"
            border="1px solid gray"
            boxSizing="border-box"
            cursor="pointer"
            userSelect="none"
            onMouseDown={() => props.onKeyDown(props.label)}
            onMouseUp={() => props.onKeyUp(props.label)}
            justifyContent="right"
            alignItems="center"
            paddingRight="5px"
            borderRightRadius="md"
            fontSize="xs"
            bgColor={type.current === KeyType.White ? "white" : "black"}
            textColor={type.current === KeyType.White ? "black" : "white"}
            height={`${
                type.current === KeyType.White
                    ? props.height
                    : props.height * blackKeyHeightModifier
            }px`}
            width={`${
                type.current === KeyType.White
                    ? props.width
                    : props.width * blackKeyWidthModifier
            }px`}
            marginTop={`${-offset}px`}
            zIndex={type.current === KeyType.White ? 1 : 2}
            // sx={pianoOctaveStyles[index % 12]}
        >
            {props.label}
        </Flex>
    );
};
