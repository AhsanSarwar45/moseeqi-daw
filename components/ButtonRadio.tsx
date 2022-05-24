import { Box, Button, Flex, useRadio } from "@chakra-ui/react";

export const ButtonRadio = (props: any) => {
    const { getInputProps, getCheckboxProps } = useRadio(props);

    const input = getInputProps();
    const checkbox = getCheckboxProps();

    return (
        <Box as="label">
            <input {...input} />
            <Flex
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
                height="2rem"
                width="2rem"
                alignItems="center"
                justifyContent="center"
            >
                {props.children}
            </Flex>
        </Box>
    );
};
