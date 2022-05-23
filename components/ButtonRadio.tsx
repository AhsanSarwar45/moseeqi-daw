import { Box, useRadio } from "@chakra-ui/react";

export const ButtonRadio = (props: any) => {
    const { getInputProps, getCheckboxProps } = useRadio(props);

    const input = getInputProps();
    const checkbox = getCheckboxProps();

    return (
        <Box as="label" height="full">
            <input {...input} />
            <Box
                {...checkbox}
                cursor="pointer"
                borderWidth="1px"
                borderColor="secondary.500"
                borderRadius="sm"
                _checked={{
                    bg: "secondary.500",
                    color: "white",
                }}
                padding={1}
                textColor="white"
                fontSize="sm"
                height="full"
            >
                {props.children}
            </Box>
        </Box>
    );
};
